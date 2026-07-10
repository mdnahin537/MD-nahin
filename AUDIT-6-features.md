# RealmWright — Audit of 6 Export/Mode Features

Branch: `claude/magical-mayer-YwP53` (PR #9) · File: `realmwright-v7.html` (~26k lines)
Example world for exercising: **Solis Prime** (front door → "🌍 Load an example world").
Status legend: ✅ verified in browser · 🔬 code-traced (not yet browser-verified) · ⏳ pending

> CORRECTION (browser-verified): the front-door "🌍 Load an example world" (`#fd-load-example`)
> loads a fully-built world whose active nation is named **"Solis Prime"** (Near-Future /
> Corporate Sovereignty, ruler Director-Emerita Iolanthe Marr) — NOT the bare "Meridian" entry
> in the `EXAMPLES` array (L5807). This front-door world is RICH: 10 stats, 7 chronicle events,
> 2 factions, **4 characters, 2 locations, 3 hooks, 2 secrets**. So it DOES exercise hooks/
> secrets/characters/locations. (Wherever notes below said "the example has no hooks/secrets",
> that referred to the Meridian seed row, not the front-door world. The rich world is `_preBaked`.)

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

**Status: FIXED and BROWSER-VERIFIED (commit ec42cb0).**
Empirical proof (headless Chromium, loaded the front-door example world "Solis Prime",
clicked Export ▾ → Export as Story Bible (PDF) → Generate PDF, then measured under `print` media):
- `.print-preview__page` computes `display:block`, bounding rect **1280×2865px** (real content).
- `.print-preview` wrapper computes `display:block` — this is the element the OLD `#print-container`
  rule was hiding; it is now visible. No ancestor computes `display:none`.
- The non-preview sibling `#app` computes `display:none` under print — the global rule works.
- `page.pdf()` produced a **176 KB** PDF (a blank PDF is ~5–10 KB). Extracted PDF text begins:
  "§ Solis Prime · Near-Future · Corporate Sovereignty · Year 2188 · Ruler: Director-Emerita
  Iolanthe Marr … Stability: 54 — TENSE … STATS … Legitimacy 44 … FACTIONS … The Shadowclaw Clan …"
  → the realm's real content is in the PDF. Before the fix this was blank.
Compile check: main app block compiles clean; offending selector count 0; global rule intact.
(Session Prep PDF shares the same render tail and the same fix; its render path is now unblocked —
the only reason it wasn't exercised live is that it requires a user API key for the AI step.)

---

## 0b. HIGHER-IMPACT PRINT BUG — PDF silently TRUNCATES to one page (found on re-verification)

**Severity: BLOCKER (worse than §0 — it is INVISIBLE: you get *a* page, just missing everything
after the first ~720px).**

### Root cause (code-traced + browser-proven)
After §0 unblocked the content, Story Bible (and ANY document longer than one page — the common
case) still came out as a **single page**, dropping Chronicle onward with no visual sign anything
was missing. Cause: the base styles
`html{font-size:16px;height:100%;overflow:hidden}` (L2154) and
`body{…height:100vh;overflow:hidden…}` (L2157) are **never reset under `@media print`**, so
Chromium's paged output captured only the first viewport-height slice and clipped the rest.

### Fix — LANDED + BROWSER-VERIFIED (committed)
Added `html,body{overflow:visible!important;height:auto!important}` INSIDE the `@media print`
block at L3850. Re-verified: the same "Solis Prime" content with all sections enabled now
produces a **6-page, 779 KB PDF** whose text includes the previously-missing sections —
`CHRONICLE`, the faction "Shadowclaw", chronicle content ("Conduit", "Warrants", "Marr"), and a
stability-math appendix whose tail reads "Final: 54 (TENSE) § § § -- 6 of 6 --". On-screen page
`scrollHeight` = 3228px (well past one printed page) now flows across all 6 pages. Compiles clean.

### Affects
Feature 2 (Story Bible) and Feature 4 (Session Prep) and the Press recap — every multi-page PDF.
This is the exact "looks fine but silently broken" class the owner flagged.

---

## FEATURE-BY-FEATURE (filled in as traced)

### 1. "Export as JSON" — handler L24005 → `exportJSON('single')` (def L12617)
- CLAIMS: dump the world as JSON.
- ✅ BROWSER-VERIFIED (bytes captured): exporting the front-door "Solis Prime" produced 27,179
  bytes of **valid JSON**. Top keys: `format,version,schemaVersion,exportedAt,nation`. The
  `nation` object carried ALL 34 of its keys, including every entity array:
  stats(10), factions(2), chronicle(7), characters(4), locations(2), hooks(3), secrets(2),
  plus laws, artifacts, relations, sessions, fronts, bestiary, glossary, notes, oracleLog,
  turnLog, pressArchive, tables, housePressures, metadata, etc. → **the export is COMPLETE for
  a single world** (nothing silently dropped on the way OUT). `meta` (incl. API key) correctly
  excluded. Round-trip fidelity (the way BACK, via buildNationFromSeed) = see verification ledger.
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
- SEVERITY: **MINOR** — ✅ round-trip VERIFIED essentially lossless. Export→re-import→re-export
  of "Solis Prime": the re-imported nation kept **36 of 37 keys**; the ONLY changes were
  `name` "Solis Prime"→"Solis Prime 2" (intentional de-dup on import) and `_preBaked` dropped
  (internal example flag, correctly stripped). ALL entity arrays (stats, chronicle, factions,
  characters, locations, hooks, secrets, …) round-tripped byte-identical. No user data lost.
- FIX PLAN: No correctness fix needed. Only OPTIONAL polish: add a clearly-labelled "Full backup
  (all realms + settings, no API key)" export for GMs who expect a whole-app backup, since the
  current export is per-world by design. Low priority.

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
- ✅ BROWSER-VERIFIED (bytes captured): export produced 15,260 bytes whose **top level is a JSON
  ARRAY of 6 entries** (`topLevelIsArray: true`). entry[0] = "Solis Prime — Realm Overview",
  keys `_id,name,pages,folder,sort,ownership,flags,_stats`, `_stats.coreVersion:"12"`, 2 pages;
  page[0] keys `_id,type,name,title,text,sort,flags`, `type:"text"`, `text.format:1`. No secret/
  private markers present (public-only default holds). → **CONFIRMS the diagnosis exactly: the
  per-document shapes are correct, but the ARRAY container cannot be imported via the instructed
  single-document "Import Data" flow.**
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
- ✅ FIX LANDED + BROWSER-VERIFIED (commit ffb9daf): `build()` now flattens every category's
  pages into ONE `JournalEntry` ("<Realm> — Story Bible"), prefixing each page name with its
  category and re-sequencing `sort`; `download()` serializes that single object and the toast now
  gives the correct steps (create a Journal Entry → right-click → Import Data → choose file).
  Verified: output `isArray:false`, 18 pages, all pass Foundry page-shape (`type:text`,
  `text.format:1`), unique `_id`s, strictly increasing `sort`, secrets still excluded. Imports in
  one click. (NPCs remain journal pages, not Actors — intentional/system-agnostic; see plan C below
  for a future Actors option.)
- ✅ SAFETY + COMPLETENESS RE-VERIFIED on the rich "Solis Prime" world (4 characters, 3 locations,
  2 private secrets, 2 private + 5 public chronicle events):
    - INCLUDES all 4 Character pages (Cedric Vell, Magistrate Sera Vell, Dust, Iolanthe Marr) and
      both Location pages. ✓
    - Exports ONLY the 5 PUBLIC chronicle events; both `private` events excluded. ✓
    - **No GM secret leaks into the player-importable file:** none of the secret CONTENT sentences,
      no "Secret —" page, no `[secret]`/`forecast` markers, and no private-chronicle descriptions
      appear anywhere in the serialized export (checked full text, case-insensitive). The only
      incidental hits were benign: a PUBLIC hook titled "The Sealed Warrants" (hooks are player-
      facing) and the adjective "private" inside a location description ("Marr's private office") —
      NOT secret data. → **safe to hand to players.**
  Original fix-plan options retained for reference:
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
    1. ✅ (Done, §0) print fix → PDF renders.
    2. ✅ (Done, commit after ffb9daf) **Normalized the hook/secret filters** — this was the big
       one. BROWSER-DATA-VERIFIED impact on the example world: `activeHooks` 0 → **3**
       ("The Sealed Warrants", "The Land Titles' Buyer", "Dust's Spire Source"),
       `availableSecrets` 0 → **2** (Magistrate Vell's sealed warrants; the 2181 Conduit Raids).
       The AI now actually receives the world's authored hooks/secrets instead of empty arrays.
       (This is the concrete "not connected" defect, root-caused and closed.)
    3. OPTIONAL (deferred — has a per-call TOKEN COST tradeoff, so it's Hunter's call, not
       unilateral): raise the context floor for this call to `tier:'high'` so `buildContext`
       also includes Oracle log + all hooks. Lower priority now that hooks/secrets reach the
       model via the user prompt (fix 2) even at the default `mid` tier. One-line change at the
       `buildContext(n,{...})` call (~L14962).
    4. OPTIONAL enhancement: add a "Party / where we left off" textarea to the session-prep modal
       and thread it into `userPrompt` so ongoing tables get real PC continuity. (Bigger; a
       genuine usefulness upgrade, but a new UI surface — schedule deliberately.)
    NOTE: AI OUTPUT quality itself was NOT run live (needs the user's OpenRouter key). The prompt
    CRAFT is good (see evaluation); fix 2 repairs the WIRING that was starving it.

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

0. **[BLOCKER · FIXED] PDF silently TRUNCATES to one page (§0b)** — the WORST of the print bugs
   because it is invisible: after the blank bug was fixed, every multi-page PDF (the common case)
   still dropped Chronicle onward, showing only page 1 with no sign anything was missing. Root:
   `html/body` `overflow:hidden;height:100vh` never reset under print. FIXED + verified (6-page,
   779 KB PDF now contains the previously-missing sections). Affects Features 2 & 4 + Press recap.
1. **[BLOCKER · FIXED] Blank print/PDF (§0)** — killed BOTH paid PDF deliverables (Story Bible +
   Session Prep) and the Press recap. Feature output was an empty file. Fixed (commit ec42cb0) and
   browser-verified (176 KB PDF with real content).
2. **[BLOCKER · FIXED] Foundry export was a non-importable ARRAY (Feature 3)** — the app
   instructs "right-click → Import Data", which cannot ingest an array; the feature's core promise
   failed when followed. FIXED (commit ffb9daf): now one importable JournalEntry (18 valid pages),
   browser-verified. **Safety re-verified on rich data:** includes characters+locations, and NO GM
   secret / private chronicle leaks into the player-importable file. Fully closed.
3. **[MAJOR · CORE FIX LANDED] Session Prep was dropping the world's hooks & secrets (Feature 4)**
   — hook/secret field-model drift silently sent the AI EMPTY hooks/secrets (0 of 3 hooks, 0 of 2
   secrets on the example world). FIXED + data-verified (0→3 hooks, 0→2 secrets now reach the AI).
   The prompt CRAFT was already fine; this repaired the WIRING that starved it. Remaining items
   (context-depth floor, party-continuity input) are optional and noted in Feature 4.
4. **[MAJOR ENHANCEMENT] Tonight ignores the active world (Feature 5)** — brilliant one-shot, but
   a worldbuilding tool should let "Tonight" run inside the world the GM already built.
5. **[MAJOR] Campaign starts empty every time (Feature 6)** — works and is connected to
   characters, but nothing seeds the board from the world or from AI prep; high manual friction.
6. **[MINOR · VERIFIED OK] JSON export round-trip fidelity (Feature 1)** — complete dump AND
   verified lossless round-trip (36/37 keys; only intentional de-dup rename + internal-flag
   strip). Works. Optional polish only (a labelled whole-app backup export).

## RELATED FINDING (adjacent to the 6, NOT yet fixed — documented for a follow-up)

**Same field-shape bug class in the "New Session" logging modal** (`openNewSession`, ~L20692):
its "hooks closed" and "secrets deployed" multi-selects filter `h.status==='open'` (L20704) and
`s.status==='undeployed'` (L20712). On a fixture/authored world (the example world included),
hooks have `{resolved:false}` (no `status`) and secrets have no `status` → both lists render
EMPTY ("No open hooks" / "No undeployed secrets") though the world has 3 hooks and 2 secrets.
So a GM logging a session cannot check off the hooks/secrets they used.
- **Deeper issue:** fixture hooks also lack an `id` (keys: title,description,resolved,
  relatedFactions), but the checkbox uses `data-hid="${h.id}"` — so simply loosening the filter is
  NOT enough; a fixture hook would post `undefined` as its id. Needs hook-`id` backfill (assign
  ids to hooks lacking them, e.g. in `buildNationFromSeed` or a one-time migration) BEFORE the
  filter fix, or the modal will look fixed while still not working. This is why I did NOT patch it
  here — a half-fix would violate the "what it says is what it does" bar.
- **Recommended fix (follow-up):** (1) backfill `id` on any hook missing one at load/migration
  time; (2) then normalize the two filters to the tolerant form used in the Session Prep fix.
  Also audit the Campaign secret-deploy path (L20936) and NPC-status path for the same shape drift.
- Severity: **MAJOR** for the Sessions feature's usefulness on authored worlds; out of the 6-feature
  mandate, so logged rather than fixed in this pass.

## VERIFICATION LEDGER (what is / isn't browser-verified)
- ✅ Code trace + compile check: DONE for all 6 + the print fix (main app block compiles clean;
  offending selector count 0; global `.print-preview` rule intact).
- ✅ Print/PDF BLANK fix (§0): BROWSER-VERIFIED. Story Bible PDF renders real content
  (display:block under print media, 176 KB PDF, extracted text = the realm's actual data).
- ✅ Print/PDF TRUNCATION fix (§0b): BROWSER-VERIFIED. Same content (all sections on) now = a
  6-page, 779 KB PDF containing the previously-clipped Chronicle/factions/appendix ("6 of 6").
- ✅ JSON export bytes: captured (27 KB, valid, all 34 nation keys incl. every entity array).
- ✅ JSON round-trip: VERIFIED lossless (36/37 keys; only intentional de-dup rename + `_preBaked`).
- ✅ Foundry export (POST-FIX): BROWSER-VERIFIED on the rich "Solis Prime" world — single
  importable JournalEntry (18 valid pages); INCLUDES characters + locations; and leaks NO GM
  secret / private-chronicle content into the player file (full-text case-insensitive check).
  (Still NOT tested inside a live Foundry app — none available; the import contract rests on
  Foundry's documented single-document "Import Data" behavior, which the single-object output meets.)
- ⏳ Session Prep / Tonight AI OUTPUT quality: NOT run live — requires the user's OpenRouter API
  key (Copilot). Prompts were evaluated by reading the code (buildContext + all system prompts).
  The Session Prep PRINT path is unblocked by the §0 fix (shares the same render tail).
- ⏳ Campaign persistence + "deliver secret → chronicle" + dead-control sweep: NOT browser-run yet
  (code-traced only).
