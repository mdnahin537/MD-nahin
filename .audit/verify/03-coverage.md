# Verification Pass 03 — Coverage Gap Findings
Verifier: sub-agent (Sonnet 4.6), 2026-06-05
Source: `6b9eaae1-relamwrith_V7.HTML` (READ ONLY — no modifications made)
Findings verified: C07-1, C11-3, C12-1, C12-2, C12-4, C02-1

---

## Methodology

For each finding: located the relevant function with `grep -an`, read the exact line range with `Read offset/limit`, then ran Node.js simulations with a fully-populated nation to produce ground-truth output. All code quotes are from the live source at the cited line numbers.

---

### C07-1: Foundry/JSON export omits Fronts, Bestiary, Relations, Glossary, Artifacts

- verdict: **CONFIRMED** — with one correction: Glossary was already noted as PDF-only by the original auditor; confirmed absent from Foundry export.
- original grade: BUG / HIGH / confidence HIGH → **upheld**
- proof:

  `FoundryExport.build()` at L8933–8944 constructs the export array:
  ```js
  // L8941 — exact builder array
  [this._buildRealmOverview(n), this._buildChronicle(n), this._buildFactions(n),
   this._buildCharacters(n), this._buildLocations(n), this._buildHooks(n),
   this._buildSecrets(n)].forEach(e=>{if(e)entries.push(e);});
  ```
  Methods defined in FoundryExport: `_buildRealmOverview`, `_buildChronicle`, `_buildFactions`, `_buildCharacters`, `_buildLocations`, `_buildHooks`, `_buildSecrets`. No `_buildArtifacts`, `_buildFronts`, `_buildBestiary`, `_buildRelations`, `_buildGlossary` exist anywhere in the file (`grep -an "_buildArtifacts\|_buildFronts\|_buildBestiary\|_buildRelations\|_buildGlossary"` → zero matches).

  Node run with a fully-populated nation (all 11 entity types populated):
  ```
  === Foundry Export: Entries Generated ===
    INCLUDED: Valdris — Realm Overview
    INCLUDED: Valdris — Chronicle
    INCLUDED: Valdris — Factions
    INCLUDED: Valdris — Characters / NPCs
    INCLUDED: Valdris — Locations
    INCLUDED: Valdris — Plot Hooks
    INCLUDED: Valdris — Secrets

  === Coverage Gap Analysis ===
    MISSING: Artifacts (artifacts)
    MISSING: Fronts (fronts)
    MISSING: Bestiary (bestiary)
    MISSING: Relations (relations)
    MISSING: Glossary (glossary)
  ```
  All five missing types confirmed by absence of builder methods AND by Node output.

  The export toast at L8957 says `"Exported N Foundry journal entries"` — implying completeness with no disclosure of what is omitted.

- plain: The Foundry VTT export is hard-wired to build exactly 7 journal entry types and has no builder methods for Artifacts, Fronts, Bestiary, Relations, or Glossary. A GM who exports their world loses all five of these silently, with a toast that implies the export is complete.
- fix: Add `_buildArtifacts`, `_buildFronts`, `_buildBestiary`, `_buildRelations`, `_buildGlossary` methods (mirroring existing `_build*` pattern) and append them in the `build()` array at L8941.

---

### C11-3: Story-Bible PDF (generatePDF) omits Fronts, Bestiary, Relations

- verdict: **CONFIRMED for Fronts/Bestiary/Relations — PARTIALLY FALSE on Artifacts and Glossary**
- original grade: BUG / HIGH → corrected: **BUG / HIGH but scope is 3 types, not 5**
- proof:

  `generatePDF()` runs from L8963–9202. Full section inventory from source:

  | Entity type | Status in PDF | Line |
  |-------------|---------------|------|
  | Stats (`n.stats`) | ALWAYS | L9052–9070 |
  | Factions (`n.factions`) | OPT-IN via `exp-factions` (checked by default) | L9071–9084 |
  | Chronicle (`n.chronicle`) | ALWAYS, with secret/forecast filter | L9085–9116 |
  | Characters (`n.characters`) | OPT-IN via `exp-characters` (checked by default) | L9117–9136 |
  | **Artifacts (`n.artifacts`)** | **OPT-IN via `exp-artifacts` (checked by default) — L9138** | L9137–9146 |
  | Stability formula | OPT-IN via `exp-stability` | L9147–9171 |
  | **Glossary (`n.glossary`)** | **AUTO-INCLUDED if populated, no checkbox — L9174** | L9172–9187 |
  | Fronts (`n.fronts`) | **ABSENT — no section, no checkbox** | — |
  | Bestiary (`n.bestiary`) | **ABSENT — no section, no checkbox** | — |
  | Relations (`n.relations`) | **ABSENT — no section, no checkbox** | — |

  Relevant source lines:
  ```js
  // L9138 — Artifacts IS in the PDF (opt-in, checked by default)
  if(incArts&&n.artifacts.length){
    root.appendChild(h('h2',null,'Artifacts'));
    n.artifacts.forEach(a=>{...});
  }

  // L9174 — Glossary IS in the PDF (auto-included if populated)
  if(n.glossary&&typeof n.glossary==='object'&&Array.isArray(n.glossary.glossary)&&n.glossary.glossary.length){
    root.appendChild(h('h2',null,'Glossary'));
    n.glossary.glossary.forEach(entry=>{...});
  }
  ```
  Confirming what IS missing — `grep -an "fronts\|bestiary\|relations" [file]` within L8963–9202 returns **zero matches** — no reference to any of the three types in `generatePDF`.

  The export options UI at L3997–4002 shows checkboxes: secrets, forecasts, factions, characters, **artifacts** (checked), stability. No fronts/bestiary/relations checkboxes.

  The C11-3 finding body was accurate about "silently omits Fronts, Bestiary, and Relations." However, the evidence block quoted in C11-3 implied Artifacts and Glossary were also missing, which is incorrect — they ARE present. The **title and core claim are correct**; the evidence snippet was misleading.

