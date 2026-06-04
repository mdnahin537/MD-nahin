/**
 * RealmWright License + Demo Proxy — Cloudflare Worker
 *
 * Deploy with: wrangler deploy
 *
 * Required environment variables (set in Cloudflare dashboard, NEVER in code):
 *   ITCHIO_API_KEY   — itch.io developer API key
 *   ITCHIO_GAME_ID   — itch.io numeric game ID
 *   OPENROUTER_KEY   — Hunter's OpenRouter API key for the free-demo proxy
 *   TURNSTILE_SECRET — Cloudflare Turnstile secret key for demo verification
 *
 * Required KV namespaces (bind in wrangler.toml + create in dashboard):
 *   DEMO_KV     — per-IP and global daily rate-limit counters
 *   LICENSE_KV  — per-key device fingerprint records
 *
 * Endpoints:
 *   POST /verify                 — itch.io download-key verification (existing)
 *   POST /api/license/activate   — record device fingerprint + enforce 3-device cap
 *   POST /api/demo/generate      — Turnstile-gated AI proxy with per-IP daily cap
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const DEMO_PER_IP_DAILY = 3;
const DEMO_GLOBAL_DAILY_DEFAULT = 30;
const LICENSE_MAX_DEVICES = 3;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

function clientIP(request) {
  return request.headers.get('CF-Connecting-IP')
      || request.headers.get('X-Real-IP')
      || 'unknown';
}

async function verifyTurnstile(token, secret, remoteip) {
  if (!token || !secret) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteip && remoteip !== 'unknown') body.set('remoteip', remoteip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const out = await res.json();
    return !!out.success;
  } catch {
    return false;
  }
}

async function kvIncrement(kv, key, ttlSeconds) {
  const current = parseInt(await kv.get(key) || '0', 10);
  const next = current + 1;
  await kv.put(key, String(next), { expirationTtl: ttlSeconds });
  return next;
}

// ───────────────────────────────────────────────────────────────────────────
// Itch.io verification (existing endpoint, unchanged response shape)
// ───────────────────────────────────────────────────────────────────────────

async function handleVerifyItchio(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json({ valid: false, error: 'Invalid JSON' }, 400); }

  const key = (body.key || '').trim();
  if (!key) return json({ valid: false, error: 'No key provided' });

  if (!env.ITCHIO_API_KEY || !env.ITCHIO_GAME_ID) {
    return json({ valid: false, error: 'Worker not configured — set ITCHIO_API_KEY and ITCHIO_GAME_ID.' });
  }

  try {
    const itchUrl = `https://itch.io/api/1/${env.ITCHIO_API_KEY}/game/${env.ITCHIO_GAME_ID}/download_keys?download_key=${encodeURIComponent(key)}`;
    const res = await fetch(itchUrl, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    // itch.io returns { "download_key": {...} } on success, { "errors": [...] } on failure.
    const valid = !!data.download_key && !data.errors;
    return json({ valid, error: valid ? null : 'Key not found for this product.' });
  } catch (e) {
    return json({ valid: false, error: 'itch.io verification temporarily unavailable.' }, 502);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// License activation — records device fingerprint, enforces 3-device cap.
// Idempotent on the same fingerprint. The Lemon Squeezy API call still runs
// client-side; this endpoint layers our device-cap on top.
// ───────────────────────────────────────────────────────────────────────────

async function handleLicenseActivate(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'Invalid JSON' }, 400); }

  const key = (body.key || '').trim();
  const fingerprint = (body.fingerprint || '').trim();
  if (!key) return json({ ok: false, error: 'No license key.' });
  if (!fingerprint) return json({ ok: false, error: 'No device fingerprint.' });

  if (!env.LICENSE_KV) {
    // KV not bound — fall open (return ok) so we don't break activation when KV
    // isn't set up yet. Client-side LS API call remains the source of truth for
    // "is this key real". Hunter binds the KV namespace when ready.
    return json({ ok: true, devices: 1, max: LICENSE_MAX_DEVICES, warning: 'KV not configured — device cap not enforced.' });
  }

  const kvKey = `license:${key}`;
  const raw = await env.LICENSE_KV.get(kvKey);
  let record = raw ? JSON.parse(raw) : { devices: [], firstSeen: Date.now() };

  // Already activated on this device? Allow (idempotent).
  const existing = record.devices.find(d => d.fingerprint === fingerprint);
  if (existing) {
    existing.lastSeen = Date.now();
    await env.LICENSE_KV.put(kvKey, JSON.stringify(record));
    return json({ ok: true, devices: record.devices.length, max: LICENSE_MAX_DEVICES });
  }

  // Cap check
  if (record.devices.length >= LICENSE_MAX_DEVICES) {
    return json({
      ok: false,
      error: `This license is already active on ${LICENSE_MAX_DEVICES} devices. Deactivate one before activating here.`,
      devices: record.devices.length,
      max: LICENSE_MAX_DEVICES,
    }, 403);
  }

  // Record new device
  record.devices.push({ fingerprint, activatedAt: Date.now(), lastSeen: Date.now() });
  await env.LICENSE_KV.put(kvKey, JSON.stringify(record));
  return json({ ok: true, devices: record.devices.length, max: LICENSE_MAX_DEVICES });
}

// ───────────────────────────────────────────────────────────────────────────
// Demo AI proxy — Turnstile-gated, per-IP daily cap, global daily cap.
// Holds the OpenRouter key server-side so the browser never sees it.
// ───────────────────────────────────────────────────────────────────────────

async function handleDemoGenerate(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const turnstileToken = body.turnstileToken;
  const messages = body.messages;
  const model = body.model || 'anthropic/claude-haiku-latest';

  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages array required' }, 400);
  }

  if (!env.OPENROUTER_KEY) {
    return json({ error: 'Demo backend not configured. Try Sample Mode or activate a license.' }, 503);
  }

  if (!env.DEMO_KV) {
    return json({ error: 'Demo rate-limit storage unavailable. Try again later.' }, 503);
  }

  const ip = clientIP(request);
  const turnstileOk = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, ip);
  if (!turnstileOk) {
    return json({ error: 'Captcha verification failed. Refresh the page and try again.' }, 403);
  }

  // Per-IP daily cap
  const day = todayKey();
  const ipKey = `demo:ip:${ip}:${day}`;
  const ipCount = parseInt(await env.DEMO_KV.get(ipKey) || '0', 10);
  if (ipCount >= DEMO_PER_IP_DAILY) {
    return json({
      error: `You've used your ${DEMO_PER_IP_DAILY} free demos for today. Try Sample Mode or activate a license for unlimited use.`,
    }, 429);
  }

  // Global daily cap
  const globalCap = parseInt(env.DEMO_GLOBAL_DAILY_CAP || String(DEMO_GLOBAL_DAILY_DEFAULT), 10);
  const globalKey = `demo:global:${day}`;
  const globalCount = parseInt(await env.DEMO_KV.get(globalKey) || '0', 10);
  if (globalCount >= globalCap) {
    return json({
      error: "Today's free-demo pool is full. Try Sample Mode below, or come back tomorrow.",
    }, 429);
  }

  // Increment BEFORE the AI call so abort-and-retry can't bypass the cap.
  await kvIncrement(env.DEMO_KV, ipKey, 86400);
  await kvIncrement(env.DEMO_KV, globalKey, 86400);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://realmwright.pages.dev',
        'X-Title': 'RealmWright Free Demo',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return json({
        error: 'AI demo temporarily unavailable. Try Sample Mode.',
        upstream_status: res.status,
        detail: errText.slice(0, 200),
      }, 502);
    }

    const data = await res.json();
    return json({
      ok: true,
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage || null,
      remaining_today: Math.max(0, DEMO_PER_IP_DAILY - ipCount - 1),
    });
  } catch (e) {
    return json({ error: 'AI demo temporarily unavailable. Try Sample Mode.' }, 502);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Router
// ───────────────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/verify') return handleVerifyItchio(request, env);
    if (path === '/api/license/activate') return handleLicenseActivate(request, env);
    if (path === '/api/demo/generate') return handleDemoGenerate(request, env);

    return json({ error: 'Not found' }, 404);
  },
};
