# Phase 1A — CRITICALs + Secret-leak cluster: VERIFICATION

Verifier: Agent 1A (Opus). Source checked live: `6b9eaae1-relamwrith_V7.HTML` (17,864 lines).
Every verdict below is backed by a quoted line from the LIVE file and/or pasted Node output
from a faithful extraction. Scripts live in `/tmp/` (c04_validate.js, c05_debounce.js,
c11_leak.js, secret_leak_e2e.js).

---

### C04-1: Background validate silently revokes a paid license on a non-`{valid:true}` Worker response
- verdict: CONFIRMED (scope corrected)
- original grade: CRITICAL / HIGH (claimed "Node-proven")
- corrected grade: CRITICAL / HIGH — real and expensive; but the trigger surface is NARROWER than the report's prose, and the "Node proof" table had two wrong rows.
- proof:
  - Live code @ L6150–6154 (`_backgroundValidate`):
    ```
    const json=await res.json();                 // L6150 no res.ok, no .catch
    const wasValid=this._data.valid;
    this._data.valid=!!json.valid;               // L6152 ANY json w/o valid:true => false
    await IDB.set(IDB_KEY_LICENSE,this._data);   // L6153 persisted
    if(wasValid&&!json.valid)document.dispatchEvent(new CustomEvent('license:expired')); // L6154
    ```
  - Runs every boot for LS licenses: L6089 `if(this._data)this._backgroundValidate()` → L6145 `if(...platform!=='lemonsqueezy')return`.
  - Downstream is REAL: `license:expired` @ L17238 fires a non-dismissible toast (duration `0`); `AutoSave.tick()` @ L6261 `if(!LicenseGate.isActive())return;` and `isActive()` @ L6092 `!!(this._data&&this._data.valid)` → with `valid=false`, AutoSave stops. The "stops AutoSave" claim is CONFIRMED.
  - Node output (`/tmp/c04_validate.js`) — the corrected trigger matrix:
    ```
    network reject (fetch throws):       finalValid=true   (SAFE — caught L6155)
    200 {valid:true}:                    finalValid=true   (OK)
    200 {valid:false}:                   finalValid=false  expired  (intended)
    200 {} empty obj:                    finalValid=false  expired  <-- REVOKED
    200 empty body (json throws):        finalValid=true   (SAFE — json() throws, caught)
    500 + JSON {error}:                  finalValid=false  expired  <-- REVOKED
    500 + HTML page (json throws):       finalValid=true   (SAFE)
    429 + JSON {error}:                  finalValid=false  expired  <-- REVOKED
    ```
- plain: A legit paying customer's license is flipped to invalid (and their auto-backup silently turned off) whenever the license Worker answers with a JSON error body that lacks `valid:true` — e.g. a Worker that catches its own 500/429 and returns `{error:...}` JSON. That is the *normal* shape for a Cloudflare Worker, so this is a genuine, realistic brick. It does NOT trigger on a true network outage or a raw Cloudflare HTML 5xx page (those make `res.json()` throw, which is caught). The report's table was wrong on two rows: a literal empty body is SAFE (it throws), and only a parsed `{}` object bricks — the report conflated "empty body" with "empty object."
- fix: `if(!res.ok)return;` then only act on an explicit boolean: `if(json.valid===true){this._data.valid=true;} else if(json.valid===false){this._data.valid=false; ...expired...}` — never treat missing/garbage `valid` as a revocation.

---

### C05-1: No save-on-unload flush — debounced 400 ms write lost on tab close
- verdict: OVERSTATED (bug is real; severity inflated)
- original grade: CRITICAL / HIGH
- corrected grade: HIGH / HIGH — real trailing-edge data loss, but the window is bounded to the last ≤400 ms of mutations, not "everything since last save." CRITICAL implies systemic loss; this is a narrow race.
- proof:
  - `persist` is debounced 400 ms @ L6748 (`},400)`); domain writers use it: `setStat` @ L6787 `this.persist();`, `addEvent` @ L6798 `this.persist();`.
  - `Utils.debounce` @ L5849 has `.cancel()` but **no `.flush()`** (confirmed: Node `persist.flush exists? undefined`).
  - `beforeunload` @ L17520–17530 only checks `copilot-input`/`tonight-input` textarea content — it never calls `persistNow()` or `persist.cancel()`. `visibilitychange` @ L16657 drives only the Ambient canvas (`this._stop()/_start()`), not persistence. No `pagehide` handler exists (grep: 0 matches).
  - BUT `persistNow()` (L6749, awaits IDB + writes localStorage mirror) is called on the genuinely critical paths: L6639/6670 (cold start / secrets migration), L6999 (onboarding complete), L7026/7078 (snapshot restore commit), L11205 (sample exit), L16417/16858. Routine edits are the only thing on the debounce.
  - Node output (`/tmp/c05_debounce.js`):
    ```
    [A] 5 rapid edits 100ms apart, 450ms after last edit: writes=1  (coalesced, then flushed)
    [B] edit then close within 150ms:                      writes=0  (== that one edit LOST)
    [C] with pagehide->persistNow fix:                     writes=1  (recovered)
    ```
