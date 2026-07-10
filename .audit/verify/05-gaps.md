# Verify Pass 05 — Adversarial Gap-Hunt (5 high-risk zones)

Target: `6b9eaae1-relamwrith_V7.HTML` (17,864 lines). READ-ONLY adversarial sweep for NEW bugs the existing REPORT.md missed.
Methodology: code-review-excellence (logic/edge/race/error-handling) + cso (OWASP/STRIDE) lens.
Known clusters excluded as dups: C01–C14, X1/X2/X2a, secret-leak cluster, license self-revoke/expiry/device-cap chain, listener leaks, export/search coverage gaps, undefined CSS vars, dead search routes, solo/faction dispatch fall-through.

_Status: COMPLETE — all 5 zones swept._

---

### GAP-1: Snapshot restore silently wipes the in-memory OpenRouter API key   [zone: state]
- severity: HIGH / confidence: HIGH (Node-proven) / tag: BUG
- proof:
  - At snapshot time the key is intentionally nulled before storage — `snapshotIfDue` @ **L7016**: `if(clone.meta?.settings?.copilotKey)clone.meta.settings.copilotKey=null;`
  - On restore, `State.commitRestore` @ **L7074-7080** replaces live state with that nulled blob and never re-hydrates the secret:
    `this.data=migrateIfNeeded(JSON.parse(JSON.stringify(snapshotData)));` … `await this.persistNow();` `Render.all();`
  - `Secrets.loadKey()` is called **only** inside `State.load()` (cold start @ **L6637**, warm load @ **L6664**) — grep confirms no other caller. The restore path bypasses both.
  - Node output: `runtime copilotKey before: "sk-or-LIVEKEY-123"` → after restore `null` → `AI key lost from memory?: true`.
- plain: After a user restores any auto-snapshot, the Copilot API key is gone from memory, so every AI call fails until a full page reload re-runs `State.load`. The user sees AI "break" right after a restore with no explanation.
- fix: In `State.commitRestore`, after assigning `this.data`, re-hydrate: `const k=await Secrets.loadKey(); if(k&&this.data?.meta?.settings)this.data.meta.settings.copilotKey=k;` (mirror of L6664-6667).
- dup-check: NOT in REPORT. The known secret findings are C05-6 (key in AutoSave *file backup*) and the secret-leak/scrub cluster (about persistence scrubbing). None concern the restore path nulling the *runtime* key. Distinct site (L7074), distinct effect (AI breaks post-restore).

### GAP-2: `commitRestore` does not bump `_idbGeneration` — an in-flight pre-restore write can clobber the localStorage mirror   [zone: state]
- severity: MEDIUM / confidence: MED / tag: BUG
- proof:
  - The A3 race fix is scoped to `resetAll` only — `resetAll` @ **L7087-7088**: `this.persist.cancel?.();` then `this._idbGeneration=(this._idbGeneration||0)+1;`
  - `commitRestore` @ **L7075** calls `this.persist.cancel?.()` but **never** bumps `_idbGeneration`.
  - A debounced `persist()` that already left the debounce window is an in-flight `IDB.set` whose `.then` @ **L6737-6741** re-checks `(State._idbGeneration||0)!==gen` and, finding it unchanged, writes the **pre-restore** JSON into the localStorage mirror (`localStorage.setItem(STORAGE_KEY,json)`). `commitRestore`'s `persistNow()` writes IDB but the two stores can now disagree; next cold load prefers IDB (correct) but a localStorage-fallback path (L6628) would read stale data.
- plain: `persist.cancel()` only stops writes still waiting in the debounce; one already mid-flight survives, and because the generation counter isn't bumped (unlike reset), it can overwrite the localStorage backup with pre-restore data, leaving the two stores inconsistent.
- fix: In `commitRestore`, replicate the reset guard — bump `this._idbGeneration=(this._idbGeneration||0)+1;` right after `this.persist.cancel?.()`.
- dup-check: NOT in REPORT. C05-1 is the debounce *lost-write-on-close* (no flush). The A3 generation-guard is documented for `resetAll`; no finding notes that `commitRestore` omits it. Distinct site and distinct failure (store inconsistency after restore vs lost edits on close).

