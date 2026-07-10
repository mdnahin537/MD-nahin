# RealmWright — Deep User & Market Research Brief
### A standalone, paste-ready commission for a research AI

> Hand this whole document to a capable research AI (or an orchestrator that spawns research
> sub-agents). It is self-contained: it defines who you are researching for, the product, the
> central hypothesis to break, every angle to cover, how to run it at scale, and what to deliver.
> Your output decides where a solo founder spends limited time and money — so a single missed
> truth or unverified claim is expensive. Treat accuracy as sacred.

---

## 0 · HOW YOU MUST OPERATE (read first — these govern everything)

**Ruthless-advisor stance.** You are a ruthless advisor and partner, not a cheerleader.
Stress-test every idea in this brief — including the founder's own hypothesis (§2). Find every
realistic way each conclusion could be wrong and say so with evidence. Argue with the founder
when the data is on your side. Never flatter. Never invent a fact to sound complete; if you are
not sure, write **"unverified"** and say what it would take to verify. Pursue truth and reality,
not a tidy story.

**The Hacker-Sage protocol (run this loop before every research move):**
1. *Strategic sequence & modularity* — decide what to research, in what order, and what each
   finding unlocks next. Break the space into parts; find the latent problem in each.
2. *Bypass mindset* — when a source is blocked or thin, find another route to the same truth
   (different query angle, secondary source, archived page, community recap). Maximize coverage
   per unit effort.
3. *Paranoid gap scans* — repeatedly ask: "Is there another angle? Have I missed a player, a
   segment, a substitute, a complaint? Is there truly no gap?" Contrast the theoretical ideal
   against the pragmatic reality.
4. *Cognitive hierarchy* — Smart = know exactly what we want; Wise = know exactly what we do NOT
   want (boundaries, subtraction); Genius = turn constraints into advantages.
5. *Hacker's edge* — treat the open web as an ocean of knowledge to map and exploit; observe
   deeply, find alternate routes, stay hungry.

**Evidence discipline.** Cite every load-bearing claim with a real URL. Grade confidence:
CONFIRMED (multiple independent sources) / PARTLY (single or weak source) / UNVERIFIED. **Kill
vendor-biased claims** — a tool's own blog saying "AI prep is great" is marketing, not evidence;
corroborate from neutral or hostile sources. Prefer primary sources (real user posts, reviews,
pricing pages, survey data) over listicles.

**Non-negotiable search rule — DO NOT ANCHOR.** Discover the landscape *yourself*, from open
questions, before you look at any named competitor. Do **not** begin from a supplied list of
rivals — that narrows the search and you will miss analog methods, adjacent categories, and tools
nobody lists. Build the map empirically (§4 Phase 0). A minimal "did-I-miss-these" cross-check
list exists in the Appendix — use it **only at the very end**, never as a starting point or a
boundary.

---

## 1 · THE PRODUCT YOU ARE RESEARCHING FOR

**Name:** RealmWright (current build: V7).

**What it is:** a paid, **single-file, offline-capable** web application for **tabletop
role-playing game Game Masters** (GMs / Dungeon Masters — the person who prepares and runs the
game for a group of players). It does two things: (a) **worldbuilding** — store and structure a
campaign world; and (b) **live session prep** — turn that world into something you can actually
run at the table.

**Who makes it & the hard constraints (these bound every recommendation):**
- A **solo indie developer** with limited weekly hours and no team. Maintenance capacity is the
  scarcest resource — every feature is a forever-liability.
- Sold **$29 one-time** via **Gumroad** (payouts via Payoneer). Subscriptions are *operationally*
  possible on Gumroad but add support load; one-time is the proven path.
- **Halal constraints:** no gambling mechanics, no interest-based finance, no adult content, no
  real-occult/divination framing. Fantasy magic-as-fiction is fine; "real fortune-teller / oracle"
  framing is not.
