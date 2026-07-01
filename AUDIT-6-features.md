# RealmWright — Audit of 6 Export/Mode Features

Branch: `claude/magical-mayer-YwP53` (PR #9) · File: `realmwright-v7.html` (~26k lines)
Example world for exercising: **Solis Prime** (front door → "🌍 Load an example world").
Status legend: ✅ verified in browser · 🔬 code-traced (not yet browser-verified) · ⏳ pending

Last updated: (in progress)

---

## 0. KNOWN BUG — Print/PDF output is BLANK (proof-of-loop, blocks features 2 & 4)

**Severity: BLOCKER.**

### Root cause (code-traced, ROOT-CAUSED)
There are TWO mutually-incompatible "hide everything but me" print strategies fighting:

1. **Global CSS** (line 3850, always live in `<head>`):
   `@media print{ body>*:not(.print-preview){display:none!important} ... }`
   → at print time, hide every direct child of `<body>` that is NOT `.print-preview`.

2. **Per-render inline CSS**, injected into `#print-container` by all 3 PDF renderers
   (Story Bible `generatePDF` L12753; Session Prep `renderSessionPrepPDF` L12985;
   Press recap via `PrintContainer.present` L18694):
   `@media print{ body>*:not(#print-container){display:none!important} #print-container{display:block!important} }`

The current architecture renders content into `#print-container`, then **clones that node
(including the injected `<style>`) into a `.print-preview` wrapper** via `PrintPreview.open()`
(L22461) and calls `window.print()`. Two failures compound:

- The cloned `<style>` block applies **document-wide** (style tags are not scoped to DOM
  position). Its rule `body>*:not(#print-container){display:none!important}` **hides the
  `.print-preview` wrapper itself** (it is a `body>*` and is not `#print-container`).
- Immediately after cloning, the code runs `pc.innerHTML=''` — so `#print-container` is now
  empty anyway. Nothing printable survives → **BLANK page/PDF**, even though the on-screen
  preview modal looks correct.

The inline `body>*:not(#print-container)` / `#print-container{display:block!important}` lines
are **dead legacy** from the abandoned direct-`window.print()` approach. With the
`PrintPreview`-clone approach they are not merely redundant — they actively blank the output.

### Affected features
- **Feature 2** "Export as Story Bible (PDF)" — YES (uses `generatePDF`, injects `#print-container` rule).
- **Feature 4** "Generate GM Session Prep (PDF)" — YES (uses `renderSessionPrepPDF`, same rule).
- Press "Previously on…" recap — YES (uses `PrintContainer.present` / `_STYLE`, same rule).
- Tonight "Print / Save PDF" (L20511) — NOT affected: it builds its own plain clone and never
  injects a `#print-container` rule, so only the (correct) global `.print-preview` rule applied.
  (It was, however, latently fragile — any future `#print-container`-style injection would break it.)

### Fix — LANDED (commit ec42cb0)
Stripped the `body>*:not(#print-container){display:none!important}` and
`#print-container{display:block!important}` lines from all THREE inline `@media print` blocks
(Story Bible L12755, Session Prep L12987, Press `_STYLE` L18888); kept `@page`. The single
global `.print-preview` rule now governs print visibility; the cloned content (inside
`.print-preview__page`) survives to the printed page.

**Status: root cause confirmed by code trace; fix LANDED + compile-verified (main app block
compiles clean; offending selector count 0; global `.print-preview` rule intact).
Browser render verification: PENDING (Playwright now installed; see verification section).**

---

## FEATURE-BY-FEATURE (filled in as traced)

### 1. "Export as JSON" — handler L24005 → `exportJSON('single')` (def L12617)
- CLAIMS: dump the world as JSON.
- ACTUAL (code-traced): Serializes the active nation (`scope='single'`) or all nations
  (`scope='all'`) via `JSON.stringify(nation, null, 2)` after a deep clone. Deliberately
  EXCLUDES `State.data.meta` — so `copilotKey` never leaks (good, security-correct). Because it
  stringifies the whole `nation` object, it exports EVERY field that lives on the nation
  (stats, chronicle, factions, characters, locations, hooks, secrets, oracleLog, campaign data,
  etc.). Re-import via `handleImport` (L12631) → `migrateIfNeeded` → `buildNationFromSeed`.
- GAP: The export is **complete for a single nation** but has two real limitations:
  (a) **NOT a full-app backup.** Single export omits `meta` entirely, and even `scope='all'`
      omits `meta` — so app-level settings, theme, and (correctly) the API key are not in any
      export. Fine for sharing one world; a GM expecting "back up my whole app" does not get it.
  (b) **Round-trip fidelity depends entirely on `buildNationFromSeed`.** If that constructor
      drops or defaults any field not in its known list, that field is silently lost on re-import
      even though it was present in the JSON. This is the exact "connections rotted" risk: fields
      added to the nation over the last month may not be reconstructed by `buildNationFromSeed`.
      MUST be verified by an actual export→import→diff (see verification section).
- ROOT CAUSE (of any fidelity gap): asymmetry between "dump everything" on export and
  "reconstruct known fields only" on import.
- SEVERITY: **minor-to-major**, pending round-trip diff. If round-trip is lossless → minor
  (just the "whole-app backup" expectation gap). If fields drop → major (silent data loss).
- FIX PLAN: (1) Run export→import→deep-diff on Solis Prime (+ a nation with hooks/secrets/
  characters/locations/campaign data) and list any dropped keys. (2) For each dropped key, add
  it to `buildNationFromSeed`'s reconstruction. (3) Optionally add a true "Full backup (all data
  incl. settings)" export that includes `meta` minus secrets, clearly labelled.

