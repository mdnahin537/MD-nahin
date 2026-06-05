# C14 — CSS Audit (lines 54–3199)

Target file: `/root/.claude/uploads/c01e2694-58fb-4cef-99ea-42e4d95e9f1d/6b9eaae1-relamwrith_V7.HTML`
Chunk: style block ~3,145 lines, three themes (ember/manuscript/modern), WorldShell skin layer, global base styles.

---

## Findings

### C14-1: `chronicle-band` and `main-row` hidden by JS — JS still renders into both
- tag: WIRING | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L504, L1928–L1930, L16731–L16734
- evidence:
  ```css
  /* L504 */
  .world-mode-shell{display:none; …}

  /* L1928–1930 */
  .chronicle-band{grid-area:chronicle;position:sticky;bottom:0;z-index:var(--z-sticky);
    background:var(--color-ink);border-top:1px solid var(--color-gold); …}
  ```
  ```js
  /* L16731–16734 */
  const chronBand=document.querySelector('.chronicle-band');
  if(wms)wms.style.display=useShell?'grid':'none';
  if(mainRow)mainRow.style.display=useShell?'none':'';
  if(chronBand)chronBand.style.display=useShell?'none':'';
  ```
- observed/why: When `WorldShell` is ready (the default for all three themes), `applyTheme()` hides `.chronicle-band` via inline `display:none`. However the CSS at L1928 gives `.chronicle-band` its own `grid-area`, height (140px in `#app`), and sticky chrome. The CSS `#app` grid still allocates `140px` for the `chronicle` row even when JS hides it (the grid row doesn't collapse because the element is only hidden via `display:none` on the element, not removed from flow). This causes the `.wms-chr` chronicle footer inside WorldShell to occupy its own separate DOM path (grid-row 2 in `.wms-panels`), while JS continues to call `WorldShell._renderChronicle()` targeting `wms-chr` inside the WorldShell DOM. This is the root mechanism identified in C10-1: the visible chronicle (`.wms-chr`) is inside WorldShell; the old `.chronicle-band` still occupies space in the grid. Confirm: `grid-template-rows:60px 1fr 140px` at L1914 always reserves the 140px slot, but the element is `display:none` — the 1fr row above absorbs the space in modern browsers, so this is not a layout hole in practice. However the reverse case (if `WorldShell` undefined and `rw_legacy_layout=1`), `.chronicle-band` is shown but JS may have already rendered content into `.wms-chr`. No CSS cleans up after a mid-session theme switch.
- fix: Collapse the `#app` grid to `grid-template-rows:60px 1fr` when WorldShell is active by toggling a class on `#app` in `applyTheme()`, or set `grid-row` override. Ensure a mid-session theme switch to `rw_legacy_layout` re-renders content into `.chronicle-band`.

---

### C14-2: Undefined CSS custom properties used across all themes
- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L2647–L2657, L2819, L2951, L3001, L3018, L3024, L1381, L16777
- evidence:
  ```css
  /* L2647 — Encounter Builder */
  .eb-select{background:var(--color-surface-1);border:1px solid var(--color-border);
    color:var(--color-text-body); …}
  /* L2654 */
  .eb-title{font-size:var(--text-heading-sm); …}
  /* L2819 */
  .tonight-mode__lede{font-size:var(--text-body-lg); …}  /* --text-body-lg IS defined in :root L84 */
  /* L2951 */
  .cmp-md h1{font-size:var(--text-label-md); …}
  /* L3018 */
  .handout-body{font-size:var(--text-body-md); …}
  /* L1381 */
  .sample-picker__card-title{font-size:var(--text-heading); …}
  /* L16777 (JS inline style string) */
  background:var(--color-surface-raised)
  ```
- observed/why: The following variables are **used but never defined** anywhere in `:root` or any theme block:
  - `--color-surface-1` (L2647, L2649) — Encounter Builder fields have transparent/invisible background
  - `--color-border` (L2647, L2649) — border collapses to initial (`medium none currentcolor`)
  - `--color-text-body` (L2647, L2649, L2657) — text inherits from parent instead of intended value
  - `--text-heading-sm` (L2654) — EB result title renders at browser default
  - `--text-heading` (L1381) — sample picker card title renders at browser default
  - `--text-label-md` (L2951, L3001, L3024) — campaign-mode markdown headings, front card names, print-preview title
  - `--text-body-md` (L3018, L14826, L14954) — handout body text and relationship web name display
  - `--color-surface-raised` (L16777 JS) — snapshot list items have no background
  - `--color-success` (L3881 HTML inline style) — Ollama badge has no color fallback in CSS (only inline fallback `#9ce8a3`)
  - `--color-warning` (L3196) — fd-demo error has `#f87171` fallback, so acceptable
- fix: Add all missing vars to `:root`. Suggested values from surrounding token patterns:
  `--color-surface-1: var(--color-parchment-warm)`, `--color-border: var(--color-border-default)`, `--color-text-body: var(--color-text-primary)`, `--text-heading-sm: 1.25rem`, `--text-heading: 1.25rem`, `--text-label-md: 0.875rem`, `--text-body-md: 1rem`, `--color-surface-raised: var(--color-parchment-pale)`, `--color-success: var(--color-thriving)`.

---

### C14-3: `ember-glow-pulse` animation fires in Manuscript and Modern themes
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L387, L3503, L14291, L14312
- evidence:
  ```css
  /* L387 — only scoped to ember */
  body.theme-ember .ember-glow-pulse{animation:ember-breathe 4s ease-in-out infinite}
  ```
  ```html
  <!-- L3503 — class is hardcoded in DOM -->
  <div class="wms-stab-num ember-glow-pulse" id="wms-stab-num">—</div>
  ```
  ```js
  /* L14291, L14312 — JS stamps it on chronicle nodes in all themes */
  `<div class="wms-cn-dot wms-cn-dot--now ember-glow-pulse">`
  ```
- observed/why: The animation rule is scoped to `body.theme-ember`. In Manuscript and Modern the class is inert and `animation` is not set — so no animation fires. **However**, the `@keyframes ember-breathe` applies a `filter:drop-shadow()` which IS layout-safe. The real issue is that JS unconditionally stamps `.ember-glow-pulse` onto the stability number hero and chronicle "NOW" node in every theme. In Manuscript, this is intentionally suppressed at L1076 (`animation:none`). In Modern it is also suppressed at L1228. But neither theme overrides the **keyframe registration** (`@keyframes ember-breathe` is global). This means `prefers-reduced-motion` overrides at L2806 (`animation-duration:0ms!important`) will catch these if a user ever manually inherits the animation in a theme override — low risk but dirty. The actual bug is that in Manuscript/Modern, `.wms-stab-num` and chronicle `.wms-cn-dot--now` receive a class whose entire purpose is Ember-specific, polluting the DOM with dead class names and making theme-specific JS cleanup harder.
- fix: Strip `ember-glow-pulse` from the DOM in JS when not in Ember theme (check theme before stamping the class), or gate the class addition: `if(theme==='ember') el.classList.add('ember-glow-pulse')`.

---

### C14-4: `wms-nation-notes` has `display:none` in CSS but JS shows/hides it via inline style — CSS rule is overridden and confusing
- tag: QUALITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L589–L591, L14002
- evidence:
  ```css
  /* L589–591 */
  .wms-nation-notes{font-size:var(--text-body-sm);color:var(--color-text-muted);font-style:italic;
    margin-top:-14px;line-height:1.65;white-space:pre-wrap;
    border-left:2px solid var(--color-gold-pale);padding-left:10px;display:none}
  ```
  ```js
  /* L14002 */
  notesEl.style.display=nt?'block':'none';
  ```
- observed/why: The CSS defaults to `display:none`, which JS overrides with an inline style on each render. This pattern works but is fragile: any higher-specificity CSS rule could re-hide the element even when JS has shown it, since inline style would still win (inline > all class rules). Bigger issue: if JS fails before L14002 runs, the element is invisible with no fallback. The `display:none` in CSS also slightly misleads a reader into thinking this element is intentionally always-hidden (compare: C10-1 chronicle band). The CSS `display` should be omitted and initial state handled entirely by JS, or a class toggle pattern used.
- fix: Remove `display:none` from `.wms-nation-notes` CSS rule. Use a class toggle (`.is-hidden{display:none}`) rather than `style.display`, consistent with the rest of the codebase.

---

### C14-5: Ember-only WorldShell sub-elements have NO Manuscript/Modern CSS — visible but unstyled
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: yes
- where: L870–L878, L900–L950, L961–L970, L979–L986
- evidence:
  ```css
  /* L870–878 — corner decorators: ember-only, no fallback */
  body.theme-ember .wms-corner--tr{ … }
  body.theme-ember .wms-corner--bl{ … }
  /* L900 — eyebrow row: ember-only */
  body.theme-ember .wms-pc-eyebrow{ … }
  /* L939–950 — faction avatar + loyalty bar: ember-only */
  body.theme-ember .wms-fc-avatar{ … }
  body.theme-ember .wms-fc-loyalty{ … }
  body.theme-ember .wms-fglyph{ … }
  /* L962 — arsenal title-row + lock icon: ember-only */
  body.theme-ember .wms-ae-title-row{ … }
  body.theme-ember .wms-ae-lock{ … }
  /* L979–986 — chronicle label row: ember-only */
  body.theme-ember .wms-chr-label-row{ … }
  body.theme-ember .wms-chr-label-text{ … }
  ```
  HTML at L14091–L14260 shows these classes are rendered unconditionally by JS in all themes:
  ```js
  /* L14091 */
  <div class="wms-pc-eyebrow">
  /* L14140 */
  <div class="wms-fc-avatar">
  /* L14148 */
  <div class="wms-fc-loyalty">
  ```
- observed/why: These structural elements (eyebrow row, faction avatar/loyalty bar, arsenal title-row, chronicle label row) are rendered by JS into the DOM in all three themes but only styled in Ember. In Manuscript and Modern:
  - `.wms-pc-eyebrow` has no `display` rule → inherits block, renders unstyled (raw dot + text, no gap/layout)
  - `.wms-fc-avatar` has no size, border, or flex rules → collapses/overflows
  - `.wms-fc-loyalty-track`/`.wms-fc-loyalty-fill` have no height rules → invisible loyalty bars
  - `.wms-ae-title-row` has no flex layout → title and lock icon stack vertically
  - `.wms-chr-label-row` has no positioning → label appears in normal flow, not above the track
  These are visible layout regressions for paying users on non-Ember themes.
- fix: Add base unscoped rules for these structural classes (sizing, flex layout, positioning). Move display/geometry to the unscoped selector; Ember's `body.theme-ember .wms-*` overrides only need to set ember-specific colors/glows. The Manuscript and Modern parity sweeps (L997–1159, L1192–1291) partially address typography but miss these structural elements.

---

### C14-6: Multiple continuous animations running simultaneously — cumulative GPU paint pressure
- tag: PERF | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L383–L387, L391–L408, L412–L419, L428–L437, L848–L849, L1178, L1181
- evidence:
  ```css
  /* Four simultaneous looping animations in Ember at idle: */
  body.theme-ember .ember-glow-pulse{animation:ember-breathe 4s ease-in-out infinite}     /* filter: */
  body.theme-ember .ember-orbit__outer{animation:ember-cw 20s linear infinite}            /* transform: */
  body.theme-ember .ember-orbit__inner{animation:ember-ccw 13s linear infinite}           /* transform: */
  body.theme-ember .ember-particle{animation:ember-rise 3s ease-in-out infinite}          /* transform,opacity: per-particle */
  body.theme-ember .wms-nav__item.is-active{animation:nav-breathe 3s ease-in-out infinite} /* opacity: */
  #ambient-layer .amb-glow{animation:amb-breathe 22s ease-in-out infinite}                /* transform,opacity: */
  body.theme-ember .wms-pc-dot{animation:ember-pulse 2–5s infinite}                       /* opacity: per dot */
  ```
- observed/why: In Ember theme at steady state, the following animate simultaneously: 2 orbital rings, stability orb glow, nav-breathe on active item, ambient layer glow, up to 3 pressure-card dots, plus JS-spawned ember particles (no cap visible in CSS). All are GPU-eligible animations (`transform`/`opacity`/`filter`). `filter:drop-shadow` in `ember-breathe` is particularly expensive — it forces a compositing layer and repaints on every frame at 60fps. The `ember-particle` animation uses `translateY`+`scale` which is GPU-composited, but JS spawns them continuously (L14329) with no particle-count CSS cap. This is a concern on integrated graphics (budget laptops, tablets).
- fix: (1) Replace `filter:drop-shadow` in `ember-breathe` with `box-shadow` on a pseudo-element (GPU-composited). (2) Apply `will-change:transform` to `.ember-orbit__outer/.inner` to promote to their own compositing layers. (3) Add a CSS `--max-particles` variable and JS-side cap. (4) Consider disabling `.ember-pc-dot` animation when there are no critical pressures visible (JS already controls visibility).

---

### C14-7: `#app` grid always reserves 140px for `.chronicle-band` row even in WorldShell mode
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L1914–L1915, L16732–L16734
- evidence:
  ```css
  /* L1914–1915 */
  #app{display:grid;grid-template-rows:60px 1fr 140px;grid-template-columns:1fr;
    grid-template-areas:"identity" "main" "chronicle"; …}
  ```
  ```js
  /* L16732–16734 */
  if(mainRow)mainRow.style.display=useShell?'none':'';
  if(chronBand)chronBand.style.display=useShell?'none':'';
  ```
- observed/why: When WorldShell is active, JS sets `chronicle-band` to `display:none`. Because `.chronicle-band` is a grid item with `grid-area:chronicle`, setting it `display:none` removes it from the flow but the grid row `140px` is still allocated in the track. Modern browsers (Chrome 90+) collapse implicit `display:none` grid tracks only if the track is empty or uses `auto` sizing. A fixed `140px` track **does not collapse**. This means the WorldShell view has a permanent 140px phantom gap at the bottom. In practice `.world-mode-shell` is `position:absolute;top:60px;bottom:0` which escapes the grid flow, so the phantom row is visually hidden behind the shell. However, if the shell ever mis-renders (e.g. if WorldShell errors and the shell stays `display:none`), the app shows a 140px gap at the bottom with the blank `.chronicle-band` background color.
- fix: In `applyTheme()`, when switching to WorldShell, also override `#app` grid rows: `app.style.gridTemplateRows = useShell ? '60px 1fr' : '60px 1fr 140px'`. Restore on switch back.

---

### C14-8: `search-modal`, `decipher-fab`, `web-toolbar`, `web-legend` hardcoded dark colors — not themed
- tag: QUALITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: yes
- where: L3084, L3087–L3090, L3093–L3096, L3113–L3117, L3136–L3145
- evidence:
  ```css
  /* L3084 */
  .web-svg-container{background:#06080d; …}
  /* L3087–3090 */
  .web-toolbar{background:#0a0f18; …}
  /* L3093–3096 */
  .web-legend{background:#06080d; …color:#8794a3; …}
  /* L3113–3117 */
  .web-node-detail{background:#0d1117;border:1px solid rgba(255,185,100,0.3); …color:#94a3b8; …}
  /* L3136–3145 */
  .search-modal__box{background:#0a0f18;border:1px solid rgba(255,185,100,0.35); …}
  ```
- observed/why: Relationship Web panel, Global Search modal, and Decipher FAB are hardcoded to Ember-dark colors (`#06080d`, `#0a0f18`, warm gold). In Manuscript (light) and Modern (cold dark), these surfaces will appear with the wrong background — the SVG canvas will be void-black on a light paper layout, and the gold border accent is warm-ember on Modern's cold-teal theme. These features are visually broken on non-Ember themes.
- fix: Replace hardcoded values with CSS variables. E.g. `background:#06080d` → `background:var(--color-parchment-warm)` for web surfaces; `rgba(255,185,100,0.3)` borders → `var(--color-border-default)`. For the SVG canvas, use `background:var(--color-parchment)`.

---

### C14-9: Responsive breakpoints — legacy `.main-row` layout has no mobile strategy; WorldShell has partial coverage
- tag: UX | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: yes
- where: L2774–L2780, L620–L630
- evidence:
  ```css
  /* L2774–2780 — legacy layout mobile */
  @media(max-width:1023px){.main-row{grid-template-columns:240px 1fr 280px}}
  @media(max-width:767px){
    #app{grid-template-rows:60px 1fr 100px}
    .main-row{grid-template-columns:1fr;grid-template-areas:"nation"}
    .workbench,.arsenal{display:none}
    .identity-strip__wordmark,.identity-strip__breakdown{display:none}
  }
  /* L620–630 — WorldShell mobile */
  @media (max-width:900px){.wms-panels{grid-template-columns:240px 1fr;grid-auto-rows:auto}
    .wms-panels>.wms-rp{grid-column:1 / -1}}
  @media (max-width:767px){.wms-panels{grid-template-columns:1fr; …}}
  ```
- observed/why: WorldShell has responsive breakpoints at 1100px, 900px, and 767px. However, there is a mobile gate at JS level (`checkNarrow`, `rw_mobile_dismissed`) that only triggers for narrow viewports. The 767px breakpoint in WorldShell correctly collapses panels but has no height strategy — `height:auto` on `.wms-panels` with `overflow-y:auto` is set at 767px (L629), but the left nav rail (`.wms-nav`) stays at full width (256px) with `padding:var(--wms-rail-pad)` and nav items, which will crowd the single-column layout. The `.wms-chr` footer is `grid-column:2` (L855) which is correct for desktop but for the 767px layout where everything stacks, the chronicle occupies its own row correctly. The `.wms-nav` at 767px has no width reduction or collapse rule, so the 256px nav takes the full viewport width at that breakpoint leaving no content space.
- fix: Add a `.wms-nav{width:100%; flex-direction:row; overflow-x:auto}` rule inside the 767px media query, or collapse the nav to icon-only mode below 767px.

---

### C14-10: `wms-stab-num` font-size is `140px` — no responsive scaling
- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L532–L533
- evidence:
  ```css
  .wms-stab-num{font-family:var(--font-display);font-weight:700;font-size:140px; …}
  ```
- observed/why: The stability number hero is hardcoded at 140px. At 900px viewport (where the right panel collapses under center), the left panel stays at 240px wide. 140px text in a 240px wide column with 22px padding each side = 196px available → text clips. Modern theme overrides this to 120px (L1228) but Ember and Manuscript both use 140px. No `clamp()` or responsive scaling. At the 900px breakpoint the orb is 192px wide, the num is 140px inside it which just fits, but on narrower viewports the left panel may be 240px and the num will overflow.
- fix: `font-size: clamp(80px, 12vw, 140px)` or set via container query once browser support is confirmed.

---

### C14-11: `z-index` inconsistency — `.sc-panel` at z-index 7000 conflicts with documented scale
- tag: QUALITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L103–L104, L2363–L2366
- evidence:
  ```css
  /* L103–104 — documented z-index scale */
  --z-base:0;--z-sticky:10;--z-tooltip:100;--z-toast:500;
  --z-modal-bg:1000;--z-modal:1010;--z-modal-toast:1100;
  /* L2363–2366 — sc-panel hardcoded outside the scale */
  .sc-panel{position:fixed;right:0;top:60px;bottom:0;width:480px; …
    z-index:7000; …}
  /* L2812 — tonight-mode at z-index:8000 (also hardcoded) */
  .tonight-mode{position:fixed;inset:0; …z-index:8000; …}
  /* L2842 — campaign-mode at z-index:8000 */
  .campaign-mode{position:fixed;inset:0; …z-index:8000; …}
  /* L2960 — cmp-ai-pop at z-index:8600 */
  .cmp-ai-pop{position:fixed;z-index:8600; …}
  /* L3131 — search-modal at z-index:9500 */
  .search-modal{position:fixed;top:0;left:0;right:0;z-index:9500; …}
  /* L3022 — print-preview at z-index:9500 */
  .print-preview{position:fixed;inset:0; …z-index:9500; …}
  /* L2679 — quick-npc-card at z-index:1100 */
  .quick-npc-card{position:fixed;z-index:1100; …}
  /* L1173 — ambient-layer at z-index:400 */
  #ambient-layer{position:fixed;inset:0; …z-index:400; …}
  /* L5813 — mobile-gate at z-index:9999 */
  .mobile-gate{position:fixed;inset:0;z-index:9999; …}
  ```
- observed/why: The documented `--z-*` token scale only covers up to `--z-modal-toast:1100`. Beyond that, every full-screen overlay uses arbitrary magic numbers (7000, 8000, 8050, 8600, 9499, 9500, 9999) none of which are documented in the token system. `.cmp-rail` at L2976 uses `z-index:8050` (between campaign-mode layers). If two 9500-level elements coexist (print-preview + search-modal), stacking order depends on DOM order. There's no z-index token for any of these, making future additions risky.
- fix: Extend the token system: `--z-panel:7000`, `--z-overlay:8000`, `--z-popover:8500`, `--z-search:9500`, `--z-print:9500`, `--z-gate:9999`. Replace all hardcoded values with these tokens.

---

### C14-12: Ember Utilities CSS classes are DEAD in non-Ember themes but applied unconditionally by JS
- tag: DEAD | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L357–L371, L374–L380, L413–L419
- evidence:
  ```css
  /* L357–371 — ember-ornate base is global (no body.theme-ember prefix) */
  .ember-ornate,.ember-ornate-sm{position:relative}
  /* Only the ::before/::after are ember-scoped: */
  body.theme-ember .ember-ornate::before, body.theme-ember .ember-ornate::after{ … }
  /* L374 — ember-divider base rule is GLOBAL */
  .ember-divider{display:flex;align-items:center;margin:14px 0;pointer-events:none}
  ```
  JS stamps `.ember-ornate` onto the mobile-gate card at L5814 unconditionally:
  ```js
  `<div class="mobile-gate__card ember-ornate">`
  ```
- observed/why: `ember-ornate`, `ember-ornate-sm`, `ember-divider` base rules are unscoped globals — they apply in all themes. In Manuscript/Modern, `ember-ornate` adds `position:relative` to elements and `ember-divider` adds `display:flex;margin:14px 0`. These are harmless but semantically confusing — these elements carry `ember-*` class names in non-Ember themes with no ember effect. The `ember-divider` base rule in particular applies `pointer-events:none` globally to any `ember-divider` element in all themes, which could prevent click events on child elements if used carelessly. The `.ember-divider__gem{display:none}` hides the gem in Manuscript/Modern (L1084, L1257) but the gem `.wms-sliders` dividers still render as a `flex` row with visible `::before`/`::after` if Manuscript/Modern rules don't reset them.
- fix: Scope base `ember-ornate` and `ember-divider` rules under `body.theme-ember` or rename to generic equivalents (`.ornate-corners`, `.themed-divider`). Manuscript/Modern already reset the divider lines (L1081–L1083, L1254–L1256) so that part is handled.

---

### C14-13: `body.theme-manuscript .wms-cp *{color:inherit}` — blanket color override breaks embedded non-text content
- tag: BUG | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L1041, L1106, L1142
- evidence:
  ```css
  /* L1041 */
  body.theme-manuscript .wms-cp{background-color:var(--color-parchment); color:var(--color-ink); …}
  body.theme-manuscript .wms-cp *{color:inherit}
  /* L1106 */
  body.theme-manuscript .sc-panel *{color:inherit}
  /* L1142 */
  body.theme-manuscript .modal *{color:inherit}
  ```
- observed/why: The `* {color:inherit}` rule is a heavyweight override that forces every descendant to inherit the ancestor's text color. This will incorrectly override:
  - Status color classes (`.status--thriving`, `.status--crisis`) — their `color:var(--color-thriving)` declarations will be overridden to `inherit` from `.wms-cp` → all status indicators render in manuscript ink color, losing semantic color coding.
  - Pressure card colored text (`.wms-pc-type--crit{color:var(--color-crisis)}`)
  - Faction dot colors (`.wms-fdot--a{…}`)
  - Any SVG `fill:currentColor` that relies on computed color from a specific class
  The rule's intent is clearly to ensure manuscript ink color wins for text, but blanket `*{color:inherit}` is too broad. The same pattern appears in `.sc-panel *` and `.modal *`.
- fix: Remove `* {color:inherit}` rules. Instead, explicitly set `color` on the specific child elements that need it (section labels, title text, body text). Use `:not([class*="status--"]):not([class*="wms-fdot"]) {color:inherit}` as a narrower override if broad coverage is truly needed.

---

### C14-14: `body.theme-modern .identity-strip` uses `--color-ink:#e8edf2` (very light) as background but strip background is `var(--color-ink)` — light text on light background
- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L1916–L1918, L275–L278, L2600–L2612
- evidence:
  ```css
  /* L1916–1918 — global base: identity-strip uses var(--color-ink) as background */
  .identity-strip{background:var(--color-ink); …}
  /* L275–278 — Modern theme redefines --color-ink to a LIGHT value */
  body.theme-modern{
    --color-ink:#e8edf2;    /* text-primary, 15.7:1 — THIS IS NEAR-WHITE */
    --color-ink-elevated:#1f262f;
    --color-parchment:#0e1116; …}
  /* L2600–2612 — Modern correctly overrides strip text colors to dark */
  body.theme-modern .identity-strip__wordmark,
  body.theme-modern .identity-strip__nation-switcher-btn{color:#0e1116}
  ```
- observed/why: In the Modern theme, `--color-ink` is `#e8edf2` (near-white), consistent with the inverted dark-surface / light-text model. The base `.identity-strip{background:var(--color-ink)}` correctly produces a near-white strip in Modern. The Modern parity sweep at L2600–L2612 correctly overrides all strip element colors to dark values. So the actual visual output is intended and correct. **However**, there is a latent trap: any new component that uses `color:var(--color-ink)` inside `.identity-strip` will render as invisible (near-white text on near-white background) in Modern. There is no warning or doc comment on the Modern `--color-ink` token explaining this inversion.
- fix: Add a comment on the Modern `--color-ink` token explaining that it is the primary text color on dark surfaces AND coincidentally the strip background color. Consider aliasing: `--color-strip-bg: var(--color-ink)` with explicit `--color-strip-fg: #0e1116` token to make this relationship explicit.

---

### C14-15: `.sample-picker__tag` and `.tonight-section__label` use `var(--ember-color)` directly — renders as teal in Modern, wrong brand signal
- tag: QUALITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: yes
- where: L1380, L2829
- evidence:
  ```css
  /* L1380 */
  .sample-picker__tag{ …color:var(--ember-color); border:1px solid rgba(255,185,100,0.28); …}
  /* L2829 */
  .tonight-section__label{ …color:var(--ember-color); …}
  ```
- observed/why: `--ember-color` is defined in `:root` as a fallback (`var(--color-gold)`) and overridden per-theme. In Modern, `--ember-color` resolves to `var(--color-gold)` = `#5ec8d8` (teal). In Manuscript, it resolves to `var(--color-gold)` = `#1F5170` (drafting blue). The hardcoded border `rgba(255,185,100,0.28)` (warm amber) on `.sample-picker__tag` will NOT follow the theme variable — it stays warm amber even in Modern/Manuscript, creating a mismatch between the text color (teal/blue) and the border (warm amber).
- fix: Replace `rgba(255,185,100,0.28)` with `color-mix(in srgb, var(--ember-color) 28%, transparent)` or a semantic token like `rgba(from var(--color-gold) r g b / 0.28)` (requires modern CSS). Short-term: use `border-color: var(--color-gold-pale)` which is theme-aware.

---

### C14-16: DEAD CSS — sampled selectors with no matching DOM
- tag: DEAD | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: no
- where: Various
- evidence (sampled, not exhaustive):

  **`.canon-rings__outer`, `.canon-rings__inner`, `.canon-rings__diamond`** (L1849–L1860):
  These are Ember-scoped selectors for a rotating ring widget inside `.canon-candidate`. Grep shows HTML only creates `.canon-candidate__rings` as a container; `.canon-rings__outer`, `.canon-rings__inner`, `.canon-rings__diamond` are populated by JS. JS does create these in the copilot review queue flow (NEEDS-LIVE-VERIFY: the JS section was not in this chunk's scope). If JS does not stamp them, these rules are dead.

  **`.wms-pc-eyebrow`, `.wms-pc-dot`, `.wms-pc-head`, `.wms-pc-body`** — verified LIVE (JS renders them at L14091–L14096). Not dead.

  **`.copilot-launch.is-hidden{display:none}`** (L2505):
  Used. `copilot-launch` exists in DOM (grep shows HTML at this range), `.is-hidden` toggled by JS.

  **`.rw-acc-chip--ok`** (L1457):
  Only `.rw-acc-chip--ok .rw-acc-chip__dot{color:#9ce8a3}` is defined. `.rw-acc-chip--ok` itself has no border override (unlike `--warn` and `--hot`). This is a visual gap — "ok" state chip looks the same as neutral except for the dot color, which may be intentional.

  **`.eb-adversary__name` uses `var(--color-text-heading)`** (L2661):
  `--color-text-heading` is undefined in any theme block. Resolves to inherited value. Adversary name in encounter results renders as inherited body text color rather than a heading emphasis color.

- fix: Define `--color-text-heading: var(--color-ink)` in `:root` (it's a missing alias). Investigate `canon-rings__*` to confirm JS actually stamps them; if not, remove the CSS.

---

## Summary

| Severity | Count |
|----------|-------|
| HIGH     | 3     |
| MEDIUM   | 5     |
| LOW      | 8     |
| POLISH   | 0     |
| **Total**| **16**|

**Top 3 findings:**

1. **C14-2 (HIGH)** — 9 CSS custom properties (`--color-surface-1`, `--color-border`, `--color-text-body`, `--text-heading-sm`, `--text-heading`, `--text-label-md`, `--text-body-md`, `--color-surface-raised`, `--color-text-heading`) used in component CSS but never defined. Results in transparent/invisible Encounter Builder fields, broken handout body text color, invisible snapshot list backgrounds, and wrong font-sizes across Campaign Mode and Tonight Mode.

2. **C14-5 (MEDIUM/HIGH)** — 8+ WorldShell sub-elements (`wms-pc-eyebrow`, `wms-fc-avatar`, `wms-fc-loyalty-*`, `wms-ae-title-row`, `wms-chr-label-row`, etc.) are rendered by JS in all themes but only CSS-styled in Ember. In Manuscript and Modern, these elements render unstyled — invisible loyalty bars, un-laid-out eyebrow rows, raw arsenal title + lock icon stacked vertically.

3. **C14-13 (MEDIUM)** — `body.theme-manuscript .wms-cp * {color:inherit}` and `.sc-panel * {color:inherit}` blanket overrides suppress all semantic status colors (thriving/crisis/stable) within those containers in Manuscript theme. Status indicators, pressure card type labels, and faction dot colors all render as manuscript ink (#182230) regardless of their semantic class.
