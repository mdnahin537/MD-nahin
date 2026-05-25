# LENS 3 — Control Flow, State Sequencing & Cross-Subsystem Logic

Audit target: `/home/user/MD-nahin/src/index.html` (14,850 lines, single-file vanilla JS).
Scope: ordering of operations, the mutation→event→render cascade, undo/redo, persist timing, listener lifecycle, async ordering, cross-subsystem invariants. Security=L1, copilot internals=L2, UI/CSS=L4, domain math=L5.

---

## 0. The core architecture in one picture

Every State mutator follows the same template:

```
mutator(): pushUndo() → mutate this.data → _touch(nid) → dispatch 'sc:changed'{fields} → persist()
```

- `pushUndo()` (5450) snapshots `JSON.stringify(this.data)`, clears redo, and calls `AutoSave.tick()`.
- `persist()` (5492) is a 400ms-debounced write to IndexedDB + localStorage mirror.
- `'sc:changed'` is caught by **`dispatchRender`** (12981), the single global render router, AND by ~5 *other* per-module listeners (Fronts 12021, Bestiary 12286, Relations 12373, onboarding 12476, modal-corners 14598).

`dispatchRender` (12981) is the heart of the system. Its branch table:

| `fields` value | What re-renders |
|---|---|
| *(no fields)* | `Render.all()` |
| `nation` | `Render.all()` then **early `return`** — nothing below runs |
| `stat` / `chronicle` | identityStrip + nationCard + pressurePoints + recentPulse + arsenal + chronicleBand |
| `customStat` | + workbench |
| `character` | + workbenchCharacters + nationCard |
| `session`/`hook`/`secret`/`location`/`bestiary`/`relation` | matching SHSPanel **only if that panel is `_open`** |
| `web`/`threads` panel open | always re-rendered regardless of field |
| (always) | identityStrip; WorldShell if ember theme |

The fields that have **NO branch** in dispatchRender: `front`, `faction`, `artifact`. This is the root of several findings below.

---

## 1. TRACE: Add a chronicle event (manual "Inscribe")

`addEvent(nid,ev)` (5549):
1. `pushUndo()` — snapshot taken.
2. push event onto `n.chronicle`.
3. `_touch(nid)`.
4. dispatch `sc:eventAdded` {eid,nid}.
5. dispatch `sc:changed` {fields:**['stat','chronicle']**}.
6. `persist()`.

dispatchRender sees `['stat','chronicle']` → renders identityStrip + nationCard + pressurePoints + recentPulse + arsenal + chronicleBand. Clean. The `sc:eventAdded` listener (13787) only fires a toast for `isThreshold` events; the comment correctly notes it avoids a double-render. **This flow is correct.**

Note the `stat` field on a pure chronicle add is slightly over-broad but harmless — it just re-renders the same set of panels stat would anyway. Not a bug.

---

## 2. TRACE: Undo

`undo()` (5460):
1. push current `JSON.stringify(this.data)` onto redo stack.
2. pop previous, set `_suppressUndo=true`, `this.data=JSON.parse(prev)`, `_suppressUndo=false`.
3. `persist()`.
4. dispatch `sc:changed` {fields:**['nation','stat','chronicle']**}.
5. `_updateUndoUI()`.

dispatchRender sees `fields.includes('nation')` → `Render.all(); return;` at 12984. **The early return skips the entire SHSPanels block (12993-13002).** This is the KNOWN bug.

