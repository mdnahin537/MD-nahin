# RealmWright Recovery State

**Last updated:** 2026-07-24

This is the durable handoff for every future session. Read it before changing RealmWright and update it after every verified decision, fix, test, or blocker.

## Canonical work location

- Repository: `mdnahin537/MD-nahin`
- Recovery branch: `agent/realmwright-recovery-2026-07-24`
- Draft recovery PR: `#13`
- PR base: `claude/realmwright-pivot`
- Recovery branch origin commit: `90c9a2f4235e38c4c50229ab160579a72ff65931`
- Never modify `main` or `claude/realmwright-pivot` directly.
- Never force-push.
- Keep PR #13 draft until Worker CI, browser validation, deployment configuration, and live auth/model checks pass.

## Latest locked product behavior

- Product: RealmWright GM, hosted on Cloudflare Pages.
- Paid unlock: one-time $23 key from itch.io or Lemon Squeezy.
- Unlicensed capacity: 1 world, 8 NPCs, 6 locations, 3 factions, 10 chronicle entries.
- Unlicensed visitors receive exactly 5 one-time hosted AI uses, enforced server-side.
- Those 5 demo uses may propose world-changing actions, but every existing review/approval safeguard remains mandatory.
- The **full Copilot interface is paid-only** and must remain hidden/locked until `LicenseGate.isActive()` is true.
- `Free by NVIDIA`, OpenRouter connect, manual OpenRouter key/model controls, Ollama controls, and all paid Copilot settings are also hidden/blocked until the license is active.
- After a valid product key activates, the complete Copilot and `Free by NVIDIA` path must unlock immediately and accurately.
- After the fifth successful demo AI use, the demo AI surface is gated and shows the product-key unlock route.
- Network/provider errors, invalid responses, empty responses, token-limit truncation, or failed quota reservations must not consume a demo use.
- User world data remains local/owned by the user. Google Drive sync is planned but not proven complete.

## Owner instructions and authorization

1. The 5 demo AI uses must actually work and must support reviewable world changes.
2. Do not expose the paid Copilot panel to unlicensed users.
3. `Free by NVIDIA` must be inaccessible before license activation and available after activation.
4. Confirm by code and, where possible, live browser testing that OpenRouter PKCE automatically receives and stores the user-controlled API key without manual copy/paste.
5. The owner authorizes live testing through the already-deployed demo API and chosen free NVIDIA model.
6. Never print, log, expose, download into chat, or commit any real API key or secret.
7. Keep all changes reversible and inspectable through PR #13 commits, diffs, CI, and this file.

## Completed recovery work

### `b957691b40f253ec498109ebfaffe983bbf1a706`

Fixed partial Cloudflare KV quota reservation rollback. If one counter writes and the next write fails, completed reservations are compensated.

### `eed7492558d2f1884b71fabb657e71ae809d529a`

Added regression coverage for partial quota reservation failure.

### `d2d33d8a98d3b6920d81e635b97bb596d762cb29`

Added the durable recovery handoff.

### `3940583e580d131a829c84b6120038131f6b0287`

Added branch-only GitHub Actions validation and exact-source artifact creation. It does not deploy or modify production branches.

### `d02a9dbcb10b8bacf36b0b11f94929d69c3ffb20`

Recorded the earlier five-use design decision. This decision is now superseded only in where the five uses appear: they remain world-changing, but the paid Copilot UI stays license-gated.

### `1a96d8260867e67efc0a7b9b72785a92ba955575`

Refunds empty or token-limit-truncated HTTP-200 model responses. Added regression tests. The guarded workflow ran the complete Worker tests and typecheck before committing.

### `d41d004160a0ca41d2bfb2c947ee96133f1f0e8a`

Enforced the paid license gate on every Copilot provider-setup path. `Free by NVIDIA`, OpenRouter PKCE/manual-key/model controls, Ollama, write-scope, and auto-apply are visually hidden and functionally rejected while unlicensed. License initialization now precedes PKCE callback exchange, and successful activation refreshes the Settings/Copilot UI immediately.

## Validation status

- Worker `npm ci`: passed in GitHub Actions.
- Complete Worker test suite: passed.
- Worker TypeScript typecheck: passed.
- Exact source artifact was produced and downloaded for local audited work.
- PR #13 remains open, draft, and unmerged.
- Deterministic browser validation passed for: unlicensed provider controls hidden/blocked; crafted unlicensed PKCE callback rejected; successful product-key activation immediately revealing the paid controls; licensed PKCE callback automatically storing the returned OpenRouter key in the dedicated secret IDB key and excluding it from the normal state blob.
- Browser-level validation of the complete five-use demo and one real external OpenRouter authorization remains incomplete.
- No production deployment has been performed from PR #13.