### 2. "Export as Story Bible (PDF)" — handler L24006 → `export-opts` modal → `generatePDF` (L12739)
- CLAIMS: a formatted GM PDF of the world.
- ACTUAL (code-traced): Builds a rich, well-styled print document into `#print-container`:
  title/era/government header, stability line, stats table with bars, chronicle grouped into
  eras with per-event weight/visibility, optional factions/characters/artifacts/glossary — all
  gated by checkboxes in the `export-opts` modal (secrets & forecasts OFF by default → safe to
  share). Then routed through `PrintPreview` → `window.print()`.
- GAP: **The output was BLANK** (see §0) — the document was assembled correctly and shown in the
  preview modal, but the printed/saved PDF contained nothing because the injected
  `#print-container` @media rule hid the `.print-preview` wrapper. This is squarely the "looks
  like it works but is broken" complaint. Content completeness/layout are otherwise GOOD.
- ROOT CAUSE: the print-visibility rule collision in §0.
- SEVERITY: **BLOCKER** (feature produced an empty file).
- FIX: LANDED via §0 (commit ec42cb0). Needs browser render-verification that the PDF now
  contains the content. Layout is high quality; no rebuild needed once render is confirmed.

### 3. "Export to Foundry VTT" — handler L24007 → `FoundryExport.download('active')` (L12653)
- CLAIMS: "output a format Foundry Virtual Tabletop can import."
- ACTUAL (code-traced + format-researched): Builds one `JournalEntry` per category (Realm
  Overview, Chronicle, Factions, Characters, Locations, Hooks, Secrets), one page per item.
  The per-document SHAPES ARE CORRECT for Foundry v12:
    - Page: `{_id, type:'text', name, title:{show,level}, text:{content, format:1}, sort, flags}`
      — matches JournalEntryPage schema; `format:1` = HTML. ✓
    - Entry: `{_id, name, pages, folder, sort, ownership, flags, _stats:{coreVersion:'12'}}`
      — matches JournalEntry schema. ✓
    - 16-char alphanumeric `_id`s via crypto — correct Foundry id style. ✓
    - Player-safe by default (public chronicle only; secrets/private events excluded). ✓