### Finding 2.1 — Undo leaves open side-panels stale — **HIGH** — index.html:12984 / 5469
**Sequence:** user opens the Hooks panel → adds a hook (panel re-renders via the `hook` branch) → presses Ctrl+Z → `undo()` dispatches `['nation','stat','chronicle']` → dispatchRender early-returns after `Render.all()`. `Render.all()` (6401) renders **only** the war-room dashboard (identityStrip, workbench, nationCard, pressurePoints, recentPulse, arsenal, chronicleBand, nationSwitcher) — it does NOT touch any SHSPanel. So the Hooks panel still shows the hook that no longer exists in `State.data`.
**Why it matters:** the undo *succeeded* in state but the visible panel lies. Next click on the ghost row calls `State.removeHook(nid, ghostId)` which no-ops (`find` returns undefined) — silent dead clicks, user confusion, possible "undo is broken" support tickets.
**Better approach:** Either (a) drop `'nation'` from the undo/redo dispatch and instead dispatch the union of every field type so all branches fire, or (b) make `Render.all()` itself refresh whichever SHSPanel is `_open`, or (c) remove the `return` at 12984 and let `Render.all()` + the SHSPanels block both run (a few redundant renders, but correctness over micro-perf). Option (c) is the smallest, safest change.
**CROSS-REF:** L4 should confirm no CSS flicker from the double render in option (c).

### Finding 2.2 — `Render.all()` never refreshes ANY side panel — same root, broader — **HIGH** — index.html:6401, 12984
This is the generalization. `Render.all()` is invoked from: dispatchRender's `nation` branch, `switchNation`, `addNation`, `resetAll`, `commitRestore`, snapshot restore, Tonight generate/cleanup, and bootstrap. **In every one of those, if a SHSPanel (or the Fronts/Solo panel) is open, it goes stale**, because `Render.all()` has zero awareness of SHSPanels. The undo case (2.1) is just the most reproducible instance. See also Finding 5.1 (switchNation).

---

## 3. TRACE: Switch nation

`switchNation(nid)` (5628):
1. set `meta.activeNationId`, `_touchMeta()`.
2. reset Render flags (`_arsenalShowAll`, `_refOpen`, `_zoom`).
3. close detail panel.
4. if Copilot open → re-render its header/messages/status.
5. dispatch `sc:changed` {fields:**['nation']**}.
6. `persist()`.

dispatchRender → `nation` branch → `Render.all(); return;`.

### Finding 3.1 — Switching nation with a SHSPanel open shows the OLD nation's data — **HIGH** — index.html:5628, 12984
**Sequence:** open Sessions panel for Realm A → open the nation switcher → pick Realm B → `switchNation` dispatches `['nation']` → `Render.all()` repaints the dashboard for B but the Sessions panel still lists **Realm A's sessions**. The panel render functions (e.g. `renderSessions` 10203) call `State.get()` which now returns B, so the panel is merely *not re-invoked* — its DOM is frozen on A. Worse than undo because the data shown belongs to a *different realm* — a referential-integrity illusion. If the GM then deletes a "session" they see, the click handler captured `n` = the panel's stale `State.get()` at render time... actually the handler re-reads via `data-sid` against current `n`, so it deletes from B or no-ops — unpredictable.
**Why it matters:** cross-realm data confusion is the most dangerous class of bug in a multi-realm tool; the GM cannot trust what a panel shows after any nation switch.
**Better approach:** `switchNation` should explicitly `SHSPanels.closeAll()` (like it already closes the detail panel at 5638), OR re-render the currently-open panel. Closing is the honest choice — panel contents are per-nation and there's no meaningful "same panel, new nation" continuity. One line: `if(typeof SHSPanels!=='undefined')SHSPanels.closeAll();` before the dispatch.

---

## 4. TRACE: AI auto-apply (Copilot tool call → state mutation)

Path A — autoApply tool (8281):
1. `_buildProposal(name,args,n)` (pure, no mutation).
2. `State.pushUndo()`.
3. `_applyProposal(proposal,n)` (8347) — mutates `n` directly AND dispatches its own `sc:changed` *inside* (e.g. `statDelta` → `['stat']`, `factionStance` → `['faction']`).
4. `State._touch(n.id)`; `State.persist()`; `this._renderQueue()`.

Path B — approve queued item `_approveQueueItem` (8421): pushUndo → `_applyProposal` → splice queue → _touch → persist → _renderQueue. Same internal dispatch.

