// Free-demo OpenRouter proxy.
//
// This is the only path that uses the owner's server-side provider key, so it is
// fenced on three sides:
//   1) Cloudflare Turnstile — a human, server-verified, single token per call,
//      verified BEFORE any OpenRouter spend.
//   2) Per-visitor lifetime cap — exactly DEMO_PER_VISITOR_LIMIT (product
//      default: 5) messages per IP, EVER (see PIVOT FIX below) — stops one
//      visitor draining the budget.
//   3) The free OpenRouter provider's own account quota. RealmWright can disable
//      its optional local daily ceiling with DEMO_GLOBAL_DAILY=0; upstream 429s
//      are refunded and become a clean Sample Mode fallback.
//
// The Worker FORCES the model (env.DEMO_MODEL) and ignores whatever the client
// asks for, so a caller can never request a paid model on the owner's account.
//
// Licensed users never touch this route — they call OpenRouter directly with
// their own key, so the Worker carries only demo traffic. Well under the
// free-tier request budget.
//
// PIVOT FIX (2026-07-13, Build Agent 1): the per-IP counter used to be keyed
// `demo:ip:{ip}:{day}`, i.e. it reset every UTC midnight — so any visitor got
// 5 fresh free AI messages EVERY DAY, forever, with zero friction. The product
// spec says "exactly 5 messages per visitor" (no "per day" qualifier) while
// separately calling for "a global DAILY ceiling" — a deliberate contrast. A
// nightly-resetting free tier guts the incentive to buy the $23 key, so the
// per-IP key is now `demo:ip:{ip}` (no day component) with a long TTL
// (DEMO_TRIAL_TTL_SECONDS, default 90 days — matches the DEVICE_TTL_SECONDS
// convention elsewhere) instead of the ~25h day-rollover TTL. This acts as a
// one-time trial per visitor while still self-healing if a dynamic/CGNAT IP
// is later reassigned to a genuinely new visitor. The optional local GLOBAL
// cap can now be disabled with DEMO_GLOBAL_DAILY=0 for a zero-cost provider.
// The response retains the legacy `remaining_today` field name for compatibility
// with older clients; the allowance itself remains one-time, not daily.
//
// Contract:  POST /api/demo/generate
//   { turnstileToken: string, messages: [...], model?: string }   // model ignored
//   -> { ok: true, content, usage, remaining_today } | { error, fallback? }
// (The client sends `turnstileToken`; `turnstile_token` is also accepted for
//  backward compatibility. `remaining_today` is a legacy field name kept for
//  client compatibility — see the note above, it is really "remaining in your
//  one-time free trial", not a daily allowance.)

import { jsonResponse } from './cors';
import { readBoundedInt, readCounter } from './config';
import { BodyTooLargeError, readBoundedRequestText, utf8ByteLength } from './input';

export interface DemoEnv {
  ALLOWED_ORIGINS: string;
  RATELIMIT: KVNamespace;
  OPENROUTER_KEY?: string;
  TURNSTILE_SECRET?: string;
  DEMO_MODEL?: string; // exact OpenRouter slug; overrides whatever the client asks for
  DEMO_PER_VISITOR_LIMIT?: string; // renamed from DEMO_PER_IP_DAILY — see PIVOT FIX above
  DEMO_GLOBAL_DAILY?: string;
  DEMO_MAX_TOKENS?: string;
  DEMO_TRIAL_TTL_SECONDS?: string; // how long a used-up per-visitor slot is remembered
}

const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// AUDIT FIX (MED #4): abort timeouts on every external call.
const TURNSTILE_TIMEOUT_MS = 8000;
// The free Nemotron endpoint currently has materially higher first-token latency
// than paid low-latency models. Two minutes prevents the Worker from aborting a
// valid free response before it can finish, while still bounding a hung request.
const OPENROUTER_TIMEOUT_MS = 120000;

// AUDIT FIX (MED #6): hard cap on the serialized `messages` payload so a caller
// can't inflate input-token cost with a huge prompt (output is already capped
// by max_tokens, input was previously unbounded).
const MAX_MESSAGES_BYTES = 16 * 1024; // 16 KB

function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC
}

async function bump(env: DemoEnv, key: string, ttl: number): Promise<number> {
  const n = readCounter(await env.RATELIMIT.get(key)) + 1;
  await env.RATELIMIT.put(key, String(n), { expirationTtl: ttl });
  return n;
}