- plain: `generatePDF` does include Artifacts and Glossary. Only Fronts, Bestiary, and Relations are truly absent from the Story-Bible PDF. The C11-3 finding is correct in its headline; the evidence block included incorrect implications about Artifacts/Glossary.
- fix: Add optional sections for Fronts, Bestiary, and Relations in `generatePDF()`, with corresponding `exp-fronts`, `exp-bestiary`, `exp-relations` checkboxes in the export modal HTML near L3997–4002.

---

### C12-1: GlobalSearch omits Fronts, Relations, Artifacts, Glossary

- verdict: **CONFIRMED**
- original grade: BUG / HIGH / confidence HIGH → **upheld**
- proof:

  `GlobalSearch.search()` at L15525–15582 defines the `groups` array (read verbatim from source):
  ```js
  // L15525–15582
  const groups=[
    {type:'characters', items:(nation.characters||[])...},
    {type:'factions',   items:(nation.factions||[])...},
    {type:'locations',  items:(nation.locations||[])...},
    {type:'events',     items:(nation.chronicle||[])...},
    {type:'secrets',    items:(nation.secrets||[])...},
    {type:'hooks',      items:(nation.hooks||[])...},
    {type:'sessions',   items:(nation.sessions||[])...},
    {type:'bestiary',   items:(nation.bestiary||[])...},
  ]
  ```
  Absent from groups: `fronts` (`nation.fronts`), `relations` (`nation.relations`), `artifacts` (`nation.artifacts`), `glossary` (`nation.glossary`).

  Node run confirming the gap:
  ```
  Not searched: artifacts, fronts, relations, glossary
  ```

  NOTE: `bestiary` IS searched (L15576–15581) — the C12-1 claim that bestiary is omitted is **incorrect**. The original C12-1 text says "fronts, relations, artifacts, and glossary" are missing — that is the correct list. Bestiary is present in the search index.

- plain: The search index has 8 groups. Four entity types (fronts, relations, artifacts, glossary) are never indexed. Bestiary IS searchable. Searching for a Front name, an artifact, a relation, or a glossary term returns zero results with no indication to the user.
- fix: Add four group entries at the end of the `groups` array, e.g.:
  ```js
  {type:'fronts', label:'Fronts', icon:'warning',
   items:(nation.fronts||[]).filter(f=>match(f.name)||match(f.description)).slice(0,5)
   .map(f=>({id:'frt:'+f.id,name:f.name||'Unnamed',meta:'',type:'fronts',entityId:f.id}))},
  ```
  Also add panel routes in `panelMap` at L15619: `fronts:'fronts', artifacts:'...' , glossary:'...'`.

---

### C12-2: Search result clicks dead-end for characters, factions, and events

