import { test } from 'node:test';
import assert from 'node:assert/strict';

import { handleDemoGenerate } from '../src/demo.ts';
import { makeFetch, withFetch, URLS, jsonRequest, demoEnv } from './helpers.mjs';

// Regression for the 2026-07-24 recovery fix. Cloudflare KV writes are not
// transactional: the visitor reservation may succeed before the global write
// fails. That partial success must be compensated so a failed request never
// consumes one of the visitor's five free preview messages.
test('demo: partial quota reservation failure rolls back the completed visitor slot', async () => {
  const store = new Map();
  let putCount = 0;
  let openrouterCalled = false;

  const kv = {
    async get(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async put(key, value) {
      putCount += 1;
      if (putCount === 2) throw new Error('global KV reservation failed');
      store.set(key, String(value));
    },
    async delete(key) {
      store.delete(key);
    },
    async list() {
      return { keys: [...store.keys()].map((name) => ({ name })), list_complete: true };
    },
  };

  const fetchMock = makeFetch([
    {
      match: (url) => url.includes(URLS.TURNSTILE),
      respond: () => ({ status: 200, body: { success: true } }),
    },
    {
      match: (url) => url.includes(URLS.OPENROUTER),
      respond: () => {
        openrouterCalled = true;
        return { status: 200, body: { choices: [{ message: { content: 'should not run' } }] } };
      },
    },
  ]);

  const restore = withFetch(fetchMock);
  try {
    const env = demoEnv({ RATELIMIT: kv });
    const response = await handleDemoGenerate(
      jsonRequest({ turnstileToken: 'good', messages: [{ role: 'user', content: 'hi' }] }),
      env,
    );

    assert.equal(response.status, 503, 'failed reservation returns a graceful retryable response');
    assert.equal(openrouterCalled, false, 'OpenRouter must not be called unless both reservations succeed');
    assert.equal(await kv.get('demo:ip:203.0.113.7'), '0', 'completed visitor reservation is refunded');

    const day = new Date().toISOString().slice(0, 10);
    assert.equal(await kv.get(`demo:global:${day}`), null, 'failed global reservation is not recorded');
    assert.ok(response.headers.get('Access-Control-Allow-Origin'), 'failure remains readable by the allowed client');

    const body = await response.json();
    assert.equal(body.fallback, true);
  } finally {
    restore();
  }
});
