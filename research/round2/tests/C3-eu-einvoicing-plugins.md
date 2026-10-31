STATUS: FINAL

# C3 — E-invoicing plugins for EU small sellers (WooCommerce / Shopify / Odoo / PrestaShop)
Tested 2026-10-31 by the R2-3 companion. Labels: VERIFIED · SEARCH-SUMMARY · VENDOR CLAIM · ESTIMATE.

**Verdict (one line):** dies. Ten months after Belgium's mandate went live, the 13 Peppol plugins on WordPress.org have **160 active installs between them**; Shopify already has Sufio (~470 reviews) and Quaderno; Odoo does Peppol natively. Merchants solve this in their invoicing or accounting software, not with a store plugin.
**But it produced the round's most useful rail fact:** Shopify pays app developers in Bangladesh (see §6), which reopens app-store companies (used in the report).

## 1. Route proof
| Route | Evidence | Label |
|---|---|---|
| WordPress.org plugin directory (free listing, merchants search it) | Route is open to anyone. Demand through it is tiny: tag "peppol" = 13 plugins; installs: POP 80, SendPol 70, B2Brouter 10, Peppol Plugged 10, the other nine **0**. Ten of the 13 were added in 2026, so sellers rushed in and buyers did not. | **VERIFIED** (api.wordpress.org plugin query, run 2026-10-31) |
| Poland (KSeF) on WordPress | WP Desk's "KSeF for Flexible Invoices" **700** installs (added 2025-12-16) on top of its 6,000-install invoice plugin; 12 other KSeF plugins mostly 0. The incumbent invoice-plugin vendor captured it. | **VERIFIED** (same API) |
| Shopify App Store | Sufio (Peppol, ~470 reviews, ~94% five-star), Quaderno (Peppol + VERI*FACTU, from $29/month), POP (4–7 reviews), ElkSend (Peppol, Nemhandel, KSeF; 1 review), FacturX. | SEARCH-SUMMARY (apps.shopify.com pages via search; the store's search page loads by script) |
| Odoo | Odoo 17/18 send Peppol natively; vendors dispute whether Community edition covers Belgium fully. | SEARCH-SUMMARY (Nalios, ECOSIRE; both vendors) |
| Access-point reseller programmes | Access points already ship their own store connectors (B2Brouter, goRoute, Scrada, SendPol on WordPress.org). | VERIFIED (plugin authors in the API result) |

## 2. Demand trend (dated)
- Belgium: B2B e-invoicing mandatory from **1 Jan 2026** (demand-map §5, SEARCH-SUMMARY). WordPress Peppol installs on **2026-10-31**: 160 in total (VERIFIED). SendPol: added 2025-10-27 → 70 installs a year later (VERIFIED).
- Poland: KSeF for all but micro firms from **1 Apr 2026** (SEARCH-SUMMARY). WP Desk KSeF: 0 (Dec 2025, new) → 700 installs (Oct 2026) (VERIFIED).
- Reading: the legal wave is real, but its money goes to invoicing/accounting SaaS and the incumbent invoice-plugin vendors.

## 3. Size if it works (ESTIMATE, bottom-up)
- Reachable buyers: all Peppol + KSeF WordPress installs today ≈ 160 + ~800 ≈ 1,000 stores (VERIFIED counts). Even if a new plugin won 30% of new installs over 3 years in BE+PL+FR+DE (assume the pool grows 10×, to ~10,000): ~3,000 stores.
- Price: ~€10–15/month (Quaderno from $29; small plugins lower) (ESTIMATE).
- **Year 1 ceiling:** 50 paying stores × €12 × 6 months ≈ **€3.6k**.
- **Year 3 ceiling:** 3,000 × €12 × 12 ≈ **€430k/yr**, and only if we beat incumbents in four languages and tax regimes.

## 4. Odds
- **Strongest failure reason:** the buyer does not look for a store plugin; the accounting/invoicing tool already does it (Odoo native, Sufio, Quaderno, WP Desk, Fakturownia-type SaaS).
- **Counter-evidence search run:** "Odoo Peppol access point native free … Odoo 18" → Odoo native support confirmed by two vendors (one says gaps remain). Plus the install count query above. Both point against C3.
- Odds: **very low (~5%, ESTIMATE).**

## 5. Rung 1 (≤ 3 months, $0) — only if run anyway
- **Offer:** build and maintain store connectors (WooCommerce, Shopify, PrestaShop) *for Peppol access points* that lack them, as a white-label developer. Fixed price per connector via Payoneer invoice.
- **Named targets (access points / plugin owners seen on WordPress.org or Shopify; contact pages not opened):** 1 B2Brouter · 2 goRoute · 3 Scrada · 4 SendPol · 5 Peppol Plugged · 6 Brightfern · 7 efakturuj · 8 Gigaweb · 9 Komplyo · 10 Facturalia · 11 GestOO (webdigit) · 12 POP · 13 WP Desk · 14 Sufio · 15 Quaderno · 16 ElkSend · 17 FacturX · 18 Fakturownia integration author "nestero" · 19 ByteWave (KSeF) · 20 Ksefshop. All names from api.wordpress.org results or apps.shopify.com listings (VERIFIED / SEARCH-SUMMARY respectively).
- **First money:** a fixed-price connector job. It is a services job, not a company.

## 6. Pay rail (VERIFIED, important beyond C3)
- **Shopify Partner payouts reach Bangladesh:** Shopify's partner blog says payouts via Hyperwallet now cover "Ukraine, Turkey, Bangladesh, Nigeria, and Pakistan", by local bank transfer or wire, rolled out from 2 Nov (2021). VERIFIED (shopify.com/partners/blog/payout-methods, opened). Caveat: a 2021 article; re-check in the Partner Dashboard.
- WordPress.org itself pays nothing; premium licences would go through Lemon Squeezy (VERIFIED, demand-map §7).
- WooCommerce.com, Odoo Apps, PrestaShop Addons payout methods: NOT CHECKED (candidate dropped first).

## 7. Competition and AI substitution
- Sellers: Sufio, Quaderno ($29+/month), POP, ElkSend, WP Desk, access points' own connectors, Odoo native. SEARCH-SUMMARY / VERIFIED as above.
- Platform build-in: Odoo has; Shopify's API does not expose the buyer VAT number to apps (Sufio's reply to a Belgian merchant, SEARCH-SUMMARY), which favours Shopify building it in natively.

## 8. Halal and licence
- Halal: yes (tax-compliance tooling). Licence: none, but wrong invoices create VAT penalties for the merchant; liability needs careful terms (P11). EU cold email is off-limits (method T26), so the route is app-store only.
