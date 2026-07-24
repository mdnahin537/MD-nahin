# RealmWright Recovery State

**Last updated:** 2026-07-25

This is the durable handoff for every future session. Read it before changing RealmWright and update it after every verified decision, fix, test, or blocker.

## Canonical work location

- Repository: `mdnahin537/MD-nahin`
- Recovery branch: `agent/realmwright-recovery-2026-07-24`
- Draft recovery PR: `#13`
- PR base: `claude/realmwright-pivot`
- Recovery branch origin: `90c9a2f4235e38c4c50229ab160579a72ff65931`
- Pre-demo backup: `backup/realmwright-pr13-2026-07-24-1930`
- Post-demo verified backup: `backup/realmwright-pr13-demo-verified-2026-07-24`
- Numeric-hardening verified backup: `backup/realmwright-pr13-numeric-verified-2026-07-25`
- Numeric-complete verified backup: `backup/realmwright-pr13-numeric-complete-2026-07-25`
- Malformed-device-bucket verified backup: `backup/realmwright-pr13-device-bucket-verified-2026-07-25`
- Never modify `main` or `claude/realmwright-pivot` directly.
- Never force-push.
- Keep PR #13 draft and unmerged until browser, deployment, live-auth, and live-demo gates pass.

## Backup and recovery points

- The recovery branch retains every isolated commit and is never force-pushed.
- `backup/realmwright-pr13-2026-07-24-1930` preserves the verified license-core state before reviewable demo changes.
- `backup/realmwright-pr13-demo-verified-2026-07-24` preserves the branch after the five-use reviewable demo passed browser and CI validation.
- `backup/realmwright-pr13-numeric-verified-2026-07-25` preserves the initial strict numeric configuration state at 37 Worker tests.
- `backup/realmwright-pr13-numeric-complete-2026-07-25` preserves the complete no-raw-`parseInt` Worker state at 38 tests, including itch.io cookie TTL handling.
- `backup/realmwright-pr13-device-bucket-verified-2026-07-25` preserves the fail-closed malformed-device-bucket state at 41 tests.
- Current committed frontend SHA-256: `50cafda48d3265577a8ec685e5f5e5b96635b27abbb2a81c60fbd20772fc2ca6`; Git blob SHA: `ad08b1ff9148dea35119c6ff86baa7304230fbb4`.
- Recovery CI artifacts retain the exact HTML, recovery state, Worker source/tests, package lock, TypeScript config, and Wrangler manifest for seven days per run.
- Restoring does not require reconstructing edits: any backup branch can be compared, checked out, or used to create a new recovery branch without altering PR #13 or `main`.

## Locked product behavior

- Product: RealmWright GM, intended for Cloudflare Pages.
- Paid unlock: one-time $23 product key from itch.io or Lemon Squeezy.
- Unlicensed capacity: 1 world, 8 NPCs, 6 locations, 3 factions, 10 chronicle entries.
- Unlicensed visitors receive exactly 5 one-time hosted AI uses, enforced server-side.
- Those five demo uses may propose world-changing actions, but every existing review/approval safeguard remains mandatory.
- The full Copilot interface is paid-only and must remain hidden and functionally blocked until `LicenseGate.isActive()` is true.
- `Free by NVIDIA`, OpenRouter connection/manual-key/model controls, Ollama, write scope, auto-apply, and advanced Copilot settings are paid-only.
- After a valid product key activates, all paid Copilot/provider controls must unlock immediately.
- After the fifth successful demo use, the demo AI surface must gate and show the product-key path.
- Network/provider failures, invalid or empty output, token-limit truncation, failed quota reservations, malformed configuration, corrupt counters, or corrupt device state must never grant extra free model spend or paid device slots.
- User world data remains locally owned. Google Drive sync is planned but not proven complete.

## Owner instructions and authorization

1. Make the five demo AI uses actually work, including reviewable world changes.
2. Keep the paid Copilot and `Free by NVIDIA` inaccessible before activation.
3. Confirm that OpenRouter PKCE automatically receives and stores the user-controlled API key without manual copy/paste.
4. The owner authorizes live testing through the intended deployed demo API and chosen free NVIDIA model when a real deployment is available.
5. Never print, log, expose, or commit real product keys, API keys, device tokens, or deployment secrets.
6. Keep all work reversible and inspectable through PR #13 commits, CI, browser tests, and this file.

## Completed recovery commits

### Demo quota integrity and review flow

- `b957691b40f253ec498109ebfaffe983bbf1a706` — compensates completed Cloudflare KV reservations when a later reservation fails.
- `eed7492558d2f1884b71fabb657e71ae809d529a` — regression coverage for partial reservation failure.
- `1a96d8260867e67efc0a7b9b72785a92ba955575` — refunds empty and token-limit-truncated HTTP-200 model responses.
- `5bd7b6b18d200b05941634578b57fa23941dedb1` — gives the five-use front-door demo bounded active-realm context, parses optional `[CANON]` proposals, removes raw control syntax from the visible answer, clamps each response to three review candidates, and opens the existing accept/reject canon-review modal. Nothing auto-applies; without an active realm, no proposals are offered.

