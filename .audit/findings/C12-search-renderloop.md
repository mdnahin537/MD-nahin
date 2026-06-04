# C12 — GlobalSearch + Central Render Loop

Chunk: lines 15484–16645  
File: `6b9eaae1-relamwrith_V7.HTML`

---

### C12-1: GlobalSearch silently omits fronts, relations, artifacts, and glossary

- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L15525–L15582
- evidence:
  ```js
  const groups=[
    {type:'characters',...},
    {type:'factions',...},
    {type:'locations',...},
    {type:'events',...},      // searches nation.chronicle
    {type:'secrets',...},
    {type:'hooks',...},
    {type:'sessions',...},
    {type:'bestiary',...},
  ]
  ```
- observed/why: Four entity types present in the data model are never indexed: `fronts` (`nation.fronts`), `relations` (`nation.relations`), `artifacts` (`nation.artifacts`), and `glossary` (`nation.glossary`). The data model at L6363–6366 confirms all four exist. A user searching for a front by name, a cross-realm relation, an artifact, or a glossary term gets zero results with no indication anything is missing. The companion chunk (C11) noted fronts, bestiary, and relations were omitted from exported field lists — here the same gap appears in search.
- fix: Add four group entries to the `groups` array mirroring the existing pattern. For glossary, search `nation.glossary?.entries||[]` on `entry.term` and `entry.definition`. Navigate fronts → `SHSPanels.openPanel('fronts')`; relations → `SHSPanels.openPanel('relations')`.

---

### C12-2: Search `_activate` dead-ends for characters, factions, and events

- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L15619–L15625
- evidence:
  ```js
  const panelMap={
    characters:'war-room', factions:'war-room', events:'chronicle',
    secrets:'secrets', hooks:'hooks', sessions:'sessions',
    locations:'locations', bestiary:'bestiary',
  };
  const route=panelMap[item.type];
  if(route)SHSPanels.openPanel(route);
  ```
  `SHSPanels.openPanel` (L12726–12740):
  ```js
  ['sessions','hooks','secrets','fronts','locations','bestiary','relations','web','solo','threads']
    .forEach(p=>{...});
  const panel=document.getElementById(`panel-${which}`);
  if(!panel)return;          // ← early return
  panel.classList.add('is-open');
  this._open=which;
  this[`render${...}`]();
  ```
- observed/why: `openPanel('war-room')` tries `document.getElementById('panel-war-room')` — that element does not exist, so it returns immediately. `_open` is never set. The user clicks a character or faction search result, `close()` runs (wiping `_results`), then `openPanel('war-room')` silently no-ops. The screen is unchanged. Same for `openPanel('chronicle')` (events) — `panel-chronicle` is not in the DOM. Clicking these search results does nothing visible after the modal closes. Proven by Node simulation: `openPanel` iterates a hardcoded list that excludes both `war-room` and `chronicle`.
- fix: Map `characters` and `factions` to `'war-room'` only after triggering `SHSPanels.openPanel` with a real panel name, or scroll/highlight within WorldShell. Simplest correct route: characters → open `SHSPanels.openPanel('war-room')` after adding `'war-room'` to the panel list, OR directly call `WorldShell._filterTab='characters'` and scroll. For events, navigate by opening the detail panel directly: `Render.openDetailPanel(item.entityId)`.

---

### C12-3: `AccuracyChip.mount()` adds permanent `sc:changed` listeners on every modal open — unbounded listener leak

- tag: PERF | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5715–L5731 (mount), L17366–L17381 (caller)
- evidence:
  ```js
  // mount() — called on every sc:modal-open for 9 surfaces:
  mount(containerEl, surface, opts={}){
    ...
    document.addEventListener('rw:effort-changed', e=>{...refresh()...});  // permanent
    document.addEventListener('sc:changed',        e=>{...refresh()...});  // permanent
  }
  // caller at L17366:
  document.addEventListener('sc:modal-open', e=>{
    ...
    slot.innerHTML='<div class="rw-surface-meta__chip"></div>';
    const chipEl = slot.querySelector('.rw-surface-meta__chip');
    AccuracyChip.mount(chipEl, surface, {});  // new mount() every open
  });
  ```
