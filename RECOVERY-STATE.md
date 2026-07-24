# RealmWright Recovery State

**Last updated:** 2026-07-24

This is the durable handoff for every future session. Read it before changing RealmWright and update it after every verified decision, fix, test, or blocker.

## Canonical work location

- Repository: `mdnahin537/MD-nahin`
- Recovery branch: `agent/realmwright-recovery-2026-07-24`
- Draft recovery PR: `#13`
- PR base: `claude/realmwright-pivot`
- Recovery branch origin: `90c9a2f4235e38c4c50229ab160579a72ff65931`
- Never modify `main` or `claude/realmwright-pivot` directly.
- Never force-push.
- Keep PR #13 draft and unmerged until browser, deployment, live-auth, and live-demo gates pass.

## Locked product behavior

- Product: RealmWright GM, hosted on Cloudflare Pages.
- Paid unlock: one-time $23 product key from itch.io or Lemon Squeezy.
- Unlicensed capacity: 1 world, 8 NPCs, 6 locations, 3 factions, 10 chronicle entries.
- Unlicensed visitors receive exactly 5 one-time hosted AI uses, enforced server-side.
- Those five demo uses may propose world-changing actions, but every existing review/approval safeguard remains mandatory.
- The full Copilot interface is paid-only and must remain hidden and functionally blocked until `LicenseGate.isActive()` is true.
- `Free by NVIDIA`, OpenRouter connection/manual key/model controls, Ollama, write scope, auto-apply, and advanced Copilot settings are paid-only.
- After a valid product key activates, all paid Copilot/provider controls must unlock immediately.
- After the fifth successful demo use, the demo AI surface must gate and show the product-key path.
- Network/provider failures, invalid or empty output, token-limit truncation, and failed quota reservations must not consume a demo use.
- User world data remains locally owned. Google Drive sync is planned but not proven complete.

## Owner instructions and authorization

1. Make the five demo AI uses actually work, including reviewable world changes.
2. Keep the paid Copilot and `Free by NVIDIA` inaccessible before activation.
3. Confirm that OpenRouter PKCE automatically receives and stores the user-controlled API key without manual copy/paste.
4. The owner authorizes live testing through the already-deployed demo API and chosen free NVIDIA model.
5. Never print, log, expose, or commit real product keys, API keys, device tokens, or deployment secrets.
6. Keep all work reversible and inspectable through PR #13 commits, CI, browser tests, and this file.

## Completed recovery commits

### Demo quota integrity

- `b957691b40f253ec498109ebfaffe983bbf1a706` — compensates completed Cloudflare KV reservations when a later reservation fails.
- `eed7492558d2f1884b71fabb657e71ae809d529a` — regression test for partial reservation failure.
- `1a96d8260867e67efc0a7b9b72785a92ba955575` — refunds empty and token-limit-truncated HTTP-200 model responses.

### Recovery infrastructure

- `d2d33d8a98d3b6920d81e635b97bb596d762cb29` — added this durable handoff.
- `3940583e580d131a829c84b6120038131f6b0287` — added branch-only CI and exact-source artifacts.

### Paid Copilot/provider gate

- `d41d004160a0ca41d2bfb2c947ee96133f1f0e8a` — hides and functionally blocks all paid provider setup while unlicensed; loads license state before PKCE callback exchange; refreshes paid UI immediately after activation.

### License state and device lifecycle

- `572bf251bfff6c8758271ccc70506c5f3666b8c1` — makes activation, validation, and deactivation durable-state transitions atomic. Live unlock/lock state publishes only after IndexedDB commits.
- `4d69e229f2d757dc86f20f3e9808a1e6dabb6ae1` — reuses a valid Lemon Squeezy instance on an already-known device instead of consuming another activation slot; fails safely during validation outage; replaces only an explicitly dead instance.
- `47738c3822f937cb10f99f360f42ceccd5ee0fa3` — removes full product keys from queue warning/error logs; logs non-secret metadata only.
- `a38774a4407c25a21aeeaaed63c635a237fe4c18` — preserves the server-issued device token until deactivation or queued cleanup completes, ensuring the Worker can revoke the exact device binding.
- `0cff32b92ab93d5f404bf69117f42ba7d6cd62ad` — treats deactivation as successful only when the Worker explicitly returns `deactivated:true`; distinguishes `success`, retryable failure, and terminal rejection.

## Validation evidence

### Authoritative GitHub Actions

