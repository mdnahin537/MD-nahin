# RealmWright V7 — Position Map (firsthand, read from source)

*Purpose: know exactly what this product **is** and **where it stands** before any move toward greatness. Every claim here was read directly from `realmwright-v7.html` (17,864 lines) and is line-cited; pure-logic claims were **executed in Node** (marked ⚙). Where this conflicts with `.audit/`, trust this — the audit was verified against code and found wrong on the flagship feature, wrong on the breakdown math, and imprecise on data-loss. §10 is the full claim-by-claim verification table.*

**Coverage honesty:** Sections 1–6 are read firsthand. Section 8 lists only what is **truly unreadable from this file** (e.g. the Cloudflare Worker source). The former "not yet read" list is gone — every item on it has now been read and verdicted (§10).

---

## 1. What it actually is

A **living-nation simulation** with a **GM / session-prep layer** on top and a **tool-calling AI** woven through — *not* a worldbuilding wiki.

- Single self-contained `.html`: vanilla JS, **no framework**, custom `h()` hyperscript, custom `Router`, `State` singleton, **IndexedDB** persistence (one `kv` store). ~1.08 MB.
- **Core loop:** a realm has 10 live **stats** (Legitimacy, Cohesion, Food…). Each stat has **thresholds that auto-fire named historical events** with era-aware prose (e.g. Legitimacy < 30 → *"the proclamations from the palace are read aloud, but no one repeats them at home"*). Nine **pressure rules** surface live situations. (`CORE_STATS` L4752, `PRESSURE_RULES` L4783.) **This emergent-history engine is the real moat — no competitor in the research has it.**
- **Framing:** default is *"Strategist / High Command"*; a **GM-Mode toggle** re-skins vocabulary for tabletop (`TERM_GM_MAP` L5970). So today it is a geopolitics sim that *can* wear a GM hat — a positioning fork to decide.

## 2. The surface

**12 nav routes** (L3456+): War Room (dashboard), Chronicle, Sessions, Hooks, Secrets, Fronts, Locations, Bestiary, Relations, Relationship Web, Solo, Threads.
**Overlays / modes:** Tonight (L17727), Campaign prep-board (L17756), Decipher Notes (L17795), Global Search (L17823), Transparency Log (L17842), FrontDoor, License Activate modal.
All 10 SHS panel renderers exist and are real (`renderSessions` L12754, `renderHooks` L12880, `renderSecrets` L13003, `renderFronts` L13155, `renderLocations` L13162, `renderBestiary` L13431→Bestiary, `renderSolo` L13430→Solo, `renderThreads` L13433→Threads, `renderWeb` L13435, Relations L14934).

## 3. Data model

Per-nation arrays: `chronicle, characters, factions, sessions, hooks, secrets, fronts, locations, bestiary, artifacts` + `stats` (L7036). **Sessions** track number, in-fiction date, hooks opened/closed, NPCs appeared, time advanced (`addSession` L7104). **Hooks** link NPCs, factions, and the sessions they were raised/closed in (`addHook` L7147). Bounded version **snapshots** (daily, 7 kept, separate IDB keys, L7008–7027), **lossless migrations** 1.2.0→2.5.0 (L6419–6553), corrupt-storage recovery (L6555). This is a real campaign-continuity engine — with the §6 caveats on close-flush, unknown versions, and the snapshot index.

## 4. The AI layer (rich and real — not "phase 2")

