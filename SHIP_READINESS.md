# RealmWright — Ship Readiness Report

**Branch:** `claude/multi-agent-workflow-Tt5Hz` (PR #4)
**Phases verified:** 0, 1a, 1b, 2, 3, 4, 5 (automated)
**Verification harness:** `artifacts/run-verification.sh`
**Generated:** Phase 5 sign-off pass.

---

## Automated verification — results

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | Static secret scan (`sk-or-`, `sk_live`, `API_KEY=`, `password=`) | **PASS** | All 3 hits in `src/index.html` are placeholders or UI strings (input placeholder `sk-or-v1-...` line 3018, validation startsWith check lines 13626-27, password input `type="password"` for the BYO-key UI). Zero hits in `worker/src/*.ts`. |
| 2 | Worker TypeScript check (`tsc --noEmit`) | **PASS** | Compiles clean against `@cloudflare/workers-types` shim. Hunter must run `cd worker && npm install` to install the real package once before deploy — no surprise errors expected. |
| 3a | Playwright — boot without console errors | **PASS** | Zero unfiltered console errors. The CSP `frame-ancestors` "ignored in `<meta>`" browser warning is expected and documented in `src/index.html` lines 13-42; it is defense-in-depth for hosts that DO honor it. Sandbox-only font and Turnstile CDN errors are filtered as environmental. |
| 3b | First-run empty-state CTA (P1.7) | **PASS** | `#empty-state-create-realm` button renders with label `+ Create your first realm`, visible 163×34 px, wired to `Modals.open('new-nation')`. |
| 3c | Nation/faction add → delete; chronicleLinks orphan sweep (NEW-A3) | **PASS** | `State.removeEvent` correctly strips orphaned IDs from `character.chronicleLinks`. No exceptions. |
| 3d | License modal a11y (NEW-B6 / A3-5) | **PASS** | `#modal-license-activate` carries `role="dialog"`, `aria-modal="true"`, `aria-labelledby="la-title"`. |
| 3e | Modal close buttons (A3-4) | **PASS** | All 29 `×` close buttons across all modals carry `aria-label` AND are tab-reachable (none with `tabindex="-1"`). |
| 3f | Mobile 375px `.wms-panels` reflow (#16) | **PASS** | `grid-template-columns` resolves to `1fr` at 375 px viewport. |
| 3g | DOMPurify wrapper — onerror neutralized (P1.12) | **PASS** | `Markdown.render('<img src=x onerror=alert(1)><script>alert(2)</script>')` returns entity-escaped text inside `<p>`. Zero live `<img>`/`<script>` in parsed output, no `onerror` handler attached. |
| 3h | OpenRouter key in IDB, not localStorage (P1.13) | **PASS** | After `Secrets.saveKey('sk-or-v1-PROBE-…')` + `State.persist()`, `localStorage['realmwright_data']` and the legacy `sovereign_codex_data` key contain NO trace of the probe. Key is readable from IDB `rw_secret_copilot_key`. |
| 3i | Config sanity — Worker URL set, CSP present, `api-cors-anywhere` fully removed | **PASS** | `WORKER_URL = https://rw-license.realmwright.workers.dev`. CSP includes `default-src 'self'` and `connect-src` allows the Worker. Zero occurrences of `api-cors-anywhere` anywhere in `src/index.html`. |
| 4 | axe-core a11y scan | **SKIPPED** | `axe-core` not installed; sandbox blocks `npm install`. Hunter: run `npm install --prefix artifacts axe-core` then re-run the suite. Test harness auto-detects the install. |
| 5 | W3C HTML validation | **SKIPPED** | `validator.w3.org` blocked at sandbox proxy. Hunter must run from a network-enabled machine: `npm i -g html-validate && html-validate src/index.html` or upload to https://validator.w3.org/nu/. |

**Score: 9 PASS / 0 FAIL / 2 SKIP (both environmental, not code regressions).**

---

## Ship-blockers found

**None.**

One footgun the test surfaced that is NOT a blocker but Hunter MUST act on before publish:

- **DOMPurify is the FALLBACK stub.** Test 3g returned `purify_version: "fallback"`. The inline sanitizer at `src/index.html` lines 2396-2451 is a DOMParser-based shim. It works (kills the `<img onerror>` payload) but does NOT match the cure53/DOMPurify v3 attack surface. Hunter must paste the official minified DOMPurify build over the fallback block before public release. Instructions are inline at lines 2377-2401.

---

## Hunter-only verification — checklist

The four items below cannot be automated from this sandbox and must be done manually by Hunter before public release.

### [ ] H1. Bug #14 — Slider mouse-drag regression test (Phase 0 commitment)

- Open `src/index.html` in Chrome.
- Get past the front-door / license gate (paste an OpenRouter key, or activate a license).
- Open the workbench / a nation with stats.
- Grab a slider with the mouse and DRAG it (do not click-to-set). Drag continuously across the full range.
- **What good looks like:** the slider value updates smoothly, the linked stat display updates, the workbench panel does NOT flicker/re-render mid-drag, no console errors.
- **What ship-blocking looks like:** workbench re-renders during drag (steals focus, kills the drag); console error from `Render.all()` mid-drag.
- Repeat on a touch device (iPad / phone) for the same slider.

### [ ] H2. itch.io HTML5 upload dry-run

- Create a draft project on itch.io.
- Upload `src/index.html` as an HTML5 game with "This file will be played in the browser" checked.
- Set viewport to 1280×800 minimum.
- Launch the embedded player.
- **What good looks like:** app boots, front-door modal renders, Turnstile widget loads (if site keys are pasted — see pre-deploy checklist), no CSP-frame-ancestors error in the itch.io player. Fonts may fail silently if the iframe blocks them; that is cosmetic only.
- **What ship-blocking looks like:** blank page, mixed-content error, or CSP block preventing the Worker URL from being called.

### [ ] H3. Lemon Squeezy purchase → activate → validate → deactivate flow

- Use a real card on a test product priced low (or LS sandbox mode if available).
- After purchase, copy the license key from the LS email.
- In RealmWright, open License → Activate → paste key.
- **What good looks like:**
  - Activate returns 200 with `valid: true`, sets `rw_device` cookie, shows toast "License activated."
  - Refresh page; on next boot, validate fires in the background, succeeds silently.
  - On a SECOND device (different browser profile), activate the same key. Repeat on third. Try a fourth — expect rejection with "Device cap reached."
  - Deactivate from device 1. Activate from device 4 — should now succeed.
- **What ship-blocking looks like:** silent activation followed by lost license on reload (state not persisting), 500 errors from the Worker, device-cap not enforced server-side (i.e. a 5th device gets through).

### [ ] H4. Cron `cleanup-orphans` is firing

- After Worker deploy, wait for the next scheduled tick (`0 3 1,15 * *` UTC — 1st or 15th of the month at 03:00 UTC). OR trigger manually:
  - `curl -X POST https://rw-license.realmwright.workers.dev/api/license/cleanup-orphans -H "X-Cleanup-Token: <CLEANUP_TOKEN>"`
- Run `wrangler tail` while the cron fires.
- **What good looks like:** log line `[cron] reapOrphans scanned=N reaped=M`.
- **What ship-blocking looks like:** no log, or `reapOrphans failed:` error.

---

## Pre-deploy checklist (consolidated)

Do these in order. Items marked Worker are one-time setup; items marked Frontend are per-publish.

### One-time Worker setup
1. **[ ] Create KV namespaces** (Worker)
   ```bash
   cd worker
   npm install
   npx wrangler kv:namespace create DEVICES
   npx wrangler kv:namespace create RATELIMIT
   ```
   Paste both IDs into `worker/wrangler.toml` under `[[kv_namespaces]]`.
2. **[ ] Set optional cleanup token** (Worker)
   ```bash
   npx wrangler secret put CLEANUP_TOKEN
   ```
3. **[ ] Tighten `ALLOWED_ORIGINS` in `wrangler.toml`** — currently includes `realmwright.app` plus broad fallbacks. Lock to your final domain(s) + the itch.io game URL. `Origin: null` is allowed unconditionally for `file://` itch.io desktop bundles (`worker/src/cors.ts:8`) — accept the trade-off or drop it if you do not ship a desktop bundle.
4. **[ ] Deploy Worker**
   ```bash
   cd worker
   npx wrangler deploy
   ```

### Per-publish (frontend single-file)
5. **[ ] Paste real DOMPurify v3 minified build** over the fallback block in `src/index.html` lines 2396-2451. Download from https://github.com/cure53/DOMPurify/releases. **NON-NEGOTIABLE — fallback is shim only.**
6. **[ ] Paste real `LS_PRODUCT_ID`** at `src/index.html` line ~3610. Without it the license activation will error with a meaningful guard message but cannot complete.
7. **[ ] Paste real `TURNSTILE_SITEKEY`** at `src/index.html` line ~3611. Without it the Demo path silently degrades; with it, unlicensed visitors get the captcha.
8. **[ ] Confirm `WORKER_URL`** at `src/index.html` line ~3612 matches the deployed Worker hostname (default `https://rw-license.realmwright.workers.dev`).
9. **[ ] Run `bash artifacts/run-verification.sh`** one last time. All gates should be PASS or environmental SKIP.
10. **[ ] Upload `src/index.html` to itch.io.** Single file, no zip needed.

### Post-deploy smoke tests (Hunter, see "Hunter-only" above)
11. **[ ] H1** Slider drag test
12. **[ ] H2** itch.io player dry-run
13. **[ ] H3** Lemon Squeezy purchase → activate → validate → deactivate
14. **[ ] H4** Cron cleanup-orphans firing

---

## Known risks at ship time

### Accepted trade-offs (do not block ship, but worth knowing)

1. **CSP `script-src 'unsafe-inline'`.** The entire app is one inline `<script>` block because itch.io requires a single HTML file with no bundler. `unsafe-inline` means an XSS that injects a NEW inline `<script>` would execute. The real XSS defense is DOMPurify on every `innerHTML` sink — not CSP. Documented honestly in `src/index.html:22-25`. If Hunter ever moves off itch.io single-file constraint, refactor to a nonce-based CSP.

2. **CSP `frame-ancestors` in `<meta>` is ignored by browsers.** Directive must be sent as an HTTP header. The directive is retained in the meta tag as defense-in-depth for non-browser HTML parsers that DO honor meta CSP. Browser will log a warning at boot — this is filtered out of the regression suite as expected behavior, not a regression.

3. **Worker accepts `Origin: null`.** `worker/src/cors.ts:8` returns `'null'` as a valid allowed origin. This is required for itch.io desktop bundles loaded via `file://`. Side effect: any local HTML file the user opens can call the Worker. Rate limiting (30 req/IP/min) is the only protection against scraping. Accept the trade-off or drop if you do not ship a desktop bundle.

4. **Lemon Squeezy halal-payout unresolved.** Documented in PLAN.md Phase 0 — LS does not list Bangladesh in bank-via-Wise payouts and is owned by Stripe (interest-based infrastructure). Hunter accepted this risk and stated a personal workaround. Re-raise if LS payouts fail at withdrawal time.

5. **Bug #14 still requires human test.** Refuted statically in Phase 0 (no `Render.all()` in slider input path; dispatch table excludes `'stat'` from workbench re-render). Cannot be confirmed without a real mouse drag. Listed as H1 above.

### Pure environmental gaps (NOT ship risks, just incomplete verification)
- **axe-core never ran in this verification pass.** Sandbox blocked the install. Hunter must run before public release.
- **W3C HTML validation never ran.** Sandbox blocked `validator.w3.org`. Hunter must run before public release.

---

## Sign-off

| Phase | Status | Notes |
|---|---|---|
| Phase 0 (decisions) | COMPLETE | PLAN.md table locked |
| Phase 1a (License/Worker) | COMPLETE | Code in `worker/`. Hunter has not deployed yet. Deploy items consolidated in pre-deploy checklist. |
| Phase 1b (State/Render/UX/CSS/Security) | COMPLETE | All 9 items landed. Regression suite confirms each fix is wired correctly. |
| Phase 2 (high quality) | COMPLETE | All 14 items checked in PLAN.md |
| Phase 3 (re-audit) | COMPLETE | All 9 A3-* items landed |
| Phase 4 (cleanup) | COMPLETE | Stale bug-fix comments stripped (commit `d07443a`) |
| Phase 5 (automated verification) | COMPLETE | 9/10 PASS, 2 environmental SKIPs documented |
| Phase 5 (human verification) | **OUTSTANDING** | 4 items in "Hunter-only" section |

**Recommendation:** the codebase is structurally ready for ship. Do not publish until items 5-14 of the pre-deploy checklist are complete (real DOMPurify, real site keys, real Worker deploy) and items H1-H4 are green.

No production code was modified during Phase 5. All changes are scoped to `artifacts/` and `SHIP_READINESS.md`.
