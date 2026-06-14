# rw-license Worker

Cloudflare Worker that fronts the Lemon Squeezy license API for RealmWright. Eliminates the third-party `api-cors-anywhere` proxy, layers per-IP rate limiting, and binds an opaque server-issued `device_token` to each license so the 3-device cap can't be bypassed by tweaking client-side fingerprints.

## What it does

| Route | Purpose |
|---|---|
| `POST /api/license/activate` | Activates with LS, mints/refreshes a `device_token`, enforces 3-device cap server-side. Sets `rw_device` cookie + echoes token in JSON body. |
| `POST /api/license/validate` | Validates with LS, refreshes `last_seen_at` for the device token. |
| `POST /api/license/deactivate` | Deactivates with LS, revokes the device token, clears the cookie. |
| `POST /api/license/cleanup-orphans` | Cron-driven (fortnightly) + manual orphan reaper. Drops device records whose LS instance is gone. |
| `POST /verify` | itch.io key verify (stub — see `src/itch.ts`). |
| `POST /api/demo/generate` | Free-demo OpenRouter proxy (stub — see `src/demo.ts`). |

`/verify` and `/api/demo/generate` are intentionally stubs in this build. The legacy Worker (Phase 5A) already serves these in production; Phase 1a does not rewrite them. Migrate when ready.

## Deploy — first time

```bash
cd worker
npm install

# Create KV namespaces
npx wrangler kv:namespace create DEVICES
npx wrangler kv:namespace create RATELIMIT
# Paste both IDs into wrangler.toml under [[kv_namespaces]]

# Optional: shared secret for manual cleanup-orphans calls
npx wrangler secret put CLEANUP_TOKEN

# Deploy
npx wrangler deploy
```

The Worker is currently configured for the production hostname `rw-license.realmwright.workers.dev`. Adjust `name` in `wrangler.toml` if Hunter renames the Worker.

## Configuration

All non-secret config lives in `wrangler.toml` under `[vars]`:

| Var | Default | Purpose |
|---|---|---|
| `ALLOWED_ORIGINS` | `https://realmwright.app,...` | Comma-separated CORS allowlist. `Origin: null` (file://) is also allowed unconditionally — itch.io desktop bundles need it. **Tighten before public ship.** |
| `DEVICE_CAP` | `3` | Max concurrent device tokens per license. |
| `DEVICE_TTL_SECONDS` | `7776000` (90 days) | Token lifetime, refreshed on every touch. |
| `RATE_LIMIT_PER_MIN` | `30` | Per-IP per-minute cap on license endpoints. |

Secrets (set via `wrangler secret put`):

| Secret | Required | Purpose |
|---|---|---|
| `CLEANUP_TOKEN` | Optional | If set, `POST /api/license/cleanup-orphans` requires header `X-Cleanup-Token: <value>`. Cron path bypasses this check. |

The Lemon Squeezy license API does **not** require an API key — its license endpoints are public license-holder-facing routes. No `LEMONSQUEEZY_API_KEY` is needed for license activate/validate/deactivate.

## Cron

`wrangler.toml` registers `0 3 1,15 * *` — runs at 03:00 UTC on the 1st and 15th of each month (roughly fortnightly). The scheduled handler calls `reapOrphans()`, which walks the `DEVICES` KV namespace and drops device records whose LS instance is no longer valid.

To trigger manually for testing:

```bash
curl -X POST https://rw-license.realmwright.workers.dev/api/license/cleanup-orphans \
  -H "X-Cleanup-Token: <CLEANUP_TOKEN>"
```

## Local dev

```bash
npx wrangler dev
# Worker runs at http://127.0.0.1:8787
```

The frontend's `WORKER_URL` constant (`src/index.html` line 3611) must point at the local Worker for end-to-end testing. Don't commit that change.

## Files

- `src/index.ts` — router
- `src/license.ts` — LS proxy + orphan reaper
- `src/fingerprint.ts` — opaque device-token issuance
- `src/cors.ts` — CORS helpers
- `src/ratelimit.ts` — per-IP KV-backed limiter
- `src/itch.ts` — itch.io verify stub
- `src/demo.ts` — demo generate stub
- `wrangler.toml` — Worker config
- `tsconfig.json` / `package.json` — TS + wrangler dev deps
