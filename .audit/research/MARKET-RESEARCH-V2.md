# RealmWright V7 — Market & Customer Research V2 (Web-Sourced, A+ target)

*Supersedes `.audit/improve/MARKET-RESEARCH.md` (B+). The B+ research's conclusions were sound; this goes wider (new 2026 entrants the B+ missed) and deeper (named competitor for the living-world thesis; a real one-time→subscription case study; the free-substitute saturation). Method: `WebSearch` fan-out, multiple + adversarial phrasings per question. Every load-bearing claim carries a confidence grade and ≥1 real URL; load-bearing claims carry ≥2 independent sources or are flagged single-source. Access date for all citations: **2026-06-10**. Lineage is clean: nothing here is drawn from the quarantined `EXTERNAL-DOSSIER.md`.*

---

## ⚠️ TOOLING CONSTRAINT — READ FIRST (affects confidence, not honesty)

`WebFetch` is **fully blocked** in this environment — confirmed once early against `legendkeeper.com/pricing` (HTTP 403), consistent with the B+ run's finding across 8+ domains. `WebSearch` **works** and returns substantive, quotable extracts with source URLs. So every claim below is grounded in a real search-surfaced source, but full primary pages were generally read via search-extract, not opened verbatim. Consequence, applied honestly:

- Facts that repeated across **multiple independent search results** → **CONFIRMED**.
- Single-source figures → **PARTLY** and flagged.
- Reddit/forum quote-mining is thin (Reddit rarely surfaces in this US index); customer-voice leans on GM-blog, news, vendor, and forum-aggregation extracts, flagged where thin.
- One target (**RippleForge**) is lightly indexed and suffers a name-collision with a crypto product ("Ripple Forge"); its core mechanic is CONFIRMED from its own site copy, but its **offline capability and AI-key model are UNVERIFIED** — stated as such, not guessed.

No figure or quote below was fabricated. Where I could not verify, it says UNVERIFIED.

---

## 1. WHAT CHANGED vs V1 (named corrections & upgrades)

