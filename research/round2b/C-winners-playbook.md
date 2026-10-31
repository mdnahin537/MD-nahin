STATUS: IN PROGRESS — next: founder stories (search), §2 AI-era breakouts/failures, §4 thesis, §5 clones, §6 non-coder risk; then write final sections

# Part C — How small and emerging-market teams win on the Shopify App Store (the playbook)
Written 2026-10-31 by Companion C (Round 2B). No sub-agents used. Raw downloads in /tmp/partC/ (not in repo).
Labels: VERIFIED (primary page opened) · VENDOR CLAIM · SEARCH-SUMMARY (search snippet only) · ESTIMATE (my arithmetic, inputs shown).

## Work log
- 2026-10-31: brief read; R1 evidence read.

## RAW NOTES (being turned into sections; all fetched 2026-10-31 unless dated)

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
