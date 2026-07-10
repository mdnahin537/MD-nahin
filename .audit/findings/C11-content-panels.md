# C11 — Content Panels Audit
Chunk: lines 14391–15483  
Modules: PrintPreview, Fronts, Handouts, Bestiary, Relations, RealmSettings, RelationshipWeb  
Auditor: sub-agent (Sonnet 4.6), 2026-06-04

---

### C11-1: RelationshipWeb `_render()` stacks a new `svg.click` listener on every render call

- tag: BUG | severity: CRITICAL | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L15394–L15399
- evidence:
  ```js
  // Inside _render() — called on every node click, drag frame, filter change, build
  svg.addEventListener('click',()=>{
    this._selected=null;
    ...
    this._render();   // each click listener calls _render(), which adds ANOTHER listener
  });
  ```
- observed/why: `_render()` is called every time a node is clicked, dragged (once per mousemove), a filter checkbox changes, or `build()` runs. Each call registers a fresh `click` listener on the SVG element (which is persistent — only its `innerHTML` is replaced). After 50 drag-frame renders the SVG element has 50 stacked click listeners. When the user then clicks the background, all 50 fire, each calling `_render()`, each adding another listener — exponential accumulation. At the very minimum: every click fires N handlers after N renders; in practice the count grows unboundedly. Confirmed via Node simulation: 50 renders → 50 handlers fire on next click, each re-rendering (and adding another). This is a performance collapse and functional corruption (selection logic runs multiple times per click, producing flickering toggles).
- fix: Move the background-click listener to `init()` (runs once), alongside the other persistent listeners. Remove it from `_render()`.

---

### C11-2: PrintPreview keydown (Escape) listener leaks on close-button dismiss

- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L14430–L14434
- evidence:
  ```js
  const onKey=e=>{if(e.key==='Escape'){this.close();document.removeEventListener('keydown',onKey);}};
  document.addEventListener('keydown',onKey);
  // ...
  close(){
    if(this._el){this._el.remove();this._el=null;}
    // onKey is NOT removed here
  }
  ```
- observed/why: `onKey` removes itself only when Escape is pressed. If the user dismisses via the "Close" button (or any other code path calling `close()` directly), the anonymous `keydown` handler stays attached to `document` for the lifetime of the page. Each PrintPreview session that is dismissed via the button adds another permanent listener. On the next key press all orphaned handlers fire; since `this._el` is null, `this.close()` is a no-op but the listener keeps accumulating. Long sessions (Story Bible, Session Prep, Handout print) compound this.
- fix: Store `onKey` on `this._onKey`; call `document.removeEventListener('keydown',this._onKey)` inside `close()`, then null it.

---

### C11-3: Story Bible PDF (generatePDF) silently omits Fronts, Bestiary, and Relations

- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L8963–L9201 (generatePDF); cross-ref L8882–L8961 (FoundryExport.build)
- evidence:
  ```js
  // generatePDF sections: Stats, Factions (optional), Chronicle, Characters (optional),
  // Artifacts (optional), Stability Formula (optional), Glossary (if present)
  // — no Fronts section, no Bestiary section, no Relations section
  
  // FoundryExport.build() array:
  [this._buildRealmOverview(n), this._buildChronicle(n), this._buildFactions(n),
   this._buildCharacters(n), this._buildLocations(n), this._buildHooks(n),
   this._buildSecrets(n)]
  // — no Fronts, no Bestiary, no Relations builders exist
  ```
- observed/why: All three modules (Fronts, Bestiary, Relations) store data in `n.fronts`, `n.bestiary`, and `n.relations` respectively — all persisted normally. But neither the Story Bible PDF export nor the Foundry VTT export includes them. A GM who has built an active threat clock roster, a creature library, and cross-realm diplomacy gets a PDF and Foundry import with none of that content. This confirms and extends the sibling finding about FoundryExport silently dropping data. The Story Bible's "Export Options" UI (lines 8966–8971) has no checkboxes for these three modules either, so there is no way to opt them in.
- fix: Add optional `incFronts`, `incBestiary`, `incRelations` checkboxes to the Export modal; render corresponding sections in `generatePDF()` and add `_buildFronts`, `_buildBestiary`, `_buildRelations` builder methods to `FoundryExport`.

---

### C11-4: RelationshipWeb `_runSim` uses `nodes.find()` per-edge per-tick — O(n²) edge lookup on top of O(n²) repulsion

- tag: PERF | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L15248–L15256
- evidence:
  ```js
  edges.forEach(e=>{
    const a=nodes.find(n=>n.id===e.s);   // O(n) linear search
    const b=nodes.find(n=>n.id===e.t);   // O(n) linear search
    ...
  });
  ```
