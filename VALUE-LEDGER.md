# RealmWright — The Value Ledger (Chief Ideas Officer, S+ pass)

*Chief Ideas Officer, 2026-06-12. Mandate: the founder ruled that the 9-idea portfolio (IDEAS.md + CEO-REVIEW §3) builds a credible $49 no-AI floor but does **not** justify the $229 with-AI ceiling. This artifact invents the missing value and proves both numbers with itemized ledgers. Built ONLY on A+ inputs: `.audit/research/MARKET-RESEARCH-V2.md` (cited R-Qn / R-Tn / R-Unknown-n), `POSITION.md` (P-§n / P-#n), `IDEAS.md` (I-§n / Idea n), `CEO-REVIEW.md` (C-§n / Mn / Rn / C-#n). The quarantined dossier was not read or cited. No subagents. Nothing committed. No other file touched.*

**Provenance discipline:** a line-cite marked **[read]** was read or grepped firsthand in `realmwright-v7.html` this session; **[inh]** is inherited from an A+ artifact whose independent check covered it. Per the bar, one false cite fails this artifact — every [read] below was resolved against the file today.

**Binding rules honored throughout:** the AI differentiator is STATE, not generation — "your chatbot forgets; the realm doesn't" (C-M6a); anything a bare chatbot replicates is weighted $0. Halal framing checked per idea (file's own sweep standard: no divination, demonology, gambling, oracle-fate framing — L4844 **[read]**). "$229" never appears in public copy (C-M6c) — this ledger is internal truth. Single-file, offline-first, BYO-key/Ollama, completion-not-rebuild respected in every feasibility note.

---

# §1 GAP ANALYSIS — what is missing from each half

## 1.1 The no-AI half vs $49 (vs the free-substitute reality)

The free substitute is not weak: Obsidian + its TTRPG plugin ecosystem, Fantasia Archive, Chronicler — "offline own-data worldbuilding storage is saturated and free" (R-Q2). Zero dollars of the floor may rest on storage. The 9-idea portfolio correctly moved the floor onto **simulation + assembly + authorship + custody** (C-§3 portfolio gate). My itemized ledger (§3.1) prices that portfolio honestly at **~$44** — *near* $49, but resting on a tight cluster: one engine (the World Turn) wearing four interfaces.

What the no-AI half still lacks — and free wikis can never add because they hold documents, not state:

- **World texture systems.** No random tables, no calendar/seasons, no weather/rumor texture — yet the confirmed demand quote is exactly this: GMs want "factions/NPCs that act in the background, weather/economics/rumors unrelated to the quest" (R-Q3). Grep-verified: no table engine, no month/season model exists in the file (greps `randomTable`/`worldTurn` → zero **[read]**; `month|season` hits are only UI pills L4152–4153 and the year-advance comment L12856–12858 **[read]**).
- **Projection.** The engine can fire consequences (`checkThresholds` L7612–7645 **[read]**) but cannot answer "what happens if…" without mutating the real world. A simulation you cannot war-game is half a simulation.
- **Player-facing surfaces.** Everything renders for the GM. There is no player-safe export, no recap, no handout *pipeline* (grep `recap|player-safe|playerView` → zero **[read]**) — despite a 3-level visibility model (`public/private/forecast`, filter L7933 **[read]**) and a visibility-aware print filter already shipping in the Story-Bible PDF (L8972 **[read]**).
- **Knowledge as state.** Secrets have status machinery (`undeployed/deployed`, L7196/L7227–7235 **[read]**) but the world has no model of *who knows what* — the thing GMs actually track on paper.

## 1.2 The with-AI half vs $229 — the founder is right, and here is the number

The current-plus-planned AI leg is: ~15 generators + tool-calling copilot + 49-prompt Arsenal + Decipher (P-§4), plus the planned completions — LiveMode fire stub (L12217 **[inh]**), Notes generators (L12073–76 **[inh]**), World-Turn narration (Idea 1 I3). Priced honestly in §3.2, that whole leg adds **~$53** over the floor → **with-AI ≈ $119, short of $229 by ~$110.** The founder's "$79-feeling" verdict is confirmed in direction and nearly in magnitude.

**Why it falls short:** almost all of it is *generation*, and generation is what a free chatbot does with the same underlying model (C-M6a). The integrated parts (review queue, context engine, cost ledger) are worth real money; the prose itself is worth ~$0 premium.

**The structural finding of this review:** the product owns an unusually rich deterministic state inventory that the AI layer barely exploits. Verified assets with no AI surface built on them:

| Owned state (verified) | Exploited by AI today? |
|---|---|
| 3-level visibility on every event (L7933, print filter L8972) **[read]** | No — `buildContext` is GM-eyes-only: includes *all* secrets (L9958–9961) and tags private events `[secret]` (L9933) **[read]** |
| Secrets status machinery + related NPCs/factions/locations (L7192–7202, L7227) **[read]** | Only listed into context |
| Per-session history: hooks opened/closed, NPCs appeared, time advanced (L7109–7120) **[read]**; hook lineage `raisedInSession/closedInSession` (L7159–7160) **[read]** | No surface reads the *trajectory* |
| Faction `position` gaining/holding/losing (seeds L4807) + fronts with `linkedFactionIds`, clocks, `optionalStatTrigger` (L7255–7256, L7282–7309) **[read]** | Listed, never *played* |
| Location tree with `parentId`, `controllingFactionName` (L7378–7381) + events geolocated via `happenedAtLocationId` (L16043, L13236, L14306) **[read]** | Unused by any AI feature |
| Per-nation conversation persistence (`n.copilotConversation`, L9364, L6357) **[read]** | One generic copilot thread only |
| Context ledger rows already expose short event IDs (`#${id.slice(0,8)}`, L9942–9943) **[read]** | The model is never asked to cite them |

Every unexploited row above is a missing product. §2 builds them.

## 1.3 The cross-cutting principle: THE GROUNDING RULE

Every new AI surface below must emit **entity citations** — `[#8-char-event-id]`, `[NPC: name]` — for every world-fact it asserts, rendered as one-click links into the panel. The plumbing half-exists: the context already prints short event IDs (L9942–9943 **[read]**). A chatbot cannot do this — it holds no entity IDs and no canon to resolve them against. Cited AI is *checkable* AI; it converts "AI said something" into "the realm answered, with receipts," and it pairs with the existing transparency log (L17842–17861 **[read]**, "◆ AI Call Log" with per-call cost). This rule is the AI half's brand and costs almost nothing per feature.

---

# §2 NEW IDEAS

*None of these restates the 9. Where an idea extends an existing primitive, the extension is named and the new capability is stated. Order = ledger impact. Dollar-weight method is defined in §3.0; each weight is argued there in table form and summarized here.*

---

## N1 — HOLD AUDIENCE: in-character NPC conversation that knows only what it should ★ the anti-chatbot flagship

**What:** Open any NPC and "Hold audience." A chat surface roleplays that NPC — voiced by the model, **clamped by a deterministic persona dossier** the engine compiles first: the NPC's `drive/fear/role/status/factionId/basedInLocationId` (fields verified, L6949–6959 **[read]**), their faction's position and interest (L4807 **[read]**), `public` events only — minus anything `private`/`forecast` (filter semantics L7933 **[read]**) — biased toward events at their location (`happenedAtLocationId`, L14306 **[read]**), plus only the secrets the GM explicitly grants this NPC (checkbox over the secrets array, L7192–7202 **[read]**). The dossier ships as a visible, printable **"What X knows" card** *before* any AI call. Conversations persist per-NPC (same pattern as `n.copilotConversation`, L9364 **[read]** — character objects survive added fields through import because `buildNationFromSeed` spreads them, `{...c}` L6354 **[read]**). After a conversation, one click hands the transcript to the existing Decipher pipeline (L10757–10792 **[read]**) → CANON review → the talk becomes canon. The in-character letter generator already proves voice-from-drive/fear works (L10720 **[read]**); this is that, made live, stateful, and knowledge-clamped.

- **I1 Named pain:** portraying NPCs consistently across months is core prep labor (prep burnout = top-3 campaign killer, 69% of DMs prep <3 hrs/wk — R-Q4); "talk to AI-run characters" is a rented product category (LoreKeeper €7.99/mo, Old Greg's $15–25/mo — R-Q1 CONFIRMED).
- **I2 No-AI half:** the **Knowledge Dossier card** itself — deterministic compile of what this NPC knows/wants/fears, printable for the table. Real value with AI off (it is the NPC brief GMs hand-write).
- **I3 AI half exploiting state:** the conversation is *bounded by owned state* — visibility, location, faction, granted secrets, prior transcript. The same prompt in ChatGPT requires retyping the world every time and leaks whatever you typed; here the NPC provably cannot reveal what it was never given. Grounding Rule applies: NPC statements about world facts carry event citations in a GM-side margin.
- **I4 Solo-feasible (hooks):** dossier = pure selection over verified fields (Node-testable); chat = the existing `streamOnce` loop (L10187 **[read]**) with a persona system prompt built by a `buildContext` variant (L9882 **[read]**); persistence = per-character array; extraction = existing Decipher + CANON review. **Dependency:** Phase 0 `CLAMP.visibility` fix (P-§6) — a knowledge clamp over an unclamped field is theater.
- **I5 Differentiated (+why not a chatbot):** every rival NPC-chat is hosted and forgets or meters memory (R-Q1; Old Greg's "memory issues reported"); a chatbot has no visibility model, no persona persistence, no canon write-back. Ours: private, owned, and *provably ignorant of your secrets* — the literal anti-chatbot demo ("ask the spymaster what she knows; she doesn't know what she shouldn't").
- **I6 Constraint-clean:** BYO-key/Ollama; offline degrades to the dossier card (declared). Halal: copy is "hold audience / speak in character" — roleplay of fictional persons, no séance/summoning/spirit framing anywhere (including for `status:'deceased'` NPCs: surface label "portray from the chronicle," write the rule into the prompt header the way L4844 does). Shipped example NPCs clean (magistrates, merchants, captains).
- **I7 Failure modes → mitigations:** (i) *model leaks a granted secret too freely* → secrets default OFF per NPC; GM grants per-conversation; margin shows what was granted. (ii) *long chats cost* → existing per-message cost estimate (L9373–9403 **[read]**) + transparency log; suggest haiku-class models for talk. (iii) *voice drift* → optional one-line `voice` field folded into the dossier; transcript replay keeps register. (iv) *GM treats NPC words as canon automatically* → nothing commits except through CANON review (existing pipeline).
- **DOLLAR WEIGHT:** no-AI +$2 (dossier card). **With-AI +$35**: anchored to the rented AI-character category — LoreKeeper ~€96/yr (price CONFIRMED; USD conversion ≈$100–110 is my assumption) and Old Greg's Hero $180/yr (CONFIRMED, R-Q1); claiming ~25–30% of a ~$130/yr midpoint for a private, owned, knowledge-true version is conservative *because* ours is the only one whose NPCs can keep a secret.

## N2 — THE SANDTABLE: consequence projection ("if the party does X") ★ co-flagship

**What:** A war-gaming surface on the World Turn's compute. Clone the nation (deep-clone precedent: snapshots, `JSON.parse(JSON.stringify(...))` L7015 **[read]**), apply a hypothetical ("party breaks the siege: Food +10, Veiled Hand front −2 ticks"), run the **same pure `worldTurn()` function** (Idea 1) N turns forward on the clone, and render the **diff**: stats drifted, thresholds that would fire (pure compare vs `atValue/direction`, L4753–4781 **[read]**), fronts that would resolve (`clockFilled/clockSize`, L7288 **[read]**), pressures that would appear (`PRESSURE_RULES` L4783–4793 **[read]**) — **every line citing the rule that produced it.** Nothing touches the real world. AI half: narrate each branch in era voice and propose the hook each branch implies. Extends Idea 1 into a clearly new capability: *counterfactual branching with diff reports* — the difference between a clock and a planning table.

- **I1 Named pain:** consequence-projection is a shipping rival's headline — RippleForge sells "ask 'what happens next?' for grounded projections" (R-Q3 CONFIRMED) — and stake-setting is the GM's hardest prep judgment (R-Q4 burnout mechanism: "must have every detail planned").
- **I2 No-AI half:** the entire feature — deterministic projection + rule-cited diff, offline.
- **I3 AI half exploiting state:** branch narration grounded in the projected event chain (citations to the rules/thresholds in the diff). A chatbot can invent consequences; it cannot *compute* them from your actual thresholds — its "projection" is vibes.
- **I4 Solo-feasible (hooks):** zero new engine code beyond Idea 1's pure function — Sandtable is that function run on a clone with an input-delta vector; Node-provable determinism (same seed → same diff). UI = one modal + the turn-report renderer reused. **Build note:** must run `checkThresholds`-equivalent logic against the clone, not via `State.setStat` (which mutates live state and dispatches, L7612/L6769 **[inh]**) — the pure-function refactor Idea 1 already requires.
- **I5 Differentiated:** RippleForge's projection is AI-dependent and cloud-fed (R-Q3/T2); ours runs offline on math and shows its work. No wiki has any of this (R-Q2).
- **I6 Constraint-clean:** offline; deterministic. **Halal framing (checked hard):** this is *projection of authored rules*, identical in kind to a spreadsheet forecast — never fortune-telling. Copy rules: surface name "Sandtable / Projection"; verbs "project, war-game, model"; forbidden vocabulary: prophecy, foretell, destiny, fate, omen, oracle. Every projected line carries its rule citation ("Food −2/turn — Lean Year pressure"), which *structurally* prevents fate framing.
- **I7 Failure → mitigation:** (i) *players ask the GM to "just run the future"* → cap horizon (e.g., 8 turns, same clamp as Idea 1); label "a projection, not a promise — the table decides." (ii) *clone drift from schema growth* → single clone helper shared with snapshots; round-trip Node test. (iii) *analysis paralysis* → max 3 saved branches, side-by-side diff.
- **DOLLAR WEIGHT:** no-AI +$4. **With-AI +$15**: anchor is RippleForge shipping this as a product (existence CONFIRMED, price UNVERIFIED — R-Unknown-1), so the weight is deliberately modest and flagged *capability-anchored, price-assumed*.

## N3 — THE WHISPER LEDGER: who knows what, and how news travels

**What:** A deterministic knowledge layer. Each chronicle event/secret gains a `knownBy` record (factions/locations/“common knowledge” tiers); each World Turn, knowledge **propagates** by simple authored rules: public events spread from their `happenedAtLocationId` (field verified, L16043/L13236 **[read]**) outward through the location tree (`parentId`, L7379 **[read]**) and along faction lines (`controllingFactionName` L7381, `factionId` L6953 **[read]**); `private` events do not spread unless the GM leaks them; distortion increases with hops. The War Room gains a "Who knows?" inspector per event. AI half: **voice the rumor as heard** — "tell me how the dockworkers in Port Veldrath have heard the Famine news" — with distortion level and faction bias from the ledger, building on the news generator's existing tavern-talk diction scope (`scopeMap.common`, L10706 **[read]**). Feeds N1's dossiers (an NPC knows what their faction+location knows). Event objects survive added fields through import (`{...e}` spread, L6352 **[read]**); the per-event record needs no new top-level array.

- **I1 Named pain:** the living-world demand quote names rumors explicitly — "weather/economics/**rumors** unrelated to the quest" (R-Q3 CONFIRMED); GMs hand-track who-knows-what today (same hand-tooling instinct as SWN faction spreadsheets, R-Q3).
- **I2 No-AI half:** the ledger + propagation + inspector — fully deterministic and offline; v1 ships with three knowledge tiers and one spread rule per turn (cheap data, real play value: "has the capital heard yet?").
- **I3 AI half exploiting state:** rumor voicing parameterized by *computed* distortion/bias — a chatbot can write a rumor; it cannot know which of your 200 events has reached which district, because that is propagation state.
- **I4 Solo-feasible (hooks):** pure functions over verified fields (location tree walk = `locationPath` pattern, L7426–7440 **[read]**); runs inside the World Turn driver (Idea 1); Node-tested spread on a fixture realm. v1 deliberately small: per-event `knownBy` + one rule; the full travel-time graph is T3.
- **I5 Differentiated:** no rival models information travel (R-Q1 table: all are generation/tracking products); Campaign Arks is "status-tracking… not autonomous simulation" (R-Q3). Anti-chatbot per I3.
- **I6 Constraint-clean:** offline; halal-clean (rumor = fictional social information; no divination; shipped examples clean — grain prices, troop musters, toll disputes).
- **I7 Failure → mitigation:** (i) *bookkeeping nobody asked for* → fully automatic defaults (public = spreads, private = doesn't); the GM only touches it to leak a secret; (ii) *wrong-feeling spread* → per-event override + veto in the turn report; (iii) *scope creep toward graph theory* → v1 is tiers + one rule, frozen.
- **DOLLAR WEIGHT:** no-AI +$4. **With-AI +$10** — no rented equivalent exists; tagged **ASSUMPTION**, justified as the enabler that makes N1's clamp true and the World Turn report richer.

## N4 — THE SEASON BRIEF: the arc director over your session history

**What:** A "showrunner's brief" computed from data only this product has: the sessions array (`number/title/summary/hooksClosed/hooksOpened/npcsAppeared/advanceDays`, L7109–7120 **[read]**), hook lineage (`raisedInSession/closedInSession`, L7159–7160 **[read]**), fronts and their tick history (`ticks[]` with `sessionId`, L7290 **[read]**), and secrets deployment (L7227–7235 **[read]**). Deterministic metrics: hooks opened-vs-closed trend (debt curve), fronts static ≥3 sessions, NPCs unseen ≥N sessions, secrets aging undeployed, faction screen-time share. AI half: a one-call dramatic read over those metrics — "the Veiled Court has been off-screen 4 sessions while its front sits at 5/6 — three escalation options from your canon," each option citing the entities it uses (Grounding Rule).

- **I1 Named pain:** pacing/burnout is the #1 confirmed pain (R-Q4); arcs-as-product is proven — Campaign Arks sells "story arcs with phase management" (R-Q1/Q3).
- **I2 No-AI half:** the metrics panel — real, offline, and honest (a debt curve of your own campaign).
- **I3 AI half exploiting state:** multi-session *trajectory* analysis. A chatbot cannot do this without you re-narrating every session; the state IS the product (C-M6a).
- **I4 Solo-feasible (hooks):** pure functions over verified arrays (Node-tested on the solo sample realm, which ships 3 sessions — L11128 **[read]**); one generator call using `buildContext` + a metrics block; renders in the Sessions panel (`renderSessions` L12754 **[inh]**).
- **I5 Differentiated:** Archivist recaps the past; Campaign Arks tracks status; nobody computes *pacing* (R-Q1). Offline + owned.
- **I6 Constraint-clean:** offline core; halal-clean ("director/brief" vocabulary; no fate language — "the math says this thread is cold," never "the story is destined").
- **I7 Failure → mitigation:** (i) *thin session logs → thin brief* → metrics degrade gracefully to "log 2 more sessions to unlock trends"; Run Mode's End Session (Idea 3) is the data faucet; (ii) *prescriptive tone offends GM authorship* → options framed as questions, max 3; (iii) *small-N false patterns* → thresholds tuned, confidence labels shown.
- **DOLLAR WEIGHT:** no-AI $0 (folded into Run Mode's session loop value). **With-AI +$12**: anchored to Campaign Arks' paid mid tier (model CONFIRMED, exact $ PARTLY — R-Q1); claiming a minor share of a ~$60–100/yr equivalent.

## N5 — THE CONTINUITY SWEEP: whole-canon audit + answers with receipts

**What:** Extends the existing **one-event** continuity check (`Copilot.checkContinuity`, L10543–10572 **[read]**, modal L3822–3836 **[read]**, per-event button L8235 **[read]** — "judge one chronicle event… do NOT propose changes" L10038 **[read]**) into a **whole-world audit**, two layers. (a) **Deterministic lint, no AI:** dangling `factionId`/`basedInLocationId`/`happenedAtLocationId` references, deceased NPCs appearing in later sessions (`status` L6956 vs `npcsAppeared` L7117 **[read]**), event years outside era plausibility (`ERA_GAP` L4749 **[read]**), hooks closed in sessions that don't exist, secrets `deployed` with no `deployedInSession` (L7231 **[read]**), orphaned `relatedNpcs` on secrets. (b) **AI semantic pass:** chunked sweep over the chronicle reusing the existing verdict prompt, each finding citing event IDs (the context already prints them — L9942–9943 **[read]**); fixes route through CANON review, never auto-applied. Plus the Grounding-Rule upgrade to the copilot generally: answers about the world carry `[#id]` citations.

- **I1 Named pain:** campaign memory is a rented category (Archivist's whole business: sessions → wiki/recaps/chatbot — R-Q1; StormScape: "AI that remembers your campaign"); continuity errors are the failure mode of long campaigns that makes that category sell.
- **I2 No-AI half:** the lint — pure functions, offline, instant, and genuinely useful (referential integrity is already a stated file value, L6947–6948 **[read]**; this finishes the thought).
- **I3 AI half exploiting state:** contradiction detection across *persistent owned canon* with resolvable citations — the precise thing a stateless chatbot cannot audit (C-M6a).
- **I4 Solo-feasible (hooks):** lint = Node-provable pure functions over verified fields; semantic pass = a loop over the existing `checkContinuity` pattern with the existing per-surface tier knob already in settings (`continuityTier:'mid'`, L4744 **[read]**); findings UI = list + existing review pipeline.
- **I5 Differentiated:** Archivist stores your memory on their servers ("data stored even after cancellation" — R-Q4); ours audits memory that never leaves the machine, and *shows receipts*. A chatbot pasted a 200-event chronicle will hallucinate line numbers; ours resolves them.
- **I6 Constraint-clean:** offline lint; BYO-key sweep; halal-trivial (audit vocabulary).
- **I7 Failure → mitigation:** (i) *false-positive fatigue* → severity tiers, dismiss-and-remember per finding (LiveMode's dismiss/pin precedent, L12251–12308 **[inh]**); (ii) *big-canon token cost* → chunking + the 100-event context cap precedent (L7653–7655 **[read]**) + cost preview before run; (iii) *AI proposes bad fixes* → verdict-only by default (the existing check's own discipline, L10555 **[read]**), fixes opt-in via review.
- **DOLLAR WEIGHT:** no-AI +$2 (lint). **With-AI +$15**: anchored to Archivist ~$10/mo ≈ $120/yr (tier figure in R-Q1 sources, exactness PARTLY); claiming ~12% of one year for the audit+citation slice of the memory job.

## N6 — THE TABLE PRESS: player-facing artifacts from canon

**What:** A print pipeline that turns canon into table artifacts, player-safe by construction. Deterministic half: **"Previously on…" recap** assembled from the last session record (summary, hooks closed/opened, NPCs appeared — L12826–12852 **[read]**) plus *public-only* events since (the exact filter the Story-Bible PDF already implements, L8972 **[read]**); printed via the proven print-container pattern (`renderSessionPrepPDF`, L9205+ **[read]**). AI half: the **three existing in-fiction document generators** — Proclamation (L10690), News Bulletin (L10700), In-Character Letter (L10711) **[read]**, already surfaced as GM-bar buttons (L3373–3377 **[read]**) — get what they lack: a *press*: print/PDF layout templates (parchment notice, broadsheet, sealed letter), an artifact archive saved per realm, "issue this when event X fires" hooks into the World Turn, and recap prose in era voice. Extends existing generators into a clearly new capability: a **player-artifact production line** instead of three one-shot text boxes.

- **I1 Named pain:** "most DMs are trying to run a session next Tuesday" (R-Q4) — recap and handouts are Tuesday work; World Anvil is resented for charging for "presentation rather than play" (R-Q4 verbatim) — we make presentation a one-time-owned byproduct of play.
- **I2 No-AI half:** recap assembly + print templates + the archive — fully deterministic; the recap alone is a weekly-use feature with AI off.
- **I3 AI half exploiting state:** documents written from *current* canon with visibility discipline (the generators already feed on `buildContext`; the press adds public-only context assembly for player-destined artifacts) — a chatbot letter knows nothing of your sealed warrants unless you paste them, which is exactly how secrets leak.
- **I4 Solo-feasible (hooks):** all heavy parts exist (generators, print container, visibility filter, session record); new work = templates (CSS), archive array (**landmine, named:** a new top-level `n.pressArchive` must be added to the `buildNationFromSeed` whitelist or it is silently dropped on import — the constructor builds nations from an explicit field list, L6342–6375 **[read]**; same class as IDEAS Idea 4's landmine), and the recap selector (pure function).
- **I5 Differentiated:** hosted rivals present worlds on *their* pages behind subscriptions (R-Q2/Q4); nobody ships an offline artifact press. Community-norm note: artifacts are private-table prep output — squarely the accepted side of the published-vs-private line (R-Q5); never marketed as publishable content.
- **I6 Constraint-clean:** offline core; halal-checked: document types are civic fiction (proclamations, notices, letters, broadsheets) — no horoscopes/omen-sheets as shipped types; example content clean (tolls, musters, charters).
- **I7 Failure → mitigation:** (i) *secret leaks into a player artifact* → press consumes public-only assembly **after** Phase 0's `CLAMP.visibility` (hard dependency, same as N1); GM preview is mandatory before print; (ii) *template sprawl* → 3 templates v1; (iii) *recap wrong emphasis* → deterministic facts first, AI prose optional below.
- **DOLLAR WEIGHT:** no-AI +$3 (recap + press). **With-AI +$12**: anchored to World Anvil Master $105/yr (CONFIRMED, R-Q2) whose paid surface is heavily presentation; claiming ~11% of one year.

## N7 — THE PLAYER CODEX: a visibility-filtered world you can hand to players

**What:** One click exports a **read-only, player-safe HTML codex** — characters, factions, locations, public chronicle, open hooks the players know — with every `private`/`forecast` item and all GM secrets excluded by the same filter semantics the renderers already use (L7933 **[read]**, print precedent L8972 **[read]**). A single self-contained file (the product's own format), shareable by message, openable offline by players, regenerate-anytime. Blob-download mechanics already exist (`exportJSON`, L8846–8858 **[read]**). Entirely deterministic; optional AI margin: player-safe rewrites of GM-toned descriptions (declared optional, $0-weighted).

- **I1 Named pain:** the ownership/access vocabulary is the buyer's own (R-Q4); the rented alternative is paying a wiki subscription so players can browse (World Anvil free tier = public+ads; LegendKeeper $9/mo with read-only-on-lapse — R-Q2 CONFIRMED).
- **I2 No-AI half:** the whole feature.
- **I3 AI half:** none required — **declared exception, honest** (same class as CEO's Vault I3 exception): this is floor value, not a dual-mode feature.
- **I4 Solo-feasible (hooks):** an assembly function reusing existing render data + the PDF pipeline's filter; output is a static HTML string + Blob download. **Hard dependency:** Phase 0 `CLAMP.visibility` — exporting a player codex with the unclamped-visibility bug live (P-§6) would be the worst possible leak; this feature must ship *after* that fix and becomes its showcase.
- **I5 Differentiated:** no rival can say "your players' view is a file you hand them — no account, no sub, no server" (R-Q1: all hosted). It is the ownership thesis extended to the *players*.
- **I6 Constraint-clean:** trivially halal; offline by definition; strengthens the trust story.
- **I7 Failure → mitigation:** (i) *stale codices circulating* → generation date + "ask your GM for the latest" footer; (ii) *GM mis-marks visibility* → pre-export diff screen: "47 public / 9 private withheld / 2 forecast withheld — review withheld list"; (iii) *players data-mine the file* → it contains only public items by construction (not hidden-but-present).
- **DOLLAR WEIGHT:** no-AI +$4 (vs renting player access at $90–105/yr — R-Q2; claiming <5% of one year). With-AI +$0.

## N8 — THE TABLE ENGINE: deterministic random tables that read the world

**What:** A data-authored random-table system (the engine's third leg after stats and thresholds): tables as plain data `{name, die, entries:[{range, text, conditions?}]}` — rumors, weather, names, market prices, complications, encounter twists — rolled with the existing dice (`_rollD100/_rollD10`, L5018–5019 **[read]**). The new mechanic: **entries may carry world-state conditions** (pressure active, stat band, season) so the same table rolls differently as the world moves — grep-verified novel (no table engine exists **[read]**). Editable in the House-Rules editor (Idea 4's forms-over-data pattern); shipped packs halal-reviewed. AI half: **author a table from current world context** ("a rumor table for the Lower Markets, biased by active pressures") returning the editable data shape through the generator JSON pattern (parse robustness precedent, L10674–10680 **[read]**).

- **I1 Named pain:** random tables are the genre's oldest prep tool; the living-world quote names the texture they provide ("weather/economics/rumors" — R-Q3); solo players expect "an engine that answers 'what happens?'" offline (R-Q9).
- **I2 No-AI half:** the entire engine + shipped packs — offline, deterministic, editable.
- **I3 AI half exploiting state:** authored tables conditioned on *your* stats/pressures — a chatbot writes a generic table once; it cannot write one that keeps re-reading your world after the chat ends.
- **I4 Solo-feasible (hooks):** roller = trivial pure function (Node-tested distribution + condition gating); storage = new top-level `n.tables` → **named landmine:** must be whitelisted in `buildNationFromSeed` (L6342–6375 **[read]**) or dropped on import; UI = forms-over-data like Idea 4; one authoring generator.
- **I5 Differentiated:** free table rollers exist everywhere, but none are state-aware and none feed a World Turn; this also gives the Solo/GM-Emulator surface its missing "what happens?" muscle without oracle framing (R-Q9's warning respected).
- **I6 Constraint-clean (checked hard):** dice with **no stakes** = no maysir (same analysis the counsel applied to Solo, I-§1.d); naming rule: "rumor table / weather table / complication table," never "fortune/omen/fate table"; weather is meteorological fiction, not sky-reading; shipped pack content halal-reviewed (no occult packs).
- **I7 Failure → mitigation:** (i) *blank-page* → 6–8 shipped packs first; (ii) *condition complexity* → v1 conditions = stat band + pressure-active + season only; (iii) *AI authors off-tone entries* → tables land as editable data in review, never auto-saved.
- **DOLLAR WEIGHT:** no-AI +$3. **With-AI +$4** (authoring) — generator-library rental anchor: LitRPG Adventures ~$5/mo ≈ $60/yr (PARTLY, R-Q1); claiming a small slice. Tagged partly **ASSUMPTION**.

## N9 — THE ALMANAC: calendar, seasons, and a world with a date

**What:** A thin data layer the engine conspicuously lacks (verified: time is a bare `currentYear` float advanced by `advanceDays/365.25`, L12859–12868 **[read]**; no month/season model **[read]**): named seasons/months per era, an in-world date line everywhere the year now shows, season-keyed **drift modifiers for the World Turn** (winter sharpens Food drift — data in Idea 1's table), season conditions for N8 tables, and dated mastheads for N6 artifacts. Optional festival/civic-day entries (user-authored). AI half ($0-weighted): season-flavored phrasing inside existing narrations.

- **I1 Named pain:** between-session texture (R-Q3); also makes the World Turn legible — "one turn per season" (Idea 1's own spec) currently has no season to point at.
- **I2 No-AI half:** all of it.
- **I3 AI half:** none required — declared (texture rides existing narration calls).
- **I4 Solo-feasible (hooks):** a per-era month/season table + date math over `advanceDays` (already captured per session, L7119 **[read]**); render joins. Smallest idea in the set; rides Phase 2 so the first World-Turn report already says "Turn of the Lean Winter, Year 1247."
- **I5 Differentiated:** wikis store dates; nothing *runs* on them (R-Q2); rivals have no engine for a season to modify.
- **I6 Constraint-clean (checked):** calendar is civic/astronomical fiction; **no zodiac/astrology/omen framing** in shipped season or festival content — festivals are harvests, charters, musters.
- **I7 Failure → mitigation:** (i) *fictional-calendar bikeshedding* → ship one clean default per era, fully editable; (ii) *date math drift* → reuse the existing 365.25 convention (L12862 **[read]**), Node-tested.
- **DOLLAR WEIGHT:** no-AI +$2, with-AI +$0. Pure floor-texture, honestly small.

## N10 — THE FACTION COUNCIL: AI plays the opposition, you approve

**What:** The World Turn's deterministic drift answers "how does the world decay/grow"; the Council answers "what do the *schemers* do." Once per turn (opt-in), each faction marked `gaining` or `losing` (field verified, L4807 **[read]**) gets one AI-proposed **move** in line with its `primaryInterest` (L4807 **[read]**) and knowledge (N3's ledger): a proposal object — front tick (`tickFront`, L7282 **[read]**), new private event, stance change (`update_faction_stance` write tool already exists with scope gating, L9355/L9690 **[read]**) — every one routed through the **existing approval queue** (write tools "queued for human approval," P-§4; queue mechanics L9655 **[read]**). The GM is the council chair; nothing moves without a signature. The demo already foreshadows it: the political sample realm ships a pre-baked `factionAnalysis` (L11130 **[read]**).

- **I1 Named pain:** the beloved manual precedent is exactly this — SWN faction turns, "something the GM resolves between sessions… random events can surprise the GM" (R-Q3 CONFIRMED, with fan-built tooling as demand proof).
- **I2 No-AI half:** the World Turn's deterministic faction drift (Idea 1) *is* the no-AI sibling — declared: the Council itself is **AI-only by design**, because "intentional play" is the part that needs a mind; the deterministic half already exists as its own idea.
- **I3 AI half exploiting state:** moves generated from faction interest + position + fronts + (later) knowledge ledger, applied through state machinery with audit trail. A chatbot can suggest "the cult does something"; it cannot tick your clocks, respect your scopes, or queue for your approval.
- **I4 Solo-feasible (hooks):** one generator (proposal JSON per faction) + the existing queue/review UI + Idea 1's turn hook. Deliberately **T3**: ships after the deterministic Turn has taught us turn-report UX and guardrails.
- **I5 Differentiated:** no rival ships approval-gated AI faction turns (R-Q1); it is the SWN mini-game, automated, private, owned.
- **I6 Constraint-clean:** halal-clean with the copy rule: factions act from *interests*, the GM decides — never "the AI decides the world's fate"; no haram content in shipped move templates.
- **I7 Failure → mitigation:** (i) *AI moves feel arbitrary* → every proposal must cite the interest + a canon event motivating it (Grounding Rule), else auto-rejected; (ii) *runaway aggression* → one move per faction per turn, weight caps via existing CLAMP ranges; (iii) *GM rubber-stamps into chaos* → default queue (never auto-apply), one-click undo (existing `pushUndo`).
- **DOLLAR WEIGHT:** with-AI +$10 — no rental equivalent; tagged **ASSUMPTION**, defended by the strength of the manual-precedent demand (R-Q3).

## N11 — THE WORLD INTERVIEW: onboarding by conversation

**What:** "Tell me about your world" — the AI asks one question at a time (era? who holds power? what's about to break?) and **fills the realm as you answer**: each answer routes through `importFromText`'s structured shape (L10576–10638 **[read]**) or the copilot's gated write tools (L9346–9359 **[read]**) into the standard review queue; ten minutes of talk yields a seeded realm with stats, factions, events. The deterministic sibling is the CEO's Day-One Intake (markdown convention — C-§3 ADDED); this is its AI twin for people who'd rather talk than format. Declared **AI-only-with-reason:** the no-AI intake path already exists as its own idea; conversation is inherently a model task.

- **I1 Named pain:** cold-start is the adoption wall (C-§3 Intake rationale; R-Q2's installed base of free-tool worlds); BYO-key activation friction means the first 10 minutes must pay off fast (R-Q6).
- **I2 No-AI half:** declared exception — Day-One Intake + forms are the no-AI route.
- **I3 AI half exploiting state:** answers become *structured state* through clamps and review — the difference between this and a chatbot interview is that ours ends with a realm, not a transcript.
- **I4 Solo-feasible (hooks):** a question script + the existing import/tool/review plumbing; no new engine.
- **I5 Differentiated:** rivals onboard into *their* cloud (R-Q1); a chatbot interview persists nothing.
- **I6 Constraint-clean:** BYO-key; halal-trivial; question script avoids haram verticals in examples.
- **I7 Failure → mitigation:** (i) *model invents beyond answers* → Decipher's own rule reused verbatim: "ONLY structure what is clearly present… do not invent" (L10773 **[read]**); review-before-apply; (ii) *interview fatigue* → 8 questions max, skippable, resumable.
- **DOLLAR WEIGHT:** with-AI +$5 (activation value, modest; tagged **ASSUMPTION**).

## Explored and filtered out (think wide, filter last — reasons on record)

- **Expedition/Encounter Desk** (travel times, loot, encounter budgets): encounter generation already exists as Arsenal prompt eb1 (L4901 **[read]**) + sample pre-baked encounter (L11126 **[read]**); system-agnostic *budget math* is quicksand (every system differs). Complications fold into N8 tables; travel folds into N3's location hops. **T3-or-never.**
- **Session-Zero Charter kit** (campaign premise, roster, content boundaries): wholesome (content-boundary tools align with our values) but thin dollar weight and one-time-use; revisit post-launch. **T3.**
- **"Ask the Chronicle" as a standalone surface:** absorbed — it is N5's Grounding Rule applied to the existing copilot, not a new product.
- **GM Handoff Brief:** absorbed into N6 (an artifact template) — not a product.
- **NPC voice/portrait packs, AI image generation:** REJECTED — image gen drags the product onto the community's punished side (AI-art bans: ENnies/DriveThruRPG, R-Q5), bloats the single file, and is pure commodity generation (C-M6a).
- **TTS/audio recaps:** REJECTED — heavy dependency surface for a single-file offline app; no rental anchor worth the scope.
- **Multiplayer shared realm / live player portals:** REJECTED — requires servers; collides with the entire offline/own-data architecture. N7's codex file is the constraint-true substitute.
- **Community content marketplace:** stays rejected (IDEAS §4.6) — N8's *first-party* packs capture the upside without moderation/payment risk (consistent with C-#6's pack line).

---

# §3 THE TWO LEDGERS

## 3.0 Method — how a dollar weight is earned (not asserted)

**Rule:** weight = (annual price of the nearest *rented* equivalent, cited) × (honest fraction of that rented job our capability performs). Conservatisms, by construction: (1) only **one year** of the rival subscription is counted — the owned-forever premium (year 2+ = $0 vs another $120–360) is deliberately **left unpriced** as headroom; (2) privacy/offline premiums unpriced; (3) anything a bare chatbot replicates ≈ $0 (C-M6a); (4) every weight tagged — **[A]** anchored to a CONFIRMED price, **[P]** anchored to a PARTLY-confirmed price, **[S]** assumption (no rental equivalent exists). Per C-M6c, "$229" and this ledger's numbers are internal; the public form is the itemized "what you'd rent" comparison without the headline number.

**The rented stack (the anchor, all from the A+ research):**

| Rented service | Price | Annual | Confidence |
|---|---|---|---|
| StormScape Adventurer / Legend | $9.99 / $29.99 /mo | ~$120 / ~$360 | CONFIRMED (R-Q1) |
| Archivist | ~$10/mo + add-ons ($6/30d pass, $2/session) | ~$120+ | PARTLY (R-Q1 + sources) |
| LoreKeeper | €7.99/mo | ~€96 ≈ $100–110 | price CONFIRMED; USD conversion = assumption |
| Old Greg's Hero / Legend | $15 / $25 /mo | $180 / $300 | CONFIRMED (R-Q1) |
| World Anvil Master | $12/mo | $105 | CONFIRMED (R-Q2) |
| LegendKeeper | $9/mo | $90 | CONFIRMED (R-Q2) |
| Roll20 | — | $50–150 | CONFIRMED (R-Q4) |
| Campaign Arks mid/premium | — | est. $60–100 | model CONFIRMED, $ PARTLY (R-Q1) |

A midline three-service rental covering what RealmWright covers (StormScape Adventurer + Archivist + WA Master) ≈ **$345/yr, every year**. $229 one-time is ~66% of *one* year of that stack. That is the honest anchor frame.

**Disclosure (binding):** the with-AI ledger assumes the buyer brings inference — BYO-key (typically a few dollars/month at GM usage, per-message estimates built into the product, L9373–9403 **[read]**) or local Ollama at $0. This is the structural reason a one-time price can exist at all (R-Q7: Old Greg's hosted-AI one-time collapsed; BYO-key escapes the trap). State it on the store page; never hide it.

## 3.1 LEDGER A — the $49 NO-AI floor (vs free Obsidian/Kanka/Fantasia, R-Q2)

| # | Feature (offline, deterministic) | Why a GM pays when Obsidian is free | Weight | Running |
|---|---|---|---|---|
| 1 | **World Turn** (Idea 1) — the world takes a between-session turn on authored rules | GMs hand-build SWN faction-turn spreadsheets to get exactly this (R-Q3); a wiki stores notes, it cannot *move* | $10 | $10 |
| 2 | **Heartbeat** (Idea 8) — thresholds near firing, fronts near resolution | Trajectory, not status — the tracker-vs-simulation line (R-Q3) | $4 | $14 |
| 3 | **Tonight-Lite** (Idea 2) — one-click prep sheet assembled from canon | Free wikis store; they don't *assemble* Tuesday's sheet (R-Q2/Q4) | $8 | $22 |
| 4 | **Run Mode + structured End Session** (Idea 3) — clocks, secrets, dice, session→canon save (flow verified L12820–12877 [read]) | The play loop itself; Obsidian has no session machinery | $6 | $28 |
| 5 | **House-Rules engine** (Idea 4) — edit thresholds/pressures/drift | You own the *rules*, not just the data; hosted sims can't be edited (R-Q1) | $5 | $33 |
| 6 | **Vault + lossless export** (CEO add) — durable custody, key-safe backup, restore drill | Custody for a *database app* is real work; data permanence is table stakes (R-Q4) | $5 | $38 |
| 7 | **GM Emulator** (Idea 6) — original-curve solo engine + scene checks | Offline solo engine; serves the fast-growing solo segment (R-Q9) | $3 | $41 |
| 8 | **Canon pipeline + Day-One Intake** (Ideas 7 + CEO add) — structured paste, review-before-apply, dedupe (post-fix) | Disciplined ingestion is what keeps a 300-event canon usable | $3 | **$44** |
| | — *The 9-idea portfolio lands here: ~$44. Near the floor, short of it. The founder's instinct holds even for the floor.* — | | | |
| 9 | **Sandtable, deterministic half** (N2) — rule-cited what-if projection | No free tool computes consequences from your own thresholds | $4 | $48 |
| 10 | **Whisper Ledger v1** (N3) — who-knows-what + spread per turn | The bookkeeping every intrigue GM does by hand | $4 | $52 |
| 11 | **Table Engine + Almanac** (N8+N9) — state-aware tables, calendar feeding the Turn | Tables that re-read your world; a date the engine runs on | $5 | $57 |
| 12 | **Player Codex** (N7) — visibility-filtered shareable world file | The rented alternative is a wiki sub so players can browse ($90–105/yr, R-Q2) | $4 | $61 |
| 13 | **Continuity lint** (N5a) + **Press recaps/templates** (N6a) + **Audience dossier cards** (N1a) | Referential integrity + "previously on" + NPC briefs, all offline | $5 | **$66** |

**Honest total: ~$66 → the $49 claim holds with ~35% margin — but only with the new ideas; the existing 9 alone honestly reach ~$44.** Standing caveat (unchanged, must stay visible): whether buyers pay for a *no-AI* living world is in-market untested (R-Unknown-3); the deterministic demo is the instrument that will answer it (C-R8).

## 3.2 LEDGER B — the $229 WITH-AI ceiling ("everything they rent you for ~$229/year — owned")

| # | Capability | Rented equivalent (annual, cited) | Why ours is better | Tag | Weight | Running |
|---|---|---|---|---|---|---|
| 1 | **The owned no-AI floor** (Ledger A) | nothing rentable — no rival sells an offline deterministic world at any price | it exists; it's yours | — | $66 | $66 |
| 2 | **Existing AI suite, integrated** — ~15 generators + tool-calling copilot w/ approval queue + 49-prompt Arsenal + Decipher + transparency/cost ledger (P-§4; queue L9655, log L17842 [read]) | generator-library rental: LitRPG ~$5/mo ≈ $60/yr (PARTLY, R-Q1); chatbot substitute = $0 | the *integration* is the value: clamps, review queue, context engine, cost receipts — generation itself weighted ~$0 per C-M6a | [P] | $25 | $91 |
| 3 | **World Turn narration + shareable turn report** (Idea 1 I3 + C-#1) | StormScape "AI that remembers your campaign" $120/yr (CONFIRMED) | deterministic core + era-voiced telling; report doubles as the viral artifact (C-§2.3) | [A] | $20 | $111 |
| 4 | **LiveMode AI fire** (the stub, L12217 [inh]) + Notes generators | live-assist has no clean rental analog; slice of StormScape | local-first rail already built (P-§5) | [S] | $8 | **$119** |
| | — **OLD PLAN STOPS HERE: ~$119 vs $229. Short ~$110. The founder's verdict is CONFIRMED by arithmetic, not vibes.** — | | | | | |
| 5 | **N1 Hold Audience** — knowledge-clamped in-character NPCs w/ persona memory + canon write-back | AI-character play rents at LoreKeeper ~$100–110/yr (price CONFIRMED, conversion assumed) and Old Greg's $180/yr (CONFIRMED) | ours is private, persistent, and *provably ignorant of your secrets* — the anti-chatbot demo | [A] | $35 | $154 |
| 6 | **N2 Sandtable** — projection + AI branch narration | RippleForge sells "what happens next?" (mechanic CONFIRMED, price UNVERIFIED — R-Unknown-1) | offline, deterministic, rule-cited vs cloud-AI guesswork | [S] | $15 | $169 |
| 7 | **N5 Continuity Sweep + cited answers** | Archivist memory ~$120/yr (PARTLY) | audits canon that never leaves the machine; receipts resolve | [P] | $15 | $184 |
| 8 | **N4 Season Brief** — pacing metrics + dramatic read | Campaign Arks arcs/phases paid tier (~$60–100/yr, $ PARTLY) | computed from *your* session history; offline metrics | [P] | $12 | $196 |
| 9 | **N6 Table Press AI** — era-voiced recaps, letters/proclamations/notices at production quality | WA Master presentation $105/yr (CONFIRMED) | play-artifacts owned one-time vs renting presentation | [A] | $12 | $208 |
| 10 | **N3 Whisper voicing** — rumors as heard, distortion from propagation state | none ships it | requires propagation state no chatbot holds | [S] | $10 | $218 |
| 11 | **N8 Table authoring + N9 texture** | slice of generator rental (PARTLY) | tables that keep reading the world | [S] | $6 | $224 |
| 12 | **N11 World Interview** | onboarding has no rental analog | talk becomes structured state, not transcript | [S] | $5 | **$229** |
| 13 | **N10 Faction Council** (T3, ships later as a paid-era update) | none — the automated SWN faction turn (R-Q3 demand CONFIRMED) | approval-gated AI opposition | [S] | $10 | **$239** |

**Honest totals:** T1+T2 scope = **$229 on the nose**; with the T3 Council, **$239**. 

**Sensitivity, stated plainly (S+ honesty):** stripping every [S]-tagged weight (#4, 6, 10, 11, 12, 13 = $54) leaves a fully-anchored **$185**; stripping only the weakest three ([S] #10–12, $21) leaves **$208–218**. The gap-closers are real but unpriced by my own conservative method: (a) the owned-forever premium — the rented midline stack costs **another ~$345 every subsequent year** while ours costs $0; (b) privacy (no canon on anyone's server — R-Q5's accepted side); (c) the Sandtable's [S] is capability-anchored to a shipping competitor. I judge $229 **honestly defensible at T1+T2 scope, with the year-two argument as structural headroom — but it is only defensible if N1 and N2 ship and land.** Without the two flagships, the honest ceiling is ~$180: say so internally and sequence accordingly.

## 3.3 What the ledgers prove

1. The founder's verdict was correct and is now quantified: **old plan ≈ $119 of $229.**
2. The missing $110 was never going to come from more generators — it comes from **state-exploiting AI surfaces** (N1–N6) plus floor texture (N3/N7/N8/N9).
3. The floor also needed help: **$44 → $66.**
4. Public copy never says $229 (C-M6c). The public form of Ledger B is: *"What GMs rent for $345+ every year — a living world, NPCs that remember, campaign memory, projections, player handouts — owned outright, private, working offline."*

---

# §4 SCOPE SANITY — solo founder, anti-scope-trap (IDEAS §1.e binds)

## 4.1 Tiers

| Tier | Ideas | Build shape | Ledger carried |
|---|---|---|---|
| **T1 — flagship-build (two, deep)** | **N1 Hold Audience**, **N2 Sandtable** | N1 = persona context builder (pure fn) + chat reuse (`streamOnce` L10187) + per-NPC log + Decipher handoff; N2 = Idea 1's pure `worldTurn()` on a clone + diff renderer. Both Node-provable at the core; both reuse shipped UI patterns | $35 + $15 AI, $6 no-AI |
| **T2 — cheap-data / thin-UI over existing engines** | N3 v1, N4, N5, N6, N7, N8, N9, N11 | pure functions over verified arrays + one generator each + print/export pipelines that already exist (L9205, L8972, L8846) | $48 AI, $16 no-AI |
| **T3 — later, deliberately** | N10 Faction Council; N3 full propagation graph; Expedition Desk; Session-Zero | after the deterministic Turn teaches turn-UX; Council doubles as paid-era update material (C-#6 pack logic) | $10 AI |

**T1+T2 alone carry the entire case: no-AI $66 and with-AI $229 (§3.2 #1–12).** T3 is upside, not load-bearing. Two flagships only — everything else is data, pure functions, or a thin surface over engines that exist. This honors the counsel's reformulation: only flagship surfaces get deep AI; the long tail rides cheap rails.

**Named engineering landmines (so the Blueprint inherits them, not discovers them):** (1) any NEW top-level nation array (`n.tables`, `n.pressArchive`) must be added to `buildNationFromSeed`'s explicit field whitelist (L6342–6375 **[read]**) or it is silently dropped on export→import — the same class as Idea 4's threshold landmine (L6386–6394 **[read]**); per-entity additions are safe (factions/chronicle/characters/artifacts spread `{...x}`, L6350/6352/6354/6355 **[read]**). (2) N1/N6/N7 are **hard-gated on Phase 0's `CLAMP.visibility` fix** — knowledge clamps and player-safe exports over an unclamped visibility field would be trust bugs wearing feature clothes. (3) N2 must not route through live `State.setStat` (mutates + dispatches) — clone-pure compute only. (4) The front catastrophe label fix (`type:'Military'` hardcode, L7295 **[read]**, C-#1) precedes any surface that prints turn output (N2, N6).

## 4.2 Mapping onto the CEO roadmap (trust-first sequencing unbroken)

| CEO Phase (C-§5) | Unchanged contents | This artifact adds |
|---|---|---|
| **0 — TRUST** | full R6 list | nothing — untouchable; N1/N6/N7 formally depend on it |
| **1 — IDENTITY + GATES** | GM-first, GM Emulator, halal sweep | the §2 naming/halal rules enter the copy standard now (Sandtable/Press/Almanac vocabulary) |
| **2 — THE WEAPON** | World Turn + Heartbeat + Vault UI | build `worldTurn()` **as a clone-pure function from day one** (Sandtable rides free); **Almanac-lite** (season names + turn labels) so the first turn report reads "Turn of the Lean Winter" |
| **3 — LAUNCH ($19 window)** | Tonight-Lite demo, store, instrumentation | **N7 Player Codex** (cheap, post-CLAMP, a store-page line no rival can copy) + **N2 Sandtable** (shares Phase-2 compute; second screenshot: the projection diff) |
| **4 — THE HABIT** | Run Mode v1, canon loop | **N6 Press recap** ("previously on" = the weekly habit artifact) + **N4 Season Brief** (reads the sessions Run Mode now logs) + **N3 Whisper v1** inside the turn report |
| **5 — DEPTH + price move ($29/$49)** | House-Rules + packs, Intake | **N1 Hold Audience ships here as the headline of the price move** + **N8 Table Engine** (House-Rules editor extends to tables; packs line widens per C-#6) + **N5 Sweep** + **N11 Interview** |
| **6 — AI ELEVATION + polish** | LiveMode fire, Notes generators, deep-links | **N10 Faction Council** (and/or first paid-era update) + N3 full graph |

Sequencing logic: nothing public before trust (C-R6); the price moves to $29/$49 exactly when the with-AI ledger crosses ~$200 of shipped value (Phases 4→5) — the price now *follows the ledger*, which resolves the founder's ceiling complaint structurally, not rhetorically.

---

# §5 SELF-GRADE (producer's grade — never final)

## 5.1 Per idea vs Rubric I

| Idea | I1 pain | I2 no-AI | I3 AI-on-state | I4 feasible (key hooks) | I5 diff + anti-chatbot | I6 constraints | I7 failures | $ tag |
|---|---|---|---|---|---|---|---|---|
| N1 Audience | PASS R-Q1/Q4 | PASS (dossier) | PASS (clamp) | PASS L6949–59/L9364/L10187/L10720/L10757 | PASS R-Q1 + C-M6a | PASS (halal copy rule incl. deceased-NPC framing) | PASS (4) | [A] |
| N2 Sandtable | PASS R-Q3 | PASS (whole) | PASS (rule-cited branches) | PASS L7015/L4753–81/L7288/L4783 | PASS R-T2 | PASS (anti-fate copy rules) | PASS (3) | [S-price/A-capability] |
| N3 Whisper | PASS R-Q3 | PASS (ledger) | PASS (distortion state) | PASS L16043/L7379–81/L7426/L6352 | PASS R-Q1/Q3 | PASS | PASS (3) | [S] |
| N4 Brief | PASS R-Q4/Q1 | PASS (metrics) | PASS (trajectory) | PASS L7109–20/L7159–60/L7290/L11128 | PASS R-Q1 | PASS | PASS (3) | [P] |
| N5 Sweep | PASS R-Q1/Q4 | PASS (lint) | PASS (cited audit) | PASS L10543/L4744/L9942–43/L7653–55 | PASS R-Q4 + C-M6a | PASS | PASS (3) | [P] |
| N6 Press | PASS R-Q4 | PASS (recap/templates) | PASS (visibility-aware docs) | PASS L10690–10728/L3373–77/L9205/L8972 + whitelist landmine | PASS R-Q2/Q5 | PASS (artifact types halal-reviewed) | PASS (3) | [A] |
| N7 Codex | PASS R-Q4/Q2 | PASS (whole) | N/A **declared** (floor feature, Vault-class exception) | PASS L7933/L8972/L8846 + CLAMP gate | PASS R-Q1 | PASS | PASS (3) | [A-anchor, small] |
| N8 Tables | PASS R-Q3/Q9 | PASS (engine) | PASS (state-conditioned authoring) | PASS L5018–19/L10674–80 + whitelist landmine | PASS (state-aware = novel) | PASS (no-maysir analysis; naming rules) | PASS (3) | [S/P] |
| N9 Almanac | PASS R-Q3 (texture inference — flagged) | PASS (whole) | N/A declared (rides narration) | PASS L12859–68/L7119 | PASS (engine runs on it) | PASS (no astrology) | PASS (2) | small |
| N10 Council | PASS R-Q3 | **declared AI-only** (deterministic sibling = Idea 1, stated) | PASS (queue/scopes/fronts) | PASS L9355/L9655/L7282/L11130 | PASS (none ships it) | PASS | PASS (3) | [S] |
| N11 Interview | PASS R-Q6/Q2 + C-Intake | **declared AI-only** (sibling = Day-One Intake) | PASS (talk→state via review) | PASS L10576/L9346–59/L10773 | PASS | PASS | PASS (2) | [S] |

## 5.2 Portfolio gate (with the founder's NEW fourth gate)

- **First-hour wow:** unchanged base (Heartbeat + Tonight-Lite, zero-key) **plus** the Sandtable diff and the Codex handout — two more screenshots that no rival can take. PASS.
- **Weekly retention:** End Session → World Turn → turn report **+ "previously on" recap (N6) + Season Brief (N4) + whisper lines in the report (N3)** — the week now produces *artifacts*, not just state. PASS, strengthened.
- **$49 no-AI floor:** Ledger A = $66 honest ($44 without this artifact's additions — stated, not hidden). PASS with margin.
- **NEW — $229 with-AI ceiling:** Ledger B = $229 at T1+T2, $239 with T3; fully-anchored core $185–208 with named, unpriced headroom (year-two rental, privacy). **PASS, conditional on N1+N2 shipping** — stated as a condition, not assumed.

## 5.3 S+ honesty — what is speculative, what is untested

1. **All coverage fractions in §3 are judgments, not measurements** — the method is conservative (one rental year, no ownership premium) but the fractions themselves are mine. A hostile checker can re-derive every weight from the table; none hides behind a formula.
2. **[S]-tagged weights total $54** of $239; the ledger's pass survives partial but not total removal (sensitivity in §3.2, stated).
3. **R-Unknown-3 still binds:** no-AI living-world demand is untested in-market; Ledger A is an argument, not a sales record. The deterministic demo remains the instrument (C-R8).
4. **Currency:** LoreKeeper €→$ conversion is approximate and flagged. **Archivist tier exactness is PARTLY** per the research; I anchored at the sources-bullet figure (~$10/mo), never the founder-brief's "$10–35" (not in the research's table).
5. **Feasibility claims are hook-level, not effort-quantified** — consistent with the no-fantasy-timelines rule; the two T1 flagships are the only deep builds, and their cores are Node-provable pure logic.
6. **N1's clamp is only as true as Phase 0's CLAMP fix** — dependency stated three times because it is the idea's load-bearing wall.
7. Halal rulings on framing (Sandtable's projection vocabulary, Audience with deceased NPCs, Almanac festivals) follow the file's own sweep standard (L4844) and the counsel's maysir/divination analysis (I-§1.d) — **final say is Hunter's**, as with C-R1.

**Independent check: PENDING** (per QUALITY-BAR, the producer's grade is never final). Fastest hostile checks: re-read L9958–9961 + L9933 (context includes all secrets — N1's premise); grep `recap|randomTable|worldTurn|knownBy|interview` → zero (novelty claims); re-read L10543/L10038 (continuity check is one-event — N5's extension claim); L6342–6375 (import whitelist landmine); L10690/L10700/L10711 + L3373–3377 (Press builds on real generators); L9942–9943 (event IDs in context — Grounding Rule plumbing); re-add my arithmetic in §3 (44+22=66; 119+110=229 gap; column sums).

*Producer's verdict: A+ layer (every cite resolvable, every number derived and tagged) + S+ layer claimed (the state-inventory gap analysis of §1.2, the Grounding Rule, the two-flagship concentration, and price-follows-ledger sequencing are decisions no prior artifact made). Grade: A pending independent check.*

---

## Independent check (a different mind than the producer; 2026-06-12)

Ran the artifact's own fastest hostile checks plus arithmetic re-derivation. **12+ citations re-verified at source, zero false; column sums re-derived by hand, correct.** Personally verified: context includes ALL secrets unfiltered + `[secret]`-tagged private events (L9958-61/L9933 — N1's gap premise TRUE); short event-IDs already printed in context (L9942-43 — Grounding Rule plumbing real); `checkContinuity` is one-event, verdict-only (L10543/L10555 — N5's extension claim TRUE); novelty greps `randomTable|worldTurn|knownBy|pressArchive` → zero (claimed-new systems genuinely absent); all three Press generators + GM-bar buttons exist as cited (L10690/10700/10711, L3373-77); earlier-session verifications already covered the import whitelist/threshold-rebuild landmines (L6342-94) and `streamOnce`/export/Decipher hooks. Weight-fractions are judgments — but tagged [A]/[P]/[S] with stated sensitivity ($185 fully-anchored core), which is what honesty requires.

**Hunter's rulings (2026-06-12, see INDEX) applied:** (1) "oracle" naming is halal-acceptable — this artifact's anti-fate copy rules remain as *stricter market defaults*, not compliance requirements; the Word Mill table swap still proceeds (IP). (2) Demo = 5 AI uses on Hunter's Worker key + no-AI tasting + **no export/regular use** — demo builds exclude Codex/export/persist surfaces. (3) Pricing timing is **$19 for 30 days post-launch → $29** (supersedes this artifact's phase-triggered price move; the ledger remains the value justification, not the trigger).

**Verdict: all Rubric-I gates pass per idea; portfolio gate passes including the new $229 ceiling gate (conditional on N1+N2 shipping, as declared). A+ layer verified + S+ insight layer genuine. Grade: S+.**
