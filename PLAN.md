# RealmWright Pre-Ship Fix Plan

**Branch:** `claude/multi-agent-workflow-Tt5Hz`
**PR:** #4
**Source:** `src/index.html` (14,479 lines; baseline at commit `4ec9510`)
**Artifacts:** `artifacts/` (Playwright scaffold + screenshots from Senior C)

This file is the persistent spec. Phase 1+ Senior agents read it. Update checkboxes as work lands.

---

## Phase 0 — Locked Decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Lemon Squeezy | **KEEP.** Route LS license calls through `rw-license.realmwright.workers.dev`, same pattern as the existing itch.io verify path. Kill third-party CORS proxy. |
| 2 | Mobile | **Gate stays as default below 768px.** Fix underlying CSS so the dismissed state works. Add tablet 768-1023px reflow without gate. |
| 3 | Browser floor | Chrome / Edge / Safari / Firefox **latest 2 versions only.** No legacy prefix burden. |
| 4 | Bug #14 (slider) | **Defer to Phase 5** with mandatory human drag-test. Static analysis refuted it (no Render.all() call on input). |
| 5 | PLAN.md | This file. Living doc, checkbox-tracked. |

### Halal Payout — Unresolved (Hunter accepts risk)

Senior C documented with sources: LS supports PayPal + bank-via-Wise (79 countries). Bangladesh is not in the bank-payout list. No Payoneer. LS is now owned by Stripe. Hunter has chosen to keep LS — assumed Hunter has a personal workaround. If LS payouts fail at withdrawal time, re-raise.

---

## Refuted Bugs (do NOT re-open without new evidence)

| # | Why refuted |
|---|---|
| #10 | Standard scope returns explicit `{error:'Out of scope...'}` at line 7916. Not silent. |
| #13 | `Copilot._isGenerating` IS declared at line 9027 (inside the Copilot object literal). |
| #14 | Slider `input` handler at 6482 calls `update(...)` only — no `Render.all()`. `dispatchRender` does NOT route `'stat'` to workbench. **Re-tested in Phase 5 by Hunter via real mouse drag.** |
| #20 | `Utils.debounce` defined at L4472, `State` at L5118. Order is safe. |
| #24 | Workbench only re-renders on `'customStat'` or `'nation'`. Slider change emits `'stat'` only. |

---

## Phase 1 — Ship-blockers

Two sub-PRs planned:
- **Phase 1a — License/Worker rewrite** (P1.1 – P1.4). Adds `worker/` dir.
- **Phase 1b — State/Render/UX/CSS/Security** (P1.5 – P1.13). Edits to `src/index.html`.

