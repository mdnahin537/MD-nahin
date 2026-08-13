// Exercises the REAL adapter decision logic (src/*.ts run unchanged via
// --experimental-strip-types + the resolve hook). Store APIs are mocked.
//
// Asserts, per the build spec:
//   * each adapter's verify decision: valid / invalid / store-500 -> "try again",
//     and NEVER a revoke (never an affirmative {valid:false} on a store error);
//   * per-IP demo cap decrements and refuses at the limit;
//   * productMismatch rejects a wrong-product LS key;
//   * Turnstile is verified BEFORE any OpenRouter spend;
//   * demo quota is NOT consumed on an OpenRouter failure.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { handleDemoGenerate } from '../src/demo.ts';
import { handleItchDeactivate, handleItchValidate, handleItchVerify } from '../src/itch.ts';
import { handleActivate, handleDeactivate, handleValidate } from '../src/license.ts';
import worker from '../src/index.ts';

import {
  makeFetch,
  withFetch,
  URLS,
  jsonRequest,
  formRequest,
  demoEnv,
  licenseEnv,
  itchEnv,
} from './helpers.mjs';

const ok = (s) => s >= 200 && s < 300;

// ─────────────────────────────────────────────────────────────────────────────
// DEMO: Turnstile verified BEFORE any OpenRouter spend.
// ─────────────────────────────────────────────────────────────────────────────
test('demo: Turnstile is verified before OpenRouter is ever called', async () => {
  let turnstileCalledAt = -1;
  let openrouterCalledAt = -1;
  let n = 0;
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.TURNSTILE),
      respond: () => {
        turnstileCalledAt = n++;
        return { status: 200, body: { success: true } };
      },
    },
    {
      match: (u) => u.includes(URLS.OPENROUTER),
      respond: () => {
        openrouterCalledAt = n++;
        return { status: 200, body: { choices: [{ message: { content: 'hi' } }], usage: {} } };
      },
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = demoEnv();
    const req = jsonRequest({ turnstileToken: 'good', messages: [{ role: 'user', content: 'hi' }] });
    const res = await handleDemoGenerate(req, env);
    assert.equal(res.status, 200, 'a verified human with quota should get 200');
    assert.ok(turnstileCalledAt >= 0, 'Turnstile must be called');
    assert.ok(openrouterCalledAt >= 0, 'OpenRouter must be called on success');
    assert.ok(turnstileCalledAt < openrouterCalledAt, 'Turnstile must run BEFORE OpenRouter');
  } finally {
    restore();
  }
});