- plain: If you make an edit and close the tab within ~0.4 s, that last edit doesn't reach storage. But the debounce flushes every time you pause >0.4 s, so IDB is continuously current — you do NOT lose "everything since your last save," only the final unflushed edit. The existing `beforeunload`/`visibilitychange` handlers don't help (they were never wired to flush state), and the original finding correctly spotted that — it just over-graded the blast radius. Real, worth fixing, but HIGH not CRITICAL.
- fix: `window.addEventListener('pagehide',()=>{State.persist.cancel?.();State.persistNow();});` and the same on `visibilitychange` when `document.hidden`.

---

### C09-1: `firstRunComplete` never set true — FrontDoor opens on every launch
- verdict: CONFIRMED
- original grade: CRITICAL / HIGH (WIRING)
- corrected grade: CRITICAL / HIGH — confirmed exactly as stated; full-file grep is dispositive.
- proof:
  - `firstRunComplete` appears in the ENTIRE 17,864-line file exactly 3 times, and **never as an assignment to `true`**:
    - L6418 `...firstRunComplete:false...` (createDefaultState)
    - L6452 `d.meta.firstRunComplete=d.meta.firstRunComplete??false;` (migration fills false)
    - L17498 `if(!State.data.meta.firstRunComplete){` (bootstrap read)
  - Bootstrap @ L17498–17515: the `if(!firstRunComplete)` branch runs `FrontDoor.open()` for EVERYONE; the `else` branch (Welcome-back toast L17509, legacy onboarding L17513) is **unreachable**.
  - `FrontDoor.open()` @ L11259 unconditionally shows the modal and locks scroll: `el.classList.add('is-open'); document.body.style.overflow='hidden'` (L11263–11264). The `licensed` check (L11273) only hides the Turnstile widget (L11275) — the modal still opens over the dashboard.
  - None of `_handleGenerate` (L11330), `_handleSample`, `_handleActivate`, or `close()` (L11289) set the flag.
- plain: Every returning, licensed user is greeted by the demo/front-door modal (with the page scroll-locked) on every single reload, and has to dismiss it manually. The "Welcome back, <realm>" experience the code was written for never runs for anyone. For a paid product this reads as broken on launch.
- fix: set `State.data.meta.firstRunComplete=true; State.persist();` in `_handleGenerate`/`_handleSample`/`_handleActivate` after `this.close()`, and as a fallback in `close()`. (Note: the sample path also needs care — see C09-11, the `_sampleMode` persist guard.)

---