// AUDIT FIX (MED #7): best-effort decrement, used to refund a reserved demo slot
// when the OpenRouter call fails cleanly (network/5xx) so a provider outage does
// not burn the day's pool with zero successful generations. Never drops below 0.
async function unbump(env: DemoEnv, key: string, ttl: number): Promise<void> {
  try {
    const cur = readCounter(await env.RATELIMIT.get(key));
    const next = cur > 0 ? cur - 1 : 0;
    await env.RATELIMIT.put(key, String(next), { expirationTtl: ttl });
  } catch {
    /* best-effort; an un-refunded slot just under-spends, never over-spends */
  }
}

type Reservation = { key: string; ttl: number };

// KV writes are not transactional. Compensate every completed reservation if
// a later counter write fails, so a server error never consumes a free use.
async function reserveAll(env: DemoEnv, reservations: Reservation[]): Promise<boolean> {
  const completed: Reservation[] = [];
  try {
    for (const reservation of reservations) {
      await bump(env, reservation.key, reservation.ttl);
      completed.push(reservation);
    }
    return true;
  } catch {
    for (const reservation of completed.reverse()) {
      await unbump(env, reservation.key, reservation.ttl);
    }
    return false;
  }
}

async function verifyTurnstile(env: DemoEnv, token: string, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return false;
  const params = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
  if (ip) params.set('remoteip', ip);
  try {
    const res = await fetch(TURNSTILE_VERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
    });
    const json = (await res.json()) as { success?: boolean };
    return !!json.success;
  } catch {
    // Outage / timeout → fail CLOSED (no spend). A Turnstile blip blocks the
    // free demo rather than letting the OpenRouter key be drained.
    return false;
  }
}