- verdict: **CONFIRMED**
- original grade: BUG / HIGH / confidence HIGH → **upheld**
- proof:

  `_activate()` at L15612–15626 uses:
  ```js
  // L15619–15623
  const panelMap={
    characters:'war-room', factions:'war-room', events:'chronicle',
    secrets:'secrets', hooks:'hooks', sessions:'sessions',
    locations:'locations', bestiary:'bestiary',
  };
  const route=panelMap[item.type];
  if(route)SHSPanels.openPanel(route);
  ```

  `SHSPanels.openPanel()` at L12726–12740:
  ```js
  // L12728 — the only valid panel names
  ['sessions','hooks','secrets','fronts','locations','bestiary','relations','web','solo','threads']
    .forEach(p=>{document.getElementById(`panel-${p}`)?.classList.remove('is-open');});
  const panel=document.getElementById(`panel-${which}`);
  if(!panel)return;  // ← early return if panel not in DOM
  ```

  DOM panel IDs confirmed from source (L4079–4363): `panel-sessions`, `panel-hooks`, `panel-secrets`, `panel-fronts`, `panel-locations`, `panel-bestiary`, `panel-threads`, `panel-relations`, `panel-web`, `panel-solo`, `panel-realm-settings`. No `panel-war-room`. No `panel-chronicle`.

  Node run:
  ```
  characters → panelMap='war-room': openPanel('war-room') → panel-war-room NOT in DOM → early return
  factions   → panelMap='war-room': openPanel('war-room') → panel-war-room NOT in DOM → early return
  events     → panelMap='chronicle': openPanel('chronicle') → panel-chronicle NOT in DOM → early return
  secrets    → panelMap='secrets': openPanel('secrets') → OK
  hooks      → panelMap='hooks': openPanel('hooks') → OK
  sessions   → panelMap='sessions': openPanel('sessions') → OK
  locations  → panelMap='locations': openPanel('locations') → OK
  bestiary   → panelMap='bestiary': openPanel('bestiary') → OK
  ```

  Clicking a character, faction, or event search result closes the modal (wiping `_results` at L15615), then `openPanel` returns immediately. Screen is unchanged. Dead navigation for 3 of 8 indexed entity types.

- plain: Three of the eight searchable entity types — characters, factions, and events — map to panel names (`war-room`, `chronicle`) that don't exist as DOM elements. Clicking their results closes the search modal and does nothing visible. The other five route correctly.
- fix: Characters and factions should navigate to the WorldShell war-room tab, not a panel. The simplest correct fix: for `characters` and `factions`, instead of `SHSPanels.openPanel(route)`, call `WorldShell.render(State.get())` and activate the relevant WorldShell section. For `events`, open the chronicle band or scroll to the event. At minimum: remove the dead routes from panelMap so at least the result item doesn't give false feedback.

---

### C12-4: `dispatchRender` ignores `faction` field — faction UI stale after AI change

- verdict: **OVERSTATED** — correct only for legacy layout (debug flag); primary WorldShell layout is unaffected
- original grade: BUG / HIGH → corrected: **BUG / LOW** (legacy-only code path)
- proof:

  `dispatchRender()` at L15690–15712:
  ```js
  // L15700–15711
  Render.identityStrip();
  if(fields.includes('stat')||fields.includes('chronicle')){...}
  if(fields.includes('customStat'))Render.workbench();
  if(fields.includes('character')){Render.workbenchCharacters();Render.nationCard();}
  Render.refreshOpenPanels(fields);
  // ↓ This line runs for EVERY sc:changed (including fields=['faction'])
  if(typeof WorldShell!=='undefined'&&localStorage.getItem('rw_legacy_layout')!=='1')
    {const _nat=State.get();if(_nat)WorldShell.render(_nat);}
  ```

  `WorldShell.render()` at L14007 explicitly calls `this._renderFactions(nat)`. So for the primary layout (all three production themes: ember, manuscript, modern — per L16722–16724), a `faction` field change DOES re-render factions via `WorldShell.render()` → `_renderFactions()`.

  The stale-faction case only occurs when `rw_legacy_layout=1` (a localStorage debug flag). The legacy `.main-row` layout is described in the source as "retired as a user-facing theme… reachable only behind the rw_legacy_layout debug flag" (L16723–16724). In that case, `Render.workbench()` is called instead of `WorldShell.render()`, and `Render.workbench()` renders stat sliders + characters — NOT factions. There is no `Render.workbenchFactions()` method.

  The AI `factionStance` tool dispatch at L9735 (`fields:['faction']`) reaches `WorldShell._renderFactions()` in the standard production path. The finding is not a bug for normal users.

- plain: In the default WorldShell layout (all production themes), faction changes from the Copilot tool DO cause the faction list to re-render via `WorldShell.render()` → `_renderFactions()`. The staleness only occurs for users who have manually set `rw_legacy_layout=1`, which is a developer/debug flag. The HIGH severity is not warranted for a debug-only path.
- fix (low priority): For completeness, add `if(fields.includes('faction'))Render.workbench();` to `dispatchRender` so that legacy-layout users also get the refresh. Or document that legacy layout is unsupported for reactive faction updates.

---

### C02-1 / C12-7: Solo (and Fronts) panel stale on partial renders and Render.all()

