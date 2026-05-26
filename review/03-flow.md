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

---

## ROUND 2 — Cross-review, debunks, new findings & consolidated fixes

Method: re-read every cited line in `src/index.html`. Built on the already-completed Round-2 sections in `02-copilot.md` (Copilot E1/E2, A1–A5) and `05-logic.md` (Logic D-map, A-3). RESEARCH ONLY — no edits. Cross-refs verified against code, not against the other reports' prose.

### (A) CONFIRMED

**A1 — L3 4.1 / L2 A1 / L5 A-3 (AI `statDelta` bypasses checkThresholds): CONFIRMED at index.html:8386.**
`_applyProposal` statDelta branch does `s.value=p.data.newValue;` then dispatches `['stat']` (8387). It never calls `State.setStat` and never calls `Compute.checkThresholds`. The canon path routes through `setStat` (7057→5545) which DOES fire `checkThresholds`. `checkThresholds` (6336-6339) emits the threshold chronicle event AND (6350) calls `tickFront` for front optional-stat-triggers. Both subsystems are silently dead on the AI tool path. The reroute fix (`State.setStat(n.id,p.data.stat,p.data.newValue)` + delete the manual 8387 dispatch) is correct — and note `setStat` itself calls `pushUndo` (5542), so the caller's existing `pushUndo` (8290/8426) would double-push. **The reroute MUST also drop the caller-side `pushUndo` for the statDelta case, or undo will need two presses to revert one AI stat write.** This is the undo/dispatch consequence the brief asked me to confirm: rerouting through setStat fixes thresholds but introduces a double-undo unless the redundant pushUndo is removed. (L2's E2 framing missed this; flag it.)

**A2 — L1 finding 4 (persist/clobber) — CONFIRMED but largely self-healing; my Round-1 6.1 stands.** `persist()` (5496) and `persistNow()` (5517) both serialize `_stateForPersist()` at execution time (live `State.data`), so there is no stale-snapshot clobber of field values — concur with L1 that the durable copy is current. The real residue is (a) the localStorage mirror is written AFTER the IDB `.then` (5505), so a crash in the 400ms window leaves IDB/localStorage at different generations (L1 finding 4.1 — confirmed), and (b) `persistNow`/`snapshotIfDue` don't `persist.cancel?.()`, so dueling `setSave('saved')` timers race. Neither is data-loss; both are real. The generation counter (5500-5508) only guards `resetAll`, confirmed.

