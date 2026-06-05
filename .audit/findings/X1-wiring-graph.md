# X1 — Whole-File WIRING-GRAPH Synthesis

Target: `6b9eaae1-relamwrith_V7.HTML` (17,864 lines). Cross-cutting reachability + dispatch
synthesis — the view no single chunk could see. Per-module wiring bugs already filed in
C04–C13; this consolidates them into module-level reachability, the complete dispatch table,
the listener-leak class, and the route table.

Method: text-mode grep over the whole file (`grep -a` — the file has non-UTF8 bytes and trips
binary detection; all counts here use `-a`). Entry point is `bootstrap()` at **L17335**, wired
to `DOMContentLoaded` at **L17518**. Master render subscription is `dispatchRender ← sc:changed`
at **L16617**.

---

## 1. MODULE REACHABILITY

There is **no class-based Router**. "Routing" is three mechanisms:
- **Panel nav** — `SHSPanels.openPanel(route)` keyed off `.wms-nav__item[data-route]` (event
  delegation in `WorldShell.attachListeners`, L14352).
- **Mode overlays** — Tonight / Campaign / Front-Door full-screen layers toggled by class in the
  mode-dropdown handler (L15825).
- **Modals** — `Modals.open(id)` (L8421), which also dispatches `sc:modal-open` (L8432).

Bootstrap is a flat **mount manifest** (L17336–17496): it `await`s State/License/Demo/AutoSave,
then calls `.bind()` / `.init()` / `.mount()` on ~30 UI modules behind `typeof X!=='undefined'`
guards. Every top-level module in `.audit/modules.txt` resolves to a reachable entry point
**except `EmptyStates`** (and two stranded methods on otherwise-live objects).

| Module | Reachable? | Entry point |
|---|---|---|
| State | YES | `await State.load()` L17336; 526 refs |
| Compute / Utils / UI / Markdown / Variants / CLAMP | YES (libraries) | called pervasively (Utils 266, Compute 48, Markdown 21) |
| Parse | YES | `Parse.canonBlock` L15965/15993; decipher L17430 |
| Interact | YES | bound in workbench/WorldShell (L7842, L14159…); 14 refs |
| Render | YES | `Render.all()` L17501/17503; `dispatchRender` L16617 |
| FocusTrap | YES | used by Modals (8 refs) |
| Modals | YES | `Modals.open` 113 refs |
| Secrets | YES | Copilot key read/write (32 refs) |
| LicenseGate | YES | `await LicenseGate.init()` L17339 |
| LicenseQueue | YES | `LicenseQueue.drain()` L17342 |
| DemoCounter | YES | `await DemoCounter.init()` L17343 |
| Demo | YES | reachable via FrontDoor demo path (15 refs) |
| AutoSave | YES | `await AutoSave.init()` L17344 |
| LicenseGateUI | YES | `LicenseGateUI.bind()` L17345 — **but binds 3 null els (C13-1)** |
| SampleMode | YES | `SampleMode.bind()` L17346 |
| Solo | YES | `Solo.bind()` L17347; nav route `solo`→panel-solo |
| FrontDoor | YES | `FrontDoor.bind()` L17348; `.open()` L17499 first-run |
| Tonight | YES | `Tonight.bind()` L17349; mode `tonight` |
| TransparencyLog | YES | `TransparencyLog.bind()` L17350 |
| CostMeter | YES | `CostMeter.bind()` L17351 |
| CostGate | YES | `CostGate._ensure()` L17352 |
| AccuracyChip | YES | `mount()` per `sc:modal-open` L17381 — **leaks (C12-3)** |
| MobileGate | YES | `MobileGate.bind()/.check()` L17383 |
| SHSPanels | YES | `SHSPanels.bind()` L17384; the panel dispatcher |
| Fronts | YES | `Fronts.bind()` L17385; nav `fronts` |
| Handouts | YES | `Handouts.bind()` L17386; GM bar `gm-letter/news/proclamation-btn` |
| Bestiary | YES | `Bestiary.bind()` L17387; nav `bestiary` |
| Relations | YES | `Relations.bind()` L17388; nav `relations` |
| RealmSettings | YES | `RealmSettings.bind()` L17389; opens via click on `wms-nation-title` (L15075) → `panel-realm-settings` |
| RelationshipWeb | YES | `RelationshipWeb.init()` L17390; nav `web` — **`_render` leak (C11-1)** |
| GlobalSearch | YES | `GlobalSearch.bind()` L17391; Ctrl+K L15945 |
| SnapshotManager | YES | `SnapshotManager.bind()` L17392; renders on `sc:modal-open=='settings'` (L16868) |
| GlossaryUI | YES (GM-gated) | `GlossaryUI.bind()` L17393; trigger `gm-glossary-btn` L3383 (GM bar only) |
| NamingUI | YES (GM-gated) | `NamingUI.bind()` L17394; trigger `gm-names-btn` L3369 (GM bar only) |
| EncounterBuilder | YES (GM-gated) | `EncounterBuilder.bind()` L17395; trigger `gm-encounter-btn` L3384 (GM bar only) |
| Threads | YES | `Threads.bind()` L17396; nav `threads` |
| WorldShell | YES | `WorldShell.mount()` L17462; `Render.all` L7696 |
| Ambient | YES | `Ambient.apply()` L17472 |
| Copilot | YES | `Copilot.updateStatus()` L17474; 251 refs |
| GMMode | YES | `GMMode.apply()` L17493 |
| LiveMode | YES (but stub) | `LiveMode.init()` L17496 — **`_maybeFire()` is a no-op stub (C09)** |
| GMMode/Campaign/Tonight modes | YES | mode-dropdown L15825 |
| FoundryExport | YES | `FoundryExport.download('active')` L15853 |
| PromptFill | YES | `PromptFill.build(...)` (Copilot prompt assembly, L5100/17125) |
| PROMPTS / SEED_NATIONS / DEFAULT_SETTINGS | YES | data consts consumed by State/Copilot |

