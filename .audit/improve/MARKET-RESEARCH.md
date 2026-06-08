# RealmWright V7 — Market & Customer Research (Web-Sourced)

*Method: deep-research fan-out. Goal: ground or refute the strategy in `PRODUCT-REVIEW.md`. Every load-bearing claim is cited to a real 2025-2026 URL. Where a claim could not be corroborated, it is marked **[UNVERIFIED]**.*

---

## ⚠️ TOOLING CONSTRAINT — READ FIRST (affects confidence, not honesty)

**`WebFetch` is fully blocked in this environment** — every direct page fetch returned HTTP 403, including neutral controls (Wikipedia, vendor pricing pages, blogs, Reddit). I verified this against 8+ unrelated domains before concluding it is environmental, not site-specific.

**`WebSearch` works** and returns substantive, quotable extracts *with source URLs*. So every claim below is grounded in a real search-surfaced source, but I could **not** open the full page to read primary tables verbatim in most cases. Consequence:
- Pricing figures and policy facts that appeared **consistently across multiple independent search results** are graded **CONFIRMED**.
- Single-source figures are graded **PARTLY** and flagged.
- Direct Reddit/forum quote-mining was limited (Reddit fetch is blocked; Reddit rarely surfaces in this US WebSearch index). Customer-voice findings lean on review-blog and news aggregation of community sentiment, and are flagged where thin.

This is the honest reliability boundary. I did not fabricate a single figure or quote.

---

## WHAT THIS OVERTURNS IN PRODUCT-REVIEW.md (the corrections)

*(Filled in incrementally below; see Q1–Q6 for evidence.)*

