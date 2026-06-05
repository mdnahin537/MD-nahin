# C15 — HTML/Wiring Audit
**Chunk:** id=`C15` — head/meta (L1–53), static body (L3283–4651), trailing templates (L17576–17863)
**Auditor focus:** JS↔HTML wiring, HEAD/meta, accessibility, template blocks

---

## JS↔HTML WIRING VERDICT

471 unique IDs referenced via `getElementById('...')`, 25 via `querySelector('#...')`.

**All 6 apparent "broken wiring" IDs are dynamically created — no null-deref:**

| JS-referenced ID | How it exists |
|---|---|
| `sl-legitimacy` | Created via template literal `id="sl-${s.key}"` (L7770) when `s.key === 'legitimacy'` |
| `web-a11y-text` | Created via `alt.id='web-a11y-text'` (L15350) |
| `ollama-models-datalist` | Created via `dl.id='ollama-models-datalist'` (L16565) |
| `fhq-faction-row` | Created via `facRow.id='fhq-faction-row'` (L13370) |
| `sample-mode-banner` | Created via `banner.id='sample-mode-banner'` (L11231) |
| `modal-canon-failures` | Created via `modal.id='modal-canon-failures'` (L8709) |

**Panel IDs** (`panel-sessions`, `panel-hooks`, etc.) are static in HTML and accessed via template literal `getElementById(\`panel-${p}\`)` (L12729, 12735, 12743) — intentional, not broken.

**Dynamic-only IDs** (in JS template strings, not static HTML): `la-key-input`, `la-key-hint`, `la-key-err`, `la-submit`, `hd-from`, `hd-to`, `hd-topic`, `hd-tone-grp`, `hd-scope-grp`, `adv-cap`, `adv-pop`, `adv-ter`, `solo-accuracy-chip`, `solo-ask-btn`, `solo-chaos-slider`, `solo-chaos-readout`, `solo-mood-btn`, `solo-pivot-btn`, `solo-scene-check-btn`, `sp-content`, `pdf-content`, `eb-variants`, `ss-variants`, `qnpc-variants`, `wms-adv-toggle`, `wms-fac-showall`, `cp-open-settings` — all confirmed created dynamically before being queried.

**Wiring summary: CLEAN.** No broken getElementById/querySelector references found.

---

## Findings

### C15-1: Three simultaneous `role="main"` in DOM
- tag: UX | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L3418, L17728, L17757
- evidence:
  ```html
  <!-- L3418 -->
  <main class="living-nation" id="living-nation">
  <!-- L17728 -->
  <div class="tonight-mode" id="tonight-mode" role="main" aria-label="Tonight Mode">
  <!-- L17757 -->
  <div class="campaign-mode" id="campaign-mode" role="main" aria-label="Campaign session-prep center">
  ```
- observed/why: All three elements are always present in the DOM. `.tonight-mode` and `.campaign-mode` default to `display:none` via CSS (L2812, L2842) but are shown with `.is-open`. When either mode is active, the document contains two `role="main"` landmarks simultaneously (the native `<main>` + the active mode div). Screen reader landmark navigation will surface duplicate "main" regions, violating WCAG 1.3.6 / ARIA landmark uniqueness.
- fix: When activating tonight/campaign mode, set `aria-hidden="true"` on `#living-nation` (and vice versa), OR replace `role="main"` on the mode divs with `role="region"` and keep `aria-label`.

---

### C15-2: Export dropdown items are `<div>` not `<button>` — keyboard inaccessible
- tag: UX | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L3318–3321
- evidence:
  ```html
  <div class="export-dropdown__item" id="export-json-btn">Export as JSON</div>
  <div class="export-dropdown__item" id="export-pdf-btn">Export as Story Bible (PDF)</div>
  <div class="export-dropdown__item" id="export-foundry-btn">Export to Foundry VTT</div>
  <div class="export-dropdown__item" id="export-session-prep-btn">⌘ Generate GM Session Prep (PDF)</div>
  ```
- observed/why: These are interactive controls wired with `addEventListener('click')` at L15851–15855. Using `<div>` instead of `<button>` means: no keyboard focus without `tabindex="0"`, no Enter/Space activation, no role announcement as button/menuitem to screen readers. Paid product's primary export path is keyboard-inaccessible.
- fix: Change to `<button type="button" class="export-dropdown__item" id="...">`. Remove JS `.click()` fallback workarounds if any.

---