### DEAD / never-mounted (whole features or methods built and not wired)
- **`EmptyStates` (L5769–5799) — DEAD, 1 ref (definition only).** Six section definitions, six
  action handlers, full render logic. No surface calls `EmptyStates.render()`. The product has
  **no empty-state CTA system**; list-empty states are hand-rolled inline instead. One action
  handler even calls `Copilot.generateHooks()` which doesn't exist — would no-op if ever wired.
  *(= C03-1)*
- **`EffortPicker.render()` / `.bindAll()` (L5611–5631) — DEAD methods on a live object.** The
  inline tier-select widget is never produced; `AccuracyChip._openTierPicker` builds its own
  popover from `EffortPicker.TIERS` instead. The helpers (`TIERS/toDepth/fromDepth`) ARE used —
  keep them; the two UI methods are stranded. *(= C03-2)*
- **Orphan functions** (already established, not re-scanned): `storageAvailable` (dead),
  `deviceFingerprint` (dead).

**Verdict on reachability:** no entire top-level *feature module* is unmounted. The reachability
risk is narrower and more insidious — three real, fully-built features (**Glossary, Naming,
Encounter Builder**) are reachable **only through the GM-mode bar** (`#gm-bar`), which is hidden
until the user flips GM Mode on. A user who never enables GM Mode can never open them. They are
wired but **discovery-dead** for the default (non-GM) user.

---

## 2. RENDER-DISPATCH COVERAGE (the complete table)

The dispatch architecture is **split across 8 independent `sc:changed` subscribers**, not one
dispatcher. This is the cross-cutting fact no chunk saw:

| L | Subscriber | Scope |
|---|---|---|
| **16617** | `dispatchRender` | **master** — dashboard + `refreshOpenPanels` |
| 5728 | AccuracyChip.mount | per-mount chip refresh (**leaks**, C12-3) |
| 12173 | Campaign live-rail | only when Campaign mode active |
| 14658 | Fronts | `front` field → `renderList()` (NOT `_open`-gated) |
| 14923 | Bestiary | `bestiary` field **&&** `_open==='bestiary'` |
| 15010 | Relations | `relation` field **&&** `_open==='relations'` |
| 15113 | onChanged | onboarding nudge (transient) |
| 17572 | emberDecorate | cosmetic modal corners |