### GAP-3 (NOTE, LOW): first auto-snapshot fires immediately, contradicting "after 24 hours" UI copy   [zone: state]
- severity: LOW / confidence: HIGH (Node-proven) / tag: UX
- proof: `snapshotIfDue` @ **L7013** `if(lastAt&&(new Date(now)-new Date(lastAt))<dayMs)return;` — with `lastSnapshotAt:null` (createDefaultState @ L6418) the guard is falsy, so a snapshot is written on the very first load. UI copy @ **L3966**: "one will be created after 24 hours of use." Node: `first-run snapshot due immediately?: true`.
- plain: Harmless but the empty-state hint lies; a snapshot exists from minute one.
- fix: Either seed `lastSnapshotAt=Utils.now()` in `createDefaultState`, or soften the copy. Not a data bug — listed only for honesty.
- dup-check: NOT in REPORT (no snapshot-timing finding). Minor; not load-bearing.

### GAP-4: Migration never backfills `meta.workflowState` → `setWorkflow`/`clearPending` throw TypeError on any pre-2.5.0 save   [zone: migrations]
- severity: HIGH / confidence: HIGH (Node-proven) / tag: BUG
- proof:
  - `createDefaultState` @ **L6418** is the ONLY place `workflowState` is created: `workflowState:{promptPending:null}`.
  - The entire `migrateIfNeeded` chain (**L6419-6553**) backfills `firstRunComplete`, `preferredMode`, `snapshots`, `lastSnapshotAt`, `campaignPrep` — but NEVER `meta.workflowState`. Grep confirms zero defensive `workflowState ||`/`??` re-init anywhere post-load.
  - Consumers assume it exists (no optional chaining): `setWorkflow` @ **L6997** `Object.assign(this.data.meta.workflowState,ws)`; `clearPending` @ **L6998** `this.data.meta.workflowState.promptPending=null`.
  - Reachable: the "Fill & Copy" arsenal button calls `State.setWorkflow({promptPending:{...}})` @ **L8194**; `State.clearPending()` @ **L8695**.
  - Node output (running the real migration on a `schemaVersion:'1.2.0'` save):
    ```
    final schemaVersion: 2.5.0
    meta.workflowState present?: false => undefined
    setWorkflow THROWS: TypeError - Cannot convert undefined or null to object
    clearPending THROWS: TypeError - Cannot set properties of undefined (setting 'promptPending')
    meta keys MISSING after full migration vs createDefaultState: [ 'createdAt', 'lastUpdatedAt', 'workflowState' ]
    ```
- plain: A returning user whose save predates v2.5.0 gets a fully-migrated save that is still missing `meta.workflowState`. The moment they click "Fill & Copy" to send a prompt to ChatGPT/Claude (the core human-in-the-loop AI workflow), the handler throws and the paste-back tracking silently dies. `createdAt`/`lastUpdatedAt` are also missing but benign (re-set on next write via `_touchMeta` assignment).
- fix: Add a gate (or fold into the 2.4.2→2.5.0 step): `d.meta.workflowState=d.meta.workflowState||{promptPending:null};` — also backfill `createdAt`/`lastUpdatedAt` for cleanliness.
- dup-check: NOT in REPORT. C05-2 is about *unknown/future* `schemaVersion` skipping migration entirely (the version is too HIGH). This is the opposite: migration runs to completion and SUCCEEDS, yet leaves a structural hole an unguarded consumer dereferences. Distinct mechanism, distinct trigger (old save + Fill&Copy), distinct sites (L6997/6998/8194).

