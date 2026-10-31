STATUS: IN PROGRESS — next: web evidence (growth factor 2019→2026, Luca / Anderson–Magruder at source, rivals' prices, route payouts)

# Part D — Shothik reality test (restaurant reputation, and better-fitting versions)
Written 2026-10-31 by Companion D (Opus). No sub-agents used.
Labels: VERIFIED (primary page or data opened by me) · VENDOR CLAIM · SEARCH-SUMMARY (snippet only) · ESTIMATE (my arithmetic, inputs shown) · NOT FOUND.

## RAW DATA NOTES (checkpoint; to be folded into sections)
Dataset: UCSD "Google Local Data (2021)" (Li, Shang, McAuley; ACL 2022 / arXiv 2207.00422). Primary host datarepo.eng.ucsd.edu failed TLS here (chain ends at emSign root, not in our trust store); documented lab mirror mcauleylab.ucsd.edu/public_datasets/gdrive/googlelocal/ worked (files last-modified Jan 2025). Downloaded District of Columbia (158 MB) and Rhode Island (135 MB) review + meta files.
- Coverage: per-business count in file / Google's num_of_reviews at crawl = median 1.00 (DC n=2,633; RI n=2,841 businesses with ≥20 reviews) → near-complete.
- Crawl mostly ended Q2 2021 (1,656 of DC food businesses' last review falls in Q2 2021; monthly totals collapse after Apr 2021) and 2020–21 is COVID-hit (DC food reviews Apr 2020 = 1,397 vs Apr 2019 = 26,220). **So 2019 is the clean year.** Jan–Feb 2020 ran +12% / +30% over Jan–Feb 2019 (growth was continuing).
- DC food (all food categories), 2019, active businesses N=2,490: p50 5.0/month, p75 11.3, p90 24.0, p95 33.1, p99 70.9. Buckets: ≥100: 11 (0.4%); 30–100: 144 (5.8%); 10–30: 565 (22.7%); 3–10: 907 (36.4%); <3: 863 (34.7%).
- DC "restaurant"-category independents N=1,695: ≥100 0.5%; 30–100 6.4%; 10–30 25.0%; <10 68.1%. Chains (name ×≥3) N=448: similar spread.
- DC price $$ N=991: p50 7.6, p90 29.2; ≥100 0.7%, 30–100 8.7%, 10–30 30.8%.
- RI food N=2,790: p50 4.7, p90 17.8, p99 43.2; ≥100 0.1%; 30–100 2.9%; 10–30 20.7%; <10 76.4%.
- Negative share (1–3★) DC 2019 17.3% of all food reviews; RI 17.8%. 1–2★ ≈ 8.6% (DC), 9.5% (RI). Chains worse (RI chains 25–31% 1–3★).
- Bad-review events per month (median restaurant in tier, DC 2019): <3 tier 0.17; 3–10 tier 0.92; 10–30 tier 2.4 (1–2★: 1.1); 30–100 tier 6.2 (1–2★: 2.7); ≥100 tier 17.8 (1–2★: 7.0). RI nearly identical.
- Owner replies: share of all reviews with an owner reply, DC food: 2016 5.7% → 2017 7.6% → 2018 9.8% → 2019 12.4% → 2020 13.2%; RI 2017 5.9% → 2019 10.4% → 2020 12.3%. Share of restaurants replying at least once in 2019: DC 30.7%, RI 23.7%; replying to ≥50% of reviews (n≥5): DC 10.8%, RI 7.8%. Reply share rises with velocity (DC: <3 tier 17.8% of restaurants reply at all → 30–100 tier 53.5% → ≥100 63.6%). Median reply lag 2019: DC 2.5 days, RI 2.0; 2021: 1.6 / 1.2.
- Verticals 2019 (DC | RI): p50 reviews/month — restaurant 5.4 | 5.2; hotel 15.7 | 5.2; dentist 1.25 | 0.5; med spa 2.0 | 1.1; home services 0.33 | 0.33; auto repair 0.5 | 0.75; law firm 0.25 | 0.25. 1–3★ share — restaurant 17.5% | 18.1%; hotel 14.5% | 21.4%; dentist 9.3% | 5.9%; med spa 8.5% | 9.9%; home svc 11.8% | 8.4%; auto 15.1% | 11.9%; law 12.1% | 7.7%. Reply share of all reviews — restaurant 12.1% | 10.5%; dentist 23% | 24%; med spa 49% | 52%; home svc 62% | 62%; auto 32% | 51%; law 23% | 38%; hotel 25% | 20%. Med-spa and home-services owners already reply to ~half or more.