### Finding 4.1 — `statDelta` AI apply BYPASSES `checkThresholds` — **HIGH** — index.html:8383-8388
`_applyProposal`'s `statDelta` branch sets `s.value=p.data.newValue` **directly** and dispatches `['stat']`. It does **not** call `Compute.checkThresholds`. Compare the canon-block path (7052-7058) which the comment explicitly says was fixed (Bug 7) to "Route through `State.setStat` so checkThresholds fires correctly." The AI tool-call path regressed the same bug: an AI moving Legitimacy below a threshold via `update_nation_stat` will **not** generate the threshold chronicle event, and will **not** fire front optional-stat-triggers (6343-6351). Two subsystems silently desync depending on *which* AI mechanism (canon block vs tool call) edited the stat.
**Why it matters:** the entire threshold/front-trigger automation — a headline feature — is conditionally dead based on an invisible code path. Hard to reproduce, easy to ship.
**Better approach:** route `statDelta` through `State.setStat(n.id, p.data.stat, p.data.newValue)` exactly like the canon path, and drop the manual dispatch (setStat dispatches its own). **CROSS-REF: L2 (copilot internals) and L5 (threshold math) — confirm the threshold/trigger expectation; this is a flow-vs-feature gap.**

### Finding 4.2 — `faction` and `artifact` AI changes never visibly refresh — **MEDIUM** — index.html:8380, 7070, 12986-13002
`factionStance` dispatches `['faction']`; the canon path dispatches `['artifact']` for artifacts and `['faction']` for new factions. **dispatchRender has no branch for `faction` or `artifact`** — only `identityStrip()` runs (the unconditional line). Factions are not shown in `nationCard` (verified 6582-6614 — it renders stats only) nor in identityStrip. Result: AI changes a faction's stance → state updates, persists, but **no panel re-renders** until something else triggers a full render. Artifacts likewise (they surface in `arsenal`, which only re-renders on stat/chronicle).
**Why it matters:** the GM applies an AI proposal, sees the queue clear (`_renderQueue`), but the faction/artifact view doesn't change — looks like the apply failed; they may re-apply, creating duplicate-ish state.
**Better approach:** add `if(fields.includes('faction')||fields.includes('artifact'))Render.arsenal();` (and re-render whichever panel shows factions) to dispatchRender. **CROSS-REF: L4 to confirm which DOM regions show factions/artifacts.**

### Finding 4.3 — autoApply tool-call dispatches sc:changed BEFORE persist completes (ordering is fine, but render reads mid-mutation on multi-tool turns) — **LOW** — index.html:8288-8294
When a single Copilot turn applies multiple tools sequentially, each `_applyProposal` dispatches `sc:changed` synchronously and re-renders the whole dashboard between mutations. For an N-tool response that's N full dashboard re-renders in one tick — redundant but not incorrect. Acceptable; flag only as perf. **CROSS-REF: L4 for render thrash.**

---

## 5. Boot / init sequence

`bootstrap()` (14415), wired to `DOMContentLoaded` (14544):
1. `await State.load()` — populates `State.data` from IDB/localStorage (or default).
2. `bindEventListeners()` (13008) — attaches the singleton `dispatchRender` listener (13784), the `sc:eventAdded` toast listener (13787), nav/export/inscribe handlers, etc.
3. `await LicenseGate.init()` → `LicenseQueue.drain()` (fire-and-forget) → `await DemoCounter.init()` → `await AutoSave.init()`.
4. A long chain of `Module.bind()` calls (Fronts, Bestiary, Relations, … RelationshipWeb.init, GlobalSearch, Snapshot, Glossary, Naming, Encounter, Threads). **Each of Fronts/Bestiary/Relations `.bind()` attaches its OWN `document.addEventListener('sc:changed', …)`** (12021/12286/12373).
5. `State.snapshotIfDue()` fire-and-forget.
6. WorldShell.mount(), `_updateUndoUI()`, toggle UI sync, `applyMotionPref()`, `applyTheme()`, Copilot.updateStatus(), GMMode.apply().
7. Branch on `firstRunComplete`: FrontDoor.open()+Render.all(), OR Render.all()+welcome toast+legacy onboarding.