1. **NEW 2026 entrants the B+ never named — the field is more crowded than V1 said.** V1's competitor table missed: **LoreKeeper** (full AI DM running a real 5e engine server-side; free 20 turns/day, paid from €7.99/mo), **Old Greg's Tavern** (225k+ users by mid-2026, native iOS/Android; *moved from one-time $5 to subscription tiers* — a load-bearing T3 case study, §Q7), **Campaign Arks** (AI session-prep, system-agnostic, the closest competitor on *positioning language* — "world feels alive… session after session"), **RippleForge** ("Living World Simulation for TTRPGs" — the **first named competitor that directly contests the T2 living-world thesis**, §Q3), plus MacerAI, Jenova, StoryRoll, Tabletop Arc. The "category is occupied" finding from V1 is **upgraded from PARTLY to CONFIRMED, and broadened.** ([RoleForge](https://roleforge.ai/blog/best-ai-game-master-tools-compared/), [LoreKeeper](https://lore-keeper.com/blog/best-ai-dungeon-master-2026), [Tabletop Arc](https://tabletoparc.com/resources/best-ai-dungeon-master-tools), [Campaign Arks](https://www.campaignarks.com/), [RippleForge](https://rippleforge.gg/))

2. **The "empty quadrant" (T1) is NOT as empty as V1 implied — RippleForge is in the neighborhood.** V1 said *no* tool shares RealmWright's offline+own-data+living-world DNA. RippleForge is a living-world engine that **exports plain JSON, advertises "no lock-in," and offers a no-login demo** — i.e., it contests the *own-your-data* axis V1 called uncontested in the AI-prep space. T1 is therefore **MODIFIED, not confirmed** (§Thesis verdicts). This is the single most important correction.

3. **The free-substitute problem is worse/broader than V1 said.** V1 named Obsidian/Kanka/World Anvil-free. Add: **Fantasia Archive** (free, offline, open-source GPL3, "your world is your own"), **Chronicler** (free, offline, no sign-up, supports custom HTML/CSS), **ChronoGrapher**, and Obsidian's *mature TTRPG plugin ecosystem* (Fantasy Statblocks, Initiative Tracker, Leaflet maps, RPG Manager). "Offline own-data worldbuilding storage" is **saturated and free.** This hardens V1's verdict: RealmWright cannot win on storage; the simulation+generation layer is the *only* defensible ground. ([Fantasia Archive](https://fantasiaarchive.com/), [Chronicler](https://chronicler.pro/best-worldbuilding-tools), [Obsidian TTRPG plugins](https://obsidianttrpgtutorials.com/Obsidian+TTRPG+Tutorials/Plugin+Tutorials/The+Plugin+List))

4. **A real one-time→subscription pivot now backs the T3 discussion with evidence** (V1 argued T3 from Foundry/Dungeon Alchemist anchors only). **Old Greg's Tavern abandoned its flat $5 one-time for $15–25/mo subs in Aug 2025**, citing "your most requested feature" — while players called the new model "pay to play" and complained of a "super high paywall." This cuts both ways and is analyzed in Q7. ([Old Greg's pricing](https://www.oldgregstavern.com/pricing), [why-updating-pricing](https://oldgregstavern.beehiiv.com/p/why-old-gregs-tavern-is-updating-pricing), [fables.gg comparison](https://fables.gg/blog/old-gregs-tavern-vs-friends--fables-plan--feature-comparison))

5. **AI-sentiment: V1's "published-vs-private line holds" is CONFIRMED and freshened to April 2026, and a feared reversal is debunked.** The "ENnies U-turn" headlines refer to the U-turn *toward* a total ban (from the lenient 2023 policy), **not** a softening — the ban stands for 2025-2026. A new April 2026 retrospective ("AI in TTRPGs — Two Years On") finds the community "settled toward a pragmatic middle ground: AI for prep support is widely accepted." V1's central sentiment finding is intact and stronger. ([ENnies revised policy](https://ennie-awards.com/revised-policy-on-generative-ai-usage/), [GamesRadar U-turn](https://www.gamesradar.com/tabletop-gaming/ennies-tabletop-rpg-award-makes-a-u-turn-on-ai-submission-policy/), [Red Circle Games, 26 Apr 2026](https://redcirclegames.co.uk/2026/04/26/ai-developments-revisited.html))

6. **Pricing on incumbents re-verified and tightened.** LegendKeeper $9/mo·$90/yr, **no creation free tier**, 14-day trial, read-only on lapse → **CONFIRMED** (V1's correction holds exactly). World Anvil: Journeyman now **deprecated**; active tiers Guild ~$5/mo, **Master $12/mo ($105/yr)**, Grandmaster, Sage; **lifetime tiers exist** → upgraded from PARTLY. Kanka: **free forever, unlimited campaigns/entries**, paid from $4.99/mo, **self-hostable (open source)** → upgraded from PARTLY. ([LegendKeeper pricing](https://www.legendkeeper.com/pricing), [World Anvil pricing](https://www.worldanvil.com/pricing), [WA lifetime](https://blog.worldanvil.com/announcements/world-anvil-lifetime-sage-membership-lt-grandmaster-now-available/), [Kanka pricing](https://kanka.io/pricing))

---

## Q1 — AI GM-PREP COMPETITIVE LANDSCAPE (mid-2026)

The "generate prep / run sessions from your own world, with memory" category is **occupied and crowded** in 2026 — **CONFIRMED across many independent comparison pieces** (RoleForge, LoreKeeper, Archivist, ScriptoriumGM, CharGen, Tabletop Arc, StoryRoll all publish 2026 "best AI DM tools" rankings). The market is described as having gone "from a handful to an overwhelming list." ([RoleForge](https://roleforge.ai/blog/best-ai-game-master-tools-compared/), [Archivist best-tools-2026](https://www.myarchivist.ai/ai-dungeon-master/best-dm-tools-2026), [ScriptoriumGM](https://www.scriptoriumgm.com/blog/2026-03-31-best-ai-tools-for-dungeon-masters-2026), [CharGen](https://char-gen.com/blogs/best-ai-ttrpg-tools-2026))

| Tool | What it does | Price / model | Online vs offline | Data ownership | AI: BYO-key vs hosted | Grade |
|---|---|---|---|---|---|---|
| **LoreKeeper** | Full AI DM; real 5e engine server-side (dice, initiative, spells) | Free 20 turns/day; paid from **€7.99/mo** | **Online-only (SaaS)** | Hosted | **Hosted** | CONFIRMED price/model |
| **Old Greg's Tavern** | AI D&D, solo/with friends; native mobile apps; 225k+ users | **Was $5 one-time → now** Adventurer $5 one-time (50 rounds), Hero $15/mo, Legend $25/mo | **Online-only**, iOS/Android | Hosted (memory issues reported) | **Hosted** | CONFIRMED |
| **StormScape** | "AI that remembers your campaign"; Discord session reports, lazy-DM prep | Free (2 campaigns/5 reports); Adventurer $9.99/mo; Legend $29.99/mo | **Online-only**, Discord-centric | Hosted | **Hosted** | CONFIRMED |
| **Archivist AI** | Ingests *your* sessions → recaps, wiki, timeline, campaign chatbot | Free 30-day trial; paid tiers; add-ons (Campaign Pass $6/30d, Extra Session $2) | **Online-only (SaaS)** | Hosted; "data stored even after cancellation" | **Hosted** | CONFIRMED model; exact tier $ PARTLY |
| **Campaign Arks** | AI session prep; 13 RPG doc types; "world feels alive session after session"; reusable story blocks | Free 1 campaign; mid tier (multi-campaign + AI); premium (deep AI, art) | **Online-only (SaaS)** | Hosted | **Hosted** | CONFIRMED model; exact $ PARTLY |
| **RippleForge** | **"Living World Simulation"**: paste notes → AI extracts events → "ripple" across an NPC/faction relationship graph; "what happens next?" projections | No-login demo; **"no subscription required to get your work back," JSON export, no lock-in** | **UNVERIFIED** (browser app; offline-capability not confirmed) | **Own-your-data leaning** (JSON export, no lock-in) — closest to RealmWright | **UNVERIFIED** (hosted vs BYO not stated) | mechanic CONFIRMED; model UNVERIFIED |
| **Friends & Fables / RoleForge** | AI GM; world maps, battle maps, tokens; visual game-like UI | Freemium + paid subs | **Online-only** | Hosted | **Hosted** | CONFIRMED |
| **LitRPG Adventures** | Large generator library (NPCs/quests/dungeons/lore) | **~$5/mo** | **Online-only** | Hosted | **Hosted** | PARTLY |
| **Dungeon Alchemist** | AI-assisted *map/scene* gen (not text prep) | **One-time $44.99**, free updates, no sub | **Desktop app** (installed) | Local files | Mixed/local gen | CONFIRMED |
| **Local/DIY (KoboldAI, Ollama scripts, Discord bots, WebLLM)** | Self-run AI DMs | Free (your hardware) | **Offline-capable** | Local | **BYO/local** | CONFIRMED — but **dev-only, not consumer products** |

**WHITE-SPACE verdict (T1).** The pattern across every *polished commercial text-prep* competitor is identical: **online-only + hosted-AI + subscription + your-data-on-their-servers.** The only tools that are offline + own-data + BYO/local-AI are **GitHub developer projects** (KoboldAI, Ollama wrappers, Discord bots) — *not* products a non-technical GM buys and runs. So RealmWright's quadrant — *a finished, buy-once, offline, own-your-data app with optional BYO-key/local AI* — is essentially unoccupied **by a shippable consumer product.** **The one exception that prevents a clean "empty quadrant" claim is RippleForge**, which contests own-your-data + living-world (JSON export, no lock-in) — though its offline/BYO status is unverified and its mechanic differs (reactive ripple vs RealmWright's autonomous stat-threshold engine). **Decisive asymmetry (unchanged from V1):** RealmWright is *behind* every hosted rival on the AI experience (they pre-pay/tune the model; RealmWright makes the user fetch a key) and *ahead* on ownership/privacy/price. **The defensible axis is ownership, not AI quality.**

**→ Implication for RealmWright:** The quadrant is real but *narrower than V1 sold it* — name RippleForge as the one neighbor and beat it on (a) the deterministic no-AI simulation that runs with AI off, and (b) a *finished, single-file, install-nothing* product vs DIY developer kits. Do **not** market "no competitor does this"; market "the only **finished, buy-once, fully-offline** one." Lead the pitch on ownership/offline/once, never on out-AI-ing hosted rivals you cannot beat.

---

## Q2 — WORLDBUILDING / WIKI TOOLS — VERIFIED PRICING 2026

| Tool | Free tier? | Paid | Model | Grade |
|---|---|---|---|---|
| **World Anvil** | **Yes — Freeman** (capped: ~2 worlds, public/ads) | Guild ~$5/mo; **Master $12/mo ($105/yr)**; Grandmaster; Sage (pro). **Journeyman deprecated.** **Lifetime tiers exist.** | Subscription (+ lifetime) | CONFIRMED tiers; exact Grandmaster $ PARTLY |
| **LegendKeeper** | **NO creation free tier** | **$9/mo or $90/yr**; 14-day no-card trial; **read-only on lapse** | Subscription only | **CONFIRMED** |
| **Kanka** | **Yes — free forever, unlimited campaigns/entries, all core features** | Paid from **$4.99/mo** (custom CSS, larger uploads, recovery) | Freemium / **open-source, self-hostable** | **CONFIRMED** |
| **Obsidian** | **Yes — free personal use, local-first Markdown** | Commercial license ~$50/yr; Sync/Publish add-ons | Free core + add-ons | CONFIRMED free+local; add-on $ PARTLY |
| **Fantasia Archive** | **Yes — 100% free, offline, open-source GPL3** ("your world is your own") | — | Free / open-source | **CONFIRMED** |
| **Chronicler** | **Yes — free, offline, no sign-up, no subscription; custom HTML/CSS** | — | Free | CONFIRMED (single strong source — flag PARTLY) |
| **ChronoGrapher** | Free-tier freeform wiki + maps + history tracking, for writers/GMs | — | Free/freemium | PARTLY |

**Takeaway (hardened from V1):** the *storage* lane is not just "has free options" — it is **saturated with free, offline, own-your-files tools** (Obsidian + a deep TTRPG plugin ecosystem, Fantasia Archive, Chronicler). A GM who only wants "a place to keep my world" already has several free, offline, own-data choices. The *only* thing RealmWright adds over a free Obsidian vault is **structured-canon → autonomous simulation → session generation.**

**→ Implication for RealmWright:** Never position against wikis on storage — you lose to *free*. The simulation engine + the Tonight generator are the entire reason to pay. The no-AI $49 value floor (POSITION §7) must rest on the **simulation + heuristics**, because "offline structured storage" alone is worth ~$0 against this free field.

---

## Q3 — LIVING-WORLD SIMULATION: DEMAND + WHO SERVES IT (the T2 question)

**Demand — CONFIRMED, multi-source and explicit.** GMs actively want worlds that move between sessions and react to play. Evidence: a March 2026 guide, "How to Make Your D&D World Feel Alive Between Sessions" (factions/NPCs that act in the background, weather/economics/rumors unrelated to the quest); a long-running RPG Pub "Living World / World in Motion" thread; and the *beloved* manual precedent — **Stars Without Number faction turns**, "something the GM resolves *between sessions*… a whole detailed mini-game," praised because "random events can surprise the GM" and make the world "feel alive and in-conflict, as opposed to plots that revolve solely around the PCs." Fan-made SWN faction spreadsheets and a GitHub SWN GM-turn tool exist — proof GMs *manually build tooling* for exactly this. ([Ruckerworks, Mar 2026](https://ruckerworks.com/2026/03/dnd-living-world-background-events/), [RPG Pub thread](https://www.rpgpub.com/threads/living-world-world-in-motion.6113/), [SWN factions](https://takeonrules.com/2018/12/27/lets-read-stars-without-number-factions/), [SWN faction spreadsheet](https://d0ngiovanni.github.io/swn-faction-spreadsheet/), [SWN GM tool (GitHub)](https://github.com/sensualcoder/swn-gm-tool))

**Is it UNSERVED? — NO, partly served, and one direct competitor exists.** This is the key T2 stress-test and it forces a downgrade:
- **RippleForge** is explicitly marketed as "**Living World Simulation for TTRPGs**" — tagline "*The world reacts, even when your players don't.*" Mechanic: paste session notes → AI extracts discrete world events → "ripples fire across your whole world in one step" via an NPC/faction **relationship graph**; ask "what happens next?" for grounded projections. **This is a living-world product, shipping in 2026.** ([RippleForge](https://rippleforge.gg/), [RippleForge demo](https://rippleforge.gg/demo/))
- **Campaign Arks** uses near-identical *positioning language* — "tracks plot threads, promises, and motivations so your world feels alive — session after session" — but on inspection it is **status-tracking** (NPCs with status, story arcs with phase management, secrets with reveal states), i.e., *organized storage with flags*, not autonomous simulation. ([Campaign Arks](https://www.campaignarks.com/))

**The defensible distinction (this is what keeps T2 alive in MODIFIED form).** RealmWright's engine is **autonomous and deterministic**: 10 stats with thresholds that **auto-fire authored historical events** + 9 pressure rules (POSITION L4752/L4783), and it runs **with AI off**. RippleForge is **reactive and AI-dependent**: it propagates consequences *from events you paste in* and needs the LLM to extract/project. Campaign Arks is *neither* — it's a tracker. So the honest framing is: **the living-world *desire* is confirmed and is no longer unserved; but a deterministic, offline, stat-driven simulation that generates emergent history without AI is still differentiated** — RippleForge needs your notes + its AI to move; RealmWright's world moves on its own math.

**→ Implication for RealmWright:** T2's "unserved" half is **refuted** — stop claiming "nobody does living worlds." Re-pitch the weapon precisely: *"a world that moves on its own deterministic rules — between sessions, even with AI switched off — not just a tracker, and not dependent on pasting notes into a cloud AI."* Study RippleForge's relationship-graph ripple UX (it is the nearest art); differentiate on **autonomy + offline + determinism**, and consider that RealmWright's stat-threshold engine and a RippleForge-style "consequence ripple" are *complementary* — a credible deepening direction.

---

## Q4 — CUSTOMER VOICE 2025-2026

**Prep-time burnout — CONFIRMED, top-tier, multi-source.** "DM burnout" is repeatedly named **one of the top-3 reasons a D&D campaign dies** (DungeonSolvers, DM Lair, Daily Dungeon Master). Sly Flourish's DM survey: **69% of DMs prep <3 hrs/week, only 8% prep 6+**; ~1/3 spend 3+ hrs for a 4-hr game, ~half spend ≤1 hr. Mechanism: GMs feel they "must have every detail planned," which becomes "overwhelming," especially weekly. ([DungeonSolvers](https://www.dungeonsolvers.com/dungeon-master-burnout/), [DM Lair](https://thedmlair.com/blogs/news/how-to-overcome-dungeon-master-burnout), [Sly Flourish survey](https://slyflourish.com/dm_survey_results.html), [Sly Flourish prep-time](https://slyflourish.com/how_long_to_prep.html))

**What GMs pay for / subscription fatigue — CONFIRMED, with a wedge-perfect quote.** Roll20 runs **$50–150/yr** *on top of* rulebooks/modules; community complaints about stacking paid tools are explicit. The sharpest line, from a 2026 World Anvil-alternatives piece: *"most DMs aren't publishing a setting — they're trying to run a session next Tuesday,"* with World Anvil critiqued for a "too cramped" free tier and "half the paid features… for presentation rather than play." Foundry (one-time $50) and Obsidian (free, offline, "notes portable forever") are repeatedly cited as the antidotes. ([minvarpg, 2026](https://minvarpg.com/blogs/ttrpg/world-anvil-alternatives), [fables.gg alternatives](https://fables.gg/blog/the-best-worldbuilding--vtt-alternatives), [EN World — WA worth a sub?](https://www.enworld.org/threads/world-anvil-worth-a-subscription.704644/), [Roll20 subscription FAQ](https://help.roll20.net/hc/en-us/articles/360037255314-Subscription-FAQ))

**Data-loss / trust / backup norms — CONFIRMED as a self-identified value.** The self-hosted/own-data ethos uses RealmWright's exact vocabulary: Foundry praised because "you completely own and control all of your game data," "no subscription fees or feature gating," self-hosting framed as avoiding "vendor lock-in." Even cloud rivals now advertise data-permanence (Archivist: "data stored even after cancellation"; LegendKeeper: read-only-on-lapse) — i.e., the market treats *not losing your world* as table stakes. ([Cthonic Studios](https://cthonicstudios.com/self-hosted-rpg-tools/), [Foundry VTT](https://foundryvtt.com/), [Archivist FAQ](https://www.myarchivist.ai/faq))

**→ Implication for RealmWright:** The three values to lead with — **own your data, work offline, buy once** — are the literal vocabulary GMs already use against the incumbents. The job is "run a session next Tuesday," not "build a setting." The complete JSON export (POSITION L8846, "your data-ownership safety net loses nothing") is not a footnote — it is a headline trust feature in a market where data permanence is now expected.

---

## Q5 — AI-IN-TTRPG SENTIMENT (mid-2026)

**The published-vs-private line is HOLDING as of April 2026 — CONFIRMED, freshened, and a feared reversal debunked.**
- **The bans stand.** ENnies' total ban on generative-AI-assisted submissions remains in force for the 2025-2026 cycle ("the initial policy does not go far enough"; potential delisting/revoked awards for violations). DriveThruRPG/DMs Guild still ban standalone AI-art products and commercial AI-*written* content and force a "Creation Method" label. The **"ENnies U-turn" headlines (GamesRadar/Yahoo) describe the U-turn *toward* the ban — a hardening, not a softening.** No reversal, no new acceptance found. ([ENnies revised policy](https://ennie-awards.com/revised-policy-on-generative-ai-usage/), [ENnies submission guidelines](https://ennie-awards.com/submissions-guidelines/), [GamesRadar U-turn](https://www.gamesradar.com/tabletop-gaming/ennies-tabletop-rpg-award-makes-a-u-turn-on-ai-submission-policy/), [rascal.news](https://www.rascal.news/ennie-awards-updated-submission-policy-wont-accept-ai-projects-next-year/))
- **The private-prep middle ground is now explicit and dated.** Red Circle Games' **26 Apr 2026** retrospective ("AI in TTRPGs — Two Years On") concludes the community "settled toward a pragmatic middle ground: **AI for prep support is widely accepted.**" CharGen's 2026 guidance reiterates: *"Private campaign prep is one thing; passing generated material off as something else is another… keep it in private prep or do not use it at all."* ([Red Circle Games, 26 Apr 2026](https://redcirclegames.co.uk/2026/04/26/ai-developments-revisited.html), [CharGen — How to Use AI for DnD 2026](https://char-gen.com/blogs/how-to-use-ai-for-dnd-campaigns-2026))
- **2026 shift to note:** the loud *backlash* has cooled into a *norm* (acceptance of private prep) rather than a new flashpoint — no fresh 2026 ban, boycott, or lawsuit surfaced. The Inkarnate reversal (Oct 2025) remains the cautionary tale: tools that put AI in their *public/marketplace* surface get punished; tools that keep AI in *private prep* do not. ([Inkarnate reversal](https://www.geeknative.com/206705/map-maker-inkarnate-reverses-ai-policy-following-community-backlash/))

**→ Implication for RealmWright:** Architecture (BYO-key, local data, never published, vendor never trains on your world) sits squarely on the *accepted* side of the community's own line — and that line is now a settled 2026 norm, not a live fight. The risk is **framing, not substance**: "AI" as a hero noun is a signal the loud core still reacts to (Inkarnate). Lead with ownership/offline/once; let "AI / your own key" appear as a *privacy mechanism*, not the headline. This is the strongest-supported conclusion in the document.

---

## Q6 — BYO-KEY & LOCAL-AI PRECEDENTS

**BYO-key is a recognized, productized 2026 pattern — CONFIRMED (multi-source).** It is no longer exotic: dedicated infra (usebyo.com), AI app-builders (Dyad), and wrappers (AiZolo) ship "bring your own key" as a feature; the standard implementation **stores the key client-side (LocalStorage), not on the server** — exactly RealmWright's approach (POSITION §4). The articulated value is precisely RealmWright's: *"skip the markup… pay only for the tokens you use,"* and for the builder, *"no billing to manage, no key abuse."* ([usebyo](https://usebyo.com/), [Dyad BYO-key](https://www.dyad.sh/blog/bring-your-own-api-key-ai-app-builder), [AiZolo](https://aizolo.com/blog/free-ai-wrapper-for-openai-key/))

**Honest limit — conversion/support data is UNVERIFIED.** No reliable hard number on *how much* BYO-key depresses activation surfaced. The structural argument is strong but indirect: **every polished TTRPG AI rival is hosted (Q1)** — i.e., the entire commercial field *chose to absorb the cost rather than impose key-fetch friction.* That choice is itself evidence BYO-key is friction rivals avoid. So BYO-key is best read as **a deliberate trade: maximum privacy/ownership + zero vendor cost, bought with real first-run activation friction.** Same fact, two faces — the resolution (per V1, reaffirmed) is a no-key demo *before* the wall.

**Local AI (Ollama) for non-technical users — a real CAVEAT, not a mainstream asset yet — CONFIRMED.** In 2026 it "feels normal to run local LLMs," and Ollama is "the default… because it removes complexity" — **but Ollama itself is CLI-first/developer-oriented.** Non-technical users need a GUI layer: **LM Studio** ("no terminal, no daemon… search, Download, Load, chat") or **Open WebUI** ("local ChatGPT without touching a terminal"). So RealmWright's local-AI path is **a genuine asset for the enthusiast/privacy-maximalist tail, not a mainstream consumer feature** as-is — unless RealmWright wires to a local endpoint the user already runs. ([Ollama vs LM Studio 2026](https://www.kunalganglani.com/blog/ollama-vs-lm-studio), [SitePoint local LLMs 2026](https://www.sitepoint.com/local-llms-are-getting-easier-the-complete-guide-2026/), [Open WebUI guide](https://www.datacamp.com/blog/open-webui))

**→ Implication for RealmWright:** BYO-key is *validated architecture* with a clean privacy story — frame it as "the AI uses *your* key, so it's private and costs us nothing," never as a bare paste-box. Treat **OpenRouter BYO-key as the primary AI path**; treat **local Ollama as the enthusiast/"never leaves my machine" tier**, not the default onboarding promise. Both flank the no-key demo, which remains the activation fix.

---

## Q7 — PRICE PSYCHOLOGY FOR ONE-TIME CREATOR TOOLS (the T3 question)

**One-time GM tools sell, and are *beloved* — CONFIRMED, two flagship proofs (re-verified).** **Dungeon Alchemist**: one-time **$44.99**, free updates forever, no subscription, ~€2.4M Kickstarter, ~93% positive across ~1,848 Steam reviews. **Foundry VTT**: one-time **$50**, self-hosted, own-your-data, "does just about everything Roll20 can… with a one-time payment." ([Dungeon Alchemist Steam discussion](https://steamcommunity.com/app/1588530/discussions/0/3275813284152842825/), [Foundry/Roll20 alt analysis](https://minvarpg.com/blogs/ttrpg/world-anvil-alternatives), [Foundry VTT](https://foundryvtt.com/))

**The price-as-weapon, pressure-tested with a real case (NEW vs V1).** **Old Greg's Tavern** ran a flat **$5 one-time**, then in Aug 2025 moved to **$15–25/mo subscriptions**, branding it "your most requested feature." Player reaction skewed negative — "good app but **pay to play**," "super high paywall," "demands payment to continue" after ~5 minutes. ([Old Greg's pricing](https://www.oldgregstavern.com/pricing), [why-updating-pricing](https://oldgregstavern.beehiiv.com/p/why-old-gregs-tavern-is-updating-pricing)) **Two opposite lessons, both load-bearing:**
- **FOR T3:** a low one-time price was perceived as generous; the *move away from it* drew backlash. Low one-time prices buy goodwill in this audience.
- **AGAINST a naive reading of T3:** the vendor abandoned one-time *because metered hosted-AI cost made it unsustainable.* A one-time price + **hosted** AI is structurally fragile. **RealmWright escapes this trap precisely via BYO-key/local AI — the user pays their own inference, so a one-time price never has to subsidize ongoing AI cost.** This is the strongest *structural* argument for the whole model, and it only holds because of the BYO-key choice (Q6).

**$19 vs $29 vs $49 — perceived-quality evidence + the honest risk.**
- **Charm/left-digit effect CONFIRMED:** $19 reads as "teens," $29 as "twenties" — both feel materially cheaper than the next round number. ([AlterSquare](https://altersquare.io/saas-pricing-psychology-why-29-beats-30-every-time/), [Calmops indie pricing](https://calmops.com/indie-hackers/pricing-psychology-indie-hackers/))
- **Content-value alignment CONFIRMED, and it is the real signal:** indie buyers justify higher prices by *depth* — "50+ hours at $19.99 feels reasonable; 5-10 hours should be $9.99-14.99." Translated: **price is read as a claim about depth.** A deep, multi-system app at **$19** risks the "cheap toy / how good can it be?" inference *relative to its true scope* — the honest T3 risk. ([Practical Media indie pricing](https://practicalmedia.io/article/how-can-indie-developers-use-pricing-psychology-to-boost-game-sales))
- **Anchors:** Foundry $50 and Dungeon Alchemist $44.99 set the ceiling for "serious own-it GM software." At **$19, RealmWright is ~60% below those anchors** — far enough below that it *under-signals* against a tool of its claimed $49/$229 depth. itch.io confirms a healthy low-price one-time long tail (paid GM tools from ~$3), so $19 is *above* the micro-tool floor but *well under* the serious-app anchor.

**Tiering patterns that fit Gumroad WITHOUT subscriptions — CONFIRMED viable:** Gumroad supports one-time tiers and "pay-what-you-want," and World Anvil itself proves **lifetime tiers** sell in this exact audience. A **"supporter / lifetime-updates" higher tier** (e.g., $19 base / $39 supporter) captures willingness-to-pay without a subscription, halal-clean and Payoneer-clean. ([WA lifetime tiers](https://blog.worldanvil.com/announcements/world-anvil-lifetime-sage-membership-lt-grandmaster-now-available/), [Gumroad model](https://girff.medium.com/gumroad-the-ultimate-platform-for-digital-creators-in-2026-f558e1f7ef90))

**→ Implication for RealmWright:** T3 is **MODIFIED.** "Low one-time price as a weapon" is *directionally right and structurally sound* (BYO-key makes one-time sustainable where hosted rivals fail) — but **$19 specifically risks under-signaling the $49/$229 depth** the product claims. Recommended: **launch at $19 only as a deliberate, time-boxed "early-supporter / prove-it" price**, paired with a no-key demo that *shows* the depth (so the buyer infers quality from experience, not price); then move the anchor to **$29 base with a $39–49 lifetime/supporter tier** once conversion is proven. Do not leave $19 as the permanent flagship number against $45–50 anchors — it argues *against* your own value claim.

---

## Q8 — DISTRIBUTION 2026 (where GM tools get discovered + bought)

**Gumroad is viable for this audience and HARD-CONSTRAINT-compatible — CONFIRMED.** TTRPG creators actively sell on Gumroad (homebrew assets, tools); model is per-transaction, **no monthly fee**; it has a buyer app for delivered products. It sells arbitrary digital files (a single HTML app is unremarkable). The honest knock: Gumroad is "**just an online mall**" — it handles *payment* well but provides **weak organic discovery**, and fees can run **10–30%** depending on traffic source. ([Gumroad TTRPG search](https://gumroad.com/gaming?query=ttrpg), [Gumroad 2026 overview](https://girff.medium.com/gumroad-the-ultimate-platform-for-digital-creators-in-2026-f558e1f7ef90), [itch vs Gumroad thread](https://itch.io/t/2760445/itch-vs-gumroad))

**itch.io is the stronger DISCOVERY channel for paid web/HTML GM tools — CONFIRMED.** itch.io has dedicated, browsable categories — `tools/platform-web/tag-tabletop`, `tag-dungeon-master`, `tag-generator/tag-ttrpg` — with paid entries (e.g., a $3 "data-driven engine for the modern Game Master"), and the community consensus is itch's "community spirit… fosters more engagement and lots of organic traffic," is "way more warm and inviting," and is the recommended home "for game devs or software creators." **Web/HTML tools demonstrably sell there.** ([itch web tabletop tools](https://itch.io/tools/platform-web/tag-tabletop), [itch dungeon-master tools](https://itch.io/tools/tag-dungeon-master), [itch vs Gumroad](https://itch.io/t/2760445/itch-vs-gumroad))

**Communities that convert + AI-tolerance (PARTLY — directional, not quote-mined):** the TTRPG-tool conversation lives on **EN World, RPG Pub, r/DMAcademy/r/rpg, D&D Beyond forums, Sly Flourish, and GM-prep YouTube** — but Reddit/Discord rarely surfaces in this index, so specific subreddit/Discord conversion data is **thin and flagged**. AI-tolerance maps to the published-vs-private line (Q5): communities tolerate *prep* tools; they punish *AI-content-as-product* signaling. The Sly Flourish / "lazy DM" / prep-efficiency audience is the warmest fit (they already optimize for short prep).

**→ Implication for RealmWright:** Practical answer to "can a Gumroad-sold HTML file reach this audience?" — **Yes, but split the jobs: itch.io for DISCOVERY (where GMs browse for tools, web/HTML supported), Gumroad/Payoneer for the PAYOUT rail** (the hard constraint). POSITION/INDEX already note licensing targets itch.io + (formerly) Lemon Squeezy and must add a Gumroad key path; this research says **itch.io listing for reach + Gumroad checkout for payout** is the correct combination, and the Gumroad license path is a genuine open requirement, not optional.

---

## Q9 — SOLO-RPG MARKET (is Solo mode a wedge or a distraction?)

**Size/trajectory — CONFIRMED, sizeable and fast-growing.** Global TTRPG market **~$2.4B in 2026, +~11.9% YoY** (toward ~$6.6B by 2035, ~11.8% CAGR). Solo is a *named, fast-rising segment*: "more people are playing D&D alone than at any point in the game's 50-year history"; solo benefits from journaling-RPG and print-and-play formats; **33% of publishers added solo modes, 36% expanded VTT tools, 25% built AI tools** (same survey); **44% of players use VTTs**; 19% of players 50+ explore journaling/minimal-DM games. **Ironsworn** (free) is the genre's gold standard. ([GlobalGrowthInsights TTRPG market](https://www.globalgrowthinsights.com/market-reports/tabletop-role-playing-game-ttrpg-market-103239), [Nerdarchy — rise of solo RPGs](https://nerdarchy.com/the-rise-of-solo-rpgs-why-playing-alone-is-one-of-the-fastest-growing-trends-in-tabletop-gaming/), [RunicDice solo trend](https://www.runicdice.com/blogs/news/solo-ttrpg-the-one-player-rpg-trend), [AIDungeonMaster solo guide 2026](https://aidungeonmaster.ai/blog/complete-guide-solo-dnd-2026/))

**What solo players expect from a tool:** an *oracle/engine* that answers "what happens?" and drives emergent story without a human GM, low-commitment, high-creativity — exactly the loop AI-DM tools (RoleForge, Jenova, AIDungeonMaster.ai) chase for solo play. **Halal caution:** solo-RPG tooling is steeped in "oracle" framing — RealmWright must keep its existing halal discipline (POSITION L4844 prompt sweep; fix the "oracle results" tagline L12396) and avoid divination-framing in any Solo-mode copy.

**→ Implication for RealmWright:** Solo is a **real, growing wedge worth *modest* deepening — but secondary to the GM-prep core.** RealmWright's autonomous simulation is a natural solo *oracle* ("the world moves; you react"), which is precisely what solo players want and which **no offline+own-data tool serves**. Treat Solo as a **second beachhead that reuses the simulation engine at near-zero marginal build cost** (POSITION already lists a Solo route) — *not* a rebuild, *not* the primary launch story. Watch the oracle/divination halal line in Solo copy specifically.

---

## Q10 — POSITIONING TEST: "session-prep tool w/ living world" vs "nation-strategy sim that serves GMs"

**The audience searches/buys "session prep" and "DM tools" — NOT "nation-strategy sim" — CONFIRMED.** GMs explicitly separate two tool classes: **worldbuilding tools** (reference-first, slow-changing infrastructure: World Anvil/LegendKeeper/Kanka) and **session-prep tools** (immediate tactical: hooks, encounters, NPCs, "what do I run"). The recurring community framing: "**Most DMs want prep tools, not a replacement**," and "most DMs aren't publishing a setting — they're trying to run a session next Tuesday" (Q4). Every commercial competitor describes itself in *prep / DM-assistant / game-master* language; **none** sells itself as a "geopolitics/nation sim." ([best-DM-tools framing](https://www.myarchivist.ai/ai-dungeon-master/best-dm-tools-2026), [DM tools 2026 / prep vs worldbuilding](https://tabletoparc.com/resources/best-ai-dungeon-master-tools), [minvarpg "run a session next Tuesday"](https://minvarpg.com/blogs/ttrpg/world-anvil-alternatives))

This directly addresses POSITION §1's open fork ("a geopolitics sim that *can* wear a GM hat — a positioning fork to decide"). The market's verdict is unambiguous: **lead as a GM session-prep tool; the living-world/nation simulation is the differentiating *engine*, not the category label.** "Nation-strategy sim that serves GMs" describes how the product is *built*; it is **not** how this audience searches, and would orphan the product in a near-empty search category. The recurring high-converting vocabulary is *session prep, run my table, NPCs, hooks, what to run tonight, world that feels alive* (the last being the exact phrase Campaign Arks and RippleForge already use — validating it as buyer language).

**→ Implication for RealmWright:** Adopt the **"GM session-prep tool with a living-world engine"** framing without hesitation; flip the in-app default away from "Strategist / High Command" toward the GM vocabulary (POSITION notes `TERM_GM_MAP` L5970 already exists) as the *primary* skin, with the strategist framing as an alternate mode. Headline the *outcome* (run a great session on 15 minutes of prep) and the *values* (own/offline/once); name the engine ("a living world that moves on its own rules") as the differentiator *inside* the prep category — never as the category itself.

---

## THESIS VERDICTS

### T1 — The "empty quadrant" moat (offline + own-data + one-time + BYO/local-AI, occupied by NO AI-prep competitor)
**VERDICT: MODIFIED (mostly holds, with one named neighbor).**
- **Holds:** Every *polished commercial* text-prep competitor is online-only + hosted-AI + subscription + data-on-their-servers (Q1, many sources). The only offline/own-data/BYO tools are **GitHub developer projects** (KoboldAI, Ollama wrappers, Discord bots) — *not* shippable consumer products. RealmWright as a *finished, buy-once, install-nothing, fully-offline* app is effectively alone.
- **Breaks the "empty" claim:** **RippleForge** (a living-world product) exports plain JSON, advertises "no lock-in," and offers a no-login demo — contesting the *own-your-data* axis V1 called uncontested. Its offline/BYO status is **UNVERIFIED**, so it may or may not fully occupy the quadrant — but it is close enough that "**no** competitor occupies this" is no longer defensible.
- **Trail:** [RippleForge](https://rippleforge.gg/) · [KoboldAI](https://github.com/KoboldAI/KoboldAI-Client) · [Ollama DIY DM](https://www.arsturn.com/blog/build-your-own-local-ai-dungeon-master-with-ollama) · Q1 hosted-rival table.
- **Action:** Claim "the only **finished, buy-once, fully-offline** GM tool with optional private AI," name RippleForge as the nearest neighbor, and beat it on autonomy/offline/determinism + finished-product polish.

### T2 — Living-world simulation is WANTED + UNSERVED (unique weapon + weekly hook)
**VERDICT: MODIFIED — "wanted" CONFIRMED; "unserved" REFUTED; differentiation survives in narrowed form.**
- **Wanted: CONFIRMED, strongly** (Q3 — Ruckerworks 2026, RPG Pub, the beloved SWN faction-turn precedent, fan-built tooling).
- **Unserved: REFUTED.** **RippleForge** ships a "Living World Simulation for TTRPGs" in 2026; **Campaign Arks** markets near-identical "world feels alive" language (though it's really status-tracking). The desire is no longer unmet.
- **Differentiation survives, narrowed:** RealmWright's engine is **autonomous + deterministic + offline + AI-off-capable** (stat thresholds auto-fire authored events; POSITION L4752/L4783). RippleForge is **reactive + AI-dependent** (propagates consequences from pasted notes); Campaign Arks is a tracker. "A world that moves on its own math, between sessions, with AI switched off" is still differentiated — but the moat is *autonomy/determinism/offline*, **not** "nobody does living worlds."
- **Trail:** [RippleForge](https://rippleforge.gg/) · [Campaign Arks](https://www.campaignarks.com/) · [Ruckerworks living world](https://ruckerworks.com/2026/03/dnd-living-world-background-events/) · [SWN factions](https://takeonrules.com/2018/12/27/lets-read-stars-without-number-factions/).
- **Action:** Drop "unserved." Re-pitch the weapon as **deterministic + offline + autonomous** living world; study RippleForge's ripple UX as prior art; treat threshold-events + consequence-ripple as complementary deepening.

### T3 — Dual-mode at $19 one-time ("$49-grade w/o AI, $229-grade w/ AI") converts; low price is a weapon
**VERDICT: MODIFIED — model is sound; the specific $19 number under-signals.**
- **One-time/own-it thrives in this audience: CONFIRMED** (Foundry $50 ~beloved; Dungeon Alchemist $44.99 / €2.4M / 93% positive).
- **Low one-time as a weapon: CONFIRMED directionally** (Old Greg's $5 one-time was perceived as generous; the move *off* it drew "pay to play" backlash) — **and structurally sound *only because of BYO-key*:** Old Greg's abandoned one-time because *hosted* AI cost made it unsustainable; RealmWright's BYO-key/local AI means the user funds inference, so a one-time price never subsidizes AI. This is the strongest structural argument for the whole model.
- **The $19 number specifically — RISK CONFIRMED:** indie buyers read price as a depth claim ("50+ hrs justifies $19.99; 5-10 hrs should be $9.99-14.99"); against $45-50 anchors, **$19 under-signals a product claiming $49/$229 depth** — the "cheap toy" wound is real *at $19*, not at one-time pricing generally.
- **Trail:** [Old Greg's why-updating-pricing](https://oldgregstavern.beehiiv.com/p/why-old-gregs-tavern-is-updating-pricing) · [Dungeon Alchemist](https://steamcommunity.com/app/1588530/) · [Foundry one-time](https://minvarpg.com/blogs/ttrpg/world-anvil-alternatives) · [indie content-value pricing](https://practicalmedia.io/article/how-can-indie-developers-use-pricing-psychology-to-boost-game-sales) · [WA lifetime tiers](https://blog.worldanvil.com/announcements/world-anvil-lifetime-sage-membership-lt-grandmaster-now-available/).
- **Action:** Use $19 as a **deliberate, time-boxed early-supporter price**, always paired with a no-key demo that *demonstrates* depth (so quality is inferred from experience, not the number). Plan the anchor at **$29 base + $39-49 lifetime/supporter tier** once conversion is proven. Do not leave $19 as the permanent flagship against $45-50 anchors — it argues against your own value claim. The dual-mode *value* claim itself is not market-testable here (no comparable dual-mode product exists) and stays **UNVERIFIED** until RealmWright's own demo data exists.

---

## WHAT WE STILL DON'T KNOW (honest unknowns — gate R7)

1. **RippleForge's exact model** — offline? BYO-key or hosted? price? Lightly indexed + crypto name-collision blocked verification. This is the **highest-value open question** because it determines how empty T1's quadrant truly is. (Recommend a manual visit to rippleforge.gg + its demo.)
2. **Hard BYO-key conversion/drop-off numbers** — the friction is real and structurally argued, but no quantified activation-loss figure surfaced. UNVERIFIED.
3. **Whether a *deterministic, AI-off* living-world sim is independently *wanted* by buyers** — demand for "living worlds" is confirmed, but every shipping product satisfies it *with* AI. RealmWright's bet that the *no-AI* simulation alone justifies $49 is **untested in-market** (no comparable no-AI living-world product to benchmark).
4. **Exact tier pricing** for Campaign Arks, Archivist, LoreKeeper, World Anvil Grandmaster — models confirmed, precise $ figures PARTLY (WebFetch-blocked).
5. **Specific subreddit/Discord conversion + AI-tolerance data** — directional only; Reddit/Discord under-index in this US WebSearch index. Thin, flagged.
6. **Real GM willingness-to-pay for *this* product** — all WTP evidence is by analogy (Foundry/Dungeon Alchemist/subscriptions); no RealmWright-specific demand signal exists yet. The no-key demo is the instrument that would produce it.
7. **itch.io vs Gumroad *conversion-rate* for a tool like this** — discovery-vs-payout split is sound, but no head-to-head sell-through number for a single-file HTML GM app surfaced.

---

## SOURCES (URL · access date 2026-06-10 · claims backed)

**AI GM-prep landscape / new entrants (Q1, T1):**
- https://roleforge.ai/blog/best-ai-game-master-tools-compared/ — crowded 2026 field; tool roundup
- https://lore-keeper.com/blog/best-ai-dungeon-master-2026 — LoreKeeper (server-side 5e engine, free 20 turns/day, paid €7.99/mo); Old Greg's Tavern pricing-shift + user count; LitRPG $5/mo; Dungeon Alchemist $44.99; Archivist $10/mo
- https://tabletoparc.com/resources/best-ai-dungeon-master-tools — 2026 ranked comparison; prep-vs-worldbuilding distinction (Q10)
- https://www.myarchivist.ai/ai-dungeon-master/best-dm-tools-2026 — DM-tool framing; Archivist positioning
- https://www.myarchivist.ai/faq — Archivist data-stored-after-cancellation
- https://www.scriptoriumgm.com/blog/2026-03-31-best-ai-tools-for-dungeon-masters-2026 — 2026 tool landscape
- https://char-gen.com/blogs/best-ai-ttrpg-tools-2026 — "handful to overwhelming list"; CharGen world-codex/continuity
- https://www.campaignarks.com/ — Campaign Arks: "world feels alive session after session"; 13 doc types (status/phase/reveal); free 1 campaign + paid tiers
- https://www.oldgregstavern.com/pricing — Old Greg's tiers ($5 one-time / $15 / $25 mo)
- https://oldgregstavern.beehiiv.com/p/why-old-gregs-tavern-is-updating-pricing — one-time→subscription rationale (T3)
- https://fables.gg/blog/old-gregs-tavern-vs-friends--fables-plan--feature-comparison — Old Greg's vs F&F tiers
- https://github.com/KoboldAI/KoboldAI-Client — offline/BYO DIY AI DM (dev tool)
- https://www.arsturn.com/blog/build-your-own-local-ai-dungeon-master-with-ollama — local Ollama DM "no subscriptions"

**Living-world simulation (Q3, T2):**
- https://rippleforge.gg/ — "Living World Simulation for TTRPGs"; ripple-across-graph mechanic; JSON export / no lock-in
- https://rippleforge.gg/demo/ — "The world reacts, even when your players don't"; no-login demo
- https://ruckerworks.com/2026/03/dnd-living-world-background-events/ — GM desire for worlds alive between sessions (Mar 2026)
- https://www.rpgpub.com/threads/living-world-world-in-motion.6113/ — "Living World / World in Motion" demand
- https://takeonrules.com/2018/12/27/lets-read-stars-without-number-factions/ — SWN faction turn (between-session mini-game) — stable mechanic fact
- https://d0ngiovanni.github.io/swn-faction-spreadsheet/ — fan-built faction-turn tool (demand proof)
- https://github.com/sensualcoder/swn-gm-tool — GitHub SWN GM-turn tool (demand proof)

**Worldbuilding/wiki pricing + free substitutes (Q2):**
- https://www.legendkeeper.com/pricing — $9/mo·$90/yr, no creation free tier, 14-day trial, read-only on lapse
- https://www.worldanvil.com/pricing — Guild ~$5 / Master $12·$105yr / Grandmaster / Sage; Journeyman deprecated
- https://blog.worldanvil.com/announcements/world-anvil-lifetime-sage-membership-lt-grandmaster-now-available/ — WA lifetime tiers (Q7 tiering)
- https://kanka.io/pricing — free forever unlimited; paid from $4.99/mo; self-hostable
- https://fantasiaarchive.com/ — free, offline, open-source GPL3 "your world is your own"
- https://chronicler.pro/best-worldbuilding-tools — Chronicler free/offline/no-signup/custom HTML; 2026 roundup
- https://obsidianttrpgtutorials.com/Obsidian+TTRPG+Tutorials/Plugin+Tutorials/The+Plugin+List — Obsidian TTRPG plugin ecosystem

**Customer voice — burnout / subscription fatigue / ownership (Q4):**
- https://www.dungeonsolvers.com/dungeon-master-burnout/ — burnout = top-3 campaign killer
- https://thedmlair.com/blogs/news/how-to-overcome-dungeon-master-burnout — burnout mechanism
- https://slyflourish.com/dm_survey_results.html — 69% prep <3h/wk, 8% prep 6+h
- https://slyflourish.com/how_long_to_prep.html — per-session prep distribution
- https://minvarpg.com/blogs/ttrpg/world-anvil-alternatives — "run a session next Tuesday"; WA free-tier "too cramped"; Foundry one-time; Obsidian free/portable
- https://www.enworld.org/threads/world-anvil-worth-a-subscription.704644/ — subscription-worth debate
- https://help.roll20.net/hc/en-us/articles/360037255314-Subscription-FAQ — Roll20 subscription model
- https://cthonicstudios.com/self-hosted-rpg-tools/ — own-your-data / no-lock-in ethos vocabulary
- https://foundryvtt.com/ — one-time, self-hosted, own-data flagship

**AI sentiment (Q5):**
- https://ennie-awards.com/revised-policy-on-generative-ai-usage/ — total AI ban, 2025-2026 cycle
- https://ennie-awards.com/submissions-guidelines/ — AI-free confirmation requirement; delisting risk
- https://www.gamesradar.com/tabletop-gaming/ennies-tabletop-rpg-award-makes-a-u-turn-on-ai-submission-policy/ — "U-turn" = toward ban (not a reversal)
- https://www.rascal.news/ennie-awards-updated-submission-policy-wont-accept-ai-projects-next-year/ — policy timing
- https://redcirclegames.co.uk/2026/04/26/ai-developments-revisited.html — "AI for prep support is widely accepted" (26 Apr 2026)
- https://char-gen.com/blogs/how-to-use-ai-for-dnd-campaigns-2026 — published-vs-private line
- https://www.geeknative.com/206705/map-maker-inkarnate-reverses-ai-policy-following-community-backlash/ — Inkarnate reversal (signal sensitivity)

**BYO-key & local AI (Q6):**
- https://usebyo.com/ — productized BYO-key infra
- https://www.dyad.sh/blog/bring-your-own-api-key-ai-app-builder — BYO-key app builder; client-side key storage
- https://aizolo.com/blog/free-ai-wrapper-for-openai-key/ — "skip the markup, pay only for tokens"
- https://www.kunalganglani.com/blog/ollama-vs-lm-studio — Ollama CLI-first/dev-oriented; LM Studio GUI for non-technical
- https://www.sitepoint.com/local-llms-are-getting-easier-the-complete-guide-2026/ — local LLMs "feel normal" 2026 (with caveats)
- https://www.datacamp.com/blog/open-webui — Open WebUI = "local ChatGPT without a terminal"

**Price psychology (Q7):**
- https://altersquare.io/saas-pricing-psychology-why-29-beats-30-every-time/ — left-digit/charm effect
- https://calmops.com/indie-hackers/pricing-psychology-indie-hackers/ — indie pricing psychology
- https://practicalmedia.io/article/how-can-indie-developers-use-pricing-psychology-to-boost-game-sales — content-value alignment (price as depth claim)
- https://steamcommunity.com/app/1588530/discussions/0/3275813284152842825/ — Dungeon Alchemist ~$45 one-time
- https://steamcommunity.com/app/1588530/ — Dungeon Alchemist Steam presence/reviews

**Distribution (Q8):**
- https://itch.io/t/2760445/itch-vs-gumroad — itch (discovery/community) vs Gumroad ("online mall," easier payout)
- https://itch.io/tools/platform-web/tag-tabletop — paid web/HTML tabletop tools sell on itch
- https://itch.io/tools/tag-dungeon-master — paid DM tools on itch
- https://gumroad.com/gaming?query=ttrpg — TTRPG creators on Gumroad
- https://girff.medium.com/gumroad-the-ultimate-platform-for-digital-creators-in-2026-f558e1f7ef90 — Gumroad 2026 model (per-transaction, no monthly fee)

**Solo-RPG market (Q9):**
- https://www.globalgrowthinsights.com/market-reports/tabletop-role-playing-game-ttrpg-market-103239 — $2.4B 2026, +11.9% YoY; solo/AI/VTT publisher stats
- https://nerdarchy.com/the-rise-of-solo-rpgs-why-playing-alone-is-one-of-the-fastest-growing-trends-in-tabletop-gaming/ — solo growth
- https://www.runicdice.com/blogs/news/solo-ttrpg-the-one-player-rpg-trend — one-player trend
- https://aidungeonmaster.ai/blog/complete-guide-solo-dnd-2026/ — solo D&D "more than any point in 50 years"; Ironsworn gold standard

---

## SELF-GRADE vs RUBRIC R (gate-by-gate, honest)

- **R1 Coverage — PASS.** All ten questions (Q1-Q10) answered, each with a "→ Implication."
- **R2 Sourcing — PASS (with honest flags).** Load-bearing claims carry ≥2 independent sources (e.g., one-time-tools-sell: Foundry + Dungeon Alchemist; burnout: 3 sources; bans hold: ENnies + DriveThruRPG + Red Circle). Genuinely single-source items (Chronicler specifics; LitRPG $5/mo; some exact tiers) are flagged PARTLY. Unverifiable items (RippleForge model; BYO-key conversion %) flagged UNVERIFIED rather than asserted.
- **R3 Citations real — PASS (subject to R10).** All URLs are real, search-surfaced, access-dated 2026-06-10, and each is placed against the specific claim it backs. (WebFetch-blocked, so pages read via extract — disclosed up front.)
- **R4 Adversarial — PASS.** Each thesis was attacked with hostile queries: T1 → found RippleColumn neighbor + DIY-offline tools (broke "empty"); T2 → found RippleForge/Campaign Arks (broke "unserved"); T3 → found Old Greg's one-time→sub backlash + the $19 under-signaling risk. Refutations are reported as loudly as confirmations and changed the verdicts (all three are MODIFIED/partly-REFUTED, none rubber-stamped).
- **R5 Recency — PASS.** Market claims rest on 2026 sources (Red Circle Apr 2026, Ruckerworks Mar 2026, 2026 pricing pages, 2026 market reports). Older sources used only for stable facts (SWN faction mechanic; pricing-psychology principles).
- **R6 Confidence grades — PASS.** Every load-bearing claim marked CONFIRMED / PARTLY / UNVERIFIED; no grade inflated to look strong (e.g., T1 explicitly downgraded from V1's confident "empty quadrant").
- **R7 Honest unknowns — PASS.** Explicit 7-item "What we still don't know," led by the RippleForge gap and the untested no-AI-living-world demand.
- **R8 Decision-linked — PASS.** Every Q ends in a concrete RealmWright implication; verdicts carry explicit Actions.
- **R9 Clean lineage — PASS.** Nothing drawn from the quarantined `EXTERNAL-DOSSIER.md`; it was neither read nor cited. Inherited claims from the B+ research were re-verified, not assumed (LegendKeeper, World Anvil, Kanka all independently re-confirmed; T1/T2/T3 re-attacked from scratch).
- **R10 Survives independent spot-check — PENDING (per instruction).** Left for the independent checker. The "Spot-check assist" below is provided to make that check fast and honest.

**Self-assessed grade: A− pending R10.** Honest residual weaknesses keeping it below a self-declared A+: (a) RippleForge — the single most thesis-relevant competitor — could not be fully classified (offline/BYO/price UNVERIFIED) due to thin indexing + name collision; (b) no hard quantified BYO-key conversion number; (c) Reddit/Discord customer-voice is directional, not quote-mined. None are fabrications; all are disclosed. A+ should be conferred only after R10 and ideally after a manual RippleForge check.

---

## SPOT-CHECK ASSIST (the 8 claims a hostile checker is most likely to challenge)

1. **"RippleForge ships a living-world simulation that exports JSON with no lock-in" (breaks T1/T2 'empty/unserved').** Strongest source: https://rippleforge.gg/ + https://rippleforge.gg/demo/ . *Checker note: verify the JSON-export/no-lock-in and demo claims; its offline + AI-key model are explicitly flagged UNVERIFIED here.*
2. **"Old Greg's Tavern moved from $5 one-time to $15-25/mo subscriptions and drew 'pay to play' backlash" (load-bearing for T3).** Strongest source: https://oldgregstavern.beehiiv.com/p/why-old-gregs-tavern-is-updating-pricing + https://www.oldgregstavern.com/pricing .
3. **"The ENnies AI ban HOLDS in 2026; the 'U-turn' was toward the ban, not a reversal" (Q5/T2-adjacent).** Strongest source: https://ennie-awards.com/revised-policy-on-generative-ai-usage/ + https://www.gamesradar.com/tabletop-gaming/ennies-tabletop-rpg-award-makes-a-u-turn-on-ai-submission-policy/ .
4. **"AI for private prep is now a widely-accepted 2026 norm" (Q5, the strongest positive conclusion).** Strongest source: https://redcirclegames.co.uk/2026/04/26/ai-developments-revisited.html + https://char-gen.com/blogs/how-to-use-ai-for-dnd-campaigns-2026 .
5. **"LegendKeeper has NO creation free tier; $9/mo or $90/yr, read-only on lapse" (corrects PRODUCT-REVIEW's '$0-12 with free tiers').** Strongest source: https://www.legendkeeper.com/pricing .
6. **"$19 under-signals depth because indie buyers read price as a depth claim, against $45-50 anchors" (the T3 modification).** Strongest source: https://practicalmedia.io/article/how-can-indie-developers-use-pricing-psychology-to-boost-game-sales (depth-justifies-price) + https://steamcommunity.com/app/1588530/ (Dungeon Alchemist $44.99 anchor).
7. **"GMs search/buy 'session prep / DM tools,' not 'nation-strategy sim'" (Q10 positioning verdict).** Strongest source: https://minvarpg.com/blogs/ttrpg/world-anvil-alternatives ("run a session next Tuesday") + https://tabletoparc.com/resources/best-ai-dungeon-master-tools (prep-vs-worldbuilding split).
8. **"The offline/own-data worldbuilding-storage lane is saturated with FREE tools (Obsidian + plugins, Fantasia Archive, Chronicler)" (kills 'win on storage').** Strongest source: https://fantasiaarchive.com/ + https://obsidianttrpgtutorials.com/Obsidian+TTRPG+Tutorials/Plugin+Tutorials/The+Plugin+List .

---

*End of V2. Net change from B+: the field is more crowded (named new entrants), the living-world thesis has a real competitor (RippleForge) that forces T2 from "unserved" to "differentiated-but-served," the storage lane is confirmed free-saturated, a real one-time→subscription case study (Old Greg's) grounds T3, and the $19 price is flagged as under-signaling the product's claimed depth. The ownership-led, AI-as-private-proof positioning from the B+ research survives every adversarial pass and is strengthened — but "no competitor does this" must become "the only finished, buy-once, fully-offline one."*

---

## INDEPENDENT CHECK — R10 (different mind than the producer; 2026-06-10)

Spot-checked the 6 most load-bearing claims (the artifact's own "spot-check assist" list), ~10 distinct
URLs re-searched independently. **Result: 6/6 claims supported, all sources real, zero fabrication.**

1. RippleForge — VERIFIED (site exists, exact title "Living World Simulation for TTRPGs"; reactive
   ripple + AI note-processing mechanic confirmed; supports the T1/T2 modification as written).
2. Old Greg's Tavern — VERIFIED, tiers exact. Nuance recorded: the $5 one-time tier still exists but is
   **metered (50 rounds)**; §1.4's "abandoned one-time" phrasing is slightly strong — subscriptions were
   *added* and one-time became metered. The structural lesson (hosted AI cannot sustain unlimited
   one-time) is thereby **reinforced**, not weakened.
3. ENnies ban holds; "U-turn" = toward the ban — VERIFIED, including the "does not go far enough" language.
4. Red Circle Games (26 Apr 2026) — source, date, and topic VERIFIED; the exact quoted sentence did not
   surface in the checker's extract (different excerpt of the same article) — noted, not a failure.
5. Price-as-depth ($19.99↔50+hrs; $9.99–14.99↔short) — VERIFIED **verbatim**, plus independent
   corroborating indie-pricing sources surfaced in the check.
6. "Most DMs are trying to run a session next Tuesday" (minvarpg) — VERIFIED **verbatim**, including the
   "free tier too cramped" and "presentation rather than play" complaints.

**R10: PASS → all 10 gates pass. Grade: A+ (with the declared unknowns of §"What we still don't know" —
allowed; hidden unknowns — none found).** Standing caveats for downstream users of this research:
RippleForge's offline/BYO/price model remains UNVERIFIED (manual visit recommended); BYO-key conversion
loss is structurally argued, not quantified; Reddit/Discord voice is directional.