Because Fronts/Bestiary/Relations self-subscribe, the relevant question is the **union** of the
master `refreshOpenPanels` (L7703–7716) **plus** the self-subscribers. Complete panel-vs-refresh
matrix:

| Panel (nav route) | in `refreshOpenPanels`? | own `sc:changed`? | Field gate | Reactive on partial render? |
|---|---|---|---|---|
| sessions | YES (`want('session')`) | no | session | ✅ |
| hooks | YES (`want('hook')`) | no | hook | ✅ |
| secrets | YES (`want('secret')`) | no | secret | ✅ |
| locations | YES (`want('location')`) | no | location | ✅ |
| bestiary | YES (`want('bestiary')`) | YES (gated) | bestiary | ✅ (**double-render** — both fire) |
| relations | YES (`want('relation')`) | YES (gated) | relation | ✅ (**double-render** — both fire) |
| web | YES (char/faction/location/relation) | no | multi | ✅ |
| threads | YES (**ungated** — C12-6) | no | none | ✅ but re-renders on *every* change (waste) |
| **fronts** | **NO** | YES (L14658, **not `_open`-gated**) | front | ⚠ refreshes, but **only on `front`**, and renders even when panel closed |
| **solo** | **NO (C12-7)** | **NO** | — | ❌ **STALE** — `renderSolo` (L13430) only runs on `openPanel('solo')` |
| realm-settings | NO | via `onChanged` L15086 | — | ✅ (separate path) |

### Dispatch GAPS (every stale-after-change path)
1. **`solo` — fully stale on incremental render (C12-7).** Not in `refreshOpenPanels`, no own
   listener. A stat/character edit while the Solo panel is open leaves it showing old data until
   a full `Render.all()` (undo/import/nation-switch). Worst gap because there is **zero** reactive
   path, not merely a missing dispatcher branch.
2. **`faction` field — handled by NObody in the dashboard path (C12-4).** `dispatchRender`
   (L15690) has branches for nation/stat/chronicle/customStat/character — **no `faction` branch**.
   None of Fronts/Bestiary/Relations watch `faction`. Only Campaign's live-rail (L12177) reacts,
   and only in Campaign mode. So the AI `factionStance` tool (dispatches `fields:['faction']`,
   L9735) updates state but **leaves the war-room/workbench faction list stale** in normal mode.
3. **`threads` — ungated (C12-6).** Re-renders the whole Threads panel on *every* `sc:changed`,
   including stat-slider drags. Perf, not correctness.
4. **`bestiary` / `relations` — double-subscribed.** Both `refreshOpenPanels` AND a private
   listener fire on the same event → two renders per change. Harmless output, wasted work; also
   a maintenance trap (future edits must keep two sites in sync).
5. **`fronts` — private listener is not `_open`-gated.** `renderList()` runs on any `front`-field
   change even when the Fronts panel is closed (cheap, but unnecessary DOM work).

**Recommended consolidation:** fold all panels into the single `refreshOpenPanels` switch
(add `solo`, `fronts`; gate `threads`), add `if(fields.includes('faction'))Render.workbench()`
to `dispatchRender`, and **delete** the redundant private listeners on Fronts/Bestiary/Relations
so there is exactly one render authority. This kills gaps 1–5 at once.

---

## 3. EVENT-LISTENER LIFECYCLE — the leak class (consolidated)

"Re-bind on a persistent target inside a function that runs more than once, with no removal."
34 `document`/`window` `addEventListener` sites exist; the vast majority are in one-shot
`bind()`/`init()`/`bootstrap` and are SAFE. The genuine leaks:

