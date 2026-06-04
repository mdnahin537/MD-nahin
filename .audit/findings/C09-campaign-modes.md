# C09 — Campaign / Session Modes Audit Findings
Chunk: lines 11126–12722 | Modules: SAMPLE_REALM_*, SampleMode, FrontDoor, Campaign, LiveMode, Tonight

---

### C09-01: `firstRunComplete` never set to `true` — FrontDoor opens on every app launch
- tag: WIRING | severity: CRITICAL | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L17498–L17515 (bootstrap), L11289–L11300 (FrontDoor.close), L11330–L11359 (_handleGenerate)
- evidence:
  ```js
  // bootstrap:
  if(!State.data.meta.firstRunComplete){
    if(typeof FrontDoor!=='undefined')FrontDoor.open();
  ```
  No assignment `firstRunComplete = true` exists anywhere in the 17864-line file.
  `createDefaultState()` at L6418 sets it to `false`. `migrateIfNeeded` at L6452 only fills it with `false` if missing. Neither `FrontDoor.close()` nor `_handleGenerate()` nor any other path sets it `true`.
- observed/why: Every user — including returning licensed users with full save data — sees FrontDoor.open() on every app launch. The "welcome back" toast and session-restore branch at L17502–L17515 is dead code for all users. A licensed user who spent weeks building their world gets the front-door demo pitch on every reload.
- fix: Add `State.data.meta.firstRunComplete=true; State.persist();` inside `FrontDoor._handleGenerate()` (after `this.close()`) AND inside `FrontDoor._handleSample()` AND inside `FrontDoor._handleActivate()`. Also add it to `FrontDoor.close()` as a fallback (e.g. when user presses Escape).

---

### C09-02: Tonight orphan nation — `_cleanupPreviousTonightNation` never called on close/unload
- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L12417–L12420 (Tonight.close), L17520–L17530 (beforeunload), L12491 (_cleanupPreviousTonightNation call)
- evidence:
  ```js
  // Tonight.close():
  close(){
    const el=document.getElementById('tonight-mode');
    if(el)el.classList.remove('is-open');
  }
  // _cleanupPreviousTonightNation() is only called from generate() at L12491.
  // beforeunload at L17520: calls SampleMode.exitOnCloseGuard() but NOT Tonight cleanup.
  // State.addNation() at L6863 calls this.persist() — nation written to IDB immediately.
  ```
- observed/why: User flow: opens Tonight → generates (creates `_tonightGenerated` nation, persisted to IDB) → clicks "← Dashboard" or closes browser tab. The `_tonightGenerated` nation persists in IDB indefinitely. On next load it appears in the world list as an unnamed orphan. It is only cleaned up on the NEXT call to `Tonight.generate()`. A user who generates once and never generates again accumulates orphan nations.
- fix: In `Tonight.close()`, add: `this._cleanupPreviousTonightNation()`. Also add the same call to the `beforeunload` handler (after the SampleMode guard). Guard with `if(this._generatedNationId && !keepFlag)` so "Keep this realm" is respected.

---

### C09-03: `_suggestBeatSeed` reads wrong field — smart empty state never appears
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L11775–L11777
- evidence:
  ```js
  _suggestBeatSeed(n){
    const hook=(n.hooks||n.plotSeeds||[]).find?.(h=>h&&h.status!=='resolved')
               ||(n.hooks||n.plotSeeds||[])[0];
    if(hook&&(hook.text||hook.name))return hook.text||hook.name;
    return null;
  }
  ```
  Hook schema (`addHook` at L7151–7153) uses field `title`, not `text` or `name`.
  All three sample realms also use `title` in their hooks arrays.
  Node verification: `hook.text` → undefined, `hook.name` → undefined → always returns null.
- observed/why: The "Seed Strong Start from a hook" smart empty button in the Beats section never appears. The plain empty message shows instead every time, even when the realm has open hooks. Tested with SAMPLE_REALM_HEIST hooks structure.
- fix: Change `hook.text||hook.name` to `hook.title||hook.text||hook.name` (title first, with graceful fallback for any legacy shape).

---

### C09-04: LiveMode `_maybeFire` is a stub — Live Mode toggle silently no-ops
- tag: WIRING | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L12199–L12220
- evidence:
  ```js
  _maybeFire(source){
    // ...rate cap checks...
    // Stub: real fire path lands in C6. For C1 skeleton just keep heuristics fresh.
    this._setState('idle');
    this._renderRail();
  },
  ```
  When `liveMode=true` AND API key is configured AND rate caps are not hit, the code reaches the stub comment at L12217 and returns. No AI call is made. The rail subtitle says "live + local" (`isLocalOnly()` returns false) but only local heuristics are shown.
