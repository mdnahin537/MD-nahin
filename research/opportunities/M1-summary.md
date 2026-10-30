STATUS: IN PROGRESS — next: confirm buyer-list count from helper-2, then FINAL

# M1 Proof-First Fixer — Phase 2 summary
Opus companion (M1 owner), 2026-10-30.
**Helper runs used: 2 of 5**, both Sonnet, one at a time.
- **Helper 1** (effort high): verified price-and-feature table for listings tools, POS/delivery sync, review software and human review-response services → `research/handoffs/M1-helper-1-prices.md` (47 rows, ~55% VERIFIED on vendor pages). I re-opened Toast's help page, Data Axle's release and Marqii's pricing page; Toast and Data Axle held word for word; Marqii's prices are JS-rendered, so I rely on the helper's re-check.
- **Helper 2** (effort high): named restaurant maintainers (agencies, footer builders, ordering resellers) with contact points → `research/handoffs/M1-helper-2-maintainers.md`. It was cut off by the usage limit before saving and resumed by message (same run).

## The central findings (read these first)
1. **The CEO is right about size, and size isn't the constraint.** The UK food-hygiene API lists 141,322 restaurants/cafés/canteens and 62,963 takeaways; NYC inspected 26,302 food businesses since 2025 (my counts, E3). Road was never Shothik's problem. **Opening the market makes single-owner Read worse:** owners are pitched ~5 times a week and read email "once a day, often at 11pm" (MapsLeads 2026, VENDOR), and "your Google listing is wrong" is the opening line of a known scam (Hiya caught 17,000+ Google-listing robocalls in months, 2023, VERIFIED vendor page; FTC Pointbreak case, SEARCH-SUMMARY).
2. **Software already fixes much of the hours problem, with one big hole.** Square syncs hours to Google automatically (VERIFIED); Owner.com syncs listings everywhere at $249–499/month (VERIFIED); listings software costs $16–60 per location (helper-1). **But Toast, ~180k locations, tells its own customers: "Your hours may be wrong on your Google listing because a Google listing is managed through Google, not through Toast Web"** (Toast help, updated 2026-09-16, VERIFIED).
3. **The cost of wrong data is rising, on dated evidence.** Consumers using AI for local recommendations went from 6% to 45% in a year (BrightLocal LCRS 2026, VERIFIED); AI answers fully match Google data for only 48–56% of 10,000 US businesses (Insites, 2026-07, VENDOR); 66% of US consumers have hit wrong business info (Data Axle, Feb 2026, VERIFIED); Google now may publish a suggested edit if the owner doesn't reject it within 4 days (reported 2026-09-23, SEARCH-SUMMARY).
4. **Access without passwords exists almost everywhere.** Google Manager (VERIFIED), DoorDash Manage Users (VERIFIED), Deliveroo Teams invite (VERIFIED); Uber Eats, Yelp, Apple and Tripadvisor invites (SEARCH-SUMMARY); Just Eat NOT FOUND. The Trust-risk plane becomes *willingness*, which a maintainer route avoids because the maintainer already holds access.
5. **Human review handling is bought, but priced low.** The Social Station: $49/month per outlet for human-written replies (VERIFIED); Marqii AI+human replies $0.75–2 per review (VERIFIED); The HOTH sells agencies white-label reputation (managed replies + listings) **from $275/location wholesale, resold at $500–900** (VENDOR, own blog); AI-only tools $0–80/location. Consumers punish templated replies (50% put off) and expect faster replies (same-day 6% → 19%) (LCRS 2026, VERIFIED). Google's own AI reply suggestions are still a limited test (US/BR/IN).
6. **Legal guardrails verified:** 16 CFR 465.4 bans incentives conditioned on review sentiment; 465.7(a) bans public false accusations against reviewers (eCFR, VERIFIED). UK DMCC fake-review rules apply since Apr 2025 (law-firm note, VERIFIED). Google runs a dedicated review-extortion report form (VERIFIED).
7. **Halal filter, measured:** NY State lists 8,214 + 3,069 on-premises restaurant/food licences in NYC against 26,302 food businesses: about 4 in 10 are licensed (E3 proxy). The filter removes roughly half of sit-down mid-range restaurants and complicates "whole client list" white-label deals.

## Ranked opportunities
| Rank | File | Chain score | Two-key | Weakest step |
|---|---|---|---|---|
| 1 | `M1-reputation-desk.md`: hard-review desk (1–3 star triage, guarded replies, extortion triage, monthly root-cause memo), white-label for restaurant agencies (route c); single owners and groups scored alongside | **1 (Read, M, E1)** | **2 of 3 → PASS** (route c); (a) 0/3, (b) 1/3 weak | Read (crowded white-label inbox) + G4 high (AI replies at $0–10; Marqii $0.75–2/review) |
| 2 | `M1-shothik-open.md`: wrong hours/phones/links across Google, Apple, Yelp, site and delivery apps, open market; routes (a) owners, (b) 5–200-site groups, (c) maintainers | **1 (Read, M, E1)** (route c) | **2 of 3 → PASS** (route c); (a) 0/3, (b) 1/3 weak | Read + the free-rider plane (the proof *is* the fix list) + G4 (Square/Owner sync; software $16–60) |
| 3 | `M1-ai-answer-check.md`: monthly check of what ChatGPT/Gemini/AI Overviews say about a location vs the truth, sources fixed; white-label for agencies | 1 (Impressed, M, E1) | 2 of 3 by formula; **G4 fails** by judgment | Impressed (answers vary by run) + free audits everywhere (Insites, £9.99 tools) |
**Tie-break #1 vs #2 (R3):** equal chain and two-key; equal count of steps at M + ≥E1 (9 each). By judgment #1 ranks first: reviews arrive weekly, so Repeat is real and the work can't be done once by the buyer (no free-rider), while a listings fix is often a one-hour job the maintainer does itself after seeing our proof.