| Site | Enclosing fn (re-runs) | Target | Listener(s) | Class | Severity |
|---|---|---|---|---|---|
| **L15394** | `RelationshipWeb._render()` — every click/drag-frame/filter/build | `svg` (persistent) | `click` → calls `_render()` (adds another) | **exponential self-stacking** | **CRITICAL (C11-1)** |
| **L5725, L5728** | `AccuracyChip.mount()` — every `sc:modal-open` (9 surfaces) | `document` | `rw:effort-changed` + `sc:changed` | unbounded, stale closures over detached `containerEl` | HIGH (C12-3) |
| **L14431** | `PrintPreview.show()` — every print/preview | `document` | `keydown` (self-removes only on Escape, not on button-close) | accumulates per button-dismiss | HIGH (C11-2) |

Verified NON-leaks (correctly placed, do not re-flag):
- RelationshipWeb `init()` listeners (L15427/15445/15446/15447/15455 — `mousemove/up/leave/mousedown/wheel`) live in `init()` (one-time). Correct.
- Per-node `el.addEventListener` inside `_render()` (L15367/15380) attach to **freshly-created**
  node elements that are GC'd on next `innerHTML` swap — not leaks.
- All `bind()`-scoped `document.addEventListener('click', …)` dropdown-closers (L15745/15774/
  15801) and `sc:changed` subscribers in module `bind()`s (Fronts/Bestiary/Relations/Campaign/
  TransparencyLog) — `bind()` runs once from bootstrap. Safe **today**; fragile (no `_bound`
  guard) if any `bind()` is ever called twice (cf. C12-8).

Common root cause across all three real leaks: **the persistent listener lives in the render/show
path instead of the one-time init path.** The fix pattern is identical — hoist to `init()`/store
the handler ref and `removeEventListener` in `close()`/use an `AbortController` per mount.

---

## 4. ROUTE TABLE

Two distinct route surfaces. They must agree but **don't** — that mismatch is C12-2.

**A. Nav rail (`.wms-nav__item[data-route]`, handled in `WorldShell.attachListeners` L14352):**

| `data-route` | Target | Real panel? |
|---|---|---|
| war-room | `SHSPanels.closeAll()` (chronicle band is the persistent footer) | n/a — correct, no panel needed |
| chronicle | `SHSPanels.closeAll()` (same — footer band L3426) | n/a — correct |
| sessions | `openPanel('sessions')` | ✅ `panel-sessions` |
| hooks | `openPanel('hooks')` | ✅ `panel-hooks` |
| secrets | `openPanel('secrets')` | ✅ `panel-secrets` |
| fronts | `openPanel('fronts')` | ✅ `panel-fronts` |
| locations | `openPanel('locations')` | ✅ `panel-locations` |
| bestiary | `openPanel('bestiary')` | ✅ `panel-bestiary` |
| relations | `openPanel('relations')` | ✅ `panel-relations` |
| web | `openPanel('web')` | ✅ `panel-web` |
| solo | `openPanel('solo')` | ✅ `panel-solo` |
| threads | `openPanel('threads')` | ✅ `panel-threads` |

Nav rail is **clean** — all 12 routes resolve (10 to panels, 2 to the persistent chronicle).
`openPanel`'s panel list (L12728) and `closeAll` (L12743) both enumerate the same 10 panels;
`panel-realm-settings` is correctly **excluded** (it opens via nation-title click, not nav).

**B. GlobalSearch `_activate` panelMap (L15619) — the BROKEN surface (C12-2):**

| result type | panelMap route | resolves via `openPanel`? |
|---|---|---|
| characters | `war-room` | ❌ no `panel-war-room` → `openPanel` early-returns, silent no-op |
| factions | `war-room` | ❌ same |
| events | `chronicle` | ❌ no `panel-chronicle` → silent no-op |
| secrets/hooks/sessions/locations/bestiary | (matching) | ✅ |

`GlobalSearch._activate` calls `this.close()` (wipes results) **then** `openPanel('war-room')`
— but `openPanel` only knows the 10 real panels; `war-room`/`chronicle` aren't among them, so it
returns at L12736 and nothing happens. Clicking a **character / faction / event** search result
closes the modal and visibly does nothing. The nav rail handles these two pseudo-routes correctly
(via `closeAll`); the search code re-implemented routing with a divergent map and got it wrong.
**Fix:** in `_activate`, special-case `war-room`/`chronicle` to `SHSPanels.closeAll()` (mirror
the nav), or route to the entity detail panel.