- observed/why: Users who enable Live Mode with a configured API key see "live + local" in the Commentary rail but receive zero AI commentary. The toggle appears functional but silently does nothing AI-related. This is a shipped C1 skeleton without the C6 fire path.
- fix: Implement the actual fire path in `_maybeFire`: call the Copilot with the current board state and fill `_lastSlots` (the slot contract from the F3 spec). Until C6 lands, add a visible "Live AI commentary coming soon" note in the rail so the UX matches the reality.

---

### C09-05: `cpLiveAcked` / `cpSetLiveAcked` defined but never called
- tag: DEAD | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L7348–L7350
- evidence:
  ```js
  cpLiveAcked(){return !!this.data.meta.settings.liveModeAcked;},
  cpSetLiveAcked(){this.data.meta.settings.liveModeAcked=true;this._touchMeta();this.persist();},
  ```
  Grep finds zero callers of either method outside their definitions. `liveModeAcked` is in `DEFAULT_SETTINGS` at L4742.
- observed/why: An acknowledgement gate for Live Mode (likely intended to warn users about API costs before enabling) is built but never wired to any toggle or modal. The `liveModeAcked` flag stays `false` forever. If the intent was to gate Live Mode behind an "I understand this uses API credits" confirmation, it's silently bypassed.
- fix: Either wire `cpSetLiveAcked` to a confirmation modal shown before Live Mode is enabled for the first time, or remove the dead state if the feature is not planned.

---

### C09-06: `markSessionStart()` is a no-op — session baseline never resets
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L12224–L12226, L4699
- evidence:
  ```js
  // emptyCampaignPrep():
  sessionStartedAt:Date.now(),  // initialized on creation
  
  // markSessionStart():
  markSessionStart(){
    try{const cp=State.cp();if(!cp.sessionStartedAt){cp.sessionStartedAt=Date.now();State.persist();}}catch(e){}
  }
  ```
  `emptyCampaignPrep()` initializes `sessionStartedAt` to `Date.now()`. The guard `if(!cp.sessionStartedAt)` is always false for any existing campaignPrep (the value is truthy from day one). Node test: `!Date.now()` → `false`.
- observed/why: Every time `Campaign.open()` is called it calls `LiveMode.markSessionStart()`, which was intended to set the session-start baseline for the clock-idle heuristic. Because the guard prevents any reassignment, the baseline is permanently the time the campaignPrep was first created — not the current session open. Clocks last changed after initial creation will never be flagged as "idle since session start" unless they predate the campaignPrep creation itself.
- fix: Change the guard: `if(!cp.sessionStartedAt || cp.sessionStartedAt < Date.now() - 3600000)` (treat it as a new session if the last baseline is more than 1 hour old). Or reset it on every `Campaign.open()` unconditionally: `cp.sessionStartedAt=Date.now()`.

---

### C09-07: `SampleMode.bind()` bootstrap call is always a no-op
- tag: DEAD | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L17346 (bootstrap `SampleMode.bind()` call), L11213–L11224 (bind definition)
- evidence:
  ```js
  // SampleMode.bind():
  bind(){
    const picker=document.getElementById('modal-sample-picker');
    if(!picker)return;  // ← always returns here at bootstrap time
    ...
  ```
  The `modal-sample-picker` is lazy-created only inside `openPicker()`. At bootstrap time when `SampleMode.bind()` runs (L17346), the modal doesn't exist yet. The function early-exits. The real `bind()` call that matters is the one inside `openPicker()` at L11143 (only if modal is being created for the first time).
- observed/why: The `document.addEventListener('click',...)` for the `sample-mode-banner-exit` button (the only useful work `bind()` does outside the modal) is only attached when `openPicker()` is called. If `closeSample()` is triggered via banner without ever having called `openPicker()`, the banner exit listener was wired in `openPicker` → `bind()`. This flow is correct — but the bootstrap `SampleMode.bind()` call at L17346 provides no value.
- fix: Remove the `SampleMode.bind()` call from bootstrap (L17346) — it serves no purpose. Alternatively, split the banner-exit listener into a separate `bindBannerExit()` that runs at bootstrap.

---

### C09-08: Clock stat fallback in `_suggestClockSeed` silently fails
- tag: BUG | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L11769
- evidence:
  ```js
  const stat=(n.coreStats||n.stats||[]).find?.(s=>s&&typeof s.value==='number'&&s.value<=30);
  ```
  `n.stats` is an object keyed by stat name `{legitimacy:{value:44,...}, ...}`, not an array. `n.coreStats` doesn't exist. `(object).find?.()` returns `undefined` via optional chaining (no crash, but no result).