## My bet: the two together, as one white-label "Location Health" line for restaurant agencies, UK first
- **Opener (from #2):** a free, stable, 30-second proof about the agency's own clients: "9 of your 31 restaurants show Google hours that differ from the sites you built" (sharpened for Toast clients by Toast's own admission, and timed to Thanksgiving 26 Nov / Christmas).
- **Retention (from #1):** the hard-review desk + monthly root-cause memo, which needs ongoing human judgment and can't be fixed once.
- **Line (from #3):** "AI repeats your wrong hours" is the 2026 reason to buy, not a product.
- **Price:** $60–90 per location per month wholesale (vs HOTH $275), agencies resell at $150–300. Mid case ≈ $1.5–2.2k/month at the team's capacity ceiling (~30–40 locations).
- **Why UK first:** UK 09:00 = Dhaka 15:00; free GBP bank transfer via Payoneer; PECR allows email to limited companies (Companies House check).
- **What would kill it:** 0 positive replies from 10 personalised sends to agencies (7-day test, $0); or replies of "thanks, we fixed it" (free-rider) and "we use [tool]" (G4).
**What I would not do:** sell either piece to single owners. Route (a) is weak by design in both files, worse than Bangla Shothik on Read.

## Three most important verified facts
1. Toast help (2026-09-16): Google hours "may be wrong" because the listing "is managed through Google, not through Toast Web"; Square, by contrast, auto-syncs hours to Google.
2. BrightLocal LCRS 2026: AI for local recommendations 6% → 45%; same-day reply expectation 6% → 19%; templated replies put off 50%.
3. 16 CFR 465.4 / 465.7 (eCFR current 2026-10-01): no sentiment-conditioned incentives; no public false accusations against reviewers. The CEO's "50% off next time" idea is illegal in the US if tied to the review, and against Google policy.

## Not verified
- **Reply rates** for any restaurant or agency letter: NOT FOUND (only generic 3–5%). The 7-day tests decide.
- **Whether owners click manager invites** for an unknown team (willingness).
- **Share of mid-range restaurants that are licensed** (NYC proxy only, lists not matched row by row).
- **Google AI reply suggestions** outside the US/BR/IN; no official Google page.
- **Yelp, Apple Business, Tripadvisor and Uber Eats invite flows** (third-party sources only); **Just Eat** NOT FOUND.
- **Toast's location count** (~180k, earnings recaps; SEC exhibit not readable).
- **The Google 4-day suggested-edit rule** (secondary sources; Google's page not found).
- **Dubai alcohol share and UAE outreach law** (think-bigger only).
- **How many 1–3 star reviews a mid-range restaurant gets per month** (drives the desk's revenue; PARTNER CHECK in the test).

## Corrections to models.md (for the manager; I did not edit it)
- **M1 "Pay ~":** Pay is **2** for B2B maintainers and groups (UK GBP transfer free; US ACH 1%); it stays 1 only for single owners.
- **M1 plane "the fix needs logins":** partly solved by mechanism: Manager/user invites exist on Google, DoorDash and Deliveroo (VERIFIED) and reportedly Uber Eats, Yelp, Apple, Tripadvisor. The remaining plane is willingness.
- **Add a "free-rider" plane to M1:** when the proof is the full list of fixes, the buyer can fix it alone. Sell something recurring (reviews, monitoring), not the found items.
- **Add the scam pattern-match to M1's Read:** "your Google listing is wrong" is a known scam script.
- **Benchmark scale mode:** Google's Places API costs $0 for 1,000 Enterprise calls/month then $20 per 1,000 (VERIFIED), but its terms limit republishing; a public benchmark must use manual observations.
- **Halal plane for restaurants:** ~4 in 10 NYC food businesses hold an on-premises licence (E3).
- **"Review-reply writing alone" stays killed;** it survives only as hard-review judgment inside a bundle sold to agencies.

## New ideas outside M1 (one line each)
- **UK FSA ratings API** (free, 204k restaurants and takeaways with addresses and ratings) as a public Road for any UK food-business offer, including M8.
- **NYC DOHMH × NY State Liquor Authority open data** can produce a list of unlicensed NYC restaurants: a reusable halal filter.
- **A $29 Gumroad "Toast owner's holiday-hours checklist"** (Toast admits Google hours aren't synced): an M7 asset with a real, verified pain; small.
- **Dubai restaurant listings audit:** ~13k F&B outlets, high churn, Dhaka-friendly hours; test 20 before any outreach (M1/M5).
- **Review-extortion triage kit for agencies** (Google's dedicated form exists): a feature, possibly a paid add-on.
- **"Edit watch" for agencies that lost a client's Google access** before the 4-day suggested-edit window closes: a monitoring add-on.
