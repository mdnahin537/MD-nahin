STATUS: FINAL

# Part A — Shopify App Store demand and gap map (the numbers)
Companion A, Round 2B. Crawled 2026-10-31. Labels: **VERIFIED** (opened primary page or my own count of primary pages) · **VENDOR CLAIM** · **SEARCH-SUMMARY** · **ESTIMATE** (inputs shown).
Data: `data/A-categories.csv` (121 leaves, 92 scored) and `data/A-top-apps.csv` (348 top-5 apps). Every score below traces to a CSV row. Raw HTML is kept in /tmp/partA only (not in the repo).

## 0. The answer in ten lines
1. **Demand is everywhere; weakness is almost nowhere.** In 74 of 92 high-demand leaves, every top-5 app is rated ≥ 4.5; only 13 leaves have any top-5 app at ≤ 4.3 (VERIFIED, my crawl). Stars do not show weakness here. The 1–3★ text does, and so do Shopify's own weak apps.
2. **Reviews are bought with support.** 59% of recent 5★ reviews of top apps (1,349 of 2,296) mention support, help, team or thanks (VERIFIED, my regex count). The winners win on hand-holding. That is the Dhaka edge, and it is also the reason the incumbents look "perfect".
3. **The flood is universal.** Median leaf: ~237 still-listed launches a year (ESTIMATE, newest-sort method §1). Even the quietest fifth of leaves gets ~10–100 a year. "Not flooded" does not exist. "Less flooded than demand" does.
4. **Late entrants still break in.** These apps launched 2024–2026 and are already top-5: REZ back-in-stock (launched 2025-05-26 → 1,638 reviews), MIDA fraud (2025-09-19 → 567), Delta Retail Barcode (2025-10-24 → 626, free), Lably labels (2024-08-09 → 672), EU Widerrufsbutton (2026-01-09 → 2,320). VERIFIED (app pages).
5. **Built-ins kill velocity.** Leaves where Shopify ships a built-in feature are shrinking: cookie consent (review velocity now 0.44× the prior year; Shopify "automated privacy" built-in), order tracking (0.54×; "order tracking" built-in), page builders (0.54×). VERIFIED (sitemap_built_in_features_en.xml + review dates); the causation is my inference.
6. **Top niche cards (score /30):** N3 custom/quote forms that never lose a lead (23) · N1 pre-orders + back-in-stock (22) · N2 product labels + free-gift promos (22) · N10 barcode/price labels for in-person retail (21) · N9 store migration + catalog import (20).
7. **Attack (big, but held by weak or stale apps):** barcode labels (Shopify's own app is 2.3★, 368 1–3★ reviews), marketplace and catalog sync (Shopify Marketplace Connect 4.1★, 310 1★), returns for small stores (support collapse after sign-up), and form builders (lost submissions, upsell-instead-of-help).
8. **Avoid (big but owned):** SMS/email (Shopify Messaging, Klaviyo), ads and marketplaces (TikTok, Meta, Google, Shop), product reviews (Judge.me 49k reviews), social proof (Loox), workflow (Shopify Flow), dropshipping/POD (supplier networks), page builders (PageFly/GemPages), and cookie consent and order tracking (Shopify built-ins).
9. **Money is small at first.** A new app that reaches the speed of the #4 app in its leaf by month 12 makes ~$40–1,600 MRR (ESTIMATE §6). One app is a foothold, not a company. The portfolio plus set-up fees is the model.
10. **Compliance can sell, but only until the deadline.** The EU withdrawal-button app earned 2,320 reviews in 10 months, then its velocity fell from ~112 to ~17 a month after June 2026 (VERIFIED dates; the deadline itself goes to Part B to verify). This corrects round 2's "compliance = no store demand": it holds for niche national compliance (Peppol), not for EU-wide mandates.

## 1. Method and named formulas
- **Legality.** apps.shopify.com robots.txt (`User-agent: *`) disallows `*q=*`. No search page was fetched. 833 requests to apps.shopify.com in total, self-check included (≤ 1,000), 2–3.5 s apart, generic browser UA. The 12 HTTP 429 replies were re-fetched more slowly (VERIFIED, request log).
- **Categories.** sitemap_categories_en.xml has 161 category URLs; **121 are leaves** (no child). Page 1 (24 apps, default order) of each leaf was parsed: name, handle, rating, review count, BFS, price text. 2,190 unique apps.
- **Candidates.** The 92 leaves whose top-5 lifetime reviews total ≥ 1,500, minus *pay-later* (interest-based BNPL, halal) and *NFTs/token-gating*. One leaf (product-display-other, 1,521) was missed by a crawl gap and is not scored.
- **Top 5** = the 5 apps with the most lifetime reviews on the leaf's page 1.
- **D90 (demand)** = Σ over top 5 of the estimated reviews in the last 90 days. Per app, from `/reviews?sort_by=newest` page 1 (10 reviews): if all 10 fall within 90 days, then 10 × 90 ÷ (days since the 10th review); otherwise the count of reviews within 90 days. ESTIMATE, coarse for fast apps (10 reviews in 1 day gives 900).
- **Dq** = quintile of D90 across the 92 leaves (cuts 141 / 303 / 510 / 896 → 1–5).
- **W (weakness points)** = 1 + min(4, A + B). A = number of top-5 apps (capped at 3) with any of: rating ≤ 4.3; lifetime 1–2★ ≥ 8% (rating histogram); 1–2★ ≥ 20% of the page-1 reviews from the last 12 months (n ≥ 5); no review in 180 days. B = 1 if the pooled 1–2★ share of the top 5's last-12-month page-1 reviews is ≥ 8%.
- **Launch rate (flood)** = 24 ÷ (years since the launch of the 24th app in the leaf's `?sort_by=newest` list). The sort follows launch date: the FAQ leaf's #1 launched 2026-10-29 and #12 on 2026-10-08 (VERIFIED). It counts live apps only (delisted apps are invisible), so it is a lower bound. **Fq** = reverse quintile (cuts 100 / 169 / 283 / 461 a year → 5–1).
- **Penalty** = 3 if the lead app (most recent reviews) is Shopify's own or the official connector of the service (TikTok, Meta, Google, Pinterest, WhatsApp, Intuit, Klaviyo, Mailchimp, Printify, Printful, CJ, DSers, Faire, Microsoft); 1 if such an app is in the top 5 or a Shopify app is on page 1; +1 if **giant** (lead app ≥ 5,000 lifetime reviews and ≥ 50% of the leaf's D90).
- **Total** = Dq + W + Fq − Penalty (max 15). Ties break on D90.
- **Trend (Niche Cards only)** = for the top-3 apps, the review rate now (D90 ÷ 3) versus the rate from ~1 year ago up to 90 days ago. The second rate comes from the newest-review page whose index ≈ one year of reviews at today's rate. Ratio ≥ 1.5 → 5, 1.2–1.5 → 4, 0.9–1.2 → 3, 0.7–0.9 → 2, < 0.7 → 1. Caveat: a review-solicitation campaign moves this as much as installs do.
- **Card scores (1–5)**: Demand = Dq; Weakness = W, +1 if complaint mining found one theme repeated ≥ 5 times (+1 more where stated); Wave = trend band; Edge, Low blast = my judgment, with the reason written on the card; Low flood = Fq.

## 2. What the store-wide numbers say
| Measure | Value | Label |
|---|---|---|
| Review velocity of the 348 top-5 apps (reviews per 90 days) | p10 3 · p25 9 · **median 33** · p75 90 · p90 225 | ESTIMATE (method §1) |
| By position in leaf (by lifetime reviews): #1 / #3 / #5 median | 112 / 36 / **20** per 90 days | ESTIMATE |
| Lifetime reviews of the #1 / #5 / #10 / #24 app on a leaf's page 1 (median of 120 leaves) | 1,753 / 329 / 111 / **5** | VERIFIED (listing counts) |
| Top-5 apps carrying "Built for Shopify" | 67% | VERIFIED |
| Live installs per lifetime review (StoreLeads, 21 apps, pages updated 2026-10-23) | **median 8.2**, IQR 4.3–16.9, range 0.6–153 (Judge.me 646,475 / 49,388 = 13) | VENDOR CLAIM (StoreLeads counts storefront-detected installs; back-office apps are missed) |
| Published ratio | "the Reviews/Installs Ratio can range from 5 to 40" (Kunal Modi, 2021-04-06) | VERIFIED (opened), but informal and old |

**Reviews → installs for a mid-ranked app (ESTIMATE).** A #5 app in a leaf earns a median ~20 reviews per 90 days (≈ 7 a month). New installs per new review: 5–40 (Modi). The current-install ratio of ~8 (StoreLeads) is a floor, because churned installs are not counted. So a #5 app gets ≈ **35–270 installs a month, central ~70** (7 × 10). The median top-5 app (33 per 90 days) gets ≈ 110 a month. Below the top 10 of a leaf's page 1, review counts collapse (#24 = 5 lifetime reviews), so store-search installs there are near zero. This matches round 2's "51% of apps have no reviews".

**Why stars mislead.** Incumbents ask for reviews right after a support chat: 59% of recent 5★ reviews name support or help (VERIFIED count). Lifetime 1–2★ shares stay under 3% even for apps whose recent 1–3★ text reports broken features after updates (§7). Weakness has to be read in text, in Shopify's own apps (often the weakest: Search & Discovery 2.6★ with 9 of 10 recent reviews at 1–2★; Retail Barcode Labels 2.3★; Marketplace Connect 4.1★; Translate & Adapt 4.4★ with 6 of 9 recent at 1–2★), and in pricing complaints.

## 3. Ranked table — top 30 of 92 scored leaves (full list in A-categories.csv)
| # | Leaf (short) | Apps | D90 top-5 | Dq | W | Launches/yr | Fq | Pen | Total | Lead app (recent) | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | mkt/marketing-sms-marketing | 162 | 1003 | 5 | 5 | 64 | 5 | 3 | 12 | shopify-messaging (0.45) | platform-led → avoid |
| 2 | channels/selling-online-marketplaces | 249 | 2175 | 5 | 4 | 93 | 5 | 3 | 11 | shop (0.41) | platform-led → avoid |
| 3 | mkt/upsell-and-bundles-pre-orders | 121 | 1241 | 5 | 1 | 80 | 5 | 0 | 11 | preorder-back-in-stock (0.36) | N1 |
| 4 | mkt/advertising-ads | 396 | 1134 | 5 | 5 | 237 | 3 | 3 | 10 | tiktok (0.4) | platform-led → avoid |
| 5 | mkt/promotions-promotions-other | 212 | 694 | 4 | 1 | 80 | 5 | 0 | 10 | kite-free-gift (0.43) | N2 |
| 6 | mgmt/support-surveys | 171 | 594 | 4 | 2 | 131 | 4 | 0 | 10 | form-builder-contact-form (0.76) | N3 |
| 7 | design/internationalization-geolocation | 157 | 581 | 4 | 1 | 60 | 5 | 0 | 10 | blockify (0.52) | N4 |
| 8 | design/search-and-navigation-navigation-and-menus | 154 | 325 | 3 | 2 | 64 | 5 | 0 | 10 | globo-mega-menu (0.55) | N5 |
| 9 | mkt/social-trust-social-proof | 367 | 1389 | 5 | 1 | 149 | 4 | 1 | 9 | loox (0.65) | giant |
| 10 | mkt/upsell-and-bundles-upsell-and-bundles-other | 153 | 693 | 4 | 1 | 129 | 4 | 0 | 9 | bundle-builder (0.65) | N6 |
| 11 | design/notifications-forms | 205 | 588 | 4 | 1 | 122 | 4 | 0 | 9 | form-builder-contact-form (0.77) | N3 |
| 12 | orders/returns-and-warranty-warranties-and-insurance | 102 | 506 | 3 | 1 | 56 | 5 | 0 | 9 | xcotton-free-return (0.89) | halal flag: insurance |
| 13 | design/search-and-navigation-search-and-navigation-other | 117 | 257 | 2 | 2 | 64 | 5 | 0 | 9 | globo-mega-menu (0.7) | N5 |
| 14 | design/internationalization-cookie-consent | 92 | 198 | 2 | 2 | 94 | 5 | 0 | 9 | gdpr-cookie-consent (0.51) | compliance; N7 |
| 15 | orders/returns-and-warranty-returns-and-warranty-other | 54 | 55 | 1 | 3 | 68 | 5 | 0 | 9 | parcel-panel-returns-exchanges (0.44) | N8 |
| 16 | mkt/social-trust-product-reviews | 492 | 2093 | 5 | 1 | 461 | 2 | 0 | 8 | judgeme (0.43) |  |
| 17 | mkt/upsell-and-bundles-stock-alerts | 323 | 1591 | 5 | 1 | 381 | 2 | 0 | 8 | cartbite (0.28) | N1 |
| 18 | find/sourcing-options-dropshipping | 605 | 1290 | 5 | 2 | 169 | 4 | 3 | 8 | dsers (0.35) | platform-led → avoid |
| 19 | channels/selling-online-selling-online-other | 144 | 1009 | 5 | 2 | 80 | 5 | 4 | 8 | shop (0.89) | platform-led → avoid; giant |
| 20 | find/sourcing-options-print-on-demand-pod | 370 | 896 | 4 | 3 | 144 | 4 | 3 | 8 | printify (0.33) | platform-led → avoid |
| 21 | orders/returns-and-warranty-returns-and-exchanges | 276 | 776 | 4 | 2 | 365 | 2 | 0 | 8 | xcotton-free-return (0.58) | N8 |
| 22 | channels/selling-online-store-data-importer | 458 | 600 | 4 | 3 | 292 | 2 | 1 | 8 | excel-export-import (0.75) | platform app in top 5; N9 |
| 23 | mkt/marketing-marketing-other | 378 | 564 | 4 | 1 | 283 | 3 | 0 | 8 | cartbite (0.8) |  |
| 24 | design/storefronts-page-builder | 389 | 517 | 4 | 1 | 186 | 3 | 0 | 8 | gempages (0.35) | N-PB |
| 25 | channels/selling-in-person-retail | 159 | 420 | 3 | 1 | 110 | 4 | 0 | 8 | delta-retail-barcode (0.54) | N10 |
| 26 | sell/digital-goods-and-services-event-booking | 155 | 412 | 3 | 1 | 137 | 4 | 0 | 8 | appointo-appointments-and-bookings (0.31) | N11 |
| 27 | mgmt/security-fraud | 306 | 402 | 3 | 3 | 398 | 2 | 0 | 8 | blockify (0.75) | N4 |
| 28 | design/images-and-media-image-gallery | 262 | 370 | 3 | 1 | 137 | 4 | 0 | 8 | instafeed (0.81) |  |
| 29 | mkt/gifts-gifts-other | 82 | 284 | 2 | 1 | 39 | 5 | 0 | 8 | salepify (0.63) |  |
| 30 | sell/digital-goods-and-services-digital-goods-and-services-other | 47 | 195 | 2 | 1 | 10 | 5 | 0 | 8 | sky-pilot (0.51) |  |

Reading the table: ranks 1, 2 and 4 are owned by platforms (Shopify Messaging, Shop, TikTok, Meta, Google). In them the weak apps are the official connectors, which merchants must use anyway, so they are not attackable. "mkt/marketing-other" (rank 23) is a mixed bucket, not a single job, and is skipped. Warranties & insurance (rank 12) is mostly shipping-protection *insurance*, so it is excluded on halal grounds (conventional insurance; the CEO or a scholar should rule on it). Product reviews (rank 16) is excluded as giant-owned by judgment, since Judge.me is the brief's own example of a giant, even though its 43% share of recent reviews is under the formula's 50% giant line. The 12 Niche Cards are the **first 12 distinct jobs in rank order** after these exclusions, with overlapping leaves merged (pre-orders + stock alerts; forms + surveys; menus + search-nav-other; returns + returns-other).

## 4. Avoid / attack
**AVOID: big but owned by a giant or by Shopify.**
| Leaf | Why (VERIFIED numbers) |
|---|---|
| SMS & email marketing | Shopify Messaging (4,764 reviews, ~450 per 90 days), Klaviyo, Omnisend, Mailchimp |
| Ads, marketplaces, selling-online-other | TikTok 16,033 reviews; Shop (Shopify) 10,001; Facebook & Instagram; Google & YouTube |
| Product reviews · social proof | product-reviews leaf: top-5 D90 2,093, led by Judge.me (49,388 lifetime reviews); social proof: Loox 10,002, giant flag |
| Workflow automation | Shopify Flow: 15,192 reviews, 95% of the leaf's recent reviews |
| Dropshipping · print-on-demand | supplier networks (DSers, Printify, Printful, CJ): the value is the supply, not the software |
| Upsell/cross-sell · product bundles · discounts · SEO | flood of 548–1,753 launches a year; native Shopify Bundles (SEARCH-SUMMARY, Shopify changelog) |
| Cookie consent · order tracking | Shopify built-ins ("automated privacy", "order tracking"); review velocity 0.44× and 0.54× the prior year |
| Page builders | PageFly 5,916 and GemPages 4,272 reviews; velocity 0.54× |

**ATTACK: big, but held by weak, stale or overpriced apps.**
| Target | Evidence |
|---|---|
| Barcode/price labels for in-person retail | Shopify's own Retail Barcode Labels: 2.3★, 475 reviews, 368 of them 1–3★, recent ones about removed templates and broken printing (VERIFIED). A 2025-10 entrant (Delta, free) reached 626 reviews in 12 months |
| Catalog import, migration and marketplace sync | Shopify Marketplace Connect 4.1★ with 310 1★ reviews; CedCommerce Etsy 4.5★; recent 1★ texts on prices zeroed and stock oversold |
| Returns for small stores | AfterShip Returns 4.7★, lifetime 1–2★ 7.1%; Return Prime and Redo texts on support vanishing after sign-up |
| Contact, quote and application forms | incumbents launched 2014–2017; recent 1★ texts on lost submissions and upsell-instead-of-help; Shopify Forms (4.5★) complaints are all about limits |
| Search & filter (a watch item, not a card) | Shopify Search & Discovery 2.6★, 9 of the 10 newest reviews at 1–2★; but Globo and Searchanise already hold the job, and D90 is only 155 |

## 5. Niche Cards (12), ranked by card score /30
Scores: Demand · Weakness · Wave · Edge · Low flood · Low blast. All counts VERIFIED from listings and app pages on 2026-10-31 unless labelled. Velocities and rates are ESTIMATES (method §1). Money = installs in 12 months ≈ r × 10, where r = 90-day reviews of the leaf's #4 app by velocity (ramp 25%, 10 installs per review). Paying = installs × 15% paid × 60% retained. MRR at month 12 = paying × the median entry price of the top 5. All ESTIMATE.

### N3 — Contact, quote and application forms that never lose a lead
- Demand now: forms leaf D90 588; surveys leaf 594 (same leaders); top-5 lifetime reviews 6,501; 205 apps in the leaf.
- Trend: rising and concentrated. Top-3 rate 184 a month now vs 112 before (1.64×). It is driven by Powerful Form (3.1×); Hulk is at 0.57× and POWR at 0.18×.
- Incumbents: Powerful Contact Form Builder (Powerful Form, Hanoi) 4.9★/2,647, from $7.45, launched 2017-10-12, BFS · Hulk Contact Form Builder 4.9★/2,033, $12.90, 2017-08-11, BFS · POWR 4.6★/689, $11.99, 2014-07-03 · SA Request a Quote (Samita, Hanoi) 4.9★/655, $16.99, 2017 · Pify 4.7★/477, last review 2026-07-09. All five BFS. Shopify Forms (Shopify) 4.5★/761, free, sits on page 1 of the pop-up and email leaves.
- Weakness (30 recent 1–3★ read): lost submissions or broken integrations (Gmail, Klaviyo, Flow) ×5 · slow or absent support, incl. time zone ×5 · bugs (conditional logic, redirect, crashes) ×5 · price hikes, upsell or billing after uninstall ×4 · Shopify Forms limits (features, form cap, no export, styling) ×6 · compliance (claimed accessibility lawsuit; tracking before consent) ×2.
- Flood: ~122 launches a year (forms), ~131 (surveys).
- Platform build-in: MED. Shopify Forms keeps shipping (consent Jul 2025, translations Aug 2025, Sign in with Shop Mar 2026: SEARCH-SUMMARY of Shopify changelog), but for sign-up popups, not contact, quote or application forms.
- Blast radius: LOW–MED (a silent failure loses leads; it does not touch checkout).
- Our edge: the CEO's automation craft. Each submission is routed to email, Sheets, CRM, Klaviyo or Flow with **delivery receipts and failure alerts**, plus AI spam filtering and triage. A Dhaka person builds the merchant's forms within 24 h. The B2B variant (wholesale application → company account; quote → draft order) rides native B2B moving beyond Plus (round 2, R1 §2).
- Revolutionary angle (hypothesis): "The only form app that proves every lead arrived, and routes it where you work."
- Route: B2B/wholesale partners (1,847 in the Partner Directory filter, round 2); agencies building contact pages; Community answers.
- Money: at the #4 speed, r = 3 → ~$36 MRR. At the #2 speed (Hulk, r = 100) → 1,000 installs → 90 paying × $12 ≈ $1,080 MRR. Demand here is winner-take-most.
- Halal: OK.
- Scores: D4 · W2 · Wave5 · Edge4 · Low flood4 · Low blast4 = **23** → **ENTER (as app #2, or #1 if B2B is the lane)**. Low blast and fits the CEO's skills, but the newcomer must take share from one leader.

### N1 — Pre-orders + back-in-stock alerts
- Demand now: pre-orders D90 1,241 (largest non-platform leaf); stock-alerts leaf D90 1,591 (same jobs). All five leaders earn ≥ 100 reviews per 90 days, so **demand is spread**. 121 apps.
- Trend: rising. 343 a month now vs 272 before (1.26×): Notify! 1.46×, STOQ 1.15×, Timesact 1.13×.
- Incumbents: Notify! Back in Stock (Notify Me!, CA) 4.9★/3,974, $9.90–39.90, 2020-05-19 · Preorder/Back in Stock STOQ (Artos) 5.0★/3,888, $10–69, 2021-11-01 · Timesact (RO) 5.0★/2,127, $5–23, 2020 · PreOrder Globo (Hanoi) 4.9★/1,977, 2017 · REZ (5.0★/1,638, $4.99–28.99, **launched 2025-05-26**). All BFS. Last reviews 2026-10-29/30.
- Weakness (27 recent 1–3★ read): broke after updates, button not showing, or pricing broken ×10 · too expensive for small stores or billing surprises ×7 · complex, or needs support for large SKU counts or date changes ×5 · support unreachable or refunds refused ×3 · deposit limits ×1. Notify! also refuses some verticals ("adult", alcohol) ×2.
- Flood: ~80 a year (least-flooded quintile). But the 12th-newest app launched 2026-10-12 (§9), so launches may be speeding up.
- Platform build-in: LOW. No native pre-order button found (SEARCH-SUMMARY; vendor guides say an app is needed).
- Blast radius: MED (pre-orders change add-to-cart and payment capture; alerts are LOW).
- Our edge: turn the waitlist into a **restock plan**. AI forecasts quantity from "notify me" sign-ups and sell-through; humans set up large catalogs and date changes in bulk, which the complaints say is painful.
- Revolutionary angle: "Every 'notify me' click becomes a purchase-order suggestion and a pre-order with a deposit."
- Route: store search (low flood plus spread demand); merchant-side partners; Klaviyo/Flow users.
- Money: r = 112 → ~1,120 installs → ~100 paying × $9.90 ≈ **$1,000 MRR at month 12** (best of the 12).
- Halal: OK (deposits are fine; never add BNPL or financing).
- Scores: D5 · W2 · Wave4 · Edge3 · Low flood5 · Low blast3 = **22** → **ENTER (recommended app #1)**. The biggest, most spread, least-flooded demand, and REZ proves a 2025 entrant can reach the top 5 in 17 months.

### N2 — Product labels/badges + free-gift promotions
- Demand now: D90 694; 212 apps.
- Trend: rising (2.37×). TA Labels 4.0×, Kite 2.8×, Sami 0.67×.
- Incumbents: TA AI Product Labels (Tech Arms, SG) 4.9★/1,459, free, 2020 · Kite free gift (Skai Lama, Indore) 4.9★/1,342, $29–99, 2023 · Sami labels (Samita, Hanoi) 5.0★/1,264, $9.90, 2022 · Lably (DevIT) 5.0★/672, $7.99, **2024-08-09** · Auction Today 4.9★/330.
- Weakness (21 read): doesn't work, buggy, or broke in high-volume sales ×11 · limitations (auto-add gift by coupon, side-cart support, manual placement only on the top plan, badge on every image) ×4 · complexity ×2 · support ×2.
- Flood: ~80 a year (least-flooded quintile).
- Platform build-in: LOW–MED (native discounts cover buy-X-get-Y; labels are not native: NOT VERIFIED).
- Blast radius: LOW for labels; MED for free gifts (cart price).
- Our edge: weak. AI writes and places labels from product data. Commodity.
- Revolutionary angle: "Labels that write themselves from your inventory, margin and reviews data."
- Route: store search; a cross-sell from app #1.
- Money: r = 53 → ~48 paying × $9.45 ≈ $450 MRR.
- Halal: OK.
- Scores: D4 · W2 · Wave5 · Edge2 · Low flood5 · Low blast4 = **22** → **MAYBE (good portfolio app #3, low risk for a non-coder)**.

### N10 — Barcode and price labels for in-person retail
- Demand now: retail leaf D90 420; SKU & barcodes leaf 344. The retail leaf also holds booking apps.
- Trend: rising (Delta 1.63×; 117 a month now vs 83 before).
- Incumbents: Delta Retail Barcode (Retail Force) 5.0★/626, **free**, **launched 2025-10-24** · Yanet barcode labels (Hanoi) 4.9★/457, $7.99–69.99, 2022 · Magestore Barcode (Hanoi) 4.9★/425, $7.99, 2023 · **Shopify's own Retail Barcode Labels: 2.3★/475 reviews, 1★ 207 · 2★ 85 · 3★ 76, free, 2018-12-03** (in the bulk-editor/workflow leaves).
- Weakness (21 read): fixed templates, label sizes or printer mismatch (Dymo, Avery, Brother; no multi-line text; no print preview) ×7 · broke after an update ×6 · billing tactics (tickets, billed at install, "talk to us first") ×4 · no support or AI-chat spam ×3 · duplicate barcodes ×1.
- Flood: ~110 a year (retail); ~283 (SKU & barcodes).
- Platform build-in: Shopify has an app here, but it is the weakest in the niche.
- Blast radius: LOW (printing). Duplicate barcodes can mislead inventory, so test uniqueness.
- Our edge: a printer and template library with free label sizes and multi-line text, plus a 24 h human set-up for the merchant's own printer.
- Revolutionary angle: "Any label, any printer, set up for you by a human the same day."
- Route: Shopify POS merchants; POS/retail agencies; Community threads about Dymo and Zebra.
- Money: r = 36 → ~32 paying × $7.99 ≈ $256 MRR (the free leader caps price).
- Halal: OK.
- Scores: D3 · W3 (formula 1, +1 themes ≥ 5, +1 Shopify's own app at 2.3★) · Wave4 · Edge3 · Low flood4 · Low blast4 = **21** → **MAYBE (clean wedge, small money)**.

### N9 — Store migration + catalog import (done for you)
- Demand now: store-data-importer D90 600 (458 apps); bulk-editor 578.
- Trend: mixed. Matrixify 11× (noisy: 10 reviews in 6 days); Marketplace Connect 0.89×; CedCommerce Etsy 0.06×.
- Incumbents: Shopify Marketplace Connect 4.1★/2,134, 1★ 310, free + charges, 2017 · Matrixify (Latvia) 4.9★/1,843, $20–200, 2017 · CedCommerce Etsy 4.5★/1,249, $9–59, 2018 · SyncX 4.8★/933, $7–300, 2014 · Reputon Amazon Importer 4.9★/708, 2023.
- Weakness (30 read): sync corrupted prices or stock (prices zeroed, oversold, SKUs relinked) ×10 · billing complaints ("fraud", charged after uninstall, $30 to export) ×7 · poor support ×5 · needs an Excel guru ×1.
- Flood: ~292 a year (importer); ~797 (bulk editor).
- Platform build-in: MED–HIGH for self-serve. Shopify's Store Migration app lists Square, WooCommerce, Etsy, Wix, Amazon, eBay, Clover and Lightspeed as sources (SEARCH-SUMMARY). The done-for-you service is not built in.
- Blast radius: MED for a one-time migration with a backup; HIGH for live marketplace sync (avoid that part).
- Our edge: **strongest of all 12.** AI maps fields; Dhaka people clean, verify and fix. Sold as a one-time charge through Shopify billing. That is R1's "$99 set-up" idea as the product itself.
- Revolutionary angle: "Your whole store moved and verified line by line in 48 h, for a fixed price, billed through Shopify."
- Route: agencies (they subcontract migrations); WooCommerce/Wix merchants; Shopify's own migration guides.
- Money: the app alone at r = 9 → ~$64 MRR. Service: 10 migrations a month × $199 ≈ $2k a month (ESTIMATE; price unvalidated).
- Halal: OK.
- Scores: D4 · W4 · Wave3 · Edge5 · Low flood2 · Low blast2 = **20** → **MAYBE (service-led; strong first-money route, weak app-store moat)**.

### N5 — Mega menus and navigation
D90 325 (+257 search-nav-other); trend **falling 0.76×**; ~64 launches a year (least-flooded quintile). Incumbents: Globo Mega Menu (Hanoi) 4.9★/1,727, $12.90, 2017 · Globo Smart Product Filter 4.9★/2,391 · Searchanise 4.7★/1,264, $19, 2015 · Qikify Mega Menu 4.9★/1,083 · Buddha Mega Menu 4.7★/616, 2016 (2 of its 10 newest reviews at 1–2★). Platform: themes ship menus (NOT VERIFIED). Blast LOW. Edge: weak. Money: r = 24 → ~$284 MRR. Halal OK. Scores D3 · W2 · Wave2 · Edge2 · Low flood5 · Low blast5 = **19** → **AVOID** (a shrinking job).

### N6 — Bundle builder
D90 693 (other) / 1,741 (product bundles); trend 1.67× (Easy Bundles 6.6×, Rapid Bundles 0.67×); flood ~129 a year (other) but **~548 (product bundles)**; giant flag in product bundles. Incumbents: Rapid Bundles 5.0★/1,601, $15–59, 2022 · Easy Bundles (Skai Lama) 4.9★/1,484, $29–99, 2022 · BundleSuite 5.0★/555, 2024 · Also Bought 4.8★/371, 2016. Platform: **native Shopify Bundles app** (SEARCH-SUMMARY, changelog). Blast MED (cart pricing, inventory). Money: r = 6 → ~$75 MRR. Scores D4 · W1 · Wave5 · Edge2 · Low flood4 · Low blast3 = **19** → **AVOID** (native app plus flood).

### N4 — Fraud, bot and country blocking
Fraud D90 402 (306 apps, ~399 launches a year); geolocation D90 581 (~60 a year). Trend 1.22× (Blockify 1.24×). Incumbents: Blockify (Hanoi) 4.9★/1,840, $9.99–59.99, 2018 · MIDA 4.9★/567, **launched 2025-09-19** · Synctrack chargebacks (Hanoi) 5.0★/451 · Chargeflow 4.5★/436 (3 of 9 recent at 1–2★), usage fees · Blocky 4.7★/362. Platform: Shopify fraud analysis is native (NOT VERIFIED this session). Blast HIGH (blocks real buyers, cancels orders). Edge: Dhaka daytime = US night, so a human can review flagged orders before fulfilment. Money: r = 12 → ~$110 MRR. Scores D3 · W3 · Wave4 · Edge3 · Low flood2 · Low blast2 = **17** → **MAYBE/AVOID** (wrong blast radius for a first app).

### N8 — Returns and exchanges
D90 776 (276 apps); trend 0.70× (EU button decaying, AfterShip 0.5×, Redo 5×); ~365 launches a year. Incumbents: EU Widerrufsbutton (401layers UG) 4.9★/2,320, $9.99–29.99, **2026-01-09** · AfterShip Returns 4.7★/1,543, $19–119, 2017 · Redo 4.9★/839 (not BFS) · Xcotton Post Purchase Guard 5.0★/795, 2024 (shipping protection: halal flag) · Return Prime 4.8★/778, $19.99–149.99. Weakness (25 read): support vanished after sign-up ×9 · hard set-up ×5 · basics behind paywall ×4 · trust (fake-rating suspicion, data harvesting, aggressive AI chatbot) ×4 · broke the cart or footer ×2. Platform: native self-serve returns exist in new customer accounts, with **no exchanges** (SEARCH-SUMMARY, help.shopify.com). Blast MED (refunds). Edge: a human returns desk overnight + AI triage, exchange-first. Money: r = 33 → ~$435 MRR. Halal: OK only without insurance or "protection" add-ons. Scores D4 · W3 · Wave2 · Edge4 · Low flood2 · Low blast2 = **17** → **MAYBE**.

### N7 — Cookie consent (COMPLIANCE niche)
D90 198; trend **0.44×**; ~94 launches a year. Incumbents: Pandectes 5.0★/3,110, $9–49 · Consentmo 5.0★/2,031 · Avada Cookie 5.0★/905 · Consentik 4.8★/305 · Complianz 4.4★/278 (no review since 2026-02-17). Platform: **Shopify built-in "automated privacy"** (VERIFIED, built-in sitemap). Scores D2 · W2 · Wave1 · Edge1 · Low flood5 · Low blast4 = **15** → **AVOID**.

### N-PB — Page and section builders
D90 517; trend **0.54×** (GemPages 0.46×, PageFly 0.69×, EComposer 0.64×); ~187 launches a year. Incumbents: PageFly (Hanoi) 4.9★/5,916, $24–299, 2017 · GemPages (VN) 4.9★/4,272, $29–199, 2017 · EComposer 4.9★/3,473, 2022 · Section Store 4.9★/3,004, $15, 2022 · Omnise 4.9★/877. Platform: Sidekick is a built-in feature (VERIFIED in the sitemap; its page-building scope is Part B's to check). Money: r = 75 → ~$1,630 MRR at $24, but against giants. Scores D4 · W1 · Wave1 · Edge2 · Low flood3 · Low blast4 = **15** → **AVOID**.

### N11 — Appointment and event booking
D90 412 (155 apps); trend **0.56×** (Cowlendar 0.47×, Appointly 0.46×, Servicify 2.66×); ~137 launches a year. Incumbents: Cowlendar (FR) 4.9★/2,257, $13.99–59.99, 2022 · Appointly (IN) 5.0★/1,667, $5–9, 2021 · Logbase delivery date (IN) 4.9★/1,337 · Appointo (IN) 4.9★/946 · BookEasy (Logbase) 5.0★/623, 2023. Blast MED (double bookings). Money: r = 75 → ~$680 MRR (demand is spread). Scores D3 · W1 · Wave1 · Edge3 · Low flood4 · Low blast3 = **15** → **AVOID** (shrinking; Indian low-price incumbents).

*Not carded:* order tracking (rank 42: D90 834, trend 0.54×, ~487 launches a year, Shopify built-in "order tracking") → AVOID.

## 6. Money reality (ESTIMATE)
At the #4 speed, a new app reaches ~$40–1,600 MRR by month 12; N1 is ~$1,000 and N3 ~$36 at that speed. This agrees with round 2's ~$1,200 MRR for 2 apps in month 12. Set-up and migration fees (N9) are the faster first money. The upside comes from becoming #1–#2 in a leaf. A #1 app gets ~112 reviews per 90 days × 10 ≈ 370 installs a month.

## 7. Complaint mining: what merchants repeatedly hate (≥ 20 recent 1–3★ each, from 2025-05 onward)
| Niche (reviews read) | Repeated theme (count) | Product opening |
|---|---|---|
| N1 pre-orders (27) | broke after an update / button vanishes (10); too expensive for small stores (7); bulk SKU/date edits painful (5) | update-safe theme extension with self-test; flat low price; bulk date editor; waitlist → restock forecast |
| N2 labels/gifts (21) | broken or breaks in sales peaks (11); key features only on top plan (4) | peak-load reliability; all placement controls on every plan |
| N3 forms (30) | lost submissions or integrations (5); support slow or upsells (5); bugs (5); Shopify Forms too limited (6) | delivery receipts + alerts; routing to any tool; human set-up |
| N10 labels (21) | template, size or printer mismatch (7); update broke printing (6); billing tactics (4) | free sizes, multi-line text, printer presets, honest flat price |
| N9 import/sync (30) | data corrupted (10); billing (7); support (5) | done-for-you with line-by-line verification; one-time price |
| N8 returns (25, extra) | support vanished after sign-up (9); set-up hard (5) | human desk, exchange-first, set-up included |

**The common thread across all six (my synthesis):** merchants do not hate the feature set. They hate (1) things breaking silently after an update or during a sales peak, (2) support that disappears or turns into an upsell, and (3) billing surprises. An AI-built app with **monitoring, honest flat pricing and a fast human** is the 10× answer, not a cleverer feature.

## 8. Search-demand proxies
- **Google autocomplete** (VERIFIED, suggestqueries endpoint, 81 queries: "best shopify app for", "shopify app for" and "shopify app to" + a–z, 2026-10-31, US-English). Merchant-intent suggestions include: *pre orders* / *pre order* (N1); *free gift* (N2); *forms*, *quote* / *add to quote* (N3); *block customers* (N4); *mega menu* (N5); *bundles* / *product bundles* (N6); *returns* (N8); *import products*, *import reviews*, *matrixify* (N9); *barcode label* (N10); *booking appointments*, *scheduling*, *ticketing* (N11); *order tracking*; *landing page*. Autocomplete shows presence, not volume. No cookie-consent suggestion appeared; *ada compliance* did.
- **Shopify Community "is there an app that…" counts: NOT FOUND.** community.shopify.com robots.txt disallows `/search`, and web search returns lists, not counts. Example threads (SEARCH-SUMMARY): "…shopify can't accept pre-orders without another app?" (t/232998); Wix → Shopify migration (t/47092).

## 9. Self-check (STEP 3)
- **Re-opened decisive sources (2026-10-31, second fetch):**
  1. apps.shopify.com robots.txt: still disallows `*q=*` → method still legal. ✔
  2. sitemap_built_in_features_en.xml: still lists automated-privacy, order-tracking and automated-delivery-dates → the AVOID calls hold. ✔
  3. StoreLeads Judge.me: 646,475 installs / 49,388 reviews, "Updated Oct 23 2026", unchanged → the ratio input holds. ✔
  4. Also re-checked: Retail Barcode Labels app page: developer "Shopify", launched 2018-12-03, free. ✔
- **Counter-evidence searches:**
  - N3: "is Shopify Forms expanding to replace form builders?" Found consent (Jul 2025), translations (Aug 2025) and Sign in with Shop (Mar 2026), all aimed at sign-up popups. Nothing on file upload or conditional logic (SEARCH-SUMMARY). The N3 card holds only for contact, quote and application forms, not popups.
  - N1: a native pre-order feature? None found (SEARCH-SUMMARY).
- **Monday test (N1, then N3):** buildable next week with Shopify CLI (app template), a theme app extension (button + notify form), inventory webhooks, a free email-sending tier and the $19 listing fee. No special access is needed for back-in-stock. **Blocks to name:**
  - (a) storing shopper emails is protected customer data, which needs an access request and review in the Partner Dashboard (Part C to confirm the current steps);
  - (b) pre-orders with deposits use selling plans and deferred payment capture; this is MED blast, so ship alerts first and pre-orders after testing on development stores;
  - (c) sending email needs a provider account (free tier, no card for some, not verified).
  - N3 passes the same test; the CEO's n8n/Make skill covers routing.
- **Numbers recomputed a second way:**
  - Flood for pre-orders: the 24th-newest app (launched 2026-07-13) gives ~80 a year; the 12th-newest (launched 2026-10-12, 19 days earlier) gives ~230 a year. **They do not match (2.9×).** Launches are bursty and possibly accelerating, so launch rates are order-of-magnitude only. They are used for ranking leaves against each other, not as counts.
  - Velocity check: Notify!'s 90-day rate (150 a month) against its year-long average from the trend page (1,820 reviews since 2025-06-29 ≈ 112 a month) is consistent with the "rising" call. ✔

## 10. What I could not verify
- Real install counts. Reviews are a proxy; StoreLeads only sees storefront installs.
- Whether review spikes are organic or solicited (59% of 5★ reviews mention support).
- Theme-native mega menus; Shopify fraud-analysis scope; label-app nativeness; Sidekick's page-building scope (Part B).
- Community thread counts.
- One leaf (product-display-other) was not scored.
- Launch dates of most non-niche top-5 apps (fetched only for the 12 niches, to stay under 1,000 requests).
- Prices of migration services.

## 11. Notes for other parts
- **B:**
  - The EU withdrawal-button app (apps.shopify.com/eu-widerrufsbutton, launched 2026-01-09) has 2,320 reviews. Its velocity fell from ~112 to ~17 a month after June 2026, a textbook deadline wave. Please verify the directive and date at EUR-Lex.
  - Built-in features list: apps.shopify.com/sitemap_built_in_features_en.xml (31 URLs incl. automated-privacy, order-tracking, automated-delivery-dates, b2b, sidekick, magic-product-descriptions).
  - New Shopify apps on page 1: Shopify Smart Pricing (205 reviews), Shopify Messaging (4,764), Shopify Forms (761).
  - Falling velocity where built-ins exist: cookie consent 0.44×, order tracking 0.54×, page builders 0.54×.
- **C:**
  - 59% of recent 5★ reviews of top apps mention support (VERIFIED count). 67% of top-5 apps are BFS.
  - Late entrants who reached the top 5 fast: REZ (2025-05 → 1,638 reviews), MIDA (2025-09 → 567), Delta Retail Barcode (2025-10 → 626, free), Lably (2024-08 → 672).
  - Vietnam-based developers (mostly Hanoi, by the listed address) hold top-5 slots in 8 of the 12 carded niches (Globo, Samita, Blockify, PageFly, Powerful Form, Synctrack, Yanet, Magestore, Consentik, Omnise): a lead for the Vietnamese-winners profile.
- **D:** none.
