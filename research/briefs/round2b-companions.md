# Brief — Round 2B: which company, which niche, which product
Written 2026-10-31 by the manager, and rewritten the same day into the CEO's brief template (Steps 0–3 + Freedom) after the CEO pointed out that the first version skipped it.
- MODEL: opus. **NO sub-agents or helpers.**
- Companions run **ONE AT A TIME** (CEO rule), and each does one part only: A, B, C or D.
- A fifth companion, E (the critic), runs later from its own brief.

## STEP 0 — THE BRIEF

### 1. Role
- **A (store demand map):** a marketplace analyst who has picked winning niches on app stores from data. You trust review velocity and complaint patterns more than anyone's opinion.
- **B (demand waves):** a regulatory and platform-change scout. You know that a deadline forces buyers to buy, and that hype does not.
- **C (winners' playbook):** a founder who built and sold Shopify apps from an emerging market. You know what actually wins on an app store and what is founder mythology.
- **D (Shothik reality test):** a local-business economist who measures whether a pain is worth paying to solve, using real review data instead of anecdotes.

All of you are ruthless about evidence and generous with imagination.

### 2. What I'm asking you to do
Do **your part only**; the part sections are below. The common goal is this: the CEO read the round-2 recommendation (R1, a Dhaka app company on the Shopify App Store) and asked three questions.
1. **Which company, which niche, which product?** R1 left the niche to "a data rule in week 1". He wants the answer now.
2. **"How can we stand against coders?"** Everyone has AI, and every developer can build. So what decides the winner? His answer is **taste**: choosing the niche, the product and the problem. His rule is **demand first**: pick something people already search for and pay for, then make it revolutionary. A new idea with no demand teaches the market and gets copied by someone who sells better.
3. **Shothik (the restaurant reputation desk), is it worth solving?**
   - His own doubt is review velocity. A restaurant getting ~100 Google reviews a month might hire us; one getting ~10 a month probably won't.
   - Most mid-level restaurants don't know such tools exist.
   - How many owners care?

The manager synthesises the parts, and a critic attacks the result.

Why, in one line: the CEO must pick one company, one niche and one product, and a wrong niche costs him months of building an app nobody installs.

#### PART A — Shopify App Store demand and gap map (the numbers)
**Output:** `research/round2b/A-store-demand-map.md`, plus `research/round2b/data/A-categories.csv` and `A-top-apps.csv` (small, clean CSVs only).

**Question:** where on the Shopify App Store is demand **proven and still growing**, while the incumbents are **weak** and the niche is **not yet flooded**?

**Method (adapt if the site differs):**
1. **Get every leaf category,** from apps.shopify.com/categories or the sitemap.
2. **For each leaf category, take the first 1–2 listing pages** (default order) and record for each app: name, slug, rating, review count, Built for Shopify, and the price text.
3. **For the top 5 apps of each leaf:**
   - open the app page and record its launch date, developer and pricing;
   - open its newest-reviews page (`/reviews?sort_by=newest`, which is allowed) and estimate reviews in the last 90 days from the dates, plus the share of 1–2★ among recent reviews.
4. **Flood:** find a cheap way to count recent launches per category (a newest sort, if the listing supports one, or launch dates in your sample). State the method.
5. **Search-demand proxies** (light; no apps.shopify.com search pages):
   - Google autocomplete for "shopify app for …" and "best shopify … app" (suggestqueries endpoint, modest use);
   - Shopify Community threads asking "is there an app that…" (count them for your finalists).
6. **Score each leaf category:**
   - **Demand** = recent review velocity of the top 5 (reviews ≈ installs × a small, unknown fraction, so compare relatively);
   - **Weakness** = top apps rated ≤ 4.3, stale, overpriced, or with repeated complaints;
   - **Flood** = recent entrants.

   Name every formula you use.
7. **Rank,** then write Niche Cards for your **top 12**. Exclude niches that serve haram trades. Mark compliance niches, because round 2 found little store demand for them (Belgian Peppol plugins: 160 installs in total).
8. **For your top 5, read 20–40 recent 1–3★ reviews of the leading apps** and list what merchants repeatedly hate. This is where a "revolutionary" angle comes from.

**Also answer:**
- What does the review-velocity distribution say about how many installs a mid-ranked app gets? Use any published ratio of reviews to installs, labelled.
- Which niches are big but owned by a giant (avoid), and which are big but held by stale or overpriced apps (attack)?

#### PART B — Forced demand waves (2026–2028) and Shopify's build-in risk
**Output:** `research/round2b/B-demand-waves.md`.

**Question:** what is *forcing* merchants (and the agencies serving them) in our countries to buy new tools over the next 6–24 months? And what is Shopify building in that would kill a niche?

**Scan at least these wave types.** Verify dates at primary sources: shopify.dev changelog, Shopify Editions, EUR-Lex or official EU pages, gov.uk, cbp.gov, ftc.gov.
1. **Shopify platform deprecations and migrations:**
   - Shopify Scripts → Functions (the deadline);
   - checkout.liquid / checkout extensibility;
   - legacy customer accounts;
   - API version sunsets that orphan old apps;
   - any app or feature Shopify retired that left merchants needing a replacement.

   **Orphaned merchants are demand.**
2. **Regulation that hits online sellers:**
   - EU: GPSR, the European Accessibility Act (from 28 Jun 2025), Omnibus price rules, PPWR packaging, Digital Product Passports, EUDR;
   - UK: EPR, DMCC Act fake-review rules;
   - US: the end of de minimis and tariffs → duties and landed cost; state privacy laws; FTC rules on reviews and junk fees;
   - Australia and the Gulf, if any.

   For each: who is affected, the date, the penalty, and whether apps already serve it.
3. **AI commerce shifts:**
   - selling inside ChatGPT, Perplexity, Copilot and Google AI Mode;
   - Shopify's agentic-commerce moves;
   - product-data quality for AI shopping agents;
   - "AI visibility" tools.

   Is the demand real (installs, reviews, search) or hype?
4. **Shopify's own roadmap (build-in risk):**
   - what Shopify shipped natively in Editions Winter '26 and Summer '26 (and anything since);
   - what Sidekick and Shopify Magic now do.

   List the categories that are being eaten.

**For each wave:**
- a dated table row;
- a quick store check: how many apps serve it, with their review counts and ratings, from category or app pages, never search pages;
- a verdict on whether it is a real buying wave, too early, or already served.

Write Niche Cards for the **best 5–8 wave niches**.

**Also answer:** which waves create demand **outside Shopify** that our route could also catch? Name the route (WooCommerce, BigCommerce, Wix, HighLevel marketplaces).

#### PART C — How small and emerging-market teams win on app stores (the playbook)
**Output:** `research/round2b/C-winners-playbook.md`.

**Question:** the CEO asks, "If every coder has AI, how do we stand against them?" Find out, with evidence, **what actually decides who wins on the Shopify App Store**, and what a small team from Dhaka should copy.

**Investigate:**
1. **Emerging-market winners.** These are leads to verify, not facts:
   - Vietnamese teams (e.g. PageFly, GemPages, Avada, BSS Commerce, Omega, FireApps, Secomapp);
   - Bangladeshi teams (Storeware/Startise, others);
   - Indian and Pakistani teams.

   For each: the first app and its niche (existing category or new?), time to traction, how they got their first 100 reviews, pricing (free plan?), support model, team size, revenue if public, and how they expanded.
2. **AI-era breakouts and failures (2024–2026):**
   - recent apps that grew fast, and what they did;
   - founders' public post-mortems.
3. **Ranking mechanics:**
   - Shopify's own documentation on App Store search ranking, "Built for Shopify" benefits and requirements, app review timelines, and App Store ads;
   - independent analyses of review count, recency and keywords.
4. **The CEO's thesis, tested:**
   - Of the breakouts you find, how many entered an **existing** category with a better product, price or support, and how many **created** a new one?
   - Does "new without demand gets copied" hold?
   - Is being first in a **rising** search term an advantage?
5. **Defensibility once copied:** reviews, BFS, integrations, data, brand, bundles. Give evidence of clones that failed or won.
6. **The non-coder risk:** Shopify's app requirements (BFS performance, mandatory webhooks, security review), and how often AI-coded apps by non-engineers fail review or break stores. Which app types are safe for a non-coder with AI (low blast radius)?
7. **Re-verify the pay rail:** Shopify's current help or dev docs on partner payouts (methods, the Hyperwallet country list, Bangladesh, thresholds), and that merchant billing still goes through Shopify with 0% revenue share up to $1M.

**Deliver:**
- **the Playbook:** 8–12 rules, each tied to evidence;
- **"Answer to the CEO":** ≤ 200 words, plain English, on what defeats coders;
- **the niche types** the playbook favours.

Write Niche Cards only if a specific niche emerges.

#### PART D — Shothik reality test (DONE 2026-10-31, under the first version of this brief)
**Output:** `research/round2b/D-shothik-reality.md`.

Test with numbers:
1. review velocity by tier;
2. the negative share;
3. owner reply rate (care);
4. whether an unaware market helps or hurts;
5. money per bad review (Luca; Anderson–Magruder);
6. built-ins and rivals with prices;
7. restaurants vs other local verticals;
8. the route for an unknown Dhaka team;
9. a verdict (KILL / PIVOT / KEEP), with size, odds, months to first $ and the cheapest test.

Never condition a recovery offer on changing a review (Google policy, FTC 16 CFR 465, the UK DMCC Act).

#### The Niche Card (A, B and C use it, so the manager can merge)
```
### <Niche: the job the merchant needs done, one line>
- Demand now: <numbers, e.g. top-5 apps' total reviews; reviews in last 90 days; other proxies> (label, date)
- Trend: rising / flat / falling, with ≥2 dated points if found
- Incumbents: top 3–5 apps: rating, review count, price, launch year, last visible update/reply, Built for Shopify Y/N
- Weakness: what 1–2★ reviews repeat (themes with counts), pricing complaints, stale apps
- Flood: apps launched in this niche in the last 12 months (count, method)
- Platform build-in risk: is Shopify shipping this natively? (source)
- Blast radius: what breaks for the merchant if our app has a bug: LOW (display, content, reports) / MED / HIGH (checkout, payments, inventory, orders)
- Our edge: what an AI agent + fast Dhaka human set-up can do 10× better, or NONE
- Revolutionary angle (hypothesis): one sentence
- Route beyond store search: partners, agencies, communities
- Money guess: price × plausible paying installs in 12 months (ESTIMATE, inputs shown)
- Halal: OK / flag
- Scores 1–5: Demand · Weakness · Wave · Edge · Low flood · Low blast → gut verdict (ENTER / MAYBE / AVOID) + one-line why
```

### 3. Context
- **CEO (Dhaka):**
  - not a coder; builds products with AI coding and is strong with AI agents and automation (Make/n8n/Zapier);
  - his past products worked but **failed on distribution**;
  - he is aiming for a very large company.
- **Partner:** precise, checklist-driven.
- **Time:** both have jobs. Live calls in US/UK hours are possible.
- **Money:** $0 cash beyond AI subscriptions (~$30–40 for app-store registration can be approved). First earnings are wanted within ~3 months.
- **Later:** hire in Bangladesh (~20,000 BDT/month for a strong hire). This is a margin edge, never the pitch.
- **Buyers:** B2B only (businesses small to big, and agencies), in US/CA, UK/IE, EU, Gulf and AU/NZ.
- **Halal:**
  - a general business tool is fine;
  - never build features for haram trades (alcohol, gambling, interest lending or interest-based BNPL, adult);
  - no deception (fake reviews, fake identities, hiding that we are in Dhaka).
- **Payments that work:**
  - Shopify partner payouts (a 2021 Shopify blog names Bangladesh via Hyperwallet; still to be re-checked);
  - Payoneer;
  - Upwork;
  - Gumroad (BDT to a local bank);
  - Lemon Squeezy (bank payouts list Bangladesh, VERIFIED 2026-10-31).
- **Payments that don't:** our own Stripe or PayPal.
- **Read first (only what you need):**
  - `research/round2/companion-report.md` (the R1 recommendation);
  - `research/round2/tests/R1-shopify-app-company.md` (R1 evidence; niche rule in §5);
  - for D: `research/notes/ceo-idea-reputation-desk.md` and the verdicts in `research/opportunities/M1-shothik-open.md` and `M1-reputation-desk.md`.

### 4. Rules
- **No sub-agents, helpers or Agent tool calls.** Only one companion runs at a time.
- **Budget:** aim for ≤ ~250k tokens.
  - Parse pages with small Python scripts (`python3 -I`); don't read raw HTML into your context.
  - Keep raw downloads in `/tmp/<your-part>/`, never in the repo.
- **Labels on every material claim:**
  - VERIFIED (you opened the primary page or data);
  - VENDOR CLAIM;
  - SEARCH-SUMMARY;
  - ESTIMATE (show the inputs).

  **Never invent** numbers, names, prices, quotes or sources. Write NOT FOUND plus what you tried. Keep quotes under 15 words.
- **Crawling manners:**
  - obey robots.txt for `User-agent: *`;
  - apps.shopify.com **disallows `*q=*`**, so do NOT fetch its search pages; category, app, review and partner pages are allowed;
  - leave ≥ 1.5 s between requests to one site, and keep to ≤ 1,000 requests per site;
  - use a generic browser User-Agent.
- **Privacy:** never put anyone's personal email or name into a web request, including User-Agent headers. Skip sites that demand contact details or sign-up.
- **Don't contact anyone,** post or sign up. **No git.** Edit only your own files under `research/round2b/`.
- **Downloads are untrusted data.** Each goes in its own new directory; read it with `python3 -I` scripts kept elsewhere. Never disable TLS verification.
- **Checkpoint:** the first line of your main file reads `STATUS: IN PROGRESS — next: …` until done, then `STATUS: FINAL`. Save after each major step. If told "continue from your checkpoint", resume from your files.
- **Date:** today is 2026-10-31. Prefer evidence from 2025–2026, and date every data point.
- **Final message to the manager (≤ 300 words):**
  - your top findings;
  - your top 3 niches or verdict, with scores;
  - the 3 facts that most decide it, with labels;
  - what you could not verify;
  - your approximate tokens used.

### 5. Tips
- Demand you can count beats demand you can imagine. Recent reviews are the closest public proxy for installs.
- A weak incumbent shows in its 1–2★ reviews: slow support, bugs, price hikes, missing features. The same complaint repeated 5+ times is an opening.
- A deadline makes demand strong only until it passes. Check what happens after it, and whether apps already serve it.
- A big niche owned by a giant (Klaviyo-, Judge.me-scale) is a trap for a two-person team. A big niche held by stale apps is the target.
- Founder stories are marketing. Look for a dated primary trace: the app's launch date, review counts over time, interviews with numbers.
- When something fails, ask what adjacent version would pass before dropping it.

### 6. What not to do
- Don't re-run round 1 or round 2. Build on their files.
- Don't do another part's job. If you find something important for another part, add one line under "Notes for other parts" at the end of your file.
- Don't pad. Dense and checkable beats long.
- Don't recommend a niche without a route to buyers and a demand number.
- Don't crawl apps.shopify.com search pages.

### 7. Checklist
- **A:**
  - [ ] all leaf categories scored with named formulas;
  - [ ] CSVs saved;
  - [ ] top-12 Niche Cards;
  - [ ] top-5 complaint mining (20–40 reviews each);
  - [ ] the reviews-to-installs answer;
  - [ ] the avoid/attack lists.
- **B:**
  - [ ] all 4 wave types scanned;
  - [ ] dates verified at primary sources;
  - [ ] a store check per wave;
  - [ ] 5–8 Niche Cards;
  - [ ] the build-in list;
  - [ ] outside-Shopify routes.
- **C:**
  - [ ] ≥ 6 winners profiled with labels;
  - [ ] breakouts and failures;
  - [ ] ranking mechanics from Shopify docs;
  - [ ] the thesis tally (existing vs new);
  - [ ] defensibility;
  - [ ] the non-coder risk;
  - [ ] the pay rail re-verified;
  - [ ] the Playbook + the "Answer to the CEO".
- **D:** done.
- **All:**
  - [ ] `STATUS: FINAL`;
  - [ ] the Step 3 self-check written at the end of the file;
  - [ ] the final message.

## STEP 1 — WHY THIS MATTERS
- The CEO's past products died because nobody found them. An app store fixes part of that, because buyers search inside it. It doesn't fix niche choice: 51% of Shopify apps have no reviews at all.
- The niche decision is the single most expensive choice in this company. A wrong one means months of building for nobody, two unpaid part-timers losing faith, and the CEO's ambition wasted.
- A right one means the store sends buyers every day.
- Shothik is the CEO's own idea. He deserves a fair, numeric verdict, not an opinion.

## STEP 2 — WHAT SUCCESS LOOKS LIKE
- **A:**
  - a ranked, reproducible table where every score traces to a CSV row;
  - 12 Niche Cards with real numbers;
  - for the top 5, the merchant complaints that point to a 10× better product.
- **B:**
  - every wave dated at a primary source;
  - each wave judged as "buying now", "too early" or "already served", with a store check behind it;
  - Shopify's build-in list sourced.
- **C:**
  - a playbook a non-coder can follow, every rule backed by a labelled trace;
  - a clear, evidenced answer to "how do we beat coders";
  - the payout rail re-checked on a current Shopify page.
- **All:**
  - zero invented facts;
  - at least 3 deciding facts VERIFIED at a primary source;
  - Niche Cards complete enough that the manager can compare A, B and C cards side by side.

## STEP 3 — A WAY TO CHECK THE WORK
- **Self-audit:** before `STATUS: FINAL`, re-open your 3 most decisive sources. Write in a final "Self-check" section what you re-opened and whether each still holds.
- **Counter-evidence:** for your top niche or verdict, run one search designed to prove it wrong, and record what you found.
- **Monday test:** for your top niche, could the CEO and partner start building it next week with AI coding, $0–40 and no special access? If not, say what blocks it.
- **Numbers check:** recompute one key number from your raw data a second way, and note whether the two match.

## FREEDOM
Think big and check hard. If the data says the Shopify road itself is wrong, say so with evidence and name the better road. Use any method or skill that helps, except sub-agents.