### P1.1 — Route LS license API through own Worker
- **Bugs resolved:** #2, S10
- **Frontend:** `src/index.html` lines 4660, 4672, 4703, 4717. Swap `https://api-cors-anywhere.lemonsqueezy.com/v1/licenses/{activate,validate,deactivate}` → `${WORKER_URL}/api/license/{activate,validate,deactivate}`. Body stays the same.
- **Worker (new code in `worker/` dir):** Add 3 routes. Each forwards POST body to `https://api.lemonsqueezy.com/v1/licenses/{action}` (LS license API requires no API-key auth — it's a license-holder verify endpoint). Return LS response with `Access-Control-Allow-Origin` set to allowed origins. KV-backed per-IP rate limit.
- **Done when:** No reference to `api-cors-anywhere` remains in frontend. Worker source + `wrangler.toml` + deploy notes committed under `worker/`. End-to-end license flow tested.

### P1.2 — Site keys + build-time guard
- **Bugs resolved:** #1, NEW-A2
- **Locations:** lines 3610-3612 (`LS_PRODUCT_ID`, `TURNSTILE_SITEKEY`)
- **Current:** Both empty strings.
- **Fix:** Add a guard at the top of init: `if(location.protocol!=='file:' && (!LS_PRODUCT_ID||!TURNSTILE_SITEKEY)){console.error('Missing site keys — demo/license disabled');}` so non-file:// loads scream. The actual keys: Hunter pastes the real values OR uses `import.meta.env`-style placeholders the build replaces. Single-file constraint → keep inline constants, Hunter swaps before each upload.
- **Done when:** Guard active. Hunter swaps real keys before publishing.

### P1.3 — Server-side device fingerprint
- **Bugs resolved:** S1, #17 (becomes irrelevant)
- **Frontend locations:** 4600-4619 (`buildFingerprint`), 4638 (`_registerDeviceWithWorker`)
- **Current:** Client computes weak 32-bit DJB2 hash of UA+screen+TZ. Worker trusts it.
- **Fix:** Worker generates an opaque UUID `device_token` on first activate, stores `{license_key → [token...]}` in KV with 90d TTL. Returns token to frontend via `Set-Cookie: rw_device=<token>; HttpOnly; Secure; SameSite=Strict; Max-Age=7776000` AND in response body (fallback for non-cookie contexts like itch.io iframes). Frontend persists in IDB. Subsequent validate/deactivate sends the token. Worker enforces 3-token cap server-side. `buildFingerprint` kept as a no-op stub for backward compat with migrated state.
- **Done when:** No client-supplied hash trusted. Cap enforced server-side. Test: clear localStorage, attempt to activate 4th device, get rejection.

### P1.4 — License retry queue + telemetry
- **Bugs resolved:** S2, S3
- **Frontend locations:** 4670-4675 (rollback empty catch), 4699-4710 (background validate empty catch)
- **Current:** Empty `catch(e){}`. Network blip on rollback = LS instance leaks active forever.
- **Fix:**
  - Wrap rollback in 3-retry exponential backoff (1s, 2s, 4s)
  - On final failure, push `{license_key, instance_id, action:'deactivate', queued_at}` to localStorage queue under key `rw_license_queue`
  - On every app startup, drain the queue (best-effort, log failures to console with explicit tag)
  - Worker exposes `POST /api/license/cleanup-orphans` callable from a Workers Cron Trigger to reap dead instances (scheduled fortnightly)
  - User-visible toast on activate failure: "License sync queued — will retry." No silent state.
- **Done when:** No empty catches in license code. Queue persists across reloads. Toast UX in place.

---

### P1.5 — `State.addNation()` full initialization
- **Bugs resolved:** #5, #25
- **Location:** lines 5281-5295
- **Current:** Wholesale `nation.metadata = {createdAt:..., lastUpdatedAt:...}` destroys `soloMode`/`chaosFactor`. Missing `hooks`, `sessions`, `fronts`, `locations`, `secrets`, `bestiary`, `relations`, `chronicle`, `stats`.
- **Fix:** Shallow-merge metadata: `nation.metadata = {...(nation.metadata||{}), createdAt: nation.metadata?.createdAt||Date.now(), lastUpdatedAt: Date.now()}`. Initialize all expected arrays empty if absent. Match the migration v2.0.0 shape at lines 4986-4992 exactly.
- **Done when:** A nation created via `addNation` (without `buildNationFromSeed`) does not crash on first access to `hooks/sessions/fronts/locations/secrets/bestiary/relations/chronicle`. Soft-cast: pre-built seed nation retains `soloMode` after `addNation`.

### P1.6 — Null-guard every `Render.*` method
- **Bugs resolved:** #3, #32
- **Locations:** `Render.identityStrip` (6068), `recentPulse` (6266), `arsenal` (6278), `chronicleBand` (6335), plus every method that opens `const n=State.get();`
- **Fix:** Each method opens with `const n=State.get(); if(!n){ /* render empty state or early return */ return; }`. For `identityStrip`, render an empty-state CTA: "No realm yet. [Create your first realm]".
- **Done when:** Loading the app with `State.data.nations=[]` renders without console errors and shows the create-realm CTA.

### P1.7 — First-run UX surface
- **Bug resolved:** #3 root cause
- **Current:** Only entry to create a nation is inside the nation-switcher dropdown (line 6402). New users see nothing to click.
- **Fix:** The empty-state CTA from P1.6 wires `onclick="Modals.open('new-nation')"` directly. Also expose a small "+ New realm" link in the nation-switcher header (already exists at 6402, ensure visible without dropdown).
- **Done when:** A first-time visitor with an empty state has one obvious, primary-styled button. Playwright test passes.

### P1.8 — Tool-call wrong-nation race
- **Bug resolved:** NEW-A1
- **Locations:** 7883-7884 (`_executeTool`), 8366 (dispatcher invoking `this._executeTool`)
- **Current:** `_executeTool` does `const n=State.get();` — uses active nation, not streaming nation. Mid-stream nation switch → writes hit the wrong realm.
- **Fix:** Change signature to `_executeTool(toolName, args, nationId)`. Resolve `n` via `State.getById(nationId) || State.get()`. Dispatcher passes `this._streamingNationId`. Add `State.getById(id)` if it doesn't exist (lookup in `State.data.nations`).
- **Done when:** Playwright test starts a stream, switches nation mid-stream, tool writes land on original nation.

### P1.9 — `gm-mode` grid + `world-mode-shell` top offset
- **Bugs resolved:** #6, #7
- **Locations:** 314 (`world-mode-shell{top:60px}`), 1328-1329 (base `#app` grid), 1932-1935 (`body.gm-mode #app` override)
- **Current:** Base 3 rows / 3 areas. gm-mode override adds 4th row but no new `grid-template-areas` declaration. Shell hardcoded at `top:60px`, ignoring the 36px GM toolbar.
- **Fix:** In `body.gm-mode #app`, add `grid-template-areas:"identity" "gm-toolbar" "main" "chronicle";`. Add rule `body.gm-mode .world-mode-shell{top:96px;}` (60+36). Verify `.gm-toolbar`, `.main-row`, `.chronicle-band` have correct `grid-area` references.
- **Done when:** Toggle gm-mode in browser — toolbar is not occluded by shell. Visual diff before/after.

### P1.10 — Dedupe `.wms-sec-link` CSS
- **Bug resolved:** #15
- **Locations:** 402-404 (first declaration: Cinzel), 503-505 (second: mono + `float:right`)
- **Fix:** Delete the second declaration. Audit usages — both `<span>` (2496) and `<button>` (2507) use this class. If the button needed button-reset styles (the leaked `background:none;border:none;padding:0` from the second decl), re-declare those on `.wms-sec-link[role="button"], button.wms-sec-link` specifically.
- **Done when:** Computed style shows Cinzel font-family. No accidental `float:right` on any `.wms-sec-link`.

### P1.11 — Dedupe DOM IDs
- **Bugs resolved:** NEW-B1, NEW-B2
- **Locations:** 11665 / 11674 / 11687 (heralds — same `id="hd-topic"` x3), 13981-13997 vs 14371-14378 (license modal — `la-submit`, `la-key-input`, `la-key-hint`, `la-key-err`, `hd-tone-grp` all duplicated)
- **Fix:** Namespace heralds template IDs by mode: `hd-${mode}-topic`, `hd-${mode}-tone-grp`. License modal: delete the static-markup duplicates (14371-14378); keep the dynamic-injected source-of-truth. Replace any `getElementById('hd-topic')` etc. with scoped lookup against the current mode's container.
- **Done when:** W3C validator: 0 duplicate-id errors.

### P1.12 — CSP + DOMPurify
- **Bugs resolved:** S5, S7
- **Current:** No CSP. Custom regex markdown renderer (4490-4531) → `innerHTML=` (4549, 7775, 8483, 9762). No DOMPurify.
- **Fix:**
  - Add `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://openrouter.ai https://rw-license.realmwright.workers.dev http://localhost:11434 https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com;">` in `<head>`. **Note:** `unsafe-inline` for scripts is required because the app IS one big inline script. Acceptable trade-off; CSP still blocks injection of NEW inline scripts via DOM after page-load — but only if `script-src` excludes the source. Document this caveat.
  - Better: refactor inline JS into a `<script>` block with a nonce, set `script-src 'self' 'nonce-{N}'`. Single-file constraint conflicts here. **Decision:** ship `unsafe-inline` for v1, plan a nonce-based v2 if Hunter wants tighter posture.
  - Inline-bundle a minified DOMPurify (~22KB). Wrap `Markdown.render` output: `el.innerHTML = DOMPurify.sanitize(Markdown.render(text), {USE_PROFILES:{html:true}, ALLOWED_URI_REGEXP:/^(?:https?|mailto):/i});`. Apply at all 4 sinks.
- **Done when:** A crafted markdown payload `<img src=x onerror=alert(1)>` does not fire. CSP header present in DevTools.

### P1.13 — Move OpenRouter key out of localStorage
- **Bug resolved:** S8
- **Locations:** 3621 (STORAGE_KEY), 5207 (State persist mirror)
- **Current:** `copilotKey` is in the State JSON that lands in localStorage. Any XSS = key exfiltration.
- **Fix:** Strip `copilotKey` (and any other secret field) from the State serialization path. Store separately in IDB under a dedicated object store `secrets`. Provide async `loadKey()/saveKey()` helpers. Runtime ref-only; never echo to console. Migration: on first load post-update, read old `copilotKey` from localStorage State, write to IDB, scrub from localStorage.
- **Done when:** `JSON.parse(localStorage.getItem(STORAGE_KEY))` shows no field containing `sk-or-`. App still uses the key for OpenRouter calls.

---

## Phase 2 — High quality (PR #5)

Confirmed 🟠:
- #8 — `DemoCounter.isDemoCall` missing (line 4382; add stub method)
- #9 — Chaos scale 1-9 vs `/10` told to AI (line 13817; fix prompt template)
- #11 — Secret model missing `title` (lines 10199, 10214; add field)
- #12 — Stat clamp `0` → `stat.min` (line 7975)
- #16 — Mobile breakpoint for `.wms-panels` (lines 317, 2032-2038)
- #19 — `wms-nation-notes` DOM/CSS layout (lines 2487, 386)
- NEW-A3 — Orphan `chronicleLinks` on event delete (5261-5269)
- NEW-A4 — Leap-year date math (9946-9949)
- NEW-A5 — Abort-mid-stream phantom canon review (8434-8447)
- NEW-B3 — Focus rings stripped on 7 elements (471, 478, 481, 917, 924-928, 1665, 1854)
- NEW-B4 — Color-only conveyance on faction/loyalty (442-446, 711-714)
- NEW-B6 — Modal `aria-modal`/`aria-labelledby` missing (2555, 2563)
- NEW-B7/B8 — Hover-only reveal on touch (700-703, 578)
- S4 — `Math.random()`-based IDs in ID-generation paths (4467, 7182, 9387)

## Phase 3 — Re-audited Spec (replaces original)

The original Senior A/B/C audit numbering (#18, #21, #22, #23, #26, #27, #29, #30,
NEW-A6-A9, NEW-B5, NEW-B9-B12, S6, S9) was never committed with descriptions and
cannot be reconstructed. This section is a fresh re-audit of `src/index.html`
against the same categories the hints implied: keyboard a11y, touch targets,
color-only / a11y signals, security surfaces, and miscellaneous polish.

Security sweep result: clean. No `eval`, `new Function`, `document.write`,
`setTimeout(string)`, `setInterval(string)`, `postMessage` listener, or
DOMPurify-bypassing `innerHTML` from user input found. All `Markdown.render()`
output is sanitized inside the renderer itself (Phase 1b P1.12). All
`target="_blank"` links carry `rel="noopener"` (browser floor = latest-2 Chrome/
Edge/Safari/Firefox, where this also blocks referrer leak).

Polish sweep result: clean. No `console.log`/`debugger` leftovers. The 11
remaining `console.*` calls are intentional diagnostics. Empty `catch(e){}`
blocks are scoped to best-effort persistence paths (IDB/localStorage writes)
and are deliberate.

- [x] **A3-1** [a11y/kbd] — `#stability-wrap` at line 2475 — `role="button"` + `tabindex="0"` but the click listener at 13054 has no Enter/Space keyboard handler. Add `keydown` handler matching click.
- [x] **A3-2** [a11y/kbd] — `[data-sc]` nation-card stat rows at 6596 (rendered by `Render.statRows`) — `role="button"` + `tabindex="0"` but listener at 6607 only handles click. Add Enter/Space.
- [x] **A3-3** [a11y/kbd] — `[data-thread-hook-panel]` at 11261 (rendered by `PlotThreads._renderHookList`) — `role="button"` + `tabindex="0"` but listener at 11241 only handles click. Add Enter/Space.
- [x] **A3-4** [a11y/label] — Modal close `×` buttons at 2756, 2802, 2832, 2845, 2858, 2875, 2881, 2905, 2948, 2965, 3098, 3116, 3150, 3166, 3224, 3275, 3315, 7382 lack `aria-label`. Screen readers read the "×" glyph as "multiplication sign" or nothing. Add `aria-label="Close"`.
- [x] **A3-5** [a11y/label] — `#detail-panel` at 2709 — `role="dialog"` without `aria-label`/`aria-labelledby` and without `aria-modal`. Close button at 2712 also unlabeled. Add `aria-label` to the panel and the close button.
- [x] **A3-6** [a11y/label] — Inline `×` remove buttons in dynamic rows (`.affected-stat-row__rm` at 7158 and 13282; `.char-link-row__rm` at 7235) have no accessible name. Add `aria-label="Remove"` at template-string sites.
- [x] **A3-7** [a11y/touch] — `.workbench__custom-stat-delete` at 1538 hard-codes `width:16px` with no min-height — fails WCAG 2.5.8 (24×24 minimum). Expand to 24×24 minimum, keep visual size.
- [x] **A3-8** [a11y/touch] — `.char-link-row__rm` at 1580 has only `font-size:14px` and no min sizing — same WCAG 2.5.8 miss. Add 24×24 minimum. (Landed in same commit as A3-7.)
- [x] **A3-9** [a11y/describedby] — Form-error elements (`#ev-name-err`, `#cs-name-err`, `#ch-name-err`, `#hook-title-err`, `#secret-content-err`, `#loc-name-err`) are visual-only — they are not bound to their inputs via `aria-describedby`, so error text is never announced by AT when the input gains focus. Add `aria-describedby` on each input.

## Phase 3 — Medium polish (original list, superseded by re-audit above)

## Phase 4 — Cleanup (PR #7)

#31, #33, #34 + strip all 19 internal "Bug N fix:" / "B6 fix:" comments (lines 30, 6705, 7170, 8517, 9472, 9515, 9582, 9622, 9718, 9746, 9922, 9957, 9959, 10227, 10233, 10420, 11116, 11148, 12623). NEW-A10-A11.

## Phase 5 — Verification

- Headless Playwright regression (`artifacts/test_realmwright.mjs` scaffold)
- axe-core a11y scan
- W3C HTML validator
- **Hunter: human drag-test for slider (#14)**
- itch.io HTML5 upload dry-run
- Lemon Squeezy product test purchase + license activate → validate → deactivate flow
- Verify cleanup-orphans cron is firing

---

## Multi-Agent Execution Pattern

Per phase:
- 1 Senior (Opus 4.7) reads this file + relevant Senior A/B/C report references + dispatches Juniors
- Juniors (Sonnet 4.6, parallel) own non-overlapping slices
- Senior synthesizes, commits with descriptive messages, pushes
- Main agent reviews + signs off + updates checkboxes here

---

## Progress Checklist

### Phase 0 — [x] decisions locked

### Phase 1a (License/Worker)
- [ ] P1.1 LS routing through Worker
- [ ] P1.2 Site keys + build-time guard
- [ ] P1.3 Server-side device fingerprint
- [ ] P1.4 License retry queue + telemetry

### Phase 1b (State/Render/UX/CSS/Security)
- [x] P1.5 `State.addNation()` full init
- [x] P1.6 `Render.*` null-guards
- [x] P1.7 First-run UX (folded into P1.6 empty-state CTA)
- [x] P1.8 Tool-call nation race
- [x] P1.9 `gm-mode` grid + shell offset
- [x] P1.10 Dedupe `.wms-sec-link`
- [x] P1.11 Dedupe DOM IDs (license modal only — heralds were a false alarm; see commit)
- [x] P1.12 CSP + DOMPurify (Hunter must paste official DOMPurify build before publish)
- [x] P1.13 OpenRouter key out of localStorage

### Phase 2 — landed
- [x] #8 DemoCounter.isDemoCall stub
- [x] #9 Chaos scale /10 → /9 in Copilot prompt
- [x] #11 Secret model gains title field
- [x] #12 Stat clamp uses stat.min
- [x] NEW-A3 Orphan chronicleLinks swept on event delete
- [x] NEW-A4 Year advance uses 365.25
- [x] NEW-A5 Skip canon review on aborted stream
- [x] S4 Crypto-backed ID generation (no Math.random)
- [x] #16 Mobile/tablet reflow for .wms-panels
- [x] #19 wms-nation-notes moved out of head row
- [x] NEW-B3 Focus-visible outlines restored
- [x] NEW-B4 Shape redundancy on faction/loyalty
- [x] NEW-B6 aria-labelledby on all modals
- [x] NEW-B7/B8 Hover reveals gated to (hover: hover); persisted on touch
### Phase 3 — re-audited
- [x] A3-1 stability-wrap keyboard handler
- [x] A3-2 [data-sc] keyboard handler
- [x] A3-3 [data-thread-hook-panel] keyboard handler
- [x] A3-4 Modal close buttons aria-label
- [x] A3-5 detail-panel aria-label + close aria-label
- [x] A3-6 Inline × remove buttons aria-label
- [x] A3-7 .workbench__custom-stat-delete 24×24 target
- [x] A3-8 .char-link-row__rm 24×24 target (in A3-7 commit)
- [x] A3-9 Form-error aria-describedby on inputs
### Phase 4 — [ ] pending
### Phase 5 — [ ] pending