**A3 — L2-R2 A3 (both AI paths differ in undo semantics; canon scan not suppressed when a tool fired): CONFIRMED at 8804.** The post-stream canon scan (8804) gates only on `!errorMessage && !aborted` — NOT on whether a tool fired this turn. So a model emitting a tool call AND a `[CANON]` block triggers both apply paths. Undo semantics genuinely differ: tool path = per-`_applyProposal` no-pushUndo of its own (relies on caller's single pushUndo at 8290/8426 for the whole turn); canon path = one `pushUndo` for the batch in `applyCandidates`. So an N-tool turn is ONE undo step (caller pushUndo once, then N mutations) — meaning **undo of a multi-tool AI turn reverts ALL N changes in one press**, which is actually the desired behavior, but it is INCONSISTENT with the per-event undo a user gets from manual edits. Concur with L2's unify-the-pipeline fix (E2).

**A4 — L4 E1 (innerHTML rebuilds destroy focus/scroll): CONFIRMED and load-bearing for my own fix — see C1.** `Render.all()` (6401) and every panel render does `ctr.innerHTML=html`. Verified at workbenchCharacters 6518, WorldShell factions 11521, SHSPanels. This is the reason my Round-1 fix-option (c) is incomplete (C1).

### (B) DEBUNKED / CORRECTED

**B1 — DEFINITIVE NO: the orphan-`factionId` read does NOT throw anywhere. L5 finding 6's "worst case .name of undefined throws" is DEBUNKED.** Traced every faction-resolution path:
- **There is NO faction-delete operation in the entire codebase.** `grep` for `removeFaction`/`factions.splice`/`factions.filter(...id)` returns nothing. Factions are only created (CANON 7066, import 5138, AI is stance-only). So the orphan-`factionId` precondition is **unreachable through the UI** — L5's trigger ("GM deletes the Merchant Assembly") cannot happen.
- Even if an orphan id existed (via hand-edited import), every read path is null-safe: `factionName` (10335) uses `?.name||id` (optional chaining → falls back to the raw id string, no throw); `resolveVars` (6358/6364) iterates `nation.factions` directly (never resolves a char's factionId); `workbenchCharacters` (6497-6514) renders name/status/role/links/seeds — **it does not render faction at all**; the edit-character `<select>` (7202) builds options from current factions and just shows "— None —" if no match; the relationship web (12526-12527) pushes an edge `t:'f:'+c.factionId` but then filters edges to node-set membership (12572-12573 `if(nodeIds.has(e.s)&&nodeIds.has(e.t))`) → an edge to a non-existent faction node is silently dropped.
**Conclusion: no `undefined.name` deref exists; nothing throws. L5 finding 6 should be downgraded from "LOW/MEDIUM, may throw" to "LOW, cosmetic-only (blank/raw-id display) AND currently unreachable because factions can't be deleted." The real latent risk is the reverse: if a faction-delete is ever ADDED, it must sweep `c.factionId` — but today there is nothing to sweep.** (Exact lines proving no-throw: 10335, 6358, 6364, 6502-6514, 7202, 12573.)

**B2 — Partially DEBUNK my own Round-1 4.2 severity for `faction`.** Re-confirmed dispatchRender has no `faction`/`artifact`/`front`/`solo` branch (12986-13002). So `factionStance` (8380) dispatching `['faction']` triggers only `identityStrip()` + WorldShell-if-ember (13004). BUT WorldShell.render DOES rebuild the faction cards (11489-11521). So in the **default ember theme** (the shipped default), an AI faction-stance change DOES visibly refresh via the WorldShell path at 13005 — my Round-1 "no panel re-renders" was wrong for ember. It only goes stale in non-ember themes or when the Workbench political domain is the visible surface. Downgrade 4.2 from MEDIUM to LOW, theme-conditional.

**B3 — CONFIRM, not debunk, L2-R2 B2:** the multi-tool render-thrash (my 4.3) requires `copilotAutoApply:true`, which has no UI (L2 finding 3). Concur it is effectively unreachable in shipped config; keep LOW/latent.

### (C) NEW findings (Round 2 — interactions)

**C1 — My own Round-1 fix-option (c) [remove the early `return` at 12984] IS INCOMPLETE — it causes a DOUBLE focus/scroll destruction, not a CSS flicker. — MEDIUM — index.html:12984 + 6401 + L4 E1.**
Trace A→B→C: (A) user opens Hooks panel, focuses a partially-typed inline field or scrolls the list; (B) presses Ctrl+Z → `undo()` dispatches `['nation','stat','chronicle']` (5469); (C) with the `return` removed, dispatchRender runs `Render.all()` (6401, rebuilds workbench/nationCard/etc via innerHTML — destroys any focus/scroll in those regions per L4 E1) AND THEN falls through to the SHSPanels block (12993) which calls `SHSPanels.renderHooks()` (another innerHTML rebuild of the hooks panel — destroys focus/scroll there too). So option (c) makes the panel CORRECT but rebuilds it via innerHTML, inheriting L4 E1's focus/scroll loss. It also means `identityStrip()` renders **twice** (once inside Render.all 6401, once at 12985) — harmless but wasteful.
**The COMPLETE fix:** option (c) is still the right correctness move, but it must be paired with L4 E1's mitigation: capture+restore `document.activeElement` id and `scrollTop` around the innerHTML swaps in the panel render functions. AND remove the redundant `Render.identityStrip()` at 12985 when `Render.all()` already ran (guard: only run the line-12985-onward block when `!fields.includes('nation')`). Cleaner still: make `Render.all()` itself call the SHSPanels-refresh block (move 12993-13002 into a `Render.refreshOpenPanels()` helper that BOTH `Render.all()` and dispatchRender call), so there is one panel-refresh contract and no double identityStrip. This is the architecture in (D).

**C2 — Undo / switch-nation MID-STREAM causes a torn write (split-brain): the in-flight Copilot stream silently resurrects the pre-undo / wrong-nation conversation. — HIGH — index.html:5466, 5628, 8611, 8762.**
`_streamingNationId` (8600) is NOT enough. Trace A→B→C: (A) user sends a Copilot message → `send()` captures `n` (the live nation object) and pushes an assistant placeholder onto `n.copilotConversation` (8611); stream begins. (B) mid-stream the user presses Ctrl+Z → `undo()` (5466) does `this.data=JSON.parse(prev)` — **`State.data` is now a brand-new object tree; the old `n` reference the stream closure holds is now an orphan detached from `State.data`.** Neither `undo()` (5460) nor `switchNation()` (5628) checks `Copilot._sending` or calls `_abortController.abort()` (verified: no such guard exists; 13157 undo handler only checks `isText`). (C) stream finalize (8762) does `State.data.nations.find(x=>x.id===this._streamingNationId)` — re-resolving by id against the NEW post-undo `State.data` — and writes `last.content=accumulated` + `_sentContext` + `_costStamp` to the restored nation, then `State.persist()` (8771). Net effect: the streaming UI updates wrote to the orphan object (lost), but the finalize writes the assistant message into the restored state — so the undo is partially clobbered (the conversation the user undid reappears), and any tool calls already applied during the loop (8733, mutating via `_streamingNationId`) wrote to whichever object `State.data.nations.find` returned at exec time. With switch-nation it's worse: the canon-review guard (8809 `_streamingNationId===activeNationId`) suppresses the modal, but the silent tool applies + finalize still land on the streaming nation, which is no longer visible — the GM sees nothing change on the realm they switched TO, while the realm they LEFT was mutated.
**Fix:** `undo()`, `redo()`, and `switchNation()` must, if `Copilot._sending`, call `Copilot.cancel()` (which aborts the controller, 8859) BEFORE mutating/replacing `State.data`. cancel() sets `aborted` so the finalize at 8804 skips canon parsing; additionally the finalize block (8762-8772) should bail if `this._aborted` rather than re-resolving and writing. One guard at the top of each: `if(typeof Copilot!=='undefined'&&Copilot._sending)Copilot.cancel();`.

**C3 — `setStat` fires a RE-ENTRANT render cascade: a single slider commit can trigger 2-3 synchronous dispatchRender passes, each an innerHTML rebuild. — MEDIUM (perf + focus/scroll) — index.html:5545→6339→6350→5546.**
Trace A→B→C: (A) user drags Legitimacy across a `falling@30` threshold and releases → `change` fires `setStat` (5534); (B) line 5545 calls `Compute.checkThresholds` — which, BEFORE setStat has dispatched anything, synchronously pushes a threshold chronicle event and dispatches `['chronicle']` at 6339 → dispatchRender runs the FULL stat/chronicle cascade (nationCard+pressurePoints+recentPulse+arsenal+chronicleBand, 12986) — innerHTML rebuilds × ~5 regions; then 6350 `tickFront` may dispatch `['front']` → another dispatchRender pass; (C) control returns to setStat which dispatches `['stat']` at 5546 → a THIRD full cascade rebuilding the same regions. So one stat edit = up to three synchronous innerHTML storms over the same DOM, compounding L4 E1's focus/scroll loss and L4 A2's web-rebuild cost (the web re-renders on every `sc:changed`, 13000). The threshold event's own `sc:eventAdded` (6338) additionally fires the toast listener (13787).
**Fix:** batch within a mutation. Either (i) have `checkThresholds` collect changes and let setStat dispatch ONE union `['stat','chronicle','front']` after it returns (move the 6339 dispatch out of the loop), or (ii) coalesce dispatches in the same tick via a microtask-debounced render queue keyed by field union. Option (i) is the minimal change and also fixes the re-entrancy ordering (currently chronicle renders before the stat value's own render, so the dashboard briefly paints the new chronicle against the OLD stat number for one synchronous frame — invisible to the eye but a real ordering inversion).

**C4 — Escape-key order: SC slide-in panels (sessions/hooks/secrets/locations/bestiary/relations/web/threads) are NOT in the Escape chain; Escape with an SC panel open closes the WRONG thing or nothing. — MEDIUM (UX, confirms L4 D2 from the flow side) — index.html:13147-13152.**
The keydown handler (13147) closes, in order: Copilot → detail-panel → `Modals.closeAll()`. SC panels are absent. Trace: (A) GM opens the Sessions SC panel; (B) also has Copilot open (common — reference while editing); (C) presses Escape → branch 13148 fires `Copilot.close()`, leaving the Sessions panel open; press Escape again → no detail-panel, so `Modals.closeAll()` runs (13151) which does NOT touch SC panels (they're not modals) → Sessions panel stays open, un-closable by keyboard. There is also no `stopPropagation` conflict because there is only one document-level keydown listener for Escape — but the ORDER hard-codes Copilot/detail/modal precedence and silently ignores the highest-z-index visible surface (SC panels at z-index 7000, above modals' 1010 per L4 C2). So Escape closes a LOWER-z surface (Copilot, z 11) while leaving the TOP surface (SC panel) open — backwards from user expectation ("Escape closes the topmost thing").
**Fix:** prepend an SC-panel check to the Escape chain: `if(typeof SHSPanels!=='undefined'&&SHSPanels._open){SHSPanels.closeAll?.();return;}` as the FIRST branch (topmost surface first). Pairs with L4 D2's focus-restore.

**C5 — Tonight delete path (9885/9989) + switchNation inconsistency: only switchNation closes the detail panel; neither closes SC panels. — MEDIUM (confirms my Round-1 8.1, adds the switchNation gap) — index.html:5638, 9885, 9989.**
`switchNation` closes the detail panel (5638) but NOT SC panels — so after a nation switch an open Sessions panel shows the previous realm's sessions (my Round-1 3.1, re-confirmed: panel render fns read `State.get()` but are simply not re-invoked because dispatchRender's `nation` branch early-returns at 12984). The Tonight cleanup (9885) and error path (9989) dispatch `['nation']` and close NOTHING. So three nation-changing paths have three different close behaviors. **Fix (single contract):** add `if(typeof SHSPanels!=='undefined')SHSPanels.closeAll();` and a detail-panel close to ALL THREE paths (switchNation 5645, Tonight 9885/9989), OR — better — fold it into the (D) reconcile step so any `nation`-field dispatch closes/reconciles per-nation views in one place.

### (D) CONSOLIDATED — one reconcile-step architecture

The undo-stale-panel bug (my 2.1/3.1, C1), L5's orphan-ref (B1, latent), and L1's snapshot-restore data-loss (L1 finding 3) are all instances of **"state mutated, but views/refs not reconciled against the new state."** They share a root with Copilot-R2 E2 ("one AI pipeline through State mutators"): both want a single, authoritative point where post-mutation reconciliation happens.

**Proposal: a `State.reconcile(fields)` step that runs after EVERY mutation, sitting between the mutators and the renderers.**

```
mutator() → pushUndo → mutate data → _touch → State.reconcile(fields) → dispatch 'sc:changed' → persist
```

`reconcile(fields)` does three things the current code scatters or omits:
1. **Ref integrity (closes L5 B1's latent class):** when `fields` touches an entity that others reference (faction/location/character/event delete), null dangling refs (`c.factionId`, `c.basedInLocationId`, `chronicleLinks`, `relatedFactions`, relation endpoints). Today `removeEvent`/`removeLocation` do this ad hoc (5566, 6115) and a future faction-delete would forget — centralizing it means the invariant "every stored id resolves" is enforced in ONE place, regardless of which mutator ran.
2. **View reconciliation (closes 2.1/3.1/C1/C5):** a single `Render.refreshOpenPanels()` that re-renders whichever SC panel is `_open` for the changed fields (the current 12993-13002 block, extracted). Both `dispatchRender` AND `Render.all()` call it, so undo/switch-nation/snapshot-restore/Tonight-delete can never leave a panel stale. On a `nation`-field change it additionally `SHSPanels.closeAll()` + detail-panel close (per-nation contents have no cross-nation continuity) — one decision, all three paths.
3. **Focus/scroll preservation (closes the C1 regression + L4 E1):** wrap the panel innerHTML swaps with a capture/restore of `document.activeElement` id + `scrollTop`, so reconcile never destroys an in-progress edit.

How it sits alongside Copilot-R2 E2: E2 routes all AI applies through `State.setStat`/`State.addEvent`/etc. Those mutators already call the template (pushUndo→mutate→reconcile→dispatch→persist), so the AI path inherits ref-integrity, panel reconciliation, AND threshold/front-trigger firing **for free** the moment `_applyProposal` stops hand-mutating (fixes my 4.1/A1, L2 E2, L3 4.2 in one stroke). The two consolidations compose: **E2 makes every write go through a mutator; `reconcile` makes every mutator leave the world consistent.** Snapshot-restore (`commitRestore` 5833) and undo (5466) — which replace `State.data` wholesale rather than calling a mutator — must explicitly invoke `reconcile(['nation', ...all])` after the swap (and L1's content-diff + push-current-to-undo fix layers on top of that). Net: one mutation template, one reconcile step, one panel-refresh contract — the "state changed but views/refs not reconciled" class is closed structurally rather than patched per-symptom.

### Round-2 tally
Confirmed: A1 (statDelta threshold bypass, +undo double-push consequence), A2 (persist mirror generation gap), A3 (canon scan not tool-gated), A4 (innerHTML focus loss). Debunked/corrected: B1 (orphan-ref does NOT throw — definitive NO), B2 (faction refresh works in ember theme — downgrade), B3 (autoApply unreachable). New: C1 (my own fix incomplete — double focus/scroll loss), C2 (mid-stream undo/switch torn write — HIGH), C3 (setStat re-entrant render cascade), C4 (Escape ignores top SC panel), C5 (three inconsistent nation-change close behaviors). Consolidated: D (`State.reconcile` step composing with Copilot E2).