- GAP (the real defect): **The file is a top-level JSON ARRAY `[entry, entry, …]`, but Foundry's
  "right-click → Import Data" imports ONE document object into ONE target entry** (Foundry KB:
  "Imports data INTO the Journal Entry from a JSON file"). The app's own success toast literally
  instructs "Journals sidebar → right-click → Import Data" — a flow that will FAIL or import only
  a fragment when handed an array. So the feature "says importable" but, followed as instructed,
  is **not importable** as a whole. Secondary: NPCs are exported as journal TEXT pages, not
  Foundry `Actor` documents (a defensible, documented, system-agnostic choice — but a GM
  expecting clickable actors/tokens won't get them).
- ROOT CAUSE: wrong top-level container (array) vs Foundry's single-document import contract.
- SEVERITY: **BLOCKER for the advertised use** (cannot be imported via the documented path).
- FIX PLAN (concrete, pick one — A is smallest, correct, ship-now):
    A. **Emit one combined JournalEntry** whose `pages[]` are ALL the item pages across all
       categories (prefix page names with the category, e.g. "Faction · The Algorithm Council"),
       and keep the single-object top-level shape `{_id,name:"<Realm> — Story Bible",pages,...}`.
       This imports cleanly via right-click → Import Data. Simplest reliable win.
    B. Keep multiple entries but ship them as a proper **Foundry world-export / compendium pack
       (NeDB/LevelDB `.db`)** or a module manifest — heavier; only if the GM wants a real folder
       tree. Not needed for v1.
    C. If keeping the array, CHANGE the instructions to a macro-based import
       (`JournalEntry.createDocuments(<array>)` run in a Foundry script macro) — but that is a
       power-user path and contradicts "right-click → Import Data". Not recommended as the default.
  Recommend **A** now; note B as a future "full folder tree" upgrade.

### 4. "⌘ Generate GM Session Prep (PDF)" — handler L24003 → `Copilot.generateSessionPrep` (L14942) → `renderSessionPrepPDF` (L12981)
- CLAIMS: an AI-generated session-prep document a GM can run a table from.
- ACTUAL (code-traced): Opens `session-prep` modal (focus pills: balanced/faction/character/
  military/mystery; length: brief/standard/long; optional twist). Calls `generateSessionPrep`,
  which builds context via `buildContext(n)` (see below), sends a system+user prompt requesting
  strict JSON (title, tagline, hooks[], optional npcs[], optional secrets[], tensions), parses
  with fallback cleaning, then renders a one-pager PDF via `renderSessionPrepPDF`.
- PROMPT EVALUATION (Opus judgment — the owner's #1 complaint):
    - **`buildContext` (L13965) is actually STRONG, not thin.** It emits nation identity,
      computed stability + status, sorted stats with weights, factions (with leaders +
      descriptions), characters, a smart-selected chronicle window + a compressed "ledger" of
      older events (each with citable `[#id8]` tokens), plus computed "Active Pressures". This is
      genuinely good grounding material. The instruction block is also good: it demands concrete,
      immediately-runnable hooks that "reference specific stats, factions, or characters by name",
      2-4 sentences each, strict JSON only. So the *prompt craft* is above average.
    - **The real weaknesses (why output can feel generic / disconnected):**
      1. **Context DEPTH gate silently starves the prompt of secrets/oracle at the default tier.**
         Default `copilotContextDepth='medium'` → tier `mid`, whose `_DEPTH_CFG` sets
         `includeSecrets:false, includeOracle:false` and hooks `unresolvedOnly:true`. So at the
         out-of-the-box depth the model NEVER sees the world's Secrets or Oracle history in
         context. Session Prep separately passes `availableSecrets` (undeployed) in the user
         prompt, but a GM who has authored secrets and expects the prep to weave them in gets less
         than they'd assume unless they raise the depth. This is a "connection" gap.
      2. **Hook/secret field-model drift.** Handler filters `hooks.filter(h.status==='open')` and
         `secrets.filter(s.status==='undeployed')` (L24047-48), while `buildContext` filters
         hooks by `!h.resolved && h.status!=='resolved'`. Two truth-models coexist in the code
         (explicitly acknowledged at L18745: fixture shape `{resolved:false}` vs runtime shape
         `{status:'open'}`). Hooks created in Campaign use `status:'open'` (matches), but any
         hook/secret authored via a path that sets only `resolved` would be invisible to the
         handler's `status==='open'`/`'undeployed'` filters → silently dropped from the prep.
      3. **No player-character / party input.** The prep is world-centric; it never asks who the
         PCs are or what they did last session (beyond free-text "twist" + open-hook titles). A GM
         running an ongoing table wants continuity with THEIR party. This limits "ready to run".
      4. **The example world "Meridian/Solis Prime" has NO hooks, NO secrets, NO characters,
         NO locations** (seed L5807) — so a GM exercising this on the example gets hooks+tensions
         grounded only in stats/chronicle/factions, and the NPC roster is fully invented rather
         than drawn from the world. Fine, but it undersells the "connected" story on the very
         world used to evaluate it.
    - **PDF render:** was BLANK (same §0 bug) — the prep JSON generated fine but the PDF was empty.
- ROOT CAUSE(s): (blank) §0 print collision; (quality) default depth hides secrets/oracle +
  hook/secret field drift + no PC/party continuity input.
- SEVERITY: **BLOCKER** for the PDF being empty (fixed via §0). **Major** for the prompt-context
  gaps (they degrade real usefulness but the feature still produces usable hooks).
- FIX PLAN:
    1. (Done) §0 print fix → PDF renders.
    2. For Session Prep specifically, force a higher context floor: pass `tier:'high'` (or
       `requires_full`) into `buildContext` for this call so Secrets + Oracle + full hooks are in
       context. One-line change at the `buildContext(n)` call (L14962) → `buildContext(n,{tier:'high',message:promoMsg})`.
    3. Normalize hook/secret filters to the tolerant form used elsewhere: treat a hook as open if
       `h.status? h.status==='open' : !h.resolved`; a secret as available if
       `s.status? s.status!=='deployed' : !s.deployed`. Reuse the helper already implied at L18749.
    4. Add an optional "Party / where we left off" textarea to the session-prep modal and thread
       it into `userPrompt` so ongoing tables get real continuity. (Bigger; schedule after 2-3.)

### 5. Mode "Tonight" — "One line. One world. One session, ready to run." (L26043; `Tonight` L20269)
- CLAIMS: type one line → a session you can run tonight, connected to the tool.
- ACTUAL (code-traced): `Tonight.generate()` (L20354): Step 1 `Copilot.importFromText(situation)`
  → `buildNationFromSeed` → `State.addNation` (a REAL, editable nation is created and tagged
  `_tonightGenerated`). Steps 2+3 in parallel: `generateStrongStart` (read-aloud opening) +
  `generateSessionPrep` (hooks/NPCs/tensions + 10 proposed secrets). Renders a full pack
  (Strong Start, Scenes & Hooks, Secrets, Key Figures, Tensions) with actions: Print/Save PDF,
  Generate another, **Keep this realm** (clears `_tonightGenerated` so it isn't auto-deleted),
  **Save N secrets to realm**. Robust: per-piece error isolation + inline retry, orphan-nation
  cleanup on total failure, cleanup of the prior tonight-nation on re-run.
- GAP: This is the **strongest of the six** and genuinely delivers "one line → ready to run",
  AND it is connected (it creates a real world you can promote/edit + push secrets into it).
  Real (smaller) gaps:
  (a) It is **generate-from-nothing**, not "use my existing world". `importFromText` invents a
      brand-new nation from the one line; it does NOT let a GM say "run tonight IN my existing
      Solis Prime". For a worldbuilding tool, "Tonight in <this world>" is the obviously-missing
      mode. Right now Tonight ignores the active world entirely.
  (b) Same context-depth caveat as §4 for its `generateSessionPrep` call (secrets/oracle depth) —
      less relevant here since the nation is freshly generated.
  (c) Print path is fine (uses `PrintPreview` correctly; unaffected by §0, now safe anyway).
- ROOT CAUSE (of (a)): Tonight is wired as a net-new generator, with no branch to seed from the
  active nation's `buildContext`.
- SEVERITY: **minor** (feature works and delights). (a) is a **major ENHANCEMENT** opportunity,
  not a defect — it's the difference between "cool one-shot toy" and "my worldbuilding pays off".
- FIX PLAN: Add a "Use my current world" toggle in the Tonight composer. When on, skip
  `importFromText` and instead run `generateStrongStart` + `generateSessionPrep` against
  `State.get()` directly (they already accept a nation). Small, high-delight change.

### 6. Mode "Campaign" — `Campaign` L16793; opened from mode dropdown L23982
- CLAIMS: campaign management, end-to-end; previously had a "stuck in Campaign" bug.
- ACTUAL (code-traced): Full-screen session-prep board with: progress **Clocks** (4/6/8-tick
  Blades-style, click-to-fill, idle-nudge), **Beats** (scene list, first = Strong Start,
  drag-reorder + Alt+↑/↓, mark-played timestamps), **NPCs** (name/role/motivation, "at the table
  tonight" star, and **quick-link to the world's real characters** via `_matchCharacter` /
  `linkedCharacterId` — genuine connection), **Secrets** (with "delivered → seed a chronicle
  entry"). Data lives on `State.cp()` (campaign-prep store). Opens via `Campaign.open()` →
  `wire()` (idempotent) + `render()` + heuristics rail.
- "Stuck in Campaign" bug: **appears already fixed.** The World branch of the mode switch
  (L23986-23994) explicitly calls `Campaign.close()` + `RunMode.close()` + `applyTheme()` with a
  comment ("Bug 2: close every full-screen overlay … returning to World never lands on a
  stale/blank screen"). So there is a working exit.
- GAP: Works and is connected. Open questions to verify in-browser: (i) does campaign data
  persist per-nation across reload (is `State.cp()` nation-scoped and saved)? (ii) does "delivered
  secret → chronicle" actually write to the world chronicle? (iii) any dead controls. Also, the
  **Campaign board is manual** — nothing pre-populates clocks/beats/NPCs from the world or from a
  Session Prep result, so a GM starts from an empty board every time (high friction vs the AI
  modes). Bridging Session Prep / Tonight output INTO the Campaign board is the missing
  connective tissue.
- ROOT CAUSE (of friction): Campaign is a standalone manual board; no import from AI prep or world.
- SEVERITY: **minor** for correctness (it works), **major** for connectedness/usefulness (empty
  board every time; not fed by the rest of the tool).
- FIX PLAN: (1) Verify persistence + "deliver secret → chronicle" in-browser. (2) Add a
  "Seed board from Session Prep" / "Pull open hooks & starred NPCs from this world" action so the
  board starts populated. (3) Confirm no dead buttons.

---

## RANKED FINDINGS (by GM impact)

1. **[BLOCKER · FIXED] Blank print/PDF (§0)** — killed BOTH paid PDF deliverables (Story Bible +
   Session Prep) and the Press recap. Feature output was an empty file. Highest impact; fixed in
   commit ec42cb0; needs a browser render-verify to fully close.
2. **[BLOCKER] Foundry export is a non-importable ARRAY (Feature 3)** — the app instructs
   "right-click → Import Data", which cannot ingest an array; the feature's core promise fails
   when followed. Document shapes are correct, so the fix is small (emit one combined entry).
3. **[MAJOR] Session Prep context/connection gaps (Feature 4)** — default depth hides
   secrets/oracle; hook/secret field-model drift can silently drop authored content; no PC/party
   continuity. The prompt CRAFT is fine; the WIRING under-delivers "grounded in your world".
4. **[MAJOR ENHANCEMENT] Tonight ignores the active world (Feature 5)** — brilliant one-shot, but
   a worldbuilding tool should let "Tonight" run inside the world the GM already built.
5. **[MAJOR] Campaign starts empty every time (Feature 6)** — works and is connected to
   characters, but nothing seeds the board from the world or from AI prep; high manual friction.
6. **[MINOR→MAJOR, pending diff] JSON export round-trip fidelity (Feature 1)** — complete dump,
   but re-import reconstructs only known fields; verify no silent field loss for worlds with
   hooks/secrets/locations/campaign data.

## VERIFICATION LEDGER (what is / isn't browser-verified)
- Code trace + compile check: DONE for all 6 + the print fix (main app block compiles; offending
  selector removed; global rule intact).
- Foundry import contract: researched against Foundry KB (single-document Import Data). NOT tested
  in a live Foundry instance (out of scope/no Foundry here) — conclusion rests on the documented
  import behavior + confirmed array vs single-object mismatch.
- Browser render of the PDFs (does content now appear), actual export BYTES (JSON + Foundry),
  and JSON round-trip diff: PENDING. Playwright + Chromium are now installed in the scratchpad;
  next step is a headless run that loads Solis Prime, triggers each export, and captures reality.
