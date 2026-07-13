# rw-license Worker — RealmWright license + demo (the money path)

Cloudflare Worker that fronts three things for RealmWright:

1. **Lemon Squeezy license** proxy (activate / validate / deactivate) with a
   **product/store paywall** — a valid LS key only unlocks RealmWright if it
   belongs to *this* store and product. Eliminates the old third-party CORS
   proxy, layers per-IP rate limiting, and binds an opaque server-issued
   `device_token` to each license so the 3-device cap can't be bypassed by
   tweaking a client-side fingerprint.
2. **itch.io** download-key verification (`/verify`) — also mints a
   `device_token`, so itch buyers share the same 3-device cap.
3. **Free-demo OpenRouter proxy** (`/api/demo/generate`) — the **only** path
   that spends money, fenced by Cloudflare Turnstile (verified *before* any
   spend), a server-forced model, a per-visitor cap (5 messages, one-time —
   does **not** reset daily), and a global ceiling that **does** reset daily.

> **Scope:** Gumroad is intentionally **out of scope** for this Worker — the
> client (`realmwright-v7.html`) ships with Lemon Squeezy + itch.io only. The
> platform layer is deliberately kept extensible: each storefront is a small
> adapter (`license.ts` for LS, `itch.ts` for itch) behind the same
> `device_token` contract, so a future Lemon Squeezy / itch.io / other
> Payoneer-compatible storefront can be added as another adapter without
> touching the client or the device-cap core.

## Routes

| Route | Purpose |
|---|---|
| `POST /api/license/activate` | LS activate, enforces the product/store paywall, mints/refreshes a `device_token`, enforces the 3-device cap, sets the `rw_device` cookie + echoes the token in JSON. |
| `POST /api/license/validate` | LS validate, re-checks the paywall (fail-open), refreshes `last_seen_at`. **Never fabricates `valid`** — a third-party outage passes through and the client keeps the user active. |
| `POST /api/license/deactivate` | LS deactivate, revokes the local device token, clears the cookie. |
| `POST /api/license/cleanup-orphans` | Manual orphan reaper. **Disabled unless `CLEANUP_TOKEN` is set** (the fortnightly cron runs regardless). |
| `POST /verify` | itch.io key verify, mints a `device_token` for the buyer. |
| `POST /api/demo/generate` | Free-demo OpenRouter proxy (Turnstile + caps + server-forced model). |

## Fail-safe contract (why a third-party outage can't hurt a paying customer)

- **validate** passes the Lemon Squeezy response straight through and never
  invents `valid:true`/`valid:false`. On a network error/timeout the upstream
  helper returns an empty body, so no `valid` field reaches the client and the
  client's `_decideValidity` keeps the user in their current state. The product
  re-check on validate only rejects a key LS *affirmatively* says is
  valid-but-wrong-product; an outage is never treated as a mismatch.
- **No endpoint ever returns a "disable features" / kill signal** — only status
  text. The client is the only place that flips license state.
- The **demo** path fails the other way on purpose: Turnstile/OpenRouter
  outages **fail closed** (no spend) and push the client to Sample Mode.

## Deploy — first time

```bash
cd worker
npm install

# 1) KV namespaces
npx wrangler kv:namespace create DEVICES
npx wrangler kv:namespace create RATELIMIT
# Paste both IDs into wrangler.toml under [[kv_namespaces]].

# 2) Set the required secrets (values live ONLY in the secret store — never in git)
npx wrangler secret put OPENROUTER_KEY     # free-demo OpenRouter Bearer key
npx wrangler secret put TURNSTILE_SECRET   # Cloudflare Turnstile secret
npx wrangler secret put ITCHIO_API_KEY     # seller's itch.io API key (server-side only)
npx wrangler secret put CLEANUP_TOKEN      # optional: enables the manual cleanup route

# 3) Fill the REPLACE_WITH_* placeholders in wrangler.toml [vars]:
#    LS_STORE_ID, LS_PRODUCT_ID, ITCHIO_GAME_ID, DEMO_MODEL

# 4) Deploy
npx wrangler deploy
```

