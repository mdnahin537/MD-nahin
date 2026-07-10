# C03 — Utils / CLAMP / EffortPicker / Variants / EmptyStates / MobileGate

Auditor chunk: lines 5603–5969 of `6b9eaae1-relamwrith_V7.HTML`.
Node runs conducted for: CLAMP (statValue, eventWeight, year, eventType), Utils pure
functions (escHtml, slugify, clamp, statusClass, formatYear), EffortPicker round-trips.
Output pasted inline as proof.

---

### C03-1: EmptyStates — defined but NEVER called anywhere
- tag: DEAD | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5769–L5799
- evidence:
  ```
  const EmptyStates = { _defs:{...}, _actions:{...}, render(section,containerEl,ctaHandler){...} };
  ```
  Grep for `EmptyStates` across 17,864 lines returns only the definition at L5769. No caller.
- observed/why: The entire module — six section definitions, six action handlers, and the DOM
  render logic — is dead code. No surface calls `EmptyStates.render(...)`. Empty-state UX
  is absent from the live product. The action handlers reference `Modals`, `SHSPanels`,
  `Interact`, `Copilot` — all potential no-ops even if wired, because none of the calling
  paths exist.
- fix: Either wire `EmptyStates.render(section, el)` into each list-render path (chronicle,
  factions, characters, hooks, secrets, locations) or delete the module. If keeping it,
  the `hooks` action-handler calls `Copilot.generateHooks()` which does not exist on the
  `Copilot` object in this file — would silently no-op even if wired.

---

### C03-2: EffortPicker.render() and .bindAll() — defined, never invoked
- tag: DEAD | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5611–L5631
- evidence:
  ```js
  render(key, opts={}){ ... return `<label class="rw-effort-picker"...`; },
  bindAll(){ document.querySelectorAll('.rw-effort-picker__select:not([data-bound])') ... }
  ```
  Full-file grep for `EffortPicker.render` and `EffortPicker.bindAll` returns zero matches
  outside the object definition. The CSS for `.rw-effort-picker` exists (L1471–1474), but the
  HTML is never produced because `render()` is never called.
- observed/why: The `AccuracyChip._openTierPicker` at L5733 bypasses `EffortPicker.render()`
  and directly builds its own popover HTML using `EffortPicker.TIERS`. The `bindAll()` method
  (which would wire `<select>` change events) is also never called. The `EffortPicker` component
  is effectively stranded: only its `toDepth`/`fromDepth`/`TIERS` helpers are used externally.
  The inline-select widget was designed for placement "where the user already is" but was never
  deployed — the tier popover replaced it.
- fix: If EffortPicker UI is intended for future use, leave as-is with a TODO. If not, delete
  `render()` and `bindAll()`. The helpers (`toDepth`, `fromDepth`, `TIERS`) are used and must
  be kept.

---

### C03-3: AccuracyChip.mount() — document-level listeners accumulate on every call
- tag: PERF | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5725–L5731
- evidence:
  ```js
  mount(containerEl, surface, opts={}) {
    ...
    document.addEventListener('rw:effort-changed', e => { ... refresh(); });
    document.addEventListener('sc:changed', e => { ... refresh(); });
  }
  ```
  Callers: L5298 (inside `Solo.render()` — called every render), L12414 (inside
  `Tonight.open()` — called every panel open), L12057 (inside `_openAiPop()` — called every
  campaign section open), L17381 (bootstrap loop over all surfaces). None remove listeners.
  No `AbortController`, no `removeEventListener`, no guard that the container already has
  listeners attached.
- observed/why: Each call to a render function or panel-open adds 2 permanent `document`
  listeners. Over a session with repeated navigation, hundreds of stale listeners accumulate,
  each triggering `refresh()` and computing `AccuracyChip.getMeta()` (which may call
  `Copilot.buildContext()`). This is CPU and GC pressure on every state change event.
  Note: the **chip click listener** at L5721 is NOT leaked because `containerEl.innerHTML=`
  destroys the old chip before re-render; only the document-level listeners are the problem.
- fix: Use an `AbortController` per mount; store it on `containerEl._chipAbort`; call
  `abort()` at the top of `mount()` before adding new listeners. Or gate with a
  `containerEl._chipBound` flag.

---