test('demo: a failed Turnstile blocks spend (OpenRouter never called)', async () => {
  let openrouterCalled = false;
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.TURNSTILE), respond: () => ({ status: 200, body: { success: false } }) },
    { match: (u) => u.includes(URLS.OPENROUTER), respond: () => { openrouterCalled = true; return { status: 200, body: {} }; } },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = demoEnv();
    const res = await handleDemoGenerate(
      jsonRequest({ turnstileToken: 'bad', messages: [{ role: 'user', content: 'hi' }] }),
      env,
    );
    assert.equal(res.status, 403, 'failed captcha -> 403');
    assert.equal(openrouterCalled, false, 'OpenRouter must NOT be called when Turnstile fails');
  } finally {
    restore();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DEMO: per-IP cap decrements and refuses at the limit.
// ─────────────────────────────────────────────────────────────────────────────
test('demo: per-IP counter decrements remaining_today and refuses at the cap', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.TURNSTILE), respond: () => ({ status: 200, body: { success: true } }) },
    {
      match: (u) => u.includes(URLS.OPENROUTER),
      respond: () => ({ status: 200, body: { choices: [{ message: { content: 'ok' } }], usage: {} } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = demoEnv({ DEMO_PER_VISITOR_LIMIT: '3' });
    const mk = () => jsonRequest({ turnstileToken: 'good', messages: [{ role: 'user', content: 'hi' }] });

    const r1 = await (await handleDemoGenerate(mk(), env)).json();
    assert.equal(r1.remaining_today, 2, 'after 1st gen, 2 remain');
    const r2 = await (await handleDemoGenerate(mk(), env)).json();
    assert.equal(r2.remaining_today, 1, 'after 2nd gen, 1 remains');
    const r3 = await (await handleDemoGenerate(mk(), env)).json();
    assert.equal(r3.remaining_today, 0, 'after 3rd gen, 0 remain');

    const res4 = await handleDemoGenerate(mk(), env);
    assert.equal(res4.status, 429, '4th gen over the per-IP cap -> 429');
    const r4 = await res4.json();
    assert.equal(r4.fallback, true, 'over-cap response steers the client to Sample Mode');
  } finally {
    restore();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DEMO: quota is NOT consumed on an OpenRouter failure (network + 5xx).
// ─────────────────────────────────────────────────────────────────────────────
test('demo: an OpenRouter network failure refunds the reserved slot', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.TURNSTILE), respond: () => ({ status: 200, body: { success: true } }) },
    { match: (u) => u.includes(URLS.OPENROUTER), respond: () => ({ throws: 'ECONNRESET' }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = demoEnv({ DEMO_PER_VISITOR_LIMIT: '5', DEMO_GLOBAL_DAILY: '300' });
    const day = new Date().toISOString().slice(0, 10);
    // PIVOT FIX: the per-visitor key is no longer day-scoped (see src/demo.ts) —
    // only the global ceiling still carries the UTC day in its key.
    const ipKey = `demo:ip:203.0.113.7`;
    const globalKey = `demo:global:${day}`;

    const res = await handleDemoGenerate(
      jsonRequest({ turnstileToken: 'good', messages: [{ role: 'user', content: 'hi' }] }),
      env,
    );
    assert.equal(res.status, 502, 'OpenRouter outage -> 502 fallback');
    const body = await res.json();
    assert.equal(body.fallback, true);
    // Refunded back to 0 — a provider outage must not burn the pool.
    assert.equal(await env.RATELIMIT.get(ipKey), '0', 'per-IP slot refunded on OpenRouter failure');
    assert.equal(await env.RATELIMIT.get(globalKey), '0', 'global slot refunded on OpenRouter failure');
  } finally {
    restore();
  }
});

test('demo: an OpenRouter 5xx also refunds the reserved slot', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.TURNSTILE), respond: () => ({ status: 200, body: { success: true } }) },
    { match: (u) => u.includes(URLS.OPENROUTER), respond: () => ({ status: 503, body: { error: { message: 'overloaded' } } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = demoEnv({ DEMO_PER_VISITOR_LIMIT: '5' });
    const ipKey = `demo:ip:203.0.113.7`; // PIVOT FIX: no longer day-scoped — see src/demo.ts
    const res = await handleDemoGenerate(
      jsonRequest({ turnstileToken: 'good', messages: [{ role: 'user', content: 'hi' }] }),
      env,
    );
    assert.equal(res.status, 502);
    assert.equal(await env.RATELIMIT.get(ipKey), '0', 'per-IP slot refunded on OpenRouter 5xx');
    // And it does NOT leak the upstream error text.
    const body = await res.json();
    assert.ok(!/overloaded/.test(body.error || ''), 'upstream error text must not be echoed');
  } finally {
    restore();
  }
});

test('demo: a zero local daily ceiling relies on the free provider quota', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.TURNSTILE), respond: () => ({ status: 200, body: { success: true } }) },
    { match: (u) => u.includes(URLS.OPENROUTER), respond: () => ({ status: 429, body: { error: { message: 'provider quota' } } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = demoEnv({ DEMO_GLOBAL_DAILY: '0' });
    const day = new Date().toISOString().slice(0, 10);
    const res = await handleDemoGenerate(
      jsonRequest({ turnstileToken: 'good', messages: [{ role: 'user', content: 'hi' }] }),
      env,
    );
    assert.equal(res.status, 429, 'provider quota is surfaced as temporary free-provider capacity');
    const body = await res.json();
    assert.match(body.error, /free AI provider/i);
    assert.equal(await env.RATELIMIT.get('demo:ip:203.0.113.7'), '0', 'provider quota must refund the visitor slot');
    assert.equal(await env.RATELIMIT.get(`demo:global:${day}`), null, 'disabled local ceiling must not create a global counter');
  } finally {
    restore();
  }
});

