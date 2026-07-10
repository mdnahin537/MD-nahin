# C05 — IDB / Secrets / State (core persistence)

Range audited: **6557–7510** (IDB 6557, STORAGE/LEGACY/SECRET keys 6584–6589, Secrets 6590, `_stateForPersist` 6604, State 6615–7505). Supporting reads (grepped, outside range): `migrateIfNeeded`/`createDefaultState`/`emptyCampaignPrep`/`migrateCampaignPrep`/`buildNationFromSeed`/`handleCorruptStorage` 4685–6555; `Utils.debounce` 5849; `DEFAULT_SETTINGS` 4736; AutoSave 6250–6332; bootstrap 17335; beforeunload 17520.

**Behavioral proof:** extracted `migrateIfNeeded`+`createDefaultState`+deps verbatim into `/tmp/c05_migrate_test.js` and ran under Node. Output is quoted inline below where relevant.

---

### C05-1: No save-on-unload flush — debounced write (400 ms) is silently lost on tab close
- tag: BUG | severity: CRITICAL | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L6727–6748 (`persist:Utils.debounce(...,400)`), L5849 (`debounce` has `.cancel()` but **no `.flush()`**), L17520–17530 (the only `beforeunload` handler)
- evidence:
  `persist:Utils.debounce(function(){ ... IDB.set(STORAGE_KEY,json) ... },400),`
  beforeunload handler in full:
  `window.addEventListener('beforeunload',function(e){ if(typeof SampleMode!=='undefined')SampleMode.exitOnCloseGuard(); const input=document.getElementById('copilot-input'); ... if(hasUnsavedCopilot||hasUnsavedTonight){e.preventDefault();return(e.returnValue=...);} });`
- observed/why: Every domain write (`setStat`, `addEvent`, `addCharacter`, all `cp*`, etc.) calls the **debounced** `this.persist()`. The write to IDB only fires 400 ms after the *last* mutation. There is **no `beforeunload`/`pagehide`/`visibilitychange→hidden` flush** of pending state. The lone `beforeunload` handler only warns about un-*submitted* Copilot/Tonight textarea text — it never calls `persistNow()` and never `persist.cancel()/flush`. So: user edits a stat or adds a chronicle event, closes the tab (or it crashes/navigates) within 400 ms → that write never reaches IDB or the localStorage mirror. For a "your data is sacred" product this is the single most dangerous gap: routine quick edits before closing are dropped with zero warning. (`visibilitychange` at L16657 is bound only to the Ambient canvas start/stop, not persistence.)
- fix: add `window.addEventListener('pagehide',()=>{State.persist.cancel?.();State.persistNow();});` and the same on `visibilitychange` when `document.hidden`. `persistNow()` is synchronous-enough (awaits IDB) and also writes the localStorage mirror, which *does* land during unload.

---

### C05-2: Unknown / future / hand-edited `schemaVersion` passes through migration untouched → undefined-field crashes
- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L6419–6553 (`migrateIfNeeded` is a chain of exact-string `if(d.schemaVersion==='x')` steps; no final catch-all), readers e.g. L7933/L8003/L10108/L15807/L16275 read `State.data.meta.settings.<x>` unguarded
- evidence (Node run, TEST 3 — input `schemaVersion:'3.0.0'`):
  `schemaVersion unchanged: 3.0.0`
  `campaignPrep present? false`
  `nation.copilotQueue present? undefined`
  `nation.metadata present? undefined`
  TEST 4 (orphan `'2.4.3'`): `campaignPrep added? false`
- observed/why: The migration only matches exact known version strings. Any save whose version is newer than `2.5.0` (a user who used a later build then opened an older copy of the file), or an orphan like `2.4.3`, or a corrupted/hand-edited version string, is returned **as-is** with none of the structural backfills applied. `campaignPrep` is lazily self-healed by `cp()` (L7312 `migrateCampaignPrep(...||emptyCampaignPrep())`), so that path survives — but `meta.settings.*` and per-nation `metadata`/`copilotQueue`/`copilotContextDepth` are read **unguarded** in dozens of places. A future-version blob with a thinner `settings` object will throw on first render (`Cannot read properties of undefined`). There is no version-too-new guard and no down-migration.
- fix: after the chain, if `d.schemaVersion` is not in the known set, either (a) run a normalizer that guarantees `meta.settings={...DEFAULT_SETTINGS,...}` and per-nation defaults regardless of version, or (b) detect "version newer than SCHEMA_VERSION" and route to a safe read-only/export prompt instead of booting into an unmigrated shape.