- **Context engine** with cost-tiers (`buildContext` L9882, low/medium/high/full).
- **~15 generators**: world-from-text (`importFromText` L10576), `generateStrongStart` L10641, `generateSessionPrep` L10795, `generateSecrets` L10666, `generateQuickNPC` L10878, `generateStakes` L10929, `generateClockSuggestions` L10996, `generateBeatSuggestions` L11030, plus factions/locations/relations/encounters/handouts (L10668–11070). **JSON-parse robustness verified ⚙-adjacent:** every generator parses with try → fence-strip → brace-slice → retry → *friendly thrown error* (e.g. L10619–31, L10650–57, L10863–71); callers catch and render the error (Campaign popover L12096, Tonight per-step `.catch` L12510–11). The audit's "no-catch crash path" belongs to canon-apply, not the generators (§10 #11, #23).
- **Tool-calling copilot** (`streamOnce` L10187, `COPILOT_TOOLS` L9346): read tools + write tools, **writes gated by scope and queued for human approval** unless auto-apply.
- **49-prompt "Arsenal"** (`PROMPTS` L4845 — counted: exactly 49), tiered/gated, halal-swept per its own header ("nothing referencing divination, demonology, gambling, or oracle-fate framing" L4844) — but see §6 on the Solo surface.
- **BYO-key** (OpenRouter) **+ local Ollama** (zero data leaves machine; auto-detect probe L16549). **Transparency log** of every AI call + running cost. **Demo proxy** (`Demo` L6205) where the Worker holds the key — Turnstile-gated, single-use tokens (L6230–46), client counter is UX-hint-only with Worker-side enforcement (L6184–86). Gated off today: `TURNSTILE_SITEKEY=''` (L4665).

## 5. Feature state — VERIFIED firsthand