test('demo: a successful generation DOES consume one slot', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.TURNSTILE), respond: () => ({ status: 200, body: { success: true } }) },
    { match: (u) => u.includes(URLS.OPENROUTER), respond: () => ({ status: 200, body: { choices: [{ message: { content: 'ok' } }], usage: {} } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = demoEnv();
    const ipKey = `demo:ip:203.0.113.7`; // PIVOT FIX: no longer day-scoped — see src/demo.ts
    await handleDemoGenerate(jsonRequest({ turnstileToken: 'good', messages: [{ role: 'user', content: 'hi' }] }), env);
    assert.equal(await env.RATELIMIT.get(ipKey), '1', 'a real success consumes exactly one slot');
  } finally {
    restore();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PIVOT FIX regression test: "exactly 5 messages per visitor" must be a
// one-time trial, NOT a nightly-resetting allowance — otherwise the free demo
// never converts to a $23 sale. The per-visitor key carries no day component,
// so a slot used up on any previous day still blocks a request made "today".
// ─────────────────────────────────────────────────────────────────────────────
test('demo: the per-visitor cap does NOT reset daily (persists across a day boundary)', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.TURNSTILE), respond: () => ({ status: 200, body: { success: true } }) },
    { match: (u) => u.includes(URLS.OPENROUTER), respond: () => ({ status: 200, body: { choices: [{ message: { content: 'ok' } }], usage: {} } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = demoEnv({ DEMO_PER_VISITOR_LIMIT: '5' });
    // Simulate "this visitor already used their 5 messages on some earlier
    // day" by pre-seeding the day-less counter directly, rather than making 5
    // real calls — proves the cap is keyed independent of `today()`.
    await env.RATELIMIT.put('demo:ip:203.0.113.7', '5');
    const res = await handleDemoGenerate(
      jsonRequest({ turnstileToken: 'good', messages: [{ role: 'user', content: 'hi' }] }),
      env,
    );
    assert.equal(res.status, 429, 'a visitor who used up their trial on a prior day must still be capped today');
    const body = await res.json();
    assert.equal(body.fallback, true);
  } finally {
    restore();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PIVOT FIX regression test: demo.ts previously had no top-level try/catch
// (unlike license.ts/itch.ts's "AUDIT FIX HIGH #1"), so an unexpected KV throw
// escaped as an unhandled, CORS-less crash instead of a graceful fallback.
// ─────────────────────────────────────────────────────────────────────────────
test('demo: an unexpected KV throw degrades gracefully instead of crashing', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.TURNSTILE), respond: () => ({ status: 200, body: { success: true } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = demoEnv({
      RATELIMIT: {
        async get() {
          throw new Error('KV unavailable');
        },
        async put() {
          throw new Error('KV unavailable');
        },
      },
    });
    const res = await handleDemoGenerate(
      jsonRequest({ turnstileToken: 'good', messages: [{ role: 'user', content: 'hi' }] }),
      env,
    );
    assert.equal(res.status, 503, 'a KV throw must degrade gracefully, never crash uncaught');
    assert.ok(res.headers.get('Access-Control-Allow-Origin'), 'failure response must still carry CORS headers');
    const body = await res.json();
    assert.equal(body.fallback, true, 'steers the client to Sample Mode');
  } finally {
    restore();
  }
});

test('demo: model is server-forced (client model is ignored)', async () => {
  let sentModel = null;
  let sentReasoning = null;
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.TURNSTILE), respond: () => ({ status: 200, body: { success: true } }) },
    {
      match: (u) => u.includes(URLS.OPENROUTER),
      respond: (_u, init) => {
        const sent = JSON.parse(init.body);
        sentModel = sent.model;
        sentReasoning = sent.reasoning;
        return { status: 200, body: { choices: [{ message: { content: 'ok' } }], usage: {} } };
      },
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = demoEnv({ DEMO_MODEL: 'server/forced-model' });
    await handleDemoGenerate(
      jsonRequest({ turnstileToken: 'good', messages: [{ role: 'user', content: 'hi' }], model: 'expensive/gpt-whatever' }),
      env,
    );
    assert.equal(sentModel, 'server/forced-model', 'the Worker must force DEMO_MODEL, never the client value');
    assert.deepEqual(sentReasoning, { exclude: true }, 'private model reasoning must be excluded from the buyer response');
  } finally {
    restore();
  }
});

test('demo: an oversized messages payload is rejected before any spend', async () => {
  let openrouterCalled = false;
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.TURNSTILE), respond: () => ({ status: 200, body: { success: true } }) },
    { match: (u) => u.includes(URLS.OPENROUTER), respond: () => { openrouterCalled = true; return { status: 200, body: {} }; } },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = demoEnv();
    const huge = 'x'.repeat(20 * 1024);
    const res = await handleDemoGenerate(
      jsonRequest({ turnstileToken: 'good', messages: [{ role: 'user', content: huge }] }),
      env,
    );
    assert.equal(res.status, 413, 'oversized prompt -> 413');
    assert.equal(openrouterCalled, false, 'no spend on an oversized prompt');
  } finally {
    restore();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ITCH adapter: valid / invalid / store-500 -> "try again", NEVER a revoke.
// ─────────────────────────────────────────────────────────────────────────────
test('itch: a valid download key -> {valid:true} + a device_token (3-device cap)', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.ITCH), respond: () => ({ status: 200, body: { download_key: { id: 12345 } } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = itchEnv();
    const res = await handleItchVerify(jsonRequest({ key: 'real-key' }), env);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.valid, true);
    assert.ok(body.device_token, 'a valid itch buyer must receive a device_token');
    assert.equal(body.device_cap, 3);
    const call = fetchMock.calls.find((c) => c.url.includes(URLS.ITCH));
    assert.equal(call.init.headers.Authorization, 'Bearer test-itch-key', 'seller API key must be a bearer header');
    assert.ok(!call.url.includes('test-itch-key'), 'seller API key must never appear in the URL');
    assert.ok(
      [...env.DEVICES._store.keys()].every((key) => !key.includes('real-key')),
      'the buyer key must not appear in the Cloudflare KV key list',
    );
  } finally {
    restore();
  }
});