---

### C05-3: localStorage mirror writes the ENTIRE state on every save — silent quota wall, no size guard
- tag: PERF | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: yes (exact MB ceiling is browser-specific)
- where: L6740 / L6745 / L6754 / L6675 — `localStorage.setItem(STORAGE_KEY,json)` where `json=JSON.stringify(_stateForPersist())` (full state)
- evidence:
  `IDB.set(STORAGE_KEY,json).then(()=>{ ... try{localStorage.setItem(STORAGE_KEY,json);}catch(e){/* quota exceeded — IDB still has it */} ... })`
- observed/why: On every debounced save the full serialized state is written to **both** IDB and localStorage (~doubling the synchronous main-thread cost of each save; the localStorage write is fully synchronous and grows with world size). localStorage caps at ~5 MB in most browsers. A large multi-realm world with long chronicles/NPC lists can exceed that. The `catch` correctly swallows the quota error ("IDB still has it"), so **no data loss** — but the mirror silently stops updating, defeating its "belt-and-braces backup" purpose exactly when the world is biggest, and the user is never told the secondary backup is now stale. Also a steady layout/main-thread cost on every keystroke-adjacent save for big worlds.
- fix: gate the mirror by size (e.g. skip if `json.length>4_000_000`) and/or only mirror a slimmed copy (meta + nation index, not full chronicles). At minimum, surface a one-time toast when the mirror first fails so the user knows only IDB holds their data.

---

### C05-4: Auto-snapshot uses wall-clock `lastSnapshotAt` gate — clock skew / system-time change can suppress or spam backups; also unbounded transient growth between trims
- tag: BUG | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: no
- where: L7008–7028 (`snapshotIfDue`), L7013 `if(lastAt&&(new Date(now)-new Date(lastAt))<dayMs)return;`, trim at L7021 `while(this.data.meta.snapshots.length>7)`
- evidence:
  `const lastAt=this.data.meta.lastSnapshotAt; const dayMs=24*60*60*1000; if(lastAt&&(new Date(now)-new Date(lastAt))<dayMs)return;`
- observed/why: Snapshot cadence is computed from `Utils.now()` (an ISO wall-clock string), not a monotonic clock. If the user's system clock is set forward then back (timezone travel, NTP correction, manual change), `new Date(now)-new Date(lastAt)` can go negative or huge — suppressing the daily snapshot indefinitely, or firing it every load. The trim to 7 (L7021–7024) is sound and removes the old IDB blobs, so **storage is bounded** (not unbounded — answering the brief's snapshot-growth question: snapshots are capped at 7 and live in IDB, not in the mirrored state, so memory is fine). The cadence correctness is the only real defect here. Snapshot list metadata in `meta.snapshots[]` is also bounded to 7.
- fix: cadence is low-stakes; acceptable to leave. If hardened: store a numeric `Date.now()` epoch alongside and clamp the delta to `>=0`, or just snapshot when `lastAt` is missing OR delta `>=dayMs OR delta<0`.

---

### C05-5: Corrupt-storage recovery falls back to a brand-new default world — the user's realm vanishes from the UI (recovery is manual-only)
- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L6678 (`catch(e){handleCorruptStorage(...)}`) → L6555 `handleCorruptStorage`
- evidence:
  `function handleCorruptStorage(raw){const k=\`realmwright_corrupt_${Date.now()}\`;try{localStorage.setItem(k,raw);}catch(e){}State.data=createDefaultState(); setTimeout(()=>showToast('Could not read saved data. Emergency backup preserved as: '+k+'...Starting fresh.',[{label:'Export now',handler:()=>exportJSON()}],10000),500);}`