## Confirmed cause of the current demo failure

- The five hosted uses exist in `FrontDoor._handleGenerate()` through `Demo.proxyRequest`.
- Normal Copilot is intentionally license-gated by `Copilot.isConfigured()`.
- Repository deployment placeholders remain unresolved:
  - `TURNSTILE_SITEKEY` is empty in the committed HTML;
  - Worker `ALLOWED_ORIGINS`, KV IDs, store/product IDs, itch game ID, and `DEMO_MODEL` are placeholders in `wrangler.toml`.
- Therefore the repository snapshot alone cannot run a real demo request. A live test is possible only if the already-deployed Worker and hosted page have real values outside this branch.

## Superseded local HTML candidate — DO NOT COMMIT

A local candidate placed the five hosted uses directly inside normal Copilot. It is now rejected because the latest owner instruction requires the entire Copilot interface to remain paid-only.

- Original exact HTML SHA-256: `5362c5c1fe1a48eb8c799b1b9bd27fd01c9b84e193168b116cb01d19c71afcee`
- The candidate is preserved only as investigation evidence.
- No candidate HTML change has been pushed to PR #13.

## Free by NVIDIA findings

### Confirmed from current official OpenRouter documentation

- OpenRouter supports one-click PKCE via `/auth` with `callback_url`, `code_challenge`, and `code_challenge_method=S256`.
- The callback receives `?code=...`.
- The browser exchanges the code at `POST https://openrouter.ai/api/v1/auth/keys` using the matching verifier and receives a user-controlled API key.
- OpenRouter currently offers free models and a free router; free-model availability can change and has rate/availability limits.
- A current free NVIDIA option exists in OpenRouter's free collection, but the app must verify live catalog pricing before selecting it.

### Still unproven

- RealmWright's exact callback implementation successfully completes a real user authorization.
- The returned key is stored only in the intended local secret store and excluded from export/backup paths.
- License activation correctly hides/reveals every Copilot and provider-control entry point.
- A real free NVIDIA request completes from the licensed RealmWright flow.

## Current license-core audit

### Confirmed client atomicity defect

- `_activateLS()` and `_activateItchio()` assign `LicenseGate._data` before `IDB.set(IDB_KEY_LICENSE, ...)` succeeds. If IndexedDB rejects, activation returns an error but `LicenseGate.isActive()` remains true for the current session.
- `_backgroundValidate()` mutates the existing in-memory object before durable persistence. A failed IDB write can make runtime and stored validity disagree.
- `deactivate()` clears the live license before the durable delete succeeds. A storage failure can lock the current session while the old license silently returns after reload.
- Required correction: persist a cloned next state first, publish it to `_data` only after success, and emit UI events only after the durable transition commits.

### Confirmed repeated-activation risk

- The client still sends a new `instance_name` on every Lemon Squeezy activation.
- The Worker calls Lemon Squeezy `/activate` before checking whether the presented device token already maps to an existing instance. A repeated activation on the same device can therefore create a fresh LS instance and replace the stored instance ID without deactivating the old one.
- This needs a separate Worker idempotency fix and regression test after the client atomicity fix.

### Logging/privacy finding

- `LicenseQueue.push()` and the final give-up log currently print the queued object, including the full product license key, to DevTools. Logs must be changed to non-secret metadata only.

## Immediate next actions

1. Make activate, background validate, and deactivate atomic with respect to IndexedDB; add deterministic failure-path browser tests.
2. Stop logging full product license keys from the retry queue.
3. Make repeated Lemon Squeezy activation idempotent for an already-known device and instance; add Worker regression tests.
4. Audit queue draining, explicit revocation/recovery events, device-token persistence, and same-device reactivation end to end.
5. Expand the demo-specific surface to support reviewable world-change proposals for all five uses.
6. Find the actual deployed Pages URL and Turnstile site key, if they exist, without exposing secrets; then run a real demo-model response test through the Worker.
7. Perform one real licensed OpenRouter authorization only when the callback origin is real and testable.
8. Browser-test the complete license and demo matrices, then audit and commit each exact diff only through PR #13.

## Safety rules

- Never delete user-world data or alter storage keys without a migration and restore test.
- Never commit API keys, Turnstile secrets, store secrets, or real product keys.
- Never replace the 29k-line HTML from an incomplete or truncated copy.
- Preserve exact pre-change checksums and inspect final diffs.
- Preserve every existing confirmation/review step for AI-proposed world mutations.
- Do not commit a browser-failing candidate.
- Do not merge or deploy while placeholders or live-validation blockers remain.