- observed/why: The repulsion loop is already O(n²) per tick (n=80 max, 3160 pairs). The spring loop makes it worse: for each edge (up to ~240 edges for 80 nodes with 3 edge types), two O(n) `find()` calls scan the nodes array. At 80 nodes + 240 edges + 200 ticks: 240 × 2 × 80 × 200 = 7,680,000 comparisons for the spring force alone, compared to 632,000 for repulsion. Node: the repulsion loop runs in ~21 ms (measured); the spring find() overhead compounds this. For worlds at the 80-node cap this creates a noticeable (~100ms+) synchronous UI freeze on first open or filter change.
- fix: Build a `Map<id, node>` index before the tick loop: `const byId = new Map(nodes.map(n=>[n.id,n]));` then use `byId.get(e.s)` — O(1) per edge lookup.

---

### C11-5: Relations notes-blur handler silently drops notes when no prior posture exists

- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L14975–L14981
- evidence:
  ```js
  el.querySelectorAll('[data-rel-notes]').forEach(input=>{
    input.addEventListener('blur',()=>{
      const toNid=input.dataset.relNotes;
      const existing=State.getRelation(n.id,toNid);
      if(existing)State.setRelation(n.id,toNid,existing.posture,input.value);
      // if(!existing) → notes are DISCARDED silently
    });
  });
  ```