- observed/why: If `JSON.parse` of the stored blob throws (truncated write, encoding glitch), the app **replaces State.data with a fresh default world** and the user sees an empty/seed realm — terrifying for a paid GM tool mid-campaign. The raw bytes are stashed under `realmwright_corrupt_<ts>` *in localStorage* (which itself can fail silently — `catch(e){}`), and `exportJSON()` at that moment exports the **fresh default**, not the corrupt original. There is **no attempt to recover from the most recent auto-snapshot** (which lives intact in IDB under `rw_snapshot_*`), and no attempt at lenient/partial JSON repair. So a single bad byte = the user is staring at a blank world with only a 10-second toast and a console-less path back. The corrupt-blob escape hatch also lands in the size-limited localStorage, the worst place to stash a possibly-huge blob.
- fix: in `handleCorruptStorage`, before defaulting, attempt restore from the newest `rw_snapshot_*` in IDB; stash the corrupt raw in **IDB** (`realmwright_corrupt_<ts>`), not localStorage; and make the "Export now" action export the *corrupt raw bytes*, not the just-created default state, so the user can recover offline.

---

### C05-6: `_stateForPersist` scrubs the API key everywhere EXCEPT the user-facing file backup (AutoSave) and full-state snapshots-of-record — design intent is partially defeated
- tag: SECURITY | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L6604–6613 (`_stateForPersist` nulls `copilotKey`), used by L6731/6752/6674 — BUT AutoSave `_write`/`_fallbackDownload` at L16302-area write `JSON.stringify(State.data,...)` (full, un-scrubbed); snapshot path L7015–7016 *does* scrub (`if(clone.meta?.settings?.copilotKey)clone.meta.settings.copilotKey=null`)
- evidence (from C04's AutoSave, but it directly defeats this chunk's secret design):
  `await writable.write(JSON.stringify(State.data,null,2));` and `new Blob([JSON.stringify(State.data,null,2)]...)`
- observed/why: The whole P1.13 design (comment L6586–6589) exists so the OpenRouter key "never sits inside the State JSON" exposed to XSS via localStorage. `_stateForPersist` correctly nulls it for IDB STORAGE_KEY + the localStorage mirror, and `snapshotIfDue` nulls it in snapshots. **But the AutoSave file-backup and fallback-download serialize raw `State.data`**, which still holds the in-memory `copilotKey`. So the user's plaintext API key is written into the `.json` backup file on disk / in their Downloads folder. That's a real key-exposure path the rest of the module works hard to prevent. (Belongs to C04's range — flagged here because it nullifies this chunk's Secrets guarantee.)
- fix: have AutoSave serialize `_stateForPersist()` (or a key-scrubbed clone) instead of raw `State.data`, identical to the snapshot path.

---

### C05-7: Migration is lossless for user data (verified) — but the `c.faction` string→`factionId` conversion is the one deliberate field deletion; if the named faction is missing, the link is silently dropped
- tag: QUALITY | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L6459–6465 (v2.1.0→2.2.0) and the mirror in `buildNationFromSeed` L6379–6385
- evidence (Node run, TEST 1, input character had `faction:'House Vex'` with a matching faction id `f1`):
  `character.faction (string) -> {"factionId":"f1"}`  ← resolved correctly and `faction` removed
  TEST 1 also proved survival of: `custom_morale` custom stat, `myCustomNationField`, `leaders[]`, `glossary`, `notes`, `settings.myUnknownPref`. TEST 2: second migrate pass is byte-identical (`deepEqual after second run: true`).
- observed/why: **Good news, answering the brief directly: `migrateIfNeeded` does NOT drop arbitrary user fields** — every step uses `||`/`??`/`===undefined` guards and mutates in place, so unknown nation keys, custom stats, custom settings all survive, and the migration is idempotent. The single intentional deletion is `delete c.faction` after resolving it to `factionId`. If a character references a faction **name that no longer exists** (faction was renamed/deleted before upgrade), `fac` is `undefined`, no `factionId` is set, and `delete c.faction` still runs → the character's faction association is **silently lost** with no record of the old name. Edge case, low blast radius, but it is a real (small) data-loss path during migration.
- fix: when `fac` is not found, preserve the original string (e.g. keep `c.faction` or stash `c._legacyFactionName=c.faction`) instead of unconditionally deleting, so the association is recoverable.

---