### Finding 5.1 — `bind()` methods are idempotency-unsafe; double-bootstrap = duplicate listeners — **MEDIUM** — index.html:12021, 12286, 12373, 14417
`bindEventListeners` and every `Module.bind()` call `addEventListener` with **fresh anonymous closures** and no guard. If `bootstrap` ever runs twice (e.g. a future SPA navigation, a hot-reload, or a manual re-init), every `sc:changed` listener doubles, every click handler doubles → double renders, double mutations on one click. Today `DOMContentLoaded` fires once so it's latent, but there is **no defense**. The onboarding listener (12476) is the *only* one that tracks attachment (`_listenerAttached`) and removes itself (12463). Everything else leaks by design.
**Why it matters:** a single accidental re-entry turns every undo into a double-undo and every render into a storm. It's a footgun waiting for a refactor.
**Better approach:** define listener callbacks as named functions and guard with a module-level `_bound` flag, or attach all `sc:changed` consumers through one registry. At minimum add a `if(this._bound)return;this._bound=true;` to each `bind()`.

### Finding 5.2 — Per-module `sc:changed` listeners duplicate dispatchRender's panel logic, and they diverge — **MEDIUM** — index.html:12021 vs 12993
Fronts (12021) re-renders its list on **any** `front` field, unconditionally — but dispatchRender's SHSPanels block does NOT handle `front` (no `fronts` case in 12993-13002, only sessions/hooks/secrets/locations/bestiary/relations). So Fronts relies entirely on its private listener. Meanwhile Bestiary (12286) AND dispatchRender (12998) BOTH re-render the bestiary panel on `bestiary` — **double render**. Relations likewise (12373 + 12999). So: `front` is handled in one place, `bestiary`/`relation` in two places, and the `solo` panel in zero places (10192 lists `solo` as closeable but no `sc:changed` branch anywhere refreshes it).
**Why it matters:** inconsistent refresh contracts across panels. Bestiary/relations do redundant work; fronts/solo have single points of failure; the next dev cannot predict where a panel gets refreshed.
**Better approach:** consolidate ALL panel refresh into the dispatchRender SHSPanels block (add `front` and `solo` cases there) and delete the private Fronts/Bestiary/Relations listeners. One router, one contract.

### Finding 5.3 — `applyTheme`/WorldShell render depends on State already loaded — ordering OK but fragile reads — **LOW** — index.html:13004, 6403
dispatchRender and Render.all read `State.data?.meta?.settings?.theme||'ember'` defensively, and WorldShell render is guarded by `State.get()` truthiness. The optional chaining means a `sc:changed` firing before `State.load()` resolves wouldn't crash — but no mutator can fire before load since listeners are bound *after* `await State.load()`. Ordering is sound. Noting only that the defensiveness is load-bearing; don't remove it.

---

## 6. AutoSave / persist / debounce timing

Three writers touch storage: `persist()` (400ms debounced, 5492), `persistNow()` (immediate await, 5514), and `snapshotIfDue()` (5765, writes separate snapshot keys + calls `persistNow`). Plus `AutoSave` (5033) which writes to a **user file handle**, independent of IDB.

