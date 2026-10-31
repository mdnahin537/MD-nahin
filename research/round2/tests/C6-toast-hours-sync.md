STATUS: FINAL

# C6 — Toast hours sync + location-health app
Tested 2026-10-31 by the R2-3 companion. Labels: VERIFIED · SEARCH-SUMMARY · VENDOR CLAIM · ESTIMATE.

**Verdict (one line):** dies. Toast gates its API behind a formal application and certification, Toast **already holds a Google Business Profile connection** for its own AI Reviews Agent (help page updated 2026-10-06), so pushing hours is one feature away, and Marqii already sells the sync.

## 1. Route proof
| Route | Evidence | Label |
|---|---|---|
| Toast partner marketplace | API access "is granted through the Toast Partner Integrations program, which includes a formal application and certification process". A third-party analysis describes an eight-stage process with non-public fees (a 2019 report said 30% revenue share). | VERIFIED (doc.toasttab.com partner integration overview, opened) + SEARCH-SUMMARY (katalystos.com) |
| Restaurant-side API (no partnership) | "Standard API access" is read-only and needs an active Toast employee plus a **RMS Essentials or higher** subscription bought in the Toast Shop. So every customer must pay Toast extra before we can read their hours. | VERIFIED (doc.toasttab.com devApiAccessRequirements, opened) |
| Restaurant agencies (round-1 M1 route c) | 23 agencies with public contacts and restaurant portfolios already listed in round 1 (US, UK, CA, AU). Reply evidence: none. | VERIFIED by round-1 helper (`research/opportunities/M1-shothik-open.md`, table k) |
| Google search ("Toast Google hours wrong") | Toast's help still tells owners to fix Google hours by hand. | VERIFIED in round 1; re-confirmed by search snippet (Toast article, Mar 2026) |

## 2. Demand trend (dated)
- Toast locations: ~147k (Q2 2025, implied) → **~180,000 (Q2 2026), +22% YoY; record 9,500 net adds in Q2 2026**. SEARCH-SUMMARY (Toast Q2 2026 release on BusinessWire / SEC exhibit 99.1, not opened).
- Toast's own product moving into Google: "Connect a Google Business Profile to Toast" now powers **Reviews Agent** (reads and replies to Google reviews), Toast IQ Grow, updated **2026-10-06**. VERIFIED (support.toasttab.com, opened). Round 1 saw hours help updated 2026-09-16 still saying no sync.
- Reading: the base grows fast, and so does Toast's appetite to own the Google surface.

## 3. Size if it works (ESTIMATE, bottom-up)
- Reachable: Toast locations whose owners notice wrong hours and pay for a fix: 180k × 2% = ~3,600 (ESTIMATE). Price: below Marqii's $90/location/month (VERIFIED round 1) and BrightLocal's $40–54 (VERIFIED round 1): ~$15/location/month.
- **Year 1 ceiling:** 150 locations × $15 × 6 months ≈ **$13.5k** (only if Toast certification lands in time, which is unlikely within 3 months).
- **Year 3 ceiling:** 3,600 × $15 × 12 ≈ **$650k/yr**, wiped out the day Toast ships hours sync.

## 4. Odds
- **Strongest failure reason:** platform build-in. Toast already has the Google OAuth connection, an AI agent working on the profile, and +22% location growth to protect. Hours sync is the obvious next feature (P10).
- **Counter-evidence search run:** "Toast restaurant hours sync Google Business Profile automatically 2026 … Marqii". Found: no native hours sync yet (supports the gap) **but** the Reviews Agent GBP connection (above) and Marqii's live Toast→Google hours sync. Net: the gap is real today and closing.
- Odds: **very low (~4%, ESTIMATE).**

## 5. Rung 1 (≤ 3 months, $0)
- No $0 product path: Toast certification is slow and gated; the read-only route costs the restaurant an RMS subscription; Google Business Profile API access also needs Google's approval (round 1).
- **Service fallback (round-1 M1 "Location Health" for agencies):** "We check your restaurant clients' hours on Google, Apple, Yelp and delivery apps against their Toast/website hours weekly; $12 per location per month, white-label; first sweep free."
- **Named targets:** the round-1 list in `research/opportunities/M1-shothik-open.md` table k: 1 The Digital Restaurant · 2 Primi Digital · 3 Diner Designer · 4 Webdiner · 5 Restaurant Web.design · 6 rankONE · 7 Webby Web Design · 8 Eunorial Consulting · 9 Paige Madden Design · 10 Restaurant Genie · 11 Takeaway Growth Agency · 12 Order Directly · 13 Eat Marketing · 14 Toronto Restaurant Growth · 15 Online Order Go · 16 Restaurant Marketing, Inc. · 17 Foodie Agency · 18 BiteCraft Web Design · 19 Vigor Branding · 20 The Order Guys (contacts in that table; VERIFIED by round-1 helper). Halal filter from round 1 applies (licensed venues excluded).
- **First money:** Payoneer invoice to the agency after the free sweep.

## 6. Pay rail
Payoneer invoice (VERIFIED round 1). Toast partner revenue-share payouts to Bangladesh: NOT FOUND (fees and payout terms are not public).

## 7. Competition and AI substitution
Marqii ($90/location, Toast hours sync), BrightLocal ($40–54/location, white-label), Owner.com ($249+/month, listings included), Square (free native sync), Yext/SOCi. VERIFIED in round 1. Toast itself is the main threat (above).

## 8. Halal and licence
Halal: restaurants that hold on-premises alcohol licences (~4 in 10 in NYC, round 1) must be excluded; Toast's base skews to full-service venues, so the filter removes a large share. Licence: none.
