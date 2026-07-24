// Free-demo OpenRouter proxy.
//
// This is the ONLY path where RealmWright spends Hunter's money, so it is
// fenced on three sides:
//   1) Cloudflare Turnstile — a human, server-verified, single token per call,
//      verified BEFORE any OpenRouter spend.
//   2) Per-visitor lifetime cap — exactly DEMO_PER_VISITOR_LIMIT (product
//      default: 5) messages per IP, EVER (see PIVOT FIX below) — stops one
//      visitor draining the budget.
//   3) Global daily cap — hard ceiling on total spend; once hit, the client is
//      told to fall back to Sample Mode (canned content, zero cost).
//
// The Worker FORCES the model (env.DEMO_MODEL) and ignores whatever the client
// asks for, so a caller can never request an expensive model on Hunter's dime.
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
// is later reassigned to a genuinely new visitor. The GLOBAL cap is untouched
// and still resets daily, per spec.
// NOTE FOR BUILD AGENT 2 / HUNTER: the client (realmwright-v7.html:17055)
// currently renders this count as "N free previews left TODAY" — that copy is
// now inaccurate and should drop "today" (see worker/README.md and the Build
// Agent 1 report for detail). Flagged, not fixed here — that file is out of
// this Worker's scope.
//
// Contract:  POST /api/demo/generate
//   { turnstileToken: string, messages: [...], model?: string }   // model ignored
//   -> { ok: true, content, usage, remaining_today } | { error, fallback? }
// (The client sends `turnstileToken`; `turnstile_token` is also accepted for
//  backward compatibility. `remaining_today` is a legacy field name kept for
//  client compatibility — see the note above, it is really "remaining in your
//  one-time free trial", not a daily allowance.)

import { jsonResponse } from './cors';

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
const OPENROUTER_TIMEOUT_MS = 30000; // model calls are slower; still bounded

// AUDIT FIX (MED #6): hard cap on the serialized `messages` payload so a caller
// can't inflate input-token cost with a huge prompt (output is already capped
// by max_tokens, input was previously unbounded).
const MAX_MESSAGES_BYTES = 16 * 1024; // 16 KB

function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC
}

async function bump(env: DemoEnv, key: string, ttl: number): Promise<number> {
  const n = parseInt((await env.RATELIMIT.get(key)) || '0', 10) + 1;
  await env.RATELIMIT.put(key, String(n), { expirationTtl: ttl });
  return n;
}

// AUDIT FIX (MED #7): best-effort decrement, used to refund a reserved demo slot
// when the OpenRouter call fails cleanly (network/5xx) so a provider outage does
// not burn the day's pool with zero successful generations. Never drops below 0.
async function unbump(env: DemoEnv, key: string, ttl: number): Promise<void> {
  try {
    const cur = parseInt((await env.RATELIMIT.get(key)) || '0', 10);
    const next = cur > 0 ? cur - 1 : 0;
    await env.RATELIMIT.put(key, String(next), { expirationTtl: ttl });
  } catch {
    /* best-effort; an un-refunded slot just under-spends, never over-spends */
  }
}

type Reservation = { key: string; ttl: number };

// RECOVERY FIX (2026-07-24): KV is not transactional. If the visitor counter
// increments successfully but the global-counter write then fails, the old code
// returned 503 while silently consuming one of the visitor's five trial messages.
// Reserve the counters as one logical operation and compensate every reservation
// that definitely completed before a later write failed.
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
      body = await request.json();
    } catch {
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
    if (messagesJson.length > MAX_MESSAGES_BYTES) {
      return jsonResponse({ error: 'Prompt is too large for the free demo.' }, 413, request, allowed);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    // 1) Human check — verified BEFORE any spend (the key cost control).
    if (!(await verifyTurnstile(env, token, ip))) {
      return jsonResponse({ error: 'Captcha verification failed. Please try again.' }, 403, request, allowed);
    }

    const day = today();
    const perVisitorLimit = parseInt(env.DEMO_PER_VISITOR_LIMIT || '5', 10);
    const globalLimit = parseInt(env.DEMO_GLOBAL_DAILY || '300', 10);

    // 2) Global ceiling — read before spending. When hit, push to Sample Mode.
    //    This one DOES reset daily — per spec, it is a spend ceiling, not the
    //    per-visitor trial.
    const globalKey = `demo:global:${day}`;
    const globalUsed = parseInt((await env.RATELIMIT.get(globalKey)) || '0', 10);
    if (globalUsed >= globalLimit) {
      return jsonResponse(
        { error: 'The free demo is at capacity for today. Try Sample Mode — no key needed.', fallback: true },
        429,
        request,
        allowed,
      );
    }

    // 3) Per-visitor lifetime cap (PIVOT FIX: no `:${day}` suffix — see the
    //    file-header comment. "Exactly 5 messages per visitor" must not reset
    //    every UTC midnight or the free tier never converts to a sale.
    const ipKey = `demo:ip:${ip}`;
    const ipUsed = parseInt((await env.RATELIMIT.get(ipKey)) || '0', 10);
    if (ipUsed >= perVisitorLimit) {
      return jsonResponse(
        { error: "You've used all your free demo generations. Activate a key to keep going.", fallback: true },
        429,
        request,
        allowed,
      );
    }

    // Reserve the slots BEFORE the upstream call so a burst of concurrent
    // requests can't all pass the read-check and overspend. (Counters are KV
    // read-modify-write — see the residual-race note in ratelimit.ts. The
    // effective ceiling is cap + peak_concurrency; set DEMO_GLOBAL_DAILY low
    // enough that even an Nx overrun is affordable.)
    const trialTtl = parseInt(env.DEMO_TRIAL_TTL_SECONDS || '7776000', 10); // ~90d per-visitor memory
    const globalTtl = 90_000; // ~25h, covers the UTC day rollover
    const reserved = await reserveAll(env, [
      { key: ipKey, ttl: trialTtl },
      { key: globalKey, ttl: globalTtl },
    ]);
    if (!reserved) {
      return jsonResponse(
        { error: 'Demo server is busy. Try Sample Mode.', fallback: true },
        503,
        request,
        allowed,
      );
    }

    const maxTokens = parseInt(env.DEMO_MAX_TOKENS || '1200', 10);
    let upstream: Response;
    try {
      upstream = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: env.DEMO_MODEL, // server decides the model — client cannot upgrade it
          messages,
          max_tokens: maxTokens,
        }),
        signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
      });
    } catch {
      // AUDIT FIX (MED #7): clean upstream failure → refund the reserved slots so
      // an OpenRouter outage doesn't exhaust the day's pool with zero successes.
      await unbump(env, ipKey, trialTtl);
      await unbump(env, globalKey, globalTtl);
      return jsonResponse({ error: 'Demo server could not reach the model. Try Sample Mode.', fallback: true }, 502, request, allowed);
    }

    const data: any = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      // AUDIT FIX (MED #7): upstream rejected (5xx/over-budget/etc) → refund too.
      // AUDIT FIX (LOW #12): do NOT echo upstream error text; use a fixed message.
      await unbump(env, ipKey, trialTtl);
      await unbump(env, globalKey, globalTtl);
      return jsonResponse({ error: 'The model declined this request. Try Sample Mode.', fallback: true }, 502, request, allowed);
    }

    const content = data?.choices?.[0]?.message?.content ?? '';
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
