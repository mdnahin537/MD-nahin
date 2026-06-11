# RealmWright — Strategic Counsel & Ideas Portfolio (Rubric I)

*Senior counsel + ideas specialist, 2026-06-11. Built ONLY on A+ inputs: `.audit/research/MARKET-RESEARCH-V2.md` (cited as R-Qn / R-Tn / R-Unknown-n) and `POSITION.md` (cited as P-§n / P-#n for table rows). Every code claim below was re-read firsthand in `realmwright-v7.html` this session at the cited line. No subagents used. Nothing committed.*

---

# 1. STRATEGIC COUNSEL — pressure-test of the whole direction

## 1.0 THE KEYSTONE FINDING — the recommended pitch is not yet true of the build

The research's binding T2 action is to sell *"a world that moves on its own deterministic math, between sessions, even with AI OFF"* (R-T2). **I verified the build cannot honestly say this today.** Every caller of `State.setStat` in the file is user- or AI-initiated: the stat slider commit (L8166), the canon-paste apply (L8362), and the AI tool path (L9748). There is no timer, no turn function, no time-driven mutation anywhere — I grepped for every plausible name (`advanceTime`, `tick`, `simulate`, `worldTurn`: zero hits). Saving a session advances **only the in-fiction year** (`advanceDays/365.25` → `n.currentYear`, L12859–12868, toast "World now Year X" L12875) — no stat drifts, no clock ticks, no event fires.

What the engine actually is today: a **consequence cascade**, not an autonomous world. Thresholds auto-fire authored events *when something else changes a stat* (`checkThresholds` L7612–7645); Fronts tick *when a stat crosses their trigger* (L7634–7643); pressures are *live reads* of current stats (`PRESSURE_RULES` L4783). All real, all verified, all high-craft (P-§5) — and all **reactive to the user's hand**. RippleForge is reactive-to-pasted-notes + cloud AI (R-Q3); RealmWright today is reactive-to-sliders with no AI. That is a *better* position but not yet the *claimed* one.

**Counsel: this is the single highest-leverage build decision available.** The autonomous world-turn is (a) the only moat the research says survives adversarial testing (R-T2: "differentiation survives, narrowed: autonomy + offline + determinism"), (b) the honest precondition of the entire recommended positioning, and (c) cheap relative to its weight, because it is *composition of already-verified primitives* — `setStat`→`checkThresholds`→threshold events→front stat-triggers→`tickFront`→catastrophe events (L6769, L7612–7645, L7282–7308) just need a deterministic driver. Idea #1 below is that driver. Until it ships, all public copy must say "consequences cascade automatically" — not "the world moves while you're away."

## 1.a Is "$49-grade without AI" achievable?

**Yes, but only on the simulation axis, and the bet is honestly untested.** Three facts bind:

1. **Storage is worth ~$0.** The free lane is saturated — Obsidian + TTRPG plugin ecosystem, Fantasia Archive, Chronicler (R-Q2: "the storage lane is saturated with free, offline, own-your-files tools… the *only* thing RealmWright adds over a free Obsidian vault is structured-canon → autonomous simulation → session generation"). So zero dollars of the $49 floor can rest on "keep your world here."
2. **The no-AI living-world demand is in-market untested.** R-Unknown-3, verbatim: "RealmWright's bet that the *no-AI* simulation alone justifies $49 is untested in-market (no comparable no-AI living-world product to benchmark)." The *adjacent* evidence is strong — GMs manually build SWN faction-turn spreadsheets and a GitHub GM-turn tool exists (R-Q3: "proof GMs manually build tooling for exactly this") — but adjacent is not proof.
3. **Today's actual no-AI inventory is ~$15–19-grade, not $49.** Honest read of P-§7 against the code: sliders + cascading events (user-driven), 4 LiveMode heuristics (L12251–12308), campaign-board CRUD (L7313–7337), fate-chart solo, complete JSON export, fill-&-copy prompts (L8180). Against free Obsidian, that's a nice toy plus a great export. The $49 floor only materializes when the world **runs itself** (Idea 1), **preps for you without a key** (Idea 2), and is **yours to house-rule** (Idea 4).

**Verdict: achievable — by building the three floor-bearing ideas, not by polishing what exists.** Mitigation for the untested bet: the no-key demo is the test instrument (R-Unknown-6: "the no-key demo is the instrument that would produce" a demand signal), and the solo wedge gives the same engine a second audience at near-zero marginal cost (R-Q9).

## 1.b The $19 price tension

The research's T3 verdict is binding and I adopt it without softening: **the model is sound only because of BYO-key** (Old Greg's abandoned one-time *because hosted AI costs ate it*; "RealmWright escapes this trap precisely via BYO-key… the user pays their own inference" — R-Q7), and **$19 as a permanent flagship under-signals** ("price is read as a claim about depth… at $19 RealmWright is ~60% below [Foundry $50 / Dungeon Alchemist $44.99] anchors" — R-Q7/T3).

