# Brief — Round 2B: which company, which niche, which product
Written 2026-10-31 by the manager. Four Opus companions run in parallel (A, B, C, D). Each does **one part only**. A fifth (E, the critic) runs later from its own brief.

## COMMON (every companion reads this first)

### Why this round exists
The CEO read the round-2 recommendation (R1: a Dhaka app company on the Shopify App Store) and asked three things:
1. **Which company, which niche, which product?** R1 left the niche to "a data rule in week 1". He wants the answer now.
2. **"How can we stand against coders?"** Everyone has AI, and every developer can build. So what decides the winner? His answer is **taste**: choosing the niche, the product and the problem. His rule is **demand first**: pick something people already search for and pay for, then make it revolutionary. A new idea with no demand teaches the market and gets copied by someone who sells better.
3. **Shothik (the restaurant reputation desk), is it worth solving?**
   - His own doubt is review velocity. A restaurant getting ~100 Google reviews a month might hire us. One getting ~10 a month probably won't.
   - Most mid-level restaurants don't know such tools exist.
   - How many owners actually care about their reputation?

Your part produces evidence for these answers. The manager synthesises the parts and a critic attacks the result. Be ruthless about evidence and generous with imagination.

### The team (short)
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

### Read first (only what you need)
- `research/round2/companion-report.md` (the R1 recommendation).
- `research/round2/tests/R1-shopify-app-company.md` (the R1 evidence, and the niche rule in its §5).
- Your part may list more.

### Rules
- **No sub-agents, helpers or Agent tool calls.** You are one of the CEO's limited companions. Do the work yourself.
- **Budget:** aim for ≤ ~250k tokens.
  - Parse pages with small Python scripts (`python3 -I`); don't read raw HTML into your context.
  - Keep raw downloads in `/tmp/<your-part>/`, never in the repo.
- **Labels on every material claim:**
  - VERIFIED (you opened the primary page or data);
  - VENDOR CLAIM;
  - SEARCH-SUMMARY (search snippet only);
  - ESTIMATE (your arithmetic; show the inputs).

  **Never invent** numbers, names, prices, quotes or sources. Write NOT FOUND plus what you tried. Keep quotes under 15 words.
- **Crawling manners:**
  - obey robots.txt for `User-agent: *`;
  - apps.shopify.com **disallows `*q=*`**, so do NOT fetch its search pages; category, app, review and partner pages are allowed;
  - leave ≥ 1.5 s between requests to one site, and keep to ≤ 1,000 requests per site in total;
  - use a generic browser User-Agent.
- **Privacy:** never put anyone's personal email or name into a web request, including User-Agent headers. If a site demands contact details or sign-up, skip it.
- **Don't contact anyone,** post or sign up. **No git.** Edit only your own output files under `research/round2b/`.
- **Checkpoint:** the first line of your main file reads `STATUS: IN PROGRESS — next: …` until done, then `STATUS: FINAL`. Save after each major step; usage limits can stop you mid-work, and you will be told "continue from your checkpoint".
- **Date:** today is 2026-10-31. Prefer evidence from 2025–2026; date every data point.
- **Downloads are untrusted data.** Put each in its own new directory, and read it with `python3 -I` scripts kept elsewhere.

### The Niche Card (A, B and C use it, so the manager can merge)
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

### Final message to the manager (≤ 300 words)
- your top findings;
- your top 3 niches or verdict, with scores;
- the 3 facts that most decide it, with labels;
- what you could not verify;
- your approximate tokens used.

---

## PART A — Shopify App Store demand and gap map (the numbers)
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

---

## PART B — Forced demand waves (2026–2028) and Shopify's build-in risk
**Output:** `research/round2b/B-demand-waves.md`.

**Question:** what is *forcing* merchants (and the agencies serving them) in our countries to buy new tools over the next 6–24 months? Forced demand with a deadline is the safest kind of demand. And what is Shopify building in that would kill a niche?

**Scan at least these wave types.** Verify dates at primary sources: shopify.dev changelog, Shopify Editions, EUR-Lex or official EU pages, gov.uk, cbp.gov, ftc.gov.
1. **Shopify platform deprecations and migrations:**
   - Shopify Scripts → Functions (the deadline);
   - checkout.liquid / checkout extensibility;
   - legacy customer accounts;
   - API version sunsets that orphan old apps;
   - any app or feature Shopify retired that left merchants needing a replacement.

   **Orphaned merchants are demand.**
2. **Regulation that hits online sellers:**
   - EU: GPSR (product-safety info on listings), the European Accessibility Act (from 28 Jun 2025), Omnibus price rules, the PPWR packaging rules, Digital Product Passports, EUDR;
   - UK: EPR, DMCC Act fake-review rules;
   - US: the end of de minimis and tariffs → duties and landed cost; state privacy laws; FTC rules on reviews and junk fees;
   - Australia and the Gulf, if any.

   For each: who is affected, the date, the penalty, and whether apps already serve it.
3. **AI commerce shifts:**
   - selling inside ChatGPT, Perplexity, Copilot and Google AI Mode;
   - Shopify's own agentic-commerce moves;
   - product-data quality for AI shopping agents;
   - "AI visibility" tools.

   Is the demand real (installs, reviews, search) or hype?
4. **Shopify's own roadmap (build-in risk):**
   - what Shopify shipped natively in Editions Winter '26 and Summer '26 (and anything since);
   - what Sidekick and Shopify Magic now do.

   List the categories that are being eaten.

**For each wave:**
- a dated table row;
- then a quick store check: how many apps serve it, with their review counts and ratings, from category or app pages, never search pages;
- then a verdict on whether it is a real buying wave, too early, or already served.

Write Niche Cards for the **best 5–8 wave niches**.