test('itch: a buyer can paste the full itch.io access URL, not only the token', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.ITCH), respond: () => ({ status: 200, body: { download_key: { id: 12345 } } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const token = 'YWKse5jeAeuZ8w3a5qO2b2PId1sChw2B9b637w6z';
    const fullUrl =
      `https://realmwright-gm.itch.io/realmwright-gm-the-living-campaign-engine/download/${token}` +
      '?source=receipt#access';
    const res = await handleItchVerify(jsonRequest({ key: fullUrl }), itchEnv());
    assert.equal(res.status, 200);
    assert.equal((await res.json()).valid, true);

    const call = fetchMock.calls.find((c) => c.url.includes(URLS.ITCH));
    const upstream = new URL(call.url);
    assert.equal(upstream.searchParams.get('download_key'), token);
    assert.ok(!upstream.searchParams.get('download_key').includes('/download/'));
  } finally {
    restore();
  }
});

test('itch: a non-itch URL is rejected before any seller API call', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.ITCH), respond: () => ({ status: 200, body: { download_key: { id: 12345 } } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleItchVerify(
      jsonRequest({ key: 'https://attacker.example/download/not-an-itch-key' }),
      itchEnv(),
    );
    assert.equal(res.status, 400);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('itch: an unknown key -> {valid:false}, no raw upstream text, no token', async () => {
  const fetchMock = makeFetch([
    // The live itch.io API currently uses HTTP 400 for this semantic result,
    // despite the public docs showing HTTP 200.
    { match: (u) => u.includes(URLS.ITCH), respond: () => ({ status: 400, body: { errors: ['invalid download key'] } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleItchVerify(jsonRequest({ key: 'nope' }), itchEnv());
    const body = await res.json();
    assert.equal(body.valid, false);
    assert.ok(!body.device_token, 'an invalid key must not get a device token');
    assert.ok(!/invalid download key/.test(body.error || ''), 'must not echo itch raw error text');
  } finally {
    restore();
  }
});

test('itch: a seller credential/scope 4xx is an outage, never a buyer revocation', async () => {
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.ITCH),
      respond: () => ({ status: 401, body: { errors: ['invalid API key'] } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleItchVerify(jsonRequest({ key: 'buyer-key' }), itchEnv());
    assert.equal(res.status, 502);
    const body = await res.json();
    assert.equal(body.valid, false, 'a new activation must fail closed');
    assert.match(body.error, /try again/i);
  } finally {
    restore();
  }
});

test('itch: a store outage -> 502 "try again", NEVER an affirmative unlock', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.ITCH), respond: () => ({ throws: 'ETIMEDOUT' }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleItchVerify(jsonRequest({ key: 'real-key' }), itchEnv());
    assert.equal(res.status, 502, 'itch outage -> 502');
    const body = await res.json();
    assert.equal(body.valid, false, 'an outage must NOT grant access (fail closed for a paywall)');
    assert.match(body.error, /try again/i);
  } finally {
    restore();
  }
});

test('itch: a 5xx from itch -> not a valid:true, fails closed', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.ITCH), respond: () => ({ status: 500, body: { error: 'server error' } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleItchVerify(jsonRequest({ key: 'real-key' }), itchEnv());
    const body = await res.json();
    assert.notEqual(body.valid, true, 'a 5xx must never read as a valid buyer');
  } finally {
    restore();
  }
});

test('itch validate: a valid purchase and active device stay valid', async () => {
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.ITCH),
      respond: () => ({ status: 200, body: { download_key: { id: 12345, game_id: 99999 } } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = itchEnv();
    const activation = await handleItchVerify(jsonRequest({ key: 'real-key' }), env);
    const activated = await activation.json();
    const validation = await handleItchValidate(
      jsonRequest({ key: 'real-key' }, { headers: { 'X-Device-Token': activated.device_token } }),
      env,
    );
    assert.equal(validation.status, 200);
    const body = await validation.json();
    assert.equal(body.valid, true);
    assert.equal(body.device_token, activated.device_token, 'an active browser keeps the same lease token');
    assert.equal(body.active_devices, 1);
    assert.equal(body.device_cap, 3);
    assert.match(validation.headers.get('Set-Cookie') || '', /Max-Age=7776000/);
  } finally {
    restore();
  }
});

test('itch validate: a valid buyer automatically renews an expired 90-day device lease', async () => {
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.ITCH),
      respond: () => ({ status: 200, body: { download_key: { id: 12345, game_id: 99999 } } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = itchEnv();
    const activation = await handleItchVerify(jsonRequest({ key: 'real-key' }), env);
    const activated = await activation.json();

    // Cloudflare KV removes the inactive device bucket after its 90-day lease.
    // The browser still has its purchase key and old opaque token in IndexedDB.
    env.DEVICES._store.clear();

    const renewal = await handleItchValidate(
      jsonRequest({ key: 'real-key' }, { headers: { 'X-Device-Token': activated.device_token } }),
      env,
    );
    assert.equal(renewal.status, 200);
    const renewed = await renewal.json();
    assert.equal(renewed.valid, true, 'a valid one-time purchase must not become a 90-day license');
    assert.ok(renewed.device_token);
    assert.notEqual(renewed.device_token, activated.device_token, 'the expired browser lease is replaced');
    assert.equal(renewed.active_devices, 1);
    assert.equal(renewed.device_cap, 3);
    assert.match(renewal.headers.get('Set-Cookie') || '', new RegExp(`rw_device=${renewed.device_token}`));

    const nextValidation = await handleItchValidate(
      jsonRequest({ key: 'real-key' }, { headers: { 'X-Device-Token': renewed.device_token } }),
      env,
    );
    const next = await nextValidation.json();
    assert.equal(next.valid, true);
    assert.equal(next.device_token, renewed.device_token, 'the renewed browser is stable on later launches');
    assert.equal(next.active_devices, 1);
  } finally {
    restore();
  }
});

test('itch validate: a revoked key explicitly invalidates the local license', async () => {
  let checks = 0;
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.ITCH),
      respond: () => {
        checks++;
        return checks === 1
          ? { status: 200, body: { download_key: { id: 12345, game_id: 99999 } } }
          : { status: 200, body: { errors: ['invalid download key'] } };
      },
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = itchEnv();
    const activation = await handleItchVerify(jsonRequest({ key: 'real-key' }), env);
    const activated = await activation.json();
    const validation = await handleItchValidate(
      jsonRequest({ key: 'real-key' }, { headers: { 'X-Device-Token': activated.device_token } }),
      env,
    );
    const body = await validation.json();
    assert.equal(body.valid, false);
  } finally {
    restore();
  }
});

test('itch validate: an itch.io outage never emits valid:false', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.ITCH), respond: () => ({ throws: 'ETIMEDOUT' }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const validation = await handleItchValidate(
      jsonRequest({ key: 'real-key' }, { headers: { 'X-Device-Token': '11111111-1111-4111-8111-111111111111' } }),
      itchEnv(),
    );
    assert.equal(validation.status, 502);
    const body = await validation.json();
    assert.equal('valid' in body, false, 'temporary store failure must preserve the current paid state');
  } finally {
    restore();
  }
});

