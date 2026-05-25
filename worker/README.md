# rw-license Worker

Cloudflare Worker fronting RealmWright's licensing and free demo. It:

- proxies the Lemon Squeezy license API (no third-party CORS proxy),
- **enforces the paywall** — an LS key only activates if it belongs to this
  product (`store_id` + `product_id` match),
- verifies itch.io download keys server-side with the seller API key,
- runs the free-demo OpenRouter proxy behind Turnstile + per-IP and global
  daily caps.

Device capping is Lemon Squeezy's **native** `activation_limit` (set on the
product), so there are no device tokens, no device KV, and no orphan reaper.
Licensed users call OpenRouter directly with their own key — the Worker only
ever carries demo traffic and infrequent license checks, well under the
free-tier request budget.

## Routes

| Route | Purpose |
|---|---|
| `POST /api/license/activate` | LS activate, then reject if `meta.product_id`/`store_id` ≠ this product (rolls back the slot). |
| `POST /api/license/validate` | LS validate + re-checks product on every call. |
| `POST /api/license/deactivate` | LS deactivate. |
| `POST /verify` | itch.io download-key verification. Body `{ key }` → `{ valid }`. |
| `POST /api/demo/generate` | Turnstile-gated OpenRouter proxy with daily caps. |

## Deploy — first time

```bash
cd worker
npm install

# Create the KV namespace (current syntax — a SPACE, not a colon):
npx wrangler kv namespace create RATELIMIT
# Paste the returned id into wrangler.toml under [[kv_namespaces]].

# Set secrets (never commit these):
npx wrangler secret put OPENROUTER_KEY     # demo spend runs on this
npx wrangler secret put TURNSTILE_SECRET   # pairs with the site key in index.html
npx wrangler secret put ITCH_API_KEY       # itch.io Settings -> API keys
npx wrangler secret put ITCH_GAME_ID       # numeric itch game id

# Fill the [vars] in wrangler.toml: LS_PRODUCT_ID, LS_STORE_ID, DEMO_MODEL.
# The Worker FAILS CLOSED (503) on license routes until LS_PRODUCT_ID and
# LS_STORE_ID are set — an unconfigured paywall must not silently let keys in.

npx wrangler deploy
```

Deploying overwrites whatever is live at `rw-license.realmwright.workers.dev`
— that is now correct, because this build *is* the real implementation. There
are no stub routes left to clobber.

### Finding LS_PRODUCT_ID / LS_STORE_ID

Activate any real key once and read the `meta` block in the JSON response, or
copy them from the Lemon Squeezy dashboard (Products / Store settings).

## Configuration (`[vars]`)

| Var | Default | Purpose |
|---|---|---|
| `ALLOWED_ORIGINS` | `realmwright.app,…` | CORS allowlist. `Origin: null` (file://) is allowed for itch.io desktop bundles. |
| `LS_PRODUCT_ID` | _(blank → 503)_ | The product this Worker guards. Required. |
| `LS_STORE_ID` | _(blank → 503)_ | The store this Worker guards. Required. |
| `DEMO_MODEL` | `anthropic/claude-3.5-haiku` | Exact OpenRouter slug for the demo. **Verify on openrouter.ai/models.** |
| `DEMO_PER_IP_DAILY` | `3` | Free demo generations per IP per day. |
| `DEMO_GLOBAL_DAILY` | `300` | Hard daily ceiling on demo spend; over it, clients are sent to Sample Mode. |
| `DEMO_MAX_TOKENS` | `1200` | Max output tokens per demo call. |
| `RATE_LIMIT_PER_MIN` | `30` | Per-IP per-minute cap on license/verify endpoints. |

## Local dev

```bash
npx wrangler dev   # http://127.0.0.1:8787
```

Point the frontend's `WORKER_URL` (`src/index.html`) at the local Worker for
end-to-end testing. Don't commit that change.

## Files

- `src/index.ts` — router
- `src/license.ts` — LS proxy + product-id paywall
- `src/itch.ts` — itch.io download-key verification
- `src/demo.ts` — Turnstile + OpenRouter demo proxy with daily caps
- `src/cors.ts` — CORS helpers
- `src/ratelimit.ts` — per-IP KV-backed limiter
- `wrangler.toml` / `tsconfig.json` / `package.json` — config + dev deps