- observed/why: The stat-based clock seed ("Legitimacy collapses (6-tick)") path never fires for any realm. The faction path (L11767-11768) is the primary path and works correctly, so this only matters for realms with no factions. Low impact in practice but the dead code path is misleading.
- fix: Replace with `Object.values(n.stats||{}).find(s=>s&&typeof s.value==='number'&&s.value<=30)`.

---

### C09-09: `_reopenEntry` opens Tonight but skips `Tonight._resetResults()`
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L11454–L11458
- evidence:
  ```js
  _reopenEntry(entry){
    const prefixed=`[${entry.style||'Group play'}] ${entry.prompt}`;
    this.close();
    if(typeof Tonight!=='undefined'){Tonight.open();const inp=document.getElementById('tonight-input');if(inp)inp.value=prefixed;}
  },
  ```
  `Tonight.open()` at L12405–L12415 calls `this._resetResults()` internally — this IS called. However, `Tonight.open()` focuses the input, mounts the AccuracyChip, and calls `_resetResults()`. The re-open via `_reopenEntry` correctly resets results because `Tonight.open()` already calls `_resetResults()`.
- observed/why: No actual bug here — `Tonight.open()` calls `_resetResults()`. This finding is withdrawn. The flow works: `_reopenEntry` → `Tonight.open()` → `_resetResults()` clears old content, then input is set to the historical prompt.
- fix: No fix needed. Finding downgraded to POLISH — consider adding a comment to `_reopenEntry` noting that `Tonight.open()` handles the reset.

---

### C09-10: Tonight strong-start `Headsup` slot permanently empty — misleading rail label
- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L12252–L12307 (`_refreshHeuristics`), L12351–L12354 (`_renderRail`)
- evidence:
  ```js
  // _refreshHeuristics generates only slot:'watchouts' and slot:'questions'
  // _renderRail always renders a Heads-up section:
  ${section('Heads-up',slotItems('headsup'),'Nothing pressing right now.')}
  ```
  No heuristic in `_refreshHeuristics` emits `slot:'headsup'`. The Heads-up section always shows the empty message.
