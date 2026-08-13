import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const htmlPath = process.argv[2];
if (!htmlPath) throw new Error('Usage: node scripts/check-release-contract.mjs <html-file>');

const html = readFileSync(htmlPath, 'utf8');

// Literal null bytes are replaced by the HTML parser and make scanners treat
// the product as binary. Markdown placeholders must use source-level escapes.
assert.equal(html.includes('\0'), false, 'HTML contains a literal null byte.');
assert.match(html, /return'\\uE000CB'/);
assert.match(html, /return'\\uE000IC'/);

// Dynamic-recommendation contract: one action refreshes the live catalog and
// selects the newest suitable free NVIDIA chat model. Nemotron is the fallback.
assert.equal((html.match(/id="copilot-free-nvidia"/g) || []).length, 1, 'Expected exactly one Recommended NVIDIA action.');
assert.equal((html.match(/id="copilot-or-connect"/g) || []).length, 0, 'Duplicate OpenRouter one-click action returned.');
assert.match(html, /✨ Use a provider-listed free model/);
assert.match(html, />Find a free model<\/button>/);
assert.match(html, /NEMOTRON_FREE:'nvidia\/nemotron-3-ultra-550b-a55b:free'/);
assert.match(html, /current&&current\.freeNvidia&&current\.freeNvidia\.id/);
assert.match(html, /x\.supported_parameters\.includes\('tools'\)/);

const useStart = html.indexOf('async useFreeNvidia(){');
const useEnd = html.indexOf('\n  },\n  // Per-nation conversation history', useStart);
assert.ok(useStart >= 0 && useEnd > useStart, 'Could not isolate useFreeNvidia().');
const useFreeNvidia = html.slice(useStart, useEnd);
const liveCheck = useFreeNvidia.indexOf('await ModelCatalog.refresh(true)');
const firstMutation = useFreeNvidia.indexOf("State.setSetting('copilotProvider'");
assert.ok(liveCheck >= 0, 'Recommended action does not refresh the live OpenRouter catalog.');
assert.ok(firstMutation > liveCheck, 'Recommended action changes settings before live verification.');
assert.match(useFreeNvidia, /ModelCatalog\.curated\(\)\.freeNvidia/);
assert.match(useFreeNvidia, /ModelCatalog\.isChatModel\(recommendation\)/);
assert.match(useFreeNvidia, /ModelCatalog\.isFree\(recommendation\)/);
assert.match(useFreeNvidia, /supportsTools/);

const orConnectStart = html.indexOf('async orConnect(){');
const orConnectEnd = html.indexOf('\n  },\n  // Runs on every page load.', orConnectStart);
assert.ok(orConnectStart >= 0 && orConnectEnd > orConnectStart, 'Could not isolate orConnect().');
const orConnect = html.slice(orConnectStart, orConnectEnd);
assert.match(orConnect, /await State\.persistNow\(\)/, 'OAuth redirect can race unsaved RealmWright data.');

