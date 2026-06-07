# RealmWright V7 — Ruthless Product-Value Review

*Lens: YC product diagnostic (job-to-be-done, narrowest wedge, activation, retention, scope-as-subtraction). Grounded in `.audit/MAP.md`, `.audit/verify/REPORT-v2.md`, `.audit/BRIEF.md`, and known 2026 competitor pricing. This is a product review, not a bug audit — bugs are referenced only where they break the product story. The two planning skills (`plan-ceo-review`, `office-hours`) were not on disk this session; I applied the same job-to-be-done / wedge / activation / retention / scope-discipline rigor directly.*

---

## BRUTAL SUMMARY

RealmWright is a **beautifully over-built worldbuilding wiki competing in a category it cannot win, while sitting on top of the one feature that could actually win** — the AI "canon paste" + "Tonight" session-prep loop. As a wiki it is a strictly worse Kanka / World Anvil / LegendKeeper (those are live, collaborative, hyperlinked, multi-world, battle-tested, and cost $0-12/mo *with free tiers*). Its real, defensible job is **"turn my messy world into a session I can actually run, 15 minutes before I play"** — and that job is buried under nine entity types, three themes, a relationship web, and a Foundry export almost nobody asked for. The single most important truth: **the product is wide where it should be deep.** A GM does not pay $29 for the twelfth place to store a faction; they pay to never again sit down Thursday night with a cold campaign and no plan. Today three things stand between the curious user and that one payoff: a BYO-key wall (no AI until they fetch and paste an OpenRouter key), a demo modal that reopens on *every* launch (so it reads as nag, not onboarding), and a "Tonight" mode that is a **viewer**, not a **generator** — it displays prep instead of producing it.

---

## TOP 3 MOVES (ranked by impact on paid conversion + retention)

| # | Move | Why it wins | Effort |
|---|------|-------------|--------|
| **1** | **Make "Tonight" a generator, not a viewer — and make it the product's front door.** Today Tonight *displays* session prep. Turn it into: "press one button Thursday night → AI drafts tonight's scenes, NPC voices, 3 likely player questions, an opening read-aloud — from the canon you already have." Lead the entire app with this. | The only wedge **no competitor owns**. World Anvil / LegendKeeper / Kanka are *storage*; none generate a runnable session from your world. TTRPG retention is weekly and bursty — a weekly "what do I run tonight?" hook is the only thing that earns a re-open. | **M** — AI plumbing, canon model, and the Tonight shell already exist; this is rewiring, not new infra. |
| **2** | **Kill the BYO-key wall for first value. Ship a no-key demo that proves the magic before asking for a key.** Today a GM must fetch + paste an OpenRouter key before *any* AI fires. That is a cliff between "curious" and "impressed." Pre-bake one fully-generated example session so the wow lands at second 30, not after a 10-minute key hunt. | The BYO-key wall is the single biggest activation killer (Q2). You cannot convert on a feature the user never sees fire. The demo Worker proxy (`/api/demo/generate`) already exists — point it at a canned, rate-capped sample. | **S-M** — Worker proxy + one curated sample world. |
| **3** | **Cut the wiki ambitions to a spine; reframe from "worldbuilder" to "session co-GM."** Demote/merge the second-class entities (Bestiary, Relations, relationship web, Foundry export) the audit *already proves* are half-wired and dropped from export/PDF/search. Sell the **outcome** ("run a great session with 15 min of prep"), not the **container** ("store your whole world"). | Focus is subtraction. A solo builder in Dhaka cannot out-feature a funded wiki, and every half-feature is a trust leak — a GM who finds Fronts missing from the PDF stops trusting the export entirely. Narrowing the promise also narrows what must be bulletproof before launch. | **S** — mostly copy, positioning, and *hiding* (not deleting) features. |

---

## Q1 — JOB-TO-BE-DONE & WEDGE

