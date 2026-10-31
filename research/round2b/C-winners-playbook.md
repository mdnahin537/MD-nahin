STATUS: FINAL

# Part C — How small and emerging-market teams win on the Shopify App Store (the playbook)
Written 2026-10-31 by Companion C (Round 2B), the "founder who built apps from an emerging market" seat. No sub-agents used. Raw downloads are in /tmp/partC/ (not in the repo). Evidence notes with every source are in the **Appendix** at the end.
Labels: VERIFIED (primary page or data opened) · VENDOR CLAIM · SEARCH-SUMMARY (search snippet only) · ESTIMATE (my arithmetic, inputs shown) · NOT FOUND.
Access limits this session: help.shopify.com sits behind a Cloudflare challenge (HTTP 403 with curl; WebFetch cannot resolve Shopify hosts). Shopify facts come from shopify.dev, shopify.com/partners and the official developer forum (curl). apps.shopify.com search pages were never fetched. I fetched about 80 apps.shopify.com pages with a gap of ≥ 3 s between them.

---

## 0. Answer to the CEO: what defeats coders (≤ 200 words)
Coders can copy any feature within weeks. In 2026 one developer reported a 1:1 clone of his listing, with zero reviews, ranking #1 above his own. Eleven apps appeared in six weeks for one new EU rule. So code is not the moat, and neither is a new idea: of the 19 winners I traced, **18 entered a category that already existed, and the 19th rode an EU deadline**. None invented demand.

Three things decide the winner, and none of them is code:
1. **Taste in where to stand.** Pick a searched, existing job with a weak or stale incumbent, or get there 3–6 months before a dated platform or legal change.
2. **Trust earned by hand.** About 2 in 3 winning reviews mention support. The breakout of 2025 (REZ, Hanoi) reached out to new installs within hours and set up their widget for them.
3. **Speed to the badges that copy-cats lack.** Built for Shopify needs 50 paid installs and 5 reviews, and a review history takes months to build.

So yes: taste first. But taste only chooses the battlefield. Hand-holding and timing win it, and a Dhaka team can supply both at US night-time.

---

## 1. The Playbook: 12 rules, each tied to evidence
| # | Rule | Evidence (label) |
|---|---|---|
| 1 | **Enter an existing, searched category. Never invent one.** | 18 of 19 winners traced entered an existing category; the 19th (EU withdrawal button) was created by an EU deadline, not by the founder (VERIFIED listings, §5). 2026 newcomers with invented or invisible problems stall: a free 404-fixer ("merchants don't know" they have the problem) and an AI quiz app that can't reach page 1 (VERIFIED forum posts, self-reports). |
| 2 | **Make support the review engine.** Contact every install within hours, set it up for them, and ask for a review neutrally once it works. | On the page holding each flagship's ~100th review, 80 of 110 reviews mention support (73%); on the newest page, 65 of 97 do (67%). Part A: 59% of 2,296 recent 5★ reviews (VERIFIED, regex counts). REZ's earliest reviews describe a named agent who messaged them unprompted and styled the popup; the median time using the app at review is under 1 day (VERIFIED). |
| 3 | **Never incentivise a review.** Use Shopify's Reviews API and neutral wording. | On 2026-07-06 Shopify announced it will remove "a significant portion" of reviews from apps that incentivise, and began unpublishing untrusted reviews across the store (VERIFIED shopify.dev blog). Also halal: no deception. |
| 4 | **Free plan plus a cheap first tier, and a price wedge against the leader.** | 16 of 16 flagships and breakouts have a free plan or are free (VERIFIED listings). REZ starts at $4.99/mo (Part A CSV). Appstle charged no per-transaction fee while ReCharge and Bold did (VENDOR CLAIM). |
| 5 | **Be early to a dated wave: 3–6 months before the deadline, not after. Leave before Shopify builds it in.** | EU withdrawal button: launched 2026-01-09, five months before the 2026-06-19 deadline, and now has 2,320 reviews. A strong Vietnamese portfolio's late copy (MIDA/BSS) has 2 (VERIFIED). Appstle hit 100 reviews in ~2 months as subscriptions opened up in 2021 (review dates VERIFIED). Part B: GPSR apps launched after Shopify's native feature have 0 reviews. |
| 6 | **Attack weak incumbents, including Shopify's own weak apps.** | RF Barcode Labels (launched 2025-10-24, free) has 626 reviews; Shopify's own barcode app is rated 2.3★ (VERIFIED by me and by Part A). |
| 7 | **Treat BFS as the one ranking lever you control. Plan for it from day 1.** | BFS apps "appear higher" in search, get a badge, a search filter and priority review for future apps. Prerequisites: ≥ 50 net paid installs, ≥ 5 reviews, a minimum recent rating, LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms, and a Lighthouse drop of ≤ 10 points (VERIFIED shopify.dev). 15 of 16 traced winners are BFS (VERIFIED). |
| 8 | **Build a portfolio around one engine or one buyer. Each app must do a distinct job.** | Omega: one pixel engine, one app per ad network (9 apps, 7 BFS). CedCommerce: one app per marketplace (14 apps; Etsy 1,249, Amazon 1,170, eBay 920 reviews). DevIT: 5 apps, all 5.0. BSS launched a new brand, MIDA (Replay 620, Fraud 567) (VERIFIED partner pages). The Partner Agreement bans multiple apps offering "substantially the same services" (VERIFIED). |
| 9 | **Budget for a slow ramp. Judge yourself on installs and paying merchants, not reviews, in the first 6 months.** | Months from launch to ~100 surviving reviews: AI-era breakouts 4–8 (median ~5); older flagships 2–89 (median ~18). Storeware's StoreSEO took ~30 (VERIFIED dates; deleted reviews make these late bounds). A zero-review app gets about 0–2 organic installs a week (SEARCH-SUMMARY, Indie Hackers). |
| 10 | **Only build low-blast-radius apps until the team has a real engineer.** | Shopify requires GraphQL only, OAuth first, no 404/500 errors, TLS with expiring tokens, Billing API, set-up screencasts and three mandatory privacy webhooks (VERIFIED). Platform changes force rework: script tags stop running on 2027-03-01, and non-expiring tokens fail on 2027-01-01 (Part B, VERIFIED). See §7. |
| 11 | **Pass review on the first try.** Run Shopify's AI self-review, fix everything, then submit once. | Staff, 2026-02-26: "more of your submissions than ever", so reviews take longer, and resubmitting sends you to the back of the queue. Staff, 2026-04-20: AI self-review and a review dashboard launched; resubmitting opens only after every flagged issue is fixed (VERIFIED, community.shopify.dev). |
| 12 | **Keep shipping and keep asking: rank follows recent momentum, so leaders can be caught.** | Shopify search weighs merchant behaviour after a search and lifts "smaller trending apps" (SEARCH-SUMMARY, Shopify Partner blog). Even REZ's pace fell from ≈ 5.5 to ≈ 1.9 reviews a day between July and October 2026 (VERIFIED). A zero-review clone outranked a BFS original in 2026-09 (forum self-report). |