- observed/why: Nine modal surfaces trigger `AccuracyChip.mount()`. Each call unconditionally appends two listeners to `document` — no AbortController, no `_bound` guard, no removal. When the modal is opened again, `slot.innerHTML=''` destroys the old `chipEl`, but the two old listener closures (which close over the stale `containerEl`) remain alive on `document`. Every subsequent `sc:changed` event fires all accumulated stale closures. Opening session-prep modal 10 times creates 20 dead listeners; opening all 9 modal surfaces 20 times = 360 stale listeners, each calling `containerEl.innerHTML = chip_html` on a detached DOM node. The waste grows unboundedly for the lifetime of the session. This is the same class of bug as C11-1 (which the brief flagged as CRITICAL), but for accuracy chips rather than render functions.
- fix: Add an AbortController per mount: store `let ctrl = null` on `containerEl`, cancel on remount. Or check `containerEl._refreshAccChip` and skip re-registering if already mounted for that surface:
  ```js
  if(containerEl._surfaceMounted===surface) { refresh(); return; }
  containerEl._surfaceMounted=surface;
  ```

---

### C12-4: `dispatchRender` ignores `faction` field — AI faction-stance changes leave war-room UI stale

- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L15690–L15712
- evidence:
  ```js
  function dispatchRender(e){
    const {fields}=e.detail||{};
    if(!fields)return Render.all();
    if(fields.includes('nation')){...Render.all();return;}
    Render.identityStrip();
    if(fields.includes('stat')||fields.includes('chronicle')){...}
    if(fields.includes('customStat'))Render.workbench();
    if(fields.includes('character')){Render.workbenchCharacters();Render.nationCard();}
    Render.refreshOpenPanels(fields);
    if(typeof WorldShell!=='undefined'...)WorldShell.render(_nat);
  }
  ```
  AI tool at L9735:
  ```js
  document.dispatchEvent(new CustomEvent('sc:changed',{detail:{fields:['faction'],nid:n.id}}));
  ```
- observed/why: When the Copilot's `factionStance` tool fires, `dispatchRender` receives `fields=['faction']`. It hits none of the `if` branches (`stat`, `chronicle`, `customStat`, `character`). Only `Render.identityStrip()` runs. `Render.workbench()` — which renders the faction list in the war-room — is never called. The war-room panel showing faction positions remains stale. The user sees the AI "change" a faction's position, but the panel doesn't update until a subsequent `Render.all()`. WorldShell also doesn't re-render factions for this field.
- fix: Add `if(fields.includes('faction'))Render.workbench();` after the `customStat` check in `dispatchRender`.

---

### C12-5: Inscribe-event handler calls `Render.all()` after `State.addEvent` already dispatched `sc:changed` — double render

- tag: PERF | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L16028–L16051
- evidence:
  ```js
  if(editId){State.updateEvent(n.id,editId,ev);}  // dispatches sc:changed → dispatchRender fires
  else{State.addEvent(n.id,ev);}                   // dispatches sc:changed → dispatchRender fires
  Modals.close('manual-event');
  Render.all();                                     // second full render immediately after
  ```
  `State.addEvent` at L6789–6798 dispatches `sc:changed` with `fields:['stat','chronicle']`.
- observed/why: Every chronicle inscribe or edit triggers a full `Render.all()` twice in rapid succession. The first is the `sc:changed` event dispatching `dispatchRender`, which calls `Render.nationCard()`, `Render.pressurePoints()`, `Render.chronicleBand()`, etc. The second is the explicit `Render.all()` call at L16049, which repeats all eight render calls plus `WorldShell.render`. This is the same pattern C06-5 identified in other handlers. Exact same anti-pattern here.
- fix: Remove the explicit `Render.all()` at L16049 — the `sc:changed` event from `State.addEvent`/`State.updateEvent` already drives the correct render via `dispatchRender`.

---

### C12-6: `refreshOpenPanels` renders the Threads panel on every `sc:changed` without a field gate

- tag: PERF | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L7715
- evidence:
  ```js
  else if(open==='threads')SHSPanels.renderThreads();
  ```
  Compare with adjacent cases:
  ```js
  else if(open==='sessions'&&want('session'))SHSPanels.renderSessions();
  else if(open==='hooks'&&want('hook'))SHSPanels.renderHooks();
  // ... all other panels are field-gated
  else if(open==='threads')SHSPanels.renderThreads(); // no want() check
  ```