**Routes with no panel:** none on the nav (intentional — `war-room`/`chronicle` = the dashboard
itself). **Panels with no route:** `panel-realm-settings` (intentional — reached by nation-title
click). **Search routes with no panel:** `war-room`, `chronicle` (the C12-2 bug).

Also note (cross-ref C12-1): GlobalSearch **indexes** only 8 of 12 entity types — `fronts`,
`relations`, `artifacts`, `glossary` are never searchable even though they have nav panels /
data. So the search surface is doubly broken: half the entities aren't indexed, and 3 of the
types that ARE indexed dead-end on click.

---

## Summary

| Class | Count (this synthesis) |
|---|---|
| Dead/never-mounted features | 1 module (`EmptyStates`) + 2 stranded methods (`EffortPicker.render/bindAll`) + 2 orphan fns (already known) |
| Discovery-dead (GM-gated) features | 3 (Glossary, Naming, Encounter Builder) |
| Render-dispatch gaps | 5 (solo-stale, faction-unhandled, threads-ungated, bestiary/relations double-render, fronts ungated) |
| Listener leaks (persistent target in re-run fn) | 3 (RelationshipWeb._render CRIT, AccuracyChip.mount HIGH, PrintPreview HIGH) |
| Broken routes | 1 surface (GlobalSearch `_activate`: chars/factions/events dead-end) |

**Top 3:**
1. **RelationshipWeb `_render()` self-stacking `svg.click` (L15394) — CRITICAL.** The only
   persistent-target listener inside a hot render fn; every render adds one, each fires `_render`
   on click → unbounded/exponential. The container/svg drag+zoom listeners are correctly in
   `init()`; this one line is the whole bug. (= C11-1, now pinned and bounded.)
2. **The dispatch authority is split 8 ways and two real gaps fall through it:** `solo` has **no
   reactive path at all** (stale on every partial render, C12-7) and `faction` is handled by
   **nobody** in the dashboard path (AI faction-stance edits leave the UI stale, C12-4). The
   self-subscribing Fronts/Bestiary/Relations listeners mask the architecture and double-render.
3. **GlobalSearch re-implemented routing and diverged:** characters/factions/events map to
   `war-room`/`chronicle`, which `openPanel` doesn't know → click closes the modal and no-ops
   (C12-2); separately, fronts/relations/artifacts/glossary aren't indexed at all (C12-1).

---

## WIRING VERDICT

The wiring graph is **structurally sound but leaky at the edges, and its dispatch layer is
fragmented**. Bootstrap is an honest flat mount manifest — every top-level feature module is
actually mounted, the JS↔HTML id wiring is clean (C15: 471 getElementById resolve), the nav rail
routes all resolve, and `Modals.open`'s `sc:modal-open` event correctly drives the snapshot list
and accuracy chips. The failures are not "a feature was never wired up" wholesale; they are
narrower and more embarrassing for a paid tool: one genuinely-dead UX subsystem (`EmptyStates`),
three fully-built features (Glossary/Naming/Encounter) reachable **only** behind the off-by-default
GM bar, a state→render layer that grew **eight competing `sc:changed` subscribers** so that two
fields (`solo`, `faction`) slip through every one of them and two panels render twice, three
listener leaks that put a persistent handler in a re-run render path (one of them, RelationshipWeb,
an exponential freeze), and a search feature that re-implemented routing badly enough that clicking
a character result does nothing. None of these are hard to fix — the through-line is **"one render
authority, listeners in init not render"** — but until they are, the product silently goes stale,
slowly leaks, and dead-ends the user on its two most data-dense surfaces (search, the relationship
web). Wire the dispatch into the single `refreshOpenPanels` switch, hoist the three leaking
listeners to their `init()`, surface the GM tools outside GM mode, and reconcile the search
panelMap with the nav, and the graph is bulletproof.
