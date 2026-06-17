// Test helpers: an in-memory KV namespace and a programmable fetch mock that
// routes by URL prefix. These let the REAL adapter code (demo.ts / itch.ts /
// license.ts) run against mocked Lemon Squeezy / itch.io / OpenRouter /
// Turnstile endpoints. No network, no secrets.

// ── In-memory KV (TTL is accepted and ignored; tests don't need expiry) ──────
export function makeKV(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    _store: store,
    async get(key, type) {
      const v = store.has(key) ? store.get(key) : null;
      if (v == null) return null;
      if (type === 'json') {
        try {
          return JSON.parse(v);
        } catch {
          return null;
        }
      }
      return v;
    },
    async put(key, value, _opts) {
      store.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    },
    async delete(key) {
      store.delete(key);
    },
    async list({ cursor, limit } = {}) {
      const keys = [...store.keys()].map((name) => ({ name }));
      return { keys, list_complete: true, cursor: undefined };
    },
  };
}

// ── Programmable fetch mock ──────────────────────────────────────────────────
// routes: array of { match(url, init) => bool, respond(url, init) => {status, body} }
// Records every call so a test can assert ORDER (e.g. Turnstile before OpenRouter).
export function makeFetch(routes) {
  const calls = [];
  const fn = async (url, init = {}) => {
    const u = String(url);
    calls.push({ url: u, init });
    for (const r of routes) {
      if (r.match(u, init)) {
        const { status = 200, body = {}, throws } = r.respond(u, init) || {};
        if (throws) throw new Error(throws);
        return new Response(JSON.stringify(body), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    throw new Error(`No mock route for ${u}`);
  };
  fn.calls = calls;
  return fn;
}

// URL fragments for routing.
export const URLS = {
  LS_ACTIVATE: 'api.lemonsqueezy.com/v1/licenses/activate',
  LS_VALIDATE: 'api.lemonsqueezy.com/v1/licenses/validate',
  LS_DEACTIVATE: 'api.lemonsqueezy.com/v1/licenses/deactivate',
  ITCH: 'itch.io/api/1',
  OPENROUTER: 'openrouter.ai/api/v1/chat/completions',
  TURNSTILE: 'challenges.cloudflare.com/turnstile/v0/siteverify',
};

// Build a Request with a JSON body and a given Origin (defaults to an allowed one).
export function jsonRequest(body, { origin = 'https://realmwright.app', headers = {} } = {}) {
  const h = { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.7', ...headers };
  if (origin !== undefined) h['Origin'] = origin;
  return new Request('https://worker.example/route', {
    method: 'POST',
    headers: h,
    body: JSON.stringify(body),
  });
}

// Build a urlencoded license Request (the client sends LS calls urlencoded).
export function formRequest(fields, { origin = 'https://realmwright.app', headers = {} } = {}) {
  const h = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'CF-Connecting-IP': '203.0.113.7',
    ...headers,
  };
  if (origin !== undefined) h['Origin'] = origin;
  return new Request('https://worker.example/route', {
    method: 'POST',
    headers: h,
    body: new URLSearchParams(fields).toString(),
  });
}

// Install a fetch mock for the duration of a test; returns a restore fn.
export function withFetch(mockFn) {
  const original = globalThis.fetch;
  globalThis.fetch = mockFn;
  return () => {
    globalThis.fetch = original;
  };
}

// Base envs.
export function demoEnv(overrides = {}) {
  return {
    ALLOWED_ORIGINS: 'https://realmwright.app,https://www.realmwright.app',
    RATELIMIT: makeKV(),
    OPENROUTER_KEY: 'test-openrouter-key',
    TURNSTILE_SECRET: 'test-turnstile-secret',
    DEMO_MODEL: 'test/demo-model',
    DEMO_PER_IP_DAILY: '5',
    DEMO_GLOBAL_DAILY: '300',
    DEMO_MAX_TOKENS: '1200',
    ...overrides,
  };
}

export function licenseEnv(overrides = {}) {
  return {
    ALLOWED_ORIGINS: 'https://realmwright.app,https://www.realmwright.app',
    RATELIMIT: makeKV(),
    DEVICES: makeKV(),
    DEVICE_CAP: '3',
    DEVICE_TTL_SECONDS: '7776000',
    RATE_LIMIT_PER_MIN: '30',
    LS_STORE_ID: '111',
    LS_PRODUCT_ID: '222',
    ...overrides,
  };
}

export function itchEnv(overrides = {}) {
  return {
    ALLOWED_ORIGINS: 'https://realmwright.app,https://www.realmwright.app',
    RATELIMIT: makeKV(),
    DEVICES: makeKV(),
    DEVICE_CAP: '3',
    DEVICE_TTL_SECONDS: '7776000',
    RATE_LIMIT_PER_MIN: '30',
    ITCHIO_API_KEY: 'test-itch-key',
    ITCHIO_GAME_ID: '99999',
    ...overrides,
  };
}
