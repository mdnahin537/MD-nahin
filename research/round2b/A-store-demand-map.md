STATUS: IN PROGRESS — next: finish review-page crawl (349 top-5 apps of 92 candidate leaves) → flood dating (newest list, 24th app launch date) → scoring → Niche Cards. Raw data in /tmp/partA (scripts in /tmp/partA/scripts).

# Part A — Shopify App Store demand and gap map
Companion A, Round 2B. Started 2026-10-31. Labels: VERIFIED · VENDOR CLAIM · SEARCH-SUMMARY · ESTIMATE.

## Method log
- robots.txt (apps.shopify.com, fetched 2026-10-31): `User-agent: *` disallows `*q=*`, /internal/, /services/, /login/. No search pages fetched.
- Category tree: sitemap_categories_en.xml → 161 category URLs → 121 leaf categories (no child).
- Listing pages: `/categories/<leaf>/all` (default order) and `/categories/<leaf>/all?sort_by=newest` (newest first; the sort exists, VERIFIED on the FAQ category).
- Review pages: `/<app>/reviews?sort_by=newest` (10 reviews per page, rating histogram on the page).
- Stage 1 done (2026-10-31): 120/121 leaf default listings parsed (2,179 unique apps on page 1s). 92 candidate leaves = top-5 reviews ≥ 1,500, minus pay-later (BNPL, halal flag) and NFTs/token-gating.
- Ratio sources so far: Kunal Modi, "Exploring the Shopify App Store" (2021-04-06): "the Reviews/Installs Ratio can range from 5 to 40" (VERIFIED, opened; author's informal observation). StoreLeads install counts (VENDOR CLAIM, pages "Updated Oct 23 2026") e.g. Judge.me 646,475 installs / 49,388 reviews.