### C03-4: CLAMP has no visibility enum clamp — arbitrary strings stored verbatim
- tag: BUG | severity: HIGH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5863–L5869 (CLAMP definition); L9667, L8305, L8368 (callers)
- evidence:
  ```js
  // CLAMP — no visibility function
  const CLAMP = { EVENT_TYPES:[...], statValue, eventWeight, year, eventType };
  // Callers store raw AI/parse value:
  // L9667: visibility: args.visibility || 'public'
  // L8305: visibility: p[3] || 'public'
  // L8368: visibility: c.visibility || 'public'
  ```
  Valid values are `'public'`, `'private'`, `'forecast'`. Display logic at L7933, L8005 only
  checks for `==='private'` and `==='forecast'`; anything else is treated as public.
  Node proof:
  ```
  'secret' stored as: secret, shows as: PUBLIC
  'Private' stored as: Private, shows as: PUBLIC (case mismatch)
  ```
- observed/why: If the AI sends `visibility:'private_gm_only'` or `'Private'` (wrong case),
  the event is stored with that invalid value and then silently displayed as public — a GM's
  private event is revealed to players. The AI model is instructed via `CANON_SUFFIX` (L4795)
  to send a `<visibility>` field, but no contract or schema enforces the enum.
- fix: Add `CLAMP.eventVisibility(v){ const VALID=['public','private','forecast']; return
  VALID.includes(v)?v:'public'; }` and apply it at all three call sites. Also normalise
  case: `VALID.includes(v?.toLowerCase?.())` then return the lower-case form.

---

### C03-5: CLAMP.statValue passes floats through — stat values drift to non-integers
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5865; L9696 (AI tool path); L8361, L8672 (canon apply paths)
- evidence:
  ```js
  // statValue: no rounding
  statValue(v,stat){ const n=Number(v); return Number.isFinite(n)?Utils.clamp(n,stat.min??0,stat.max??100):(stat.default??stat.min??0); }
  // AI tool path (L9696) also uses Utils.clamp without rounding:
  Utils.clamp(s.value + args.delta, s.min, s.max)
  ```
  Node output:
  ```
  statValue(50.7, {min:0,max:100}): 50.7
  clamp with float delta 5.5: 55.5
  ```
  Sliders render `step="1"` (L7770, L14044). Import JSON can legally contain `"value": 50.7`.
  AI tool `update_nation_stat` at L9692 accepts `delta:number` with no integer check.
- observed/why: Stats are designed as integers (0–100 band, integer sliders). A float stored
  in state will display as "55.5" in the stat bar label (L7899: `${s.value}`), look
  broken in the tooltip, and can cause cumulative rounding drift over multiple AI deltas.
  The AI tool description says "delta (integer)" but this is only a comment — not enforced.
- fix: In `CLAMP.statValue`, wrap the clamp result in `Math.round()`. At L9696, validate
  `Number.isInteger(args.delta)` or add `Math.round()`. Similarly in `CLAMP.eventWeight`,
  rounding already occurs — apply the same pattern to `statValue`.

---

### C03-6: Utils.clamp passes NaN through — direct callers can write NaN to state
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5848; L8361, L8672, L9696, L12864 (direct callers)
- evidence:
  ```js
  clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  ```
  Node output:
  ```
  clamp(NaN, 0, 100): NaN     // Math.max(0, Math.min(NaN,100)) = NaN
  clamp(55, undefined, undefined): NaN  // Math.max(undefined,...) = NaN
  ```
  Direct callers at L8361, L8672, L9696 call `Utils.clamp(stat.value + c.delta, stat.min,
  stat.max)`. If a custom stat somehow has `min`/`max` as `undefined` (e.g. corrupted import),
  `NaN` is stored in `stat.value`. `CLAMP.statValue` internally is safe (has
  `Number.isFinite` guard before calling `Utils.clamp`), but the four direct-call sites have
  no such guard.
- observed/why: NaN stored in `stat.value` causes `stat-bar-fill` to render at 0%, the
  number label shows `NaN`, stability calculations return `NaN` (propagates through
  `Compute.stability`), and threshold checks compare `NaN >= x` (always false — no threshold
  ever fires). Silent data corruption from a single bad import.