### Finding 6.1 — `persistNow()` does NOT cancel the pending debounced `persist()` — stale clobber window — **MEDIUM** — index.html:5514, 5492, 5783, 5835
`persistNow` (used by `setOnboardingComplete`, `snapshotIfDue`, `commitRestore`) serializes `_stateForPersist()` and awaits the IDB write immediately. But a `persist()` already queued in the 400ms debounce is **not cancelled**. Sequence that clobbers:
1. mutation X → `persist()` scheduled for T+400ms (captures generation `gen0`).
2. at T+50ms `commitRestore` runs → `persist.cancel?.()` (it DOES cancel here, 5832) → good. **But** `snapshotIfDue` (5783 `persistNow`) and `setOnboardingComplete` (5756) do **not** cancel.
3. So: rapid mutation → `persist()` queued → `setOnboardingComplete()` → `persistNow()` writes state-with-onboarding-true → 350ms later the queued `persist()` fires and writes the *captured-at-schedule-time* `_stateForPersist()`... which is read fresh at execution (5496 reads `_stateForPersist()` inside the debounced body, not at schedule time). So the body re-serializes current `State.data` — which still has onboardingComplete=true. **No clobber of that field.** The real risk is the **`saving`→`saved` UI flicker** and a redundant write, not data loss. Downgrade: the generation-counter (5500-5508) only protects against `resetAll`, not against persistNow ordering. Net: low data-loss risk because all writers serialize *current* `State.data` at execution time, but the double-write and the `setTimeout(300)` "saved" toggles can race to show "saved" while a later write is still in flight.
**Why it matters:** the save indicator can show "Saved" 300ms after `persist()` while `persistNow` from a snapshot is still awaiting — a benign-but-misleading UI state. Real corruption is unlikely *because* every path re-reads live state.
**Better approach:** have `persistNow` and `snapshotIfDue` call `this.persist.cancel?.()` first (like commitRestore does) to collapse the redundant write and avoid the dueling `setSave` timers. **CROSS-REF: L4 for the save-indicator flicker UX.**

### Finding 6.2 — `snapshotIfDue` mutates `this.data.meta.snapshots` then `persistNow`, racing with `pushUndo` snapshots — **LOW** — index.html:5765-5784
`snapshotIfDue` runs fire-and-forget at boot (14446). It does `await IDB.set(snapshotKey, clone)` then pushes to `meta.snapshots` then `await persistNow()`. If the user mutates state during the two awaits, `pushUndo` will have snapshotted a `State.data` that lacks the `meta.snapshots` entry, and the subsequent `persistNow` writes the version *with* the snapshot entry. The snapshot-list metadata and the undo stack can momentarily disagree. Low impact (snapshots are advisory metadata) but it's an unsynchronized read-modify-write on shared `this.data` across an await boundary. Worth a comment at minimum.

### Finding 6.3 — `AutoSave.tick()` counter is decoupled from actual saves — **LOW (correctness OK, note)** — index.html:5042-5047, 5450
`pushUndo` calls `AutoSave.tick()` which increments `_counter` and triggers a file-handle write every `AUTO_SAVE_THRESHOLD` *pushUndo calls*. Since some flows call `pushUndo` without a user-visible action (e.g. `_cleanupPreviousTonightNation` 9876, multi-tool AI turns), the "every N actions" promise (toast text 5072) is approximate. Not a bug, but the counter counts undo-pushes, not user actions. Acceptable.

---

## 7. Event-listener lifecycle (summary)

- **Singleton, correct:** `dispatchRender` (13784), `sc:eventAdded` toast (13787), resize→chronicleBand (13797). Attached once in `bindEventListeners`.
- **Per-render re-attachment (intentional, innerHTML replaces nodes):** slider listeners (`attachSlider` in `workbench` 6472), nationCard rows (6605), recentPulse items (6637), relations buttons (12329), session delete buttons (10223). These are fine *because* the host element's innerHTML is replaced each render, discarding old nodes+listeners. No leak. **BUT** see 7.1.
- **Document-level, NOT cleaned:** Fronts/Bestiary/Relations `sc:changed` (Finding 5.2/5.1). Leak only under double-bootstrap.

### Finding 7.1 — `document.addEventListener('click', …)` for dropdowns added per `bindEventListeners`, never removed — **LOW** — index.html:13039, 13068
The nation-switcher and export dropdowns add a `document`-level click-to-close listener. Singleton today (bindEventListeners runs once), but combined with 5.1 these would stack on re-entry. Same fix: idempotency guard.

---

## 8. Cross-subsystem invariants