test('itch deactivate: releases the server-side device slot', async () => {
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.ITCH),
      respond: () => ({ status: 200, body: { download_key: { id: 12345, game_id: 99999 } } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = itchEnv({ DEVICE_CAP: '1' });
    const first = await handleItchVerify(jsonRequest({ key: 'real-key' }), env);
    const firstBody = await first.json();

    const blocked = await handleItchVerify(jsonRequest({ key: 'real-key' }), env);
    assert.equal(blocked.status, 403, 'second device must initially hit the cap');

    const deactivated = await handleItchDeactivate(
      jsonRequest({ key: 'real-key' }, { headers: { 'X-Device-Token': firstBody.device_token } }),
      env,
    );
    assert.equal(deactivated.status, 200);
    assert.deepEqual(await deactivated.json(), { deactivated: true });

    const replacement = await handleItchVerify(jsonRequest({ key: 'real-key' }), env);
    assert.equal(replacement.status, 200, 'a new device can activate after the old device releases its slot');
  } finally {
    restore();
  }
});

test('router: itch activation, validation, and deactivation routes are wired', async () => {
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.ITCH),
      respond: () => ({ status: 200, body: { download_key: { id: 12345, game_id: 99999 } } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = itchEnv();
    const make = (path, body, token) =>
      new Request(`https://worker.example${path}`, {
        method: 'POST',
        headers: {
          Origin: 'https://realmwright.app',
          'Content-Type': 'application/json',
          'CF-Connecting-IP': '203.0.113.7',
          ...(token ? { 'X-Device-Token': token } : {}),
        },
        body: JSON.stringify(body),
      });

    const activation = await worker.fetch(make('/verify', { key: 'real-key' }), env);
    const activated = await activation.json();
    assert.equal(activated.valid, true);

    const validation = await worker.fetch(
      make('/api/itch/validate', { key: 'real-key' }, activated.device_token),
      env,
    );
    assert.equal((await validation.json()).valid, true);

    const deactivation = await worker.fetch(
      make('/api/itch/deactivate', { key: 'real-key' }, activated.device_token),
      env,
    );
    assert.equal((await deactivation.json()).deactivated, true);
  } finally {
    restore();
  }
});