- fix: Change `clamp` to `clamp(v,a,b){ return Number.isFinite(v)?Math.max(a,Math.min(b,v)):a??0; }`,
  OR add `Number.isFinite` guards at each direct call site. The CLAMP functions are the right
  abstraction — route all stat writes through `CLAMP.statValue`.

---

### C03-7: _escDiv declared but never used
- tag: DEAD | severity: POLISH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5842
- evidence:
  ```js
  const _escDiv = document.createElement('div');
  ```
  Grep for `_escDiv` returns only L5842. `Utils.escHtml` (L5845) uses regex-based escaping,
  not the `_escDiv` trick. The DOM element is created at parse time (side effect: forces a
  layout), then never referenced again.
- observed/why: Dead code. The variable name suggests a prior implementation of `escHtml` that
  set `_escDiv.textContent = s` and read back `_escDiv.innerHTML`. That approach was replaced
  with the regex version (correctly — safer in workers and non-DOM contexts), but the div was
  not removed.
- fix: Delete `const _escDiv = document.createElement('div');`.

---

### C03-8: storageAvailable() defined but never called
- tag: DEAD | severity: POLISH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5966
- evidence:
  ```js
  function storageAvailable(){ try{ localStorage.setItem('__t__','x'); ... return true; }catch(e){return false;} }
  ```
  Grep across the full file: zero callers. The IDB/localStorage code does its own try/catch
  inline.
- observed/why: Unreachable utility. Any localStorage access failure is silently absorbed
  in other try/catch blocks. The function is never used to gate any feature.
- fix: Delete or wire to a capability check at bootstrap. If localStorage is unavailable
  (private browsing, storage quota), the app currently fails silently on the preference saves.

---

### C03-9: Utils.formatYear defined but never called
- tag: DEAD | severity: POLISH | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5852
- evidence:
  ```js
  formatYear(y){ return `Year ${y}`; },
  ```
  Full-file grep for `Utils.formatYear`: zero matches. Year formatting elsewhere is done
  inline: `Year ${ev.year}` strings appear at L8048, L8222, L8898, L12875.
- observed/why: Dead helper. The inline duplications are not routed through this utility,
  making `formatYear` pointless. Decimal years (e.g. 1247.5 from session advancement D4)
  would also show as "Year 1247.5" if this were called — but it isn't.
- fix: Either delete `formatYear` or replace the inline `Year ${x}` patterns with it.

---

### C03-10: MobileGate 'continue anyway' (non-persist) invalidated by resize events
- tag: UX | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5804–L5838
- evidence:
  ```js
  check(){ if(localStorage.getItem('rw_mobile_dismissed')==='1') return; if(window.innerWidth<768) this.show(); }
  // bind() resize handler:
  else if(!overlay && window.innerWidth<768) this.check();
  ```
  When user clicks "Continue anyway" → `hide(false)` → `localStorage` NOT set. Any subsequent
  `resize` event that keeps/returns width to <768 calls `check()` again → gate re-appears.
- observed/why: On a device where a virtual keyboard opens (shrinking viewport), on Chrome
  DevTools panel resize, or on any orientation jitter, the gate re-asserts itself. A user who
  explicitly dismissed it to try a narrow layout gets interrupted again immediately. The
  "Continue anyway" button falsely implies a persistent session-level choice.
- fix: Set a session-level flag (not localStorage): `MobileGate._dismissed = true` in
  `hide(false)`, and check it in `check()` before calling `show()`. Or use
  `sessionStorage` instead of requiring `localStorage` persistence.

---

### C03-11: AccuracyChip._openTierPicker — copilotContextDepth change not persisted
- tag: BUG | severity: MEDIUM | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5756–L5757
- evidence:
  ```js
  if(key==='copilotContextDepth'){
    const n=State.get(); if(n){ n.copilotContextDepth=EffortPicker.toDepth(t); State._touch(n.id); }
  } else {
    State.setSetting(key,t);
  }
  ```
  `State._touch()` at L7100 only updates `metadata.lastUpdatedAt` and calls `_touchMeta()`.
  It does NOT call `State.persist()`. The other branch calls `State.setSetting()` which calls
  `persist()` internally (confirmed at L5053–5054: `_touch` + `persist` always paired in
  `setSetting`).