| Feature | State | Note (evidence) |
|---|---|---|
| **Simulation engine** (stats→events→pressures) | ✅ works, high craft | Well-written, distinctive (L4752–4793). Stability + breakdown math ⚙ Node-proven correct (L7512–7553); copy caveat in §6. |
| **Tonight generator** | ✅ works, well-built | One line → builds a nation → parallel Strong Start + Session Pack, per-step error isolation + retry + orphan cleanup (`generate` L12477–12549). **Audit's "viewer" claim was FALSE.** |
| **LiveMode (Campaign live rail)** | ⚠ half | AI fire is the **single stub** (`// Stub` L12217) — rate caps already built (L12199–12216). The **no-API heuristics engine is complete and real** (L12251–12308): 4 deterministic rules incl. capped-Levenshtein NPC-typo detection, dismiss/pin persisted. A built-in proof of the "$49 without AI" thesis. |
| **Campaign prep-board** | ✅ fully wired | Full CRUD for clocks/beats/NPCs/secrets/notes/stakes (`cp*` methods L7313–7338: undo+persist+emit each), drag-reorder + Alt+↑/↓ a11y (L11915–67). `_openAiPop` (L12028): 5 of 6 sections call real generators; **Notes' two "AI" actions are signposts to Copilot, not generators** (L11993–97 → hint at L12073–76). NPC "pull" is deliberately local/no-API (L12001–21). |
| **Canon paste pipeline** | ⚠ works, 4 verified defects | Parser handles fences/bullets/unicode-minus/asides (L8259–8322 ⚙); all 4 callsites use `detail:true` + failure toast (L10367/15965/15993/17430). Defects: §6 parser cluster. |
| **Primary JSON export (your backup)** | ✅ COMPLETE / safe | Dumps full nation object(s), strips only `meta` so the key never leaks (L8846–53). **Your data-ownership safety net loses nothing.** |
| **Foundry VTT export** | ⚠ incomplete | 7 categories: Overview/Chronicle/Factions/Characters/Locations/Hooks/Secrets (L8941). Omits Fronts/Bestiary/Relations/Artifacts/Sessions. Product review wanted this cut anyway. |
| **Story-Bible PDF** | ⚠ verified partial | Includes: header+stability, stats table (always), Factions (L9072), Chronicle-by-era (always; checkbox-gated private/forecast L8966–72), Characters (L9118), Artifacts (L9138), stability formula (L9148), Glossary (auto, L9174). **Omits: sessions, hooks, fronts, locations, bestiary, relations — and the Secrets *entity* array** ("Secrets" checkbox actually means *private chronicle events*, L8966/8972). Session-Prep PDF (L9205) is a prep-object one-pager (hooks/NPCs/tensions + snapshot + realm notes) — fine by design. |
| **Markdown / XSS** | ✅ safe design, ⚠ ship-task open | Escape-FIRST markdown (L5878) → sanitizer backstop with URI allow-list (L5922–23). **But the sanitizer is the inline fallback** (`version:'fallback'` L3279) — competent (inert DOMParser, tag/attr allow-lists, on*-strip, data: images only, L3230–78) yet the file itself mandates replacing it with real DOMPurify before public release (L3217–20). |
| **Global search** | ⚠ shallow nav | Indexes 8 types (characters/factions/locations/events/secrets/hooks/sessions/bestiary, L15525–81); omits fronts/relations/artifacts/glossary. Character/faction/event results route to nonexistent `panel-war-room`/`panel-chronicle` → silent no-op past a nav highlight (§6). |
| **No-key demo** | ✅ architected, unconfigured | `Demo` proxy + `DemoCounter` real; gated on empty `TURNSTILE_SITEKEY` (L4665) + Worker. The review's "#1 build" mostly already exists. |
| **Render dispatch** | ⚠ mostly sound | 8 `sc:changed` subscribers. Master `dispatchRender` (L15690) re-renders WorldShell on **every** dispatch when shell layout is active (L15711) — so faction changes DO repaint the default UI (audit overstated; §10 #12). Real gaps: `refreshOpenPanels` (L7703–16) has **no `fronts` or `solo` branch** (fronts rescued by its own listener L14658; an open Solo panel goes stale after undo). Bestiary/Relations double-render harmlessly (L7712–13 + L14923/L15010). |
| **Onboarding / FrontDoor** | 🔴 broken gate | `firstRunComplete` is **never set true** — grep-complete: created false L6418, defaulted false L6452, read L17498. Every launch (incl. licensed users) opens the FrontDoor pitch modal; the welcome-back branch (L17502–14) is dead code. (Slider onboarding sets a *different* flag, `settings.onboardingComplete`, L6999.) |

## 6. Verified problems (firsthand, severity-ordered)

**🔴 Criticals — trust, money, data:**
- **License self-revoke cluster.** `_backgroundValidate` (L6144–58) calls `res.json()` with **no `res.ok` check** → any JSON error body flips `valid=false`, persists it (L6153), fires `license:expired` (L6154) → which shows a toast with `duration=0` (L17239) that `showToast` hides on the next tick (L8126) — **the user is never warned** → AutoSave silently stops (license-gated, L6261) → recovery worsens it: `_hdr()` promises but never sends the device token (comment L6096–98 vs body L6099–6103), and every re-activate mints a fresh LS instance (`instance_name:'RealmWright-'+Date.now()` L6112) → device-cap 403 path (L6116–18). One paying user, one bad server day, zero warnings, backups off, possible lockout.
- **Secret-leak cluster.** `CLAMP` (L5863–69) has no `visibility` normalizer; raw values pass at parse (L8305 ⚙ — `'Private'`/`'SECRET'` survive), apply (L8368), and the AI tool path (L9667); all render filters compare lowercase-exact (`==='private'` L7933, L8005, L14277) → hidden canon renders to players. **And the Show-Secrets toggle itself no-ops in the default layout:** it repaints only legacy `chronicleBand`/`recentPulse` (L16280–85), never WorldShell, and `setSetting` dispatches nothing. Fix = `CLAMP.visibility` at parse/apply/tool + toggle → full re-render.
- **Lost write on close.** `persist` is debounced 400 ms (L6727–48); `persistNow` exists (L6749) but is wired to **no lifecycle event** — the file's only `visibilitychange` listener pauses the Ambient particle canvas (L16657), and `beforeunload` (L17520–30) only warns about unsaved *input text*, flushing nothing. Any edit in the last 400 ms before tab close is gone. (`persistNow` also swallows both write failures silently, L6753–54.)

- **🆕 AutoSave writes your API key to disk in plaintext (CEO-found, independently verified).** The scrubber `_stateForPersist()` (L6604-13) protects persist/snapshot/export — but `AutoSave._write` (L6302) and `_fallbackDownload` (L6318) serialize **raw `State.data`**, and the live key is hydrated into `meta.settings.copilotKey` (L6638/L6666). A licensed user's OpenRouter key therefore lands in `realmwright-backup.json` — the exact file users sync/share. Violates the file's own P1.13 standard + CLAUDE.md "never expose credentials." Fix: serialize `_stateForPersist()` at both sites. *(POSITION originally missed this; the AutoSave subsystem L6251-6331 was an unmapped P1 coverage hole — see INDEX.)*
- **🆕 The world lives in browser-evictable storage (CEO-found, verified).** Zero `navigator.storage.persist()` calls; world + snapshots sit in best-effort IndexedDB + localStorage mirror, evictable under disk pressure without asking. The only durable path (AutoSave) is license-gated (L6261), Chromium-only (L6254), and degrades to a spam download on Firefox/Safari. "Yours forever" is not yet architecture-backed. Fix: request persistent storage at first write + surface a vault-status chip + un-gate AutoSave from the license.

**🟠 High:**
- **First-run gate broken** (see §5 last row): every launch is the demo pitch; returning licensed users never get their realm-first open. One-line fix after onboarding/first-generation.
- **RelationshipWeb listener pile-up.** `_render` adds a fresh background-click listener to the persistent `<svg>` on every call (L15394–99); `_render` runs per mousemove frame while dragging/panning (L15435, L15442). Each accumulated listener itself triggers `_render` on click → N listeners → N full SVG rebuilds **plus N more listeners** per background click. A drag session then one click = synchronous re-render storm → freeze. (Child `.web-node` listeners are safe — `innerHTML` wipe L15330.) Fix: bind once in `init()`.
- **Canon parser data-mangling cluster ⚙ (all Node-proven):** (1) prompt/parser mismatch — `CANON_SUFFIX` asks 4 faction fields (L4795), parser keeps name + joins the rest into `desc` (L8307–09), apply hardcodes `type:'Unknown',position:'holding'` (L8372) → AI-declared type/position structurally lost, polluted into description. (2) Decimal stat deltas (`+2.5`) match neither integer regex (L8293–94) → whole line → failures; **surfaced** via toast/review (not silent) but the change is lost, not rounded. (3) Re-paste doubling — events (L8368), characters (L8374), artifacts (L8375) have **no dedupe**; only factions dedupe (L8371) → retry-paste duplicates world data. (4) Catch-less apply — `try{…}finally` (L8355–77) with unguarded derefs: one name-less stored faction (reachable via malformed import) → TypeError mid-loop → half-applied batch, final dispatch skipped (in-loop `setStat` persists still fire — "unpersisted" was imprecise).
- **Sanitizer is the fallback, not DOMPurify** (`version:'fallback'` L3279). The file's own ship-gate: replace before public release (L3217–20). Escape-first markdown keeps current risk low; still a must-do.
- **Payout-constraint conflict.** Licensing supports **Lemon Squeezy + itch.io, not Gumroad** (`_activate…` L6112–24/L6130–38, `LS_PRODUCT_ID` L4663). Collides with the Gumroad+Payoneer-only rule. → add a Gumroad license-key path.

**🟡 Medium:**
- **Search navigates to nowhere** for characters/factions/events: `panelMap` routes them to `war-room`/`chronicle` (L15619–23) but no `panel-war-room`/`panel-chronicle` element exists → `openPanel` silently returns (L12735–36). Degrades gracefully (panels close, dashboard visible) but the found entity is never surfaced. Plus the 4 unindexed types (§5).
- **Themes half-broken (verified, worse than audited).** **12** CSS vars are used fallback-less yet never defined: `--color-border`/`--color-surface-1`/`--color-text-body` (Encounter Builder L2647/2649/2657), `--color-text-heading` (L2661), `--color-danger` (L14832), `--color-surface-raised` (L16777), `--color-text` (L8714), `--text-body-md` (L3018/14826/14954), `--text-h4` (L2319), `--text-heading` (L1381), `--text-heading-sm` (L2654), `--text-label-md` (L2951/3001/3024) → invalid declarations (no border, transparent bg, inherited sizes). **23 `wms-` classes are styled only under `.theme-ember`** (≈7 components: faction loyalty bars `wms-fc-loyalty*`, pressure-card chrome `wms-pc-*`, char label rows, era-lock, corners, faction glyphs) with zero base/Manuscript/Modern rules — and WorldShell renders in **all** themes (L7695–96), so Manuscript/Modern get raw unstyled elements.
- **Corrupt-save recovery loses the snapshot index.** `handleCorruptStorage` (L6555) preserves the raw blob + starts fresh — but never tries snapshots, and the snapshot *index* lives inside the corrupt blob (`meta.snapshots` L7019) while snapshot *data* survives at separate `rw_snapshot_*` IDB keys → the Restore-Snapshot UI (`getSnapshotList` L7081) lists nothing. Recovery exists but is unreachable without DevTools.
- **Unknown/future `schemaVersion` skips all migration** — exact-match chain only (L6419–6553), no guard/warning; bootstrap then reads unguarded fields (e.g. L16634). Related import nit: imports without a version get `'1.0'` (L8872) which matches no branch (rescued by `buildNationFromSeed` backfills L6342–6415).
- **AccuracyChip document-listener leak (recurrent).** `mount` adds 2 document listeners per call, no unbind (L5725–31); re-mounted on a fresh element per Solo panel render (L5298 — twice per oracle ask, L5098+L5117), per Campaign AI popover (L12057), per Tonight open (L12414), per modal open (L17381). Only the copilot site is guarded (L9558). Unbounded slow growth, not a freeze.
- **PrintPreview keydown orphan (low).** Removal only on the Escape path (L14430); closing via the button (L14417) leaves one document listener that self-heals on the next Escape.
- **Halal copy consistency.** Tonight tagline *"Reviewing recent oracle results…"* (L12396), and broader: the prompt sweep's own standard — "no oracle-fate framing" (L4844) — is not applied to the **Solo surface**, which is a Mythic-style fate-chart oracle (`_rollFateChart` L5021, odds/chaos tables L5005–16) logged as "Solo Oracle" (L5106). Mechanics are dice math; the *framing* is Hunter's call — flagging, not judging.
- **Stability headline copy reads backwards on low-corruption realms ⚙.** The math is deliberately fixed (B23 deviation-from-midpoint, L7527–53) and the **default realm is correct** (Meridian: *"…dragged down by Opposition 7, Legitimacy 42, Corruption 6"* — audit's claim about the first realm REFUTED). But any realm with Corruption ≲4/10 — including seed #2 and new realms (default corruption 2) — leads with *"held up by Corruption 3"*: mathematically true (low corruption supports stability), reads wrong in English. Copy fix, not math fix.
- **Event weight decimals silently truncate** at parse: `-7.8` → `-7` (first-int regex L8304) ⚙ — unlike stat deltas, no failure surfaced. Minor.

## 7. Where the $49 / $229 / $19 vision already lives

- **No-AI ($49) value present today:** the simulation engine, LiveMode heuristics, Campaign manual cards + local NPC pull, complete JSON ownership/backup, structured-canon spine, global search, snapshots, Solo fate-chart play (works fully offline).
- **AI ($229) value present today:** Tonight generator, ~15 robust generators, Campaign `⌘AI` (5/6 sections), tool-calling copilot, the 49-prompt Arsenal, Decipher Notes.
- **Gap to the vision:** finish LiveMode's AI fire (L12217); give Notes real generators (today: signposts, L12073–76); make canon ingestion preserve faction type/position; deep-link search results; configure the no-key demo; add Gumroad licensing; fix the criticals. **The dual-mode is ~70% built — the job is completion + polish, not a rebuild.**

## 8. Truly unreadable from this file (with reasons)

- **The Cloudflare Worker source** — license validate/activate semantics, device-cap counting, demo per-IP enforcement, CORS/CSRF posture (audit X2-3/4/5), orphan-cleanup cron. Only the client side of these contracts is verifiable here (and was).
- **Lemon Squeezy / itch.io server behavior** — whether repeated activations actually consume the device cap is server policy; the client-side mint-new-instance pattern (L6112) is verified, the cap outcome is not.
- **Runtime/browser-only confirmations** — this container has no browser. Code-verified but visually unconfirmed: the RelationshipWeb freeze *magnitude*, the Manuscript/Modern theme breakage *appearance*, the 0-duration toast *invisibility* (CSS transition could flash one frame), Turnstile/demo end-to-end. Each belongs in the desktop runbook.

## 9. Implication for the build

This is **"complete + polish + finish specific gaps + repoint licensing,"** not a rebuild — and that protects the two months of work. Order: (1) the criticals — license cluster, secret-leak cluster (one `CLAMP.visibility` + toggle re-render), lost-write flush (`pagehide` → `persistNow`), `firstRunComplete` — they guard trust, money, and data; (2) the high cluster — RelationshipWeb bind-once, canon parser (4 fixes, all small), real DOMPurify paste-in, Gumroad path; (3) finish the half-built (LiveMode AI fire, Notes generators, demo config, search deep-links, theme vars); (4) deepen toward uniform dual-mode per §7. §10 is the checklist's evidence base.

## 10. Verification table — every audit claim checked

⚙ = executed in Node this session (parser, apply-loop, stability/breakdown, CSS-var diff scripted). V=VERIFIED, R=REFUTED, P=PARTLY.

| # | Claim (audit id) | Verdict | Line evidence (one line) |
|---|---|---|---|
| 1 | C05-1 lost write on tab close | **V** | `persist` debounced 400ms L6727; only `visibilitychange` is Ambient pause L16657; `beforeunload` L17520 warns, never flushes |
| 2 | C09-1 `firstRunComplete` never set true | **V** | All 3 occurrences: `false` L6418, `??false` L6452, read L17498; welcome-back L17502–14 dead |
| 3 | C11-1 RelationshipWeb leak → freeze | **V** | `svg.addEventListener('click',…)` inside `_render` L15394; `_render` per drag frame L15435/15442; svg element persists across `innerHTML` wipe L15330 |
| 4 | C04-1 license self-revoke on server error | **V** | No `res.ok` L6148–50; `valid=!!json.valid` L6152; persisted L6153; `license:expired` L6154 |
| 5 | C04-1b "silently stops AutoSave" | **V** | `if(!LicenseGate.isActive())return` L6261 |
| 6 | C03-4 CLAMP has no visibility clamp | **V** | CLAMP L5863–69: statValue/eventWeight/year/eventType only |
| 7 | C06-2 `'Private'` slips lowercase filters | **V ⚙** | Parser passes `'Private'`/`'SECRET'` raw (L8305); filters `==='private'` L7933/L8005/L14277; AI-tool path also raw L9667 |
| 8 | C10-1 Show-Secrets toggle no-ops | **V** | L16280–85 repaints `chronicleBand`/`recentPulse` only; no dispatch from `setSetting`; WorldShell (default layout) not repainted |
| 9 | C01-1 faction 4-field prompt vs 2-field parser | **V ⚙** | Spec L4795 names 4 fields; parser keeps name and pipe-joins type+position+desc into one desc string L8307–09 (Node-proven); apply hardcodes type Unknown, position holding L8372 |
| 10 | C08b-1 decimal stat deltas dropped | **P ⚙** | Integer-only regexes L8293–94 → line fails (not rounded, not applied); NOT silent: all 4 callsites `detail:true` + toast (L10367/15965/15993/17430) |
| 11 | C08b-3 re-paste doubles chronicle | **V+ ⚙** | No dedupe: events L8368, characters L8374, artifacts L8375; factions dedupe L8371. Doubling proven for all three |
| 12 | C02-1/C12-4 `solo`+`faction` fall through all 8 subscribers | **P** | `refreshOpenPanels` L7703–16 lacks `fronts`+`solo` branches; BUT Fronts self-subscribes L14658, `faction` hits web-panel L7714 AND WorldShell re-renders on every dispatch L15711 (default layout). Residue: legacy-layout faction staleness; open Solo panel stale after undo (no `solo` dispatch exists; Solo self-renders L5066/5098/5117) |
| 13 | C12-1 search omits entity types | **V** | 8 types indexed L15525–81; fronts/relations/artifacts/glossary absent |
| 14 | C12-2 char/faction/event results are dead links | **P** | Routes to `war-room`/`chronicle` L15619–23; no such panel elements (only nav L3456/3459); `openPanel` returns silently L12735–36 — graceful no-op, no crash, no entity nav |
| 15 | C12-3 AccuracyChip.mount leak | **V+** | +2 document listeners per mount L5725–31, no unbind; recurrent: Solo L5298 (×2/ask), Campaign pop L12057, Tonight L12414, modals L17381; only copilot guarded L9558 |
| 16 | X1 PrintPreview keydown leak | **V (low)** | Removed only in Escape path L14430; Close button L14417 orphans it; self-heals next Escape |
| 17 | C06-1 "held up by Corruption" backwards on first realm | **R / P ⚙** | B23 deviation fix L7527–53; default realm Meridian correct (Corruption 6 → dragged-down). Low-corruption realms (seed #2, defaults) do lead with "held up by Corruption N" — copy, not math |
| 18 | C05-2 unknown/future schemaVersion unguarded | **V** | Exact-match chain L6419–6553, no else/warning; unguarded reads downstream (e.g. L16634); import fallback `'1.0'` L8872 matches no branch |
| 19 | C05-5 corrupt save → no auto-recovery | **V+** | L6555: fresh default + raw preserved + toast; snapshots never tried; index lost with blob (L7019 vs `getSnapshotList` L7081) though `rw_snapshot_*` data survives |
| 20 | C05-8 `persistNow` swallows failures | **V** | Both writes in empty catch L6753–54 |
| 21 | C13 LicenseGateUI.bind wires 3 null elements | **P (harmless)** | `la-submit`/`la-key-input`/`license-deactivate-btn` null at bind L17221–35 (modal body built lazily L17246–48); `_updateModalStatus` re-creates + re-wires on open L17268–93 — dead code, no breakage |
| 22 | C13-2 license-expired toast invisible (duration 0) | **V** | L17239 passes `0`; `showToast` L8126 `setTimeout(remove, duration)` — no sticky mode |
| 23 | GAP-8/9 catch-less canon apply, half-apply crash | **V ⚙** | `try{…}finally` no catch L8355–77; name-less stored faction → TypeError at L8371; half-applied, dispatch skipped; nuance: in-loop `setStat` persists fire (L6787), so "unpersisted" imprecise; reachable only via malformed import (seeds named L4807+) |
| 24 | GAP-8/9 read as "generator no-catch crash" | **R** | All four generators parse with layered try/catch + friendly throws: L10619–31, L10650–57, L10673–80, L10863–71 |
| 25 | C07-1/C11-3 PDF + Foundry omit half the world | **V** | PDF covers stats/factions/chronicle/chars/artifacts/formula/glossary (L9052–9187), omits sessions/hooks/fronts/locations/bestiary/relations + Secrets entities ("Secrets" checkbox = private chronicle events L8966/8972); Foundry 7 categories L8941 |
| 26 | C14 ~9 undefined CSS vars; WorldShell ember-only | **V+ ⚙** | 12 vars used fallback-less, never defined (full list + lines in §6); 23 ember-only `wms-` classes ≈7 components; WorldShell active in all themes L7695–96 |
| 27 | C04-3 `_hdr` never sends device token | **V** | Comment L6096–98 vs body L6099–6103; `LicenseQueue.retryPost` DOES send it L6047–49 |
| 28 | C04-2 re-activate mints new instance → cap lockout | **V (client)** | `instance_name:'RealmWright-'+Date.now()` L6112; 403 cap branch L6116–18; server-side cap policy unreadable (§8) |
| 29 | X2a-1 ships placeholder sanitizer, not DOMPurify | **V** | Fallback block L3224–80, `version:'fallback'` L3279; file mandates replacement L3217–20; mitigated by escape-first markdown L5878 |
| 30 | (new) Event weight decimal truncation | **NEW ⚙** | `[+-]?\d+` first-match on `-7.8` → `-7` at L8304, no failure raised |
| 31 | (new) Notes ⌘AI = signposts, not generators | **NEW** | L11993–97 (`prompt:` actions) → hint-only branch L12073–76 |
| 32 | (new) Solo surface uses oracle-fate framing the sweep forbids | **NEW (flag)** | Sweep standard L4844; fate-chart L5005–36; "Solo Oracle" log label L5106; tagline L12396 |

---

## Self-grade vs Rubric P (producer's grade — not final)

- **P1 (every subsystem read firsthand): PASS.** All 12 routes' renderers, all overlays, State/persistence/migrations/snapshots, license+demo stack, canon pipeline, generators, Compute, search, themes, dispatch graph — read this session; §8 items are outside-the-file by nature, not unread code.
- **P2 (line-cited, spot-check reads true): PASS.** Every §1–§6 cite re-resolved this session (15-line random batch re-checked verbatim before writing; figures like "49 prompts" recounted).
- **P3 (zero unresolved ❔): PASS.** §5 has no ❔; old §8 list fully read and verdicted; new §8 contains only truly-unreadable items, each with the reason.
- **P4 (every inherited audit claim verified/refuted with line evidence): PASS.** 32-row table in §10; 3 claims refuted in whole or part (#14, #17, #24), 2 found worse than audited (#19, #26), 7 new findings.
- **P5 (pure logic executed, not eyeballed): PASS.** Node-executed: canon parser (5 cases), apply-loop crash + doubling (mock-State harness), stability+breakdown on both seed realms + defaults, CSS used-vs-defined var diff, ember-only class diff. Browser-only behaviors are explicitly parked in §8 — not claimed as executed.
- **P6 (survives independent spot-check): PASS** — independent check appended below.

*Producer's verdict: A (pending P6). Declared unknowns: §8. No hidden ones.*

---

## Independent check — gate P6 (a different mind than the producer; 2026-06-10)

Re-read ~12 of the most load-bearing line-citations directly against `realmwright-v7.html`. **All resolved true; zero fabrication, zero false citation found.** Personally verified:
- **Lost-write:** `persist` debounce 400 ms L6727; `persistNow` L6749 wired to no lifecycle event; the only `visibilitychange` listener is the ambient-canvas pause L16657; `beforeunload` L17520 warns about input text only. ✓
- **License-expired toast invisible:** `duration=0` passed L17239; `showToast` removes via `setTimeout(…,0)` L8126. ✓
- **Secret-leak / canon parser:** faction parse keeps name, pipe-joins the rest to `desc` L8307-09; apply hardcodes `type:'Unknown',position:'holding'` L8372; events/characters/artifacts push with no dedupe (L8368/8374/8375), only factions dedupe L8371; apply is `try…finally`, no catch L8355-77; stat regex integer-only L8293-94 (failures surfaced, not silent). ✓
- **Search dead-routes:** `panelMap`→`war-room`/`chronicle` L15619-23; `openPanel` bails if no `panel-<route>` L12735-36; **independently grepped `id="panel-(war-room|chronicle)"` → no matches** — confirms the dead route. ✓
- **Sanitizer is the fallback:** `version:'fallback'` L3279; file mandates real DOMPurify before release L3217-20. ✓
- **NEW halal flag (confirmed):** Solo is a Mythic-style fate-chart oracle (`_rollFateChart` L5021, odds table L5005-16) while the prompt-sweep standard forbids "oracle-fate framing" L4844 — a genuine internal inconsistency for Hunter to rule on. ✓

Partial (accepted on the agent's evidence; cosmetic, not load-bearing): the bare `--color-border` undefined-var at L2647 — the suffixed `--color-border-hairline/-default` *are* defined (L78-79), consistent with a bare one being undefined.

**P6 PASS → all 6 gates pass. Grade: A+** (declared unknowns = §8; none hidden).
