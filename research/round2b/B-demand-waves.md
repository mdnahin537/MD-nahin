STATUS: IN PROGRESS — next: AI-visibility store check; orphan-app (script tags/tokens) evidence; outside-Shopify routes; then Niche Cards

# Part B — Forced demand waves (2026–2028) and Shopify's build-in risk
Companion B, Round 2B. Started 2026-10-31. Labels: VERIFIED · VENDOR CLAIM · SEARCH-SUMMARY · ESTIMATE · NOT FOUND.

(working notes below; final structure written at the end)

## NOTES 1 — Shopify platform waves (source: shopify.dev changelog RSS, 801 posts 2024-11-01→2026-10-30, fetched 2026-10-31)
- Scripts: edit/publish ends 2026-04-15; all Scripts stop executing 2026-06-30 (VERIFIED shopify.dev/changelog/posts/shopify-scripts-will-be-deprecated-on-june-30-2026, posted 2026-04-09). Originally 2025-08-28 (SEARCH-SUMMARY). PASSED.
- Thank you / Order status upgrade: Plus 2025-08-28; non-Plus 2026-08-26 (VERIFIED, shopify.dev changelog "New webhook to track updates to checkout and accounts configuration", 2025-04-01). PASSED. help.shopify.com unreachable from this session (DNS blocked).
- Script tags: create/update blocked from 2026-10-01 (all API versions); Shopify stops injecting script tags into storefronts on 2027-03-01 (VERIFIED shopify.dev/changelog/online-store-script-tags-deprecation, posted 2026-08-24). Already off on Order status page.
- Expiring offline access tokens: required for ALL public apps from 2027-01-01; apps on non-expiring tokens "will receive authentication errors" (VERIFIED shopify.dev changelog posted 2026-05-20). New public apps since 2026-04-01.
- Legacy customer accounts: deprecated 2026-02-26; final sunset date "will be announced later in 2026"; Shopify says 70%+ of merchants already on new accounts and 800+ apps switched (VERIFIED changelog 2026-02-26; figures are Shopify's own). No sunset date found in changelog up to 2026-10-30.
- Market-driven shipping (feature preview 2026-07-01): merchant-owned delivery-profile APIs deprecated for shops on it (VERIFIED changelog 2026-07-01).
- Shopify Tax managed mode (US) 2026-10-28: Markets/product-publishing writes can fail (VERIFIED changelog).
- Shopify App Pricing: Billing-API apps to migrate to standardized "Shopify App Pricing" (VERIFIED changelog 2026-07-07; tool stage only, no merchant action yet).
- BFS requirements for Returns/exchanges and Subscription apps effective 2026-12-01 (VERIFIED changelog title 2026-06-17).
- Agentic: UCP (Universal Commerce Protocol) live on storefronts (/.well-known/ucp, UCP 2026-08-25); Catalog MCP, Cart MCP, Checkout MCP; Shop MCP adds Shop Pay checkout to any agent incl. Claude and ChatGPT (2026-10-13); Global Catalog REST API off 2026-11-02; Web Bot Auth for agents (2026-05-07) (all VERIFIED changelog titles/bodies).

## NOTES 2 — EU withdrawal button (Directive 2023/2673 → CRD Art. 11a), applies 2026-06-19
- Law text: German BGB §356a "Elektronische Widerrufsfunktion": button labelled "Vertrag widerrufen", always available during the withdrawal period (VERIFIED gesetze-im-internet.de/bgb/__356a.html, 2026-10-31). Application date 2026-06-19 and transposition 2025-12-19: SEARCH-SUMMARY (GT Law, CMS, iubenda); EUR-Lex blocked from this session (202 challenge / DNS).
- Store check (app pages opened 2026-10-31; "90d est" = newest-review pages, ESTIMATE):
  | App (slug) | Dev | Launched | Rating (reviews) | BFS | Price | Reviews last 90d |
  |---|---|---|---|---|---|---|
  | EW: EU Withdrawal Button & Form (eu-widerrufsbutton) | 401layers UG (DE) | 2026-01-09 | 4.9 (2,320) | Y | free; $9.99/$29.99 | ~59 |
  | Revoq (eu-withdrawal-form) | BuschBytes | 2026-03-11 | 4.8 (578) | Y | free; $9/$25 | ~57 |
  | Address Check & Withdrawal Pro (eu-widerruf-pro) | ECOMBEAT | 2026-05-07 | 5.0 (329) | Y | free; $9.90–17.99 | ~30 |
  | EU Withdrawal Button by CL (eu-withdrawal-compliance) | Clevyre | 2026-06-05 | 4.5 (5) | N | free; $5 | 1 |
  | Easy Withdrawal Button & Form (easy-withdrawal) | Easy Shipping Protection | 2026-07-14 | 5.0 (4) | N | free | 4 |
  | Slash: EU Withdrawal Button (eu-withdrawal-button-5) | Slash Themes | 2026-07-20 | 5.0 (1) | N | free; $9.99 | 0 |
  All VERIFIED (app pages). Lesson: entrant 5 months before the deadline → 2,320 reviews in 10 months; entrants 2 weeks before or after → 1–5 reviews. Timing decides forced-wave niches.

## NOTES 3 — EU regulation dates (Commission pages opened 2026-10-31; EUR-Lex itself blocked from this session)
- €3 customs duty per item category on non-EU parcels ≤ €150 from 2026-07-01, "temporary" (VERIFIED commission.europa.eu news 2026-06-29). Replacement by normal duty rates 2028-07-01: SEARCH-SUMMARY (PwC/AEB). Hits US/UK/CA/AU merchants shipping DTC to the EU.
- EUDR: large/medium operators 2026-12-30; micro/small 2027-06-30; new products (soluble coffee etc.) 2027-12-30 (VERIFIED environment.ec.europa.eu EUDR page).
- PPWR Reg (EU) 2025/40: applies 2026-08-12; Commission's Dec-2025 "Environmental Omnibus" proposes suspending the authorised-representative duty for cross-border distance sellers (VERIFIED environment.ec.europa.eu packaging page).
- ECGT Directive (EU) 2024/825 (green claims + harmonised legal-guarantee notice/GARAN label): applies since 2026-09-27; implementing act adopted 2025-09-25 (VERIFIED commission.europa.eu sustainable-consumption page).
- Guarantee-notice (GARAN) apps: ≥11 listings launched 2026-09-01→10-15; best: Pandectes EU Warranty & GARAN (launched 2026-09-18, 5.0, 14 reviews, BFS), Selluxe GARAN (2026-10-14, 11 reviews); others 0 reviews (VERIFIED app pages). Compare withdrawal button: same "display-a-notice" shape, launched AT the deadline, so tiny.
- GPSR (applies since 2024-12-13, SEARCH-SUMMARY): most listings sampled 0 reviews; several launched Jun–Aug 2026 (GPSR Shield 2026-06-12, GPSR Kit 2026-07-08, EU Ready 2026-08-03, GPSR Compliance Manager 2026-08-28) (VERIFIED app pages). Late entrants to a 2024 deadline get nothing.
- More GARAN apps (VERIFIED pages): GuaranteeMark (2026-09-10, 0), Attest (2026-09-01, 0), GARAN by Optimmerce (2026-08-13, 0). More GPSR apps (VERIFIED): GPSR Suite (2026-08-13, 0), Tracewell (2026-06-29, 0), GPSR & CLP (2026-08-25, 0), cadosy GPSR Shield (2026-07-01, 0), Safety Label (2026-07-15, 0), GPSRReady (2026-06-08, 0). → a summer-2026 flood of near-identical, 0-review compliance widgets (an AI-clone pattern). The 2024-era GPSR leaders: NOT FOUND in this sample (search pages are off-limits).

## NOTES 4 — US trade
- Supreme Court, Learning Resources v. Trump, 2026-02-20, 6–3: IEEPA does not authorise tariffs; CIT ordered refunds to all importers (2026-03-04); ~$100B of ~$166B processed by Aug 2026 (SEARCH-SUMMARY: Clark Hill, Foley, Tribune).
- Replacement 10% Section 122 tariff lapsed 2026-07-24; Section 301 duties of 10–12.5% on 60 economies took over the same day (SEARCH-SUMMARY: TT News, Winston & Strawn, UHY).
- De minimis ($800) indefinitely suspended by CBP interim final rule for all non-postal modes, published and effective 2026-06-24 (VERIFIED federalregister.gov API doc 2026-12670); a twin rule covers mail (2026-12669, SEARCH-SUMMARY). Statutory repeal 2027-07-01 under the 2025 budget law: SEARCH-SUMMARY (not re-verified).
- Meaning: every cross-border DTC parcel into the US now needs an entry, HS codes and duty paid; tariff rates keep changing (IEEPA → 122 → 301). Demand = landed-cost/duty display, HS classification, DDP at checkout. Shopify sells this natively (Managed Markets / duties) — check build-in.

## NOTES 5 — UK
- DMCC subscription-contracts regime: "New rules will now come into force in January 2027" (VERIFIED gov.uk news 2026-08-09, "PM starts roll out of everyday fixes…"); duties = clearer up-front info, regular reminders, easy exit. Secondary legislation still unpublished as of 2026-10-22 (SEARCH-SUMMARY, DWF). Government consultation response published 2026-04-02 (VERIFIED gov.uk). Scope: auto-renewing consumer subscriptions incl. free/discounted trials (SEARCH-SUMMARY).
- Same release: autumn-2026 consultation on banning fake "was" prices, invented discounts and misleading RRPs under DMCCA (VERIFIED, same page). → a possible UK version of the EU 30-day lowest-price rule in 2027–28 (ESTIMATE, too early).
- £135 customs-duty relief on low-value imports removed on a day set by regulations "by October 2028 at the latest" (accelerated from March 2029) (VERIFIED gov.uk TIIN "Reforming the customs treatment of low value imports into the UK", published 2026-07-13, updated at Budget 2026-10-28).

## NOTES 6 — Shopify Editions (VERIFIED: shopify.com/editions/winter2026 "Renaissance" (Dec 2025), /spring2026 "Everywhere", /fall2026 "Exponential"; opened 2026-10-31). Shopify now ships Editions ~3×/year.
Native features that eat app categories:
- Winter '26: Sidekick **custom app generation** ("Create an app that recommends which products I need to reorder… checks returns and cancellation eligibility… generates discounted checkout links"); Agentic Storefronts (products discoverable in ChatGPT, Copilot, Perplexity); Rollouts (schedule + A/B test themes); SimGym (AI shopper simulation); heatmaps + bot filtering in analytics; AI chargeback management; unit pricing for all; combined bundle options; Shopify Product Network; SMS in Shopify Messaging; subscriptions on POS; Shopify Collective global; "Shopify Functions replace Scripts in 2026".
- Spring '26: **Product compliance disclosure** ("Add mandatory warnings on products and display them on your store, in AI channels, and the Shop app"); Shopify Catalog "automatically standardizes and enriches your product data… 2x more conversion in AI chats" (Shopify claim); Agentic plan for businesses NOT on Shopify; UCP open protocol; Copilot checkout; AI sales associate in Shopify Inbox; A/B tests on store and checkout; AI store analysis; Shopify Smart Pricing app; stacking product discounts; B2B on more plans; Campaign Autopilot; WhatsApp marketing channel; SMS automations; Flow code editor; automatic label buying; order cancellation requests; smarter purchase orders; category-specific return reasons; Managed Markets UK + Canada; duty calculation breakdown.
- Fall '26: Shop skill for any agent; selling in Google Search AI Mode + Gemini with Shopify checkout; Catalog eligibility check ("find out what to change in order to qualify"); compare-at price to agents; connect store to Gemini, Meta Muse, Microsoft Copilot, ChatGPT sidebar, Grok; Sidekick bulk multi-change plans, draft orders, print-on-demand design, pricing advice, checkout customisations; Rollouts across POS/Google/Shop; RTL languages; Translate & Adapt auto-sync; 20 barcodes/variant; Digital Products app improved; product data mapping by channel; AI chargeback responses + custom fraud rules + auto proof-of-delivery; Shopify Tax "managed for you" + all-in prices; per-market product fees; custom fields in checkout editor; auto-generated store policies; store change log; app events in analytics; Flow triggers on any field change; 13 more admin languages (incl. Bengali); Shop universal multi-brand checkout.