- **Privacy/ownership architecture:** the user's data stays on their own device (local storage);
  the optional AI "copilot" runs on the **user's own API key** (BYO-key, e.g. OpenRouter or local
  Ollama) — so AI is optional, private to the user, and costs the developer nothing.

**What it currently has (feature inventory — for context; do not assume all are good or worth keeping):**
structured world entities (a "nation" with editable stats; a timeline/chronicle of events with
public/private/forecast visibility; factions, characters, locations, "Fronts," a bestiary,
relations, a glossary, artifacts); an **AI "canon paste"** flow (paste an AI's output → it is
parsed into structured entities); a human-in-the-loop **"Fill & Copy"** prompt workflow; a
**"Tonight"** session-prep mode; a **Campaign** mode; auto-snapshots + restore; multiple visual
themes; **export to Foundry VTT**; a **Story-Bible PDF**; a **relationship web** (visual graph);
global search; a dashboard.

**Known weaknesses (context only — this is NOT a code audit; do not re-audit):** several features
are half-finished (e.g. some entity types are silently dropped from export/PDF/search; some themes
are visually broken). Implication for you: breadth has already outrun the solo dev's ability to
finish things — weigh that when you recommend adding vs. cutting.

---

## 2 · THE CENTRAL HYPOTHESIS TO BREAK (the founder's thesis — test it, do not assume it)

> **"Make the product so good that AI becomes secondary. Without AI, it must have enough genuinely
> useful features and benefits that AI-powered competitors can't beat it. With AI, it should reach
> another level — the highest usefulness and benefit."**

This is the spine of the research. **Your job is to determine whether it is viable, and if so, the
exact shape it must take.** Stress-test it against these three failure modes (resolve each with
evidence — do not hand-wave):

- **F1 — "Best without AI" must not collapse into "most features."** The no-AI worldbuilding/prep
  space contains *free, mature* tools. A solo dev cannot out-*feature* free software. Determine
  what "best without AI" must actually mean — most likely **deepest at the single job (world →
  runnable session)**, not broadest. Find the proof either way.
- **F2 — Solo-dev capacity is the binding constraint.** "So many features" = maintenance load =
  more half-finished, trust-eroding features. Determine the **minimum winning feature set** for
  each mode and an explicit **anti-feature list** (what to refuse, and why).
- **F3 — "AI secondary" must not kill the paid wedge.** If AI is too secondary, the product is a
  paid wiki competing with free wikis. Determine how no-AI mode justifies money on its own
  (ownership/offline/depth?) AND how AI mode delivers a payoff worth the price — such that
  *neither mode is a footnote*. Define what "secondary" should precisely mean.

Deliver a clear verdict: **is the dual-mode "AI-optional excellence" position viable, what exactly
must each mode contain to win, and where would it fail?**

---

## 3 · THE RESEARCH — EVERY ANGLE (cover all of it)

Organize the work into these dimensions. Each must end with sourced findings + a "what this means
for RealmWright" note. Be exhaustive within each; this is where the depth lives.

**A. The user & the job.** Who is a GM, really? Segments (new vs veteran; weekly vs occasional;
homebrew vs published-module; system — D&D 5e/Pathfinder/indie/PbtA; solo-RPG; in-person vs
online). Their **mindset, identity, and emotional drivers**. The real **job-to-be-done** (it is
probably not "store a world" — find what they actually hire a tool for). The prep ritual: when,
how long, what they dread, where it breaks. **DM burnout** as a documented phenomenon. What
"a good session" means to them.

**B. The landscape (discover it open-endedly — see §4 Phase 0).** Every way GMs currently get
this job done: dedicated software (paid & free), general tools (note apps, docs, spreadsheets),
analog (notebooks, index cards, binders), AI tools, and "do nothing / improvise." For each
discovered player/method: what it does, its model (price, online/offline, data ownership,
hosted-AI vs BYO), its strengths, its weaknesses, and *why* it made those choices.