## Configuration (`wrangler.toml` → `[vars]`, safe to commit)

| Var | Default / placeholder | Purpose |
|---|---|---|
| `ALLOWED_ORIGINS` | `https://REPLACE_WITH_PAGES_DEV_ORIGIN.pages.dev,...` | Comma-separated CORS allowlist. Set this to your real Cloudflare Pages URL (`https://<project>.pages.dev`) plus a custom domain later if you add one. `Origin: null` (file://, itch bundle) is allowed **without credentials**; unknown origins are refused before any side effect. **Not** a wildcard. |
| `DEVICE_CAP` | `3` | Max concurrent device tokens per license (LS **and** itch). |
| `DEVICE_TTL_SECONDS` | `7776000` (90 days) | Device-token lifetime, refreshed on every touch. |
| `RATE_LIMIT_PER_MIN` | `30` | Per-IP per-minute cap on the license endpoints. |
| `LS_STORE_ID` | `REPLACE_WITH_LS_STORE_ID` | **Required.** Numeric LS store id. Paywall fails closed if unset. |
| `LS_PRODUCT_ID` | `REPLACE_WITH_LS_PRODUCT_ID` | **Required.** Numeric LS product id. Paywall fails closed if unset. |
| `ITCHIO_GAME_ID` | `REPLACE_WITH_ITCHIO_GAME_ID` | **Required for itch.** Numeric itch.io game id this Worker guards. |
| `DEMO_MODEL` | `REPLACE_WITH_OPENROUTER_MODEL_SLUG` | **Required.** Exact OpenRouter model slug. The Worker forces this and ignores the client's `model`. Demo returns 503 if unset. |
| `DEMO_PER_VISITOR_LIMIT` | `5` | Free-demo generations per visitor (per-IP), **one-time** — see the pivot note below, this does not reset nightly. |
| `DEMO_TRIAL_TTL_SECONDS` | `7776000` (90 days) | How long a used-up per-visitor trial is remembered before it naturally resets (handles IP churn/CGNAT reassignment). |
| `DEMO_GLOBAL_DAILY` | `300` | Global free-demo ceiling **per UTC day**, across all visitors combined. Set low enough that a small concurrency overrun is affordable (counters are KV, see note below). |
| `DEMO_MAX_TOKENS` | `1200` | `max_tokens` cap per demo call. |

### Pivot note: the demo cap is a one-time trial, not a daily allowance

An earlier build capped each IP at 5 messages **per UTC day** (`demo:ip:{ip}:{day}`),
which reset every midnight — meaning any visitor could get 5 fresh free AI
messages forever, with zero incentive to ever buy the $23 key. The product
spec says "exactly 5 messages per visitor" (no "per day") while separately
calling for "a **global** daily ceiling" — a deliberate contrast. The per-IP
key is now `demo:ip:{ip}` (no day component), remembered for
`DEMO_TRIAL_TTL_SECONDS` (default 90 days). The **global** ceiling is
unchanged and still resets daily.

**Client copy note:** `realmwright-v7.html` currently renders the remaining
count as *"N free previews left **today**"* — that wording is now inaccurate
and should be updated (e.g. drop "today") when the client is next touched.
Not fixed here; that file is outside this Worker's scope.

### Env-var naming note (itch)

itch vars are standardized on the **`ITCHIO_*`** prefix (`ITCHIO_API_KEY`,
`ITCHIO_GAME_ID`) — matching the legacy Phase 5A worker so an operator who
already set `ITCHIO_*` secrets does not have to rename anything. (An earlier
draft used `ITCH_*`; that prefix is **not** read by this build.)

## Secrets (set via `wrangler secret put`, listed by name only)

| Secret | Required | Purpose |
|---|---|---|
| `OPENROUTER_KEY` | **Yes** | Bearer key for the free-demo OpenRouter proxy. Without it the demo returns 503. |
| `TURNSTILE_SECRET` | **Yes** | Cloudflare Turnstile secret for the demo human-check. Without it the demo returns 503. |
| `ITCHIO_API_KEY` | **Yes (for itch)** | Seller's itch.io API key. Used server-side only; without it `/verify` returns 503. |
| `CLEANUP_TOKEN` | Optional | If set, enables `POST /api/license/cleanup-orphans` (requires header `X-Cleanup-Token: <value>`). **If unset, that route is disabled** (returns 404). The fortnightly cron reaper runs either way. |

> The Lemon Squeezy **license** API needs **no** API key — its activate/validate/
> deactivate endpoints are license-holder-facing. No `LEMONSQUEEZY_API_KEY`.

> **Operational note:** `wrangler tail` logs outbound URLs, and the itch API key
> appears in the itch request path. Treat `wrangler tail` output as sensitive.

## KV counters are approximate (documented residual race)

Both the per-IP rate limiter and the demo per-IP/global counters are KV
read-modify-write with no compare-and-set. Under concurrent load the effective
ceiling is `cap + peak_concurrency`, not exactly the cap. This is acceptable:
the license limiter is abuse-prevention (not auth), and the demo path caps
`max_tokens` per call and refunds a reserved slot when OpenRouter fails — so the
worst case is a small, bounded overspend. Making it exact would require a
Durable Object per key (a paid binding). See the comments in `ratelimit.ts` and
`fingerprint.ts`.

## Cron

`wrangler.toml` registers `0 3 1,15 * *` — 03:00 UTC on the 1st and 15th
(roughly fortnightly). The scheduled handler calls `reapOrphans()`, which walks
`DEVICES` and drops device records whose LS instance LS *affirmatively* reports
as no longer valid (a network blip never reaps).

Manual trigger (only works when `CLEANUP_TOKEN` is set):

```bash
curl -X POST https://rw-license.realmwright.workers.dev/api/license/cleanup-orphans \
  -H "X-Cleanup-Token: <CLEANUP_TOKEN>"
```

## Tests

Pure decision logic is exercised by Node's built-in test runner against the real
adapter code (the store APIs are mocked via a fake `fetch`/KV; the actual
`demo.ts` / `itch.ts` / `license.ts` functions run). See `test/`:

```bash
npm test
```

Covered: each adapter's verify decision (valid / invalid / store-500 → "try
again", **never** revoke); per-visitor demo cap decrements and refuses at the
limit, and **persists across a day boundary** (not a nightly reset);
`productMismatch` rejects a wrong-product key; Turnstile is verified **before**
any OpenRouter spend; demo quota is **not** consumed on an OpenRouter failure;
an unexpected KV throw in the demo path degrades gracefully instead of
crashing uncaught.

## Local dev

```bash
cp .dev.vars.example .dev.vars   # fill in real values (gitignored)
npx wrangler dev                 # http://127.0.0.1:8787
```

Point the frontend's `WORKER_URL` at the local Worker for end-to-end testing.
Don't commit that change.

## Files

- `src/index.ts` — router + origin guard + cron
- `src/license.ts` — Lemon Squeezy proxy, product/store paywall, device tokens, orphan reaper
- `src/itch.ts` — itch.io verify + device-token minting
- `src/demo.ts` — free-demo OpenRouter proxy (Turnstile, caps, forced model)
- `src/fingerprint.ts` — opaque device-token issuance
- `src/cors.ts` — CORS allowlist helpers
- `src/ratelimit.ts` — per-IP KV-backed limiter
- `test/` — Node test harness (mocked store APIs)
- `wrangler.toml` — Worker config + var/secret manifest
- `.dev.vars.example` — local-dev secret template (no real values)
- `tsconfig.json` / `package.json` — TS + wrangler dev deps
