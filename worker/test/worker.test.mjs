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
import { handleItchVerify } from '../src/itch.ts';
import { handleActivate, handleValidate } from '../src/license.ts';

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
    const env = demoEnv({ DEMO_PER_VISITOR_LIMIT: '5' });
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
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.TURNSTILE), respond: () => ({ status: 200, body: { success: true } }) },
    {
      match: (u) => u.includes(URLS.OPENROUTER),
      respond: (_u, init) => {
        sentModel = JSON.parse(init.body).model;
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
    const res = await handleItchVerify(jsonRequest({ key: 'real-key' }), itchEnv());
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.valid, true);
    assert.ok(body.device_token, 'a valid itch buyer must receive a device_token');
    assert.equal(body.device_cap, 3);
  } finally {
    restore();
  }
});

test('itch: an unknown key -> {valid:false}, no raw upstream text, no token', async () => {
  const fetchMock = makeFetch([
    { match: (u) => u.includes(URLS.ITCH), respond: () => ({ status: 200, body: { errors: ['invalid download key'] } }) },
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