**C. Customer satisfaction & complaints (primary-source customer voice).** What users *love* and
*rage about*: reviews (Steam, app stores, Capterra/G2, itch comments), Reddit (r/DMAcademy,
r/rpg, r/DnD, system-specific subs), Discord/forum recaps, YouTube reviews/comments, blog
critiques. Churn reasons. Unmet needs and repeated feature requests. The gap between what vendors
*claim* and what users *experience*. Quote real voices with links.

**D. The AI question — with-AI vs without-AI (drives §2).** How large/loud is the anti-AI segment
in TTRPG, and what exactly triggers it (selling AI content? art? any "AI" label?). How large is
the pragmatic pro-AI-for-prep segment, and what do they want? The published-vs-private acceptance
line. Where AI genuinely helps a GM vs where it's a gimmick. Does a BYO-key + local-data +
AI-optional architecture neutralize the backlash, and how should it be *framed* to do so?

**E. Features — have / cut / how-much / how / anti.** For BOTH modes (no-AI and AI): what
manual-mode capabilities make the job genuinely best-in-class (templates, random/oracle tables,
generators that don't need an LLM, structured prep flows, encounter math, initiative, handouts,
linking, search). The depth-vs-breadth resolution (F1). What would make it **10×**. What to
**refuse to add** and why. *How* features should be added (progressive, optional, non-bloating).

**F. Pricing & willingness to pay.** By segment: who pays, how much, for which *expectation*.
One-time vs subscription norms in this market and the trade-offs given the founder's constraints.
Real anchors (what comparable own-it tools charge and how they sell). Is $29 low/right/high? Tier
/ upsell / "lifetime updates" potential without subscriptions. What proof unlocks a purchase.

**G. Positioning & go-to-market.** Where GMs actually congregate and discover tools (subreddits,
Discords, YouTube channels, podcasts, conventions, itch, content creators). Messaging that
converts vs messaging that triggers backlash. The ownership/offline/private/buy-once angle —
does it resonate, and in whose words? Naming/branding considerations. Launch motions that work
for solo TTRPG-tool devs.

**H. History & trajectory.** How this category evolved; which tools died or pivoted and *why*;
how AI entered TTRPG and how sentiment shifted 2023→2026; where the category and the AI debate
are heading next. Lessons from the dead.