### GAP-5 (NOTE, LOW): `handleImport` multi-nation path defaults `schemaVersion` to `'1.0'`, which matches NO migration gate   [zone: migrations]
- severity: LOW / confidence: HIGH (Node-proven) / tag: BUG (benign)
- proof: `handleImport` @ **L8872** `migrateIfNeeded({nations:data.nations,schemaVersion:data.schemaVersion||'1.0'})`. The first gate is `'1.2.0'` (L6422); `'1.0'` is truthy so `if(!d.schemaVersion)` is skipped, and `'1.0'` equals no `if(d.schemaVersion===…)` gate → migration is a complete no-op. Node confirms a `'1.0'` payload passes through with zero field-backfill.
- plain: Harmless in practice ONLY because `buildNationFromSeed` (L6333, run per-nation right after on the import path) independently re-normalizes every nation-level field (`sessions||[]`, `hooks||[]`, etc.). If anyone ever relies on the migration alone for a `'1.0'` blob without `buildNationFromSeed`, fields would be missing. The single-nation path (L8865) is also inconsistent: it only migrates `if(data.schemaVersion)` truthy.
- fix: Default to `'1.2.0'` (the real floor) instead of `'1.0'`, so the chain actually engages: `data.schemaVersion||'1.2.0'`.
- dup-check: NOT in REPORT. Distinct from C05-2 (future versions). Listed for honesty; not load-bearing because `buildNationFromSeed` masks it on the only two call sites.

### GAP-6: License in-memory state is not atomic with its IDB write — a failed persist leaves `isActive()` lying for the whole session   [zone: license]
- severity: MEDIUM / confidence: MED (logic-clear; trigger = IDB write failure, uncommon) / tag: BUG
- proof:
  - Activate sets `_data` valid BEFORE persisting, and the persist is the only awaited line that can throw inside the try: `_activateLS` @ **L6124-6125**:
    `this._data={key,…,valid:true};` then `await IDB.set(IDB_KEY_LICENSE,this._data);` — the `catch` @ **L6128** returns `{success:false,error:'Network error…'}` but never rolls back `this._data`. Same shape in `_activateItchio` @ **L6138-6139/6142**.
  - Deactivate clears in-memory first, then persists with NO try/catch: `deactivate` @ **L6173-6174** `this._data=null;` then `await IDB.set(IDB_KEY_LICENSE,null);`. If that set rejects, the exception escapes `deactivate()` → the caller `await LicenseGate.deactivate()` @ **L17317** throws, so `showToast('License deactivated')` + `_updateModalStatus()` @ L17318-19 never run, yet `_data` is already null.
  - `isActive()` @ **L6092** keys purely off in-memory `_data.valid`; consumers trust it, notably AutoSave @ **L6261** `if(!LicenseGate.isActive())return; // only auto-save for licensed users`.
- plain: If the IndexedDB write fails (quota, transaction abort) during activate, the user is shown "Network error" but the app behaves as fully licensed (AutoSave on) until reload — then `init()` reads an empty license slot and AutoSave silently stops. Deactivate has the mirror flaw: in-memory clears but IDB may still hold a valid license, so a reload resurrects the "licensed" state, and the user gets no confirmation toast. Either way the displayed state and the real state disagree.
- fix: Make the persist authoritative: set `_data`/null only AFTER the `IDB.set` resolves, and wrap deactivate's `IDB.set(IDB_KEY_LICENSE,null)` in try/catch so the UI still updates.
- dup-check: NOT in REPORT. C04-1 is `_backgroundValidate` downgrading a valid license on a transient *server* response; C04-2/04-3/13-2 are device-cap/`_hdr`/invisible-toast. None concern the activate/deactivate ↔ IDB write atomicity. Distinct sites (L6124/6173), distinct mechanism (local persist failure, not network verdict).