- **Deleting a nation:** `_cleanupPreviousTonightNation` (9871) and the Tonight error path (9980) both splice from `State.data.nations`, fix up `activeNationId` to the last nation, and dispatch `['nation']`. If the deleted nation was active, `State.get()` self-heals (5521-5532) by snapping to the last nation. **Consistent.** But again: any open SHSPanel referencing the deleted nation goes stale (Finding 2.2 family). And the detail panel is NOT closed on these delete paths (switchNation closes it at 5638, but the Tonight cleanup doesn't) — a detail panel open on a deleted nation's event will dereference a ghost on next interaction.
- **`removeEvent` sweeps `chronicleLinks`** (5565-5570) and dispatches `['chronicle','character']` — correct, character cards show link counts (6500/6508).
- **`removeLocation`** (6115) sweeps children, characters, chronicle, secrets — thorough — dispatches only `['location']`. **Gap:** it nulls `c.basedInLocationId` on characters and `e.happenedAtLocationId` on chronicle events, but dispatches only `location`, so the character cards and chronicle views that displayed those references are NOT re-rendered. If the Characters domain or recentPulse showed location info, it's stale until next full render. **MEDIUM-ish; downgrade to LOW since current card markup (6502) doesn't render location.** Still, the dispatch field set is narrower than the mutation's reach — a latent bug if UI later shows location on cards. **CROSS-REF: L4.**
- **`editCustomStat` key migration** (5686-5694) updates chronicle `relatedStats` and front `optionalStatTrigger.statKey` references — good referential hygiene. Dispatches `['stat','customStat']`; fronts panel (if open) won't refresh (no `front` field) but the data is correct.

### Finding 8.1 — Tonight delete path leaves detail panel + side panels dangling — **MEDIUM** — index.html:9871, 9980
Unlike `switchNation` (which closes the detail panel), the Tonight cleanup/error nation-removal paths dispatch `['nation']` (→ `Render.all()`) without closing the detail panel or side panels. A detail panel open on the just-deleted nation's event survives, pointing at a ghost. Fix: call `Modals.closeAll()`/`SHSPanels.closeAll()` and clear the detail panel in these paths, mirroring `switchNation`.

---

## 9. Redundant / double-render inventory (perf, not correctness)

1. `bestiary` field → rendered by dispatchRender (12998) **and** Bestiary's own listener (12286). 2×.
2. `relation` field → dispatchRender (12999) **and** Relations' listener (12373). 2×.
3. `web`/`threads` panels (13000-13001) re-render on **every** `sc:changed` regardless of field — e.g. dragging a slider (`stat`) re-renders the relationship web force-sim every change. Potentially heavy. **CROSS-REF: L4/L5 (force-sim cost).**
4. Multi-tool AI turn → one full `Render.all()`-equivalent per applied tool (Finding 4.3).
5. `addEvent` sends `['stat','chronicle']` — `stat` is redundant for a pure event add (no stat changed), causing identityStrip/nationCard/arsenal to recompute needlessly. Harmless.

---

## TOP 3 — must fix

1. **`statDelta` AI tool-apply bypasses `checkThresholds`/front-triggers (Finding 4.1, 8383).** A headline automation feature is silently dead on one of two AI code paths. Route through `State.setStat`. Highest correctness impact, invisible in testing. (Coordinate with L2/L5.)

2. **Open side-panels go stale after undo AND after switch-nation (Findings 2.1, 2.2, 3.1).** The `nation` early-return at 12984 + `Render.all()`'s panel-blindness means undo shows ghost rows and — far worse — switching realms shows the *previous* realm's sessions/hooks/secrets in an open panel. Cross-realm data confusion. Fix by either closing panels on nation-switch/undo or routing panel refresh through one place that `Render.all()` also calls.

3. **No listener-attachment idempotency anywhere except onboarding (Findings 5.1, 5.2, 7.1).** Every `sc:changed` and document-click listener is attached with naked anonymous closures and no guard; a single re-entry of `bootstrap` doubles every render and every handler. Also consolidate the three private panel listeners into `dispatchRender` so the refresh contract is singular and `front`/`solo` panels stop being orphaned.