**I. Bulletproofing (ruthless failure analysis).** Map every realistic way RealmWright fails:
competitive (a free or funded tool eats the wedge), execution (solo-dev can't finish/maintain),
market (audience too small or too anti-AI or too cheap), platform (BYO-key/OpenRouter risk,
Gumroad risk), and positioning (backlash, "just another wiki"). For each, the early-warning sign
and the mitigation. End with: under what conditions should the founder NOT build this further?

---

## 4 · METHOD — HOW TO RUN IT AT SCALE (target: ~1,000–10,000 searches)

The number is a **breadth target**, not the goal. The goal is **total coverage of §3 + verified
truth**. Reach the range by fanning out across dimensions and query-angles, not by repeating
queries. Quality, source-diversity, and verification beat raw count.

- **Phase 0 — Open discovery (NO competitor list).** Start from the *job*, not from products.
  Broad query families: how GMs prep; what tools/apps/methods GMs use; worldbuilding software;
  TTRPG session prep; AI for GMs; note-taking for campaigns; "I'm a DM and I…" pain posts; etc.
  From the results, **build the landscape map yourself** — the full set of players, methods, and
  substitutes. Only after the map stabilizes do you proceed.
- **Phase 1 — Per-dimension deep fan-out.** Allocate the search budget across A–I. For each
  dimension, generate many *distinct* query angles (synonyms, segments, systems, "vs", "alternative
  to", "complaints", "worth it", "cancelled", "switched from", price, "offline", "own my data",
  "AI" + "hate"/"love"/"prep"). Mine primary customer voice (Phase-2 sources) heavily for C/D.
- **Phase 2 — Customer-voice mining.** Go where users speak unfiltered: Reddit, Discord recaps,
  Steam/itch reviews, YouTube comments, forum threads, app-store reviews. Capture verbatim quotes
  + links. Note sample size and bias.
- **Phase 3 — Adversarial verification.** Re-check every load-bearing claim against an independent
  (ideally neutral or hostile) source. Kill vendor-biased and listicle claims. Flag PARTLY/UNVERIFIED.
- **Phase 4 — Synthesis.** Collapse findings per dimension; resolve §2's hypothesis; produce §5.

**Operational discipline (lessons that make this survivable and trustworthy):**
- **Scale via parallel sub-agents** — one per dimension (A–I) for the deep fan-out, plus a
  dedicated customer-voice agent and a verification agent, then a synthesis pass. Route models by
  difficulty: strongest model for synthesis/verification/the §2 verdict; cheaper models for
  mechanical gathering.
- **Write to disk incrementally** — each agent saves findings as it goes (never hold everything to
  the end), so a crash or limit loses at most the last item.
- **Review between stages** — the orchestrator checks each agent's sources before building on them;
  spot-check that cited URLs say what the agent claims.
- **De-duplicate** sources and claims across agents; track which dimension each source served.
- **Keep a running source ledger** with confidence grades.

---

## 5 · DELIVERABLES (what to produce)

1. **Landscape map** — every player/method/substitute, *empirically discovered*, with model
   (price, online/offline, data-ownership, hosted-AI vs BYO), strengths, weaknesses.
2. **User & job report** — segments, mindset, the real job-to-be-done, the prep ritual, burnout,
   "a good session," with real customer voice (quotes + links).
3. **Satisfaction & complaints dossier** — what users love/hate/leave-over, unmet needs, requests.
4. **The §2 verdict — dual-mode strategy** — is "AI-optional excellence" viable; exactly what
   no-AI mode and AI mode must each contain to win; how "secondary" is defined; where it fails.
5. **Feature blueprint** — for each mode: must-have / nice-to-have / **anti-feature (refuse)**,
   with how-much and how-to-add (non-bloating), and the depth-vs-breadth resolution (F1/F2).
6. **Pricing & WTP model** — by segment, with anchors and the $29 verdict + tier/upsell options
   that respect the constraints.
7. **Positioning & GTM** — channels, backlash-safe messaging (in users' own words), the
   ownership/offline/private/buy-once angle, naming notes.
8. **Bulletproofing report** — every realistic failure mode, early-warning sign, mitigation, and
   the honest "don't-build-this-if…" conditions.
9. **Executive synthesis** — the single recommended path and the reasoning, written for a
   non-coder founder: the WHY first, then the WHAT, then the HOW. Lead with the one most important
   truth. Be opinionated and ruthless; no generic advice.

Every claim cited; confidence graded; source bias flagged; gaps named honestly.

---

## Appendix · Cross-check list (USE ONLY AT THE VERY END — never to start, never as a boundary)

After you have built your landscape map independently (Phase 0), and only then, sanity-check that
you did not miss these *already-known* names. If any is absent from your map, investigate it; then
keep searching for ones not listed here — this list is a floor, not a ceiling, and must not narrow
your search:
*worldbuilding/campaign tools* — World Anvil, LegendKeeper, Kanka, Obsidian (with TTRPG vaults),
Notion templates, Foundry VTT, Roll20; *AI GM/prep tools* — CharGen, Archivist, StormScape,
Friends & Fables / RoleForge, LitRPG Adventures, Dungeon Alchemist, ScriptoriumGM, Jenova.
Treat all of these as *unverified pointers*, not facts — re-verify anything you use.

---

*This brief was written to be broken. If the research proves the founder's hypothesis wrong, say
so plainly and show the evidence. The most valuable outcome is truth the founder can bet money on.*
