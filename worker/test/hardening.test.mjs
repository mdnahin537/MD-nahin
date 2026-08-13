import { test } from 'node:test';
import assert from 'node:assert/strict';

import { issueOrRefresh } from '../src/fingerprint.ts';
import { handleItchValidate, handleItchVerify } from '../src/itch.ts';
import { handleActivate, handleValidate, reapOrphans } from '../src/license.ts';
import {
  formRequest,
  itchEnv,
  jsonRequest,
  licenseEnv,
  makeFetch,
  makeKV,
  URLS,
  withFetch,
} from './helpers.mjs';

const OVERSIZED_FIELD = 'K'.repeat(257);
const OVERSIZED_BODY = 'K'.repeat(40_000);
const MALFORMED_BUCKET = JSON.stringify({
  tokens: [{ token: 'missing-required-timestamps', instance_id: null }],
});

function liveBucket(instanceId = 'inst-1') {
  const now = Date.now();
  return JSON.stringify({
    tokens: [{
      token: '11111111-1111-4111-8111-111111111111',
      instance_id: instanceId,
      created_at: now,
      last_seen_at: now,
    }],
  });
}

test('hardening: oversized request body is rejected before Lemon Squeezy', async () => {
  const fetchMock = makeFetch([]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleActivate(
      formRequest({ license_key: OVERSIZED_BODY }),
      licenseEnv(),
    );
    assert.equal(res.status, 413);
    assert.equal((await res.json()).activated, false);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('hardening: oversized validation body never emits valid:false', async () => {
  const fetchMock = makeFetch([]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleValidate(
      formRequest({ license_key: OVERSIZED_BODY }),
      licenseEnv(),
    );
    assert.equal(res.status, 413);
    assert.equal('valid' in await res.json(), false);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('hardening: oversized itch request body is rejected before seller API use', async () => {
  const fetchMock = makeFetch([]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleItchVerify(
      jsonRequest({ key: OVERSIZED_BODY }),
      itchEnv(),
    );
    assert.equal(res.status, 413);
    assert.equal((await res.json()).valid, false);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('hardening: oversized itch validation body preserves paid state', async () => {
  const fetchMock = makeFetch([]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleItchValidate(
      jsonRequest({ key: OVERSIZED_BODY }),
      itchEnv(),
    );
    assert.equal(res.status, 413);
    assert.equal('valid' in await res.json(), false);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('hardening: field limits use UTF-8 bytes, not JavaScript character count', async () => {
  const fetchMock = makeFetch([]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleItchVerify(
      jsonRequest({ key: '😀'.repeat(100) }),
      itchEnv(),
    );
    assert.equal(res.status, 400);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('hardening: oversized Lemon key is rejected before KV or upstream use', async () => {
  const fetchMock = makeFetch([]);
  const restore = withFetch(fetchMock);
  try {
    const env = licenseEnv();
    const res = await handleActivate(
      formRequest({ license_key: OVERSIZED_FIELD }),
      env,
    );
    assert.equal(res.status, 400);
    assert.equal(env.DEVICES._store.size, 0);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('hardening: malformed Lemon device state blocks before upstream activation', async () => {
  const devices = makeKV({ 'KEY-OK': MALFORMED_BUCKET });
  const fetchMock = makeFetch([]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleActivate(
      formRequest({ license_key: 'KEY-OK' }),
      licenseEnv({ DEVICES: devices }),
    );
    assert.equal(res.status, 503);
    assert.equal(fetchMock.calls.length, 0);
    assert.equal(await devices.get('KEY-OK'), MALFORMED_BUCKET);
  } finally {
    restore();
  }
});

test('hardening: malformed itch device state cannot be reset by reactivation', async () => {
  const fetchMock = makeFetch([
    {
      match: (url) => url.includes(URLS.ITCH),
      respond: () => ({ status: 200, body: { download_key: { id: 12345, game_id: 99999 } } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = itchEnv();
    const first = await handleItchVerify(jsonRequest({ key: 'real-key' }), env);
    assert.equal(first.status, 200);
    const [bucketKey] = [...env.DEVICES._store.keys()];
    env.DEVICES._store.set(bucketKey, MALFORMED_BUCKET);
    fetchMock.calls.length = 0;

    const blocked = await handleItchVerify(jsonRequest({ key: 'real-key' }), env);
    assert.equal(blocked.status, 503);
    assert.equal((await blocked.json()).valid, false);
    assert.equal(fetchMock.calls.length, 0);
    assert.equal(await env.DEVICES.get(bucketKey), MALFORMED_BUCKET);
  } finally {
    restore();
  }
});

test('hardening: cleanup preserves malformed device state', async () => {
  const devices = makeKV({ 'KEY-OK': MALFORMED_BUCKET });
  const fetchMock = makeFetch([]);
  const restore = withFetch(fetchMock);
  try {
    const result = await reapOrphans(licenseEnv({ DEVICES: devices }));
    assert.deepEqual(result, { scanned: 1, reaped: 0 });
    assert.equal(await devices.get('KEY-OK'), MALFORMED_BUCKET);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('hardening: Lemon cleanup never touches itch.io device buckets', async () => {
  const storedBucket = liveBucket(null);
  const devices = makeKV({ 'itch:hashed-buyer-key': storedBucket });
  const fetchMock = makeFetch([]);
  const restore = withFetch(fetchMock);
  try {
    const result = await reapOrphans(licenseEnv({ DEVICES: devices }));
    assert.deepEqual(result, { scanned: 0, reaped: 0 });
    assert.equal(await devices.get('itch:hashed-buyer-key'), storedBucket);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('hardening: cleanup never reaps a device on a Lemon Squeezy 5xx', async () => {
  const devices = makeKV({ 'KEY-OK': liveBucket() });
  const fetchMock = makeFetch([
    {
      match: (url) => url.includes(URLS.LS_VALIDATE),
      respond: () => ({ status: 500, body: { error: 'temporary' } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const result = await reapOrphans(licenseEnv({ DEVICES: devices }));
    assert.deepEqual(result, { scanned: 1, reaped: 0 });
    assert.notEqual(await devices.get('KEY-OK'), null);
  } finally {
    restore();
  }
});

test('hardening: cleanup reaps only an explicit successful valid:false', async () => {
  const devices = makeKV({ 'KEY-OK': liveBucket() });
  const fetchMock = makeFetch([
    {
      match: (url) => url.includes(URLS.LS_VALIDATE),
      respond: () => ({ status: 200, body: { valid: false } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const result = await reapOrphans(licenseEnv({ DEVICES: devices }));
    assert.deepEqual(result, { scanned: 1, reaped: 1 });
    assert.equal(await devices.get('KEY-OK'), null);
  } finally {
    restore();
  }
});

test('hardening: re-entering a key reuses the same live Lemon instance', async () => {
  let activateCalls = 0;
  const fetchMock = makeFetch([
    {
      match: (url) => url.includes(URLS.LS_ACTIVATE),
      respond: () => {
        activateCalls++;
        return {
          status: 200,
          body: { activated: true, instance: { id: 'inst-1' }, meta: { product_id: 222, store_id: 111 } },
        };
      },
    },
    {
      match: (url) => url.includes(URLS.LS_VALIDATE),
      respond: () => ({ status: 200, body: { valid: true, meta: { product_id: 222, store_id: 111 } } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = licenseEnv();
    const first = await handleActivate(formRequest({ license_key: 'KEY-OK' }), env);
    const activated = await first.json();
    const second = await handleActivate(
      formRequest(
        { license_key: 'KEY-OK' },
        { headers: { 'X-Device-Token': activated.device_token } },
      ),
      env,
    );
    const reused = await second.json();
    assert.equal(second.status, 200);
    assert.equal(reused.reused, true);
    assert.equal(reused.instance.id, 'inst-1');
    assert.equal(reused.device_token, activated.device_token);
    assert.equal(activateCalls, 1);
  } finally {
    restore();
  }
});

test('hardening: an outage while checking an existing instance cannot create a duplicate', async () => {
  let activateCalls = 0;
  const fetchMock = makeFetch([
    {
      match: (url) => url.includes(URLS.LS_ACTIVATE),
      respond: () => {
        activateCalls++;
        return {
          status: 200,
          body: { activated: true, instance: { id: 'inst-1' }, meta: { product_id: 222, store_id: 111 } },
        };
      },
    },
    {
      match: (url) => url.includes(URLS.LS_VALIDATE),
      respond: () => ({ status: 500, body: { valid: false } }),
    },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const env = licenseEnv();
    const first = await handleActivate(formRequest({ license_key: 'KEY-OK' }), env);
    const activated = await first.json();
    const second = await handleActivate(
      formRequest(
        { license_key: 'KEY-OK' },
        { headers: { 'X-Device-Token': activated.device_token } },
      ),
      env,
    );
    assert.equal(second.status, 503);
    assert.equal(activateCalls, 1);
  } finally {
    restore();
  }
});

test('hardening: invalid device cap and TTL fall back to promised safe values', async () => {
  let writtenTtl = null;
  const base = makeKV({
    'KEY-OK': JSON.stringify({
      tokens: [1, 2, 3].map((n) => ({
        token: `00000000-0000-4000-8000-00000000000${n}`,
        instance_id: `inst-${n}`,
        created_at: Date.now(),
        last_seen_at: Date.now(),
      })),
    }),
  });
  const devices = {
    ...base,
    async put(key, value, options) {
      writtenTtl = options?.expirationTtl ?? null;
      return base.put(key, value, options);
    },
  };
  const result = await issueOrRefresh(
    licenseEnv({ DEVICES: devices, DEVICE_CAP: 'broken', DEVICE_TTL_SECONDS: '0' }),
    'KEY-OK',
    '00000000-0000-4000-8000-000000000001',
    'inst-1',
  );
  assert.equal(result.ok, true);
  assert.equal(result.cap, 3);
  assert.equal(writtenTtl, 7_776_000);

  const blocked = await issueOrRefresh(
    licenseEnv({ DEVICES: devices, DEVICE_CAP: '999', DEVICE_TTL_SECONDS: '0' }),
    'KEY-OK',
    null,
    'inst-4',
  );
  assert.equal(blocked.ok, false);
  assert.equal(blocked.cap, 3);
});