export async function handleDemoGenerate(request: Request, env: DemoEnv): Promise<Response> {
  const allowed = env.ALLOWED_ORIGINS;
  // PIVOT FIX (Build Agent 1): the rest of this handler now runs inside a
  // try/catch, matching the "AUDIT FIX (HIGH #1)" pattern already used in
  // license.ts/itch.ts. Previously an unguarded KV throw (e.g. env.RATELIMIT
  // hiccup, or a free-tier quota error) would escape as an unhandled
  // exception — no CORS headers, no graceful body, just a raw Worker error.
  // Now it degrades to the same "Try Sample Mode" fallback as every other
  // failure path in this file.
  try {
    if (!env.OPENROUTER_KEY || !env.TURNSTILE_SECRET || !env.DEMO_MODEL) {
      return jsonResponse({ error: 'Demo is not configured.', fallback: true }, 503, request, allowed);
    }

    let body: any = {};
    try {
      body = JSON.parse(await readBoundedRequestText(request));
    } catch (error) {
      if (error instanceof BodyTooLargeError) {
        return jsonResponse({ error: 'Request body is too large.' }, 413, request, allowed);
      }
      return jsonResponse({ error: 'Invalid request body.' }, 400, request, allowed);
    }

    const token = (body.turnstileToken || body.turnstile_token || '').toString();
    const messages = Array.isArray(body.messages) ? body.messages : null;
    if (!token) return jsonResponse({ error: 'Please complete the captcha before generating.' }, 400, request, allowed);
    if (!messages || messages.length === 0) {
      return jsonResponse({ error: 'No prompt provided.' }, 400, request, allowed);
    }

    // AUDIT FIX (MED #6): bound the prompt size BEFORE spending anything.
    const messagesJson = JSON.stringify(messages);
    if (utf8ByteLength(messagesJson) > MAX_MESSAGES_BYTES) {
      return jsonResponse({ error: 'Prompt is too large for the free demo.' }, 413, request, allowed);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    // 1) Human check — verified BEFORE any spend (the key cost control).
    if (!(await verifyTurnstile(env, token, ip))) {
      return jsonResponse({ error: 'Captcha verification failed. Please try again.' }, 403, request, allowed);
    }

    const day = today();
    // Operators may lower the product cap, but a typo can never raise it above five.
    const perVisitorLimit = readBoundedInt(env.DEMO_PER_VISITOR_LIMIT, 5, 1, 5);
    // Zero intentionally disables the local daily ceiling for a free provider.
    const globalLimit = readBoundedInt(env.DEMO_GLOBAL_DAILY, 0, 0, 10_000);
    const hasLocalGlobalLimit = globalLimit > 0;

    // 2) Optional local global ceiling — read before the upstream call. A
    //    positive value resets daily; zero delegates availability entirely to
    //    the free provider's own account quota.
    const globalKey = hasLocalGlobalLimit ? `demo:global:${day}` : null;
    if (globalKey) {
      const globalUsed = readCounter(await env.RATELIMIT.get(globalKey));
      if (globalUsed >= globalLimit) {
        return jsonResponse(
          { error: 'The free demo is at capacity for today. Try Sample Mode — no key needed.', fallback: true },
          429,
          request,
          allowed,
        );
      }
    }

    // 3) Per-visitor lifetime cap (PIVOT FIX: no `:${day}` suffix — see the
    //    file-header comment. "Exactly 5 messages per visitor" must not reset
    //    every UTC midnight or the free tier never converts to a sale.
    const ipKey = `demo:ip:${ip}`;
    const ipUsed = readCounter(await env.RATELIMIT.get(ipKey));
    if (ipUsed >= perVisitorLimit) {
      return jsonResponse(
        { error: "You've used all your free demo generations. Activate a key to keep going.", fallback: true },
        429,
        request,
        allowed,
      );
    }

    // Reserve the slots BEFORE the upstream call so a burst of concurrent
    // requests can't all pass the read-check and overrun the visitor cap.
    // Counters are KV read-modify-write; see the residual-race note in
    // ratelimit.ts. The optional local daily ceiling uses the same reservation
    // only when DEMO_GLOBAL_DAILY is positive.
    const trialTtl = readBoundedInt(env.DEMO_TRIAL_TTL_SECONDS, 7_776_000, 3_600, 31_536_000);
    const globalTtl = 90_000; // ~25h, covers the UTC day rollover
    const reservations: Reservation[] = [{ key: ipKey, ttl: trialTtl }];
    if (globalKey) reservations.push({ key: globalKey, ttl: globalTtl });
    if (!(await reserveAll(env, reservations))) {
      return jsonResponse({ error: 'Demo server is busy. Try Sample Mode.', fallback: true }, 503, request, allowed);
    }

    const maxTokens = readBoundedInt(env.DEMO_MAX_TOKENS, 800, 128, 2_000);
    let upstream: Response;
    try {
      upstream = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://realmwright-gm.pages.dev',
          'X-Title': 'RealmWright GM',
        },
        body: JSON.stringify({
          model: env.DEMO_MODEL, // server decides the model — client cannot upgrade it
          messages,
          max_tokens: maxTokens,
          // Keep Nemotron's private drafting out of the buyer-facing preview.
          // OpenRouter documents `exclude:true` as supported across reasoning
          // models; the model may still think internally, but only final prose
          // is returned to RealmWright.
          reasoning: { exclude: true },
        }),
        signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
      });
    } catch {
      // AUDIT FIX (MED #7): clean upstream failure → refund the reserved slots so
      // an OpenRouter outage doesn't exhaust the day's pool with zero successes.
      await unbump(env, ipKey, trialTtl);
      if (globalKey) await unbump(env, globalKey, globalTtl);
      return jsonResponse({ error: 'Demo server could not reach the model. Try Sample Mode.', fallback: true }, 502, request, allowed);
    }

    const data: any = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      // AUDIT FIX (MED #7): upstream rejected (5xx/over-budget/etc) → refund too.
      // AUDIT FIX (LOW #12): do NOT echo upstream error text; use a fixed message.
      await unbump(env, ipKey, trialTtl);
      if (globalKey) await unbump(env, globalKey, globalTtl);
      if (upstream.status === 429) {
        return jsonResponse(
          { error: 'The free AI provider has reached its current limit. Try Sample Mode or come back later.', fallback: true },
          429,
          request,
          allowed,
        );
      }
      return jsonResponse({ error: 'The model declined this request. Try Sample Mode.', fallback: true }, 502, request, allowed);
    }

    const choice = data?.choices?.[0];
    const content = choice?.message?.content;
    const finishReason = choice?.finish_reason;
    // A 200 response with empty or token-truncated output is not a usable
    // preview and must not consume one of the visitor's five uses.
    if (typeof content !== 'string' || !content.trim() || finishReason === 'length') {
      await unbump(env, ipKey, trialTtl);
      if (globalKey) await unbump(env, globalKey, globalTtl);
      const error = finishReason === 'length'
        ? 'The free Copilot response was cut off. Please try again.'
        : 'The free Copilot returned no usable response. Please try again.';
      return jsonResponse({ error, fallback: true }, 502, request, allowed);
    }
    return jsonResponse(
      {
        ok: true,
        content,
        usage: data?.usage || null,
        remaining_today: Math.max(0, perVisitorLimit - (ipUsed + 1)),
      },
      200,
      request,
      allowed,
    );
  } catch {
    // Mirrors the "AUDIT FIX (HIGH #1)" contract elsewhere: any unexpected
    // throw (KV error, etc.) degrades to a graceful, CORS-bearing response —
    // never a crash, and never a spend (the reservation happens after this
    // point is unreachable if something upstream of it threw).
    return jsonResponse(
      { error: 'Demo server is busy. Try Sample Mode.', fallback: true },
      503,
      request,
      allowed,
    );
  }
}