test('router: a disallowed browser origin is refused before any itch.io call', async () => {
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.ITCH),
      respond: () => ({ status: 200, body: { download_key: { id: 12345, game_id: 99999 } } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const req = new Request('https://worker.example/verify', {
      method: 'POST',
      headers: {
        Origin: 'https://attacker.example',
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '203.0.113.7',
      },
      body: JSON.stringify({ key: 'real-key' }),
    });
    const res = await worker.fetch(req, itchEnv());
    assert.equal(res.status, 403);
    assert.equal(fetchMock.calls.length, 0, 'disallowed origin must not reach itch.io');
  } finally {
    restore();
  }
});

test('license deactivate: an LS outage preserves the device record and reports failure', async () => {
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.LS_ACTIVATE),
      respond: () => ({
        status: 200,
        body: { activated: true, instance: { id: 'inst-1' }, meta: { product_id: 222, store_id: 111 } },
      }),
    },
    { match: (u) => u.includes(URLS.LS_DEACTIVATE), respond: () => ({ throws: 'ECONNRESET' }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = licenseEnv();
    const activated = await handleActivate(formRequest({ license_key: 'KEY-OK', instance_name: 'RW' }), env);
    const activationBody = await activated.json();
    const deactivated = await handleDeactivate(
      formRequest(
        { license_key: 'KEY-OK', instance_id: 'inst-1' },
        { headers: { 'X-Device-Token': activationBody.device_token } },
      ),
      env,
    );
    assert.equal(deactivated.status, 503);
    const body = await deactivated.json();
    assert.equal(body.deactivated, false);
    assert.ok(await env.DEVICES.get('KEY-OK'), 'the device record must remain so the client can retry safely');
  } finally {
    restore();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LICENSE adapter (Lemon Squeezy): valid / wrong-product / store error.
// ─────────────────────────────────────────────────────────────────────────────
test('license activate: a valid, OWN-product key activates and returns a device_token', async () => {
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.LS_ACTIVATE),
      respond: () => ({
        status: 200,
        body: { activated: true, instance: { id: 'inst-1' }, meta: { product_id: 222, store_id: 111 } },
      }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleActivate(formRequest({ license_key: 'KEY-OK', instance_name: 'RW' }), licenseEnv());
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.activated, true);
    assert.ok(body.device_token, 'client depends on json.device_token');
    assert.equal(body.device_cap, 3);
  } finally {
    restore();
  }
});

