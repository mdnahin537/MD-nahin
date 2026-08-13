import { test } from 'node:test';
import assert from 'node:assert/strict';

import { handleDemoGenerate } from '../src/demo.ts';
import { handleActivate, handleDeactivate, handleValidate } from '../src/license.ts';
import { handleItchVerify } from '../src/itch.ts';
import {
  demoEnv,
  formRequest,
  jsonRequest,
  itchEnv,
  licenseEnv,
  makeFetch,
  withFetch,
} from './helpers.mjs';

const OVERSIZED = 'K'.repeat(257);

function noUpstreamFetch() {
  return makeFetch([]);
}

test('input: demo prompt limit is measured in UTF-8 bytes', async () => {
  const fetchMock = noUpstreamFetch();
  const restore = withFetch(fetchMock);
  try {
    // 5,000 emoji are ~10,000 UTF-16 code units but 20,000 UTF-8 bytes.
    // The old string.length check admitted this payload.
    const res = await handleDemoGenerate(
      jsonRequest({ turnstileToken: 'good', messages: [{ role: 'user', content: '😀'.repeat(5_000) }] }),
      demoEnv(),
    );
    assert.equal(res.status, 413);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('input: oversized Lemon Squeezy activation key is rejected before KV or upstream use', async () => {
  const fetchMock = noUpstreamFetch();
  const restore = withFetch(fetchMock);
  try {
    const res = await handleActivate(formRequest({ license_key: OVERSIZED }), licenseEnv());
    assert.equal(res.status, 400);
    assert.equal((await res.json()).activated, false);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('input: oversized validation key fails open for an already-active customer', async () => {
  const fetchMock = noUpstreamFetch();
  const restore = withFetch(fetchMock);
  try {
    const res = await handleValidate(formRequest({ license_key: OVERSIZED }), licenseEnv());
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal('valid' in body, false);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('input: oversized deactivation instance ID is rejected before upstream use', async () => {
  const fetchMock = noUpstreamFetch();
  const restore = withFetch(fetchMock);
  try {
    const res = await handleDeactivate(
      formRequest({ license_key: 'KEY-OK', instance_id: 'I'.repeat(257) }),
      licenseEnv(),
    );
    assert.equal(res.status, 400);
    assert.equal((await res.json()).deactivated, false);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});

test('input: oversized itch key is rejected before URL construction or upstream use', async () => {
  const fetchMock = noUpstreamFetch();
  const restore = withFetch(fetchMock);
  try {
    const res = await handleItchVerify(jsonRequest({ key: OVERSIZED }), itchEnv());
    assert.equal(res.status, 400);
    assert.equal((await res.json()).valid, false);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    restore();
  }
});
