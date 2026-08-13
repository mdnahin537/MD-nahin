import { test } from 'node:test';
import assert from 'node:assert/strict';

import { handleDemoGenerate } from '../src/demo.ts';
import { issueOrRefresh } from '../src/fingerprint.ts';
import { handleItchVerify } from '../src/itch.ts';
import { checkRateLimit } from '../src/ratelimit.ts';
import {
  demoEnv,
  licenseEnv,
  itchEnv,
  makeFetch,
  makeKV,
  URLS,
  withFetch,
  jsonRequest,
} from './helpers.mjs';

function successfulDemoFetch(onOpenRouter = () => {}) {
  return makeFetch([
    { match: (url) => url.includes(URLS.TURNSTILE), respond: () => ({ status: 200, body: { success: true } }) },
    {
      match: (url) => url.includes(URLS.OPENROUTER),
      respond: (_url, init) => {
        onOpenRouter(JSON.parse(init.body));
        return { status: 200, body: { choices: [{ finish_reason: 'stop', message: { content: 'usable answer' } }] } };
      },
    },
  ]);
}

const demoRequest = () => jsonRequest({
  turnstileToken: 'good',
  messages: [{ role: 'user', content: 'prepare a scene' }],
});

test('config: invalid per-visitor limit falls back to the locked five-use cap', async () => {
  let openrouterCalled = false;
  const kv = makeKV({ 'demo:ip:203.0.113.7': '5' });
  const fetchMock = successfulDemoFetch(() => { openrouterCalled = true; });
  const restore = withFetch(fetchMock);
  try {
    const res = await handleDemoGenerate(demoRequest(), demoEnv({
      RATELIMIT: kv,
      DEMO_PER_VISITOR_LIMIT: 'not-a-number',
    }));
    assert.equal(res.status, 429);
    assert.equal(openrouterCalled, false);
  } finally {
    restore();
  }
});

test('config: an invalid global limit safely preserves the owner-selected disabled ceiling', async () => {
  let openrouterCalled = false;
  const day = new Date().toISOString().slice(0, 10);
  const kv = makeKV({ [`demo:global:${day}`]: '300' });
  const fetchMock = successfulDemoFetch(() => { openrouterCalled = true; });
  const restore = withFetch(fetchMock);
  try {
    const res = await handleDemoGenerate(demoRequest(), demoEnv({
      RATELIMIT: kv,
      DEMO_GLOBAL_DAILY: '999999999999',
    }));
    assert.equal(res.status, 200);
    assert.equal(openrouterCalled, true);
    assert.equal(await kv.get(`demo:global:${day}`), '300', 'disabled local ceiling must not touch the global counter');
  } finally {
    restore();
  }
});

test('config: corrupt visitor counter fails closed without model spend', async () => {
  let openrouterCalled = false;
  const kv = makeKV({ 'demo:ip:203.0.113.7': 'broken-counter' });
  const fetchMock = successfulDemoFetch(() => { openrouterCalled = true; });
  const restore = withFetch(fetchMock);
  try {
    const res = await handleDemoGenerate(demoRequest(), demoEnv({ RATELIMIT: kv }));
    assert.equal(res.status, 503);
    assert.equal(openrouterCalled, false);
    assert.equal((await res.json()).fallback, true);
  } finally {
    restore();
  }
});

test('config: oversized max_tokens cannot raise owner spend', async () => {
  let sent;
  const fetchMock = successfulDemoFetch((body) => { sent = body; });
  const restore = withFetch(fetchMock);
  try {
    const res = await handleDemoGenerate(demoRequest(), demoEnv({ DEMO_MAX_TOKENS: '999999999999' }));
    assert.equal(res.status, 200);
    assert.equal(sent.max_tokens, 800);
  } finally {
    restore();
  }
});

test('config: invalid device cap cannot create a fourth slot', async () => {
  const now = Date.now();
  const bucket = {
    tokens: [1, 2, 3].map((n) => ({
      token: `00000000-0000-4000-8000-00000000000${n}`,
      instance_id: `inst-${n}`,
      created_at: now,
      last_seen_at: now,
    })),
  };
  const env = licenseEnv({
    DEVICE_CAP: 'NaN',
    DEVICES: makeKV({ 'KEY-OK': JSON.stringify(bucket) }),
  });
  const result = await issueOrRefresh(env, 'KEY-OK', null, 'inst-4');
  assert.equal(result.ok, false);
  assert.equal(result.cap, 3);
  const stored = await env.DEVICES.get('KEY-OK', 'json');
  assert.equal(stored.tokens.length, 3);
});

test('config: invalid device TTL uses the safe 90-day default', async () => {
  let writtenTtl = null;
  const store = new Map();
  const kv = {
    async get(key, type) {
      const value = store.get(key) ?? null;
      if (value === null) return null;
      return type === 'json' ? JSON.parse(value) : value;
    },
    async put(key, value, opts) {
      writtenTtl = opts?.expirationTtl ?? null;
      store.set(key, String(value));
    },
    async delete(key) { store.delete(key); },
  };
  const result = await issueOrRefresh(licenseEnv({
    DEVICES: kv,
    DEVICE_TTL_SECONDS: '0',
  }), 'KEY-OK', null, 'inst-1');
  assert.equal(result.ok, true);
  assert.equal(writtenTtl, 7_776_000);
});

test('config: invalid rate-limit variable cannot disable throttling', async () => {
  const ip = '203.0.113.7';
  const window = Math.floor(Date.now() / 60_000);
  const key = `rl:license:${ip}:${window}`;
  const env = licenseEnv({
    RATE_LIMIT_PER_MIN: 'not-a-number',
    RATELIMIT: makeKV({ [key]: '30' }),
  });
  const request = new Request('https://worker.example/api/license/activate', {
    method: 'POST',
    headers: { 'CF-Connecting-IP': ip },
  });
  const result = await checkRateLimit(request, env, 'license');
  assert.deepEqual(result, { ok: false, remaining: 0 });
});

test('config: corrupt rate-limit counter fails closed', async () => {
  const ip = '203.0.113.7';
  const window = Math.floor(Date.now() / 60_000);
  const key = `rl:license:${ip}:${window}`;
  const kv = makeKV({ [key]: 'broken-counter' });
  const env = licenseEnv({ RATELIMIT: kv });
  const request = new Request('https://worker.example/api/license/activate', {
    method: 'POST',
    headers: { 'CF-Connecting-IP': ip },
  });
  const result = await checkRateLimit(request, env, 'license');
  assert.deepEqual(result, { ok: false, remaining: 0 });
  assert.equal(await kv.get(key), 'broken-counter');
});


test('config: invalid itch device TTL uses the safe cookie lifetime', async () => {
  const fetchMock = makeFetch([
    { match: (url) => url.includes(URLS.ITCH), respond: () => ({ status: 200, body: { download_key: { id: 12345 } } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleItchVerify(jsonRequest({ key: 'real-key' }), itchEnv({ DEVICE_TTL_SECONDS: 'broken' }));
    assert.equal(res.status, 200);
    assert.match(res.headers.get('set-cookie') || '', /Max-Age=7776000(?:;|$)/);
    assert.equal((await res.json()).valid, true);
  } finally {
    restore();
  }
});