// OpenRouter callback may add a default, but it cannot overwrite a user's choice.
assert.match(html, /if\(!cur\)State\.setSetting\('copilotModel',freeId\)/);
assert.doesNotMatch(html, /if\(!cur\|\|cur===Copilot\.NEMOTRON_FREE/);

// The advanced picker must retain the complete live free/paid catalog and save
// an explicit GM choice, rather than exposing only the Recommended model.
assert.match(html, /\+optgroup\('Other models',groups\.other\)/);
assert.match(html, /State\.setSetting\('copilotModel',e\.target\.value\)/);

// A paid GM who has not connected a provider must still see the Turnstile path
// for any unused hosted previews; license state alone cannot hide verification.
assert.match(html, /const copilotReady=typeof Copilot!==/);
assert.match(html, /if\(copilotReady\)\{/);

// OAuth contract: Authorization Code + PKCE S256 and the official key exchange.
assert.match(html, /https:\/\/openrouter\.ai\/auth\?callback_url=/);
assert.match(html, /code_challenge_method=S256/);
assert.match(html, /https:\/\/openrouter\.ai\/api\/v1\/auth\/keys/);
assert.match(html, /code_verifier:verifier,code_challenge_method:'S256'/);
assert.match(html, /_OR_PENDING_KEY:'rw_or_pkce_pending'/);
assert.match(html, /_OR_PENDING_TTL_MS:15\*60\*1000/);
assert.match(html, /await IDB\.set\(this\._OR_PENDING_KEY,\{verifier,startedAt:Date\.now\(\),reopen:true\}\)/);
assert.match(html, /age>=0&&age<=this\._OR_PENDING_TTL_MS/);
assert.match(html, /await Secrets\.saveKey\(key\)/);
assert.match(html, /await State\.persistNow\(\)/);
assert.match(html, /if\(storedKey!==key\)throw new Error\('this browser did not confirm secure key storage'\)/);

// Evaluate only the LicenseGate object. Function bodies may reference the rest
// of the app, but the itch.io deactivation tests below call only stubbed paths.
const gateMarker = 'const LicenseGate=';
const gateStart = html.indexOf(gateMarker);
const gateEnd = html.indexOf('\n};\n\n// PIVOT', gateStart);
assert.ok(gateStart >= 0 && gateEnd > gateStart, 'Could not isolate LicenseGate.');
const gateLiteral = html.slice(gateStart + gateMarker.length, gateEnd + 2);
const makeGate = new Function(
  'IDB', 'fetch', 'WORKER_URL', 'IDB_KEY_LICENSE', 'IDB_KEY_DEVICE_TOKEN',
  '_readDeviceToken', 'document', 'CustomEvent', 'LicenseQueue',
  `return (${gateLiteral});`,
);

const LICENSE = 'license';
const TOKEN = 'device-token';
const current = Object.freeze({
  key: 'private-itch-purchase-link',
  instanceId: null,
  platform: 'itchio',
  activatedAt: 1,
  valid: true,
});

function harness({ response, throwFetch = false, failSetMany = [], failSet = false } = {}) {
  const values = new Map([[LICENSE, current], [TOKEN, '11111111-1111-4111-8111-111111111111']]);
  const order = [];
  const events = [];
  let setManyCall = 0;
  const IDB = {
    async setMany(entries) {
      setManyCall += 1;
      order.push(`setMany:${setManyCall}`);
      if (failSetMany.includes(setManyCall)) throw new Error('simulated setMany failure');
      for (const [key, value] of entries) values.set(key, value);
    },
    async set(key, value) {
      order.push('set');
      if (failSet) throw new Error('simulated set failure');
      values.set(key, value);
    },
  };
  const fetchStub = async () => {
    order.push('fetch');
    if (throwFetch) throw new Error('simulated network failure');
    return response || { ok: true, status: 200, json: async () => ({ deactivated: true }) };
  };
  class CustomEventStub { constructor(type) { this.type = type; } }
  const gate = makeGate(
    IDB,
    fetchStub,
    'https://worker.example',
    LICENSE,
    TOKEN,
    async () => values.get(TOKEN),
    { dispatchEvent: (event) => events.push(event.type) },
    CustomEventStub,
    { retryPost: async () => 'success', push: async () => true },
  );
  gate._data = current;
  return { gate, values, order, events };
}

// A local persistence failure must stop before the server slot is released.
{
  const h = harness({ failSetMany: [1] });
  const result = await h.gate.deactivate();
  assert.equal(result.success, false);
  assert.deepEqual(h.order, ['setMany:1']);
  assert.equal(h.gate._data, current);
  assert.equal(h.values.get(LICENSE), current);
}

// A remote failure must restore the saved activation and keep the live gate open.
{
  const h = harness({ response: { ok: false, status: 503, json: async () => ({ error: 'Temporary outage.' }) } });
  const result = await h.gate.deactivate();
  assert.equal(result.success, false);
  assert.deepEqual(h.order, ['setMany:1', 'fetch', 'set']);
  assert.equal(h.gate._data, current);
  assert.equal(h.values.get(LICENSE), current);
  assert.deepEqual(h.events, []);
}

// Successful release must remain locked durably, even if obsolete-token cleanup fails.
{
  const h = harness({ failSetMany: [2] });
  const result = await h.gate.deactivate();
  assert.equal(result.success, true);
  assert.match(result.warning, /obsolete device token/);
  assert.deepEqual(h.order, ['setMany:1', 'fetch', 'setMany:2']);
  assert.equal(h.gate._data, null);
  assert.equal(h.values.get(LICENSE), null);
  assert.deepEqual(h.events, ['license:changed']);
}

// Normal success clears both records and publishes one state change.
{
  const h = harness();
  const result = await h.gate.deactivate();
  assert.deepEqual(result, { success: true });
  assert.equal(h.gate._data, null);
  assert.equal(h.values.get(LICENSE), null);
  assert.equal(h.values.get(TOKEN), null);
  assert.deepEqual(h.events, ['license:changed']);
}

console.log('Validated dynamic NVIDIA recommendation, model-choice preservation, PKCE, and itch.io deactivation contracts.');