### Worker configuration and counter integrity

- `15b9b0725af7546e9ba0a1e790cd0509cf9b729d` — replaces raw money/security-path numeric parsing with strict bounded configuration and fail-closed persisted-counter parsing. It locks demo uses to at most five, bounds global spend and output tokens, keeps the paid device cap at at most three, bounds TTLs/throttles, and rejects corrupt demo/rate-limit counters instead of silently reopening quotas.
- `92e65f1f0cd4b5aaa784b35fcb96404c22f1626f` — routes itch.io device-cookie TTL through the same bounded helper and removes the final executable raw `parseInt` from Worker source.

### Device-bucket integrity

- `e43d4debffc6cd8d0406e8f90cf3990d1f899b60` — validates existing device buckets before upstream Lemon Squeezy activation, blocks itch.io token issuance when existing state is malformed, and makes orphan cleanup preserve corrupt evidence instead of deleting it and reopening all paid device slots.

### Recovery infrastructure

- `d2d33d8a98d3b6920d81e635b97bb596d762cb29` — added this durable handoff.
- `3940583e580d131a829c84b6120038131f6b0287` — added branch-only CI and exact-source artifacts.

### Paid Copilot/provider gate

- `d41d004160a0ca41d2bfb2c947ee96133f1f0e8a` — hides and functionally blocks all paid provider setup while unlicensed; initializes license state before PKCE callback exchange; refreshes paid UI immediately after activation.

### License state and device lifecycle

- `572bf251bfff6c8758271ccc70506c5f3666b8c1` — makes activation, validation, and deactivation durable-state transitions atomic. Live unlock/lock state publishes only after IndexedDB commits.
- `4d69e229f2d757dc86f20f3e9808a1e6dabb6ae1` — reuses a valid Lemon Squeezy instance on an already-known device instead of consuming another slot; fails safely during validation outage; replaces only an explicitly dead instance.
- `47738c3822f937cb10f99f360f42ceccd5ee0fa3` — removes full product keys from queue warning/error logs; logs non-secret metadata only.
- `a38774a4407c25a21aeeaaed63c635a237fe4c18` — preserves the server-issued device token until deactivation or queued cleanup completes, allowing the Worker to revoke the exact device binding.
- `0cff32b92ab93d5f404bf69117f42ba7d6cd62ad` — accepts deactivation only when the Worker explicitly returns `deactivated:true`; distinguishes success, retryable failure, and terminal rejection.
- `054dca70f70eb062f41a129eabb4e164260bdaa6` — moves queued cleanup from `localStorage` to IndexedDB, migrates legacy entries only after an IDB commit, reports queue-write failure, preserves queued work after drain-write failure, and restores the local license when neither remote cleanup nor durable retry can be secured.

## Validation evidence

### Authoritative GitHub Actions

- Complete Worker suite currently passes with **41 tests**.
- Worker TypeScript typecheck passes after `npm ci`.
- Atomic state run: `30118313695` — success.
- Same-device idempotency run: `30118644200` — success.
- License-log privacy run: `30118948226` — success.
- Device-token continuity run: `30119242029` — success.
- Deactivation-response semantics run: `30119469596` — success.
- IndexedDB license-queue run: `30120322319` — success.
- Read-only cleanup verification run: `30120399223` — success.
- Reviewable five-use demo run: `30120868386` — success. An earlier run failed only because a shell `grep` used double quotes around JavaScript `${...}`; no product commit was produced from that failed run.
- Numeric configuration hardening run: `30121545862` — success. Exact pre/post file hashes, decoded patch hash, all 37 tests, TypeScript, and exact six-file scope passed before commit.
- Post-numeric cleanup run: `30121600449` — success.
- Itch TTL completion run: `30121777286` — success; 38 tests, TypeScript, no-executable-raw-parser scan, and exact two-file scope passed.
- Post-itch cleanup run: `30121826279` — success.
- Malformed-device-bucket hardening run: `30122106618` — success; exact patch/file hashes, all 41 tests, TypeScript, and exact three-file scope passed.
- Post-device-bucket cleanup run: `30122196072` — success.
- A malformed temporary numeric staging-file encoding was detected before its guarded run. CI decoded it to the exact locally replayed patch and verified SHA-256 before application; the temporary files were deleted after the verified commit.
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
- Legacy localStorage cleanup entries migrate to IndexedDB and are removed only after the IDB commit.
- New cleanup entries are stored in IndexedDB, not localStorage.
- Queue-write failure is returned instead of swallowed.
- If remote deactivation is retryable but the retry cannot be stored, the active local license and token are restored.
- A failed drain-result write preserves the previous queue and token.
- A successful drain clears the queue and token.
- A successful hosted demo answer hides raw `[CANON]` syntax and presents bounded proposals through the existing review modal.
- Accepting selected demo proposals applied a test NPC and hook only after explicit review.
- Five successful demo requests consumed exactly five uses; the sixth was blocked without contacting the model.
- Demo errors consumed zero uses.
- Without an active realm, the demo offered realm creation and could not apply hidden changes.
- Model output is clamped to at most three review candidates and eight parse warnings per use.

### Worker security/configuration regression validation

