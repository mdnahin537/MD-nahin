# C10 — WorldShell / GM-Mode / Threads / SHSPanels Audit

Chunk: `C10`, lines 12723–14390. Modules: SHSPanels (12723), GMMode (13444), Threads (13776), WorldShell (13946).

**Architecture finding that frames everything below (read first):**
GM mode in this app is **cosmetic only**. `isGMMode()` (L5993) returns `meta.settings.gmMode`; the *only* things it drives are terminology (`Term()`, L5986) and the GM tool-bar entrance/exit animation (`GMMode.apply`, L13451). Secret/forecast *visibility* is a **separate, independent** pair of settings — `showSecrets` / `showForecasts` (L4736) — toggled at L16280/16274. There is **no "player view"** that hides the Secrets/Hooks panels; those panels are GM-prep tooling and always show every record. So the classic "GM-only field leaks in player view" bug does not exist as framed — but the OTHER half of C08b-2 (the visibility filter) lives here and has a real, default-path defect. See C10-1.

---

### C10-1: "Show Secrets" / "Show Forecasts" toggles silently no-op on the default (shell) layout
- tag: WIRING | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L16273–16285 (toggle handlers), L14271–14317 (`WorldShell._renderChronicle`), L16726–16736 (`applyTheme` layout switch), L7997 (`Render.chronicleBand`)
- evidence:
  - Toggle handlers re-render only the **legacy** band:
    `document.getElementById('toggle-secrets')?.addEventListener('click',()=>{ ... Render.chronicleBand();Render.recentPulse(); });` (L16280–16285)
  - In every production theme the legacy band is **hidden**, only WorldShell shows:
    `if(chronBand)chronBand.style.display=useShell?'none':'';` and `if(useShell){...WorldShell.render(nat);}` (L16734–16736). `useShell` is true unless the hidden `rw_legacy_layout` debug flag is set (L16727–16728).
  - WorldShell's chronicle reads the same settings (`if(e.visibility==='private'&&!settings.showSecrets)return false;` L14277–14278) but is only repainted by `WorldShell.render()` (via `Render.all()` L7696 / `dispatchRender` L7696). Neither toggle calls it.
- observed/why: The user flips "Show Secrets"/"Show Forecasts" in Settings; `Render.chronicleBand()`/`recentPulse()` redraw nodes that are `display:none`. The visible WorldShell timeline never re-filters, so the toggle appears dead — secret/forecast events that were already on screen stay on screen, and newly-revealed ones never appear until an unrelated full `Render.all()` fires (slider drag, undo, import). This is the player-facing half of C08b-2: the gate exists in code but the control that drives it is mis-wired in the default layout, so a GM who hits "hide secrets" before showing the screen to players is **not actually hiding them**. Trust-breaking for a GM tool.
- fix: In both toggle handlers (L16278, L16284) also refresh the shell, e.g. append `if(typeof WorldShell!=='undefined'){const nat=State.get();if(nat)WorldShell.render(nat);}` — or simplest: replace the two render calls with `Render.all();`.

---

### C10-2: WorldShell chronicle does not enum-validate `visibility` — non-`private`/`forecast` secret events render (confirms + extends C08b-2)
- tag: SECURITY | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L14276–14280
- evidence:
  `const visible=nat.chronicle.filter(e=>{ if(e.visibility==='private'&&!settings.showSecrets)return false; if(e.visibility==='forecast'&&!settings.showForecasts)return false; return true; });`
- observed/why: This is the exact pattern C08b-2 flagged in the legacy/recentPulse renderers (L7933, L8005–8006), reproduced verbatim in the WorldShell chronicle. The "hide" decision is a literal-string compare against `'private'`. Event `visibility` is never enum-validated on input (AI tool path L9667/9704 takes `args.visibility||'public'`; paste path L8305 takes `p[3]||'public'`; edit form L16038 takes raw select value). Any event whose `visibility` is anything other than the exact string `'private'` (e.g. a future "secret", "hidden", a typo, an AI-emitted `'gm'`, or empty) passes the filter and is drawn to the timeline even with "Show Secrets" off. So the WorldShell timeline can leak GM-only content to players. Same root cause, second render site — both must be fixed together.
- fix: Centralise one helper, e.g. `isHiddenFromPlayers(e,settings)` that whitelists `['public']` as always-visible and treats everything not explicitly allowed as gated; or normalise `visibility` to the enum at write time (clamp to `public|private|forecast`, default `private` for unknown). Apply at L7933, L8005, **L14277** identically.

---

### C10-3: Default-layout users can't reveal forecasts at all (forecast toggle equally dead)
- tag: WIRING | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L16274–16279, L14278
- evidence: `Render.chronicleBand();Render.recentPulse();` on the forecast toggle (L16278) — same hidden-element problem as C10-1; WorldShell's `if(e.visibility==='forecast'&&!settings.showForecasts)return false;` (L14278) only re-evaluates on full render.
- observed/why: Mirror of C10-1 for forecasts. A GM who *wants* to see possible-future events on the main dashboard toggles "Show Forecasts" and nothing happens until an unrelated full re-render. Feature looks broken. Same fix as C10-1 covers both.

---

