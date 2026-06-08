# RealmWright V7 — Desktop Test Runbook (Phase 3)

**What this is:** A click-by-click script to confirm, in a real desktop browser, the audit
findings that code-reading alone could not settle (this analysis ran in a container with no
browser). Every step below maps to a specific finding ID and line reference in
`REPORT-v2.md`. Run through it once; tick the checklist at the end.

**Time:** ~20–30 minutes for all 10 steps. Section A (eyeball checks, no DevTools) is
~12 minutes; Section B (DevTools / crafted-input checks) is ~15 minutes and is more advanced.
You can stop after Section A and still confirm the highest-value findings.

**Requirements:**
- Chrome or Edge (desktop), the `RealmWright_V7.HTML` file, and a few minutes of uninterrupted time.
- Section B requires comfort opening DevTools (F12) and typing short commands into the Console.
- Two steps need a **pre-existing condition** — flagged inline — that you should set up first
  (an OpenRouter API key for steps 5/6, an old pre-2.5.0 save file for step 8).

**How to run it:** Open the `.HTML` file by double-clicking it (this is how the product is
designed to be used — `file://` in the address bar). Work through steps in order; A first
(no setup needed beyond the app itself), then B. Do not use the app for real worldbuilding
during this pass — some steps intentionally feed it bad data.

---

## DevTools & IndexedDB primer (read this once before Section B)

You only need this for steps 5–10. Steps 1–4 need nothing but the mouse.

**Opening DevTools:**
1. With the app open in Chrome/Edge, press **F12** (or right-click anywhere on the page →
   "Inspect"). A panel opens — usually docked to the right or bottom of the window.
2. Across the top of that panel are tabs: **Elements / Console / Sources / Network /
   Application / …** Click between them as instructed below.

**Reading the Console (steps 7, 8, 9):**
- Click the **Console** tab. This is where the app prints errors (in red) and where you can
  type one-line commands and press Enter to run them immediately.
- A **red line starting with "Uncaught TypeError"** is exactly the crash signal these steps
  are looking for — that's a PASS (confirms the bug), not something you broke.

**Looking at IndexedDB (steps 5, 7 setup):**
1. Click the **Application** tab (in Chrome) or **Storage** tab (in Edge/Firefox-style panels).
   If you don't see it, click the **»** (more tabs) chevron at the end of the tab row.
2. In the left sidebar, expand **IndexedDB** → **realmwright** → **kv**. This is the app's
   single key-value object store (confirmed in source: `indexedDB.open('realmwright',1)`,
   store name `'kv'`).
3. Click **kv** to see the stored keys/values in the main pane. Useful keys you'll encounter:
   `rw_license_v1` (the license record), `rw_backup_handle` (the chosen backup folder), and
   the realm/state blob itself. Double-click a value cell to see/edit its JSON.
4. To force a refresh after you edit a value, right-click **kv** → **Clear** is destructive —
   don't do that. Instead just re-click the key to re-read it, or reload the page (F5) to see
   if your edit was picked up where the step calls for a reload.

**Counting event listeners (step 10):**
1. Click the **Elements** tab (Chrome) and select the `<html>` or `document` node at the top
   of the DOM tree (click the very first line in the tree).
