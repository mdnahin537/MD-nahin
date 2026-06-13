# RealmWright — THE BLUEPRINT
*Blueprint Engineer pass, 2026-06-12. The single executable build plan.*

**Built ONLY on graded inputs:** `POSITION.md` (A+ ✅, amended), `IDEAS.md` (A+ ✅), `CEO-REVIEW.md` (S+ ✅), `VALUE-LEDGER.md` (S+ ✅), `.audit/research/MARKET-RESEARCH-V2.md` (A+ ✅), `QUALITY-BAR.md` (the bar), `INDEX.md` (Hunter's binding rulings 2026-06-12), `CLAUDE.md` (hard constraints + model routing). The quarantined dossier was not read or cited.
**Provenance:** every line anchor below was re-read or re-grepped firsthand in `realmwright-v7.html` **this session** (greps reproduced: `firstRunComplete` ×3 at L6418/L6452/L17498; `setStat(` = def L6769 + callers L8166/L8362/L9748; `navigator.storage`/`pagehide` → zero hits; `id="panel-war-room|panel-chronicle"` → zero hits; `worldTurn|randomTable|knownBy|pressArchive` → zero hits). One false line-cite fails this artifact — none was knowingly left in.
**Hunter's three rulings applied exactly:** (1) "oracle" name stays, mechanic ruled clean; Word Mill table swap still proceeds (IP). (2) One demo build: 5 AI uses on Hunter's Worker key + no-AI tasting + NO export/persist/regular use. (3) $19 for 30 days post-launch → $29 base; $49 supporter tier deferred to Hunter; "$229" never public.

---

# 1. HOW TO USE THIS PLAN (read this first, Hunter)

**What this document is.** This is the complete instruction set for turning RealmWright from "70% built with known trust bugs" into a launched, trustworthy, living-world GM tool. Every change the product needs is written down here as a **task**: a small, self-contained piece of work with the exact file location, the exact change, and a test that proves it worked. You never need to read the code. You need to read this.

**What a PHASE is.** A phase is a group of tasks that, together, achieve one goal (e.g., "the product is trustworthy" or "the world moves on its own"). Phases run in order: 0 → 6. Each phase ends with an **exit gate** — a plain-English test that must pass before anything in the next phase ships. The most important gate is Phase 0's: *nothing goes public — no demo, no store page, no announcement — until the product has zero known trust, money, or data bugs.*

**What a TASK is.** One coherent change. Each task card tells you: what it is in plain English and why it matters (the "what & why"); exactly where in the code it happens (file + line numbers I verified myself today); exactly what to change; what it depends on; how to know it worked (the **acceptance test**); which AI model should do it; and a confirmation that the product still works completely after just this task (so you can stop at any point and still have a working product).

**How you hand a task to an agent.** Open a Claude Code session and paste the dispatch recipe from §2 below with the task ID. The task card is the entire context the agent needs — that is the design goal of this document. After the agent finishes, it must show you the passing acceptance test before you accept the work. If a task says "Node test," the agent proves it with a script you can re-run. If it says "desktop runbook," it is a click-through check you (or an agent with a browser) perform, written as numbered steps.

**What you should personally watch.** (a) The Phase 0 exit gate — run it yourself, it is written for a non-coder. (b) The "Decisions Hunter Must Make" list in §8 — those are yours alone. (c) Money tasks (license, demo, store) — read their acceptance tests before accepting. Everything else is delegable.

**Sizes, not dates.** Tasks are sized S (small — a fraction of one agent session), M (one focused agent session), L (multiple sessions). No calendar promises — that is deliberate (Rubric B5: no fantasy timelines).

---

# 2. MODEL-ROUTING TABLE + DISPATCH RECIPE

Per `CLAUDE.md`'s orchestration brain (the binding mapping for this plan):

| Task class | Executor model | Why |
|---|---|---|
| Security, license/money paths, credential handling, data-loss fixes, the simulation engine core, anything expensive-if-wrong | **Opus 4.8** (`claude-opus-4-8`) | Wrong = lost trust, lost money, or corrupted worlds. Pay for the strongest reasoning. |
| Standard feature builds, UI surfaces, deterministic assembly functions, generators, parsers with a pinned spec, tests | **Fable 5** | The default builder. Every Fable task here carries an exact spec + acceptance test, so it needs competence, not architecture judgment. |
| Copy swaps, label changes, file ops, store-page text edits, trivial lookups | **Haiku 4.5** | Cheap and sufficient when the change is mechanical. |

**Dispatch recipe (one paragraph — paste this, fill the brackets):**
> Read `/home/user/MD-nahin/BLUEPRINT.md` §3 (UX standard) and §4 (cross-cutting standards), then execute task **[TASK-ID]** exactly as specified in §5. The target file is `/home/user/MD-nahin/realmwright-v7.html` unless the task says otherwise. Honor the standards the task lists. Do not change anything outside the task's scope. When done: run the task's acceptance test, paste the passing output (or the completed runbook steps), confirm "leaves product working" by loading the app state the task names, and report the diff summary. If any line anchor does not match what you find, STOP and report the mismatch instead of guessing — line drift means a prior task moved the code; re-locate by the quoted code, not the number.

(Line numbers in this plan are anchors into the file *as of 2026-06-12*. Tasks within a phase that edit the same region note their ordering; executors must re-locate by quoted code after earlier tasks land. Quoted code fragments are provided for exactly this reason.)

---

# 3. UX & ONBOARDING STANDARD (every user-facing task inherits this)

The product must be beginner-friendly and user-friendly: the buyer is a busy GM, often non-technical, prepping "a session next Tuesday" (research R-Q4). Every surface task below cites **UX-STD** and must pass these eight checks in its runbook step:

- **UX-1 Plain words.** No jargon on any user surface. "Save a backup file to your computer," never "configure the FSA handle." Internal terms (IndexedDB, Worker, CLAMP) never appear in UI text.
- **UX-2 One obvious next action.** Every screen, modal, and empty state names exactly one primary action, visually dominant. A user who reads nothing else can still do the right thing.
- **UX-3 Empty states teach.** Every empty list = one sentence saying what this is for + one button that fills it (create one, or load the sample realm). In-file precedents to match: "No sessions logged yet. End a session to start the record." (L12758); Solo's empty-state line (L5285).
- **UX-4 Friendly failures.** Errors say what happened and what to do next, in human words — the file already does this well (L10200-03: "Invalid API key. Check Settings → Copilot."; Tonight's failure toast L12545). No codes, no blame, never silent (Rubric C4).
- **UX-5 Five-minute win, zero keys.** A brand-new user reaches a visible win — a coiled sample world, or a prep sheet — in under 5 minutes with no API key and no account. Onboarding never reappears for returning users (task P0.7).
- **UX-6 No nagging.** Nothing interrupts repeatedly. Reminders (backup, demo limits) appear at most once per session and always with a dismiss.
- **UX-7 Reversible, and says so.** Every world-changing action is undoable or review-before-apply, and the UI states it. Match the shipped copy: "You always pick or discard. Nothing is written until you accept." (L12041).
- **UX-8 Respect the table.** At-the-table surfaces (Run Mode) are single-screen, big targets, zero navigation, readable at arm's length in dim light.

**Onboarding addendum (Phase 3+):** the demo build's first screen must answer, without scrolling: what this is (one sentence), what to click first (one button), and what buying gets you (one line). No feature lists above the fold.

---

# 4. CROSS-CUTTING STANDARDS (referenceable rules)

- **CC-GROUND — The Grounding Rule** (VALUE-LEDGER §1.3): every AI-asserted world-fact carries a clickable entity citation (`[#8charId]`, `[NPC: name]`). The plumbing half-exists — context ledger rows already print `#${String(e.id).slice(0,8)}` (L9942-43, verified). Cited AI is checkable AI; this is the AI half's brand.
- **CC-DUAL — Dual-mode:** every kept feature works with AI OFF. Each task below marks its no-AI part and its AI part. The AI part is elevation, never the entry ticket.
- **CC-HALAL — Halal copy & content:** no gambling/maysir mechanics, no riba, no real-divination framing in copy; shipped example content clean (no occult packs, no astrology framing in calendar/festival content). Per Hunter's ruling (INDEX 2026-06-12): the Solo mechanic is clean and the **"oracle" name stays** — the anti-fate vocabulary below is a *market-default for NEW surfaces* (Sandtable says "project/model," never "foretell/fate/omen"), not a compliance retrofit of existing Solo copy.
- **CC-LM1 — Import whitelist landmine:** `buildNationFromSeed` builds nations from an explicit field list (L6342-6375, verified). Any NEW top-level nation field/array (`n.tables`, `n.pressArchive`, `n.turnLog`…) MUST be added to that list or it is **silently dropped on export→import**. Per-entity additions are safe — factions/chronicle/characters/artifacts spread `{...x}` (L6350/6352/6354/6355, verified). Sibling landmine: core-stat thresholds are rebuilt fresh from `CORE_STATS` on every import (L6386-6394, verified) — House-Rules must ship the `customized` flag (P5.1).
- **CC-LM2 — Visibility hard gate:** N1 Hold Audience, N6 Press, N7 Player Codex, the shareable turn card, and ANY player-facing artifact are hard-gated on P0.8 (`CLAMP.visibility`). A knowledge clamp over an unclamped field is theater.
- **CC-LM3 — Clone-pure compute:** projection/simulation compute (World Turn, Sandtable) must NOT call live `State.setStat` — it mutates state, dispatches renders, and persists (L6769-6788, verified). Compute runs on a deep clone (`JSON.parse(JSON.stringify(...))` precedent at L7015) and returns proposed changes.
- **CC-LM4 — Catastrophe label first:** front resolution hardcodes `type:'Military',weight:-10` (L7295, verified). P0.12 must land before any surface that prints turn output (P2.3, P3.7, N6).
- **CC-LIC — Universal honor-ware license:** one Cloudflare Worker, per-store verify adapters (Gumroad + itch.io + Lemon Squeezy), storefront-agnostic. The license gates **nothing functional and never safety** — it is a receipt + update entitlement + supporter status. Validation failures may only change cosmetic status text.
- **CC-ARCH — Architecture invariants:** single self-contained HTML file; offline-first; BYO-key (OpenRouter) or local Ollama; completion-not-rebuild. No servers in the product path except the optional license/demo Worker.
- **CC-SEC — Secrets discipline:** never commit secrets; Worker secrets via `wrangler secret put` + documented `.env.example`-style placeholders; every disk-bound serialization of app state goes through `_stateForPersist()` (L6604-6613, verified — its own comment mandates "every persistence sink," L6601-03).

## 4.5 EXISTING-FEATURE VERDICTS (Rubric B2 — keep / deepen / cut, with dual-mode spec)

| Feature (POSITION §5) | Verdict | No-AI depth | AI layer |
|---|---|---|---|
| Simulation engine (stats→thresholds→events, pressures) | **KEEP + DEEPEN** (it becomes autonomous) | World Turn P2.1, Heartbeat P2.6, House-Rules P5.1 | Turn narration P6.3 |
| Tonight generator | **KEEP + DEEPEN** | Tonight-Lite P3.1 (zero-key sheet — kills the key-wall L12480-82) | existing 3-step generate stays the elevation |
| LiveMode rail | **KEEP + FINISH** | heuristics engine already complete (L12251-12308) | fire the stub L12217 in P6.1 |
| Campaign prep-board | **KEEP** | full CRUD already shipped (L7313-38) | Notes get real generators P6.2 |
| Canon paste pipeline | **KEEP + FIX** | parser 4-pack P0.10; quick-chips P4.2 | Decipher (L10757) stays |
| Primary JSON export | **KEEP** (already complete/safe, L8846-58) | is the safety net | — |
| Foundry VTT export | **FREEZE** (per IDEAS §4.1) | label "legacy export" in UI copy (Haiku micro-task inside P3.5) | never completed — no thesis behind it |
| Story-Bible PDF | **DE-PRIORITIZE** (archival; Tonight-Lite covers play need) | revisit post-Phase 5 | — |
| Markdown/XSS sanitizer | **REPLACE** | P0.11 real DOMPurify (file's own ship-gate L3217-20) | — |
| Global search | **KEEP + DEEPEN** | deep-links + 4 missing types P6.6 | feeds CC-GROUND citation clicks |
| No-key demo proxy | **KEEP + CONFIGURE** | demo build P3.3 (Hunter ruling 2) | 5 capped AI uses |
| Onboarding/FrontDoor | **FIX** | P0.7 (gate broken — every launch is the pitch) | — |
| Solo (oracle) | **KEEP; swap table only** | original odds curve P1.3; name stays (ruling 1) | so1 narrative already shipped (L4932) |
| Relationship Web | **KEEP + FIX** | bind-once P1.5 (freeze bug) | ripple visualization stays DEFERRED (IDEAS §4.7) |
| Themes (Manuscript/Modern) | **KEEP, beta-labeled** | parity P6.7; Ember-first until then | — |
| Snapshots/migrations/recovery | **KEEP + HARDEN** | P6.10 (schema guard + reachable snapshot restore) | — |
| Sessions/hooks/secrets/fronts machinery | **KEEP** (the spine) | Run Mode P4.1 composes it | Season Brief P4.5 reads it |
| Multi-nation diplomacy sim, community marketplace, image-gen/TTS/multiplayer | **REJECTED** (stands — IDEAS §4.5/4.6, VALUE-LEDGER §2 filter) | — | — |

---

# 5. THE PHASES

Phase notation: each task = **ID · Title (size · executor)**. "Leaves product working" = Rubric B4 confirmation. All file refs are `realmwright-v7.html` unless stated.

---

## PHASE 0 — TRUST (nothing public until the exit gate passes)

**Plain-English goal:** make the product worthy of the word "trust" before any stranger sees it. Today it can write your AI key into a backup file, lose your world to a browser cleanup or a closed tab, silently revoke a paying customer's license on a bad server day, show every user the sales pitch forever, mangle pasted canon, and it can't sell on the stores we're allowed to use. All of that ends here.

**EXIT GATE (run it literally):** a hostile reviewer with DevTools (1) searches every file the app writes — backup, export, snapshot, localStorage — and finds no API key or credential; (2) edits the world and closes the tab instantly — nothing is lost; (3) simulates a license-server error (DevTools offline / 500) — the app never downgrades, never loses backups, shows honest status; (4) activates one Gumroad key, one itch.io key, and one Lemon Squeezy key against the Worker — all three activate; (5) pastes hostile canon (`'SECRET'` visibility, decimal deltas, re-paste, HTML) — nothing leaks, nothing doubles, nothing crashes, nothing executes.

### P0.1 — License never self-revokes on a server hiccup (S · **Opus 4.8**)
- **What & why:** today, any non-JSON or error reply from the license server flips a paying customer to "invalid" and stores it. One bad server day = a customer silently losing status. Money-trust bug #1.
- **Where (verified):** `_backgroundValidate` L6144-6158 — `const json=await res.json();` with no `res.ok` check (L6150); `this._data.valid=!!json.valid` (L6152); persisted (L6153); `license:expired` dispatched (L6154).
- **Exact change:** extract a pure decision helper on `LicenseGate`: `_decideValidity(resOk, json, currentValid)` → returns `{valid, fireExpired}` with rules: if `!resOk` → `{valid: currentValid, fireExpired:false}` (server problem ≠ customer problem); if `json && json.valid===false` explicitly → `{valid:false, fireExpired: currentValid}`; if `json && json.valid===true` → `{valid:true, fireExpired:false}`; malformed/absent `valid` field → keep `currentValid`, no event. Rewire L6150-54 through it (wrap `res.json()` in try → `null` on parse failure). Honor-ware note (CC-LIC): even when `valid` flips false, nothing functional changes anywhere (enforced by P0.3).
- **Standards:** CC-LIC, CC-SEC. **Depends:** —
- **Acceptance (Node, Rubric C2):** extract `_decideValidity` into `/tmp/p01.test.mjs`; assert: (ok=false, any body) keeps valid; (ok=true,{valid:false}) revokes + fires; (ok=true,{}) keeps; (ok=true,{valid:true}) validates; parse-failure keeps. 5/5 pass.
- **Leaves product working:** yes — pure tightening of one async handler; activation/deactivation paths untouched.

### P0.2 — License warnings actually visible + device token actually sent (S · **Opus 4.8**)
- **What & why:** two halves of the same lockout story. (a) The "license could not be verified" toast is invisible: it passes `duration=0` (L17239) and `showToast` removes on `setTimeout(…,duration)` (L8126) — the user is never warned. (b) `_hdr` promises in its comment to echo the device token (L6096-98) but sends none (L6099-6103), so every re-activate mints a fresh instance `'RealmWright-'+Date.now()` (L6112) toward the device-cap 403 (L6116-18).
- **Exact change:** (a) in `showToast` (L8126 region): treat `duration===0` as sticky — only set `_toastTimer` when `duration>0`. Audit of `0`-duration callsites confirms all three want sticky: AutoSave permission prompts L6298/L6305 and the license toast L17239. (b) in `_hdr` (L6099-6103): mirror `LicenseQueue.retryPost` (verified pattern L6047-49) — `const tok=await _readDeviceToken(); if(tok)h['X-Device-Token']=tok;`.
- **Standards:** CC-LIC, UX-4 (failure is visible and actionable — toast already carries a "Re-activate" button).
- **Depends:** — **Acceptance:** desktop runbook — (1) DevTools: dispatch `license:expired`; toast stays until dismissed/actioned; (2) Network tab: re-activation request carries `X-Device-Token` when a token exists in IDB.
- **Leaves product working:** yes — toast behavior change is opt-in by duration value; header addition is additive.

### P0.3 — Honor-ware: un-gate AutoSave from the license (S · **Opus 4.8**)
- **What & why:** the license currently gates exactly one functional thing — the user's own backup safety net (`if(!LicenseGate.isActive())return` L6261, verified; the other `isActive()` call sites are cosmetic: FrontDoor Turnstile hide L11273-75, status UI L17322). Paywalling safety is a trust inversion (CEO M3, ruling R5). Safety is never paywalled.
- **Exact change:** delete the license check at L6261; keep the sample-mode guard (L6262 `meta?._sampleMode`). Add one comment: `// Honor-ware (R5): safety is never license-gated.` Verify by grep that `LicenseGate.isActive()` call sites that remain affect only display.
- **Standards:** CC-LIC. **Depends:** — (P3.3's demo build separately disables persistence wholesale per Hunter ruling 2 — demo users still get no durable use; that gate lives in the demo build, not the license.)
- **Acceptance:** desktop runbook — fresh unlicensed profile, make 20 edits (AUTO_SAVE_THRESHOLD=20, L4678): backup setup toast appears; configure; `realmwright-backup.json` written.
- **Leaves product working:** yes — strictly widens who gets backups.

### P0.4 — AutoSave stops writing the API key to disk (S · **Opus 4.8**)
- **What & why:** the M1 critical. The scrubber `_stateForPersist()` protects persist/persistNow/snapshots/export — but `AutoSave._write` serializes **raw `State.data`** (`JSON.stringify(State.data,null,2)` L6302, verified) and so does `_fallbackDownload` (L6318, verified), while the live key is hydrated into `meta.settings.copilotKey` at load (L6638, L6666, verified). Licensed users' OpenRouter keys are sitting in the exact file they sync and share.
- **Exact change:** both sites serialize `_stateForPersist()` instead of `State.data`: L6302 → `JSON.stringify(_stateForPersist(),null,2)`; L6318 same. Two lines.
- **Standards:** CC-SEC (this *is* the rule). **Depends:** —
- **Acceptance (Node):** harness stubs minimal `State.data` with `meta.settings.copilotKey='sk-TEST'` + the copied `_stateForPersist` (L6604-13); assert `JSON.stringify(_stateForPersist())` contains no `sk-TEST` and `copilotKey:null`; assert raw `State.data` still holds the runtime key (no mutation). Then runbook: configure key + AutoSave, trigger 20 edits, open `realmwright-backup.json`, search the key → absent.
- **Leaves product working:** yes — backup file shape unchanged except the nulled key; restore path already tolerates `copilotKey:null` (re-hydrates from secret store, L6664-67).

### P0.5 — Ask the browser for durable storage + remember the answer (S · Fable 5)
- **What & why:** the M2 critical. Grep verified: zero `navigator.storage` calls. The whole world + snapshots live in best-effort IndexedDB + a localStorage mirror (L6737-46), which browsers may evict under disk pressure. "Yours forever" must be architecture-backed.
- **Exact change:** in `State.load()` (L6621 region), after data is ready, fire-and-forget: `if(navigator.storage&&navigator.storage.persist){navigator.storage.persisted().then(p=>p?null:navigator.storage.persist()).then(p=>{State._storagePersisted=!!p;}).catch(()=>{State._storagePersisted=null;});}` Store result on `State._storagePersisted` (`true`/`false`/`null`=unsupported). Surface minimally now: the save-state chip's `title` reads "Saved · storage protected" / "Saved · best-effort storage — set up a backup" (full Vault UI lands P2.7).
- **Standards:** CC-ARCH, UX-1 (plain words in the tooltip). **Depends:** —
- **Acceptance:** runbook — Chromium: `await navigator.storage.persisted()` in console returns true after first load (or the chip explains best-effort); Firefox: no crash, graceful `false` path.
- **Leaves product working:** yes — additive, failure-tolerant.

### P0.6 — No lost writes on tab close (S · Fable 5)
- **What & why:** edits in the last 400 ms before closing the tab are gone: `persist` is debounced 400 ms (L6727-48, verified), `persistNow` exists (L6749-55) but is wired to **no lifecycle event** (grep `pagehide` → zero; the only `visibilitychange` listener pauses the ambient canvas, L16657; `beforeunload` L17520-30 only warns about typed-but-unsent input).
- **Exact change:** next to the existing `beforeunload` listener (L17520), add: `window.addEventListener('pagehide',()=>{try{State.persistNow();}catch(e){}});` and `document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){try{State.persistNow();}catch(e){}}});`. Note: `persistNow`'s `localStorage.setItem` (L6754) is synchronous — the mirror always lands even if the async IDB write is cut short.
- **Standards:** CC-ARCH. **Depends:** —
- **Acceptance:** runbook — edit a stat, close the tab within ~200 ms, reopen: the edit survived (via mirror or IDB). Repeat with tab-switch (hidden) instead of close.
- **Leaves product working:** yes — additive listeners; debounced path unchanged.

### P0.7 — First-run gate finally closes (S · Fable 5)
- **What & why:** `firstRunComplete` is never set true (grep-complete: created `false` L6418, defaulted `false` L6452, read L17498) — so every launch, including for paying customers, opens the FrontDoor sales pitch, and the welcome-back branch (L17502-14) is dead code. Single worst onboarding bug.
- **Exact change:** in `FrontDoor.close()` (L11289) — the funnel every exit path passes through (Escape L11314, enter-workshop L11339, sample-mode L11405, recent-entry reopen L11456) — add: `if(State?.data?.meta&&!State.data.meta.firstRunComplete){State.data.meta.firstRunComplete=true;State.persistNow();}`.
- **Standards:** UX-5 (returning users open into their realm, not a pitch). **Depends:** —
- **Acceptance:** runbook — fresh profile: FrontDoor shows once; close it any way; reload → no FrontDoor, welcome-back toast fires after 10+ min idle (L17507 branch now reachable).
- **Leaves product working:** yes — one guarded flag write.

### P0.8 — CLAMP.visibility: secrets can no longer leak by casing (M · **Opus 4.8**)
- **What & why:** the secret-leak critical. `CLAMP` normalizes statValue/eventWeight/year/eventType — **no visibility** (L5863-69, verified). Raw values pass at parse (L8305: `visibility:p[3]||'public'`), at the AI tool path (L9667: `visibility:args.visibility||'public'`), and at import (chronicle map L6352 clamps weight/year/type only). Every render filter compares lowercase-exact (`==='private'` L7933, L8005, L14277, verified) → an event marked `'Private'` or `'SECRET'` renders to players. This is the load-bearing wall for N1/N6/N7 (CC-LM2).
- **Exact change:** (1) add to `CLAMP` (L5863-69): `visibility(v){const s=String(v==null?'':v).trim().toLowerCase();return ['public','private','forecast'].includes(s)?s:(s===''?'public':'private');}` — **fail-closed**: unknown non-empty values become `private` (an over-hidden event is an annoyance; an exposed secret is a trust bug); empty/absent stays `public` (the existing default). (2) Apply at all three boundaries: parser L8305 → `visibility:CLAMP.visibility(p[3]||'public')`; AI proposal L9667 → `visibility:CLAMP.visibility(args.visibility||'public')`; import chronicle map L6352 → add `visibility:CLAMP.visibility(e.visibility)` beside the existing clamps.
- **Standards:** CC-LM2 (this creates the gate), CC-SEC. **Depends:** —
- **Acceptance (Node):** copy `CLAMP` + the parser's event branch into `/tmp/p08.test.mjs`; assert: `'Private'`→`private`, `'SECRET'`→`private`, `'public '`→`public`, `'forecast'`→`forecast`, `''`/missing→`public`, `'公開'`→`private`. Then a fixture import round-trip: event with `'Private'` lands `private`.
- **Leaves product working:** yes — normalization only; existing lowercase data passes through unchanged.

### P0.9 — The Show-Secrets toggle actually does something (S · Fable 5)
- **What & why:** the toggle flips the setting but repaints only the legacy `chronicleBand`/`recentPulse` (L16280-85, verified) — and `setSetting` dispatches nothing (L7000-7005, verified) — so the default WorldShell layout never updates. The GM cannot trust what the screen hides.
- **Exact change:** in both the secrets toggle handler (L16280-85) and the forecasts toggle immediately above it (same pattern), replace the two manual repaints with `document.dispatchEvent(new CustomEvent('sc:changed',{detail:{fields:['stat','chronicle']}}));` — `dispatchRender` (L15689+) then repaints nationCard/pressures/recentPulse/chronicleBand AND WorldShell (L15710-11, verified "all themes") and refreshes open panels.
- **Standards:** UX-2. **Depends:** P0.8 (so what's hidden is also *correct*).
- **Acceptance:** runbook — default layout: add a private event; toggle Show Secrets on/off → WorldShell chronicle and open Secrets panel update both ways, no reload.
- **Leaves product working:** yes — swaps two narrow repaints for the standard render dispatch.

### P0.10 — Canon parser 4-pack: pasted canon stops being mangled (M · Fable 5, spec-pinned)
- **What & why:** four verified defects poison the data spine that feeds the whole simulation: (a) the prompt asks factions for 4 fields (`name|type|position|description`, CANON_SUFFIX L4795) but the parser keeps name and pipe-joins the rest into `desc` (L8307-09) while apply hardcodes `type:'Unknown',position:'holding'` (L8372) — AI-declared structure is destroyed; (b) decimal stat deltas fail integer-only regexes (L8293-94) and event weights truncate (`[+-]?\d+` first-match, L8304: −7.8→−7); (c) re-paste doubles events/characters/artifacts (no dedupe at L8368/L8374/L8375; only factions dedupe, L8371); (d) the apply loop is `try{…}finally{}` with no catch (L8355-77) — one malformed stored faction (name-less → TypeError at L8371's `f.name.toLowerCase()`) half-applies the batch and skips the final dispatch (L8378-82).
- **Exact change (one commit per letter is acceptable; all four = this task):**
  (a) parser L8307-09 → `candidates.push({type:'faction',name:p[0],facType:p[1]||'',position:p[2]||'',desc:p.slice(3).join(' | ')||''})`; apply L8372 → `type:(c.facType&&['Government','Opposition','Religious','Economic','Military'].includes(c.facType))?c.facType:'Unknown', position:['holding','gaining','losing','fragmenting'].includes((c.position||'').toLowerCase())?(c.position||'').toLowerCase():'holding'` (type allowlist mirrors `importFromText`'s contract L10597; unknown → safe defaults, never dropped). Back-compat: 2-part lines (`Name | description`) still parse — if `p[1]` matches neither allowlist treat `p.slice(1)` as desc.
  (b) stat regexes L8293-94 → `([+-]?\d+(?:\.\d+)?)`, `const delta=Math.round(parseFloat(m[2]))`; event weight L8304 → match `[+-]?\d+(?:\.\d+)?` and pass through `CLAMP.eventWeight` (already `Math.round`s, L5866).
  (c) dedupe mirrors of L8371: events — skip if same `name` (ci) AND same `year` exists; characters — same `name` (ci); artifacts — same `artType` + `content` exact. Each skip recorded and surfaced in the existing toast path (L8383-84 pattern): "skipped N duplicates."
  (d) wrap the per-candidate body (inside `candidates.forEach`, L8356-76) in try/catch pushing `{line:c.name||c.statName||'(unknown)',reason:e.message}` to a local `errors` array; guard L8371's dupe check with `(f.name||'')`; after the loop, surface `errors` via the same toast; the final dispatch (L8380-82) now always runs.
- **Standards:** CC-DUAL (parser is the no-AI half of the canon loop), Rubric C4 (skips/errors surfaced).
- **Depends:** P0.8 (parser edits touch adjacent lines; land P0.8 first, then re-locate by quoted code).
- **Acceptance (Node — the repo's proven harness style):** mock-State harness in `/tmp/p010.test.mjs` with copied `Parse` + `CLAMP`: (a) `Faction: The Veil | Religious | gaining | Shadow cult` → faction with type Religious, position gaining; 2-part line still works; (b) `Stat: Food +2.5` → +3 applied (note JS `Math.round(-2.5)===-2`, asserted, documented); `Event: X | Political | -7.8 | public | d` → weight −8; (c) apply same block twice → counts unchanged second time, "skipped" failures reported; (d) seed a stored name-less faction → apply completes, dispatch fired, error surfaced, remaining candidates applied.
- **Leaves product working:** yes — parser output shape is a superset; all 4 callsites already consume `detail:true` + failures (L10367/15965/15993/17430 per POSITION, re-confirmed at the Decipher callsite L17428-31 this session).

### P0.11 — Real DOMPurify replaces the fallback sanitizer (S · Fable 5)
- **What & why:** the file's own ship-gate: the inline fallback sanitizer "MUST be replaced before public release" (L3217-20, verified; fallback block L3223-3281, `version:'fallback'` L3279). Escape-first markdown (L5878) keeps current risk low — this closes it.
- **Exact change:** fetch official DOMPurify `dist/purify.min.js` (pin 3.x latest; record version + SHA in the commit message), paste between the PASTE markers (L3223/L3281) replacing the entire fallback IIFE. Single-file constraint preserved (inlined, ~22 KB).
- **Standards:** CC-ARCH, CC-SEC. **Depends:** —
- **Acceptance:** grep `version:'fallback'` → zero hits; runbook: DevTools `DOMPurify.version` prints the pinned version; paste `<img src=x onerror=alert(1)>` into a markdown-rendered field → inert.
- **Leaves product working:** yes — API surface identical (`DOMPurify.sanitize`).

### P0.12 — Fronts stop mislabeling their catastrophe (S · Fable 5)
- **What & why:** when any front's clock fills, the chronicle event hardcodes `type:'Military',weight:-10` (L7295, verified) — a plague or economic front resolves as "Military." Every turn-output surface (turn report, shareable card, Press) would print the lie (CC-LM4).
- **Exact change:** (1) `addFront` (L7250-58) gains `catastropheType:CLAMP.eventType(cfg.catastropheType)` (CLAMP defaults unknown→'Political', L5868 — for back-compat default to `'Military'` when `cfg.catastropheType` is absent: `cfg.catastropheType?CLAMP.eventType(cfg.catastropheType):'Military'`). (2) `tickFront` L7295 → `type:f.catastropheType||'Military'`. (3) Front editor form gains a labeled select over `CLAMP.EVENT_TYPES` (L5864), default Military. Import-safe: fronts pass whole (`fronts:seed.fronts||[]`, L6363) — extra field survives.
- **Standards:** CC-LM4 (this discharges it), UX-1 (label: "When this front resolves, the chronicle records it as…").
- **Depends:** — **Acceptance (Node):** mock-State harness: front with `catastropheType:'Natural'`, fill clock via copied `tickFront` logic → event type `Natural`; legacy front without the field → `Military`.
- **Leaves product working:** yes — additive optional field with the old value as default.

### P0.13 — THE UNIVERSAL LICENSE SYSTEM: one Worker, three stores (L · **Opus 4.8**) ★ launch blocker
- **What & why:** Hunter sells via Payoneer-compatible rails — itch.io (Hunter-verified), Gumroad, Lemon Squeezy, possibly more — so licensing must be storefront-agnostic (INDEX ruling, supersedes CEO R7's caution). Today the client supports LS + itch only (`_detectPlatform` L6093-95: UUID→lemonsqueezy else itchio; `_activateLS` L6108-28; `_activateItchio` L6130-42 → `WORKER_URL+'/verify'`), `LS_PRODUCT_ID=''` (L4663), and the Worker source is not in the repo (POSITION §8). Honor-ware throughout (CC-LIC).
- **Exact change:**
  **(Client)** extend the platform layer: `_detectPlatform` (L6093-95) → returns `'lemonsqueezy'` for canonical UUID (8-4-4-4-12 hex), `'gumroad'` for Gumroad's 8-8-8-8 hex block format (`/^[0-9A-F]{8}(-[0-9A-F]{8}){3}$/i`), else `'itchio'`; the Activate modal additionally offers explicit store chips (Gumroad / itch.io / Lemon Squeezy / Auto) so detection is never a guess the user can't override (UX-2). Add `_activateGumroad(key)` mirroring `_activateItchio` (L6130-42) against `WORKER_URL+'/api/license/gumroad/verify'`; `_backgroundValidate` (L6144-45) stays LS-only (Gumroad/itch keys verify once; no background revalidation — honor-ware), and its platform guard remains.
  **(Worker — NEW source files in repo `worker/`):** write the complete Cloudflare Worker from the verified client contract: `POST /api/license/activate` + `/api/license/validate` + `/api/license/deactivate` (LS proxy; client calls verified at L6113/L6148/L6071), `POST /verify` (itch.io download-key check; client call L6132), `POST /api/license/gumroad/verify` (calls `https://api.gumroad.com/v2/licenses/verify` with `product_id`+`license_key`, `increment_uses_count:false` on re-verify), `POST /api/demo/generate` (Turnstile verify + per-IP daily KV cap + global daily KV cap + OpenRouter call with the demo key; client call verified L6232-39), device-token mint/echo (client reads `json.device_token`, L6123/L6137). Secrets (`GUMROAD_PRODUCT_ID`, `LS_API_KEY`, `ITCH_API_KEY`, `OPENROUTER_DEMO_KEY`, `TURNSTILE_SECRET`) only via `wrangler secret put`; repo ships `worker/wrangler.toml` + `worker/README.md` with placeholder names (CC-SEC). Honor-ware rule encoded: no endpoint response can instruct the client to disable anything; validation failure returns status text only.
- **Standards:** CC-LIC, CC-SEC, UX-1/UX-4 (activation errors in plain words — match L6118/L6135's existing tone).
- **Depends:** P0.1 (decision logic), P0.2 (token echo). Hunter actions (§8): create the Gumroad product, set Turnstile keys, deploy Worker, paste `LS_PRODUCT_ID`/`TURNSTILE_SITEKEY` (L4663/L4665).
- **Acceptance:** (Node) Worker logic unit tests with mocked store APIs: each adapter's verify decision (valid key / invalid key / store 500 → "try again," never revoke); per-IP cap decrements and refuses at limit. (Runbook) one real key per store activates end-to-end; a store-API outage during validate leaves an activated client untouched (P0.1 behavior).
- **Leaves product working:** yes — client without a deployed Worker behaves exactly as today (network-error toasts, L6128/L6142); new paths are additive.

### P0.14 — Silent save failures surface (S · Haiku 4.5)
- **What & why:** `persistNow` swallows both write failures in empty catches (L6753-54, verified). If the disk write fails, the user must know (Rubric C4).
- **Exact change:** in both catches: `console.warn('[persist]',e)` and, once per session (module-level flag), `UI.setSave('error')` + the existing storage-error toast pattern (match L6746's copy: "Storage error — export your work to keep it safe." with Export action).
- **Standards:** UX-4. **Depends:** — **Acceptance:** runbook — DevTools: block IDB + fill localStorage quota; edit → error chip + toast appear once.
- **Leaves product working:** yes — additive logging/notification.

### P0.15 — Phase-0 exit-gate runbook (S · Fable 5; Hunter executes it)
- **What & why:** the gate above, written as a numbered click-through script a non-coder can run (extends `.audit/test/DESKTOP-RUNBOOK.md`). The phase is not done until Hunter (or an independent agent with a browser) checks every box.
- **Exact change:** append "PHASE 0 GATE" section to `.audit/test/DESKTOP-RUNBOOK.md` with the 5 gate scenarios as steps, each with expected result + screenshot slot.
- **Depends:** P0.1–P0.14. **Acceptance:** the checklist itself, fully checked. **Leaves product working:** n/a (doc).

---

## PHASE 1 — IDENTITY + GATES (nothing in the box violates our own standards)

**Plain-English goal:** decide who the product greets (GMs first), and clear the one legal exposure (a competitor's published table shipped verbatim) — while honoring Hunter's ruling that the "oracle" name and mechanic stay. Also fix the worst pre-public quality bug (a UI freeze).

**EXIT GATE:** a new save opens speaking GM language; grep finds no Mythic/Word Mill values or attribution; the Relationship Web survives drag + click without freezing; the box contains nothing that contradicts the file's own halal sweep standard *as ruled* (L4844 + Hunter ruling 1).

### P1.1 — GM-first default (S · Fable 5)
- **What & why:** the market buys "GM session-prep tools," not nation sims (R-Q10); the code defaults the other way: `gmMode:false` in `DEFAULT_SETTINGS` (L4736, verified). New saves should be GM-first; Strategist remains the alternate skin.
- **Exact change:** L4736 `gmMode:false` → `gmMode:true`. Existing saves are safe: the migration merge `{...DEFAULT_SETTINGS,...(d.meta.settings||{})}` (L6438) means any save migrated before this change already carries an explicit `gmMode` and keeps it; only genuinely new/keyless saves get `true`.
- **Standards:** UX-5. **Depends:** — **Acceptance:** runbook — fresh profile: GM vocabulary active (Term() swaps live, L5986-92); existing fixture save with `gmMode:false` stays Strategist.
- **Leaves product working:** yes — one default flip with verified migration safety.

### P1.2 — GM vocabulary on the front door (M · Fable 5)
- **What & why:** the sigil reads "Strategist / High Command" (L3452-53, verified) and `TERM_GM_MAP` is a 15-entry skin (L5970-85). The first screen must speak the buyer's words: "run a great session on 15 minutes of prep" (R-Q4/Q10).
- **Exact change:** (1) `GMMode.apply` (module verified at L13444; applied at boot L17493) sets the sigil text by mode — GM: title "Realm Keeper", sub "Game Master's Table" (default copy; Hunter may override, §8 item 5) — leaving the static HTML (L3452-53) as the Strategist variant. (2) Extend `TERM_GM_MAP` (L5970-85) with: `'War Room'→'Prep Room'`, `stat→'realm stat'`, plus capitalized variants (keys must exist in pairs per the map's own convention L5969). (3) FrontDoor headline copy → GM outcome language; demo CTA wording aligned with P3.3.
- **Standards:** UX-1/2/5, CC-HALAL (copy sweep on new strings). **Depends:** P1.1. **Acceptance:** runbook — both modes show coherent vocabulary end-to-end on: sigil, FrontDoor, nav, empty states.
- **Leaves product working:** yes — copy + one apply-path change.

### P1.3 — Original odds curve replaces the Mythic table (IP fix; name stays) (M · Fable 5)
- **What & why:** Solo ships Word Mill's published Mythic GME 2e fate-chart values with attribution ("reproduces the published d100 'Yes' ceiling values," L4999-5003; table L5006-16, verified). Shipping a competitor's published table in a paid product is the project's one legal exposure (IDEAS §1.d; CEO R1's IP half — proceeds under Hunter ruling 1; the **"oracle" name and surface copy stay**).
- **Exact change:** replace `_ODDS_THRESHOLDS` (L5006-16) + the attribution comment (L4999-5003) with an original generator: `_ceiling(oddsIdx,chaos)` = `clamp(Math.round(B[idx] + (cf-5)*S[idx]), 1, 99)` with original anchor array `B=[2,8,20,35,50,65,80,90,97]` and chaos-sensitivity `S=[1.5,3,4,4.5,5,4.5,4,3,1.5]` (values original to this project — same play *feel*: rarely-yes to nearly-always-yes, chaos widens "yes"). `_rollFateChart` (L5021-36) calls `_ceiling` instead of the table; keep d100, doubles→random-event (L5026-27), and the exceptional bands (L5029-30) — mechanics, not expression. Keep internal `oracleLog` field name (no migration). Future option (P5.1 spirit): expose the two arrays as user-editable data so Mythic veterans can enter their own numbers.
- **Standards:** CC-HALAL (ruling honored: name kept; this is IP only). **Depends:** —
- **Acceptance (Node):** `/tmp/p13.test.mjs` copies `_ceiling`: assert (1) monotonic non-decreasing in oddsIdx for every chaos 1-9; (2) monotonic non-decreasing in chaos for every oddsIdx; (3) bounds 1..99; (4) no row equals the Mythic row it replaces (literal diff against the old table, all 9 rows differ); (5) deterministic.
- **Leaves product working:** yes — same function signature, same result categories; logs/UI unchanged.

### P1.4 — Anti-fate vocabulary becomes the standard for NEW surfaces (S · Haiku 4.5)
- **What & why:** per Hunter's ruling, existing Solo/oracle copy stays. This task writes the *market-default* rule into the working docs so every new surface (Sandtable, Press, Almanac, Tables) ships with "project / model / the math says" vocabulary and never "foretell / fate / omen / prophecy" — it reads better to the halal-conscious *and* the secular buyer alike.
- **Exact change:** add the vocabulary rule + forbidden-word list to `CLAUDE.md`'s memory section (CC-HALAL already encodes it here; this mirrors it into permanent memory per the memory-routing rule).
- **Depends:** — **Acceptance:** the CLAUDE.md diff. **Leaves product working:** n/a (doc).

### P1.5 — Relationship Web: bind once, stop the freeze (S · Fable 5)
- **What & why:** verified freeze mechanism: `_render` adds a fresh background-click listener to the persistent `<svg>` on every call (L15394-99); `_render` runs per mousemove frame while dragging/panning (L15435, L15442); `svg.innerHTML` wipe (L15330) clears children but not the svg's own listeners → N listeners → click = N re-renders + N more listeners → synchronous storm. Must not reach a public demo.
- **Exact change:** move the `svg.addEventListener('click',…)` block (L15394-99) out of `_render` into the panel's one-time init (guard with a `_bgBound` flag on the svg element: `if(!svg._bgBound){svg._bgBound=true;svg.addEventListener(…)}` — resilient even if init runs twice).
- **Standards:** UX (no freezes). **Depends:** — **Acceptance:** runbook — open Web panel, drag 5s, pan 5s, click background 3× → instant response; DevTools `getEventListeners(svg).click.length === 1`.
- **Leaves product working:** yes — identical behavior, single listener.

---

## PHASE 2 — THE WEAPON (the pitch becomes true)

**Plain-English goal:** build the thing the whole strategy rests on — a world that takes its own turn between sessions, deterministically, with AI off — plus the surfaces that make it felt: the "While You Were Away" report, the "world moved" badge, the Heartbeat panel, the Vault status, and the Sandtable that war-games the same math. After this phase, "the world moves without you" is description, not marketing (CEO ruling R4 embargo lifts).

**EXIT GATE:** Node proves `worldTurn` deterministic (same input → same output, twice); ending a session with time advanced produces a vetoable report whose every line cites its rule; vetoing lines works; re-opening the app after a turn shows the badge; the Sandtable projects 8 turns on a clone while the real world provably does not change (export before = export after); the Vault chip tells the truth.

### P2.1 — `worldTurn()`: the clone-pure engine (L · **Opus 4.8**) ★ the flagship
- **What & why:** verified: no autonomous movement exists (`setStat` callers are slider L8166, canon L8362, AI tool L9748 — all user/AI-initiated; session save advances only `currentYear`, L12859-68). The engine is a consequence cascade awaiting a driver. This builds the driver as a **pure function** — Node-provable, and reusable unchanged by the Sandtable (CC-LM3).
- **Where (verified primitives it composes):** `checkThresholds` semantics L7612-45 (crossing rules L7622-23, 5-year dedupe L7625, front stat-triggers L7635-42); `tickFront` semantics L7282-7309 (clock L7288, resolution event L7291-7303 with P0.12's `catastropheType`); `PRESSURE_RULES` L4783-93; `CORE_STATS` thresholds L4753-81; faction `position` field L4807; front `linkedFactionIds` L7255; stat clamp bounds L6773.
- **Exact change:** new module (script section near Compute): `const WorldTurn={DRIFT_RULES:[…], compute(nationClone, elapsedDays, opts={})}` returning `{turns:[{label, seasonKey, deltas:[{statKey,delta,ruleId,ruleText}], events:[…], frontTicks:[{frontId,delta,reason}], resolved:[…]}], proposed:{statFinal:{key→value}, newEvents:[…], frontTicks:[…]}, capped:boolean}`. Rules: one turn per season elapsed (`elapsedDays/91.3125`, the 365.25 convention ÷4 — L12862 precedent), **hard cap 8 turns** (`capped:true` beyond); `DRIFT_RULES` = data-authored drifts keyed to `PRESSURE_RULES` ids (e.g. `food-crisis: food_production −2, legitimacy −1 per turn`; full table authored in-task, halal-clean prose, every entry carries `ruleText`); factions `position==='gaining'` tick their `linkedFactionIds`-matched fronts +1 per turn; thresholds re-evaluated against the clone after each turn's drifts using re-implemented pure crossing logic (same semantics as L7622-26 incl. the 5-year dedupe against the clone's chronicle); front fills append the catastrophe event (P0.12 type). **No `State.*` calls anywhere in compute. No RNG in v1** (fully deterministic; if randomness ever enters, seeded PRNG keyed to session id).
- **Standards:** CC-LM3 (constitutive), CC-DUAL (this *is* the no-AI half), CC-HALAL (drift prose cites rules, never fate), CC-LM4 (depends P0.12).
- **Depends:** P0.12. **Acceptance (Node — the phase's centerpiece test):** `/tmp/p21.test.mjs` with both seed realms (L4797-4809 shapes): (1) determinism — two runs, deep-equal output; (2) clamps — no stat exits [min,max]; (3) cap — 10 seasons elapsed → 8 turns + `capped`; (4) dedupe — a threshold event already in the chronicle within 5 years does not re-fire; (5) clone purity — input nation deep-equal before/after; (6) front fill emits event with the front's `catastropheType`; (7) every delta carries a resolvable `ruleId`.
- **Leaves product working:** yes — pure addition; nothing calls it yet (UI lands P2.3).

### P2.2 — Almanac-lite: seasons with names (S · Fable 5)
- **What & why:** verified: time is a bare `currentYear` float (L12859-68); no month/season model exists (grep). The first turn report must read "Turn of the Lean Winter, Year 1247," not "turn 3" (VALUE-LEDGER N9, Phase-2 slice).
- **Exact change:** const `ALMANAC={seasonsByEra:{default:['Thaw','High Sun','Harvest','Lean Winter'],…per-era variants…}, season(yearFloat,era)→{index,name}, turnLabel(yearFloat,era)→'Turn of the Lean Winter, Year 1247'}` using the fractional year (0–.25–.5–.75 quarters). Render the date line wherever the year shows in the turn report + War Room header. Shipped names are civic/seasonal fiction only — no zodiac/omen content (CC-HALAL). Editable per-era later via House-Rules (P5.1).
- **Depends:** — (P2.1 consumes it for labels). **Acceptance (Node):** season math — year 1247.0→index 0, 1247.25→1, .5→2, .75→3, 1247.99→3; label string exact-match.
- **Leaves product working:** yes — additive const + render join.

### P2.3 — "While You Were Away": the vetoable turn report (M · Fable 5)
- **What & why:** the report is where the GM *feels* the world move — and stays in charge: review line-by-line, veto anything, then commit. Every line shows its cause ("Food −2 — Lean Year: pressure active 2 turns") — the anti-"arbitrary" mitigation (IDEAS Idea 1 I7) and the halal frame (rules, never fate).
- **Exact change:** modal rendering `WorldTurn.compute` output grouped by turn (Almanac labels); per-line checkbox (default on); Commit applies accepted lines through existing State machinery under ONE undo snapshot — the `saveSession` suppression pattern verified at L12837-71 (`pushUndo` once, `_suppressUndo=true`, then `setStat` L6769 / `addEvent` L6789-99 / `tickFront` L7282 with `{by:'world-turn',silent:true}`, final single `sc:changed`). Stamp `session.turnAppliedAt` (double-apply guard, IDEAS I7-iv) and append `{at, summary, seen:false}` to `n.turnLog` — **whitelist `turnLog:seed.turnLog||[]` in `buildNationFromSeed` (L6342-75) in this same task (CC-LM1)**. Private/forecast events render with the GM-only badge styling (post-P0.8 the field is trustworthy).
- **Standards:** CC-LM1, CC-LM2, UX-7 ("Nothing changes until you accept" line, matching L12041's shipped copy), UX-2.
- **Depends:** P2.1, P2.2, P0.8. **Acceptance:** runbook — advance 2 seasons → report shows 2 labeled turns; veto one stat line → commit → that stat unchanged, others applied; Ctrl+Z reverts the whole turn; export→import round-trips `turnLog` (Node check on the whitelist).
- **Leaves product working:** yes — new modal; commit path reuses proven write methods.

### P2.4 — End Session → the world takes its turn (S · Fable 5)
- **What & why:** the loop-closer (CEO #4's "irreplaceable piece"). When a session is saved with time advanced, the turn should be one click away — and also available standalone for GMs who don't log sessions (IDEAS I7-iii).
- **Exact change:** (1) in `saveSession` after the toast (L12875), if `advanceDays>0` and no `turnAppliedAt` on the new session: toast action "Take the World Turn →" opening P2.3's modal with `elapsedDays=advanceDays`. (2) War Room gains an "Advance the World" action (explicit days/seasons picker) calling the same modal.
- **Standards:** UX-2/6 (offer once, never force). **Depends:** P2.3. **Acceptance:** runbook — end session with "1 season" → toast action opens report; standalone action works with no session.
- **Leaves product working:** yes — additive hooks.

### P2.5 — The "world moved" badge (S · Fable 5)
- **What & why:** the retention moment is the *badge on next open*, not the report (CEO #1): "While you were away: 2 events, 1 front advanced."
- **Exact change:** at bootstrap (after L17498's gate resolves to the returning-user branch), if the active nation's latest `turnLog` entry has `seen:false`: render a dismissible War-Room banner with the summary; click → opens the stored report; dismiss/open sets `seen:true` + persist.
- **Standards:** UX-2/6. **Depends:** P2.3. **Acceptance:** runbook — take a turn, reload → badge with correct counts; open → marked seen; reload → gone.
- **Leaves product working:** yes — additive banner.

### P2.6 — World Heartbeat: the imminence panel (M · Fable 5)
- **What & why:** first-hour wow (IDEAS Idea 8; CEO #3): a read-only top-3 of what is *about to* happen — thresholds within N points (pure compare vs `atValue/direction`, data L4753-81), fronts one tick from resolution (`clockFilled/clockSize` L7288), active pressures + the drift they'd cause next turn (reuses `WorldTurn.DRIFT_RULES` — build once). On the sample realm this is *the screenshot*.
- **Exact change:** `Compute.heartbeat(n)` pure selector → top-3 by severity {kind, text, distance, ruleText}; War-Room panel renders it; quiet-world fallback: "World stable — 3 pressures dormant" (itself information; IDEAS I7-ii). "What should I do about this?" button hands the item to the copilot (exists, L9346+) — the AI part, optional.
- **Standards:** CC-DUAL (selector = no-AI; copilot handoff = AI), UX-3, CC-HALAL ("approaching threshold," never prophecy).
- **Depends:** P2.1 (drift data). **Acceptance (Node):** selector on seed realm #1 (L4798-4807 values) returns deterministic top-3 with correct distances; cap respected. Runbook for render.
- **Leaves product working:** yes — read-only panel.

### P2.7 — Vault status: custody you can see (M · Fable 5)
- **What & why:** the CEO's Vault (§3 ADDED): make "own your data" checkable. One chip tells the truth: storage protected? backup configured? last backup when? — and the Firefox/Safari path stops being a download-spam design (L6316-24, verified) and becomes a respectful reminder.
- **Exact change:** (1) header/settings Vault chip composed from: `State._storagePersisted` (P0.5), `AutoSave._handle` presence + a new `AutoSave._lastWriteAt` stamp set in `_write` (L6293-6306), and `_supported` (L6254). States: "Protected — backed up 2 min ago" / "Backup ready — not yet written" / "No on-disk backup — set one up" / "Best-effort storage — export weekly" (non-Chromium). CTA → `setupPicker` (L6279) or Export. (2) Replace the every-20-actions auto-download for non-FSA browsers: `_triggerSave`'s `_fallbackDownload` branch (L6267) becomes a once-per-session reminder toast with an "Export now" action (manualSave path L6326-30 keeps the explicit download).
- **Standards:** UX-1/4/6, CC-ARCH. **Depends:** P0.3, P0.4, P0.5. **Acceptance:** runbook — all four chip states reachable (Chromium with/without handle; Firefox; storage denied); no unsolicited downloads anywhere.
- **Leaves product working:** yes — display + one branch swap; manual paths intact.

### P2.8 — Restore drill: prove the backup opens (S · Fable 5)
- **What & why:** "a backup nobody has tested is a story" (CEO Vault g). One screen: pick your backup file → dry-run parse → "This file contains 1 realm, 214 events, 12 NPCs — last saved {date}. Looks healthy." No write unless the user proceeds to the normal import.
- **Exact change:** Vault chip menu "Test my backup" → file input → `JSON.parse` + `migrateIfNeeded` on a **clone** (commitRestore precedent L7074-77, but no commit) → counts rendered via the `computeSnapshotDiff` entity list (L7036-47). Friendly failure: "This file isn't a RealmWright backup — it may be truncated. Try another."
- **Standards:** UX-4, CC-LM3 spirit (dry-run on clone). **Depends:** P2.7. **Acceptance:** runbook — healthy file → counts; corrupted file → friendly error; real state untouched (export-diff).
- **Leaves product working:** yes — read-only flow.

### P2.9 — N2 Sandtable: war-game the same math (M · Fable 5)
- **What & why:** co-flagship (VALUE-LEDGER N2). "If the party breaks the siege: Food +10, front −2 ticks — what happens over 4 turns?" Same `worldTurn` compute, run on a deep clone, rendered as a **diff with rule citations**. RippleForge's headline capability, done offline and deterministic (R-Q3/T2).
- **Exact change:** modal: hypothetical input (stat deltas via steppers; front tick adjustments), horizon slider 1–8; `const clone=JSON.parse(JSON.stringify(n))` (L7015 precedent) → apply hypothetical to clone → `WorldTurn.compute(clone, horizon*91.3125)` → render side-by-side diff vs an unmodified-baseline run (stats drifted, thresholds that would fire, fronts resolving, pressures appearing) — every line shows `ruleText`. Footer label: **"A projection, not a promise — the table decides."** Nothing writes; no Apply button in v1 (analysis-paralysis guard: no saved branches v1, per N2 I7-iii tightened). AI branch narration deferred to P6.3 (CC-DUAL: deterministic first).
- **Standards:** CC-LM3 (constitutive), CC-HALAL (projection vocabulary; forbidden: prophecy/foretell/destiny/fate/omen), CC-LM4, UX-1/7.
- **Depends:** P2.1, P0.12. **Acceptance (Node):** clone-purity — serialize real nation before/after a projection, byte-equal; same hypothetical twice → identical diff. Runbook for the surface + UX pass.
- **Leaves product working:** yes — read-only modal over a pure function.

---

## PHASE 3 — LAUNCH ($19 / 30-day window opens when this phase's gate passes)

**Plain-English goal:** a stranger can feel the product in 90 seconds and buy it in two clicks. The demo build follows Hunter's ruling exactly: 5 AI tastes on Hunter's key, all no-AI tools open for tasting, and **no export, no persistence, no regular-use path** — buying is required for real use even with AI off. Tonight finally works with zero keys. The store speaks GM.

**EXIT GATE:** on a clean machine: open the demo → see a coiled world (Heartbeat) → one click → a usable prep sheet (Tonight-Lite) → end a fake session → watch the world take its turn → hit the edges (no export, changes don't survive reload, AI stops at 5) → click through to a store page and complete a $19 purchase → the key activates the full build. Total under 5 minutes (UX-5).

### P3.1 — Tonight-Lite: the zero-key prep sheet (M · Fable 5)
- **What & why:** the headline prep surface currently refuses to work without a key ("Configure your OpenRouter API key in Settings first," L12480-82, verified) — the moat's most embarrassing contradiction (IDEAS Idea 2). Tonight-Lite assembles tonight's one-pager purely from canon, and the with/without-AI toggle *is* the dual-mode demo.
- **Where (verified hooks):** output shape `{title,tagline,hooks,npcs,secrets,tensions}` (L10828-36); renderer `renderSessionPrepPDF` (L9205); hook priority sort (`_sortByPriority`, L13781-88); undeployed secrets (status machinery L7196/L7227-35); pressures (`Compute.pressures` consumed L7651); fronts nearest resolution (L7288); NPC drive/fear (L6949-55); most-pressed-stat sort (L9261-64); sample realms (L11126/L11128/L11130) + SampleMode (L11133).
- **Exact change:** pure `TonightLite.assemble(n)` → same shape as L10828-36: title from realm+season (P2.2), top-3 open hooks by priority, up to 3 undeployed secrets, active pressures as `tensions` paragraph (deterministic concatenation of rule texts), top-3 NPCs (active, with drive/fear → run-card lines — absorbing killed Idea 5's card render per CEO), most-pressed stat + nearest front as the "watch" block. Surface: in Tonight, replace the hard key-gate (L12480-82) with a mode toggle — "Instant sheet (no AI)" always available; "AI session pack" when configured. Thinness detector: <2 hooks AND 0 secrets → banner "Your realm is thin — seed it, or load the sample realm" (UX-3) with sample CTA. Recency rotation: stamp `lastPrepAt` on surfaced items, exclude last sheet's picks (IDEAS I7-ii).
- **Standards:** CC-DUAL (constitutive), CC-LM2 (sheet includes GM-only items — it is a GM artifact; the player-safe artifact is N7), UX-2/3/5, CC-HALAL.
- **Depends:** P2.2 (season title), P0.8. **Acceptance (Node):** assembler on the solo sample realm fixture (3 sessions, L11128) returns deterministic sheet matching the shape contract; thinness path on an empty fixture. Runbook: zero-key profile → open Tonight → sheet in one click → print via L9205 renderer.
- **Leaves product working:** yes — the AI path is untouched; the gate becomes a fork.

### P3.2 — Provider-aware key copy (S · Haiku 4.5)
- **What & why:** the residual key-wall toast names OpenRouter even when the provider is Ollama (`isConfigured` returns true keyless for Ollama, L9369-71, verified; toast L12481). Post-P3.1 the wall is gone; remaining copy must not lie.
- **Exact change:** anywhere the "configure your OpenRouter API key" string appears for gating AI actions, branch: provider `ollama` → "Start Ollama (Settings → Local AI) to use AI features." Per CEO R9, settings copy for local AI says "setup guide," never "plug-and-play," until the file:// CORS question is runbook-verified.
- **Depends:** P3.1. **Acceptance:** runbook — provider=ollama, Ollama stopped: AI actions show the Ollama copy. **Leaves product working:** yes — copy only.

### P3.3 — THE DEMO BUILD (Hunter's ruling 2, exactly) (L · **Opus 4.8**)
- **What & why:** one demo build that proves quality and cannot be lived in: (a) 5 AI uses on Hunter's Worker key — `DEMO_MESSAGE_LIMIT=5` already (L4677, verified) + Turnstile + per-IP cap (Worker, P0.13); (b) every no-AI tool open for tasting; (c) **no export/download, no persistence, no regular-use path** — buying required even for no-AI use.
- **Exact change:** build script `scripts/build-demo.mjs` producing `realmwright-demo.html` from the canonical file by: (1) injecting `const DEMO_BUILD=true;` beside L4663; (2) setting `TURNSTILE_SITEKEY` (L4665) to the real public sitekey (safe to embed per the file's own comment); (3) persistence: force the sample-mode semantics globally — the cleanest verified lever: `persist` and `persistNow` already no-op when `meta._sampleMode` (L6728, L6750); demo build sets `_sampleMode=true` on every state and skips snapshots/AutoSave (gate `AutoSave.tick` L6260 and `snapshotIfDue` L7008 on `DEMO_BUILD`); (4) export surfaces: `exportJSON` (L8846), PDF/print buttons, Foundry export, and P3.4's Codex all gate on `DEMO_BUILD` → friendly toast "The demo doesn't save or export — own RealmWright for $19 and everything works forever." (UX-4, honest, one line); (5) persistent demo banner: "Demo — your changes vanish on reload. 3 of 5 AI tastes left." with buy link; (6) AI path routes through the existing `Demo` proxy (L6203-48; single-use Turnstile token L6242-44) when no BYO key. Acceptance criteria are the ruling's three clauses, verbatim.
- **Standards:** CC-LIC (the paid build itself stays honor-ware; the DEMO build is the line), UX-1/2/4/6, CC-SEC (no keys in the demo file — Worker holds the demo key; grep the artifact).
- **Depends:** P0.13 (Worker live), P3.1 (the tasting centerpiece), P2.x (the weapon is the demo's third act). Hunter actions: Turnstile keys, demo-spend caps (§8 item 2).
- **Acceptance:** runbook on the built artifact — reload wipes changes; every export path refuses with the friendly line; 6th AI use refused client-side AND Worker-side (DevTools counter reset still refused — L6184-86's design, now real); grep artifact for `sk-` and the Worker key → absent.
- **Leaves product working:** yes — the canonical file is untouched; the demo is a build artifact.

### P3.4 — N7 Player Codex: hand your players a world file (M · Fable 5)
- **What & why:** one click exports a read-only, player-safe HTML codex — public chronicle, factions, locations, characters, player-known open hooks — everything `private`/`forecast` and ALL GM secrets excluded by construction. The rented alternative is a wiki sub so players can browse ($90–105/yr, R-Q2). The ownership thesis, extended to the table. **Hard-gated on P0.8** (CC-LM2) — and its showcase.
- **Exact change:** pure `Codex.assemble(n)` → `{included:{…}, withheld:{privateEvents:N, forecasts:N, secrets:N}}` using the verified filter semantics (`e.visibility==='private'` exclusion — L7933's logic, post-P0.8 trustworthy) and excluding the `secrets` array entirely plus NPC `plotSeeds`; pre-export diff screen: "47 public events included · 9 private + 2 forecast withheld · all secrets withheld — review withheld list" (N7 I7-ii); render to a single static HTML string (inline CSS, no JS needed) with generation date + "Ask your GM for the latest" footer; Blob download via the `exportJSON` mechanics (L8846-58). Optional AI rewrite margin: deferred (declared N/A — floor feature).
- **Standards:** CC-LM2 (constitutive), CC-DUAL (declared no-AI exception, per N7 I3), UX-1/2, CC-SEC.
- **Depends:** P0.8, P0.9. **Acceptance (Node — the leak test):** fixture with mixed visibilities incl. `'Private'`-cased input → assembled HTML string contains zero private/forecast descriptions, zero secret titles/contents, zero plotSeeds; withheld counts exact. Runbook: open the file offline in a clean browser.
- **Leaves product working:** yes — pure export.

### P3.5 — Store pages + copy pack (M · Fable 5; Haiku for label micro-tasks)
- **What & why:** the words that sell it, consistent with every ruling: GM vocabulary; ownership proof ("your world is a file on your disk — we can prove it"); demo-first; **"$19 early-supporter — first 30 days, then $29"** labeled honestly (ruling 3); the value frame is *"what you'd rent for ~$345/yr — owned"* with the itemized rental table (VALUE-LEDGER §3.0) and **never the string "$229"** (C-M6c); BYO-key disclosure stated plainly (§3.0 binding disclosure); piracy-aware tone (no DRM claims). Includes the "legacy export" label task for Foundry (§4.5).
- **Exact change:** new `store/` directory: `gumroad.md`, `itch.md`, `lemonsqueezy.md` (shared body, per-store CTA), screenshot shot-list (Heartbeat on sample realm; turn report; Sandtable diff; Codex in hand), FAQ (offline? key? refunds? updates?). Plus the in-app Foundry "legacy export" label (Haiku).
- **Standards:** CC-HALAL, CC-LIC, UX-1. **Depends:** P2.x screenshots, P3.3. **Acceptance:** checklist — no "$229" anywhere (grep), pricing window labeled, BYO-key disclosed, all claims true of the shipped build (each claim row cites the task that made it true).
- **Leaves product working:** n/a (copy artifacts).

### P3.6 — Demo instrumentation (S · Fable 5)
- **What & why:** R8: the demo is the instrument — count opens, sheet generations, turn-takes, buy-clicks. Demo build only; the paid build never phones home (trust line).
- **Exact change:** in the demo build path only (`DEMO_BUILD` guard): `navigator.sendBeacon(WORKER_URL+'/api/metrics', JSON.stringify({e:name}))` for the four events; Worker `/api/metrics` increments KV counters (no IP stored, no payload beyond the event name — privacy-clean by construction). Store-page buy links carry per-store ref params.
- **Standards:** CC-SEC, trust posture. **Depends:** P3.3, P0.13. **Acceptance:** runbook — demo fires beacons (Network tab); paid build: grep `sendBeacon` path is `DEMO_BUILD`-gated; Worker counters increment.
- **Leaves product working:** yes — demo-only additive.

### P3.7 — Shareable turn-report card (S · Fable 5)
- **What & why:** the viral artifact (CEO #1): a GM posts "look what my world did between sessions." One click on a turn report → a styled card image with a small RealmWright footer. **Public lines only** (CC-LM2).
- **Exact change:** "Share as card" on the P2.3 report: filter to `visibility==='public'` lines (post-P0.8), render an offscreen styled div (Almanac turn label as the headline, 3–6 best lines with rule citations), rasterize via canvas (inline, dependency-free: draw text directly on a 1200×675 canvas — no html2canvas import) → PNG download.
- **Standards:** CC-LM2, CC-LM4, CC-HALAL (rule citations make fate-framing structurally impossible), UX-2.
- **Depends:** P2.3, P0.8. **Acceptance:** runbook — card downloads; a private event in the same turn does NOT appear (the leak check); footer present.
- **Leaves product working:** yes — additive export.

---

## PHASE 4 — HABIT (the weekly loop)

**Plain-English goal:** make RealmWright the thing a GM opens every week: run the session inside it (Run Mode), end the session in one button, watch the world turn, and get next week's artifacts (recap, brief) computed from what actually happened.

**EXIT GATE:** one full fictional week round-trips inside the product: prep sheet → Run Mode session (clocks tick, secrets delivered, dice rolled) → End Session → World Turn → badge next open → "previously on" recap prints → Season Brief shows real trends from ≥3 sessions.

### P4.1 — Run Mode v1: the at-the-table cockpit (L · Fable 5)
- **What & why:** the largest UI lift, deliberately after revenue can exist (CEO #4 scope-cut pre-authorized): **clocks + secret bank + dice + End Session only** (beats/NPC rail v1.1). Composes verified machinery: campaign clocks (`cpSetClockSeg` etc., L7316-20), secret bank with delivered toggles (L7333-37), dice (extend `_rollD100/_rollD10` L5018-19 to d4/d6/d8/d10/d12/d20 — task-resolution randomness in fiction, no stakes: not maysir), and the big End Session button → the existing structured save (`saveSession` L12819-77) → P2.4 handoff.
- **Exact change:** full-screen view (Tonight-overlay pattern, L17727 region precedent): three columns — clocks / secret bank / dice+log; one End Session button; `LiveMode.markSessionStart()` (L12224-26) on open so the idle-clock heuristic works; the deterministic LiveMode rail (L12251-12308) renders if Campaign data exists (local-first per L12309-11). Strict single screen, zero nav, collapse-to-dice mode (UX-8).
- **Standards:** UX-8 (constitutive), CC-DUAL (everything works keyless; AI fire is P6.1), CC-HALAL.
- **Depends:** P2.4. **Acceptance:** runbook — run a 10-minute fake session start-to-finish without leaving the screen; End Session produces the session record + turn offer; dim-light readability pass.
- **Leaves product working:** yes — new surface over shipped CRUD.

### P4.2 — Canon quick-chips: one tap from summary to chronicle (S · Fable 5)
- **What & why:** close the no-AI half of the canon loop (IDEAS Idea 7): after End Session, each summary line becomes a chip — tap → pre-filled event (via `addEvent` L6789-99) with review-before-apply.
- **Exact change:** post-save panel listing summary sentences (split on newline/period) as chips; tap → the existing inscribe/event form pre-filled (name=first 6 words, description=line, visibility default `public`, type default Political); nothing auto-commits (UX-7).
- **Standards:** CC-DUAL (this is the no-AI ingestion path; Decipher L10757-92 is the AI twin), UX-7.
- **Depends:** P4.1, P0.10. **Acceptance:** runbook — 3-line summary → 3 chips → 2 inscribed events, 1 dismissed.
- **Leaves product working:** yes — additive panel.

### P4.3 — N6 Press recap: "Previously on…" (M · Fable 5)
- **What & why:** the weekly habit artifact (VALUE-LEDGER N6a): a printable recap assembled deterministically from the last session record (title/summary/hooks closed-opened/NPCs appeared — fields verified L7109-20) + **public-only** events since (the Story-Bible PDF's own filter semantics, L8966-72's `incSecrets` logic inverted to public-only), printed via the proven print-container pattern (`renderSessionPrepPDF` L9205 shape). Player-safe by construction.
- **Exact change:** pure `Press.recap(n)` → {sessionBlock, publicEventsSince, openThreads}; one parchment-clean print template v1 (3 templates by P6); archive entries appended to `n.pressArchive` — **whitelist `pressArchive:seed.pressArchive||[]` in `buildNationFromSeed` (L6342-75) in this task (CC-LM1, named landmine)**. Mandatory GM preview before print (N6 I7-i). AI era-voice prose: P6 (deterministic facts first, AI prose optional below — N6 I7-iii).
- **Standards:** CC-LM1, CC-LM2 (hard gate P0.8), CC-DUAL, UX-1/2, CC-HALAL (civic document types only).
- **Depends:** P0.8, P4.1 (session data faucet). **Acceptance (Node):** recap on the solo sample (3 sessions, L11128) excludes its private events (the sealed-warrants event, L11128 fixture) — leak test; whitelist round-trip. Runbook: print preview.
- **Leaves product working:** yes — pure assembly + print.

### P4.4 — N4 Season Brief: the showrunner's dashboard (M · Fable 5)
- **What & why:** pacing is the #1 confirmed pain (R-Q4); only this product has the data: sessions array (L7109-20), hook lineage `raisedInSession/closedInSession` (L7159-60), front `ticks[]` with `sessionId` (L7290), secrets deployment (L7196-97/L7227-35). Deterministic metrics; one optional AI "dramatic read."
- **Exact change:** pure `Brief.metrics(n)` → hooks opened-vs-closed trend, fronts static ≥3 sessions, NPCs unseen ≥N sessions (vs `npcsAppeared` L7117), secrets aging undeployed, faction screen-time share; renders in the Sessions panel (`renderSessions` L12754). Degrades gracefully: <3 sessions → "Log 2 more sessions to unlock trends" (N4 I7-i, UX-3). AI part: one `buildContext`+metrics-block call returning ≤3 escalation options *as questions*, each citing the entities it uses (CC-GROUND; options-as-questions per N4 I7-ii).
- **Standards:** CC-DUAL (marked: metrics no-AI / read AI), CC-GROUND, CC-HALAL ("the math says this thread is cold," never destiny).
- **Depends:** P4.1. **Acceptance (Node):** metrics on the 3-session sample fixture produce hand-computed expected values; small-N guard returns the unlock message.
- **Leaves product working:** yes — additive panel section.

### P4.5 — N3 Whisper Ledger v1: who has heard the news (M · Fable 5)
- **What & why:** deterministic knowledge layer, v1 deliberately tiny (N3 I7-iii: tiers + ONE rule, frozen): each public event gains `knownBy` tiers; each World Turn spreads public events one hop outward from `happenedAtLocationId` (field verified in editor capture L16043 and renders L13236/L14306) through the location tree (`parentId` L7379) and along faction lines (`controllingFactionName` L7381, `factionId` L6953); `private` never spreads unless the GM leaks it. Turn report gains "Who knows?" lines; feeds N1's dossiers later.
- **Exact change:** per-event field `e.knownBy={tier:'local'|'regional'|'common', leakedTo:[]}` — per-entity field rides the `{...e}` spread (L6352, verified import-safe; no whitelist change needed); pure `Whisper.spread(clone)` runs inside `WorldTurn.compute` (one rule: local→regional→common, one hop per turn); inspector line in the P2.3 report; per-event override + veto like every turn line (N3 I7-ii). Fully automatic defaults — the GM only touches it to leak a secret (N3 I7-i).
- **Standards:** CC-LM3 (runs in the clone), CC-DUAL (AI rumor-voicing deferred to P6/T3), CC-HALAL (rumor = fictional social information).
- **Depends:** P2.1, P2.3. **Acceptance (Node):** fixture location tree: event at a leaf reaches `common` in exactly 2 turns; private event never spreads; determinism.
- **Leaves product working:** yes — additive field + turn-report lines.

---

## PHASE 5 — DEPTH (price → $29 base when this ships; $49 tier = Hunter's call)

**Plain-English goal:** the buyer now owns the *rules*, not just the data (House-Rules), gets the anti-chatbot flagship (Hold Audience — NPCs that provably can't reveal what they don't know), the third engine leg (state-aware random tables), a canon auditor, talk-to-build onboarding, and bring-your-existing-campaign intake.

**EXIT GATE:** a user edits a core threshold, exports, imports — the edit survives (the landmine test); the spymaster NPC, asked about an ungranted secret, demonstrably has no access to it (Node-proven dossier + runbook probe); a rumor table rolls differently when Food crosses 40; the lint finds 5 seeded continuity errors in a fixture; markdown intake builds a realm offline.

### P5.1 — House-Rules engine + the import-overwrite landmine fix (L · **Opus 4.8**)
- **What & why:** edit thresholds/pressures/drift — the deepest "$49 without AI" signal (IDEAS Idea 4). **The landmine is mandatory:** `buildNationFromSeed` rebuilds core-stat thresholds fresh from `CORE_STATS` on every import "so any threshold updates flow into existing nations" (L6386-94, verified) — user-edited thresholds would be silently wiped on export→import. Custom stats are created with `thresholds:[]` and no editor (L6902, verified).
- **Exact change:** (1) editor (forms-over-data) for the exact threshold shape `{atValue,direction,eventName,eventDesc,eventWeight,eventType}` (L4753-81) on core + custom stats; custom pressure rules (condition templates: stat X above/below V → prose); drift-rule editor over `WorldTurn.DRIFT_RULES`; (2) **landmine fix:** editing any core stat's thresholds sets `stat.customized=true`; in `buildNationFromSeed`'s CORE_STATS loop (L6387-96), when `fullFormat && isFullStat(seedStats[c.key]) && seedStats[c.key].customized` → deep-copy the seed's thresholds + keep the flag instead of rebuilding; (3) live preview: "fires at Food<40 — Food is 44 now" (IDEAS I7-ii); engine needs zero changes — `checkThresholds` reads the data generically (L7619-32, verified).
- **Standards:** CC-LM1 (sibling landmine, discharged), CC-DUAL (editor = no-AI; "draft thresholds for a 'Faith' stat" generator into review = AI), UX-3 (presets first, blank editor second), CC-HALAL (preset content clean).
- **Depends:** P2.1 (drift rules exist to edit). **Acceptance (Node — the landmine test):** fixture: edit legitimacy threshold atValue 30→25 (+flag) → export shape → `buildNationFromSeed` → 25 survives; un-customized stat picks up a changed `CORE_STATS` value (the rebuild's purpose preserved). Runbook: editor flow + preview.
- **Leaves product working:** yes — additive editor; default data untouched.

### P5.2 — First preset packs (S · Fable 5; content Haiku-draftable, halal-reviewed)
- **What & why:** the pack line (CEO #6 S+): "Plague Year," "Succession Crisis," "Trade War" as pure data (drift rules + pressures + thresholds + table entries) loadable through House-Rules; later sold as $9–15 add-ons — first-party only (marketplace stays REJECTED).
- **Exact change:** pack JSON format `{name, version, thresholds?, pressures?, driftRules?, tables?}` + import-with-review UI; 3 packs shipped in-box as samples; halal review per CC-HALAL recorded in the pack file header.
- **Depends:** P5.1 (+P5.4 for table entries). **Acceptance:** load each pack → preview diff → apply → World Turn uses the new rules (Node: drift output changes accordingly).
- **Leaves product working:** yes — data + review flow.

### P5.3 — N1 HOLD AUDIENCE: the anti-chatbot flagship (L · **Opus 4.8**)
- **What & why:** in-character NPC conversation **clamped by a deterministic dossier** — the engine compiles what this NPC knows *before* any AI call; the model can't reveal what it was never given. The rented category runs €96–$180/yr (R-Q1); ours is private, persistent, and provably ignorant of your secrets. The $35 ledger line — the price move's headline.
- **Where (verified hooks):** NPC fields `drive/fear/role/status/factionId/basedInLocationId` (L6949-60); faction position/interest (L4807); public-only filter semantics (L7933, post-P0.8); location bias via `happenedAtLocationId` (L14306); secrets grants over the secrets array (fields L7192-7202); chat loop `streamOnce` (L10187); context builder `buildContext` (L9882) — which today includes ALL secrets (L9958-61) and tags private events (L9933), so the dossier must be a **separate restricted compile, never `buildContext`**; per-NPC persistence rides `{...c}` spread (L6354, import-safe); Decipher handoff (L10757-92); voice precedent: the letter generator already writes from drive/fear (L10720).
- **Exact change:** (1) pure `Audience.dossier(n, npcId, grants[])` → {identity, drives/fears, faction stance, **public** events only — biased to the NPC's location, granted secrets only (default NONE — N1 I7-i), prior transcript} rendered first as the printable **"What X knows" card** (the no-AI value); (2) chat: persona system prompt built from the dossier ONLY + `streamOnce` loop; per-NPC log `c.audienceLog=[]`; (3) GM margin shows grants + entity citations for world-facts (CC-GROUND); (4) "Make it canon" → transcript → Decipher → CANON review (nothing auto-commits, N1 I7-iv); (5) deceased NPCs: surface label "Portray from the chronicle" — roleplay of fictional persons, no séance framing, rule written into the prompt header the way L4844 does (N1 I6); (6) cost: existing per-message estimate surfaces (L9373-9403) + suggest haiku-class for talk (N1 I7-ii).
- **Standards:** CC-LM2 (hard gate, constitutive), CC-GROUND, CC-DUAL (dossier card = no-AI; chat = AI), CC-HALAL, UX-1/7.
- **Depends:** P0.8 (wall), P0.9; enriched by P4.5 (knownBy feeds the dossier when present). **Acceptance (Node — the flagship test):** fixture with private events + 2 secrets, grant 1: dossier string contains zero private/forecast event text, contains granted secret, not the other; determinism. Runbook probe: ask the spymaster about the ungranted secret → the model cannot quote it (its prompt provably lacks it — assert on the built prompt, not the model's mood).
- **Leaves product working:** yes — new surface; the copilot is untouched.

### P5.4 — N8 Table Engine: tables that read the world (M · Fable 5)
- **What & why:** the engine's third leg (grep-verified absent): tables as data `{name, die, entries:[{range, text, conditions?}]}` where entries may carry world-state conditions (stat band / pressure-active / season) — the same table rolls differently as the world moves. Gives Solo its "what happens?" muscle without changing its framing.
- **Exact change:** roller = pure fn over `_rollD100/_rollD10` (L5018-19) + condition gate (conditions limited to: stat band, pressure-active, season — v1 frozen, N8 I7-ii); storage `n.tables` — **whitelist in `buildNationFromSeed` (L6342-75) in this task (CC-LM1, named landmine)**; editor = House-Rules forms (P5.1 pattern); 6–8 shipped packs (rumors, weather, names, market prices, complications — meteorological/civic fiction, no occult packs, naming rule: never "fortune/omen/fate table"); AI authoring: one generator returning the editable data shape through the JSON-parse pattern (L10674-80 precedent) into review.
- **Standards:** CC-LM1, CC-DUAL, CC-HALAL (no-maysir analysis: no stakes; naming rules), UX-3 (packs first).
- **Depends:** P5.1 (editor), P2.2 (season condition). **Acceptance (Node):** roller distribution over 10k rolls ≈ uniform per range; condition gating flips entries when Food crosses a band; import round-trip preserves `n.tables`.
- **Leaves product working:** yes — additive system.

### P5.5 — N5 Continuity Sweep: audit with receipts (M · Fable 5)
- **What & why:** extends the verified one-event check (`checkContinuity` L10543-72; verdict-only by design L10555, surface rule L10038) into (a) a deterministic whole-world lint and (b) a chunked AI semantic pass with resolvable citations — the thing a stateless chatbot cannot do (C-M6a).
- **Exact change:** (a) pure `Lint.run(n)` → findings for: dangling `factionId`/`basedInLocationId`/`happenedAtLocationId` refs; deceased NPCs (status L6956) in later sessions' `npcsAppeared` (L7117); event years violating `ERA_GAP` plausibility (L4749); hooks `closedInSession` pointing at nonexistent sessions (L7160); secrets `deployed` without `deployedInSession` (L7196-97/L7231); orphaned `relatedNpcs` on secrets (L7198). Severity tiers + dismiss-and-remember (LiveMode's dismissed-keys precedent, L12305-06). (b) AI pass: loop the `checkContinuity` pattern over 100-event chunks (cap precedent L7653-55) at `continuityTier` (L4744); findings cite `[#id]` (CC-GROUND; plumbing L9942-43); cost preview before run; fixes only via CANON review, verdict-only default.
- **Standards:** CC-GROUND, CC-DUAL (lint = no-AI), UX-4/6 (dismissable, never nags).
- **Depends:** P0.10 (clean canon in), P6.6 helps citations resolve but plain panel-open suffices for v1. **Acceptance (Node):** fixture seeded with exactly 6 known defects → lint finds all 6, zero false positives on the clean sample realm.
- **Leaves product working:** yes — read-only audit + review-gated fixes.

### P5.6 — N11 World Interview: onboarding by conversation (M · Fable 5)
- **What & why:** "tell me about your world" — one question at a time, answers become structured state through the existing review machinery; ten minutes of talk yields a seeded realm. AI-only-by-design (declared); the no-AI sibling is P5.7.
- **Exact change:** question script (8 max, skippable, resumable — N11 I7-ii); each answer routes through `importFromText`'s structured shape (L10576-10638) for the founding pass, then the gated write tools (L9346-59) for additions; the Decipher invent-guard reused verbatim: "ONLY structure what is clearly present… do not invent" (L10773); everything lands in review (UX-7).
- **Standards:** CC-DUAL (declared exception, sibling P5.7), CC-GROUND, CC-HALAL (question examples clean).
- **Depends:** P0.10, P0.8. **Acceptance:** runbook — 8-answer interview produces a realm with stats/factions/events, every write having passed review; skip + resume works.
- **Leaves product working:** yes — orchestration over shipped plumbing.

### P5.7 — Day-One Intake: bring your existing campaign, offline (M · Fable 5)
- **What & why:** the no-AI buyer arriving with 50 pages of Obsidian notes hits a cold-start wall (CEO ADDED). A strict, documented markdown convention — `# Faction:`, `# NPC:`, `# Location:`, `# Event:` headings — parsed locally into entities through the canon review pattern. Distribution into the free-tool installed base (R-Q2).
- **Exact change:** pure `Intake.parse(md)` → candidates in the `Parse.canonBlock` candidate shape (so the existing review/apply pipeline consumes it unchanged, post-P0.10); v1 supports exactly one documented format, nothing else (I7 scope freeze); a one-page format guide ships in-app; nothing auto-commits.
- **Standards:** CC-DUAL (constitutive no-AI), UX-3/7, Rubric C2.
- **Depends:** P0.10. **Acceptance (Node):** golden-file test — sample markdown → exact expected candidate set; malformed headings → surfaced failures, not silence.
- **Leaves product working:** yes — new importer through existing review.

### P5.8 — Price move to $29 (S · Haiku 4.5; Hunter approves)
- **What & why:** ruling 3: $19 closes 30 days post-launch → $29 base. Public changelog ties the price to shipped depth (kept promise, not rug-pull — the Old Greg's lesson, R-Q7).
- **Exact change:** store-page price updates on all storefronts + changelog entry listing Phase 4–5 features; in-app "what's new" note. $49 supporter tier only if Hunter rules yes (§8 item 1).
- **Depends:** P5.1–P5.7 shipped; the 30-day window from launch (whichever later, per ruling). **Acceptance:** checklist. **Leaves product working:** n/a.

---

## PHASE 6 — AI ELEVATION + POLISH

**Plain-English goal:** finish every promised AI elevation (LiveMode fire, Notes, turn narration, the Faction Council), make AI answers cite their sources product-wide, and pay down the verified polish debt (search dead-ends, theme parity, listener leaks, recovery hardening).

**EXIT GATE:** every generator-bearing surface works in both modes; a copilot world-fact answer carries clickable citations that navigate; search results land on the entity; Manuscript/Modern themes render WorldShell correctly (CSS var diff = zero); the leak fixes hold under the runbook soak test.

### P6.1 — LiveMode AI fire (M · Fable 5)
- **What & why:** the file's single named stub: `// Stub: real fire path lands in C6` (L12217, verified) — rate caps already built (L12199-12216: 6/min auto-pause, 60/session hard pause).
- **Exact change:** `_maybeFire` completes: build a compact context (committed campaign fields + last heuristics), one `liveModeTier` (L4742) call proposing ≤2 rail suggestions; render into the existing rail slots (L12312+); opt-in per session (IDEAS Idea 3 I7-iii); every suggestion dismissible/pinnable like heuristics; record into `_recentCalls`/`sessionCallCount` so the verified caps bind.
- **Standards:** CC-DUAL (heuristics remain the keyless rail), CC-GROUND, UX-6. **Depends:** P4.1.
- **Acceptance:** runbook — caps trigger (7 rapid events → paused 'rate-cap'); suggestions appear/dismiss; AI off → rail still works.
- **Leaves product working:** yes — completes a capped path.

### P6.2 — Notes get real generators (S · Fable 5)
- **What & why:** Notes' two "AI" actions are signposts, not generators (L11993-97 → hint branch L12073-76, verified).
- **Exact change:** replace the two `prompt:` actions with real runs: "Summarize the realm in 4 lines" and "What did I forget?" — `buildContext` + the JSON-parse retry pattern (L10863-71); insert into Notes via `cpSetText` (L7315) with an insert-or-copy choice (UX-7).
- **Depends:** — **Acceptance:** runbook — both actions produce text into Notes; AI-off shows the standard friendly key message (L12077-78 path).
- **Leaves product working:** yes — swaps hints for functions.

### P6.3 — World-Turn + Sandtable narration (M · Fable 5)
- **What & why:** the turn report in era voice + 1–2 follow-up hooks; the same generator narrates Sandtable branches. Elevation, never the entry ticket (the deterministic report is already shipped).
- **Exact change:** one generator: input = the computed turn/diff lines (rule citations preserved), output = prose + ≤2 hooks, every world-fact carrying `[#id]`/`[NPC: name]` citations (CC-GROUND); renders below the deterministic lines, clearly labeled "AI telling — the math above is the truth."
- **Standards:** CC-GROUND, CC-HALAL, CC-DUAL. **Depends:** P2.3, P2.9. **Acceptance:** runbook — narration cites only entities present in the diff; AI-off → report unchanged.
- **Leaves product working:** yes — additive block.

### P6.4 — N10 Faction Council (M · Fable 5)
- **What & why:** AI plays the opposition, the GM signs everything: once per turn (opt-in), each `gaining`/`losing` faction (field L4807) gets ONE proposed move — front tick (`tickFront` L7282), private event, or stance change (`update_faction_stance` tool exists with scope gating, L9355/L9686-90) — routed through the **existing approval queue** (push verified L9650-55). The demo realm already foreshadows it (`factionAnalysis` pre-bake, L11130).
- **Exact change:** generator emits proposal JSON per faction; **auto-reject any proposal that fails to cite the faction's `primaryInterest` + one motivating canon event** (CC-GROUND as a validity gate, N10 I7-i); weight caps via `CLAMP.eventWeight` (L5866); one move per faction per turn; queue default, never auto-apply; one-click undo (existing `pushUndo`).
- **Standards:** CC-GROUND (gate), CC-LIC n/a, CC-HALAL (factions act from *interests*; the GM decides — never "the AI decides the world's fate"), UX-7.
- **Depends:** P2.3, P4.5 (knowledge), P5.3 patterns. **Acceptance:** runbook — turn with 2 gaining factions → 2 queued proposals with citations; citation-less proposal (forced via test prompt) auto-rejected; approve one → applied + undoable.
- **Leaves product working:** yes — strictly queue-gated.

### P6.5 — The Grounding Rule across the copilot (M · Fable 5)
- **What & why:** CC-GROUND product-wide: copilot answers asserting world-facts carry `[#8charId]` citations rendered as links. The context already prints the IDs (L9942-43, verified); the model is simply never asked. This is the AI half's brand.
- **Exact change:** (1) system-prompt addendum: "When you assert a fact from the chronicle, cite `[#id]` from the ledger"; (2) render pass: linkify `[#xxxxxxxx]` → click navigates via P6.6's deep-links (chronicle scroll-to-event); unresolvable ids render as plain text with a subtle "not found" title (C4: never silently wrong).
- **Depends:** P6.6. **Acceptance:** runbook — ask about a chronicled event → answer carries ≥1 citation that navigates to the event; fabricated-id case renders inert.
- **Leaves product working:** yes — prompt + render addendum.

### P6.6 — Search deep-links + full index (M · Fable 5)
- **What & why:** verified dead-ends: `panelMap` routes characters/factions→`war-room`, events→`chronicle` (L15619-23) but no `panel-war-room`/`panel-chronicle` exists (grep zero) → `openPanel` bails silently (L12735-36). Plus 4 unindexed types (fronts/relations/artifacts/glossary; indexed groups L15525+).
- **Exact change:** replace the three dead `panelMap` entries with real handlers: characters → open the character detail flow; factions → faction detail; events → close panels + scroll WorldShell chronicle to the event + 2s highlight (anchor by event id). Add index groups for fronts (name/description), relations, artifacts (type/content), glossary — same `{id,name,meta,type,entityId}` row shape (L15558+ pattern).
- **Standards:** UX-2. **Depends:** — **Acceptance:** runbook — search each of the 12 types; every result lands somewhere visible; no silent no-ops.
- **Leaves product working:** yes — replaces no-ops with navigation.

### P6.7 — Theme parity (M · Fable 5)
- **What & why:** verified (POSITION §6 ⚙, spot-re-verified this session): **12** CSS vars used fallback-less but never defined — `--color-border`/`--color-surface-1`/`--color-text-body`/`--color-text-heading` (Encounter Builder cluster, L2647-61, re-verified), `--color-danger` (L14832), `--color-surface-raised` (L16777, re-verified), `--color-text` (L8714), `--text-body-md`, `--text-h4`, `--text-heading`, `--text-heading-sm`, `--text-label-md` — and **23 `wms-` classes styled only under `.theme-ember`** while WorldShell renders in ALL themes (L7695-96, verified).
- **Exact change:** (1) define all 12 vars in `:root` mapping to the existing suffixed/sibling tokens (e.g. `--color-border: var(--color-border-default)`), with per-theme overrides where the design needs them; (2) add base-layer rules for the 23 ember-only `wms-` classes so Manuscript/Modern render structured (Ember keeps its chrome). Until done, Settings labels the two alternates "beta" (Haiku micro-task, can land in Phase 1).
- **Standards:** UX. **Depends:** — **Acceptance (scripted, the POSITION ⚙ precedent):** re-run the used-vs-defined CSS var diff → zero undefined; runbook screenshot pass on all 3 themes × WorldShell + Encounter Builder.
- **Leaves product working:** yes — additive CSS.

### P6.8 — Listener-leak cleanup (S · Fable 5)
- **What & why:** verified leaks: `AccuracyChip.mount` adds 2 document listeners per call, no unbind (L5725-31), re-mounted per Solo render (L5298), Campaign popover (L12057), Tonight open (L12414), modal open (L17381) — only the copilot site guards (L9558); PrintPreview's keydown is removed only on the Escape path (L14430), orphaned by the Close button (L14417).
- **Exact change:** AccuracyChip: store the two handlers on the container element and skip re-binding when `_refreshAccChip` exists (generalize the L9558 guard into `mount` itself); PrintPreview: `close()` removes the keydown handler (store the ref on `this`).
- **Depends:** — **Acceptance:** runbook soak — 20 Solo asks + 20 modal opens: `getEventListeners(document)` count stable.
- **Leaves product working:** yes — dedup only.

### P6.9 — AI demo taste page-2 polish + Ollama CORS verification (S · Fable 5 + Hunter desktop)
- **What & why:** CEO R9: before "local AI" appears in marketing as easy, the desktop runbook must verify a double-clicked `file://` page can reach `localhost:11434` (Origin: null vs `OLLAMA_ORIGINS`); the probe fails silently by design (L16549/L16571, verified).
- **Exact change:** runbook entry + if needed a one-line docs callout in Settings ("Run: `OLLAMA_ORIGINS=* ollama serve` — see guide") and the marketing constraint recorded in `store/` copy.
- **Depends:** — **Acceptance:** the runbook result recorded either way. **Leaves product working:** yes.

### P6.10 — Recovery hardening (M · Fable 5)
- **What & why:** two verified mediums: unknown/future `schemaVersion` skips all migration silently (exact-match chain L6419-6553; import fallback `'1.0'` matches no branch, L8872); corrupt-save recovery (`handleCorruptStorage` L6555) preserves the raw blob but never tries snapshots — and the snapshot *index* dies with the blob (`meta.snapshots` L7019) while snapshot *data* survives at `rw_snapshot_*` keys (L7014), so `getSnapshotList` (L7081) lists nothing.
- **Exact change:** (1) `migrateIfNeeded` gains a terminal guard: version newer than `SCHEMA_VERSION` (L4685, `'2.5.0'`) → non-blocking warning toast "This save is from a newer RealmWright — export a backup before continuing"; unknown old versions route into the `'1.2.0'` entry (the chain's own default at L6420). (2) `handleCorruptStorage` additionally scans IDB for `rw_snapshot_*` keys directly and offers Restore-Snapshot with the found list (rebuilding the index from key timestamps).
- **Standards:** UX-4, C4. **Depends:** — **Acceptance (Node):** migrate fixture with `schemaVersion:'9.9.9'` → unchanged + flagged; `'1.0'` import → lands in the migration chain. Runbook: corrupt the blob → recovery screen lists real snapshots.
- **Leaves product working:** yes — recovery-path only.

---

# 6. DEPENDENCY MAP / CRITICAL PATH

**The critical path to launch (everything else can parallelize around it):**
`P0.12 → P2.1 → P2.3 → P2.4/P2.5` (the weapon) and `P0.1→P0.2→P0.13` (money rail) and `P0.8 → P3.1/P3.4` (visibility wall → demo surfaces) → `P3.3` (demo build needs Worker + Tonight-Lite + the weapon) → `P3.5` (store) → **LAUNCH**.

**Hard gates (block, never bend):**
- P0.8 (CLAMP.visibility) blocks: P2.3 report render, P3.1, P3.4, P3.7, P4.3, P5.3, P5.6 (CC-LM2).
- P0.12 blocks P2.1 (CC-LM4). P2.1 blocks P2.3/P2.6/P2.9/P4.5/P5.1-drift.
- P0.13 blocks P3.3/P3.6 and real-key activation testing.
- P0 exit gate blocks ALL of Phase 3's public artifacts (R6 embargo).

**Parallel lanes (independent, run concurrently):**
- Lane A (trust/money): P0.1→P0.2→P0.3→P0.4 · P0.13 (Opus lane).
- Lane B (data integrity): P0.8→P0.9→P0.10 · P0.12.
- Lane C (durability): P0.5→P0.6→P0.14 · P0.7 · P0.11.
- Lane D (identity, anytime pre-launch): P1.1→P1.2 · P1.3 · P1.5.
- Lane E (polish, anytime): P6.7 beta-labels, P6.8.
- Within Phase 2: P2.2 ∥ P2.1; P2.6/P2.9 after P2.1; P2.7→P2.8 ∥ everything.
- Within Phase 5: P5.3 ∥ P5.1; P5.4-P5.7 after their named deps only.

**Same-region ordering (line-drift control):** P0.8 before P0.10 (parser region); P0.1 before P0.13 (license region); P2.3 whitelists `turnLog`, P4.3 whitelists `pressArchive`, P5.4 whitelists `tables` — three separate edits to L6342-75; each task re-locates by quoted code.

---

# 6.5 RISK REGISTER (Rubric B6)

| # | Risk | Mitigation (task-anchored) |
|---|---|---|
| 1 | Trust-betrayal event at small scale ("my key was in a backup" / "my world vanished") — fatal to an ownership-positioned product | Phase 0 is the mitigation; P0.15 hostile gate run by Hunter; CC-SEC on every sink |
| 2 | Demo key abuse / cost runaway on Hunter's Worker key | Turnstile + single-use tokens (L6242-44) + per-IP AND global daily KV caps + kill switch (P0.13); Hunter sets the budget numbers (§8.2) |
| 3 | World Turn corrupts a real save | CC-LM3 clone-pure compute; veto-before-commit; single undo snapshot; `turnAppliedAt` double-apply guard; Node determinism battery (P2.1) |
| 4 | Import silently drops new data (the landmine class) | CC-LM1 named in every task that adds nation-level data (P2.3/P4.3/P5.4); round-trip Node tests mandatory; P5.1's `customized` flag |
| 5 | Obscurity — nobody arrives (the existential risk, CEO §2.3) | demo-first itch distribution (P3.3/P3.5), shareable turn cards (P3.7), instrumentation (P3.6), weekly content beat = budgeted founder time (continuous; Hunter-owned) |
| 6 | Founder bandwidth (four ventures) | every phase boundary ships a working, more-trustworthy product (B4 per task); Run Mode pre-authorized for scope cuts |
| 7 | Solo IP exposure (Word Mill table) | P1.3 replaces values; original-curve Node-proven different per row |
| 8 | Ollama file:// CORS makes "local AI" overpromise | P6.9 verification before marketing copy; R9 wording until proven |
| 9 | No-AI living-world demand untested in-market (R-Unknown-3) | demo *is* the instrument (R8); P3.6 measures sheet-gens and turn-takes before the price move |
| 10 | Single-file size creep (DOMPurify +~22KB, new features) | budget note per phase; assets inlined only when load-bearing; no image/TTS deps (rejected list stands) |

---

# 7. GLOSSARY (plain English, for Hunter)

- **Acceptance test** — the pass/fail proof a task worked. Either a *Node test* (a script that checks logic automatically) or a *desktop runbook* step (numbered clicks with an expected result).
- **Anchor / line-cite (L1234)** — the exact line in `realmwright-v7.html` where the code lives. All anchors here were re-read today; if code moves, executors re-find it by the quoted snippet.
- **API key / BYO-key** — the password-like token that lets the app call an AI provider. "Bring Your Own Key" = the buyer uses their own, so AI costs us nothing and their data goes to their provider, not us.
- **Approval queue** — the holding area where AI-proposed changes wait for the GM's yes/no before touching the world.
- **AutoSave / FSA / `showSaveFilePicker`** — the browser feature (Chromium only) that lets the app write a real backup file to the user's disk after they pick a location once.
- **Blob download** — the standard way a web page hands the user a file to save.
- **Canon / CANON block** — the world's established facts; the structured text format (`Event: … | … | …`) the AI emits so changes can be reviewed line-by-line.
- **CLAMP** — the in-file bouncer that normalizes incoming values (stat numbers, event types — and after P0.8, visibility) so bad data can't slip in.
- **Clock / Front** — a countdown (e.g. 6 segments) representing a looming threat; when it fills, the catastrophe happens and is recorded.
- **Clone-pure** — computing on a *copy* of the world so the real one provably can't be touched (how Sandtable projections stay safe).
- **Cloudflare Worker** — a tiny program running on Cloudflare's servers; ours verifies purchase keys and proxies the 5 demo AI calls so the secret keys never live in the HTML file.
- **Critical path** — the chain of tasks where a delay delays launch; everything off it can run in parallel.
- **Debounce (400 ms)** — "wait until typing stops before saving"; the reason the last 400 ms could be lost on tab close (fixed by P0.6).
- **Deep clone** — a full independent copy of a data object.
- **Demo build** — the separate `realmwright-demo.html` artifact: tastes everything, keeps nothing, exports nothing.
- **Deterministic** — same input always gives the same output. No dice behind the curtain. The moat.
- **Device token / device cap** — how the license server recognizes a machine, and the limit on how many machines one key activates.
- **DOMPurify / sanitizer / XSS** — the library that strips dangerous code out of pasted text so a malicious paste can't run scripts in your app.
- **Dual-mode** — every feature useful with AI off; AI only elevates.
- **Exit gate** — the test a phase must pass before the next phase ships anything.
- **Exceptional Yes/No** — the oracle's "yes, and…" / "no, and…" result bands.
- **Fail-closed** — when unsure, choose the safe side (an unrecognized visibility value hides rather than shows).
- **FrontDoor** — the first-launch welcome/pitch screen.
- **GM / NPC / TTRPG / VTT** — Game Master; Non-Player Character; tabletop role-playing game; virtual tabletop (online play software like Foundry).
- **Grounding / citation** — every AI claim about your world links to the actual entity it came from, so you can check it.
- **Honor-ware** — the license is a receipt and a thank-you, not a lock. It never disables anything, especially not safety.
- **IndexedDB / localStorage** — the browser's two built-in storage areas. Both can be evicted unless persistent storage is granted (P0.5).
- **KV** — Cloudflare's simple key-value storage (used for demo caps and metrics counters).
- **Landmine** — a verified, named trap in the existing code that silently destroys data if a task forgets it (the CC-LM rules).
- **Maysir / riba** — gambling / interest — both categorically excluded (CC-HALAL).
- **Migration / schemaVersion** — the upgrade steps that modernize an old save file's format.
- **Modal / toast / FAB / chip** — a dialog box; a brief corner notification; a floating round button; a small status pill.
- **Node test** — a small JavaScript file run with Node.js that asserts logic is correct — proof, not eyeballing (Rubric C2).
- **Offline-first / single-file** — the whole product is one HTML file that fully works with no internet.
- **Ollama** — software that runs AI models on the user's own computer; the "nothing ever leaves my machine" tier.
- **OpenRouter** — the service the BYO-key connects to for hosted AI models.
- **Oracle / fate chart / chaos factor** — Solo mode's yes/no dice engine: declared odds × a tension dial → d100 answer. Name kept per Hunter's ruling.
- **pagehide / beforeunload / visibilitychange** — browser events that fire when a tab closes/hides — where the save-flush hooks live.
- **Persistent storage (`navigator.storage.persist`)** — asking the browser to promise not to evict our data under disk pressure.
- **PRNG / seeded** — a random-number generator that, given the same seed, replays the same sequence (kept out of v1's turn — fully deterministic).
- **Pressure / threshold / drift** — a live warning condition computed from stats; the tripwire value where a stat auto-fires a history event; the small per-season stat change a pressure causes during a World Turn.
- **Pure function** — code that only computes (no saving, no screen-touching) — which is why Node can prove it.
- **Regex** — a text-matching pattern (how the parser reads `+2.5`).
- **Runbook** — the numbered click-through script for things only a real browser can verify.
- **Sample realm / SampleMode** — the built-in example worlds; try-it mode whose changes never save (the demo build reuses this).
- **Turnstile** — Cloudflare's "prove you're human" checkbox guarding the demo AI.
- **Veto / review-before-apply** — the GM approves or rejects each proposed line before it becomes canon.
- **Visibility (public / private / forecast)** — per-event audience flag: players may see / GM only / possible-future, GM only.
- **Whitelist (import)** — the explicit field list `buildNationFromSeed` copies; anything not on it is dropped on import (the CC-LM1 landmine).
- **WorldShell** — the default dashboard layout. **World Turn** — the deterministic between-session step. **Heartbeat** — the about-to-happen panel. **Sandtable** — the what-if projector. **Vault** — the custody status + backup system. **Codex** — the player-safe world file.

---

# 8. DECISIONS HUNTER MUST MAKE (not guessed here)

1. **$49 Lifetime Supporter tier — yes or no.** Ruling 3 left it deferred. Needed by P5.8 (price move). Default if undecided: ship $29 only.
2. **Demo AI budget numbers.** Per-IP daily cap, global daily cap, and a monthly kill-switch spend ceiling for the Worker demo key (P0.13/P3.3). The plan implements whatever numbers you give; suggested starting point for your decision: per-IP 5/day, global 200/day — but the money is yours.
3. **Launch storefront set + order.** All three at once (Gumroad + itch + Lemon Squeezy) or staged (e.g. itch demo + Gumroad checkout first)? P3.5 ships pages for whichever you name. The license already covers all three either way.
4. **Account-owner setup actions (only you can do these):** create the Gumroad product (yields `product_id`), confirm/keep the LS product, generate itch download keys, create Turnstile site+secret keys, deploy the Worker (`wrangler deploy` + `wrangler secret put` for the five secrets), then paste `LS_PRODUCT_ID` (L4663) and `TURNSTILE_SITEKEY` (L4665) into the file.
5. **Final brand copy sign-off:** the GM-mode sigil wording (default proposed in P1.2: "Realm Keeper / Game Master's Table"), the demo banner line, and the store headline. Defaults ship if you're silent; your edit wins if you're not.
6. **Shipped example-content sign-off (halal):** the drift-rule prose table (P2.1), Almanac season/festival names (P2.2), table packs (P5.4), preset packs (P5.2) — each task self-checks against CC-HALAL; the final accept on shipped fiction is yours.
7. **The weekly distribution beat** (CEO §2.3): it's founder time, not agent time — confirm you'll budget it (or name what to cut instead). The plan's strong-case economics assume it exists.

---

# 9. SELF-GRADE vs RUBRIC B (producer's grade — never final)

- **B1 (built only on A+ inputs, cited): PASS.** Inputs are the six graded artifacts (header); every market claim cites R-Qn/Tn, every product claim cites POSITION/CEO/VALUE-LEDGER or a line verified this session; the quarantined dossier untouched.
- **B2 (every existing feature keep/deepen/cut + dual-mode spec): PASS.** §4.5 verdict table covers all POSITION §5 features; every kept feature's no-AI depth and AI layer named; rejects carried forward.
- **B3 (criticals-first): PASS.** Phase 0 = the four POSITION criticals + M1/M2/M3 + parser pack + DOMPurify + catastrophe label + universal license, with a falsifiable exit gate; the public embargo (R6) is encoded as a hard dependency.
- **B4 (every slice leaves the product working): PASS.** Every one of the 47 tasks carries an explicit "leaves product working" confirmation; same-region tasks carry ordering notes; the demo is a build artifact, never a mutation of the canonical file.
- **B5 (effort-honest, no fantasy timelines): PASS.** S/M/L sizing only; the one L-task UI lift (Run Mode) sits after revenue can exist and is pre-authorized for cuts; no dates anywhere.
- **B6 (risk register): PASS.** §6.5 — ten risks, each with a task-anchored mitigation.
- **B7 (constraint check — halal, Gumroad/Payoneer, single-file, offline, BYO-key): PASS.** CC-HALAL/CC-LIC/CC-ARCH/CC-SEC are standards with per-task application; the universal license implements the Payoneer-rails ruling; Hunter's three rulings applied verbatim (header + P1.3/P3.3/P5.8); secrets never committed (Worker secret discipline specified).
- **B8 (adversarial pass — money/time/scope/security): PASS (self-administered), with declared limits.** Money: license decision logic Node-specified, demo spend capped twice + kill switch, honest pricing window. Time: critical path isolated; five parallel lanes. Scope: v1 freezes named per feature (Whisper one rule; Sandtable no saved branches; Run Mode 4 elements; Intake one format). Security: Opus-routed security tasks, fail-closed visibility, leak tests as acceptance criteria. **Declared limits:** browser-runtime behaviors are runbook-verified, not provable here (same §8 class as POSITION); Rubric C2 per code task is specified in each acceptance test but is *executed* at build time, not in this document; line anchors are valid as of 2026-06-12 and drift-guarded by quoted-code relocation.
- **Per-task Rubric C honor:** C1 root-cause cited per task (verified lines); C2 Node-or-runbook named per task; C3 atomicity by construction; C4 surfacing required (P0.14, parser failures, recovery toasts); C5 style-native (vanilla JS, `h()`/State/Render idioms, existing copy tone matched); C6 review = the dispatch recipe's mandatory diff report + the independent check below.

**Grade claimed: A (all eight gates pass on the producer's evidence). Independent check: PENDING — per QUALITY-BAR, this grade is not final until a different mind re-resolves a sample of the line-cites (fastest hostile set: L6302/L6318 vs L6604-13; L6261; L8305/L9667/L6352; L7295; L6144-58; L6342-75; L12480-82; L15619-23 + the grep set in the header) and re-runs the dependency logic.**