- observed/why: When two realms have never had a posture set (i.e. the relation record doesn't exist yet), `State.getRelation()` returns `null`. The notes the GM typed are silently discarded on blur. The user sees a UI with a notes field but notes they enter are not saved unless they first click a posture button. This is a data-loss bug for a feature that looks fully wired.
- fix: In the `else` branch, create the relation with default posture 'neutral': `else State.setRelation(n.id,toNid,'neutral',input.value);`

---

### C11-6: Fronts panel missing from `Render.refreshOpenPanels` — stale on undo / import / RealmSettings save

- tag: WIRING | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L7703–L7715 (refreshOpenPanels), L14658–L14660 (Fronts sc:changed bind)
- evidence:
  ```js
  // refreshOpenPanels covers: sessions, hooks, secrets, locations, bestiary,
  // relations, web, threads — no 'fronts' case
  if(open==='sessions'&&...) ...
  else if(open==='bestiary'&&...) ...
  // 'fronts' is not listed
  ```
  ```js
  // Fronts does self-refresh via sc:changed...
  document.addEventListener('sc:changed',e=>{
    if(e.detail?.fields?.includes('front'))this.renderList();
  });
  // ...but Render.all() doesn't dispatch sc:changed; it calls refreshOpenPanels directly
  ```
- observed/why: When `Render.all()` fires (undo, import, nation switch, RealmSettings.save), the Fronts panel stays stale if open. The Fronts module's own `sc:changed` listener only fires when the `front` field is included — Render.all() goes through `refreshOpenPanels` which skips fronts entirely. A GM who edits realm settings while the fronts panel is open will see the old state until they close and reopen it.
- fix: Add `else if(open==='fronts')SHSPanels.renderFronts();` to `refreshOpenPanels`.

---

### C11-7: RelationshipWeb has no touch event handling — non-functional on mobile

- tag: UX | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: yes (browser)
- where: L15420–L15480 (init)
- evidence:
  ```js
  // init() registers: mousemove, mouseup, mouseleave, mousedown, wheel
  // No: touchstart, touchmove, touchend — zero touch events registered
  container.addEventListener('mousemove',evt=>{...});
  svg.addEventListener('mousedown',evt=>{...});
  // (no touch equivalent)
  ```
- observed/why: The RelationshipWeb panel advertises node dragging, panning, and zooming. On touch devices (phones/tablets) none of these interactions work — the graph is render-only. Given the rest of the app has explicit CSS patches for coarse-pointer devices (e.g. L559, L804), the omission is likely intentional deferral but it makes the feature useless on mobile where the GM console view is commonly used.
- fix: Add `touchstart`/`touchmove`/`touchend` handlers mirroring the mouse handlers (single-touch = drag/pan, two-finger pinch = zoom). Alternatively, gate the panel with a mobile-not-supported notice.

---

### C11-8: `RealmSettings.save()` mutates nation object directly without dispatching `sc:changed`

- tag: WIRING | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L15053–L15068
- evidence:
  ```js
  save(){
    const n=State.get();if(!n)return;
    State.pushUndo();
    // Direct mutations on n:
    if(nameVal)n.name=nameVal;
    n.era=get('rs-era').trim();
    ...
    State._touch(n.id);
    State.persist();
    if(typeof Render!=='undefined')Render.all(); // no sc:changed dispatch
  ```
- observed/why: All other nation-mutation paths (addFront, updateFront, setRelation, etc.) dispatch `sc:changed` so reactive listeners (Copilot accuracy chip, live-mode, stat-trigger checker, anything using `sc:changed`) stay in sync. RealmSettings.save() bypasses this: it directly calls `Render.all()` which only handles the visual layer. Any module listening to `sc:changed` with `fields.includes('nation')` (e.g. line 6702, 6718) will NOT be notified. In particular, the WorldShell render inside Render.all() gets the update, but anything outside Render.all() that reacts to nation name/era/government changes via sc:changed is blind to this write.
- fix: After `State._touch(n.id);`, add: `document.dispatchEvent(new CustomEvent('sc:changed',{detail:{fields:['nation'],nid:n.id}}));` and remove the direct `Render.all()` call (let the event dispatch trigger the render via `dispatchRender`).

---

### C11-9: `_showDetail` uses `innerHTML` with `E()` output mixed with raw expression

- tag: SECURITY | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: no
- where: L15416
- evidence:
  ```js
  detail.innerHTML=`<h4>${E(n.label)}</h4><p ...>${E(typeLabel)} · ${connected} connection${...}</p>${extra}`;
  // extra is built via:
  extra=`<p>Role: ${E(n.data.role||'—')}</p><p>Status: ${E(n.data.status||'—')}</p>`;
  ```
- observed/why: `extra` is a locally assembled string with all values escaped via `E()` and the integer `connected` is type-safe. The risk is low given `E = Utils.escHtml` is applied consistently. However, `typeLabel` at L15407 is looked up from a hardcoded map with a fallback `n.type` — and `n.type` comes from user-supplied data via State. The pattern is: `{character:...,faction:...,location:...,}[n.type]||n.type`. If `n.type` is not one of the three known values, the raw `n.type` string is inserted unescaped into `innerHTML`. Confidence is MED because current code paths only generate known type values, but if a future import or migration creates a node with a crafted `type` field this would be an XSS vector.
- fix: Wrap the fallback: `const typeLabel={character:'Character',...}[n.type]||E(n.type);`

---

### C11-10: Handouts module — no state persistence; generated text is ephemeral

- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L14703–L14796
- evidence:
  ```js
  // Handouts.generate() writes to DOM elements only:
  document.getElementById('handout-output-title').textContent=result.title||'Handout';
  document.getElementById('handout-body').textContent=result.body||'';
  // No call to State.*, no persist(), no sc:changed dispatch
  ```
- observed/why: Generated handouts are not saved anywhere. Close the modal or switch tabs and the generated text is gone. There is no "Save to Handouts" or equivalent. The copy/print functions work as workarounds, but a GM who generates a great proclamation during session prep and dismisses the modal loses it permanently with no warning. This is a gap relative to features like Bestiary (which saves to `n.bestiary`) and Sessions (which persist).
- fix: Either add a `Save handout` button that writes to a `n.handouts[]` array in State (with corresponding CRUD), or at minimum show a "This is temporary — copy or print before closing" notice in the modal footer.

---

### C11-11: `clockSize` on edit does not validate against existing `clockFilled`

- tag: BUG | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L14617 (saveFront), L14613–L14641
- evidence:
  ```js
  const clockSize=parseInt(document.querySelector('#nf-clock-size .is-selected')?.dataset.size||'6',10);
  // ...
  State.updateFront(nid,editId,cfg);  // cfg includes {clockSize: newSize}
  ```
  ```js
  // State.updateFront at L7265-7273:
  Object.assign(f,patch);  // blindly overwrites clockSize
  ```
- observed/why: If a front has clockFilled=5 and the GM edits it to change clockSize from 8 to 4, `clockFilled` (5) will exceed `clockSize` (4) after the save. The clock SVG renders correctly (it clips at `clockSize` in `clockSVG()`), but the underlying data is corrupt: `clockFilled > clockSize`. Subsequent Tick operations start from the wrong filled value; auto-resolution (clockFilled === clockSize check in tickFront) would trigger immediately. `tickFront` already clamps `f.clockFilled=Math.min(...)` on tick, but `updateFront` does not clamp at all.
- fix: In `saveFront()`, after getting `clockSize`, clamp against existing filled: `const existingFront=(n?.fronts||[]).find(x=>x.id===editId); cfg.clockFilled=existingFront?Math.min(existingFront.clockFilled,clockSize):0;`

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH     | 3 |
| MEDIUM   | 3 |
| LOW      | 3 |
| POLISH   | 0 |

**Top 3 findings:**

1. **C11-1 (CRITICAL)** — `RelationshipWeb._render()` stacks a new `svg.click` listener on every render. After repeated interaction the SVG has hundreds of stacked handlers that each call `_render()` recursively. Guaranteed performance collapse and logical corruption in any non-trivial session.

2. **C11-3 (HIGH)** — Story Bible PDF and Foundry VTT export silently omit Fronts, Bestiary, and Relations — three persistent modules with no export path. Confirms and extends the sibling FoundryExport finding. GMs cannot get these data out.

3. **C11-5 (HIGH)** — Relations notes typed into the `blur`-save input field are silently discarded unless a posture has already been set via the pill buttons. A wired-looking notes field that loses data without feedback.