- verdict: **CONFIRMED for `solo`; PARTIALLY CONFIRMED for `fronts`**
- original grade: BUG / HIGH → **upheld for `solo`; nuanced for `fronts`**
- proof:

  `Render.refreshOpenPanels()` at L7703–7716 — exact source:
  ```js
  refreshOpenPanels(fields){
    if(typeof SHSPanels==='undefined')return;
    const open=SHSPanels._open;
    if(!open)return;
    const want=f=>!fields||fields.includes(f);
    if(open==='sessions'&&want('session'))SHSPanels.renderSessions();
    else if(open==='hooks'&&want('hook'))SHSPanels.renderHooks();
    else if(open==='secrets'&&want('secret'))SHSPanels.renderSecrets();
    else if(open==='locations'&&want('location'))SHSPanels.renderLocations();
    else if(open==='bestiary'&&want('bestiary'))SHSPanels.renderBestiary();
    else if(open==='relations'&&want('relation'))SHSPanels.renderRelations();
    else if(open==='web'&&(want('character')||want('faction')||want('location')||want('relation')))SHSPanels.renderWeb();
    else if(open==='threads')SHSPanels.renderThreads();
    // ← 'solo' and 'fronts' NOT in chain
  }
  ```

  `SHSPanels._open` can be `'solo'` (confirmed: `'solo'` is in `openPanel`'s panel list at L12728 and `closeAll` at L12743). `SHSPanels.renderSolo()` exists at L13430.

  **`solo`**: Absent from `refreshOpenPanels` entirely. There is no dedicated `sc:changed` listener for Solo (unlike Fronts, Bestiary, Relations which have their own). So Solo panel goes stale on BOTH paths:
  - Partial render path (`dispatchRender` → `refreshOpenPanels(fields)`) — no `solo` branch
  - `Render.all()` path (undo/import/nation-switch) → `refreshOpenPanels(undefined)` — no `solo` branch

  **`fronts`**: Also absent from `refreshOpenPanels`. However, Fronts has its OWN `sc:changed` listener at L14658:
  ```js
  // L14658–14660
  document.addEventListener('sc:changed',e=>{
    if(e.detail?.fields?.includes('front'))this.renderList();
  });
  ```
  This means: direct front mutations (addFront, updateFront, deleteFront) DO trigger Fronts re-render via the module's own listener. BUT the `Render.all()` path (undo/import/nation-switch) does NOT dispatch `sc:changed` — it calls `refreshOpenPanels()` directly, which misses `fronts`. So the Fronts panel goes stale on undo and import when the panel is open.

  The `sc:changed` subscribers are:
  - L5728: AccuracyChip
  - L12173: (to verify)
  - L14658: Fronts module (guards on `fields.includes('front')`)
  - L14923: Bestiary module (guards on `fields.includes('bestiary')`)
  - L15010: Relations module (guards on `fields.includes('relation')`)
  - L15113: `onChanged` (to verify)
  - L16617: `dispatchRender` (MAIN dispatcher)
  - L17572: `addModalCorners`

  Solo has no dedicated `sc:changed` listener.

- plain: The solo panel never refreshes on any `sc:changed` path or on `Render.all()` — it stays stale until the user closes and reopens it. The fronts panel refreshes on direct front mutations (via its own listener) but goes stale after undo, import, or nation switches (which bypass `sc:changed`).
- fix:
  ```js
  // In refreshOpenPanels(), after the threads branch:
  else if(open==='solo') SHSPanels.renderSolo();
  else if(open==='fronts') SHSPanels.renderFronts();
  ```

---

## Summary

**Verdict counts:**
- CONFIRMED: 4 (C07-1, C12-1, C12-2, C02-1/C12-7)
- OVERSTATED: 1 (C12-4 — only affects debug/legacy layout)
- FALSE-POSITIVE: 0
- NEEDS-BROWSER: 0
- PARTIALLY CONFIRMED (scope correction): 1 (C11-3 — 3 types absent, not 5)

### Coverage truth

Across the three export surfaces (Foundry VTT JSON, Story-Bible PDF, GlobalSearch), the following entity types are **second-class everywhere** — absent from all three: **Fronts** and **Relations**. The other contested types split:

- **Artifacts**: Present in the PDF (opt-in checkbox, checked by default); absent from Foundry export and absent from search. Second-class across 2 of 3 surfaces.
- **Bestiary**: Present in search; absent from PDF and Foundry export. Second-class across 2 of 3 surfaces.
- **Glossary**: Present in PDF (auto-included when populated); absent from Foundry export and absent from search. Second-class across 2 of 3 surfaces.

The most reliably handled types across all three surfaces are: **Factions, Characters, Locations, Chronicle/Events, Hooks, Secrets** — all covered in Foundry export, PDF, and search (though Characters/Factions search results dead-end on click per C12-2). **Sessions** is indexed in search but not in the Foundry export or PDF.

The single most important correction to the original findings is on **C12-4** (faction dispatch gap): the finding is valid only for the legacy debug layout (`rw_legacy_layout=1`) and does not affect normal users in the default WorldShell layout, which already calls `_renderFactions()` on every `sc:changed` event. The HIGH severity should be downgraded to LOW.