---

## 2. Emerging-market winners, profiled (≥ 6)
Listing facts are VERIFIED (apps.shopify.com pages, 2026-10-31). "Months to ~100" is measured from the launch date to the date of the 100th-oldest **surviving** review. Shopify's 2026 review purge makes it a late bound. "Existing" means the category had incumbents when the app launched.

| Team (origin by listing address) | Flagship and niche | Existing or new | Launched → ~100 reviews | Reviews now | Pricing | Support signal | Expansion | Team size / revenue |
|---|---|---|---|---|---|---|---|---|
| **PageFly** (Hanoi, VN) | page builder | existing (Shogun etc.) | 2017-09 → 2018-09 (~12 mo) | 5,916, 4.9, BFS | free plan; up to $990/yr | 7 of 10 early reviews mention support | 2 apps (2nd has 0 reviews) | NOT FOUND ("90,000+ merchants", SEARCH-SUMMARY) |
| **GemPages / GEMCOMMERCE** (Hanoi) | page builder | existing | 2017-03 → 2018-04 (~13 mo) | 4,272, 4.9, BFS | free plan | 7/10 | 2 apps (GemX CRO 27) | NOT FOUND |
| **Avada** (Hanoi) | PDF invoices (today's top app) | existing | 2019-12 → 2020-12 (~12 mo) | 711, 4.9, BFS | free; $150–482/yr | 6/10 | 5 apps listed now (2 with 0 reviews) | NOT FOUND ("350,000 merchants", SEARCH-SUMMARY) |
| **BSS Commerce** (Ha Noi) | B2B wholesale pricing | existing | 2020-09 → 2022-03 (~18 mo) | 1,200, 4.9, BFS | free; $313–1,069/yr | 9/10 | new brand MIDA (Replay 620, Fraud 567), listed from Singapore | NOT FOUND |
| **Omega** (Ha Noi) | Facebook pixel / CAPI | existing | 2020-01 → 2022-05 (~29 mo) | 1,002, 4.9, BFS | free; to $120/mo | 7/10 | 9 apps, one per ad network | NOT FOUND |
| **FireApps** (HCM City) | review importer (Ali Reviews) | existing (Loox etc.) | 2017-03 → 2020-09 (~42 mo; old reviews likely purged) | 1,445, 4.8, BFS | free; $134–450/yr | 5/10 | 1 app listed now | NOT FOUND |
| **Storeware** (Bangladesh, part of Startise/WPDeveloper per R1; listing shows a US address) | SEO | existing, crowded | 2021-10 → 2024-04 (~30 mo) | 772, 5.0, BFS | free; $39/mo | 7/10; EasyFlow median 1 day using | 6 apps, all BFS; EasyFlow (2023) reached ~100 in ~9 mo | parent "6M+ users" (R1, VERIFIED news) |
| **Appstle** (HQ Menlo Park CA; "offices in Canada and India", VENDOR CLAIM; Indian origin NOT VERIFIED) | subscriptions | existing (ReCharge, Bold) | 2021-04 → 2021-06 (**~2 mo**) | **9,160**, 5.0, BFS | free; $96/yr up to enterprise | 6/10; "24x7x365" (VENDOR CLAIM) | founders' earlier apps were sold (VENDOR CLAIM) | NOT FOUND |
| **CedCommerce** (India per SEARCH-SUMMARY; listing shows Sheridan WY, US) | Etsy sync | existing | 2018-09 → 2020-06 (~21 mo) | 1,249, 4.5, BFS | free; $9/mo… | 9/10 | 14 apps, one per marketplace | NOT FOUND |
| **Webkul** (Noida, IN) | multi-vendor marketplace | existing | 2015-04 → 2022-09 (~89 mo) | 363, 4.7, **not BFS** | free; $15/mo | 9/10 | 24 apps, only 680 reviews in total: breadth without depth | NOT FOUND |
| Secomapp (VN) | — | — | — | partner page shows "0 apps" | — | — | — | NOT FOUND |
| Pakistan, and other BD teams | — | — | — | none with a large footprint found (one search each) | — | — | — | NOT FOUND |

**What the profiles say:**
- **Every flagship entered an existing category (11 of 11), and all have a free plan.** VERIFIED.
- **Speed is not the pattern; persistence plus support is.** The median time to ~100 surviving reviews is ~18 months. The fast cases had a timing edge (Appstle and the 2021 subscription wave) or an experienced team (Storeware's second app took 9 months versus 30 for its first). ESTIMATE from VERIFIED dates.
- **Breadth without depth fails.** Webkul has 24 apps, 680 reviews in total and no BFS. Omega and CedCommerce instead reuse one engine across channels, and their apps score 4.5–4.9 with hundreds of reviews. VERIFIED.
- **A US address on the listing is common for emerging-market teams** (Storeware, CedCommerce, Appstle, Retail Force). This is normal Partner practice, but the halal rule says never hide that we are in Dhaka: use the real address or say "team in Dhaka" on the website.

---

## 3. AI-era breakouts and failures (2024–2026)
**Breakouts.** All VERIFIED on listing and review pages. Leads came from Part A and the manager.

| App | Launched | ~100 reviews | Now | Entry | What it did |
|---|---|---|---|---|---|
| **REZ Preorder, Back In Stock** (REZ Commerce, Dong Da, Hanoi; a 2-app partner) | 2025-05-26 | 2025-10-14 (4.6 mo) | 1,638, 5.0, BFS | existing and crowded (pre-orders / back-in-stock) | **Concierge onboarding:** messages new installs within hours and styles the widget for them; reviews written ~0.2–0.8 days after install; free plan and $4.99 entry tier; listing in 7+ languages. Pace: ≈ 25/mo in months 1–4, ≈ 130–160/mo Jan–Jun 2026, peak ≈ 5.5/day Jul–Aug, ≈ 1.9/day Sep–Oct 2026. Its second app (bundles) has only 16 reviews, so the formula does not transfer automatically. |
| MIDA Fraud Filter (BSS Commerce's new brand) | 2025-09-19 | 2026-05-12 (7.8 mo) | 567, BFS | existing (fraud/bots) | a known portfolio team launching under a new brand |
| RF Barcode Labels (Retail Force / Order Editing.app) | 2025-10-24 | 2026-05-03 (6.3 mo) | 626, 5.0, BFS | existing; Shopify's own app 2.3★ | free, attacking a weak incumbent |
| Lably (DevIT, 5 apps, all 5.0) | 2024-08-09 | 2025-01-12 (5.1 mo) | 672, BFS | existing (badges) | portfolio team |
| EW EU Withdrawal Button (401layers, DE) | 2026-01-09 | 2026-05-13 (4.1 mo) | 2,320, BFS | new sub-category forced by EU law | 5 months early |
| Shopify Build Awards 2026 (dated 2026-07-22): Discount Kit (98), Easyteam POS (328), Smile (4,653) | — | — | — | all existing | rewarded for deep native integration (Functions, POS) |

**Failures and stalls (2026).** Self-reported, VERIFIED that the posts exist:
- A free 404-fixer: nobody searches for a problem they can't see.
- An AI quiz generator: "nothing brings my app" onto page 1.
- A $119/mo app with 0 reviews after 3 weeks went free (SEARCH-SUMMARY).
- Mantle, a tool for Shopify app developers, failed: the market was tiny, and Shopify's own tooling erased its wedge (SEARCH-SUMMARY).

The common thread: **no existing search demand, or a buyer Shopify itself serves.** I found no full founder post-mortem with numbers (NOT FOUND after 2 searches).

---

## 4. Ranking mechanics
**What Shopify itself says (VERIFIED on shopify.dev unless noted):**
- BFS apps rank higher in search, get a badge on every app card, a BFS search filter, eligibility for homepage and admin "Picked for you" slots (not exclusive to BFS), and priority review for later apps.
- **BFS bar:** ≥ 50 net installs from paid-plan shops; ≥ 5 reviews; a minimum *recent* rating (threshold unpublished); admin LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms at the 75th percentile; storefront Lighthouse drop ≤ 10 points; checkout calls p95 ≤ 500 ms. Failing the same criterion 3 times suspends the application for 3 months. BFS status is re-reviewed every year.
- **Listing:** pick accurate categories (up to 25 structured features each); a free plan shows "Free plan available" in search; no keyword stuffing; set install-eligibility rules to avoid bad-fit reviews; the listing is auto-translated, including search terms.
- **Search algorithm:**
  - folds in "how merchants interact with results after they search";
  - a built-in mechanism lifts "smaller trending apps";
  - rankings vary day to day.

  SEARCH-SUMMARY: the Shopify Partner blog returned HTTP 429. The formula is unpublished.
- **Ads:**
  - pay per click, priced by first-price auction (you pay your bid);
  - relevance lowers the cost;
  - three surfaces: search, category and homepage;
  - the doc's worked example is a $0.50 click.

  A real average cost per click: NOT FOUND.
- **Review queue (2026):** a flood of submissions. In January 2026 developers waited a month or more against a posted 8–10-day target (forum). The AI self-review tool has been live since 2026-04-20 (VERIFIED staff posts).

**Independent analyses (VENDOR CLAIM, AppJubilee, which sells rank tracking):**
- the app name and subtitle carry the most keyword weight;
- recent review pace beats lifetime totals;
- install velocity and uninstall rate matter;
- ~584 launches a month.

**Implication:** reviews and BFS lift **conversion and rank**, but rank is momentum-driven. That helps a newcomer and also helps a clone.

---

## 5. The CEO's thesis, tested
**Tally (existing category vs new):** 11 emerging-market flagships, 5 AI-era breakouts and 3 Build Award winners.
- **18 entered an existing category with a better product, price or support.**
- **1 entered a new sub-category, and the demand was forced by EU law with a date** (EW withdrawal button).
- **0 created a category from the founder's own idea.** VERIFIED listings.
- *Bias:* I sampled survivors, found mostly through category pages. Invented-category apps that died are invisible by construction. The 2026 stall posts (404-fixer, quiz app) are the only traces of that group, and they support the rule.

**Does "new without demand gets copied" hold?** Partly, and the sharper version is worse: **new without demand doesn't even get found.**
- When demand *is* new and real, copies arrive within weeks. Part B counted ≥ 11 apps in 6 weeks for the EU guarantee notice, and 1:1 listing clones appeared in 2026 (forum).
- Copies lose when the first mover has a head start in reviews. MIDA's late withdrawal button has 2 reviews against EW's 2,320 (VERIFIED).

**Is being first in a rising search term an advantage?** **Yes, if you arrive before the peak and before Shopify builds it in.**
- EW: 5 months early → 2,320 reviews. Apps launched near the deadline have 1–5 (Part B, VERIFIED).
- Appstle: arrived as subscription demand opened → #1 within 6 months (VENDOR CLAIM; 100 reviews in ~2 months VERIFIED).
- **No**, if Shopify ships a native feature: GPSR and AI-visibility apps sit near 0 (Part B, VERIFIED).
- Waves fade after the deadline. EW fell from ~112 to ~17 reviews a month (Part A).

**Verdict on the thesis:** "Demand first, then make it revolutionary" is **supported**. Refine it: **demand first, arrive early or attack a weak incumbent, then win on hand-holding.** In this data, "revolutionary" means a better service or price, not a new category.

---

## 6. Defensibility once copied: what actually stops a clone
| Moat | Holds? | Evidence |
|---|---|---|
| Review count | **Partly.** It protects conversion, not rank | Rank weighs recent momentum, and a zero-review clone ranked #1 above a BFS original (forum, 2026-09). Late copies of EW reached only 2 reviews (VERIFIED), so a big review lead plus continued momentum does hold. |
| BFS | **Yes, for months** | A clone needs 50 paid installs, 5 reviews and passing performance numbers before it can apply (VERIFIED). Part A: 67% of top-5 apps are BFS. |
| Support relationships / set-up | **Yes** | 59–73% of reviews cite support (VERIFIED counts). A clone can copy the listing but not the people. |
| Integration depth (one engine, many channels) | **Yes** | CedCommerce and Omega portfolios of 4.5–4.9 apps with hundreds of reviews each (VERIFIED). Build Awards reward depth in Functions and POS. |
| Brand / portfolio | **Weak alone** | BSS/MIDA's brand did not rescue a late withdrawal button (2 reviews). REZ's second app has 16 (VERIFIED). |
| Legal / Shopify enforcement | **No** | Shopify staff point to the violation form; developers report no action on 1:1 copies (forum self-reports). |
| Being first to a dated wave | **Yes, until the deadline passes** | EW 2,320 vs late 1–5 (VERIFIED, Part B). |

---

## 7. The non-coder risk
- **Hard requirements** (VERIFIED, shopify.dev):
  - GraphQL Admin API only for new public apps (since 2025-04-01);
  - latest App Bridge;
  - OAuth before anything else;
  - no 404/500 web errors;
  - TLS and expiring offline tokens;
  - Billing API only;
  - set-up and payment screencasts;
  - three mandatory privacy webhooks (customers/data_request, customers/redact, shop/redact), acted on within 30 days.
- **Ongoing maintenance:** forced changes keep coming. Non-expiring tokens fail on 2027-01-01, and script tags stop running on 2027-03-01 (Part B, VERIFIED). An app is a maintenance contract, not a one-off build.
- **How often AI-coded apps by non-engineers fail review or break stores:** NOT FOUND. Shopify publishes no rejection rate, and the "vibe-coded rejection" stories found are about Apple. The indirect evidence:
  - Shopify built an *AI* self-review tool because the submission volume swamped reviewers (VERIFIED, 2026-04-20). Volume is high and the bar is the same.
  - Shopify's AI Toolkit gives an assistant the docs, the API schemas and code validation. That is a real aid for a non-coder (VERIFIED staff post).
- **Safe app types for a non-coder with AI (LOW blast radius):**
  - storefront display widgets built as theme app extensions (badges and labels, FAQ, back-in-stock forms, notices): a bug shows something wrong but loses no money, and the app uninstalls cleanly;
  - admin-only tools: reports, exports, barcode and price-label printing, catalog audits;
  - data-to-PDF tools: invoices, packing slips.
- **Avoid until there is a real engineer (HIGH):**
  - checkout extensions, payments, subscriptions billing;
  - discount Functions at scale;
  - inventory or order sync, order editing;
  - shipping rates (p95 ≤ 500 ms required);
  - fraud blocking, where a false positive blocks real orders.

---

## 8. Pay rail, re-verified 2026-10-31
- **Revenue share:** 0% on the first **$1,000,000 lifetime** gross app revenue (counted from 2025-01-01), 15% above that. 2.9% processing fee on all billing. $19 one-time registration. Accounts are pooled across associated developers. VERIFIED (shopify.dev revenue-share; re-opened at self-check).
- **Billing must go through Shopify.** Under the Partner Program Agreement (updated 2026-02-27), developers "must use the Shopify Billing Resource", and App Store requirement 1.2 says the same; off-platform billing cannot be listed. Shopify pays partners **twice per calendar month**. VERIFIED.
- **Bangladesh:** the Hyperwallet methods expanded payouts to "countries such as Ukraine, Turkey, Bangladesh, Nigeria, and Pakistan". VERIFIED (Shopify Partner blog, 2021-11-17).
- **The help page could not be opened** (Cloudflare). From search snippets only:
  - a $25 minimum;
  - PayPal, bank account or wire;
  - availability depends on region and amount;
  - the country list is shown in Partner Dashboard → Payouts.

  SEARCH-SUMMARY. **Day-1 action is unchanged from R1:** the partner screenshots the Bangladesh bank option in the dashboard.

---

## 9. Niche types the playbook favours
The cards for specific niches are in Part A (N1, N2, N3, N9, N10) and Part B (the script-tag migration sprint). I add no new Niche Card: the winners' pattern points to *types*, and A and B have already carded the concrete niches with demand numbers.

| Type | Why the pattern favours it | Maps to | Scores (Demand · Weakness · Wave · Edge · Low flood · Low blast) | Verdict |
|---|---|---|---|---|
| **T1 Storefront widgets whose set-up needs design help, in big existing leaves** (pre-order / back-in-stock, labels / badges, quote forms) | REZ and Lably prove late entrants break in through concierge styling; low blast radius | A: N1, N2, N3 | 5 · 2 · 2 · 5 · 1 · 5 = **20** (ESTIMATE) | **ENTER** with one sharp sub-job. REZ (5.0, 1,638) now holds N1, so pick the weakest leaf |
| **T2 Admin utilities that attack a weak incumbent, including Shopify's own** (barcode / price labels, catalog import) | RF Barcode reached 626 reviews in 12 months against a 2.3★ Shopify app | A: N10, N9 | 3 · 4 · 2 · 4 · 2 · 4 = **19** (ESTIMATE) | **ENTER / MAYBE.** Hanoi teams (Yanet, Magestore) already sit in the barcode top 5 |
| **T3 Platform-forced migrations with a hard date** (script tags → app embeds by 2027-03-01; customer-accounts sunset) | Wave rule 5: early entrants win; set-up is human work, the Dhaka edge | B: script-tag sprint | 3 · 3 · 5 · 5 · 3 · 3 = **22** (ESTIMATE) | **MAYBE / time-boxed.** Sell as a service now, with an app only if store demand shows |

**Avoid** (big but owned, or eaten by built-ins; Parts A and B): reviews / UGC, email / SMS, page builders, cookie consent, order tracking, GPSR, "AI visibility", and anything in checkout, payments or subscription billing.

**Halal:** all three types are general merchant tools (OK). Never build features specific to haram verticals.

---

## 10. What I could not verify
- The help.shopify.com payout page and its current country list (Cloudflare challenge); the Partner blog post on search ranking (HTTP 429).
- Team sizes and revenue of every profiled team, and the first app of each team (I profiled today's flagship).
- Indian origin of Appstle and CedCommerce; any Pakistani winner; any other Bangladeshi team.
- The real average cost per click of App Store ads.
- Rejection or failure rates for AI-coded apps on Shopify.
- How much of the post-July 2026 slowdowns (REZ, others) is the review purge rather than demand.
- Founder post-mortems with numbers.

---

## 11. Self-check (STEP 3)
- **Re-opened my 3 most decisive sources (2026-10-31, ~18:52 UTC), and all still hold:**
  1. shopify.dev revenue-share: "You keep 100% of your first $1,000,000 USD…".
  2. The shopify.dev review-trust post (2026-07-06): "remove a significant portion of its reviews". It now redirects to shopify.dev/changelog/blog/….
  3. The REZ listing: launched 2025-05-26, 1,638 reviews, 5.0, BFS, Dong Da, Hanoi.
- **Counter-evidence search.** I searched for a Shopify crackdown on support-solicited reviews, aiming to break rule 2.
  - Found: the July 2026 policy and mass unpublishing, with developers reporting genuine reviews lost (37 → 17 in one case, self-report).
  - Result: rule 2 survives, because Shopify explicitly allows a neutral ask through the Reviews API. But review counts are now fragile, and any incentive kills them.
  - Second counter-trace: a zero-review clone outranked a BFS original (forum). So reviews and BFS are not a rank moat (rule 12 and §6 updated).
- **Monday test (type T1 or T2):**
  - Yes, the CEO and partner can start next week. The Partner account and development stores are free; registration is $19; Shopify CLI and the AI Toolkit are free; set-up is human.
  - What slows them is not access but time:
    - app review takes weeks in 2026;
    - BFS needs 50 paid installs;
    - the Bangladesh payout option must be confirmed in the dashboard on day 1.
  - Not blocked by any special access.
- **Numbers check:** I recomputed REZ's last-90-day reviews two ways.
  - From newest-sort page positions (page 9 = Sep 14–18, page 17 = Aug 16–18): ≈ 85 + 80 + ~70 ≈ **235**.
  - From Part A's page-1 extrapolation: **~100**.
  - They don't match, because REZ is decelerating (≈ 5.5/day in July → ≈ 1.9/day in October), and page 1 only shows the latest rate.
  - I also recomputed the support share: my 73% (early) and 67% (newest), on 207 reviews with a broader regex, against Part A's 59% (2,296 recent 5★ reviews). Same direction, different sample and rule.

## 12. Checklist C
- [x] ≥ 6 winners profiled with labels (10 profiled; 2 leads NOT FOUND)
- [x] breakouts and failures (5 breakouts + Build Awards; 4 stall/failure traces)
- [x] ranking mechanics from Shopify docs
- [x] the thesis tally (18 existing / 1 forced-new / 0 invented)
- [x] defensibility
- [x] the non-coder risk
- [x] the pay rail re-verified (help page blocked; dev docs, agreement and blog verified)
- [x] the Playbook and the "Answer to the CEO"
- [x] STATUS: FINAL · Self-check · final message

## 13. Notes for other parts
- **Manager / E:** Shopify's 2026-07-06 review purge means review counts after July 2026 can fall for reasons other than demand. Part A's trend ratios (e.g. cookie consent 0.44×) may be partly purge.
- **A:** page-1 extrapolation understates the 90-day velocity of decelerating apps (REZ: ~100 vs ~235). The barcode leaf already has 2–3 Hanoi teams in its top 5.
- **B:** confirmed independently: BSS/MIDA's late "EU Withdrawal Button" has 2 reviews against EW's 2,320.
- **Manager:** help.shopify.com is blocked here (Cloudflare 403 with curl, DNS in WebFetch). The payout country list must come from the Partner Dashboard.

---

# Appendix — evidence notes (as collected; sources and labels inline)

## Notes (all fetched 2026-10-31 unless dated)

### N7 Pay rail (re-verified)
- Revenue share: "You keep 100% of your first $1,000,000 USD in lifetime gross app revenue, and 85% of earnings above that"; only revenue from 2025-01-01 counts; 2.9% processing fee on all billing; $19 one-time registration; Associated Developer Accounts pooled toward the $1M. Developers with ≥$20M App Store revenue in the prior year or ≥$100M company revenue pay 15% on everything. Some merchant countries add a "Regulatory Operating Fee". VERIFIED (shopify.dev/docs/apps/launch/distribution/revenue-share, curl).
- Partner Program Agreement, "Last updated February 27, 2026": developers who charge merchants "must use the Shopify Billing Resource" unless Shopify agrees in writing; Shopify pays out "twice per calendar month". Also prohibits "Create multiple Applications that offer substantially the same services" (matters for a portfolio: no clone-spam). VERIFIED (shopify.com/partners/terms, curl).
- Hyperwallet blog (Paul Gray, 2021-11-17): new methods "now including countries such as Ukraine, Turkey, Bangladesh, Nigeria, and Pakistan". VERIFIED (shopify.com/partners/blog/payout-methods, curl).
- Help-centre payout page (help.shopify.com/en/partners/getting-started/getting-paid): **blocked by a Cloudflare JS challenge from this session (HTTP 403, cf-mitigated)** — NOT VERIFIED. Search snippets say: $25 minimum, twice monthly, PayPal / bank account / wire via Hyperwallet, "availability depends on your region & payout amount", USD issued, non-USD conversion fee kept by Hyperwallet; country check is in Partner Dashboard → Settings → Payouts → Manage payout method → choose Country/Region. SEARCH-SUMMARY.
- Net: the rail is intact on primary documents as of Feb–Oct 2026; Bangladesh coverage rests on the 2021 blog + day-1 dashboard check (unchanged from R1).

### N3 Ranking mechanics (Shopify's own docs)
- BFS benefits: badge on app cards in search/category pages; BFS search filter; "Built for Shopify apps appear higher in Shopify App Store search rankings" (boost "isn't exclusive" to BFS); eligible for homepage/category first collection and admin "Picked for you" (not exclusive); priority review queue for future apps; ad targeting by merchant plan. VERIFIED (shopify.dev/docs/apps/launch/built-for-shopify).
- BFS prerequisites: ≥50 net installs from active shops on paid plans; ≥5 reviews; a minimum *recent* rating (threshold not published); admin Web Vitals at p75: LCP ≤2.5 s, CLS ≤0.1, INP ≤200 ms (≥100 calls in 28 days to be assessed); storefront Lighthouse drop ≤10 points; checkout-affecting requests p95 ≤500 ms, 0.1% failure; embedded with latest App Bridge; no forced external sign-up; no review-for-reward prompts; fail the same criterion 3× → 3-month suspension; annual re-review, 60 days to fix. VERIFIED (shopify.dev …/built-for-shopify/achievement-criteria).
- Listing rules: choose accurate categories (up to 25 structured features per category); mark a Free plan to show "Free plan available" in search; avoid keyword stuffing; 14-day free trial recommended; set install-eligibility (country, channel) to cut bad reviews; auto-translation covers listing incl. search terms. VERIFIED (shopify.dev …/shopify-app-store/best-practices).
- Search algorithm: Shopify Partner blog "search improvements" says ranking folds in "how merchants interact with results after they search" and has "a built-in mechanism for helping smaller trending apps show up higher"; later changelog adds "even more" behavioural data; expect day-to-day variability. SEARCH-SUMMARY (blog returned HTTP 429 to curl; changelog .md 404; WebFetch blocked for shopify hosts). Formula unpublished.
- Ads: all CPC; first-price auction ("you pay … the same as the bid amount"); relevance lowers cost and lifts rank; 3 types (search, category/subcategory, homepage); search shows top 3 ad slots; doc's worked example shows a $0.50 click. VERIFIED (shopify.dev …/marketing/advertising). Real average CPC: NOT FOUND on primary pages.
- Review timeline: Shopify staff, 2026-02-26: "We're seeing more of your submissions than ever … review times are longer than usual"; resubmitting sends you to the back of the queue. VERIFIED (community.shopify.dev/t/31728). Developers report Jan 2026 submissions waiting 1 month+ ; a posted 8–10 day SLA (SEARCH-SUMMARY / forum). Staff, 2026-04-20: "Submission volume had grown significantly, and our process wasn't keeping up"; launched an AI self-review command (via Shopify AI Toolkit) + a review dashboard where resubmission opens only after all flagged issues are fixed; AI pass ≠ approval, human review stays. VERIFIED (community.shopify.dev/t/33472).

### N1 Emerging-market portfolios (apps.shopify.com partner pages, curl 2026-10-31; VERIFIED counts)
| Team (origin per listing address) | Partner slug | Live apps | Total reviews | BFS apps | Top apps (reviews, rating) |
|---|---|---|---|---|---|
| PageFly (Hanoi, VN) | pagefly | 2 | 5,916 | (card parse 0; app page says BFS) | pagefly 5,916 4.9 |
| GemPages / GEMCOMMERCE (Hanoi, VN) | getshoplaunch | 2 | 4,299 | app page BFS | gempages 4,272 4.9; gemx-cro 27 |
| Avada (Hanoi, VN) | avada | 5 | 994 | 2 | avada-pdf-invoice 711 4.9; avada-order-limit 283 5.0; 2 apps with 0 reviews |
| BSS B2B Solutions (Ha Noi, VN) | bss-commerce-b2b | (not counted) | flagship 1,200 | flagship BFS | b2b-solution-custom-pricing 1,200 4.9 ("bss-commerce" partner page shows 0 apps) |
| Omega (Ha Noi, VN) | omegaapps | 9 | 1,383 | 7 | facebook-multi-pixels 1,002 4.9; tiktok-multi-pixels 151; instafeed 79; twitter-multi-pixels 54 |
| FireApps (HCM City, VN) | fireapps | 1 | 1,445 | 1 | ali-reviews 1,445 4.8 |
| Storeware (BD; listing shows a Milton, DE, US address) | storeware | 6 | 1,481 | 6 | storeseo 772 5.0; product-options-4 431 4.9; storefaq 158; customer-review-app 56; betterdocs 52; vidify 12 (4.1) |
| Appstle Inc. (listing: Menlo Park, CA, US) | appstle | 1 | 9,160 | 1 | subscriptions-by-appstle 9,160 5.0 |
| CedCommerce (listing: Sheridan, WY, US) | cedcommerce | 14 | 5,604 | 4 | etsy 1,249 4.5; amazon 1,170 4.6; ebay 920 4.7; walmart 566 4.7 |
| Webkul (Noida, IN) | webkul | 24 | 680 | 0 | multi-vendor-marketplace 363 4.7; product-auction 168 4.7 |
| Secomapp (VN) | secomapp | 0 | 0 | — | partner page shows "0 apps" — apps moved or delisted; NOT FOUND |
Pakistan: no Pakistani team with a large App Store footprint found in one search (Digixoft, 7 partner-directory reviews; SEARCH-SUMMARY). NOT FOUND.
Bangladesh beyond Storeware: one search found no other BD team with a verifiable large app; NOT FOUND.

### N1b Flagship timing — launch date vs. surviving reviews (VERIFIED from listing + `/reviews?sort_by=newest&page=N`; caveat: deleted/hidden reviews make the "100th-oldest" date a late bound)
| App (niche; existing or new category at launch) | Launched | Oldest surviving review | ~100th-oldest review | Months launch→100 | Price (listing) | Free plan |
|---|---|---|---|---|---|---|
| Appstle Subscriptions (subscriptions; existing, ReCharge/Bold incumbents) | 2021-04-08 | 2021-04-09 | 2021-06-14 | ~2 | $96/yr … $5k–100k/mo enterprise | Y |
| PageFly (page builder; existing, Shogun etc.) | 2017-09-28 | 2017-10-04 | 2018-09-23 | ~12 | up to $990/yr | Y |
| GemPages (page builder; existing) | 2017-03-13 | 2017-03-16 | 2018-04-27 | ~13 | n/p | Y |
| Avada PDF Invoice (invoices; existing) | 2019-12-03 | 2020-01-23 | 2020-12-22 | ~12 | $150–482/yr | Y |
| BSS B2B Wholesale (B2B pricing; existing) | 2020-09-18 | 2020-10-09 | 2022-03-17 | ~18 | $313–1,069/yr | Y |
| Omega Facebook Pixel (ads pixels; existing) | 2020-01-03 | 2020-01-12 | 2022-05-27 | ~29 | to $120/mo | Y |
| Ali Reviews (review importer; existing, Loox etc.) | 2017-03-24 | 2017-07-19 | 2020-09-23 | ~42 (purge likely) | $134–450/yr | Y |
| StoreSEO (SEO; existing, crowded) | 2021-10-19 | 2022-12-07 | 2024-04-08 | ~30 | $39/mo | Y |
| EasyFlow Product Options (options; existing, crowded) | 2023-10-02 | 2023-10-19 | 2024-07-15 | ~9 | $90–1,350/yr | Y |
| CedCommerce Etsy (marketplace sync; existing) | 2018-09-26 | 2018-09-13 | 2020-06-11 | ~21 | $9/mo… | Y |
| Webkul MultiVendor (marketplace; existing) | 2015-04-20 | 2015-10-12 | 2022-09-30 | ~89 | $15/mo | Y |
- Every one of 11 flagships entered an **existing** category; all 11 have a free plan. VERIFIED (listing pages).
- Support is the review engine: on the page holding each app's ~100th-oldest review, **80 of 110 reviews (73%)** mention support/help/team/chat; on the newest page **65 of 97 (67%)** do. Median "days using the app" at review time is often 1–17 days for the support-heavy apps (EasyFlow 1, Appstle 3, Ced Etsy 11, StoreSEO 17) — reviews written right after a help ticket. VERIFIED (my parse of review pages; keyword rule: support|chat|customer service|helpful|responsive|quick reply|team).
- Current velocity (newest page, 10 reviews): Appstle 10 in ~2 days (Oct 30–31, 2026); PageFly 10 in ~9 days; StoreSEO 10 in ~11 days. VERIFIED.

### N2 AI-era breakouts (launched 2024-08 → 2026-01; leads from Part A, re-checked by me 2026-10-31, VERIFIED listing + review pages)
| App | Team / portfolio | Launched | 1st review | ~100th review | Reviews now | Category at entry | Price entry | How it broke in (evidence) |
|---|---|---|---|---|---|---|---|---|
| REZ Preorder, Back In Stock | REZ Commerce, Dong Da, Hanoi VN; 2nd app (bundles) has 16 reviews | 2025-05-26 | 2025-06-11 | 2025-10-14 | 1,638 (5.0, BFS) | existing, crowded (pre-orders/back-in-stock) | free plan; $4.99/$14.99/$28.99 per mo (Part A CSV) | concierge onboarding: earliest reviews say a named agent emailed/messaged them unasked and styled the popup; median "time using" on earliest and newest pages ≈ 0.2–0.8 days; 5/8 and 6/7 text reviews mention support |
| MIDA Fraud Filter | partner slug "mida-by-bss-commerce" = BSS Commerce's new brand (listing: Singapore); sister MIDA Replay 620 reviews | 2025-09-19 | 2025-11-27 | 2026-05-12 | 567 (4.9, BFS) | existing (fraud/bot blocking) | free plan; $9–39/mo (A CSV) | an established VN portfolio launching a new brand; cross-promotion likely (not verified) |
| RF: Barcode Labels Generator | "orderediting" partner (Order Editing.app, 31 reviews); listing Newark DE, US | 2025-10-24 | 2025-11-05 | 2026-05-03 | 626 (5.0, BFS) | existing; incumbent is Shopify's own 2.3★ barcode app (Part A) | Free | free + attack a weak incumbent |
| Lably badges | DevIT (listing Toronto CA), 5 apps all 5.0 (Selecty 344, React Flow 176, ReSell 72) | 2024-08-09 | 2024-08-25 | 2025-01-12 | 672 (5.0, BFS) | existing, crowded (badges/labels) | $7.99–19.99/mo, free plan | portfolio team; ~5 months to 100 |
| EW: EU Withdrawal Button | 401layers UG, Hilden DE ("quaternico"; GPSR app 29 reviews) | 2026-01-09 | 2026-01-26 | 2026-05-13 | 2,320 (4.9, BFS) | **new sub-category created by an EU deadline (2026-06-19)** — forced demand, not invented demand | $99.99–299.99/yr, free plan | first by ~5 months; BSS/MIDA's own late "EU Withdrawal Button" has 2 reviews |
REZ curve (k-th oldest review → date): 1 → 2025-06-11; 100 → 2025-10-14; 300 → ~2026-01-17; 600 → ~2026-03-25; 1,000 → ~2026-06-10; 1,300 → ~2026-07-17; 1,638 → 2026-10-30. So ≈ 25/mo in months 1–4, ≈ 67/mo Oct–Jan, ≈ 130–160/mo Jan–Jun, peak ≈ 250/mo Jun–Jul 2026, ≈ 100/mo since. VERIFIED (pages 1, 2, 34, 64, 104, 134 and last of newest-sort reviews).
Build Awards 2026 (Shopify, dated 2026-07-22; VERIFIED apps.shopify.com/stories/guide-build-awards-2026): Discount Kit (98 reviews, "a benchmark for building with Shopify Functions"), Easyteam POS time clock (328), Smile loyalty (4,653) … — all existing categories, rewarded for deep native integration.

### N4–N6 extra evidence (2026-10-31)
- Review policy: Shopify dev blog "Strengthening trust in App Store reviews", 2026-07-06: new App Store requirement against incentivised reviews ("we'll remove a significant portion of its reviews"); expanded authenticity signals applied to existing reviews, so some genuine apps lose reviews too; allowed: request via the Reviews API, neutral ask after real use. VERIFIED (shopify.dev/blog/… → now redirects to shopify.dev/changelog/blog/…).
- Clones: community.shopify.dev/t/35514 (2026-06-24 → 2026-09-02): a new app copied listing, pricing, images; another dev says Shopify "didn't do anything" after DMCA hoops; staff points to the "report a partner violation" form; 2026-09-02 a dev reports a 1:1 clone undercutting by 1 cent that ranks #1 for a key term with zero reviews and no BFS, above the original. VERIFIED that the posts exist; claims are self-reports.
- 2026 newcomers who stall: community.shopify.com/t/643974 (2026-06-29): a free 404-fixer (merchants "don't know they have" the problem) and an AI quiz app ("nothing brings my app" to page 1); advice in-thread: direct outreach, agencies, onboarding help. community.shopify.com/t/583477 (2026-01-14): same pattern. VERIFIED posts (self-reports). Indie Hackers post: an app at $119/mo had 0 reviews after 3 weeks, switched to free; founder estimates 0–2 organic installs/week for a zero-review app. SEARCH-SUMMARY (page 403). Mantle (tools for Shopify app developers) listed as failed 2026: tiny market, Shopify tooling erased its wedge. SEARCH-SUMMARY (ideaproof.io).
- Requirements (VERIFIED shopify.dev app-store-requirements + privacy-law-compliance): new public apps GraphQL Admin API only since 2025-04-01; latest App Bridge; OAuth first; no 404/500 web errors; TLS + expiring offline tokens; billing only via Shopify Billing API / Shopify App Pricing (off-platform billing cannot be listed); screencasts of set-up; must not be identical to your other apps; 3 mandatory compliance webhooks (customers/data_request, customers/redact, shop/redact; act within 30 days; shop/redact 48 h after uninstall).
- Independent ranking analysis (AppJubilee, a rank-tracking vendor): name + subtitle carry most keyword weight; recent review pace beats lifetime totals; install velocity and uninstall ratio matter; 17,891 active apps, ~584 launches/month. VENDOR CLAIM.
- Appstle (appstle.com blog, Aug 2021, VENDOR CLAIM): launched March 2021; founders had earlier apps (Back in Stock, Discounted Pricing); "No. 1 rank" in Subscriptions and ~3,000 active merchants at 6 months; no transaction fee while ReCharge and Bold charged one; all resources on product + support; "24x7x365" experts; based in Menlo Park, offices in Canada and India.
- Team size / revenue for PageFly, GemPages, Avada, BSS, Omega, FireApps: NOT FOUND (one search; only vendor merchant counts: Avada "350,000 merchants", PageFly "90,000+", SEARCH-SUMMARY).
- REZ velocity midpoints: newest-sort page 9 = 2026-09-14…18; page 17 = 2026-08-16…18; page 34 = 2026-07-17…18 → ≈ 5.5/day mid-Jul→mid-Aug, ≈ 2.7/day mid-Aug→mid-Sep, ≈ 1.9/day mid-Sep→Oct 30. VERIFIED (my parse).