test('license activate: a WRONG-product key is rejected and rolled back (paywall)', async () => {
  let deactivateCalled = false;
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.LS_ACTIVATE),
      respond: () => ({
        status: 200,
        // valid LS key, but from a DIFFERENT product/store
        body: { activated: true, instance: { id: 'inst-x' }, meta: { product_id: 999, store_id: 888 } },
      }),
    },
    {
      match: (u) => u.includes(URLS.LS_DEACTIVATE),
      respond: () => {
        deactivateCalled = true;
        return { status: 200, body: { deactivated: true } };
      },
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleActivate(formRequest({ license_key: 'KEY-OTHER-PRODUCT' }), licenseEnv());
    assert.equal(res.status, 403, 'a cross-product key must be rejected');
    const body = await res.json();
    assert.equal(body.activated, false);
    assert.match(body.error, /different product/i);
    assert.equal(deactivateCalled, true, 'the wrongly-consumed LS slot must be rolled back');
  } finally {
    restore();
  }
});

test('license validate: an OWN-product valid key passes through valid:true', async () => {
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.LS_VALIDATE),
      respond: () => ({ status: 200, body: { valid: true, meta: { product_id: 222, store_id: 111 } } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleValidate(formRequest({ license_key: 'KEY-OK' }), licenseEnv());
    const body = await res.json();
    assert.equal(body.valid, true);
  } finally {
    restore();
  }
});