### C10-4: `renderLocations()` re-renders the detail pane twice per click and re-binds the whole tree on every selection
- tag: PERF | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L13199–13208 (tree click handler), L13208 (`this._renderLocDetail(this._locSelectedId)`)
- evidence:
  `el.addEventListener('click',()=>{ this._locSelectedId=el.dataset.locId; this.renderLocations(); this._renderLocDetail(el.dataset.locId); });` then `renderLocations` itself ends with `this._renderLocDetail(this._locSelectedId);` (L13208).
- observed/why: One click → `renderLocations()` rebuilds the entire tree HTML and re-attaches a click+keydown listener to every node, then calls `_renderLocDetail` once internally and once again from the handler. Detail pane is built twice; tree listeners churn on each selection. Harmless on small trees (innerHTML replacement frees old listeners, so not a leak), but wasteful and fragile as location count grows. Not a correctness bug.
- fix: Drop the redundant `this._renderLocDetail(el.dataset.locId)` in the handler (the tail call in `renderLocations` already covers it), or update only the previously-selected and newly-selected nodes' `is-selected` class instead of rebuilding the tree.

---

### C10-5: `WorldShell._renderChronicle` particle-count / re-render runs on every slider input (debounced) — heavy paint on a hidden-cost path
- tag: PERF | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: yes
- where: L14012–14014 (`_sonarDebounce` 100ms), L14283 (`spawnParticles`), L14319–14335
- evidence: `clearTimeout(this._sonarDebounce);this._sonarDebounce=setTimeout(()=>this._fireSonarPings(),100);` plus `_renderChronicle` rebuilds `nodesEl.innerHTML` and re-creates particle DOM each `WorldShell.render()`.
- observed/why: Every `dispatchRender`/`Render.all()` repaints the chronicle nodes and (unless count is unchanged, guarded at L14321) the particle field, and re-fires sonar pings 180ms apart per faction dot. During a slider drag, `attachSlider`→state→`dispatchRender` can fire `WorldShell.render` many times; sonar is not debounced the way the per-frame slider fill is. Likely fine but worth a live profile on a large nation. Flagging as suspicion only.
- fix: Skip `_fireSonarPings`/particle work when the render was triggered by a stat-only change, or debounce sonar with the existing `_sonarDebounce`.

---

### C10-6: GM tool buttons (Stakes, Strong Start, Quick NPC, Session Prep, Secrets "Generate 10") hard-fail closed when Copilot unconfigured — but with inconsistent affordance
- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L13127, L13551–13560, L13577–13582, L13659–13663, L13676–13681
- evidence: Each entry point guards `if(typeof Copilot==='undefined'||!Copilot.isConfigured()){showToast('Configure your API key…');return;}`.
- observed/why: Correct (no crash, no silent no-op) — these are well-wired. The nit: the buttons remain fully enabled/clickable with no visual "needs API key" state, so a new user clicks GM-bar tools and only learns via a toast each time. Not a bug; a discoverability gap on a paid product. (Noted because the brief asked for controls whose handler effectively no-ops for the common unconfigured user.)
- fix: Optionally disable/annotate AI-dependent GM-bar tools when `!Copilot.isConfigured()`.

---

## Wiring sanity (verified, no defect):
- All module `bind()`/`mount()` called exactly once at init: `SHSPanels.bind` L17384, `Threads.bind` L17396, `GMMode.bind` L16403, `WorldShell.mount` L17462, `GMMode.apply({instant:true})` L17493. ✓
- `GMMode.bindBar` guards re-entry with `bar._gmBound` (L13520); document-level click listener added once. ✓
- `Threads.bind` (L13935) only wires `panel-threads-close`; the same close button is also wired in `SHSPanels.bind` (L13401) → **double-bound but idempotent** (both call `SHSPanels.closeAll()`); harmless, minor dup.
- `SHSPanels.saveSecretsToRealm` (L13144) IS called (Tonight, L12661). Not dead.
- `renderFronts`/`renderSolo`/`renderBestiary`/`renderRelations`/`renderThreads`/`renderWeb` (L13155, L13430–13439) all reached via `openPanel` (L12739) and `refreshOpenPanels` (L7708–7715). ✓
- WorldShell view routing uses `data-route` (markup L3456–3489), event-delegated at L14352. **The brief's premise "no data-view attributes exist" is correct but `data-route` does** — all 12 nav routes map to a panel or to `closeAll()`; no unreachable route, no route without a target. ✓
- Per-element listeners in `_renderFactions`/`_renderChars`/`_renderArsenal`/`_renderChronicle`/Threads lists are attached to nodes inside an `innerHTML`-replaced container, so old listeners are GC'd on each render — **not** leaks. `_renderThreadsCard` deliberately `cloneNode`+`replaceWith` on `wms-threads-link` (L14219) to avoid stacking. ✓

## Summary
Counts by severity: HIGH 2 · MEDIUM 1 · LOW 3 (PERF/UX) · (wiring sanity items: clean).

Top 3:
1. **C10-1 (HIGH, WIRING):** "Show Secrets"/"Show Forecasts" toggles re-render only the hidden legacy band, never the visible WorldShell chronicle — the controls silently no-op for all default-theme users. A GM cannot actually hide secrets before showing the screen.
2. **C10-2 (HIGH, SECURITY):** WorldShell chronicle filter compares `visibility` against the literal `'private'`/`'forecast'` with no enum validation (C08b-2's root cause, second render site) — any other/typo/AI-emitted visibility value leaks GM-only events to the timeline.
3. **C10-3 (MEDIUM, WIRING):** Forecast toggle is equally dead on the default layout (same mis-wire as C10-1).