### GAP-7 (SPECULATIVE): `_backgroundValidate` can write a stale verdict onto a freshly re-activated license   [zone: license]
- severity: MEDIUM / confidence: LOW / tag: BUG (race) / NEEDS-LIVE-VERIFY
- proof: `_backgroundValidate` @ **L6144-6154** re-reads `this._data` AFTER its `await fetch`/`await res.json()` and writes `this._data.valid=!!json.valid; await IDB.set(...)`. It captures no local snapshot/generation of `_data`. `init()` fires it un-awaited @ **L6089**. If the user deactivates-then-reactivates (or activates a different key) while one validate is in flight, the late validate stamps the OLD server's verdict onto the NEW `_data` and persists it. There is no generation guard here (unlike `State._idbGeneration` for persist).
- plain: A narrow timing window where a background license check that started before a re-activation lands after it, overwriting the new license's validity with the old result. Could flip a just-activated license to invalid (or vice-versa) until next reload.
- fix: Snapshot `const d=this._data;` at entry and bail after the await if `this._data!==d` (identity guard), mirroring the persist generation pattern.
- dup-check: NOT in REPORT — distinct from C04-1 (that's about *which* responses downgrade; this is about *which `_data` object* gets the write under concurrency). SPECULATIVE: confirming requires a live browser to drive overlapping activate/validate fetches.

### GAP-8: A single name-less stored faction makes EVERY future canon paste crash and leave a half-applied, unpersisted state   [zone: parser]
- severity: HIGH / confidence: HIGH (Node-proven) / tag: BUG
- proof:
  - `applyCandidates` dedups factions by lower-casing the EXISTING faction's name with no guard — @ **L8371**: `const dupe=n.factions.find(f=>f.name.toLowerCase()===c.name.toLowerCase());`
  - `buildNationFromSeed` (import normalizer) does NOT guarantee `name` on factions — @ **L6350**: `factions:(seed.factions||[]).map(f=>({...f,id:f.id||Utils.uuid()}))` (id is filled, name is not). `handleImport` (L8865/8872) feeds imported JSON straight through. So an imported faction `{id:'x'}` with no `name` persists into `n.factions`.
  - The `forEach` runs inside `try{…}finally{State._suppressUndo=false;}` @ **L8355-8377** with NO `catch`. A throw therefore: leaves candidates processed before it already pushed into `n.chronicle`/`n.factions`/etc., skips `State._touch(nid);State.persist();` @ **L8378** (so the partial mutation isn't saved), and propagates out of `applyCandidates` — after `State.pushUndo()` @ L8350 already snapshotted.
  - Node output:
    ```
    faction-dedup THROWS: TypeError - Cannot read properties of undefined (reading 'toLowerCase')
    ```
- plain: If the realm has even one faction without a `name` (easy to get by importing a hand-made or older export), the next time the user pastes an AI CANON block containing a `faction:` line the apply throws partway through: some entities land in memory, nothing is saved, and the undo stack has a stray snapshot. The paste appears to "do nothing" or corrupts the in-memory realm until reload.
- fix: Guard the dedup: `f.name&&f.name.toLowerCase()===…` (and normalize `name` to `''` in `buildNationFromSeed`). Also wrap the apply loop with a `catch` so one bad row doesn't abort the batch.
- dup-check: NOT in REPORT. The known canon findings are decimal-delta drop (C08b-1), faction type/position + visibility drop (C01-1/C08b-2), and chronicle re-paste doubling (C08b-3). None is a crash from name-less existing data. Distinct site (L8371) and distinct effect (crash + half-apply).

### GAP-9: `matchStatKey` throws if any stat lacks `displayName` — aborts the whole canon stat-apply   [zone: parser]
- severity: MEDIUM / confidence: MED (proven crash; reachability depends on a malformed custom stat) / tag: BUG
- proof:
  - `matchStatKey` dereferences `displayName` without a guard at three tiers — e.g. @ **L8335** `if(n.stats[k].displayName.toLowerCase()===want)return k;` and again L8337, L8342.
  - `buildNationFromSeed` sets `displayName||key` for imported custom stats (L6405), so the common path is safe — but a hand-edited import / AI-authored custom stat object lacking `displayName` survives. Node output:
    ```
    matchStatKey THROWS: TypeError - Cannot read properties of undefined (reading 'toLowerCase')
    ```
  - Called from `applyCandidates` @ **L8358** inside the same catch-less try → same half-apply fallout as GAP-8.
- plain: One custom stat missing its display name turns every `stat:` line in a pasted CANON block into a crash, silently failing the paste.
- fix: `const dn=n.stats[k].displayName||k;` before comparing (apply at all three tiers).
- dup-check: NOT in REPORT — distinct symbol/site from the decimal-delta finding; this is a null-deref crash, not a value-precision drop.

### GAP-10 (NOTE, MEDIUM): canon parser cannot match any stat whose name is ≤2 chars (AP/HP/XP), silently dropping the delta   [zone: parser]
- severity: MEDIUM / confidence: HIGH (Node-proven) / tag: BUG
- proof: `matchStatKey` @ **L8329** `if(want.length<3)return null; // too short to fuzzy-match safely`. A custom stat literally named "AP"/"HP"/"XP" is therefore unreachable by canon. Node: `matchStatKey(n,'ap') => null`. In `applyCandidates` the candidate then falls to `unmatched` @ **L8365** and the user sees "Couldn't match stat: AP".
- plain: Short-named custom stats can't be updated by AI canon — the delta is dropped with a generic "couldn't match" toast. Likely rare but it is a real silent data-application gap for a worldbuilder who names a stat "XP".
- fix: Allow exact key/displayName matches regardless of length; only apply the `<3` floor to the fuzzy substring tier (Tier 4).
- dup-check: NOT in REPORT (no short-name finding). Medium because it silently drops a requested change; not load-bearing for most users.

### GAP-11 (NOTE, LOW/PERF): in the modern shell, every `stat`/`chronicle` dispatch double-renders — legacy `Render.*` AND `WorldShell.*` both run   [zone: render]
- severity: LOW / confidence: HIGH / tag: PERF
- proof: On a non-`nation` dispatch, `dispatchRender` runs the legacy renderers @ **L15703** (`Render.nationCard();Render.pressurePoints();Render.recentPulse();Render.arsenal();Render.chronicleBand();`) AND then @ **L15711** calls `WorldShell.render(_nat)`, which itself runs `_renderArsenal`/`_renderChronicle`/`_renderFactions`/`_renderChars`/`_renderSliders` (L14005-14011). When the shell layout is active (the default — `rw_legacy_layout!=='1'`), the legacy renderers paint DOM the shell has superseded.
- plain: Each stat tweak repaints both the (hidden) legacy widgets and the visible shell widgets. Correctness is fine; it's wasted work on the hot path (slider commits, canon apply). Not a bug, listed because the prompt asked about double-render.
- fix: When the shell is active, skip the legacy `Render.nationCard/arsenal/chronicleBand` calls in `dispatchRender` (let `WorldShell.render` own those surfaces).
- dup-check: NOT a specific REPORT ID; the REPORT notes "redundant re-render" only generically. Low value; not load-bearing.

### Render zone — no NEW defects of consequence
Swept the full dispatch graph:
- Enumerated **every** dispatched `fields` value (grep L6702–12540): `nation, stat, chronicle, character, customStat, session, hook, secret, front, campaign, location, relation, bestiary, faction`.
- Mapped each to its handler(s): `dispatchRender` branches (L15693-15707) handle nation/stat/chronicle/customStat/character; `Render.refreshOpenPanels` (L7703-7716) handles session/hook/secret/location/bestiary/relation/faction-via-web **only while that SHS panel is open**; dedicated subscribers handle chronicle (L5728), front (L14658), bestiary (L14923), relation (L15010), and world-relevant live-mode triggers (L12173); `campaign` is routed through a separate `cp:changed` channel (L11969/12166) — confirmed not orphaned.
- Confirmed **no truly orphaned field**: `WorldShell.render` (L14005-14011) repaints sliders/pressures/factions/chars/threads/arsenal/chronicle on every non-nation dispatch in the modern layout, so `faction` is live there (the known C12-4 fall-through is the legacy path). `session` has no dashboard surface at all, so a closed-panel `session` write correctly repaints nothing visible (not a bug).
- Checked the slider hot path for render-during-mutation: `attachSlider` commits via `setStat` (the `sc:changed` source) only on **`change`** (drag-end, L8152-8166), not on `input` (L8151) — so `WorldShell._renderSliders`' `innerHTML` rebuild (L14052) never fires mid-drag. No destroy-while-dragging bug.
- Undo/redo dispatch `['nation',…]` (L6702/6718) → `Render.all()` full repaint, reading fresh `this.data` — no stale read.

---

## Sweep summary

- **state**: 3 new findings (GAP-1 HIGH key-loss-on-restore [Node-proven], GAP-2 MED restore/idbGeneration race, GAP-3 LOW snapshot-timing copy). *(carried from prior agent + verified sound against source.)*
- **migrations**: 2 new findings (GAP-4 HIGH `workflowState` not backfilled → TypeError on pre-2.5.0 saves [Node-proven], GAP-5 LOW import `'1.0'` default matches no gate).
- **license**: 2 new findings (GAP-6 MED in-memory↔IDB non-atomic activate/deactivate, GAP-7 SPECULATIVE stale-validate race).
- **parser**: 3 new findings (GAP-8 HIGH name-less faction crashes every paste + half-apply [Node-proven], GAP-9 MED `displayName` null-deref crash [Node-proven], GAP-10 MED ≤2-char stat names unmatchable [Node-proven]).
- **render**: clean — no NEW defects of consequence (1 LOW PERF note GAP-11). Swept: full field→handler map, orphan check, slider hot path, undo repaint.

**New CRITICAL/HIGH count: 3 HIGH, 0 CRITICAL** (GAP-1, GAP-4, GAP-8).

**Single most important NEW bug:** **GAP-8** — one stored faction with no `name` (trivially reachable via import, since `buildNationFromSeed` fills `id` but not `name`) makes the faction-dedup at L8371 throw `TypeError` on *every* subsequent canon paste containing a `faction:` line, aborting the apply mid-loop inside a catch-less try (L8355) so the realm is left half-mutated and unpersisted. It silently breaks the product's headline AI feature for affected saves. Node-proven.

---

## Main-agent review (2026-06-05) — verified against source; corrections

- **GAP-4 CONFIRMED HIGH** (grep-verified): exactly 6 `workflowState` sites — `createDefaultState`
  + the two write paths (`setWorkflow`/`clearPending`, **unguarded**) + three read sites (all
  `?.`-guarded). No migration backfills it. The dev guarded the reads but forgot the writes/backfill.
  Scoped to pre-`workflowState` upgraders, but real. One-line migration fix.
- **GAP-8 RE-GRADED HIGH → MEDIUM.** Reachability was overstated: the SEED_NATIONS factions ALL
  have names ('The Algorithm Council', 'The Crown Loyalists', 'The Shadowclaw Clan', 'The Veiled
  Court'), so a new user does NOT get a name-less faction — the "breaks the first paste for everyone"
  claim is FALSE. Reachable only via a malformed/partial **import**. The genuinely valuable defect is
  the catch-less apply loop (L8355), not the dedup line.
- **GAP-8 + GAP-9 are ONE root cause:** the canon-apply loop has no `catch` and several unguarded
  field derefs (`f.name`, `stat.displayName`). Treat as a single robustness finding —
  "malformed/imported data crashes canon-apply mid-batch, skipping `persist()`" — two trigger points. MEDIUM.
- **GAP-1 (key-loss-on-restore): mechanism confirmed, but RECOVERABLE.** The key still lives in the
  Secrets store; a page reload re-hydrates it. So AI breaks *until reload*, not permanent loss.
  Effectively MEDIUM; one-line fix (re-hydrate in `commitRestore`).
- **Render zone "clean" ACCEPTED** — the field→handler enumeration is thorough; the no-orphan
  conclusion is sound.

**Corrected NEW tally: 0 CRITICAL · 1 clean HIGH (GAP-4) · GAP-1 HIGH-but-recoverable · GAP-8 → MEDIUM.**
The gap-hunt found real issues but NO hidden catastrophe — the original audit did cover the worst
zones. That is the honest answer to "is anything still hiding."