Passed:

- Invalid per-visitor configuration falls back to the locked five-use ceiling.
- An oversized global demo limit falls back to the bounded default.
- A corrupt demo KV counter fails closed with no OpenRouter call.
- Oversized `DEMO_MAX_TOKENS` cannot raise owner spend above the safe default.
- Invalid device-cap configuration cannot create a fourth paid slot.
- Invalid device TTL uses the safe 90-day default.
- Invalid itch.io device TTL uses the same safe cookie lifetime.
- Invalid request-rate configuration cannot disable throttling.
- A corrupt request-rate counter fails closed and is not overwritten as a fresh zero.
- No executable raw `parseInt` remains in Worker source; only explanatory comments mention it.
- Malformed existing Lemon Squeezy device state blocks before any upstream activation.
- A valid itch.io key cannot overwrite a malformed existing device bucket or obtain a token.
- Orphan cleanup preserves malformed state instead of deleting it and reopening device slots.

### Current exact frontend state

- Current committed `realmwright-v7.html` SHA-256: `50cafda48d3265577a8ec685e5f5e5b96635b27abbb2a81c60fbd20772fc2ca6`.
- All three real inline JavaScript blocks pass syntax validation.
- No production deployment has been performed from PR #13.

## Demo AI status

Code-level behavior is complete:

- Five hosted uses live in the front-door demo path through `Demo.proxyRequest`.
- The paid Copilot interface remains hidden and functionally blocked.
- Each successful answer may propose bounded, reviewable world changes through the existing canon approval modal.
- Nothing auto-applies, the sixth use is blocked, and failed generations do not consume quota.
- Invalid numeric configuration, corrupt quota counters, and malformed device data cannot silently expand free allowance, owner spend, or paid device capacity.

Deployment blockers in the repository snapshot:

- `TURNSTILE_SITEKEY` is empty in the committed HTML.
- Worker `ALLOWED_ORIGINS`, KV namespace IDs, store/product IDs, itch game ID, and `DEMO_MODEL` still contain placeholders.
- Historical ship documentation explicitly says the Worker had not yet been deployed; `https://rw-license.realmwright.workers.dev` is a configured target, not proof of a live service.
- A direct probe of the configured Worker hostname was attempted, but external DNS resolution is unavailable in the execution environment. This is not evidence that the Worker is online or offline.
- Public search did not reveal a deployed matching RealmWright Pages origin or committed public Turnstile site key. The actual Cloudflare dashboard/non-secret deployment values remain necessary for live testing.

## Free by NVIDIA / OpenRouter status

Confirmed:

- The Settings entry and all provider controls are paid-gated visually and functionally.
- The code implements OpenRouter PKCE `/auth` → callback `?code=` → `/api/v1/auth/keys` exchange.
- Deterministic browser tests confirm automatic key capture into the secret store and exclusion from ordinary backups.
- On 2026-07-25, OpenRouter's official model page and free-model catalog listed `nvidia/nemotron-3-ultra-550b-a55b:free` as a text model with tool support at $0/M input and $0/M output. The app's fallback and live-catalog selector resolve to this slug.
- The app resolves the newest free NVIDIA chat model from OpenRouter's live catalog first; the static slug is only the offline/empty-catalog fallback.

Still unproven:

- One real user authorization against the final deployed callback origin.
- One real request through the selected currently-free NVIDIA model.
- Live fallback when that model is removed, renamed, rate-limited, or ceases to be free.

## Remaining license and launch audit items

- Full end-to-end validation against a real Lemon Squeezy test product remains outstanding: activate, reload/background validate, same-device reactivation, second/third device, fourth-device rejection, deactivate, and recovered slot.
- A true browser-storage exhaustion scenario should still be manually exercised on the final deployed origin; deterministic failure injection is passing.
- Request/input limits remain to be audited: unbounded license/itch keys and instance IDs, unbounded JSON/form bodies, and demo prompt length measured as JavaScript code units instead of UTF-8 bytes.

## Immediate next actions

1. Add conservative, tested request/input bounds without changing valid customer behavior; start with product-key/instance-ID lengths and UTF-8 demo prompt measurement.
2. Obtain the actual Cloudflare Pages origin and public Turnstile site key, and confirm deployed Worker/non-secret configuration from the Cloudflare dashboard. Do not request or expose Worker secrets.
3. Run a real hosted demo request through the deployed Worker, verify a reviewable `[CANON]` proposal, and confirm the server-reported remaining count.
4. Perform one real licensed OpenRouter authorization and free-NVIDIA generation on the final callback origin.
5. Run the complete license device-cap matrix against Lemon Squeezy test mode.
6. Keep all five backup branches intact and update this file and PR #13 after every verified change.

## Safety rules

- Never delete or migrate user-world data without a restore test.
- Never commit real keys, tokens, store secrets, or private deployment values.
- Never replace the large HTML from an incomplete or truncated copy.
- Preserve exact pre-change checksums and inspect final diffs.
- Preserve all confirmation/review steps for AI-proposed world mutations.
- Do not commit a browser-failing candidate.
- Do not merge or deploy while placeholders or live-validation blockers remain.