2. In the right-hand sidebar, find the **Event Listeners** tab (you may need to click **»**
   to find it). Tick **"Ancestors"** if shown, so it reports listeners bound on `document`
   itself (most of the app's leaks are bound there, not on visible elements).
3. Expand an event name (e.g. `click`, `keydown`) to see how many separate handler functions
   are registered for it. The number in parentheses next to the event name is your count —
   watch it climb across repeated open/close cycles.

**Dispatching a custom event from the Console (step 9):**
- Type a one-line JavaScript command directly into the Console and press Enter. The app
  reacts to it exactly as if the real event had fired internally — this is how you can
  trigger an "invisible" code path on demand to see (or fail to see) its on-screen effect.

That's the whole toolkit. Nothing here requires installing anything — it's all built into
the browser.

---

## SECTION A — Eyeball checks (no DevTools needed, ~12 min)

These four steps need nothing but the mouse and your eyes. Do them in order — step 2 changes
the theme, so do step 1 (which depends on the default Ember theme's modal) first.

---

### Step 1 — FrontDoor modal reappears on every launch
**Pre-existing condition:** none. Works fresh out of the box.

**Exact actions:**
1. Double-click the `.HTML` file to open it. A welcome/generate modal ("Generate session" /
   "Try a sample first" / "Activate license" buttons) should cover the screen with the
   background scroll-locked.
2. Click the **×** close button (top-right of the modal) or press **Escape** to dismiss it.
3. Press **F5** (or Ctrl+R) to reload the page. Watch what happens on load.
4. Dismiss the modal again. Reload a second time (F5).

**Expected (buggy) result:** The modal opens and scroll-locks the page on **every single
reload** — including the second and third time — exactly as it did on first launch. You never
see a "Welcome back" toast instead.

**PASS looks like:** Modal reappears, full-screen, scroll-locked, on reload #1 AND reload #2 —
identical to the very first launch. No "Welcome back, [your realm name]" toast ever appears.
**FAIL looks like:** On the second or third reload, instead of the modal you get a small
"Welcome back" toast and the dashboard loads directly without the modal blocking it.

**Confirms:** **C09-1** — `firstRunComplete` flag is created `false` (L6418) and is never
set to `true` anywhere in the 17,864-line file (grep-dispositive: it appears only 3 times,
never as an assignment to `true`). The bootstrap check at L17498 (`if(!firstRunComplete)`)
therefore always takes the FrontDoor branch; the "Welcome back" branch (L17509) is dead code
for everyone, forever.

---

### Step 2 — Theme switch breaks Manuscript & Modern (visual regression)
**Pre-existing condition:** none. Best done with at least one faction and one character
already in your realm so there's something visible to judge (the seed/sample realm has both).

**Exact actions:**
1. Open **Settings** (gear icon / nav). Find the **Theme** row — three pill buttons labeled
   **Ember**, **Manuscript**, **Modern**.
2. Click **Manuscript**. Look at the World Shell dashboard (the main view): faction cards
   (with avatars and loyalty bars), the relationship-web panel, and the global-search panel.
3. Switch to **Modern**. Look at the same elements again.
4. Open the **Encounter Builder** (via the nav / arsenal area) and look at its input fields
   and any generated handout text.
5. Switch back to **Ember** to compare — this is the "control" theme where everything should
   look correct/styled.

**Expected (buggy) result — three separate breakages, all visible only OFF Ember:**
- **(a) Faction avatars & loyalty bars:** in Ember they're styled circular avatars with
  colored progress-bar "loyalty" tracks under each faction name; in Manuscript/Modern these
  elements render with no size, no background, no border — avatars collapse to nothing and
  loyalty bars are invisible (the CSS that draws them, including the bar-fill, is scoped
  `body.theme-ember` only — `.wms-fc-avatar` L931/935, `.wms-fc-loyalty*` L939–946).
- **(b) Relationship-web & search panels:** these panels keep a **hardcoded dark background**
  in Manuscript/Modern — visibly clashing with the lighter Manuscript parchment look or the
  Modern palette, because their colors are hardcoded dark rather than theme-aware (C14-8).
- **(c) Encounter-Builder fields & handout text:** input field borders/backgrounds and the
  generated handout body text render with no visible box/sizing in ALL themes (not just
  non-Ember) — these use CSS custom properties (`--color-surface-1`, `--color-text-body`,
  `--text-body-md`, etc.) that are referenced but **defined nowhere** in the stylesheet
  (9 such variables, confirmed 0 definitions each — table in `04a-themes.md`).

**PASS looks like:** Switching to Manuscript/Modern, you see broken/missing faction avatars
and invisible loyalty bars, dark-clashing web/search panels, and unstyled Encounter Builder
fields/handout text — a visible "this theme is half-finished" regression compared to Ember.
**FAIL looks like:** All three themes look equally polished — avatars, loyalty bars, panel
colors, and Encounter Builder all render consistently regardless of which theme is active.

**Confirms:** **C14-5** (WorldShell structural elements — avatar/loyalty CSS — exist only
under `body.theme-ember`, L900–982), **C14-8** (web/search panels hardcoded dark, wrong on
non-Ember backgrounds), **C14-2** (9 CSS custom properties used but defined nowhere — affects
Encounter Builder fields and handout text in EVERY theme, including Ember).

---

### Step 3 — Secret-leak: AI-tagged "Private"/"secret" events show to players, and the Show-Secrets toggle doesn't refresh
**Pre-existing condition:** none, but you need a realm with a chronicle (the sample realm
works). You'll be pasting a hand-crafted block of text — no AI account needed for this step.

**Exact actions — Part 1 (the leak):**
1. Open **Settings**. Confirm **"Show secrets in chronicle"** / the **Secrets** toggle
   (small toggle button labeled "Secrets", tooltip "Show/hide private events", in the
   chronicle band controls) is **OFF** — i.e., a GM who does NOT want players to see hidden
   events.
2. Find the **"▼ Paste AI Response"** button (in the Arsenal/sidebar area — this is the AI
   canon-import flow). Click it to open the paste modal.
3. Paste a hand-typed block that mimics an AI canon response containing one event line with
   capitalized or synonym visibility, e.g. a line shaped like:
   `Event: The Betrayal | Political | 5 | Private | The duke's plot is exposed`
   (pipe-delimited: name | type | weight | **visibility** | description — capital "Private").
   You can also try `secret` (lowercase synonym) on a second line as a stronger test.
4. Review the candidates the app shows you and click **Apply** (accept the candidate).
5. Look at the **player-facing chronicle / timeline** (the main on-screen history band, NOT
   any GM-only view) — the default WorldShell dashboard view a player would see over your shoulder.

**Expected (buggy) result:** The event labeled `Private` (capital P) — and/or `secret` —
**appears directly on the visible timeline**, exactly like a normal public event, even though
"Show secrets" is OFF. An event you tagged lowercase `private` correctly stays hidden — only
the off-spec capitalization/synonym leaks. (Node-proof from the audit: 3 of 5 realistic
AI-tagged hidden-event labels leaked through this exact filter.)

**Exact actions — Part 2 (the dead toggle):**
6. With at least one correctly-tagged lowercase `private` event now visible somewhere (or
   visible from a prior state), click the **Secrets** toggle to turn "Show secrets" **ON**,
   confirm the event appears, then click it again to turn it **OFF**.
7. Watch the main visible timeline (NOT the hidden legacy band) the instant you click — does
   it visibly redraw / does the private event vanish or appear immediately?

**Expected (buggy) result for Part 2:** Nothing visibly changes on the main timeline at the
moment you click the toggle. The on-screen list of events stays exactly as it was — secrets
that were showing keep showing, secrets that were hidden stay hidden — until some unrelated
action (dragging a stat slider, undo, importing) forces a full repaint.

**PASS looks like:** (1) The `Private`/`secret`-tagged event appears on the player timeline
despite "Show secrets" being off, AND (2) clicking the Secrets toggle produces no immediate
visible change to that same timeline.
**FAIL looks like:** (1) Only correctly-lowercase-tagged events ever show/hide correctly —
`Private`/`secret` stay hidden too, AND (2) the timeline visibly redraws the instant you
click the toggle.

**Confirms:** **C03-4** (root — `CLAMP` has no visibility clamp, L5863, so `"Private"`/`"secret"`
is stored verbatim), **C08b-2/C01-3/C06-2** (the player-facing filter at **L14277** matches
only exact lowercase `'private'`/`'forecast'`), **C10-1** (the toggle handler, L16274–16285,
calls only the legacy hidden band's render — `setSetting` at L7000 never re-renders
WorldShell, so the visible default-layout timeline never refreshes on demand).

---

### Step 4 — Coverage gaps: Fronts & Relations vanish from export/PDF/search, and search results dead-end
**Pre-existing condition:** none, but create the test data first (sub-steps 1–2).

**Exact actions:**
1. Open the **Fronts & Clocks** panel and click **"+ New Front"**. Fill in a name (e.g.
   "Test Front") and save it.
2. Open the **Relations** panel and add one relation between two existing characters/factions
   (use whatever "add" affordance the panel shows — the sample realm gives you characters
   and factions to relate).
3. Open the export menu and click **"Export to Foundry VTT"**. Open the downloaded `.json`
   in a text editor (or just glance at the toast/structure) — search for "Test Front" or your
   relation's name.
4. Click **"Generate PDF"** (Story-Bible export). Open the resulting PDF and search (Ctrl+F)
   for "Test Front" and your relation's name.
5. Press **Ctrl+K** (or Cmd+K on Mac) to open Global Search — or click the search icon. Type
   "Test Front" and press Enter; then search for your relation's name; then search for any
   Artifact or Glossary term you have.
6. Now search for an existing **character name** or **faction name** (something you know
   exists). Click directly on that search result.

**Expected (buggy) result:**
- **(a)** "Test Front" and your relation are **absent** from both the Foundry export JSON
  and the generated PDF — the export toast still claims success ("Exported N Foundry journal
  entries") with no mention that Fronts/Relations were skipped.
- **(b)** Searching for "Test Front", your relation, any Artifact, or any Glossary term
  returns **zero results** — the search box behaves as if these entity types don't exist.
- **(c)** Clicking a **character** or **faction** search result **closes the search modal and
  does nothing else** — the screen doesn't navigate anywhere, no panel opens, nothing
  highlights. (An **event** result behaves the same way — dead-ends.) By contrast, clicking a
  **secrets**, **hooks**, **sessions**, **locations**, or **bestiary** result correctly opens
  its panel.

**PASS looks like:** All three (a)/(b)/(c) reproduce exactly as described — Fronts/Relations
missing from both exports, 4 entity types unsearchable, and character/faction/event result
clicks visibly do nothing (modal closes, screen unchanged).
**FAIL looks like:** Your Test Front and Relation appear in the exported JSON and PDF, all
entity types are searchable, and clicking any search result (including character/faction/event)
navigates you to the right place on screen.

**Confirms:** **C07-1** (Foundry export builder array, L8941, has no `_buildFronts`/
`_buildRelations` — also drops Bestiary/Glossary/Artifacts from this surface specifically),
**C11-3** (Story-Bible PDF, L8963–9202, has no Fronts/Bestiary/Relations section — Artifacts
and Glossary actually ARE in the PDF, so don't expect those two missing here), **C12-1**
(GlobalSearch index, L15525–15582, has no `fronts`/`relations`/`artifacts`/`glossary` groups),
**C12-2** (search `_activate()`, L15619–15623, maps `characters`/`factions`/`events` to
DOM panel IDs — `panel-war-room`/`panel-chronicle` — that don't exist, so `openPanel` returns
early and the click does nothing).

---

## SECTION B — DevTools / crafted-input checks (~15 min, more advanced)

These six steps need the DevTools primer above. Two (5, 6) need a real OpenRouter API key
first; one (8) needs an old save file. If you don't have those, skip to the steps you can run
and come back later — each is independent.

---

### Step 5 — API key lands in the backup file in PLAINTEXT
**Pre-existing condition: REQUIRED — you need a real (or dummy-but-real-format) OpenRouter
API key.** A key starting `sk-or-v1-...` of at least 10 characters satisfies the app's check
(`copilotKey.length>10`). A throwaway/test key is fine — the point is just to see it land
on disk in readable text.

**Exact actions:**
1. Open **Settings → Copilot**. Paste your key into the **"OpenRouter API key"** field
   (placeholder `sk-or-v1-...`) and click **"Save key"**.
2. Trigger a backup write. Either:
   - **(a)** If the app prompts you to "Set up backup" (or you find that option in Settings/
     AutoSave), click it, choose a folder via the native file-save dialog, and let it write —
     OR
   - **(b)** If your browser doesn't support the native file-picker (the app calls this the
     "fallback download" path), it will instead download a file named
     `realmwright-backup-YYYY-MM-DD.json` straight to your Downloads folder. Force this by
     triggering whatever "back up now" / "download backup" action the app exposes.
3. Locate the saved `.json` file (your chosen backup folder, or Downloads) and open it in a
   plain text editor (Notepad, TextEdit, VS Code — NOT a browser, which might pretty-print
   and hide the raw text).
4. Press Ctrl+F (or your editor's find) and search for the first several characters of the
   key you pasted (e.g. `sk-or-v1-`).

**Expected (buggy) result:** The search finds your key sitting in **plain, readable text**
inside the JSON, under a field named `copilotKey` (e.g. `"copilotKey":"sk-or-v1-yourkey..."`)
— nested somewhere under `meta.settings`. It is NOT masked, hashed, encrypted, or replaced
with `null`.

**PASS looks like:** Opening the backup `.json` in a text editor and searching for your key
finds it in full, plaintext, attached to `"copilotKey":`.
**FAIL looks like:** The `copilotKey` field is `null`, missing, masked (e.g. `sk-or-***`), or
the key string cannot be found anywhere in the file.

**Confirms:** **C05-6** — `AutoSave._write` (file-handle path, L6301–6303) and
`_fallbackDownload` (L6318) both serialize raw `JSON.stringify(State.data,...)`, bypassing
the `_stateForPersist()` scrub (L6604–6612) that nulls `copilotKey` for every OTHER storage
path (IndexedDB, localStorage mirror, snapshots). The key is confirmed live in
`State.data.meta.settings.copilotKey` at runtime (re-hydrated from the secrets store on every
load, L6637/6664) — so this is the one path where it leaks to disk in the open.

---

### Step 6 — Restoring a snapshot silently breaks AI until you reload
**Pre-existing condition: REQUIRED — same API key as step 5, already saved and confirmed working**
(e.g. open the Copilot/Tonight Mode panel and confirm it responds to a prompt before you start).
You also need at least one **auto-snapshot** to exist — these are created automatically; if
none exists yet, check Settings/Snapshots for a "create now" option, or simply use the app for
a few minutes (edit a stat, add an event) and check again — `snapshotIfDue` fires on first load
in practice (a separate minor finding, GAP-3, notes the "after 24 hours" copy is misleading —
expect a snapshot to already exist from minute one).

**Exact actions:**
1. Confirm the AI/Copilot works right now: open the Copilot panel, type a short prompt, and
   get a response.
2. Find the **Snapshots** UI (likely in Settings or a dedicated panel) and **restore** the
   most recent auto-snapshot.
3. Immediately — without reloading the page — try the AI again: open Copilot, type a prompt,
   and send it.
4. THEN reload the page (F5) and try the AI a third time.

**Expected (buggy) result:** Step 3's AI call **fails** (an error toast like "needs an
OpenRouter API key" or similar, even though you just confirmed it worked in step 1 and never
touched the key field). Step 4's AI call, after the reload, **works again** — with no further
action from you.

**PASS looks like:** AI works → restore → AI now fails with a key-related error, with no
explanation of why → reload → AI works again, fully recovered, automatically.
**FAIL looks like:** AI continues to work immediately after the restore, with no interruption,
no reload needed.

**Confirms:** **GAP-1** — `snapshotIfDue` deliberately nulls `copilotKey` before storing the
snapshot (L7016, so the secret never sits in the snapshot blob) but `State.commitRestore`
(L7074–7080) replaces the live state with that nulled blob and never re-hydrates the key —
`Secrets.loadKey()` is called only from `State.load()` (cold/warm boot, L6637/6664), not from
the restore path. Node-proven: `runtime copilotKey before: "sk-or-LIVEKEY..."` →
`after restore: null`. Recoverable by a full page reload (which re-runs `State.load`), so the
damage is "AI breaks with no explanation until you figure out to reload" — not permanent loss.

---

### Step 7 — A name-less faction crashes every future AI-canon paste
**Pre-existing condition:** none beyond DevTools comfort — you'll create the bad data yourself
via IndexedDB editing.

**Exact actions:**
1. Open **DevTools → Application/Storage → IndexedDB → realmwright → kv** (see primer above).
2. Find the key holding your realm/state data (it will contain a large JSON blob with a
   `nations` array). Double-click its value to open the editor.
3. Inside that JSON, locate `nations[0].factions` (an array of faction objects, each normally
   shaped like `{"id":"...", "name":"The Crown Loyalists", ...}`). Edit ONE faction object to
   **remove its `"name"` field entirely** (delete the `"name":"..."` key-value pair, leaving
   `id` and the rest intact — don't set it to an empty string, actually delete the key).
   Save/commit the edit in the IDB editor, then reload the page (F5) so the app picks it up
   from storage.
   - *(If the IDB editor is too fiddly: instead use the app's own Import feature with a
     hand-crafted `.json` containing one faction object that has an `id` but no `name` —
     `buildNationFromSeed` fills `id` automatically but never backfills `name`, so an
     imported name-less faction persists exactly the same way.)*
4. Open the **"▼ Paste AI Response"** modal (same one used in Step 3) and paste a block
   containing at least one `Faction:` line, e.g.:
   `Faction: The Iron Concord | Military | rising | A new mercenary company forms`
5. Click through to apply/accept the candidates.

**Expected (buggy) result:** The paste **throws an error mid-application**. Some of the
candidates from your pasted block (e.g. an event or character, if your block had any before
the faction line) appear to land in the realm; the faction itself and anything after it in
the block do not. After you reload the page, **none of it persisted** — the realm looks as if
the paste never happened (or is in a confusing half-state), because the crash skipped the
final `persist()` call.

**PASS looks like:** Pasting a `Faction:` line after creating a name-less faction visibly
fails partway — some entities seem to apply, then nothing is saved after reload, and (if you
also watch the Console — see step 8) you'll see a red `TypeError: Cannot read properties of
undefined (reading 'toLowerCase')`.
**FAIL looks like:** The faction paste applies cleanly and persists correctly across reload,
with no crash, regardless of the name-less faction sitting in your data.

**Confirms:** **GAP-8 / GAP-9** — `applyCandidates`'s faction-dedup (L8371) calls
`f.name.toLowerCase()` with no guard on an EXISTING stored faction; a name-less faction
(reachable via import — `buildNationFromSeed` at L6350 fills `id` but never `name`) makes
this throw. The whole apply loop (L8355–8377) runs in a `try{...}finally{...}` with **no
`catch`**, so the throw propagates after some candidates already mutated `n.chronicle`/
`n.factions`, but BEFORE `State._touch/persist()` (L8378) — leaving a half-applied,
unpersisted, and (after reload) effectively reverted realm. (Note: this is reachable only via
malformed/imported data — the seed factions all have names, so a brand-new user's first paste
is safe; severity corrected to MEDIUM in the verified report.)

---

### Step 8 — Loading an old save and clicking "Fill & Copy" throws a TypeError
**Pre-existing condition: REQUIRED — an old save file from BEFORE schema version 2.5.0**
(check Settings/About for the current schema version; anything tagged e.g. `1.2.0`–`2.4.x`
qualifies). If you don't have one lying around, you can likely produce an equivalent by
importing/loading any sufficiently old exported `.json` you may have archived. **If you
genuinely have no old save, skip this step** — it cannot be manufactured cleanly from inside
the current app (the bug is specifically about saves that predate a structural field).

**Exact actions:**
1. Open DevTools → **Console** tab BEFORE you do anything else, so you can see errors as they
   happen.
2. Load/import your pre-2.5.0 save into the app. Let the migration run (it completes silently
   — the schema version will show as updated/current afterward).
3. Find the **"▶ Fill & Copy"** button (in the Arsenal area — it sends a prompt to your
   clipboard for pasting into ChatGPT/Claude — this is the "Fill & Copy" arsenal action).
   Click it.
4. Watch the Console.

**Expected (buggy) result:** A red error appears in the Console:
`TypeError: Cannot convert undefined or null to object` (from `Object.assign` on a missing
object) — and/or, depending on which path fires first, `TypeError: Cannot set properties of
undefined (setting 'promptPending')`. The "Fill & Copy" workflow-tracking silently breaks;
the button may appear to do nothing useful afterward.

**PASS looks like:** Clicking "Fill & Copy" on a migrated old save produces a red
`TypeError` in the Console mentioning `workflowState`/`promptPending`/`Object.assign`, and the
paste-back tracking visibly stops working.
**FAIL looks like:** No console error; "Fill & Copy" works exactly as it does on a brand-new
realm.

**Confirms:** **GAP-4** — `migrateIfNeeded` (L6419–6553) backfills many fields
(`firstRunComplete`, `preferredMode`, `snapshots`, etc.) but never `meta.workflowState`
(the only place it's created is `createDefaultState`, L6418). `setWorkflow` (L6997,
`Object.assign(this.data.meta.workflowState,ws)`) and `clearPending` (L6998,
`this.data.meta.workflowState.promptPending=null`) both deref it with no `?.` guard — a
fully-migrated-but-still-missing-`workflowState` save throws on first use of "Fill & Copy".
Node-proven against the real migration chain on a `schemaVersion:'1.2.0'` save.

---

### Step 9 — The license-expired toast is invisible (advanced — simulated trigger)
**Pre-existing condition:** none — you're triggering the event artificially, not waiting for
a real license failure (which the app is specifically designed to make hard to reproduce on
demand).

**Exact actions:**
1. Open DevTools → **Console** tab.
2. Type the following one line exactly and press Enter:
   ```
   document.dispatchEvent(new CustomEvent('license:expired'))
   ```
3. Immediately look at the screen — specifically the bottom area where toast notifications
   normally appear (you may have seen one earlier, e.g. "Undone."). Watch closely for ~1 second;
   if you blink you'll miss it.
4. Optionally, repeat the command 2–3 times in a row, watching each time.

**Expected (buggy) result:** **No visible toast appears** — or at most an imperceptible
flicker at the bottom of the screen. There is no readable message, and certainly no usable
"Re-activate" button you could click. This is the ONLY on-screen mechanism telling a paying
customer their license failed.

**PASS looks like:** Running the command produces no readable, clickable toast — nothing a
real user could read or act on appears, even though the handler clearly ran (you can confirm
the handler ran by checking `LicenseGate._updateStatusUI` effects elsewhere in the UI, e.g. a
status label change, if visible).
**FAIL looks like:** A toast reading "Your RealmWright license could not be verified. Please
re-activate." appears, stays on screen long enough to read, and offers a clickable
"Re-activate" button.

**Confirms:** **C13-2** — the handler at L17238–17241 calls
`showToast('...Please re-activate.', [{label:'Re-activate',...}], 0)` — the **third argument,
duration, is `0`**. `showToast` (L8098, L8124–8126) adds the `is-visible` class (kicking off a
240ms CSS fade-IN, `--duration-default:240ms` at L107) then immediately
`setTimeout(()=>t.classList.remove('is-visible'), duration)` with `duration=0` — the fade-OUT
is scheduled essentially instantly, reversing the fade-in before a human eye can register it.
(The identical `,0)` defect also exists on the two AutoSave-permission toasts at L6298/L6305 —
not separately tested here, but worth knowing they share the same invisible-toast bug.)

---

### Step 10 — Listener leaks: Relationship Web lag and Print Preview listener accumulation
**Pre-existing condition:** none.

**Exact actions — Part 1 (Relationship Web):**
1. Open the **Relationship Web** panel (nav item with that label, or via the web-svg view).
2. Click and hold on any node, **drag it around for about 5–10 seconds** (continuous motion,
   not a quick flick), then release.
3. Click on **empty background space** inside the web (not on a node) several times in a row —
   5–6 clicks, with a beat between each.
4. Watch for: visible lag/stutter on each background click, the selection flickering, and
   (if you have DevTools Performance/Console open) any sense that each click is doing
   noticeably more work than the last.

**Expected (buggy) result:** Each background click after a drag feels heavier than the last —
visible stutter, selection flicker, multiple redundant re-renders firing back-to-back. The
effect compounds: drag again, click again, and it gets worse. (Node-proof from the audit:
after 50 drag-frames, 51 stacked background-click listeners; the first subsequent click fires
all 51 at once and the count DOUBLES to 102; a second click doubles again to 204.)

**Exact actions — Part 2 (Print Preview):**
5. Open DevTools → **Elements** tab, select the `document`/`<html>` node, open **Event
   Listeners** in the sidebar (see primer), and expand the `keydown` entry. Note the count.
6. Open **Print Preview** (from the export/print area — generates a printable view of your
   realm). Click the visible **"Close"** button (NOT the Escape key) to dismiss it.
7. Repeat step 6 four or five times: open Print Preview, click **Close** (always the button,
   never Escape).
8. Re-check the `keydown` listener count in the Event Listeners panel.

**Expected (buggy) result:** The `keydown` listener count on `document` **climbs by exactly
one** each time you dismiss via the Close button — 5 cycles, 5 new permanent leaked listeners,
none ever removed. (Dismissing via **Escape** instead correctly removes its own listener —
try that once at the end for contrast: the count should NOT climb on an Escape-dismissal.)

**PASS looks like:** Part 1 — visible compounding lag/flicker on repeated background clicks
after dragging. Part 2 — the `keydown` listener count on `document` increases by one per
Close-button dismissal and never decreases, while an Escape-dismissal does not add to the count.
**FAIL looks like:** Part 1 — dragging and clicking the web background feels equally smooth no
matter how many times you repeat it. Part 2 — the `keydown` count stays constant regardless of
how you close Print Preview.

**Confirms:** **C11-1** (RelationshipWeb `_render()`, L15394, re-adds an unguarded
`svg.addEventListener('click',...)` on the persistent `#web-svg` element on every single
render — including the 6 render-triggering paths: drag-mousemove, pan, zoom, node-click, and
the bg-click handler's own recursive call) and **C11-2** (`PrintPreview.close()`, L14437–14438,
never calls `document.removeEventListener('keydown', onKey)` — only the Escape branch inside
`onKey` itself does, L14430 — so the Close button and "open a new preview over an old one"
both leak one `keydown` listener per dismissal, permanently, for the rest of the session).
Bonus, same family if you want to extend this check: **C12-3** (`AccuracyChip.mount`, L5715,
adds two more permanent `document` listeners every time you open one of 9 different modals —
bestiary, encounter, glossary, etc. — with no guard; watch the `rw:effort-changed` and
`sc:changed` listener counts climb the same way across repeated modal open/closes).

---

## Checklist — tick off as you confirm each one

Print this section or keep it open in a side window. Each line: PASS = bug reproduced
exactly as the audit predicted (confirms the finding is real and live); FAIL = bug did NOT
reproduce (would mean the finding needs re-investigation — flag it back for review, don't
assume it's fixed).

**Section A — Eyeball (no DevTools):**
- [ ] 1. FrontDoor modal reappears on EVERY reload, no "Welcome back" ever  → **C09-1**
- [ ] 2a. Manuscript/Modern: faction avatars/loyalty bars unstyled or invisible → **C14-5**
- [ ] 2b. Manuscript/Modern: relationship-web & search panels wrong/dark-clashing → **C14-8**
- [ ] 2c. ALL themes: Encounter Builder fields & handout text unstyled → **C14-2**
- [ ] 3a. `Private`/`secret`-tagged AI event LEAKS onto player-facing timeline → **C03-4 / C08b-2 / C10-2**
- [ ] 3b. Toggling "Show Secrets" does NOT visibly refresh the main timeline → **C10-1**
- [ ] 4a. New Front + new Relation MISSING from Foundry export AND Story-Bible PDF → **C07-1 / C11-3**
- [ ] 4b. Fronts/Relations/Artifacts/Glossary return ZERO results in Global Search → **C12-1**
- [ ] 4c. Clicking a character/faction/event search result dead-ends (nothing opens) → **C12-2**

**Section B — DevTools / crafted input:**
- [ ] 5. Backup `.json` contains `copilotKey` in PLAINTEXT (search for `sk-or-`) → **C05-6**
- [ ] 6. Restoring a snapshot breaks AI calls until a full page reload → **GAP-1**
- [ ] 7. Name-less faction + canon `Faction:` paste → throws, half-applies, doesn't persist → **GAP-8 / GAP-9**
- [ ] 8. Old (pre-2.5.0) save + "Fill & Copy" → red `TypeError` re: `workflowState` → **GAP-4**  *(skip if no old save available)*
- [ ] 9. `document.dispatchEvent(new CustomEvent('license:expired'))` → NO visible/readable toast → **C13-2**
- [ ] 10a. Relationship Web: dragging then clicking background → compounding lag/flicker → **C11-1**
- [ ] 10b. Print Preview: `keydown` listener count climbs by 1 per Close-button dismissal, never drops → **C11-2**

---

## A note on what this confirms vs. what it doesn't

Every PASS above converts a "the code says this will happen" into "I watched it happen on
screen." A FAIL on any item is itself useful information — it means either the bug is more
narrowly triggered than described (re-check the pre-existing condition) or genuinely needs a
second look before you trust the fix-priority ordering in `REPORT-v2.md`.

This runbook deliberately does NOT cover every finding in the report — only the ones flagged
`NEEDS-BROWSER` or where seeing the actual on-screen behavior materially changes how urgently
you'd prioritize a fix. The compound license-failure chain (**C04-1 → C13-2 → C04-2/C04-3**,
the audit's #1 priority bundle) is proven end-to-end in code/Node and doesn't need a browser
to be believed — but step 9 above lets you at least *see* the one piece of that chain that
manifests visually (the invisible toast).