test('license validate: a wrong-product key that LS calls valid is rejected', async () => {
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.LS_VALIDATE),
      respond: () => ({ status: 200, body: { valid: true, meta: { product_id: 999, store_id: 888 } } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleValidate(formRequest({ license_key: 'KEY-OTHER' }), licenseEnv());
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.valid, false);
  } finally {
    restore();
  }
});

// THE CORE PROPERTY: a store outage on validate must NEVER revoke a paying user.
test('license validate: an LS outage NEVER emits valid:false (no revoke)', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.LS_VALIDATE), respond: () => ({ throws: 'ECONNRESET' }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleValidate(formRequest({ license_key: 'KEY-OK' }), licenseEnv());
    const body = await res.json();
    // The client's _decideValidity keeps the user active when `valid` is absent.
    assert.notEqual(body.valid, false, 'an outage must not produce valid:false (would revoke a paying user)');
    assert.equal('valid' in body, false, 'no valid field at all -> client keeps current state');
  } finally {
    restore();
  }
});

test('license validate: an LS 5xx NEVER emits valid:false (no revoke)', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.LS_VALIDATE), respond: () => ({ status: 503, body: { error: 'busy' } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleValidate(formRequest({ license_key: 'KEY-OK' }), licenseEnv());
    const body = await res.json();
    assert.notEqual(body.valid, false, 'a 5xx must not produce valid:false');
  } finally {
    restore();
  }
});

test('license activate: an LS outage -> graceful 503 "try again", not a crash', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.LS_ACTIVATE), respond: () => ({ throws: 'ECONNRESET' }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleActivate(formRequest({ license_key: 'KEY-OK' }), licenseEnv());
    assert.equal(res.status, 503, 'activate on LS outage -> graceful 503');
    const body = await res.json();
    assert.equal(body.activated, false);
    assert.match(body.error, /try again/i);
    // CORS header present even on the failure path (the old bug: CORS-less 500).
    assert.ok(res.headers.get('Access-Control-Allow-Origin'), 'failure response must carry CORS headers');
  } finally {
    restore();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PAYWALL config: unconfigured -> fail closed (an unconfigured paywall is worse
// than a down one).
// ─────────────────────────────────────────────────────────────────────────────
test('license activate: unconfigured paywall fails closed (503)', async () => {
  const restore = withFetch(makeFetch([]));
  try {
    const env = licenseEnv({ LS_PRODUCT_ID: undefined, LS_STORE_ID: undefined });
    const res = await handleActivate(formRequest({ license_key: 'KEY-OK' }), env);
    assert.equal(res.status, 503, 'no LS_PRODUCT_ID/LS_STORE_ID -> fail closed');
    const body = await res.json();
    assert.equal(body.activated, false);
  } finally {
    restore();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE CAP: a 4th distinct device on the same license is refused.
// ─────────────────────────────────────────────────────────────────────────────
test('license activate: the 4th distinct device on one key is refused (cap=3)', async () => {
  let deactivations = 0;
  const fetchMock = makeFetch([
    {
      match: (u) => u.includes(URLS.LS_ACTIVATE),
      respond: () => ({ status: 200, body: { activated: true, instance: { id: 'inst' }, meta: { product_id: 222, store_id: 111 } } }),
    },
    { match: (u) => u.includes(URLS.LS_DEACTIVATE), respond: () => { deactivations++; return { status: 200, body: { deactivated: true } }; } },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = licenseEnv(); // shared DEVICES KV across the 4 calls
    // No X-Device-Token header -> each call is treated as a new device.
    for (let i = 0; i < 3; i++) {
      const r = await handleActivate(formRequest({ license_key: 'SAME-KEY' }), env);
      assert.equal(r.status, 200, `device ${i + 1} should activate`);
    }
    const res4 = await handleActivate(formRequest({ license_key: 'SAME-KEY' }), env);
    assert.equal(res4.status, 403, 'the 4th device must be refused');
    const body = await res4.json();
    assert.match(body.error, /Device limit/i);
    assert.ok(deactivations >= 1, 'the over-cap LS activation slot must be rolled back');
  } finally {
    restore();
  }
});
