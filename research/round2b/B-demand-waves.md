STATUS: IN PROGRESS — next: EU customs €3 duty, EUDR, ECGT, PPWR, GPSR/EAA store checks

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