My counsel adds one mechanism the research implies but doesn't state: **tie the price moves to feature lands, publicly.**
- Launch **$19 explicitly labeled "early-supporter price — rises when the World Turn ships."** That converts the under-signal into a deadline, gives early buyers a reason to act, and makes the later $29 a kept promise instead of a rug-pull (the exact failure Old Greg's suffered: "pay to play" backlash when terms changed *against* buyers — R-Q7).
- At World-Turn + Tonight-Lite ship: **$29 base + $39–49 "Lifetime Supporter"** one-time tier (Gumroad supports one-time tiers/PWYW; World Anvil proves lifetime tiers sell to this audience — R-Q7). No subscription ever; one-time tiers are Gumroad/Payoneer-clean and halal-clean (no riba structure, no recurring lock-in).
- **The demo is load-bearing for pricing, not marketing garnish.** "Price is read as a depth claim" cuts both ways: with a demo, depth is experienced before the number is judged (R-T3 action: "$19 only paired with a no-key demo that *shows* the depth"). The demo proxy is built and gated off on one constant (`TURNSTILE_SITEKEY=''` L4665; P-§5 "No-key demo: architected, unconfigured") — configuring it is among the cheapest high-leverage acts in the whole plan.

## 1.c Identity: GM-prep tool vs nation-sim — and what to do with "Strategist / High Command"

R-Q10 is unambiguous and multi-sourced: GMs search and buy "session prep / DM tools"; **no** competitor sells itself as a nation sim; the verdict is "lead as a GM session-prep tool; the simulation is the differentiating ENGINE, not the category label." The code is currently on the wrong side of its own fork: `gmMode` **defaults to `false`** (`DEFAULT_SETTINGS` L4736), the nav sigil reads **"Strategist / High Command"** (L3452–3453), and `TERM_GM_MAP` is a shallow 15-entry skin (L5970–5985: nation→realm, chronicle→timeline, pressure→tension…).

**Do:** (1) flip `gmMode` default to `true` for new saves; (2) expand `TERM_GM_MAP` and re-skin the sigil/FrontDoor to GM vocabulary ("run a great session on 15 minutes of prep" is the recurring buyer language — R-Q4/Q10); (3) **keep** the Strategist skin as the alternate mode — it is distinctive, already built, costs nothing to retain, and serves the worldbuilder tail. **Don't:** rebuild terminology infrastructure; the `Term()` swap (L5986–5992) is adequate for v1. This is hours of copy work with outsized search/positioning payoff — it must precede any public demo because it determines every storefront word.

## 1.d The halal Solo-oracle ruling — options and recommendation

**The facts (verified):** Solo implements the Mythic GME 2nd-edition fate chart — a d100 probability table indexed by declared odds × chaos factor (`_ODDS_THRESHOLDS` L5006–5016, `_rollFateChart` L5021–5036). Mechanically it is pure dice math: no stakes (not maysir/gambling), no claim about the real unseen (not divination of actual fate). The problem is **framing**: the surface personifies an unseen answerer — "Solo Oracle" log label (L5106), "Ask the oracle — it will speak when the dice fall" (L5285), "Reviewing recent oracle results…" Tonight tagline (L12396), prompt so1 "You are the narrative oracle" (L4932) — while the file's own halal sweep standard forbids exactly "oracle-fate framing" (L4844). P-#32 flags this as a genuine internal inconsistency; R-Q9 independently warns "solo-RPG tooling is steeped in 'oracle' framing — avoid divination-framing in any Solo-mode copy."

**A second, separate problem found this session — IP.** The odds table **reproduces the published Mythic GME 2e values with attribution** ("reproduces the published d100 'Yes' ceiling values" — L5000–5002, source credited to Tana Pigeon / Word Mill Games 2022). Game *mechanics* are generally not copyrightable, but shipping a competitor's published table verbatim inside a paid product is a legal risk I am not in a position to clear — Word Mill operates a license program for Mythic-compatible products whose current commercial terms I cannot verify from here. Flagging honestly: **verify or remove before selling.**

**Options:**
1. **Keep the mechanic, reframe the copy** — rename the surface to **"GM Emulator"** (the genre's own established category name) or "Adjudicator/Referee." "Ask the oracle" → "Put it to the dice"; "the oracle speaks" → "the table rules"; fate chart → "likelihood table." Mechanic untouched; ~a day of copy edits across L5106/L5285/L5313/L12396/so1 L4932 + CSS class labels (user-facing strings only; keep the internal `oracleLog` field name to avoid a data migration).
2. **Reframe the mechanic** — derive answers from the world's deterministic state (pressures/fronts bias the odds) instead of a borrowed table.
3. **Cut Solo** — rejected: solo is a named fast-growing segment ("more people are playing D&D alone than at any point in 50 years"; 33% of publishers added solo modes — R-Q9) served here at near-zero marginal cost.
4. **Make it optional/off-by-default** — rejected: hides, doesn't resolve, the inconsistency; the haram-adjacent framing would still ship in the box.

**Recommendation: 1 + the table-swap from 2, as one small package (Idea 6).** Rename to "GM Emulator / Adjudicator" framing (halal-clean, *more accurate* — the dice simulate a human GM's ruling, not fate — and it's the genre's own search term), AND replace the borrowed table with an **original probability curve** of the same shape (a smooth odds×chaos function; trivial math). One package kills both flags: the halal framing inconsistency and the IP exposure. Optionally let users edit the odds values themselves (Idea 4's spirit), which also serves Mythic veterans who want their exact numbers — *their* choice, their data, not our shipped copy. This is a **pre-demo gate**: the product must not be publicly demoed with its own sweep standard violated on a flagship panel.

## 1.e The solo-dev scope risk — "every feature dual-mode" is a fantasy; concentrate

The vision sentence "WITH AI, every feature AI-elevated, plus AI-only extras" is, for a solo non-coder-led build, **a scope trap**. POSITION already proves what concentration buys: the product is "~70% built — completion not rebuild" (P-§7) *because* effort was concentrated. The honest reformulation:

- **Every KEPT feature must be genuinely useful with AI off.** (Non-negotiable — it's the moat.)
- **Only flagship surfaces get AI elevation at launch:** Tonight (exists), the World Turn (Idea 1's narration), Run Mode (the one named stub — LiveMode fire, L12217), Quick NPC (exists). The 49-prompt Arsenal (L4845) + fill-&-copy (L8180) is the cheap long-tail elevation for everything else — static data, zero marginal code.
- **Subtraction is part of the A+ move** — see §4. The criticals (P-§6) outrank every idea here: a product that silently kills a paying user's license on a bad server day (L6144–6158), leaks private canon to players (L5863 cluster), and loses the last 400 ms of edits on close (L6727–48) cannot carry "own your data / trust" positioning regardless of features. R-Q4: data permanence is now *table stakes* in this market. The ideas below therefore layer **after** P-§9 phase 1, not instead of it.

---

# 2. THE IDEAS PORTFOLIO (ranked)

**Ranking logic:** #1 makes the moat real (everything else markets it). #2 makes it daily-useful with zero keys (the activation + retention engine). #3 captures the table (the session loop closes). #4–5 build the $49 depth signal. #6 is a constraint gate wearing a feature's clothes. #7–8 complete the loop and the first-hour wow. Leading with #1 because every research verdict (T1 action, T2 action, the positioning sentence itself) presupposes it.

---

## IDEA 1 — THE WORLD TURN: "End the session. The world takes its turn." ★ FLAGSHIP

**What:** A deterministic between-session turn. When a session is saved with time advanced (or via an explicit "Advance the World" action), the engine runs N turns (one per season/month elapsed): each **active pressure** applies a small authored stat drift (data-authored like `CORE_STATS`, e.g. *food-crisis active → Food −2, Legitimacy −1 per season*); factions in `gaining` position tick their linked fronts +1 (field exists: `position:'holding'|'gaining'|'losing'`, seeds L4807); drifts route through the **existing** `setStat` → `checkThresholds` machinery, so authored threshold events auto-fire into the chronicle and front stat-triggers cascade — all already built and verified (L7612–7645, L7282–7308). Output: a **"While You Were Away" turn report** — stat deltas, events fired, clocks moved, pressures appeared/cleared — each line citing the rule that caused it, **reviewable and vetoable line-by-line before committing** (undo via existing `pushUndo`). Deterministic: same inputs → same outputs; any randomness uses a seeded PRNG keyed to session id.

- **I1 Named pain:** GMs want worlds that move between sessions; the beloved manual precedent is SWN faction turns — "something the GM resolves *between sessions*… random events can surprise the GM," with fan-built spreadsheets/tools proving GMs hand-roll this today (R-Q3, CONFIRMED multi-source).
- **I2 No-AI half:** the entire feature — authored drift tables + existing threshold/front machinery, fully offline, deterministic, AI never consulted.
- **I3 AI half:** "Narrate this turn" — one BYO-key call renders the turn report as era-voiced prose + suggests 1–2 follow-up hooks (reuses `buildContext` L9882 and the generator JSON-parse pattern, e.g. L10863–71). Elevation, not entry ticket.
- **I4 Solo-feasible (hooks):** driver = one pure function `worldTurn(nation, elapsedDays) → proposedChanges` + a review modal. Consumes: `advanceDays` already captured per session (L7119) and the year-advance site (L12859–12868); applies via `setStat` (L6769) so `checkThresholds` (L7612) and `tickFront` (L7282) do the cascading for free; `PRESSURE_RULES` (L4783) are the drift conditions. Pure logic → Node-testable per Rubric C2. The modal is the larger lift; the canon-review UI pattern (L8355–8377 region) is prior art in-file.
- **I5 Differentiated:** RippleForge — the one named living-world neighbor — "is reactive and AI-dependent: it propagates consequences *from events you paste in* and needs the LLM"; "RealmWright's world moves on its own math" is the research's own surviving differentiation, currently unoccupied by any shipping product (R-Q3/T2). This idea is that sentence, made true.
- **I6 Constraint-clean:** offline, deterministic, no AI required; no divination framing (drift cites *rules*, not fate — copy standard: "the Lean Year deepens," never "fate decrees"); nothing payment-touching; halal-reviewed drift table prose (no haram verticals in event text).
- **I7 Failure modes →mitigations:** (i) *drift feels arbitrary/unfair* → every line shows its cause ("Food −2 — Lean Year: pressure active 2 turns") + per-line veto + one-click undo; (ii) *death-spiral on long skips* → cap turns per advance (e.g. 8) + per-turn drift clamps + stats already clamp to min/max; (iii) *GM never logs sessions* → expose "Advance the World" as a standalone War-Room action; (iv) *double-apply on session re-edit* → `turnAppliedAt` stamp on the session record; (v) *feels like homework* → default-accept-all with review optional (one click to take the turn).

## IDEA 2 — TONIGHT-LITE: the zero-key prep sheet

**What:** One click, no API key, no internet: assemble tonight's one-page prep sheet purely from existing canon — top-3 open hooks by priority (sort exists, L13781–13788), undeployed secrets (status machinery L7227–7244), active pressures (`Compute.pressures`, consumed at L7651), fronts nearest resolution (`clockFilled/clockSize` L7288), NPCs with plot seeds + drive/fear (fields exist, L6949–6961), the most-pressed-stat snapshot (exact sort already written for print, L9261–9264), last session's open threads. Output in the **same shape Tonight's AI already produces** (`{title, tagline, hooks, npcs, secrets, tensions}` L10828–10836) and rendered by the **existing** `renderSessionPrepPDF` (L9205) → print/PDF.

- **I1 Named pain:** prep burnout is a top-3 campaign killer; 69% of DMs prep <3 hrs/week; "most DMs aren't publishing a setting — they're trying to run a session next Tuesday" (R-Q4, CONFIRMED).
- **I2 No-AI half:** the whole feature. Today Tonight is hard-gated on a key ("Configure your OpenRouter API key in Settings first," L12480–12482) — the product's *headline prep surface currently refuses to work in no-AI mode*. Tonight-Lite removes the moat's most embarrassing contradiction.
- **I3 AI half:** the existing `generateSessionPrep` (L10795) becomes the same sheet's elevation — novel hooks + a written tensions paragraph vs the deterministic assembly. One surface, two modes: **the cleanest possible demo of the entire dual-mode thesis.**
- **I4 Solo-feasible (hooks):** pure selection/formatting over existing arrays; reuses the prep-PDF renderer as-is; smallest engineering lift in the portfolio.
- **I5 Differentiated:** every commercial prep competitor is online + hosted-AI (R-Q1 table: LoreKeeper, Old Greg's, StormScape, Archivist, Campaign Arks — all hosted); a deterministic offline prep sheet from owned canon is shipped by no one (the free wikis store, they don't *assemble* — R-Q2).
- **I6 Constraint-clean:** offline, zero AI, zero payment surface; prose templates halal-swept.
- **I7 Failure →mitigation:** (i) *thin world → thin sheet* → thinness detector ("Your realm has 1 hook and 0 secrets — seed it or load the sample") + SampleMode realm (L11126/L11133) for instant fullness; (ii) *same sheet every week* → recency rotation (exclude items surfaced on the last sheet; stamp `lastPrepAt`); (iii) *competes with AI Tonight, confusing* → one Tonight surface, a "with/without AI" toggle — the toggle *is* the marketing.

## IDEA 3 — RUN MODE: the at-the-table cockpit

**What:** A full-screen play view assembling what already exists: campaign clocks (`cpSetClockSeg` etc. L7316–7320), beats checklist (L7321–7327), NPCs-here (L7328–7332), secret bank with delivered-toggles (L7333–7337), the deterministic LiveMode rail (4 heuristics incl. capped-Levenshtein NPC-typo detection, L12251–12308), a plain dice roller (reuse Solo's `_rollD100`/`_rollD10` L5018–5019, extend to d4–d20), and one big **"End Session"** button running the existing structured save — hooks closed/opened, secrets deployed, NPCs appeared, time-advance pills (L12820–12877) — which then hands off to the World Turn (Idea 1). Session→canon→world-moves becomes **one flow**.

- **I1 Named pain:** "Most DMs want prep tools, not a replacement" — the job is running Tuesday's session (R-Q10/Q4); rivals run sessions *for* you online (R-Q1), nobody serves the GM *at* a live table offline.
- **I2 No-AI half:** everything above — clocks, beats, secrets, dice, heuristics rail — is already deterministic/local (P-§5 LiveMode row: "the no-API heuristics engine is complete and real… a built-in proof of the '$49 without AI' thesis").
- **I3 AI half:** LiveMode's AI fire is the file's **single named stub** (`// Stub: real fire path lands in C6`, L12217) with rate caps already built (L12199–12216) — finishing it gives live in-session suggestions; mid-session Quick NPC exists (L10878, 3 variants).
- **I4 Solo-feasible (hooks):** composition + CSS over existing CRUD/heuristics/save-flow; the riskiest part (structured session save with undo-suppression) is already written and shipping (L12837–12871).
- **I5 Differentiated:** the at-the-table + offline quadrant is empty — StormScape is Discord-centric, the AI DMs replace rather than assist (R-Q1); Foundry owns the *VTT* table, not the GM's *prep-to-play* loop.
- **I6 Constraint-clean:** offline-first; dice here are task-resolution randomness in a fiction (no stakes — not maysir); no oracle framing anywhere in Run Mode copy.
- **I7 Failure →mitigation:** (i) *GM won't bring a screen* → Tonight-Lite print sheet is the no-screen fallback, same data; (ii) *clutter at the worst moment* → strict single-screen, zero nav, collapse-to-dice mode; (iii) *AI suggestions mid-session annoy* → rail stays local-first (already its design, L12309–12311), AI fire opt-in per session.

## IDEA 4 — HOUSE-RULES ENGINE: edit the simulation itself

**What:** Make the engine user-authorable, no AI needed: an editor for each stat's **thresholds** (the exact existing data shape — `atValue, direction, eventName, eventDesc, eventWeight, eventType`, L4753–4781), for **custom pressure rules** (condition templates: stat X above/below V → prose), for **drift rules** (Idea 1's table), and for **custom stats with real thresholds** — custom stats exist today but are created with `thresholds:[]` and no way to author them (L6902). Ship preset packs as data ("Plague," "Succession Crisis," "Trade Boom").

- **I1 Named pain:** GMs already hand-build exactly this (SWN faction spreadsheets, GitHub GM-turn tool — R-Q3); the free-substitute crowd's core value is malleability (Obsidian ecosystem — R-Q2).
- **I2 No-AI half:** the whole feature — authorship of the deterministic engine is the deepest possible "$49 without AI" signal: you don't just *own your data*, you own the *rules*.
- **I3 AI half:** "Draft thresholds for a 'Faith' stat in my world's voice" → generator returns the threshold JSON into the existing review-before-apply pattern (generator robustness verified, P-§4).
- **I4 Solo-feasible (hooks):** thresholds are plain data read generically by `checkThresholds` (L7619–7632) — the engine needs **zero changes**; this is a forms-over-data editor. **One real landmine found:** `buildNationFromSeed` rebuilds core stats fresh from `CORE_STATS` on import *"so any threshold updates flow into existing nations"* (L6386–6394) — user-edited core-stat thresholds would be **silently overwritten on export/import round-trip**. Mitigation is mandatory: a `customized` flag per stat that skips the rebuild, or a user-thresholds overlay merged after rebuild.
- **I5 Differentiated:** hosted rivals' simulation logic lives server-side and can't be user-edited (R-Q1 — all hosted); RippleForge's mechanic is its AI pipeline, not user-authorable rules (R-Q3). Structurally ours to own.
- **I6 Constraint-clean:** offline data editing; preset packs halal-reviewed (no occult/divination-themed packs; "Plague/Succession/Trade" are clean history-sim material).
- **I7 Failure →mitigation:** (i) *blank-page paralysis* → presets first, blank editor second; (ii) *user authors a broken spiral* → live preview ("this fires at Food<40 — Food is 44 now") + the same per-turn clamps as Idea 1; (iii) *the import-overwrite landmine* → the `customized` flag above, tested round-trip in Node before ship.

## IDEA 5 — NPC RUN-CARDS (printable, deterministic)

**What:** A card view per character built from fields that **already exist**: name, role, `drive`, `fear`, faction (resolved via `factionId` — referential integrity already enforced, L6947–6953), location (`basedInLocationId` L6959), status, plot seeds (L6503/L7806), chronicle links, last-appeared session (`npcsAppeared` L7117) — plus one new field, `voice` (a speech mannerism line), and an auto-computed "since you last saw them" line from World-Turn events touching their faction (Idea 1 synergy). Print 4-up via the existing print-container pattern (L9205+).

- **I1 Named pain:** NPC management is core session prep; prep-time pressure is the top confirmed pain (R-Q4); rivals *generate* NPCs but give the GM nothing owned/printable at the table (R-Q1 — all hosted UIs).
- **I2 No-AI half:** entirely deterministic — formatting + the faction-event join.
- **I3 AI half:** existing `generateQuickNPC` (3 variants, L10878) fills a card; a one-line "suggest a voice" prompt elevates the new field.
- **I4 Solo-feasible (hooks):** data model is ~90% present (L6949–6961); `editCharacter` extends with one field (L6968–6981); rendering reuses print patterns. Smallest idea in the set.
- **I5 Differentiated:** not unique alone — the *moat tie-in* is the "since you last saw them" line, which only an autonomous deterministic world can compute offline (R-T2 differentiation).
- **I6 Constraint-clean:** trivially — local data, print, no AI required.
- **I7 Failure →mitigation:** (i) *empty fields → sad cards* → hide-empty rendering + "complete this NPC" nudge; (ii) *duplication with campaign-board NPCs* → `linkedCharacterId` already bridges them (L7328/L12291).

## IDEA 6 — SOLO "GM EMULATOR" REBUILD (the halal + IP gate shipped as a feature)

**What:** Execute counsel §1.d: rename the Solo surface from oracle-fate framing to **GM Emulator / Adjudicator** across all user-facing copy (log label L5106, empty-state L5285, toast L5313, Tonight tagline L12396, prompt so1's "narrative oracle" L4932, CSS display labels); **replace the reproduced Mythic 2e odds table** (L5006–5016, attributed L5000–5002) with an original smooth probability curve over odds×chaos (same play feel, original values); keep the d100 mechanic, scene checks (L5038–5045), chaos factor, and log (internal `oracleLog` field name kept — not user-facing — to avoid a migration). Deepen with the moat: each ruling displays the current top pressure as world context — deterministic, no AI.

- **I1 Named pain:** solo players want "an engine that answers 'what happens?'… low-commitment, high-creativity" and the segment is growing fast (R-Q9, CONFIRMED).
- **I2 No-AI half:** the dice engine + world-context display — fully offline (narrative field is already nullable when no key, L5084/L5110).
- **I3 AI half:** already shipped — so1 writes a world-grounded justification of the dice verdict (L4932/L5097–5114).
- **I4 Solo-feasible (hooks):** copy edits + one pure function (the curve) swapped in at `_rollFateChart` (L5021); Node-test the curve's monotonicity vs odds and chaos.
- **I5 Differentiated:** "no offline+own-data tool serves" the solo oracle-engine need (R-Q9 implication, verbatim).
- **I6 Constraint-clean:** this idea **is** the constraint cleanup — aligns the surface with the file's own sweep standard (L4844), removes divination-adjacent framing (R-Q9's explicit warning), and clears the unverified Word Mill licensing exposure (flagged honestly: their current commercial terms are unverified from this environment — original values make the question moot).
- **I7 Failure →mitigation:** (i) *Mythic loyalists want exact published numbers* → the odds table becomes user-editable data (Idea 4's editor) — they may enter their own; we ship original defaults; (ii) *"GM Emulator" less discoverable than "oracle"* → it is the genre's own category term (Mythic itself is sold as a "GM Emulator"), and store copy can say "answers yes/no questions like a human GM would" without fate language.

## IDEA 7 — SESSION→CANON LOOP, COMPLETED (Decipher + parser integrity)

**What:** Close the loop the structured session save already starts (hooks closed/opened, secrets deployed, NPCs appeared, time advanced — L12820–12877). No-AI half: post-session quick-chips that turn summary lines into chronicle events through the existing inscribe path (one-tap "make this an event"). AI half: Decipher Notes — FAB and flow already wired (L17399–17425), prompt r79 exists (L4898) — pastes raw notes → CANON block → existing review pipeline. **Precondition, not optional:** fix the four verified parser/apply defects first (faction type/position structurally lost L8307–09/L8372; decimal deltas dropped L8293–94; re-paste duplication — no dedupe for events/characters/artifacts L8368/8374/8375; catch-less apply half-batch L8355–77) — this loop *feeds the simulation that feeds everything else*; corrupt canon poisons the moat.

- **I1 Named pain:** session memory is a whole competitor's business (Archivist ingests sessions → recaps/wiki/chatbot — R-Q1), and data permanence is market table stakes (R-Q4).
- **I2 No-AI half:** structured save + quick-chips — deterministic, offline.
- **I3 AI half:** Decipher extraction via BYO-key; output always passes human review before apply (already the pipeline's design, P-§5).
- **I4 Solo-feasible (hooks):** the four parser fixes are P-§9's named "high cluster — all small"; chips are a thin UI over `addEvent`/inscribe.
- **I5 Differentiated:** Archivist is hosted with "data stored even after cancellation" as its *selling point* (R-Q4) — ours never leaves the machine; that's the line GMs already use (R-Q4 "you completely own and control all of your game data").
- **I6 Constraint-clean:** offline-capable; AI path BYO-key; no framing risks.
- **I7 Failure →mitigation:** (i) *parser mangles pasted canon* → the 4 fixes are sequenced before the feature is promoted; (ii) *GMs skip logging* → Run Mode's End-Session button makes logging the path of least resistance.

## IDEA 8 — WORLD HEARTBEAT: the imminence panel (first-hour wow)

**What:** A read-only War-Room panel computing what is *about to* happen: thresholds within N points of firing (pure compare of `stat.value` vs `threshold.atValue`, data at L4753–4781), fronts one tick from resolution (L7288), pressures active and the drifts they would cause next turn (Idea 1's table, previewed). Top-3 only. The visitor's first five minutes — especially on the sample realm (L11126) — show a world **coiled**, before any session is logged.

- **I1 Named pain:** the buy decision needs the depth *demonstrated*, not priced (R-T3: demo must "show the depth"); first-session "world feels alive" is the confirmed desire (R-Q3).
- **I2 No-AI half:** entirely — pure computation over existing data.
- **I3 AI half:** "What should I do about this?" hands the imminent item to the copilot (exists, L9346+).
- **I4 Solo-feasible (hooks):** read-only renderer over `CORE_STATS` thresholds + fronts + `PRESSURE_RULES`; shares Idea 1's drift-preview compute (build once).
- **I5 Differentiated:** Campaign Arks shows *status*; this shows *trajectory* — the difference between a tracker and a simulation is exactly the research's surviving distinction (R-Q3: "organized storage with flags, not autonomous simulation").
- **I6 Constraint-clean:** fully offline; copy says "approaching threshold," never prophecy ("the math, not fate").
- **I7 Failure →mitigation:** (i) *noise/overwhelm* → top-3 cap + severity sort; (ii) *stale on quiet worlds* → falls back to "world stable — 3 pressures dormant" state, which is itself information.

### PORTFOLIO GATE (I-PORT)
- **First-hour wow:** Heartbeat (#8) + Tonight-Lite on the sample realm (#2) + the configured no-key demo — a visitor sees a coiled world produce a usable prep sheet in minutes, zero key.
- **Weekly retention:** the session loop — Run Mode (#3) → End Session → World Turn (#1) → next week's Tonight-Lite (#2) is different *because the world moved*. Canon loop (#7) compounds the world each week.
- **No-AI $49 floor:** #1 (autonomous deterministic world) + #2 (assembled prep) + #3 (table cockpit) + #4 (authorable rules) + #5 (run-cards) + #6 (solo engine) — all fully functional offline with AI off. The floor stops being storage (worth $0 per R-Q2) and becomes simulation + assembly + authorship.
**Gate: PASS (self-assessed).**

---

# 3. SEQUENCING — layered on POSITION §9, honest about a solo, non-coder-led build

Each phase leaves the product working (Rubric B4 spirit). Effort units = focused agent-build sessions with Node tests (Rubric C2) + a desktop-runbook pass for UI; no fantasy timelines.

- **Phase 0 — P-§9 criticals, unchanged and first.** License self-revoke cluster (L6144–58), `CLAMP.visibility` + secrets-toggle re-render (L5863 cluster), `pagehide`→`persistNow` flush (L6727–48), `firstRunComplete` (L17498), **plus the Gumroad license path** (hard constraint — current code targets Lemon Squeezy/itch only, L6112–6138) and the canon-parser 4-pack (feeds #7 and the moat's data integrity). *Rationale: trust/money/data outrank features; these bugs attack the exact values being sold (R-Q4).*
- **Phase 1 — Identity + constraint gates (cheap, pre-public).** GM-default flip + sigil/FrontDoor copy + `TERM_GM_MAP` expansion (counsel 1.c); Solo GM-Emulator rename + original odds curve (#6); DOMPurify paste-in (file's own ship-gate, L3217–20). *Mostly copy and one pure function — days, not weeks, of agent work.*
- **Phase 2 — The weapon.** World Turn v1 (#1) + Heartbeat (#8) — they share the drift/imminence compute; build the pure function once, Node-prove it, then two renderers. *This is the moment the recommended pitch becomes true; do not announce the positioning before this ships.*
- **Phase 3 — The habit.** Tonight-Lite (#2), then Run Mode v1 (#3) with the existing End-Session flow wired to the World Turn. Configure the no-key demo (`TURNSTILE_SITEKEY` L4665 + Worker) and ship the storefront: **$19 early-supporter, demo-first.**
- **Phase 4 — The depth signal.** House-Rules editor (#4, with the import-overwrite landmine fix) + NPC run-cards (#5). **Price moves to $29 base / $39–49 lifetime-supporter here** (counsel 1.b), publicly tied to the shipped depth.
- **Phase 5 — AI elevations.** LiveMode fire (the stub, L12217), Notes real generators (signposts today, L12073–76), World-Turn narration, search deep-links + theme-var cleanup (P-§6 mediums).

**Solo-dev honesty:** Phases 0–1 are small, bounded edits with existing tests/evidence (P-§10 maps every line). Phase 2's engine is pure logic — the safest thing a non-coder can ship because Node proves it. Phase 3's Run Mode is the largest UI lift in the plan — schedule it after the engine proves momentum, and cut its scope (clocks+beats+dice+End Session) before cutting its position in the queue.

---

# 4. CUT / DE-PRIORITIZE — subtraction as strategy

1. **CUT: Foundry VTT export completion.** 7 incomplete categories (P-§5); the product review already wanted it cut; the research says lead on ownership/prep, not VTT integration (R-Q10) — completing a rival surface's data model is scope with no thesis behind it. Keep the existing partial as-is, label it "legacy export."
2. **CUT: the reproduced Mythic odds table** (L5006–16) — replaced in #6 (IP + halal alignment).
3. **DE-PRIORITIZE: Story-Bible PDF completion** (omits sessions/hooks/fronts/locations/bestiary/relations — P-§5). It's an archival surface; Tonight-Lite covers the *play* need. Revisit post-Phase 4.
4. **DE-PRIORITIZE: Manuscript/Modern theme parity** (23 ember-only `wms-` classes, 12 undefined vars — P-§6). Ship v1 as Ember-first with the two alternates marked beta; theme sprawl is polish debt, not value.
5. **REJECT: multi-nation diplomacy simulation** as a v1 direction — real scope, serves the "nation-sim" identity the research just demoted (R-Q10). The single-realm turn is the wedge. [REJECTED-class rationale; revisit only after the GM beachhead converts.]
6. **REJECT: community content marketplace / sharing portal** — moderation burden, platform/payment risk vs the Gumroad+Payoneer constraint, halal-vetting burden on user content. JSON export already enables informal sharing.
7. **DEFER: RippleForge-style relationship-graph ripple visualization.** The research calls it "the nearest art" and complementary (R-Q3) — but the Relationship Web has a verified freeze bug to fix first (P-§6 high), and the World-Turn report carries consequence-display textually for v1.

---

# 5. SELF-GRADE vs RUBRIC I (producer's grade — not final)

| Idea | I1 pain | I2 no-AI | I3 AI | I4 feasible (hooks) | I5 diff. | I6 constraints | I7 failures |
|---|---|---|---|---|---|---|---|
| 1 World Turn | PASS R-Q3 | PASS | PASS | PASS L7119/L12859/L6769/L7612/L7282/L4783 | PASS R-T2 | PASS | PASS (5 modes) |
| 2 Tonight-Lite | PASS R-Q4 | PASS | PASS | PASS L13781/L7227/L9205/L10828/L12480 | PASS R-Q1/Q2 | PASS | PASS (3) |
| 3 Run Mode | PASS R-Q10/Q4 | PASS | PASS | PASS L7316–37/L12251/L12820–77/L12217 | PASS R-Q1 | PASS | PASS (3) |
| 4 House-Rules | PASS R-Q3/Q2 | PASS | PASS | PASS L4753–81/L7619/L6902 + landmine L6386–94 | PASS R-Q1/Q3 | PASS | PASS (3, incl. landmine) |
| 5 Run-Cards | PASS R-Q4 | PASS | PASS | PASS L6949–61/L7117/L10878 | PASS (via #1 tie-in) | PASS | PASS (2) |
| 6 GM Emulator | PASS R-Q9 | PASS | PASS | PASS L5021/L5006–16/L5106/L12396 | PASS R-Q9 | PASS (is the gate) | PASS (2) |
| 7 Canon Loop | PASS R-Q1/Q4 | PASS | PASS | PASS L12820–77/L17399/L8293–8377 | PASS R-Q4 | PASS | PASS (2) |
| 8 Heartbeat | PASS R-T3/Q3 | PASS | PASS | PASS L4753–81/L7288/L4783 | PASS R-Q3 | PASS | PASS (2) |

- **I-PORT: PASS** (first-hour wow #8+#2+demo; weekly retention #1+#3+#7 loop; $49 no-AI floor #1–#6) — argued in §2.
- **Honest weaknesses kept visible:** (a) the no-AI living-world *demand* is in-market untested (R-Unknown-3) — the portfolio mitigates via demo-as-instrument and the solo second audience, but it remains the central bet; (b) Word Mill's current commercial licensing terms are UNVERIFIED from this environment — #6 removes the dependency rather than resolving the question; (c) effort estimates are qualitative ("sessions of agent work"), per the no-fantasy-timelines rule, not quantified.
- **Anti-inflation note:** every line citation above was re-read in `realmwright-v7.html` this session; every market claim cites R-Q/T/Unknown sections of the A+ research; no claim inherits from the quarantined dossier.

**Producer's verdict: A (pending independent check).**

---

## Independent check — Rubric I (a different mind than the producer; 2026-06-11)

Re-read the load-bearing claims at source and actively tried to break the keystone. All held:
- **Keystone (no autonomous world-movement): CONFIRMED.** `setStat` (def L6769) has 3 callers, all user/AI-triggered (L8166 slider, L8362 canon, L9748 AI tool); grep for any turn/tick/drift engine → zero hits; session-save advances the year only (L12859-68). The "moves while you're away" pitch is genuinely unbuilt — and the portfolio correctly makes Idea 1 the fix, not a claim of done.
- **Flagship feasibility (Idea 1 composes from existing primitives): CONFIRMED.** `checkThresholds` (L7612-45) fires authored threshold events + drives front stat-triggers; `tickFront` (L7282-7308) advances clocks and pushes a catastrophe event on fill. A deterministic driver calling `setStat`→these is exactly the claimed composition — buildable with no new engine code.
- **Idea-4 import landmine: CONFIRMED.** `buildNationFromSeed` always rebuilds core-stat thresholds from `CORE_STATS` (L6394) — user-edited thresholds would be wiped on import; the flagged mitigation is necessary.
- **Solo IP + Tonight key-wall: CONFIRMED earlier** (L4999-5002 Mythic/Word Mill attribution; L12480 key gate).

Zero false claims found. Declared unknowns (untested no-AI demand R-Unknown-3; unverified Word Mill terms; qualitative effort) are surfaced, not hidden — allowed under the bar.

**All 8 ideas pass I1-I7; I-PORT passes; independent check PASS → Grade: A+.**