### C11-1: RelationshipWeb `_render()` stacks a new `svg.click` listener every render
- verdict: CONFIRMED
- original grade: CRITICAL / HIGH (BUG/PERF)
- corrected grade: CRITICAL / HIGH — confirmed; the only refinement is the growth shape ("unbounded, doubling per background-click" rather than strictly "exponential" from drag alone).
- proof:
  - Enclosing function is **`_render()`** (declared @ L15272). It fetches the element by id (`const svg=document.getElementById('web-svg')` @ L15273) and only swaps children (`svg.innerHTML=...` @ L15330).
  - `#web-svg` is a **static template element**, created once (markup @ L4338 `<svg id="web-svg" ...></svg>`), never recreated. So it PERSISTS across renders → element-level listeners accumulate.
  - The offending bind @ L15394 (no `removeEventListener`, no `{once:true}`, no guard):
    ```
    svg.addEventListener('click',()=>{ this._selected=null; ...; this._render(); }); // L15394–15399
    ```
  - `_render()` is called from 6 sites: L15227 (`_runSim` tick), **L15378 (node click), L15398 (the bg-click handler itself — recursive), L15435 (drag mousemove — fires per frame), L15442 (pan mousemove), L15459 (wheel zoom)**.
  - The per-node listeners @ L15366 do NOT leak (children are recreated by the innerHTML swap, old ones GC'd) — only the element-level bg-click leaks. The original finding correctly isolated this.
  - Node output (`/tmp/c11_leak.js`):
    ```
    After build + 50 drag frames:  bg-click listeners stacked = 51
    After ONE background click:    51 handlers fire, 51 redundant re-renders, count DOUBLES to 102
    After a SECOND background click: doubles to 204
    ```
- plain: Drag a node and the invisible "click empty space to deselect" handler gets re-added on every animation frame. After a short drag there are dozens; the first time you then click the background, all of them fire at once (each re-running the whole graph render and clearing the selection), and the handler count doubles — then doubles again on the next click. It degrades to a freeze and makes selection flicker. Real and serious.
- fix: move the background-click bind into `init()` (runs once) alongside the other persistent listeners; remove it from `_render()`.

---

## SECRET-LEAK CLUSTER (the product-critical one)

Two INDEPENDENT failures compound. Both must work for a GM to hide secrets; both are broken.
(A) AI-supplied `visibility` is never normalized/clamped on write. (B) the Show-Secrets/Forecasts
toggle doesn't refresh the visible timeline on the default layout.

### C03-4: CLAMP has no visibility clamp — arbitrary visibility strings stored verbatim
- verdict: CONFIRMED (this is the ROOT)
- original grade: HIGH / HIGH
- corrected grade: HIGH / HIGH — confirmed; it is the single root the other cluster findings reduce to.
- proof: `CLAMP` @ L5863–5869 defines `statValue, eventWeight, year, eventType` and **nothing for visibility**:
  ```
  const CLAMP={ EVENT_TYPES:[...], statValue(...){...}, eventWeight(...){...}, year(...){...}, eventType(t){...} };  // no visibility fn
  ```
- plain: There is no single guard that forces an event's visibility to be one of public/private/forecast. Every write path that should call one, can't — it doesn't exist.
- fix: add `CLAMP.eventVisibility(v){const VALID=['public','private','forecast'];const x=String(v||'').toLowerCase();return VALID.includes(x)?x:'public';}` (default `public`; or default `private` if you prefer fail-safe-hidden) and route all visibility writes through it.

### C01-1: Faction schema advertises 4 fields, parser reads 2 (type/position dropped)
- verdict: CONFIRMED (not a secret-leak item, but verified in passing)
- original grade: HIGH / HIGH
- corrected grade: HIGH / HIGH.
- proof: CANON_SUFFIX @ L4795 `Faction: <name> | <type> | <position> | <description>`; parser @ L8309 `candidates.push({type:'faction',name:p[0],desc:p.slice(1).join(' | ')||''})` (collapses all-but-name into desc); apply @ L8372 hardcodes `type:'Unknown',position:'holding'`. SWEEP_PROMPT @ L4796 uses the 2-field form, so sweep-produced factions are fine; main-prompt 4-field lines lose type+position.
- plain: When the AI fills in a faction's type and political position per the format it was given, the app throws both away and stamps every AI faction "Unknown / holding."
- fix: change CANON_SUFFIX faction line to `Faction: <name> | <description>` to match the parser, OR extend the parser to read `p[1]`/`p[2]` when `p.length>=4`.

### C08b-2 / C01-3 / C06-2: AI `visibility` never enum-validated → secret events leak public
- verdict: CONFIRMED (all three are the same defect at the same two lines)
- original grade: C08b-2 HIGH/HIGH, C01-3 HIGH/HIGH, C06-2 HIGH/MED
- corrected grade: HIGH / HIGH — confirmed and reachable; C06-2's "MED confidence" should be raised to HIGH (proven end-to-end below).
- proof:
  - canon-paste store @ L8305: `visibility:p[3]||'public'` (raw 4th pipe-field).
  - apply @ L8368: event built with `type:CLAMP.eventType(c.evType)` and `weight:CLAMP.eventWeight(c.weight)` **but** `visibility:c.visibility||'public'` — the asymmetry is on one line: type/weight clamped, visibility not.
  - AI tool path @ L9665–9667: `type` is validated (rejects unknown) AND `CLAMP.eventType`'d; `visibility:args.visibility||'public'` is neither. `_applyProposal` @ L9704 passes it straight through.
  - The three render filters compare exact-lowercase and pass everything else:
    - L7933 (recentPulse): `e.visibility==='private'...; e.visibility==='forecast'...; return true;`
    - L8005–8006 (chronicleBand): identical.
    - L14277–14278 (WorldShell._renderChronicle — the player-facing default timeline): identical.
  - Instruction surface is inconsistent: CANON_SUFFIX @ L4795 shows `<visibility>` with NO enum; copilot fallback @ L10094 says "public, private, or forecast" (lowercase); SWEEP_PROMPT @ L4796 shows `[visibility]` with no enum. So a model emitting `Private` (capitalized) or `secret` (synonym) — especially via sweep — is plausible.
  - End-to-end Node proof (`/tmp/secret_leak_e2e.js`), `showSecrets=false, showForecasts=false`:
    ```
    Stored -> rendered to players (WorldShell filter L14276):
      "The Betrayal"  visibility="Private"   <-- LEAKED
      "Hidden Cache"  visibility="secret"    <-- LEAKED
      "True Heir"     visibility="private"   (correctly hidden)
      "Coming Famine" visibility="Forecast"  <-- LEAKED
      "Likely Revolt" visibility="forecast"  (correctly hidden)
    GM-intended-hidden events that LEAKED: 3 of 5
    ```
  - NOTE — the MANUAL edit form is NOT a vector: `ev-vis` is a `<select>` offering only public/private/forecast (markup @ L3685), and L16038 reads that select. Only the AI paths (canon-paste, tool-call) inject raw strings.
- plain: If the AI labels a secret event "Private" with a capital P, or calls it "secret," the app stores that literally and then SHOWS it to players, because the hide-filter only recognizes the exact lowercase word "private." A GM who trusts the AI's hidden-canon labelling will have secrets on screen. Proven for 3 of 5 realistic AI outputs.
- fix: apply `CLAMP.eventVisibility` (from C03-4) at L8305, L8368, and L9667; and/or centralize one `isHiddenFromPlayers(e,settings)` that treats anything not explicitly `public` as gated. Fix all three filter sites (L7933, L8005, L14277) identically.

### C08b-3: `ev.visibility` reaches innerHTML un-escaped — latent XSS sink for the AI-sourced string
- verdict: CONFIRMED
- original grade: SECURITY MEDIUM / HIGH
- corrected grade: MEDIUM / HIGH — confirmed; correctly MEDIUM (needs user-accept + pipe-split limits the payload).
- proof: detail panel @ L8222 interpolates `${ev.visibility}` RAW into `content.innerHTML` while every sibling uses `Utils.escHtml` (name/type/source). Tooltip @ L8048 same: `· ${ev.visibility}` raw. Combined with C08b-2 (visibility is AI-controlled, unvalidated). The description field is safe (goes through `Markdown.render` @ L8224, which escapes first). Bonus check: `Markdown.render` @ L5922 routes through `DOMPurify.sanitize` only if loaded — and the file ships the **home-grown fallback sanitizer** (L3223–3281, `version:'fallback'`), NOT the real DOMPurify (which the comment @ L3220 says "MUST be replaced before public release"). The raw `ev.visibility` interpolation bypasses Markdown.render/DOMPurify entirely regardless.
- plain: A crafted visibility value containing HTML would execute when the event's detail panel or tooltip is shown. Lower risk because the GM must first accept the weird candidate and the canon format splits on "|", but it's a clear escaping miss on an AI-fed value, and the project's sanitizer is the weaker fallback, not the real library.
- fix: `${Utils.escHtml(ev.visibility)}` at L8222 and L8048. Fixing C08b-2 (clamp to enum) also removes the vector. Separately: ship real DOMPurify before public release (X2a territory).

### C10-1: "Show Secrets"/"Show Forecasts" toggles no-op on the default (shell) layout
- verdict: CONFIRMED
- original grade: HIGH / HIGH (WIRING)
- corrected grade: HIGH / HIGH — confirmed; this is the *control* half of the leak and is independently broken.
- proof:
  - Toggle handlers @ L16274–16285 call only `Render.chronicleBand();Render.recentPulse();` (the legacy band) — e.g. secrets toggle @ L16284.
  - `State.setSetting` @ L7000–7004 only does `settings[k]=v;_touchMeta();persist();` — it does NOT dispatch `sc:changed` and does NOT call `Render.all()`. So nothing repaints the shell.
  - Default layout hides the legacy band: @ L16734 `if(chronBand)chronBand.style.display=useShell?'none':''`; `useShell` @ L16728 is true for all users unless the hidden `rw_legacy_layout` debug flag is set (L16727). The visible timeline is `WorldShell.render(nat)` @ L16736 — which the toggles never call.
- plain: When a GM flips "hide secrets" in Settings on the normal layout, the app redraws an invisible element and leaves the real, on-screen timeline untouched. Already-shown secrets stay shown; newly hidden ones don't disappear until some unrelated full re-render (slider drag, undo, import) happens to fire. So even for correctly-tagged `private` events, the safety control doesn't work on demand.
- fix: in both toggle handlers add a shell refresh (`if(typeof WorldShell!=='undefined'){const nat=State.get();if(nat)WorldShell.render(nat);}`) or simplest: replace the two render calls with `Render.all();`.

### C10-2: WorldShell chronicle filter doesn't enum-validate visibility (2nd render site of C08b-2)
- verdict: CONFIRMED
- original grade: SECURITY HIGH / HIGH
- corrected grade: HIGH / HIGH — confirmed; same root as C08b-2/C06-2, reproduced verbatim at the player-facing render site.
- proof: L14276–14280 is the exact lowercase-compare pattern, on the default-layout timeline. (Same code shown under C08b-2 above; end-to-end leak proven via this filter in `/tmp/secret_leak_e2e.js`.)
- plain: The most-seen timeline in the app uses the same fragile "is it exactly 'private'?" check, so it's the concrete place the leaked events actually appear.
- fix: same single helper / clamp as C03-4 + C08b-2; apply identically at L7933, L8005, L14277.

---

## Summary

Counts by verdict (8 findings in scope; the secret-leak cluster's C01-3/C06-2/C10-2 are the
same defect verified at different sites and counted once each as listed):
- CONFIRMED: 7 — C04-1, C09-1, C11-1, C03-4, C08b-2 (incl. C01-3/C06-2 same-defect siblings), C08b-3, C10-1, C10-2  *(C01-1 also confirmed in passing)*
- OVERSTATED: 1 — C05-1 (real bug, severity CRITICAL→HIGH)
- FALSE-POSITIVE: 0
- NEEDS-BROWSER: 0

Spine scorecard: **C04-1 CONFIRMED (scope tightened), C05-1 OVERSTATED (→HIGH), C09-1 CONFIRMED, C11-1 CONFIRMED.**

Most important corrections I made:
1. **C05-1 is HIGH, not CRITICAL** — the loss window is the trailing ≤400 ms after the *last*
   edit (proven: IDB flushes on every >400 ms pause), not "everything since last save."
2. **C04-1's trigger is narrower than reported** — a true network outage and a raw Cloudflare
   HTML 5xx are SAFE (json() throws, caught); only a *parseable JSON* response lacking
   `valid:true` bricks. The report's "empty body" row was wrong (empty body is safe; only a
   literal `{}` object bricks). The realistic brick is a Worker that returns `{error}` JSON on
   4xx/5xx — which is the CF-Worker norm, so it stays CRITICAL.