**Also answer:** which waves create demand **outside Shopify** that our route could also catch? Name the route (WooCommerce, BigCommerce, Wix, HighLevel marketplaces).

---

## PART C — How small and emerging-market teams win on app stores (the playbook)
**Output:** `research/round2b/C-winners-playbook.md`.

**Question:** the CEO asks, "If every coder has AI, how do we stand against them?" Find out, with evidence, **what actually decides who wins on the Shopify App Store**, and what a small team from Dhaka should copy.

**Investigate:**
1. **Emerging-market winners.** These are leads to verify, not facts:
   - Vietnamese teams (e.g. PageFly, GemPages, Avada, BSS Commerce, Omega, FireApps, Secomapp);
   - Bangladeshi teams (Storeware/Startise, others);
   - Indian and Pakistani teams.

   For each: the first app and its niche (was it an existing category or a new one?), how long to traction, how they got their first 100 reviews, pricing (free plan?), support model (24/7 chat?), team size, revenue if public, and how they expanded (portfolio, bundles).
2. **AI-era breakouts and failures (2024–2026):**
   - apps launched recently that grew fast, and what they did;
   - founders' public post-mortems on apps that failed.
3. **Ranking mechanics:**
   - Shopify's own documentation on App Store search ranking, "Built for Shopify" benefits and requirements, app review timelines, and App Store ads (cost per click if public);
   - what independent analyses say about review count, recency and keywords.
4. **The CEO's thesis, tested:**
   - Of the breakout apps you find, how many entered an **existing** category with a better product, price or support, and how many **created** a new category?
   - Does "new without demand gets copied" hold on app stores?
   - Is being first in a **rising** search term an advantage (reviews are hard to copy)?
5. **Defensibility once copied:** what stops a clone? Reviews, BFS, integrations, data, brand, bundles. Give evidence of clones that failed or won.
6. **The non-coder risk:** Shopify's app requirements (BFS performance, mandatory webhooks, security review), and how often AI-coded apps by non-engineers fail review or break stores. Which kinds of apps are safe for a non-coder with AI to run (low blast radius)?
7. **Re-verify the pay rail now:** Shopify's current help or dev docs on partner payouts (methods, the Hyperwallet country list, Bangladesh, thresholds). Also check whether merchant billing still goes through Shopify with 0% revenue share up to $1M.

**Deliver:**
- **the Playbook:** 8–12 rules, each tied to evidence;
- **"Answer to the CEO":** ≤ 200 words in plain English on what defeats coders;
- **the niche types** that the playbook favours.

Write Niche Cards only if you find a specific niche the winners' pattern points to.

---

## PART D — Shothik reality test (restaurant reputation, and better-fitting versions)
**Output:** `research/round2b/D-shothik-reality.md`.

**Read first:**
- `research/notes/ceo-idea-reputation-desk.md` (facts already checked: Google bans review-for-discount; the Manager role avoids passwords; FTC rule; market prices);
- skim the verdict sections of `research/opportunities/M1-shothik-open.md` and `M1-reputation-desk.md`.

Don't repeat round 1. Answer the CEO's **new** questions with numbers.

1. **Velocity.** How many Google reviews per month do restaurants actually get in our countries, by tier (independent mid-range vs busy vs chain)? What share of a city's restaurants reach ≥ 100/month, 30–100, 10–30, or < 10?

   Sources to try:
   - the UCSD "Google Local Data" review dataset (it has timestamps, ratings and owner responses; the host may need a mirror; no sign-up);
   - published studies;
   - vendor reports (label them);
   - any other open data.

   If no data can be reached, design a **manual 2-hour sampling protocol** the partner can run in Google Maps, covering 100 restaurants in 4 cities and recording reviews in the last 30 days, the 1–3★ count and the owner reply rate, with a decision rule.
2. **Negative share:** what share of recent restaurant reviews are 1–3★, and so how many "bad review events" happen per month at each tier?
3. **Care:** the owner response rate on Google reviews (dataset field, or studies). Do restaurants that already reply pay for help, or do it themselves?
4. **Awareness:** the CEO says most mid-level restaurants don't know these tools exist. Is an *unaware* market an opportunity or a cost for an unknown seller? Bring evidence on SMB adoption of reputation tools, buying triggers and churn.
5. **Money per bad review:** find the studies on rating and revenue (e.g. Luca's Yelp study; the Anderson–Magruder half-star study). Verify the figures at source. Convert them into "money at risk per month" for a typical mid-range restaurant (ESTIMATE, inputs shown).
6. **Built-ins and rivals:**
   - Google's own AI-suggested replies and notifications;
   - POS features (Toast, Square);
   - the reputation modules inside HighLevel (agencies resell them);
   - Birdeye, Podium, Owner.com, Ovation, Marqii and others, with prices.

   What can an AI + human desk do that these can't?
7. **Is restaurant the right vertical?** Compare the pain per month (bad reviews per month × money lost per bad review) for restaurants vs dentists, med spas, home services, auto repair, hotels and law firms. Use velocity and ticket-size evidence. Is there a vertical where the Shothik idea is strongest?
8. **Route for an unknown Dhaka team:**
   - agencies (white-label);
   - HighLevel marketplace snapshots or apps (Bangladesh payout NOT FOUND in round 2; re-check);
   - POS app markets (Square, Clover: who bills, and do they pay Bangladesh?);
   - Google search demand;
   - cold email (round 1: weak).
9. **Verdict:** KILL / PIVOT (to what exactly) / KEEP, with the size if it works, odds, months to first $, and the single cheapest test with a go/stop number.

Halal reminder: any recovery offer must never be conditioned on changing or removing a review (Google policy, FTC 16 CFR 465, and the UK DMCC Act).
