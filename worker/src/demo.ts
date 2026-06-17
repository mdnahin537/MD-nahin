// Free-demo OpenRouter proxy.
//
// This is the ONLY path where RealmWright spends Hunter's money, so it is
// fenced on three sides:
//   1) Cloudflare Turnstile — a human, server-verified, single token per call,
//      verified BEFORE any OpenRouter spend.
//   2) Per-IP daily cap — stops one visitor draining the budget.
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
// Contract:  POST /api/demo/generate
//   { turnstileToken: string, messages: [...], model?: string }   // model ignored
//   -> { ok: true, content, usage, remaining_today } | { error, fallback? }
// (The client sends `turnstileToken`; `turnstile_token` is also accepted for
//  backward compatibility.)

import { jsonResponse } from './cors';

export interface DemoEnv {
  ALLOWED_ORIGINS: string;
  RATELIMIT: KVNamespace;
  OPENROUTER_KEY?: string;
  TURNSTILE_SECRET?: string;
  DEMO_MODEL?: string; // exact OpenRouter slug; overrides whatever the client asks for
  DEMO_PER_IP_DAILY?: string;
  DEMO_GLOBAL_DAILY?: string;
  DEMO_MAX_TOKENS?: string;
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
  const perIpLimit = parseInt(env.DEMO_PER_IP_DAILY || '5', 10);
  const globalLimit = parseInt(env.DEMO_GLOBAL_DAILY || '300', 10);

  // 2) Global ceiling — read before spending. When hit, push to Sample Mode.
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

  // 3) Per-IP daily cap.
  const ipKey = `demo:ip:${ip}:${day}`;
  const ipUsed = parseInt((await env.RATELIMIT.get(ipKey)) || '0', 10);
  if (ipUsed >= perIpLimit) {
    return jsonResponse(
      { error: "You've used all your free demo generations for today. Activate to keep going.", fallback: true },
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
  const TTL = 90_000; // ~25h, covers the UTC day rollover
  await bump(env, ipKey, TTL);
  await bump(env, globalKey, TTL);

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
    await unbump(env, ipKey, TTL);
    await unbump(env, globalKey, TTL);
    return jsonResponse({ error: 'Demo server could not reach the model. Try Sample Mode.', fallback: true }, 502, request, allowed);
  }

  const data: any = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    // AUDIT FIX (MED #7): upstream rejected (5xx/over-budget/etc) → refund too.
    // AUDIT FIX (LOW #12): do NOT echo upstream error text; use a fixed message.
    await unbump(env, ipKey, TTL);
    await unbump(env, globalKey, TTL);
    return jsonResponse({ error: 'The model declined this request. Try Sample Mode.', fallback: true }, 502, request, allowed);
  }

  const content = data?.choices?.[0]?.message?.content ?? '';
  return jsonResponse(
    {
      ok: true,
      content,
      usage: data?.usage || null,
      remaining_today: Math.max(0, perIpLimit - (ipUsed + 1)),
    },
    200,
    request,
    allowed,
  );
}