3. **C06-2 confidence should be HIGH, not MED** — the leak is proven end-to-end in Node.
4. The **manual edit form is NOT a leak vector** (constrained `<select>`); only the AI paths are.
5. The shipped sanitizer is the **fallback**, not real DOMPurify (the comment says replace before release).

### Secret-leak verdict
**YES — a GM's hidden (private/forecast) event DOES reach a player-facing view.** Two independent,
both-confirmed paths make it happen:
- **Storage path (root C03-4 → C08b-2/C01-3/C06-2 → C10-2):** AI-supplied `visibility` is stored
  raw (L8305, L8368, L9667) with no clamp, and the player-facing WorldShell timeline filter
  (L14277) hides only the exact lowercase `'private'`/`'forecast'`. So an AI event tagged
  `Private` (capitalized) or `secret` (synonym) is stored and rendered to players. Proven in
  `/tmp/secret_leak_e2e.js`: with secrets+forecasts hidden, 3 of 5 realistic AI-tagged hidden
  events leaked onto the timeline.
- **Control path (C10-1/C10-3):** even for a correctly-tagged `private` event, flipping
  "Show Secrets" off on the default layout does not refresh the visible timeline
  (`setSetting` doesn't re-render WorldShell; the toggle only redraws the hidden legacy band),
  so a GM cannot reliably hide secrets on demand before showing the screen to players.

No browser is required to establish this — the data path is pure logic and was executed in Node.
A browser would only be needed to confirm the exact on-screen pixels, which the code already
dictates.
