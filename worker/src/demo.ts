// Free-demo OpenRouter proxy.
//
// This is the ONLY path where RealmWright spends Hunter's money, so it is
// fenced on three sides:
//   1) Cloudflare Turnstile — a human, server-verified, single token per call.
//   2) Per-IP daily cap — stops one visitor draining the budget.
//   3) Global daily cap — hard ceiling on total spend; once hit, the client is
//      told to fall back to Sample Mode (canned content, zero cost).
//
// Licensed users never touch this route — they call OpenRouter directly with
// their own key, so the Worker carries only demo traffic. Well under the
// free-tier request budget.
//
// Contract:  POST /api/demo/generate
//   { turnstileToken: string, messages: [...], model?: string }
//   -> { ok: true, content, usage, remaining_today } | { error, fallback? }

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

function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC
}

async function bump(env: DemoEnv, key: string, ttl: number): Promise<number> {
  const n = parseInt((await env.RATELIMIT.get(key)) || '0', 10) + 1;
  await env.RATELIMIT.put(key, String(n), { expirationTtl: ttl });
  return n;
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
    });
    const json = (await res.json()) as { success?: boolean };
    return !!json.success;
  } catch {
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

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // 1) Human check.
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
  // requests can't all pass the read-check and overspend.
  await bump(env, ipKey, 90_000); // ~25h
  await bump(env, globalKey, 90_000);

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
    });
  } catch {
    return jsonResponse({ error: 'Demo server could not reach the model. Try Sample Mode.', fallback: true }, 502, request, allowed);
  }

  const data: any = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    const msg = data?.error?.message || 'The model declined this request. Try Sample Mode.';
    return jsonResponse({ error: msg, fallback: true }, 502, request, allowed);
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