**The job a GM actually hires this for.** Not "build a world." GMs build worlds for *fun* — in Notion, on legal pads, in their heads, for free. The job they will *pay* for is the painful one they avoid: **"It's the night before the session, my world is a mess of notes, and I need a runnable plan for tonight — scenes, NPCs, a hook, and what happens if the players go off-script."** This is *the* canonical GM pain: most GMs enjoy worldbuilding but chronically run out of prep time, and the appeal of AI here is compressing multi-hour prep into 15-45 minutes. That is the wedge. It is the one thing a free tool and a funded competitor *both* fail at.

**Does it do that ONE job better than the alternatives? Today: no.** Ranked honestly:

- **As a worldbuilding wiki** (nations, factions, characters, locations, glossary, timeline): a **worse** World Anvil / LegendKeeper / Kanka. Those are collaborative, cloud-synced, infinitely hyperlinked, multi-world, battle-tested, and run $0-12/mo *with real free tiers*. RealmWright is single-file, single-world-feeling, offline, $29. On the wiki axis it is strictly dominated. **Do not fight here.**
- **Against Notion / Obsidian templates:** RealmWright's structured entities + stats beat a blank template, but a GM who already lives in Notion will not switch *containers* for marginally-better structure. Not a wedge.
- **Against a legal pad:** the pad wins on speed-to-jot and loses on "turn this into a session." That gap is the opening.
- **The AI-canon + Tonight loop:** *this* is the sharp wedge, and **nobody in the category owns it.** "Paste your world → it becomes structured canon → press a button → tonight's session is drafted." That is a different product than storage. It is a **co-GM**, not a **wiki**.

**The sharpest possible wedge from the existing features (pressure-tested):**

> **"RealmWright reads your world and runs your table. Bring your campaign, press Tonight, and get a session you can actually run in 15 minutes — scenes, NPC voices, the hook, and what to do when players go sideways."**

The AI-canon flow is the *input* that makes this cheap (the world is already structured, so the AI works on clean material). "Tonight" is the *output* that delivers the job. The rest of the app (the nine entity types) is **scaffolding for those two moments** and should be sold and built as such.