- observed/why: Every `sc:changed` event (stat slider drag, character add, location edit) triggers a full Threads panel re-render if threads is open, regardless of whether the change is relevant. All eight other panel cases in `refreshOpenPanels` are gated by `want(fieldName)`. Threads was added without the gate. The stat-slider path fires `sc:changed` on every `change` event — this means every slider release re-renders threads completely.
- fix: Determine relevant fields for threads (likely `hook`, `session`, `character`) and wrap: `else if(open==='threads'&&(want('hook')||want('session')||want('character')))SHSPanels.renderThreads();`

---

### C12-7: `refreshOpenPanels` has no case for `solo` — solo panel goes stale during partial renders

- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L7703–L7716
- evidence:
  ```js
  refreshOpenPanels(fields){
    ...
    if(open==='sessions'&&want('session'))SHSPanels.renderSessions();
    else if(open==='hooks'&&want('hook'))SHSPanels.renderHooks();
    // ... 6 more cases ...
    else if(open==='threads')SHSPanels.renderThreads();
    // 'solo' has NO case
  }
  ```
  `openPanel` at L12728 includes `'solo'` in the panel list; `SHSPanels.renderSolo()` exists at L13430.
- observed/why: When the solo panel is open and a partial `sc:changed` fires (stat change, character edit, etc.), `dispatchRender` calls `refreshOpenPanels(fields)` which silently skips `solo`. The panel shows stale data until a `Render.all()` runs (e.g., undo, import, nation switch). `Render.all()` calls `refreshOpenPanels()` with no `fields` arg, which refreshes everything — so this only bites in the incremental-render path.
- fix: Add `else if(open==='solo')SHSPanels.renderSolo();` to `refreshOpenPanels`. Optionally gate it: `&&(want('stat')||want('character')||want('nation'))`.

---

### C12-8: `GlobalSearch.bind()` lacks a call-once guard — double-bind would stack listeners on `search-query`

- tag: PERF | severity: LOW | confidence: MED | NEEDS-LIVE-VERIFY: no
- where: L15643–L15656
- evidence:
  ```js
  bind(){
    const q=document.getElementById('search-query');
    if(q){
      q.addEventListener('input', e=>this.search(e.target.value));
      q.addEventListener('keydown', e=>{...});
    }
    const overlay=document.getElementById('search-overlay');
    overlay?.addEventListener('click',()=>this.close());
  }
  ```
  No `_bound` flag, no `{ once: true }`, no guard.
- observed/why: Currently `bind()` is called once from bootstrap (L17391) so this is safe in practice. But the method is exposed on `GlobalSearch` with no protection. Any code path that calls `GlobalSearch.bind()` a second time (e.g., a future hot-reload path, or a mistake in future delivery) stacks duplicate listeners on the `search-query` input, causing double keystroke handling and multiple modal-close attempts per Escape. Low risk today, fragile by design.
- fix: Add `if(this._bound)return; this._bound=true;` at the top of `bind()`.

---

### C12-9: `_activate` closes search before navigation — if `SHSPanels` is undefined, panel stays blank with no feedback

- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L15612–L15626
- evidence:
  ```js
  _activate(rid){
    const item=this._results.find(x=>x.id===rid);
    this.close();                               // wipes _results, closes modal
    if(!item)return;
    if(typeof SHSPanels==='undefined')return;  // silent no-op
    const route=panelMap[item.type];
    if(route)SHSPanels.openPanel(route);
  }
  ```
- observed/why: If `SHSPanels` is undefined (timing or load failure), the search modal closes and the user sees nothing happen — no toast, no indication of what went wrong. Minor UX failure on an edge case.
- fix: Add `showToast('Navigation unavailable.')` before the early return, or guard at call site.

---

## Summary

| Severity | Count |
|----------|-------|
| HIGH     | 4     |
| MEDIUM   | 3     |
| LOW      | 2     |

**Top 3 findings:**

1. **C12-3 (HIGH)** — `AccuracyChip.mount()` registers permanent `sc:changed`+`rw:effort-changed` listeners on `document` on every modal open. Nine surfaces × unbounded opens = unbounded listener accumulation. Stale closures execute on every state change for the session lifetime. Same class of bug as C11-1 (CRITICAL).

2. **C12-2 (HIGH)** — Search `_activate` maps characters, factions, and events to `war-room`/`chronicle` — routes that don't exist in `SHSPanels.openPanel`'s panel list. Clicking these results closes the search modal and does nothing. Proven by Node simulation.

3. **C12-1 (HIGH)** — `GlobalSearch` silently omits fronts, relations, artifacts, and glossary. Four significant entity categories are fully unsearchable with no user-facing indication. Proven by comparing group list against data model.