### C15-3: 14 `role="dialog"` slide-panels missing `aria-modal` and FocusTrap
- tag: UX | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L3592, L4079, L4091, L4103, L4247, L4264, L4285, L4297, L4305, L4316, L4352, L4360, L4579, L17824 (search has `aria-modal="true"`)
- evidence:
  ```html
  <div class="copilot-panel" id="copilot-panel" role="dialog" aria-label="Copilot">
  <div class="sc-panel" id="panel-sessions" role="dialog" aria-label="Sessions">
  <!-- ... 10 more sc-panels, quick-npc-card, detail-panel (explicit aria-modal="false") -->
  ```
- observed/why: `FocusTrap` is only activated for `.modal`-class elements (L8429) and the mobile overlay (L5819). All `sc-panel` slide-ins and copilot-panel have no focus trapping. Without `aria-modal="true"` or focus containment, screen readers can tab into background content while the panel is open. `detail-panel` explicitly sets `aria-modal="false"` — intentional and acceptable (it's non-modal), but copilot-panel and sc-panels act modally without declaring it.
- fix: Add `aria-modal="true"` to copilot-panel and all sc-panels that behave as exclusive panels. Extend `FocusTrap.activate()` / `FocusTrap.release()` to sc-panel open/close lifecycle in `SHSPanels.openPanel()` / `closeAll()`.

---

### C15-4: Pervasive unlabeled form controls — `<label>` without `for=`
- tag: UX | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L3682, L3684, L3761–3762, L3786, L3788–3790, L3799–3802, L3804, L4015, L4025, L4033, L4065, L4123, L4127, L4131, L4135, L4139, L4143, L4179 (and more)
- evidence:
  ```html
  <!-- L3682 -->
  <div class="form-field"><label class="form-label">Type</label>
  <select class="form-select" id="ev-type">...
  <!-- L3684 -->
  <div class="form-field"><label class="form-label">Visibility</label>
  <select class="form-select" id="ev-vis">...
  ```
- observed/why: ~51 `<label>` elements in static HTML lack `for=` attribute pointing to the associated input/select/textarea ID. The `<label>` elements wrap only text, not the control. Screen readers cannot associate these labels with their controls programmatically. Click-on-label does not focus the input. This affects virtually every modal form in the app.
- fix: Add `for="ev-type"` (etc.) to each label. Example: `<label class="form-label" for="ev-type">Type</label>`.

---

### C15-5: `copilot-key-input` (password field) has no programmatic label
- tag: UX | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L3893
- evidence:
  ```html
  <div class="settings-label">OpenRouter API key</div>
  <input class="form-input" type="password" id="copilot-key-input" placeholder="sk-or-v1-...">
  ```
- observed/why: The visible label ("OpenRouter API key") is a `<div class="settings-label">`, not a `<label for="copilot-key-input">`. The `password` input has no `aria-label` or `aria-labelledby`. Screen readers will announce only the placeholder or nothing. This is the most security-sensitive input in the app (the API key).
- fix: Replace `<div class="settings-label">` with `<label class="settings-label" for="copilot-key-input">OpenRouter API key</label>`.

---

### C15-6: `<div role="button">` on Arsenal filter tabs and nation-switcher dropdown items
- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L3549–3552 (wms-ars-tabs), L3318–3321 (export-dropdown), and dynamically at L8062, L8067 (nation-switcher items)
- evidence:
  ```html
  <!-- L3549 -->
  <div class="wms-ars-tab is-on" data-filter="all">All</div>
  <div class="wms-ars-tab" data-filter="political">Political</div>
  ```
- observed/why: `wms-ars-tab` divs are clickable (L3549–3552 wired via event delegation) but have no `role="tab"`, `tabindex`, or keyboard handling. Users cannot tab to filter tabs or activate them with Enter/Space.
- fix: Use `<button type="button" class="wms-ars-tab" data-filter="all">All</button>` or add `role="tab"`, `tabindex="0"`, and keydown handler.

---

### C15-7: No skip-link for keyboard navigation
- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L3283 (start of body, no skip link present)
- evidence: No `<a href="#living-nation" class="skip-link">Skip to main content</a>` anywhere in the static HTML.
- observed/why: Keyboard users must tab through the full identity-strip (wordmark, nation-switcher, stability display, undo, save, export, mode, settings buttons) before reaching the main content area. Standard accessibility requirement for paid software.
- fix: Add immediately after `<div id="app">` (or as first child of `<body>`): `<a class="skip-link" href="#living-nation">Skip to main content</a>` with CSS `position:absolute; transform:translateY(-100%); &:focus { transform:none }`.

---

### C15-8: CSP uses `unsafe-inline` for scripts — noted but architecturally forced
- tag: SECURITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L14–43 (CSP meta comment and value)
- evidence:
  ```html
  script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com
  ```
  Comment at L22–25 honestly documents: "unsafe-inline is REQUIRED because the entire app is a single inline `<script>` block. The real protection here is DOMPurify on every untrusted-string innerHTML sink, NOT CSP."
- observed/why: The comment is technically accurate. Single-HTML-file architecture (itch.io constraint) forces `unsafe-inline`. This is not a fixable CSP issue without bundler/build step. Documented correctly. **Flag only because any injected inline `<script>` from an XSS vector would still execute.** The sanitizer (X2a) is the actual defense.
- fix: No fix possible without architecture change. Confirm sanitizer coverage is exhaustive (covered in X2a). Add a `nonce` or `hash` CSP once a build step is available.

---

### C15-9: Cloudflare Turnstile script has no SRI `integrity` attribute
- tag: SECURITY | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: no
- where: L3200
- evidence:
  ```html
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  ```
- observed/why: No `integrity=` SRI hash. If Cloudflare's CDN were compromised (supply-chain attack), arbitrary script would execute in the app. SRI for Turnstile is intentionally unsupported by Cloudflare (they rotate the script frequently and document SRI as incompatible with their CDN versioning). This is a known Cloudflare/SRI trade-off, not negligence.
- fix: Accept the Cloudflare trade-off. Consider monitoring Turnstile script hash via CI canary check. Alternatively: load Turnstile only in an isolated `<iframe sandbox>` context (though this breaks the widget API).

---

### C15-10: `ev-weight` range input has no explicit `aria-label` — screen reader announces changing number only
- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L3689–3691
- evidence:
  ```html
  <label class="form-label">Weight: <span id="ev-weight-display">0</span></label>
  <input type="range" id="ev-weight" min="-30" max="30" value="0">
  ```
- observed/why: The `<label>` contains "Weight: 0" (dynamically updated via `ev-weight-display`), but has no `for="ev-weight"`. Screen readers will not associate this label with the range input. When the slider moves, `aria-valuetext` is absent, so the announced value will be bare numbers without context (no unit, no "stability weight" framing). Same pattern exists for `cs-weight` (L3766–3767).
- fix: Add `for="ev-weight"` to the label and add `aria-label="Event stability weight"` to the input. Pair with `aria-valuetext` update on change.

---

### C15-11: Inline styles pervasive in static body — 172 occurrences in body range
- tag: QUALITY | severity: POLISH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L3283–4651 (172 `style=` attributes counted)
- evidence (representative):
  ```html
  <button ... style="margin-right:var(--space-1)">
  <div style="display:flex;gap:8px;align-items:center;margin-top:12px">
  <span style="color:var(--color-gold-pale);font-size:.75em;">▾</span>
  ```
- observed/why: 172 inline style attributes in just the static body markup (34 more in trailing templates). These resist theming (theme-manuscript and theme-modern must fight inline styles with `!important`), make design updates require HTML edits, and inflate HTML parse cost. This is the primary reason CSS bundle has theme overrides like `body.theme-manuscript .wms-ars-tab` (L1087).
- fix: Gradually extract to utility classes. Priority targets: spacing shims on buttons (`margin-right:var(--space-1)`), display flex rows (already repeated 20+ times), and color overrides that break theming.

---

## Summary

| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 4 |
| LOW | 4 |
| POLISH | 1 |

**Total findings: 9** (11 blocks including the wiring verdict and CSP note)

**Wiring status: CLEAN.** All 471 `getElementById` + 25 `querySelector('#...')` references resolve correctly — either to static HTML elements or to elements confirmed dynamically created before querying. No null-deref from broken wiring.

**Top 3 findings:**

1. **C15-1** (MEDIUM): Three simultaneous `role="main"` landmarks in DOM when Tonight/Campaign mode is active — screen reader navigation presents duplicate "main" regions.

2. **C15-3** (MEDIUM): 13 `role="dialog"` slide-panels lack `aria-modal="true"` AND FocusTrap is never activated for them — screen readers can wander into background content while panels are open.

3. **C15-4** (MEDIUM): ~51 `<label>` elements in static HTML have no `for=` attribute — form controls across virtually every modal are programmatically unlabeled, failing basic a11y and click-label-to-focus behavior.
