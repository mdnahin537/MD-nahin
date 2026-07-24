import { test } from 'node:test';
import assert from 'node:assert/strict';

import { handleActivate, reapOrphans } from '../src/license.ts';
import { handleItchVerify } from '../src/itch.ts';
import {
  formRequest,
  jsonRequest,
  licenseEnv,
  itchEnv,
  makeFetch,
  makeKV,
  URLS,
  withFetch,
} from './helpers.mjs';

const MALFORMED = JSON.stringify({ tokens: [{ token: 'broken-record', instance_id: null }] });

test('device bucket: malformed existing LS state blocks before upstream activation', async () => {
  const devices = makeKV({ 'KEY-OK': MALFORMED });
  const fetchMock = makeFetch([]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleActivate(formRequest({ license_key: 'KEY-OK' }), licenseEnv({ DEVICES: devices }));
    assert.equal(res.status, 503);
    assert.equal(fetchMock.calls.length, 0);
    assert.equal(await devices.get('KEY-OK'), MALFORMED);
  } finally {
    restore();
  }
});

test('device bucket: valid itch key cannot reset a malformed device bucket', async () => {
  const bucketKey = 'itch:real-key';
  const devices = makeKV({ [bucketKey]: MALFORMED });
  const fetchMock = makeFetch([
    { match: (url) => url.includes(URLS.ITCH), respond: () => ({ status: 200, body: { download_key: { id: 12345 } } }) },
  ]);
  const restore = withFetch(fetchMock);
  try {
    const res = await handleItchVerify(jsonRequest({ key: 'real-key' }), itchEnv({ DEVICES: devices }));
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.valid, false);
    assert.equal(body.device_token, undefined);
    assert.equal(await devices.get(bucketKey), MALFORMED);
  } finally {
    restore();
  }
});

test('device bucket: cleanup preserves malformed state instead of reopening slots', async () => {
  const devices = makeKV({ 'KEY-OK': MALFORMED });
  const fetchMock = makeFetch([]);
  const restore = withFetch(fetchMock);
  try {
    const result = await reapOrphans(licenseEnv({ DEVICES: devices }));
    assert.deepEqual(result, { scanned: 1, reaped: 0 });
    assert.equal(await devices.get('KEY-OK'), MALFORMED);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});