- observed/why: Copilot context depth is stored on the nation object (`n.copilotContextDepth`),
  not in settings. When the user changes it via the chip tier popover, the change lives only
  in memory. If no other action triggers a `persist()` call before page close, the new depth
  is lost and the old depth reappears on next load. In practice, any subsequent state edit
  will flush the debounced persist and incidentally save it — but a user who only changes
  context depth and then closes the tab will lose the preference silently.
- fix: Add `State.persist()` after `State._touch(n.id)` at L5757:
  `State._touch(n.id); State.persist();`

---

### C03-12: CLAMP.eventType is case-sensitive but AI validation rejects before clamp
- tag: BUG | severity: LOW | confidence: HIGH | NEEDS-LIVE-VERIFY: no
- where: L5868, L9665
- evidence:
  ```js
  // L9665 pre-validates before CLAMP is used:
  if(!CLAMP.EVENT_TYPES.includes(args.type)) return {error:`Invalid type '${args.type}'...`};
  // L5868:
  eventType(t){ return CLAMP.EVENT_TYPES.includes(t)?t:'Political'; }
  ```
  Node output: `CLAMP.eventType('political')` → `'Political'` (default, NOT the match).
  The validation at L9665 is case-sensitive. If the AI sends `"political"` or `"POLITICAL"`,
  the proposal fails with an error rather than being silently normalised.
- observed/why: The AI model is instructed to use the correct capitalisation (CANON_SUFFIX
  L4795 lists `<type>` examples as "Political" etc.), but LLMs commonly vary casing. The
  error is surfaced to the model (it receives the error text back), so the AI can retry —
  but this adds an unnecessary tool-call round-trip. The fix is to normalise before
  validating, not after.
- fix: At L9665, replace `args.type` with a normalised form:
  ```js
  const normType = CLAMP.EVENT_TYPES.find(t=>t.toLowerCase()===String(args.type||'').toLowerCase())||args.type;
  if(!CLAMP.EVENT_TYPES.includes(normType)) return {error:...};
  ```
  And update the `eventType` helper to do the same case-insensitive match.

---

## Node Test Output Summary

```
=== CLAMP.statValue ===
in-range 50: 50           ✓
out high 120: 100         ✓ (clamped)
out low -5: 0             ✓ (clamped)
NaN: 50                   ✓ (uses default)
null: 0                   ⚠ (null treated as 0, ignores .default)
decimal 50.7: 50.7        ⚠ (not rounded — stat stores float)

=== CLAMP.eventWeight ===
decimal 5.7: 6            ✓ (Math.round applied)
decimal -29.6: -30        ✓

=== CLAMP.year ===
decimal 1247.99: 1247     ✓ (Math.floor applied)
out low 0: 1              ✓

=== CLAMP.eventType ===
lowercase 'political': 'Political'  ⚠ (case-sensitive miss — returns default)

=== Utils.clamp ===
clamp(NaN, 0, 100): NaN   ⚠ (NaN passthrough)

=== EffortPicker round-trips ===
low → low → low     OK
mid → medium → mid  OK
high → high → high  OK
max → full → max    OK
(all round-trips correct)
```

---

## Summary

| Severity | Count |
|----------|-------|
| HIGH     | 1 (C03-4: visibility enum not clamped) |
| MEDIUM   | 4 (C03-3: listener leak, C03-5: float stats, C03-6: NaN passthrough, C03-11: persist missing) |
| LOW      | 2 (C03-10: MobileGate dismiss, C03-12: case-sensitive type) |
| POLISH   | 3 (C03-7: _escDiv, C03-8: storageAvailable, C03-9: formatYear) |
| DEAD     | 2 (C03-1: EmptyStates, C03-2: EffortPicker.render/bindAll) |

**Top 3:**
1. **C03-4** (HIGH) — No visibility enum clamp: AI or canon-parse can store `'Private'`
   or `'secret_gm'` which then silently displays as public, exposing GM-only events to players.
2. **C03-11** (MEDIUM) — `_openTierPicker` for `copilotContextDepth` calls `State._touch`
   but not `State.persist()` — user's context depth preference is lost on tab close if no
   other edit fires the debounce.
3. **C03-3** (MEDIUM) — `AccuracyChip.mount` adds 2 permanent `document` event listeners on
   every call with no cleanup; repeated navigation accumulates unbounded listener counts,
   all firing on every state-change event.