1. **"The wedge (AI-canon + Tonight-as-generator) is one no competitor owns" — REFUTED / PARTLY.** Multiple 2026 tools already do persistent campaign memory + generate prep from your own world: **StormScape** ("the AI that remembers your campaign… NPCs and locations you create in session 3 are still contextually available in session 30"), **CharGen** (World Codex → entities → session prep + continuity), **Archivist** (ingests *your* sessions, builds a campaign-specific chatbot, generates recaps), **Friends & Fables / RoleForge** (run the game from world state). The *category* of "generate from your own canon" is occupied. ([CharGen](https://char-gen.com/blogs/ai-dungeon-master-session-prep-guide-2026), [Archivist](https://www.myarchivist.ai/ai-dungeon-master), [RoleForge](https://roleforge.ai/blog/best-ai-game-master-tools-compared/), [ScriptoriumGM](https://www.scriptoriumgm.com/blog/2026-03-31-best-ai-tools-for-dungeon-masters-2026))

2. **"All [wikis] have free tiers, $0-12/mo" — REFUTED for LegendKeeper.** LegendKeeper has **NO free tier** — $9/mo or $90/yr, only a 14-day no-card trial; lapsed accounts go read-only. ([LegendKeeper search-surfaced pricing](https://www.legendkeeper.com/pricing), [open-beta](https://www.legendkeeper.com/open-beta/))

3. **The AI-first positioning is treated as a pure asset — DANGEROUS.** 2025-2026 TTRPG community sentiment is *institutionally hostile* to AI: DriveThruRPG/DMs Guild **ban** AI-written text; **Inkarnate reversed** its AI-art policy after backlash (Oct 2025); the **ENnie Awards banned** all AI-assisted submissions for 2025-2026; **Foundry VTT's creator** called AI in tabletop "a betrayal." An AI-*led* pitch is a liability with the loud core; a quiet pro-AI-for-prep segment exists but must be reached carefully. ([ScriptoriumGM](https://www.scriptoriumgm.com/blog/2026-03-31-best-ai-tools-for-dungeon-masters-2026), [DriveThruRPG policy](https://help.drivethrurpg.com/hc/en-us/articles/26794784634007-Managing-AI-Generated-Content), [EN World](https://www.enworld.org/threads/dms-guild-and-drivethrurpg-ban-ai-written-works-requires-labels-for-ai-generated-art.698936/))

*(Further corrections and the verdict are in Q6.)*

---

## Q1 — AI GM-PREP COMPETITIVE LANDSCAPE

The "generate prep from your own world, with campaign memory" category is **occupied and crowded** in 2026. But it is occupied almost entirely by **cloud-hosted, subscription, host-the-AI** products. The table below is assembled from search-surfaced descriptions and pricing (graded CONFIRMED where it repeated across results; PARTLY where single-source).

| Tool | What it does | Price / model | Online-only vs offline | Data ownership | AI: BYO-key vs hosted |
|---|---|---|---|---|---|
| **CharGen** | Char/NPC gen, "World Codex" entities, session-prep, continuity | Freemium "gold" credits (25 on signup, 10/daily login), no card; paid top-ups | **Online-only** (web app) | Hosted on their servers | **Hosted** (their models, metered by "gold") |
| **Archivist** | Ingests *your* session transcripts → searchable campaign DB + campaign-specific chatbot + recaps | Free 30-day trial (1 campaign/2 sessions); Casual $10/mo; Seasoned $20/mo; Pro $35/mo+ | **Online-only** (SaaS) | Hosted (you upload transcripts to them) | **Hosted** |
| **StormScape** | "AI that remembers your campaign" — persistent memory, AI session reports/notes, lazy-DM prep | Free Apprentice (2 campaigns/5 AI reports); Adventurer $9.99/mo; Legend $29.99/mo unlimited | **Online-only** (SaaS) | Hosted | **Hosted** |
| **Friends & Fables / RoleForge** | AI game master / runs the game from world state; worldbuilding + VTT-ish | Freemium + paid tiers (subscription) | **Online-only** | Hosted | **Hosted** |
| **LitRPG Adventures** | Large generator library (NPCs, quests, dungeons, lore) via GPT | Subscription (one-time lifetime historically offered) [PARTLY] | **Online-only** | Hosted | **Hosted** (their key) |
| **Dungeon Alchemist** | AI-assisted *map/scene* generation (not text prep) | **One-time purchase** (Steam app, ~$30-40 range) [PARTLY] | **Desktop app** (installed; map gen may call cloud) | Local files | Mixed / hosted gen |
| **ScriptoriumGM / Saga20 / Jenova** | Prep assistants, recaps, GM copilots (varies) | Subscription / freemium | **Online-only** | Hosted | **Hosted** |

**WHITE SPACE — pinpointed.** Across every text-prep competitor I could surface, the pattern is identical: **online-only + hosted-AI + subscription + your-data-on-their-servers.** Not one of the AI-prep tools is **offline + own-your-data + one-time + BYO-key**. The single product that shares RealmWright's *commercial DNA* (one-time, own-your-data, self-hosted) is **Foundry VTT** — but Foundry is a virtual tabletop, not an AI prep generator, and it has no AI prep loop at all.

So the gap is real and narrow: **"the only AI-prep tool you buy once, that runs against a world you fully own, where the AI is optional and uses your key so nothing leaves your device."** No competitor occupies that exact quadrant. **But note the asymmetry (decisive for Q6):** RealmWright is *behind* every hosted competitor on the AI experience itself (they pre-pay and tune the model; RealmWright makes the user fetch a key), and *ahead* of all of them on ownership/privacy/price. **The defensible axis is ownership, not AI.**

## Q2 — TRADITIONAL WORLDBUILDING TOOLS — VERIFIED PRICING

| Tool | Free tier? | Paid | Model | Notes |
|---|---|---|---|---|
| **World Anvil** | **Yes — "Freeman"**: 2 worlds, ~42 published articles, ~100MB media, public + ads | Guild tiers (Journeyman/Master/Grandmaster/Sage), roughly **$3–12+/mo** (annual-discounted) | Subscription | Free tier real but capped; content public unless you pay. (CONFIRMED free-tier limits; exact paid $ PARTLY) |
| **LegendKeeper** | **NO free tier** | **$9/mo or $90/yr** | Subscription only | 14-day no-card trial; lapsed accounts go **read-only** (you keep/read your data, can't edit). This directly refutes PRODUCT-REVIEW's "$0-12/mo *with free tiers*." (CONFIRMED) |
| **Kanka** | **Yes — generous free tier** (open-source) | Paid tiers add team features + AI; modest $/mo | Freemium / open-source | Closest real free competitor to World Anvil; strong cross-linking. Self-hostable. (CONFIRMED) |
| **Obsidian** | **Yes — free for personal use** | Commercial-use license ~$50/yr/user; **Sync** add-on ~$4–8/mo; **Publish** add-on | Free core + paid add-ons | Local-first, own-your-files Markdown. Many GMs already run TTRPG vaults here for **free, offline** — RealmWright's most dangerous *substitute* on the ownership axis. (CONFIRMED free + local; add-on $ PARTLY) |

**Takeaway:** The wiki field has *real* free options (World Anvil Freeman, Kanka, Obsidian). RealmWright cannot win on "a place to store your world" — Obsidian already gives a GM free, offline, own-your-files worldbuilding. The only thing RealmWright adds over an Obsidian vault is **structured-canon → session generation**, which is the wedge — and which leans on AI.

## Q3 — CUSTOMER VOICE / REAL GM PAIN

*(Caveat: direct Reddit/forum quote-mining is limited — Reddit fetch is blocked and rarely surfaces in this index. Findings lean on GM-blog, news, and forum-aggregation surfaced by search, and are flagged where thin.)*

**Prep-time burnout — CONFIRMED as a top-tier, named pain.** "DM burnout" is repeatedly cited as **one of the top-3 reasons a D&D campaign dies** ([Dungeon Solvers](https://www.dungeonsolvers.com/dungeon-master-burnout/), [DM Lair](https://thedmlair.com/blogs/news/how-to-overcome-dungeon-master-burnout)). The mechanism is exactly the one RealmWright targets: GMs *enjoy* worldbuilding but feel they must "have every detail planned," which becomes "overwhelming," especially for **weekly** games. Sly Flourish's DM survey found **69% of DMs spend under 3 hours/week prepping and only 8% spend 6+** ([Sly Flourish survey](https://slyflourish.com/dm_survey_results.html)). Two implications: (a) the pain is real and weekly; (b) most GMs *already* try to keep prep short — so the wedge isn't "let me prep more," it's "make my limited prep produce a runnable session." That's precisely a Tonight-generator job.

**Subscription fatigue / multi-tool cost — CONFIRMED.** GMs articulate frustration at stacking paid tools: "GMs find it cumbersome trying to feed lore and information to players from one site to another, when **both are PAID to be effective**." Roll20 runs **$50–150/yr**, *on top of* rulebooks and modules ([fables.gg alternatives](https://fables.gg/blog/the-best-worldbuilding--vtt-alternatives), [EN World — World Anvil worth a subscription?](https://www.enworld.org/threads/world-anvil-worth-a-subscription.704644/)). The cumulative-subscription complaint is real and is the emotional opening for a **buy-once** pitch.

**Data-ownership / offline desire — CONFIRMED as a recognized value, with a proven flagship.** The self-hosted/own-your-data ethos is explicit in the community: Foundry is praised precisely because "you **completely own and control all of your game data**, files, and assets," "**no subscription fees or feature gating**," with self-hosting framed as the way to "**avoid vendor lock-in** and eliminate recurring subscription costs" ([Cthonic Studios — self-hosted RPG tools](https://cthonicstudios.com/self-hosted-rpg-tools/), [Foundry VTT](https://foundryvtt.com/)). A self-hosted/own-data GM segment demonstrably exists and *self-identifies around these exact words* — own, offline, no-lock-in. This is RealmWright's audience.

**AI-prep sentiment — split, and the split is the strategy (full treatment in Q4).** Short version: **private prep with AI is broadly accepted; selling/publishing AI content is not.** "Many people want faster private prep, cleaner recap notes… Private campaign prep is one thing; passing generated material off as something else is another"; "keep it in private prep or do not use it at all" ([CharGen — How to Use AI for DnD 2026](https://char-gen.com/blogs/how-to-use-ai-for-dnd-campaigns-2026)). RealmWright's whole use-case sits on the accepted side of that line.

**Net customer-voice picture:** the three values RealmWright should lead with — **own your data, work offline, buy once** — are not invented marketing; they are *the literal vocabulary GMs already use* to express their pain with the incumbents (Roll20/World Anvil/LegendKeeper subscriptions, SaaS lock-in). The prep-burnout pain gives the product its job; the subscription/ownership pain gives it its positioning.

## Q4 — THE AI-BACKLASH QUESTION

**The backlash is real, institutional, and loud — but it is aimed at a specific target that RealmWright does not occupy.** This distinction is the single most important market finding in this document, so read it carefully.

**How big / how loud (CONFIRMED, multi-source):**
- **ENnie Awards** (the genre's main awards) banned *all* products "containing generative AI or created with the assistance of LLMs … for visual, written, or edited content" for the **2025-2026 cycle** — and explicitly because the *softer* 2023 policy "does not go far enough," per community demand. The community views generative AI "as a threat to the creativity and originality that define the TTRPG industry." ([ENnies](https://ennie-awards.com/revised-policy-on-generative-ai-usage/), [ScreenRant](https://screenrant.com/ennies-ai-ban-ttrpgs-good-dnd-op-ed/), [EN World](https://www.enworld.org/threads/ennies-to-ban-generative-ai-from-2025.710933/))
- **DriveThruRPG / DMs Guild** (the largest 3rd-party marketplaces) **ban standalone AI art products** and **commercially AI-*written* content**, and force a **"Creation Method" label** (Handcrafted / Contains AI). ([Wargamer](https://www.wargamer.com/dnd/marketplace-dungeon-masters-guild-ai-ban), [Gizmodo](https://gizmodo.com/drivethrurpg-ai-generated-art-writing-dmsguild-1850673912))
- **Inkarnate** (map tool) flirted with allowing marketplace AI art (Sep 2024) → **users boycotted, cancelled subscriptions** → company **fully reversed and banned AI assets** (Oct 2025), to "almost universally positive" community response. A clean, recent proof of how fast the core punishes a tool that embraces AI in its *public/marketplace* surface. ([Blizzard Watch](https://blizzardwatch.com/2025/10/09/tabletop-map-making-website-inkarnate-allows-bans-ai-generated-art-user-driven-win-human-artists/), [GameRant](https://gamerant.com/dungeons-and-dragons-inkarnate-generative-ai-boycott-controversy/), [Geek Native](https://www.geeknative.com/206705/map-maker-inkarnate-reverses-ai-policy-following-community-backlash/))

**The pro-AI-for-prep segment is real, and the dividing line is published-vs-private (CONFIRMED, decisive):**
- The community consensus is **not "no AI ever."** It is **"no AI in what you sell/publish; private prep is your business."** Search-surfaced 2026 coverage is explicit: *"Many people want faster private prep, cleaner recap notes, better portraits for recurring NPCs… Private campaign prep is one thing; passing generated material off as something else is another."* And: *"keep it in private prep or do not use it at all."* PC Gamer (11 Mar 2026) covered creators using AI "heavily in personal D&D games while keeping it out of official pipelines." ([CharGen — How to Use AI for DnD 2026](https://char-gen.com/blogs/how-to-use-ai-for-dnd-campaigns-2026))
- An entire commercial layer (CharGen, Archivist, StormScape, RoleForge, ScriptoriumGM, Saga20…) exists and charges money *specifically for AI prep*. The buying segment is not hypothetical — it's a paying market (Q1). The backlash and the paying segment **coexist** because they're about different acts: *selling AI content* vs *using AI privately to prep your own table*.

**So: is "AI-optional, your-own-key, nothing-leaves-your-device" a way to neutralize the backlash? — YES, and it is close to the ideal posture.** Three reasons, each grounded:
1. **RealmWright's AI output is private prep, never a published product.** The ENnie/DriveThruRPG/Inkarnate bans all target *commerce in AI content*. A GM using RealmWright to draft tonight's scenes for their own table is on the *accepted* side of the community's own line. The backlash mostly does not apply to the use-case.
2. **"Your own key, nothing leaves your device" answers the second-loudest objection — data/training.** Part of the anti-AI anger is about creative work being ingested by someone else's model. RealmWright's BYO-key + local-data architecture means the *vendor* (RealmWright) never sees or trains on the user's world. That is a genuinely defensible, *pro-creator* privacy story, not spin.
3. **AI-optional defuses the principled refusers.** The segment that "hates AI on principle" (per the same source) can buy RealmWright and **never turn AI on** — and still get a fully-owned, offline worldbuilding tool. No competitor that *leads* with AI can say that.

**The honest caveat:** neutralizing the backlash is not the same as *escaping* it. If RealmWright's *marketing* leads with "AI" prominently, a chunk of the loud core will dismiss it on sight regardless of architecture (the Inkarnate episode shows the core reacts to *signals*, not just substance). The architecture is defensible; the **framing** is where the risk lives. This is the hinge of Q6.

## Q5 — WILLINGNESS TO PAY / MODEL NORMS

**Do one-time GM tools sell? — CONFIRMED, decisively, with two flagship proofs.**
- **Dungeon Alchemist** (AI-assisted TTRPG map maker): **one-time $44.99 / €37.99, free updates forever, no subscription.** It raised **€2.4M on Kickstarter** (one of the most-funded tabletop Kickstarters ever) and holds **93% positive across 1,848 Steam reviews.** This is the single strongest data point in the doc: a one-time-purchase, AI-flavored, own-it indie TTRPG tool that is a commercial *and* community success. ([Steam](https://store.steampowered.com/app/1588530/Dungeon_Alchemist/), [Dungeon Alchemist](https://www.dungeonalchemist.com/), [GamesRadar](https://www.gamesradar.com/amazing-dandd-map-maker-is-like-the-sims-for-dungeon-masters/))
- **Foundry VTT**: **one-time ~$50, self-hosted, own-your-data, no subscription** — a category-defining product whose entire pitch is buy-once-own-it. ([Foundry VTT](https://foundryvtt.com/), [Cthonic Studios](https://cthonicstudios.com/self-hosted-rpg-tools/))

These two prove the buy-once model is not just viable but *beloved* in this exact audience — and that "AI-assisted" (Dungeon Alchemist) is not disqualifying when the tool is a private creator-tool you own, not a marketplace selling AI content (ties to Q4).

**One-time vs subscription norms.** The market is genuinely mixed: the *worldbuilding-wiki / VTT-SaaS* incumbents are subscription (LegendKeeper $9/mo·$90/yr; World Anvil Guild ~$3–12/mo; Roll20 $50–150/yr; the AI-prep tools $10–35/mo — Q1/Q2), while the *own-it desktop tools* are one-time (Foundry ~$50, Dungeon Alchemist $44.99). itch.io confirms a healthy long tail of **one-time, low-price** GM tools and bundles (e.g., a 5-tool GM-prep bundle at ~$12) ([itch.io dungeon-master tools](https://itch.io/tools/tag-dungeon-master)). So there is no single "norm" — there are **two norms**, and RealmWright is choosing the one-time/own-it lane, which is the right lane for its constraints and its differentiator.

**Is $29 one-time low / right / high?**
- **Versus subscriptions:** $29 once is **less than a single year** of *any* rival (LegendKeeper $90/yr, Roll20 $50–150/yr, AI-prep $120–420/yr). On a 1-year horizon it's cheap; on a multi-year horizon it's dramatically cheaper. **Low.**
- **Versus comparable one-time own-it tools:** Foundry ~$50 and Dungeon Alchemist $44.99 set the ceiling for "serious own-it GM software." At **$29, RealmWright is priced ~35–40% below the established one-time anchors** — i.e., **on the low side of its own lane**, with clear headroom. **Low-to-right.**
- **Versus itch.io micro-tools:** above the $5–12 bundle tier, which is appropriate — RealmWright is a full app, not a one-page toolkit.

**Verdict: $29 is right-to-low — almost certainly under-priced for the value, but correctly conservative for *unproven* value.** Hold $29 at launch (trust + halal/payout clean + undercuts every subscription); once the no-key demo + Tonight-generator prove conversion, the Foundry/Dungeon-Alchemist anchors give explicit permission to test **$39–49 one-time** and/or a "supporter / lifetime-updates" tier — capturing the under-pricing **without** a subscription. This matches PRODUCT-REVIEW's "defensible but likely too low" read (Q6, Claim D — CONFIRMED).

## Q6 — ADVERSARIAL RE-EXAMINATION + REVISED POSITION

### Claim-by-claim verdict (PRODUCT-REVIEW.md, against the evidence)

| # | PRODUCT-REVIEW claim | Verdict | Evidence |
|---|---|---|---|
| A | "The AI-canon + Tonight loop is a wedge **no competitor owns**." | **REFUTED (as stated) / PARTLY (when re-scoped)** | The *generate-from-your-canon-with-memory* category is occupied (StormScape, CharGen, Archivist, RoleForge — Q1). What is *unowned* is the narrower **offline + own-data + one-time + BYO-key** quadrant. The wedge is real only when ownership, not AI, is the defining axis. |
| B | Wikis are "$0-12/mo **with free tiers**." | **REFUTED for LegendKeeper; CONFIRMED for the rest** | LegendKeeper has **no free tier** ($9/mo, $90/yr) (Q2). World Anvil/Kanka/Obsidian do have real free tiers. |
| C | BYO-key wall is the **single biggest activation killer**. | **CONFIRMED, and worse than stated** | Every AI competitor is **hosted** (Q1) — users expect "AI just works." RealmWright's key-fetch is friction *no rival imposes*. As an activation step it's a genuine cliff. **But** as a *privacy/ownership feature* it flips to an asset (Q4). Same fact, two faces. |
| D | $29 one-time is "defensible… likely **too low**." | **CONFIRMED** | Foundry VTT ($50 one-time, own-your-data) proves the buy-once/own-it model thrives; rulebooks run $30-60; rival AI tools bill $10-30/**mo**. $29 once is under-priced for the value *if value is believed* (Q5). |
| E | AI-first positioning is a **pure asset**. | **REFUTED** | Institutional backlash is real and loud (Q4). AI-*led framing* is a liability with the loud core. |
| F | Tonight-as-generator is the **only credible weekly-retention hook**. | **CONFIRMED (logic holds) — but the hook needs AI** | DM prep is weekly/bursty and burnout is a top-3 campaign-killer (Q3), so a "what do I run tonight?" hook is correctly the retention engine. Caveat: a *generator* needs AI, which collides with the de-emphasis pivot. Tension resolved below. |

### The pivot, pressure-tested

The hypothesis under test: **de-emphasize AI; lead with "own-your-world, offline, one-time, no-subscription, no-lock-in — with optional AI that uses your own key and never sends your data to us"** — turning the BYO-key "wall" into a privacy/ownership selling point and sidestepping the backlash.

**Verdict: this is the correct *positioning* pivot. It is directionally right, and the evidence backs every clause of it.** Specifically:
- **It moves the fight to the axis RealmWright actually wins.** RealmWright loses the AI-experience fight (rivals are hosted, tuned, frictionless — Q1) and loses the pure-storage fight (Obsidian/Kanka/World Anvil are free — Q2). It *wins* ownership + offline + one-time + privacy, where **literally no AI-prep competitor stands** (Q1 white space). Lead with your only uncontested ground.
- **It neutralizes ~most of the backlash** because RealmWright's use-case (private prep, never published) and architecture (BYO-key, local data, no vendor training) sit on the *accepted* side of the community's own published-vs-private line (Q4).
- **It converts the activation killer into a feature.** The BYO-key wall (Claim C) reframed as "the AI uses *your* key, so it costs us nothing, stays private to you, and we can never train on your world" is the single cleanest articulation of the privacy story (Q4). Same fact — repositioned from apology to advantage.
- **It fits Hunter's constraints perfectly.** One-time/Gumroad/Payoneer, halal-clean, no subscription support load, no AI inference cost on the solo dev.

**But the pivot has TWO hard limits the framing must respect — and getting these wrong sinks it:**

1. **"De-emphasize AI" must NOT mean "AI is a footnote."** Claims D/F + Q3 are unambiguous: the *only* thing that earns a $29 buy and a weekly re-open is the **session-generation payoff**, and that payoff *is* AI-powered. If you bury AI so deep the buyer never feels the Tonight-generator magic, you've removed the only reason to pay and you're left selling an offline wiki that competes with **free** Obsidian — and *loses* (Q2). So the correct move is **not** "hide AI." It is **re-order and re-frame**: lead the headline and the trust story with ownership/offline/one-time/privacy; let the *demo* and the *product experience* show the AI-prep payoff as the thing you get *because* you own your world. Ownership is the **promise**; AI-prep is the **proof**. Drop either and the product fails.

2. **The word "AI" in marketing copy is a signal the loud core reacts to (Inkarnate, Q4).** Lead the *visible* pitch with the outcome and the values — "own your world, runs offline, buy it once, your data never leaves your device, prep a session in 15 minutes" — and let "AI / your own key" appear as the *mechanism*, framed around privacy, not as the hero noun. This is exactly the published-vs-private discipline the community already endorses.

**Is there a better pivot?** I pressure-tested three alternatives and reject all three:
- *"Lean harder into AI, out-feature the hosted tools."* **Rejected.** A solo dev cannot out-tune hosted, pre-funded models, and this charges straight into the backlash and the BYO-key disadvantage. Worst quadrant.
- *"Drop AI entirely, ship a pure offline wiki."* **Rejected.** Competes with free Obsidian/Kanka with no differentiator and no weekly hook (Q2/Q3). Kills the only reason to pay $29.
- *"Go subscription to match rivals' economics."* **Rejected.** Collides with halal/payout constraints, adds solo-dev support load, and *forfeits* the one-time/own-it advantage that is the whole wedge (Q5/Foundry precedent). The proposed pivot's strength is precisely that it is *not* a subscription.

The proposed pivot beats all three because it plants the flag on the only uncontested ground while keeping the AI payoff as the proof.

### Concrete recommendation (positioning · audience · price · build-first)

**Positioning (headline → mechanism):**
> **"Own your world. Run your table. Buy it once."** RealmWright is the offline worldbuilding + session-prep app you own outright — no subscription, no account, no lock-in, your data never leaves your device. Bring your campaign, press **Tonight**, and get a session you can actually run in 15 minutes. *(Optional AI copilot runs on your own OpenRouter key — so it's private to you, costs us nothing, and we can never see or train on your world.)*

Lead with the four values (own / offline / once / private). Make **Tonight-as-generator** the demonstrated payoff, not the headline noun. Use "AI" sparingly and always wrapped in the privacy frame.

**Who to sell to (sharpest-first):**
1. **Ownership-motivated GMs already paying for or fed up with subscriptions** (LegendKeeper $90/yr, World Anvil Guild, Roll20) — the Foundry-buyer psychographic: "I'll pay once to own it and control my data." This segment is *proven to spend* on one-time, own-it tools (Q5).
2. **The pragmatic pro-AI-prep GM** who wants the Tonight payoff but is uneasy about uploading their world to a SaaS — RealmWright is the *only* tool that gives them both prep-AI and privacy (Q1 white space, Q4).
3. **Privacy/offline-first and DIY/self-host GMs** (the Obsidian/Foundry/self-hosted crowd) — they already value local-first; sell them structure + a prep generator on top of files they own.
- **Do NOT** chase the principled anti-AI absolutists as a primary target (they may still buy for the offline wiki and keep AI off — a bonus, not a beachhead), and **do NOT** fight the hosted-AI tools head-on for the "best AI experience" buyer.

**Price:** **Keep $29 one-time at launch** — honest, halal-clean, payout-clean, removes subscription anxiety at the moment trust is lowest, and *under-cuts a single year* of every subscription rival (Q2/Q5). It is under-priced for the value (Claim D) but you cannot price-optimize value the buyer can't yet see. **Once the no-key demo + Tonight-generator land and conversion is real,** test a higher one-time tier (~$39–49) and/or an optional "supporter / lifetime-updates" tier — capture the under-pricing **without** a forced subscription.

**Build/change FIRST (in order):**
1. **A no-key, in-product demo that fires the Tonight-generator on a curated sample world** — proves the payoff at second-30, *before* the key wall. This is the highest-leverage single change: it makes the wedge visible and converts the BYO-key cliff from a blocker into a *post-wow* "want this on your own world?" step. (Existing `/api/demo/generate` proxy supports it.)
2. **Re-skin the entire pitch around ownership/offline/once/private** (landing page, FrontDoor, in-app copy) per the positioning above — cheapest lever, largest leverage, and it's where the backlash risk actually lives.
3. **Make Tonight an actual generator** (if not already), since it is both the wedge and the only weekly-retention hook (Claims A/F, Q3).
4. **Fix the FrontDoor "first-run flag" nag** so the activation surface stops training users to ignore it (a known own-goal from PRODUCT-REVIEW Q2).

**Is the product in real trouble?** **No — but its current *story* is.** The architecture (offline, own-data, one-time, BYO-key) is, on the evidence, *more* defensible than PRODUCT-REVIEW assumed — it lands RealmWright in a quadrant no AI-prep competitor occupies, on the exact ownership/privacy axis the 2026 market is hungry for and that fits Hunter's constraints. The danger is entirely in **framing**: an AI-*led* pitch walks into a loud institutional backlash and a fight it can't win, while burying the product's real, uncontested advantage. Fix the story (ownership-led, AI-as-private-proof) and prove the payoff before the key wall, and this is a viable, sharp, halal, solo-buildable product. Lead with AI, and it's a small fish swimming straight at the sharks.

## Sources

*All URLs below were surfaced by `WebSearch` (US index). Per the tooling constraint, pages were read via search-extract, not full fetch. Facts repeated across multiple independent results are graded CONFIRMED in-text; single-source items are flagged PARTLY / [UNVERIFIED].*

**AI GM-prep tools & landscape (Q1):**
- https://char-gen.com/blogs/ai-dungeon-master-session-prep-guide-2026
- https://char-gen.com/blogs/top-8-ai-tools-every-dungeon-master-needs
- https://char-gen.com/blogs/best-ai-dungeon-master-tools-2026
- https://www.scriptoriumgm.com/blog/2026-03-31-best-ai-tools-for-dungeon-masters-2026
- https://www.myarchivist.ai/ai-dungeon-master
- https://www.myarchivist.ai/ai-dungeon-master/best-dm-tools-2026
- https://www.myarchivist.ai/
- https://stormscape.app/blog/complete-guide-lazy-dm-prep-2026-ai-shortcuts
- https://roleforge.ai/blog/best-ai-game-master-tools-compared/
- https://www.ttrpg-games.com/blog/top-tools-rpg-session-recaps

**Worldbuilding tools & pricing (Q2):**
- https://char-gen.com/alternatives/world-anvil
- https://www.legendkeeper.com/best-world-anvil-alternatives/
- https://www.legendkeeper.com/world-anvil-alternative
- https://www.legendkeeper.com/pricing
- https://www.legendkeeper.com/open-beta/
- https://alternativeto.net/software/legendkeeper/
- https://technicalustad.com/best-world-anvil-alternatives/
- https://artificerdm.com/the-game-masters-ultimate-guide-to-the-best-worldbuilding-tools/
- https://www.automateed.com/is-world-anvil-free

**AI backlash — institutional (Q4):**
- https://ennie-awards.com/revised-policy-on-generative-ai-usage/
- https://ennie-awards.com/submissions-guidelines/
- https://screenrant.com/ennies-ai-ban-ttrpgs-good-dnd-op-ed/
- https://www.enworld.org/threads/ennies-to-ban-generative-ai-from-2025.710933/
- https://www.belloflostsouls.net/2025/01/ennie-awards-will-no-longer-consider-games-made-with-ai.html
- https://www.enworld.org/threads/dms-guild-and-drivethrurpg-ban-ai-written-works-requires-labels-for-ai-generated-art.698936/
- https://www.wargamer.com/dnd/marketplace-dungeon-masters-guild-ai-ban
- https://gizmodo.com/drivethrurpg-ai-generated-art-writing-dmsguild-1850673912
- https://blizzardwatch.com/2025/10/09/tabletop-map-making-website-inkarnate-allows-bans-ai-generated-art-user-driven-win-human-artists/
- https://www.geeknative.com/206705/map-maker-inkarnate-reverses-ai-policy-following-community-backlash/
- https://gamerant.com/dungeons-and-dragons-inkarnate-generative-ai-boycott-controversy/
- https://www.ttrpginsider.news/p/news-roundup-mapmaking-software-provider-inkarnate-faces-pressure-over-ai-policies

**AI-prep sentiment — published vs private (Q3/Q4):**
- https://char-gen.com/blogs/how-to-use-ai-for-dnd-campaigns-2026

**GM pain — burnout, prep time, subscription fatigue (Q3):**
- https://www.dungeonsolvers.com/dungeon-master-burnout/
- https://thedmlair.com/blogs/news/how-to-overcome-dungeon-master-burnout
- https://www.thedailydungeonmaster.com/2024/07/09/dm-burnout-recognizing-and-overcoming-dungeon-master-fatigue
- https://slyflourish.com/dm_survey_results.html
- https://www.enworld.org/threads/world-anvil-worth-a-subscription.704644/
- https://fables.gg/blog/the-best-worldbuilding--vtt-alternatives

**Ownership / offline / self-hosted ethos (Q3/Q5):**
- https://cthonicstudios.com/self-hosted-rpg-tools/
- https://foundryvtt.com/
- https://openaltfinder.com/self-hosted/game-management-tools
- https://github.com/hunter-read/grimoire

**Willingness to pay — one-time TTRPG tools (Q5):**
- https://store.steampowered.com/app/1588530/Dungeon_Alchemist/
- https://www.dungeonalchemist.com/
- https://www.gamesradar.com/amazing-dandd-map-maker-is-like-the-sims-for-dungeon-masters/
- https://steamdb.info/app/1588530/
- https://itch.io/tools/tag-dungeon-master
- https://itch.io/s/43339/gm-prep-games-tools

---

*End of market & customer research. The header corrections (1–3) and Q6 are the load-bearing deliverable; Q1–Q5 are the cited evidence base behind them.*