- observed/why: The Campaign Commentary rail shows three sections (Heads-up, Questions, Watch-outs). Heads-up is always "Nothing pressing right now." This is intentional scaffolding for the C6 AI fire path, but looks like a broken feature to users who see "live + local" mode claiming to give heads-up commentary.
- fix: Until C6, either hide the Heads-up section when empty (don't render the section if `slotItems('headsup').length === 0 && localOnly`), or add a note that heads-up AI commentary requires Live Mode with an API key.

---

### C09-11: `SampleMode.loadSample` does not persist `firstRunComplete`
- tag: WIRING | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L11148–L11172
- evidence:
  ```js
  loadSample(sampleId){
    ...
    State.data=freshState;
    SampleMode._active=true;
    ...
    Modals.closeAll();
    Render.all();
  }
  ```
  No `firstRunComplete = true` and no `State.persist()` anywhere in `loadSample`. Combined with C09-01, a user who enters via "Try a sample first" (FrontDoor → SampleMode) will see FrontDoor again on every reload because `firstRunComplete` remains `false`. Sample mode data is never persisted (by design), but the flag that gates FrontDoor is also never set.
- observed/why: A user trying the sample gets the FrontDoor on every subsequent app load. The sample entry path is a legitimate "first run complete" event and should mark the flag.
- fix: In `loadSample()`, after `SampleMode._active=true`: set `State.data.meta.firstRunComplete=true` on the `freshState` before assigning to `State.data`, and then call `State.persist()` (the `_sampleMode` guard will block this — so the fix must set `firstRunComplete=true` on the REAL user state backup before switching, not on the fresh sample state).

  Correct approach: before `State.data=freshState`, add:
  ```js
  // Mark first-run complete on the real user state (backup) so it persists after sample exit
  if(SampleMode._userStateBackup) SampleMode._userStateBackup.meta.firstRunComplete=true;
  // Also persist it to IDB now so a page reload doesn't show FrontDoor again
  // We need to temporarily write only the flag, not the sample data
  ```
  Simplest fix: persist firstRunComplete via a direct IDB write before switching to sample state.

---

### C09-12: `_renderResults` retry handlers capture stale `prep`/`strongStart`/`nation` from outer closure
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L12684–L12707
- evidence:
  ```js
  // retry-strongstart handler:
  this._renderResults({strongStart:ss,prep,nation,retryInputs:inputs});
  //                              ^^^^   ^^^^^^ — closed over from _renderResults params
  
  // retry-prep handler:
  this._renderResults({strongStart,prep:p,nation,retryInputs:inputs});
  //                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^ ^ — closed over
  ```
  In the strong-start retry handler (L12690), `prep` and `nation` are closed over from the original `_renderResults({strongStart,prep,nation,...})` destructured params. When strong-start fails and prep succeeds, `prep` is the working value. When strong-start is retried, `prep` is re-passed — this IS the correct current prep value.
  
  However: `nation` in both handlers is the same object as `inputs.nation` (set at L12526: `retryInputs:{nation,...}`). The closure correctly holds the same reference. This means: **no stale closure bug here for nominal cases**. The bug only manifests if `State.data.nations` is mutated between the initial render and the retry click (e.g. user switches nations or `_cleanupPreviousTonightNation` runs). The nation object held in closure would then be an orphan.
- observed/why: If the user generates, the generation partially fails (strongStart fails, prep succeeds), then switches to a different nation, then clicks "Retry Strong Start" — the retry uses the originally generated `nation` object from closure (which may now be removed from State). The retry would regenerate against a stale/deleted nation, then call `_renderResults` with that orphaned nation, which would reappear in the world list via `State.addNation` inside `generate()` being bypassed (the retry doesn't call `generate()`, only `generateStrongStart`). Actually the nation is NOT re-added by retry — `_renderResults` only renders, it doesn't call `State.addNation`. So the orphan nation issue is benign here.
- fix: MEDIUM-risk edge case only. Guard retry handlers: `if(!State.data.nations.find(n=>n.id===inputs.nation?.id)){showToast('The generated world was removed. Generate a fresh session.');return;}` before the Copilot call.

---

### C09-13: `SampleMode` SOLO realm `metadata.soloMode:true` not reflected in fresh state schema
- tag: WIRING | severity: MEDIUM | confidence: MED | NEEDS-LIVE-VERIFY: no
- where: L11128 (SAMPLE_REALM_SOLO definition), L6370–L6373 (buildNationFromSeed metadata handling)
- evidence:
  ```js
  // SAMPLE_REALM_SOLO at L11128:
  metadata:{soloMode:true}
  
  // buildNationFromSeed at L6370-6373:
  metadata:{
    createdAt:seed.metadata?.createdAt||Utils.now(),
    lastUpdatedAt:Utils.now(),
    ...(typeof seed.metadata?.soloMode==='boolean'?{soloMode:seed.metadata.soloMode}:{}),
    ...(typeof seed.metadata?.chaosFactor==='number'?{chaosFactor:seed.metadata.chaosFactor}:{}),
  },
  ```
  `soloMode:true` IS preserved by the conditional spread. This finding is NOT a bug — the field is correctly handled.
- observed/why: False alarm. The Solo sample realm `metadata.soloMode:true` correctly propagates through `buildNationFromSeed`. Confidence demoted to MED because dependent on verifying at runtime that the Solo Mode UI reads `n.metadata.soloMode` correctly. The field wiring is sound.
- fix: No fix needed. Finding downgraded to QUALITY note: ensure Solo Mode UI gates read `State.get().metadata?.soloMode` (consistent with how it's stored).

---

## Summary

### Counts by severity
- CRITICAL: 1 (C09-01)
- HIGH: 2 (C09-02, C09-04)
- MEDIUM: 5 (C09-03, C09-06, C09-09[withdrawn], C09-11, C09-12)
- LOW: 4 (C09-05, C09-07, C09-08, C09-10)
- POLISH: 1 (C09-09 reclassified)

Active findings: 12 (C09-09 withdrawn/reclassified)

### Top 3 findings

1. **C09-01 (CRITICAL)** — `firstRunComplete` is never set to `true` anywhere in the codebase. Every user sees `FrontDoor.open()` on every app launch. The returning-user "welcome back" branch is permanently unreachable. Licensed users with full save data get the demo pitch every reload.

2. **C09-02 (HIGH)** — Tonight-generated nations are persisted to IDB immediately via `State.addNation()` but are only cleaned up on the *next* `generate()` call. `Tonight.close()` and `beforeunload` do not call `_cleanupPreviousTonightNation()`. Users accumulate orphan worlds in their nation list each time they exit Tonight without re-generating.

3. **C09-04 (HIGH)** — The Live Mode AI commentary fire path is a documented stub (`// Stub: real fire path lands in C6`). When Live Mode is enabled with a configured API key, the rail shows "live + local" but only delivers local heuristics. The rate-cap machinery is fully built; the Copilot call it's meant to trigger is missing.