**The honest risk to this wedge.** It is BYO-key. The magic moment depends on the user having pasted an OpenRouter key — so **the wedge and the activation killer are the same problem** (Q2). It also leans on AI quality the creator does not control (the user's chosen model). Point it at a weak free model, get mush, and the wedge dies on arrival. The product must (a) recommend a known-good default model loudly, and (b) prove the magic on a curated demo *before* the key wall. Without that, the wedge is theoretical.

---

## Q2 — ACTIVATION (first launch → "I'd pay $29")

**The path today, step by step, with the break points marked:**

1. **Launch → FrontDoor modal opens.** Per the audit (C09-1, L6418/L6452/L17498) the "first-run done" flag is **never set true**, so the pitch/demo modal reopens on *every single launch*. **Break #1 (own goal):** a returning user who already bought is greeted by the sales pitch forever. This trains the user to reflexively dismiss the one surface that is supposed to drive activation. Onboarding that never ends is not onboarding — it is a nag.
2. **Onboarding → land in the WorldShell dashboard, seeded with one example nation.** Reasonable. The user can poke at nations, factions, timeline. This is "looks like a wiki" territory — pleasant, but it is the part the user can get free elsewhere. No payoff yet.
3. **Try the AI copilot → the BYO-key wall.** The user clicks anything AI ("canon paste," copilot chat, and — if it generated — Tonight) and hits: *get an OpenRouter account → generate an API key → paste it here.* **Break #2, and this is the single biggest activation killer.** Reasoning below.
4. **(If they cross the wall) → first real AI output.** *This* is the only moment that justifies $29. Everything before it is table stakes. The product makes the user climb the steepest part of the mountain *before* showing the view.

**The single biggest activation killer: the BYO-key wall standing in front of first value.**

Why it is fatal, not merely annoying:

- **It front-loads the highest-friction step before any payoff.** The canonical activation rule is *deliver the magic before you ask for work.* RealmWright inverts it: it asks the user to go create an account on a *third-party* service (OpenRouter), understand what an API key is, generate one, fund it or attach a model, and paste it back — all on faith, before they have seen the product do one impressive thing. For a non-technical GM (most of them), "generate an API key" is a foreign-language instruction. The audience for a fantasy-prep tool is storytellers, not developers.
- **It is a multi-vendor cliff.** Activation now depends on a flow the creator does not own and cannot fix: OpenRouter's signup, OpenRouter's funding/credits, the user picking a non-garbage model. Any snag there reads to the user as *RealmWright is broken.*
- **It compounds with Break #1.** The nagging FrontDoor and the key wall together produce the worst first-session shape possible: "a pop-up keeps selling me, and the one cool feature demands homework on another website." That is a refund, not a conversion.
- **It is the SAME barrier as the wedge.** Q1's defensible job *is* the AI loop. If the user never crosses the key wall, they never see the wedge, so they evaluate RealmWright purely as a wiki — where it loses (Q1). **The key wall doesn't just hurt activation; it hides the only reason to buy.**

**The fix is Move #2: a no-key demo that fires the magic first.** Use the existing `/api/demo/generate` Worker proxy (already built, per MAP.md) to run one *curated, rate-capped* example: a pre-loaded sample world where pressing "Tonight" instantly produces a polished, generated session — no key, no signup, second-30 wow. Only *after* the user has felt the payoff do you say: "Want this on *your* world? Add a free OpenRouter key — here's the 60-second walkthrough, and here's the exact model to pick." That reorders the mountain: **view first, climb second.**

**Two cheaper supporting fixes (both already implied by the bug report):**
- **Set the first-run flag** so FrontDoor stops reopening (C09-1). Trivial, and it stops actively training users to ignore your activation surface.
- **Make the key step a guided, in-product walkthrough**, not a bare "paste your key" box — with the recommended model named loudly (the wedge dies on a weak model, per Q1). Embed the OpenRouter signup link and a one-line "why am I doing this? — so the AI costs you nothing and stays private to you" justification. The BYO-key model is actually a *halal/cost win* (the creator pays nothing, the user owns their spend) — but only if it is framed and walked through, not dumped as a wall.

**Net:** the architecture is sound (BYO-key is the right business model). The *sequencing* is backwards. Show value at second 30 on a demo; ask for the key only once the user wants it on their own world.

---

## Q3 — RETENTION (TTRPG prep is weekly and bursty)

**The retention shape of this audience is unusually clear, and it is the product's biggest opportunity.** GMs run on a *cadence* — most groups play weekly or biweekly, and prep happens in a predictable burst the night (or few nights) before. That means the retention question has a precise answer: **what does a GM open the night before they play?** If RealmWright is the answer to that question, retention is excellent. If it is "the place I built my world once," retention is near zero — worldbuilding is a one-time-ish burst; nobody re-opens a finished wiki weekly.

**Is "Tonight mode" the hook? It is the *right* hook, but today it is too weak to be one.** Per the brief and feature inventory, Tonight is a session-prep **viewer/display** mode, not a **generator**. A viewer does not earn a weekly re-open — it just shows you the notes you already have, which you could read anywhere. The thing that earns the Thursday-night habit is *production*: "I press one button and tonight's session materializes from my canon." That is a reason to come back every single game-week. Display is not.

**Why this matters more than any other retention lever:** a one-time $29 product has *no recurring billing to enforce engagement* — there is no renewal moment to remind the user it exists. The only thing that brings them back is intrinsic weekly utility. For a GM, the only reliably-weekly job is **prep for the next session.** So Tonight-as-generator is not just *a* retention feature; it is essentially the *only* viable one. Everything else (worldbuilding, the wiki entities) is front-loaded and decays.

**The retention loop to build (Move #1 makes this real):**

> Game-week N: open RealmWright → press **Tonight** → AI drafts tonight's scenes/NPCs/hook from current canon → run the session → jot 2-3 outcomes back into canon (what the players did, who died, what changed) → next week the *next* Tonight is shaped by what just happened.

That last clause is the compounding hook: **the more sessions you run through it, the more it knows your campaign, and the better next week's prep gets.** That is a switching cost and a habit in one. A wiki has no such loop — it is a filing cabinet that gets heavier, not smarter.

**Secondary retention reality checks (ruthless):**
- **Campaign mode** is the right container for the *across-weeks* state that makes the loop compound — but it is only valuable *because* of the weekly Tonight burst, not on its own. Don't sell Campaign mode as a feature; sell the weekly payoff it enables.
- **Auto-snapshots/restore** is a safety/trust feature, not a retention feature. It keeps users from churning *out* in anger; it does not pull them *back* in. Keep it (cheap insurance), don't headline it.
- **The relationship web, glossary, bestiary, themes** contribute *nothing* to weekly retention. They are build-time toys. (See the cut list, Q5.)

**Verdict:** Tonight is the only credible retention hook, and in its current viewer form it is not strong enough to create a habit. Converting it to a generator (Move #1) is the difference between a product a GM opens 50 times a year and one they open twice.

---

## Q4 — THE $29 QUESTION

**Is one-time $29 right, too low, or the wrong model?** Short answer: **$29 one-time is *defensible as a launch price* but is quietly the wrong model for the wedge — and is more likely *too low* than too high.** Unpack:

**Would a real GM pay $29?** Yes — *if* they see the wedge fire (Q2). GMs already spend freely: rulebooks run $30-60 each, they buy adventure modules, dice, minis, VTT subscriptions, and World Anvil / LegendKeeper guild tiers at $5-12/mo (which is $60-144/*year*). Against that, **$29 one-time for a tool that saves hours of prep every week is a screaming bargain** — *if* the value is believed. The problem has never been the number; it is that the value is invisible until the user crosses the key wall. **Price is not the conversion blocker. Proof is.**

**Is it too low?** For the *wedge* (a co-GM that produces a runnable session weekly), $29-once is almost certainly underpriced relative to the value delivered — a competitor charges that *per year* for mere storage. The instinct to raise price is correct *in the abstract*. But raising a one-time price without a recurring relationship just leaves money on the table either way, which points at the real issue:

**The model mismatch.** A *one-time* price fits a *tool you use once* (a worldbuilding wiki you fill and keep). It fits **badly** with the *wedge*, which is a *recurring weekly utility* (session generation) that imposes a recurring cost-ish surface (the user's own AI spend, ongoing model usage) and delivers recurring value. The natural monetization of a weekly-use co-GM is **recurring or usage-aligned**, not one-and-done. BUT — and this is the hard constraint — **recurring billing collides with two of Hunter's realities:** (1) **halal**: subscriptions are fine in themselves, but he must avoid interest-bearing payment rails and gambling-style "credits"; and (2) **payout rails**: Gumroad + Payoneer. Gumroad *does* support subscriptions/memberships and pays out via Payoneer, so a monthly plan is *operationally* possible — but it adds support burden a solo builder may not want, and one-time-via-Gumroad is the proven, frictionless path he is already on.

**The pragmatic verdict (what I'd actually do):**
- **Keep $29 one-time as the launch offer** — it is honest, halal-clean, payout-clean, and removes subscription anxiety at the exact moment trust is lowest. Do **not** raise it before conversion is proven; you cannot price-optimize a product whose value users can't see.
- **Once the demo + Tonight-generator land and conversion is real, test a higher one-time tier (~$39-49) and/or an optional "supporter / lifetime updates" tier**, rather than a forced subscription. This captures the under-pricing without taking on subscription support load or any haram-rail risk.
- **The real lever is not price; it is proof.** Which brings us to:

**The single feature/proof that most moves conversion:** a **playable demo of the wedge with no key required** (Move #2) — a one-click "see Tonight generate a full session from this sample world" on the sales page and on first launch. Conversion on a $29 creative tool is driven by *"I felt the magic in under a minute,"* not by feature lists or price tuning. Nothing else — not a fourth theme, not the relationship web, not Foundry export — moves the buy decision remotely as much as letting the user *watch the AI run a session* before they pay or paste a key. Second place, far behind, is **social proof**: 3-5 real GM testimonials with before/after prep-time quotes ("2 hours → 20 minutes"). Price third, distant.

---

## Q5 — CUT LIST (scope bloat a solo builder should not maintain)

**The governing principle: every feature is a liability a solo builder pays for forever — in maintenance, in bugs, and in *trust* when it's half-wired.** The audit already proves this is not theoretical: Fronts and Relations are *dropped from export, PDF, and search* (C07-1/C12-1), and a GM who discovers their Fronts missing from the Story-Bible PDF stops trusting the *entire* export. A half-feature is worse than no feature: it actively erodes confidence in the parts that work. Cut or demote anything that (a) doesn't serve the wedge, and (b) is already half-broken.

**CUT / DEFER (remove from the headline product; hide or quietly retire):**

| Feature | Verdict | Justification |
|---|---|---|
| **Foundry VTT export** | **CUT** (or move to a clearly-labeled "experimental" toggle) | A whole separate integration target — Foundry's data format changes across versions, so this is *permanent* maintenance for a feature that serves a *minority of a minority* (only GMs who use Foundry specifically, vs Roll20/Fantasy Grounds/in-person). It does nothing for the wedge (session generation) or for activation. Highest maintenance-to-value ratio in the app. A solo builder should not own a moving third-party export spec. |
| **Relationship web (SVG)** | **CUT from headline; demote to a minor view** | Audit flags it leaks a listener every render (C11-1) — i.e., it's already a perf/quality liability. More importantly it is a *build-time toy*: pretty in a screenshot, irrelevant to "what do I run tonight?" It does not produce a session. Demo-ware, not job-ware. Keep only if near-zero cost; do not invest in it. |
| **3 themes** | **CUT to 1 polished default; maybe 1 alt** | The audit shows themes are *actively broken* outside the default: 9 CSS custom properties undefined (C14-2), WorldShell structure styled only in Ember so Manuscript/Modern break (C14-5/C14-8). Three themes where two are broken is *negative* value — it ships visible bugs. Ship **one** beautiful editorial-dark theme that works flawlessly. Theme count is pure vanity scope for a solo builder; nobody buys a prep tool for theme choice. |
| **Bestiary** | **DEMOTE / fold into the entity system** | Not inherently bad, but it's a *ninth* entity type to maintain, migrate, sanitize, export, and keep in sync. Unless Tonight actively pulls monsters into generated encounters, it's just another wiki page that competitors already do. If it doesn't feed the generator, it's filler. Keep it *only* as fuel for Tonight (encounter generation); otherwise it's dead weight. |
| **Relations (as a standalone entity)** | **DEMOTE / fold into characters & factions** | Already dropped from export/PDF/search (C07-1) — i.e., shipped half-wired. Relationships are an *attribute* of characters/factions, not a separate top-level thing to maintain. Folding it removes a whole maintenance surface and an entire class of "it's missing from X" trust bugs. |

**KEEP (these serve the wedge or are cheap, essential trust):**
- **AI canon-paste + Fill & Copy** — the *input* half of the wedge. Core. (Fix the no-catch crash, GAP-8/9, before launch.)
- **Tonight + Campaign mode** — the *output* half and its container. The whole point. Invest here (Move #1).
- **Nations / characters / factions / locations / timeline** — the *minimum canon spine* the generator needs as raw material. Keep, but as *fuel for Tonight*, not as a wiki to admire.
- **Auto-snapshots / restore** — cheap, essential trust (don't lose my work). Keep, don't headline.
- **Story-Bible PDF** — a legitimate *output artifact* a GM values (something to print/hand around). Keep — but **only if it's complete** (fix the Fronts/Relations omission, or you ship a trust bug). If you can't make it complete cheaply, cut it rather than ship it lying.
- **Global search** — table stakes for any tool with this much content. Keep (and make it cover everything, or it's another trust leak).
- **Glossary / Artifacts** — borderline. Cheap if they're just simple entity lists *and* they feed Tonight (the AI can reference your artifacts/terms when generating). If they don't feed the generator and aren't in export, fold them. Lower priority than the cuts above.

**The meta-point:** narrowing scope is not just hygiene — it *shrinks the surface that must be bulletproof before launch.* The audit's ship-blockers (license chain, secret-leak, Fronts/Relations coverage, real DOMPurify) get *smaller* the moment you cut Foundry export, demote Relations, and drop two themes. **Cutting is the cheapest bug fix you have.**

---

## Q6 — TOP 3 PRODUCT MOVES (ranked; not bug fixes)

### Move 1 — Turn "Tonight" into a generator and make it the front door. *(Effort: M)*
**What:** Tonight stops being a prep *viewer* and becomes a one-button *session generator*: press it the night before → AI reads your current canon (the nations/characters/factions/timeline already structured by the canon-paste flow) → outputs a runnable session: 2-3 scenes, NPC voices/motivations, an opening read-aloud, 3 likely player questions with answers, and "if players go sideways, here's the pivot." Then make this the *first thing* the app is about — the WorldShell and the sales page both lead with "press Tonight."

**Why it wins:** It is the **only wedge no competitor owns** (Q1) *and* the **only credible weekly-retention hook** (Q3) — one move fixes both the differentiation problem and the come-back problem. World Anvil/LegendKeeper/Kanka store worlds; none *run* a session for you. This converts RealmWright from "a worse wiki" into "a thing that has no direct competitor."

**Why M, not L:** the hard infrastructure already exists — the AI streaming/tool-calling plumbing (`streamOnce`, COPILOT_TOOLS), the structured canon model, and the Tonight shell are all built. This is *rewiring* (point the existing AI at the existing canon, shape the output, surface the button) rather than new infrastructure. The risk is *prompt/output quality*, which is iteration, not architecture.

### Move 2 — Ship a no-key demo that fires the magic before the key wall. *(Effort: S-M)*
**What:** A curated, rate-capped sample world where pressing "Tonight" instantly generates a full polished session — **no API key, no signup.** Expose it both on first launch (replacing the nagging FrontDoor) and as a "try it live" button on the Gumroad/landing page. *After* the wow, present the key step as a guided 60-second walkthrough ("add a free OpenRouter key → here's the exact model to pick → here's why: the AI costs you nothing and stays private").

**Why it wins:** It defuses the **single biggest activation killer** (Q2 — the BYO-key cliff in front of first value) *and* it is the **single highest-leverage conversion proof** (Q4 — "I felt the magic in under a minute"). It also rescues the wedge from being invisible: today a user who won't cross the key wall evaluates RealmWright as a wiki and bounces; the demo makes the wedge the *first* thing they experience.

**Why S-M:** the `/api/demo/generate` Worker proxy already exists (MAP.md). The work is (a) one curated sample world + canned/cached generated output, (b) rate-capping on the Worker to protect spend (the audit flags this is *the* thing protecting AI cost — confirm the per-IP cap, NEEDS-WORKER-SOURCE), and (c) wiring the demo entry point. Pair it with the trivial C09-1 fix so FrontDoor stops reopening.

### Move 3 — Reframe positioning from "worldbuilder" to "session co-GM," and cut the wiki bloat to a spine. *(Effort: S)*
**What:** Rewrite the Gumroad page, in-app copy, and FrontDoor around the *outcome* — "RealmWright reads your world and runs your table; great sessions on 15 minutes of prep" — not the *container* ("store your whole world"). Simultaneously execute the cut list (Q5): retire/hide Foundry export, demote the relationship web and Relations, drop to one solid theme, gate Bestiary/Glossary on whether they feed Tonight.

**Why it wins:** Positioning is the cheapest lever with the largest leverage. Selling against World Anvil/Kanka on *storage* is a guaranteed loss (Q1); selling on an *outcome they can't deliver* is a guaranteed differentiator. And cutting bloat is *subtraction as a feature*: it removes half-wired trust bombs (Fronts/Relations missing from export, broken themes) and **shrinks the must-be-bulletproof surface before launch** — making the real ship-blockers smaller. A solo builder in Dhaka wins by being *sharp*, not *broad*.

**Why S:** mostly copy, page rework, and *hiding* (not deleting) features. The expensive part — building the wedge — is Moves 1 and 2; this move just *points all the words* at it.

**Sequencing note:** ship **Move 1 and Move 2 together** (the generator is what the demo demonstrates; a demo of a viewer is worthless), then **Move 3 wraps them in the right story.** Doing Move 3's positioning *before* the generator exists would be a promise the product can't yet keep.

---

## Q7 — HALAL CHECK

**Verdict: the product is fundamentally halal-clean. Fantasy TTRPG worldbuilding is fine. There is no gambling mechanic, no interest, no adult content, and no payment-rail problem (Gumroad/Payoneer, one-time).** But there are **three real adjacency risks** — two in *content framing*, one latent in *future monetization* — that should be handled deliberately, not assumed away.

1. **Occult / divination framing — the one to actively watch.** TTRPG worlds are *full* of magic, and magic-as-fantasy-fiction is broadly fine (it's clearly invented, not a claim about reality). The line to avoid is framing that presents **real-world divination, fortune-telling, summoning, or occult ritual** as something the tool *does for the user* — e.g., marketing the AI as an "oracle," a "tarot/fate reader," a "spirit summoner," or any "predict your real future" framing. The feature inventory has a **"forecast" event visibility type** and the AI could be prompted toward divinatory flavor. **Action:** keep all such content explicitly *in-fiction* (it's the *characters'* magic, narrated as fantasy), and never market the AI itself as a real oracle/diviner. Rename nothing in-app necessarily, but in *marketing copy* avoid "oracle/fortune/fate-reader/summon real" language. This is a *copy discipline*, not a code problem.
2. **The seeded/sample content (and the demo world in Move 2) — author it cleanly.** Whatever ships as `SEED_NATIONS` and the curated demo world is content *the creator is publishing*, so it carries his name. Keep it generic high-fantasy (kingdoms, factions, conflict, exploration). **Avoid** demo content that centers explicitly occult rituals, gambling dens as a *mechanic the user operates*, idol-worship presented approvingly, or sexual content. Fantasy *depicting* a tavern or a cult as a plot element is fine; *celebrating* haram acts or making the *user* perform a divination ritual is the line. Since Move 2 makes the demo the *first* thing every prospect sees, this is the highest-visibility content the product has — author it with care.
3. **Future monetization — keep it off interest/gambling rails (latent, from Q4).** This isn't a current problem (one-time $29 via Gumroad is clean). But if conversion testing later tempts a move to "credits," "loot-box-style" unlocks, "spin to unlock a theme," or any installment/BNPL financing with interest, *that* would introduce gambling/riba adjacency. **Action:** if monetization evolves, stick to straight one-time tiers or a flat subscription on Gumroad — never randomized/credit/gambling mechanics, never interest-bearing financing.

**What is explicitly fine (so it's not over-policed):** invented fantasy religions, fictional magic systems, monsters/bestiary, war and conflict in the narrative, fictional gambling *depicted as a setting element* (a tavern with a dice game in the story) — these are storytelling, not endorsement, and are standard, unobjectionable fantasy fare. The bar is **framing and endorsement**, not the mere presence of fantasy tropes.

**Bottom line:** no haram in the mechanics; the only live risk is *marketing/content framing* drifting into real-occult/divination or "oracle" language. Handle it as a copy rule for the landing page and the demo world. Everything else is clear.

---

*End of review. The single most important truth, restated: this product is wide where it should be deep. Build the one job (Tonight-as-generator), prove it before the key wall (no-key demo), and sell the outcome (co-GM, not wiki). Cut the rest — it's costing you maintenance, bugs, and trust for value no buyer is paying for.*