### C05-8: `persistNow()` swallows IDB **and** localStorage failures silently — a hard storage failure during a critical save (onboarding, restore, reset) leaves no signal
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L6749–6755
- evidence:
  `async persistNow(){ if(this.data.meta?._sampleMode)return; const json=JSON.stringify(_stateForPersist()); try{await IDB.set(STORAGE_KEY,json);}catch(e){} try{localStorage.setItem(STORAGE_KEY,json);}catch(e){} }`
- observed/why: Unlike the debounced `persist()` (which on failure shows `UI.setSave('error')` + an "Export now" toast, L6746), `persistNow()` catches both sinks and does **nothing** on failure. `persistNow` is used on the most important saves: `setOnboardingComplete` (L6999), `commitRestore` after a snapshot restore (L7078), cold-start (L6639), and the secrets-migration write (L6670). If IDB is unavailable (Safari Private Mode historically throws on open/transaction; storage disabled; quota) **and** localStorage also throws, the restore/onboarding *appears* to succeed in-memory but nothing persists, and the user gets zero warning — on next load their restore/onboarding is gone. This is the IDB-unavailable degradation path the brief asks about: `IDB.open()` resolves `null` gracefully (L6563/6567) and `get` returns null, so the app *loads* fine with no DB — but it then runs entirely in-memory with silent no-op saves and no user-facing "you have no persistent storage" warning.
- fix: have `persistNow` surface a failure when *both* sinks throw (same toast as `persist`'s catch), and detect the `IDB.open()===null` case at boot to warn the user once that their work won't be saved (private mode / storage disabled).

---

### C05-9: Undo/redo stack stores full `JSON.stringify(this.data)` snapshots — 25-deep copies of the entire multi-realm world in memory
- tag: PERF | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L6617–6619 (`_undoMax:25`), L6683 (`this._undoStack.push(JSON.stringify(this.data))`), also L6696/6712
- evidence:
  `pushUndo(){ ... this._undoStack.push(JSON.stringify(this.data)); if(this._undoStack.length>this._undoMax)this._undoStack.shift(); ...}`
- observed/why: Every mutating op (`pushUndo` is called by nearly all State writers) serializes the **entire** `State.data` — all nations, all chronicles, all NPCs/sessions/secrets — and keeps up to 25 such full copies. For a large multi-realm world this is a sizeable, repeated main-thread `JSON.stringify` on every edit plus tens of MB of retained strings. The cap bounds it, but it's O(full-state) per keystroke-class action. Not corruption, just avoidable cost/memory on big worlds.
- fix: acceptable for typical sizes; if it bites, switch to per-entity / structural-diff undo, or skip undo snapshots for high-frequency text autosave paths (some `cp*` text paths already skip undo — extend that pattern).

---

## Summary

Counts by severity:
- CRITICAL: 1 (C05-1 lost-write on tab close)
- HIGH: 2 (C05-2 unknown-version crash, C05-5 corrupt→blank-world)
- MEDIUM: 4 (C05-3 mirror quota, C05-6 key in file backup, C05-8 silent persistNow failure, C05-4 snapshot clock-skew)
- LOW: 2 (C05-7 faction-name drop edge case, C05-9 full-state undo cost)
- POLISH: 0

Verified-good (called out so nobody re-flags): migration is **lossless and idempotent** for user/custom fields (Node-proven, TEST 1+2); snapshots are **bounded to 7** in IDB (no unbounded growth/memory); `IDB.open()` degrades to `null` without crashing; the A3 `_idbGeneration` race guard and the `_stateForPersist` key-scrub for IDB/localStorage are correct.

**Top 3:**
1. **C05-1 (CRITICAL):** 400 ms debounced `persist()` with **no flush on `beforeunload`/`pagehide`** — quick edits before closing the tab are silently dropped. The single worst data-loss path.
2. **C05-5 (HIGH):** corrupt blob → `createDefaultState()` shows a **blank/seed world**; no auto-recovery from the intact IDB snapshots, and the "Export now" exports the fresh default, not the corrupt original.
3. **C05-2 (HIGH):** any unknown/future/hand-edited `schemaVersion` skips every migration branch (Node-proven) and boots into an unmigrated shape; unguarded `meta.settings.*` reads then throw.