- Complete Worker suite currently passes with 29 tests.
- Worker TypeScript typecheck passes after `npm ci`.
- Atomic state run: `30118313695` — success.
- Same-device idempotency run: `30118644200` — success.
- License-log privacy run: `30118948226` — success.
- Device-token continuity run: `30119242029` — success.
- Deactivation-response semantics run: `30119469596` — success.
- Recovery CI is restored to read-only after every guarded commit.

### Deterministic browser validation

Passed:

- Unlicensed provider controls are hidden and scripted access is rejected.
- Crafted unlicensed PKCE callback performs no key exchange.
- Successful product-key activation immediately reveals paid controls.
- Licensed mocked PKCE callback automatically stores the returned OpenRouter key in the dedicated secret IndexedDB record and excludes it from the normal state blob.
- Failed activation persistence never produces a false live unlock.
- Failed validation persistence never changes live validity.
- Failed local deactivation persistence keeps the license active and makes no server request.
- Successful deactivation keeps `X-Device-Token` available for the Worker, then clears it.
- Failed remote deactivation queues cleanup and retains the token.
- Startup drain sends the retained token and clears it after success.
- Full product keys never appear in retry-queue console logs.
- HTTP 200 with `deactivated:false` is terminal, not success.
- Malformed 2xx deactivation output remains retryable.
- Transient failure followed by `deactivated:true` succeeds.

### Current exact frontend state

- Current committed `realmwright-v7.html` SHA-256: `efb12c7c3df61abb652d1c5ff9858b5ecfe2c12b467dab677355c1721ee29f0f`.
- All three real inline JavaScript blocks pass syntax validation.
- No production deployment has been performed from PR #13.

## Demo AI status

Confirmed architecture:

- Five hosted uses currently live in the front-door demo path through `Demo.proxyRequest`.
- Normal Copilot remains intentionally paid-only.
- The existing demo path is not yet the required complete world-changing five-use experience.

Deployment blockers in the repository snapshot:

- `TURNSTILE_SITEKEY` is empty in the committed HTML.
- Worker `ALLOWED_ORIGINS`, KV namespace IDs, store/product IDs, itch game ID, and `DEMO_MODEL` still contain placeholders.
- Therefore the repository snapshot cannot execute a real hosted demo call without external deployment configuration.

## Free by NVIDIA / OpenRouter status

Confirmed:

- The Settings entry and all provider controls are paid-gated visually and functionally.
- The code implements OpenRouter PKCE `/auth` → callback `?code=` → `/api/v1/auth/keys` exchange.
- Deterministic browser tests confirm automatic key capture into the secret store and exclusion from ordinary backups.

Still unproven:

- One real user authorization against the final deployed callback origin.
- One real request through the selected currently-free NVIDIA model.
- Live fallback when that model is removed, renamed, rate-limited, or ceases to be free.

## Remaining license audit items

- The queued deactivation payload is still persisted in `localStorage`, including the product key and instance ID. It is no longer logged, but moving the queue to IndexedDB would reduce exposure and provide explicit write-failure handling.
- `LicenseQueue._write()` currently swallows storage failures; a failed queue write can silently lose the remote cleanup operation.
- Full end-to-end validation against a real Lemon Squeezy test product remains outstanding: activate, reload/background validate, same-device reactivation, second/third device, fourth-device rejection, deactivate, and recovered slot.

## Immediate next actions

1. Harden queue persistence: remove the cleanup payload from `localStorage`, use durable IndexedDB storage, and surface queue-write failure honestly.
2. Expand the demo-specific surface into five full, reviewable world-changing AI uses while keeping paid Copilot hidden.
3. Obtain/confirm the actual Pages origin and public Turnstile site key without exposing secrets, then run a real hosted demo-model request.
4. Perform one real licensed OpenRouter authorization and free-NVIDIA generation on the final callback origin.
5. Run the complete license device-cap matrix against Lemon Squeezy test mode.
6. Update this file and PR #13 after every verified change.

## Safety rules

- Never delete or migrate user-world data without a restore test.
- Never commit real keys, tokens, store secrets, or private deployment values.
- Never replace the large HTML from an incomplete or truncated copy.
- Preserve exact pre-change checksums and inspect final diffs.
- Preserve all confirmation/review steps for AI-proposed world mutations.
- Do not commit a browser-failing candidate.
- Do not merge or deploy while placeholders or live-validation blockers remain.
