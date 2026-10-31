STATUS: FINAL

# M2 Replacement Desk — Phase 2 summary
Opus companion, 2026-10-29. Helper runs used: **1 of 5** (Sonnet, effort high: the intermediary buyer list. It was stopped by the usage limit and resumed by message, so it counts as one run). I spot-checked 5 of its pages and they held. A second helper (QA buyers) was not needed: I built that list myself from the Himalayas jobs API.

## The central findings (read these first)
1. **Licence: clear.** Bangladesh's Overseas Employment and Migrants Act 2013 licenses only recruitment for employment **outside Bangladesh**: s.2(13) "overseas employment" means a citizen's employment outside Bangladesh, s.2(15) defines "recruitment" for employment abroad, and s.9 requires the licence (VERIFIED, bdlaws act-1131, Bangla text). Home-based remote placement is outside it. A rule for domestic placement agencies was NOT FOUND, so ask a lawyer before charging a placement fee.
2. **The fake-candidate wave is real, but it cuts against unknown agencies.** Checkr (2026-10-15, 3,000 US managers): 40% have met a fake-identity candidate, up from 31% in 2025 (VERIFIED). But DOJ (2025-06-30) shows North Korean rings used front companies and "fraudulent websites to promote the bona fides" of remote workers (VERIFIED). A new two-person agency vouching for remote staff looks like that pattern. **Selling verification directly to end employers is weak by design.**
3. **Mode A mostly fails the "human part is the paid part" test, with one exception: QA.** Upwork's own monthly reports show QA-testing demand **+9% MoM (Sep 2025)** and **+19% MoM (Nov 2025)**, because firms "aren't confident the resulting code is ready to ship" (VERIFIED). The threat is real too: Replit Agent 3 self-tests apps in a real browser (2025-09-10, VERIFIED).
4. **Mode B's buyers are middlemen, and they publish their prices.** Vitalis charges a **$2,499** one-time sourcing fee and **$150–200 per VA per month** to manage a client's existing VA. Online Team Member charges 30% of annual salary. micro1 pays referrers a flat fee per role, **up to $3,000**, after 10 hours of work (all VERIFIED). But most "worldwide" staffing agencies recruit only in Latin America, the Philippines or South Africa. Only ~7 post Bangladesh-explicit roles.
5. **Road data:** 2,259 live remote roles open to Bangladesh-based applicants on one board (Himalayas API, Sep–Oct 2026). Only 421 say "worldwide/anywhere" in the text and 9 name Bangladesh. About 25% are posted by staffing intermediaries or AI-talent platforms (my counts, E3).

## Ranked opportunities
| Rank | File | Chain score | Two-key | Weakest step |
|---|---|---|---|---|
| 1 | `M2-release-qa-desk.md`: answer posted manual-QA roles (Upwork first) with real bugs on the buyer's own live app; named human signs each release; scale with in-person-verified Dhaka testers | **1 (Reply, M, E1)** | **3 of 3 → PASS** (Upwork carries Read/Trust/Pay) | Reply (crowded bidding, Connects cost); G4 medium (AI testers in app builders); Repeat unproven |
| 2 | `M2-dhaka-verified-bench.md`: bench of in-person-verified Bangladeshi professionals placed into intermediaries' posted roles; first money from AI-talent platforms' referral programmes (micro1, Mercor), then agency sourcing deals and per-seat management fees | **1 (Pay rail, soft, E2)** | **2 of 3 → PASS** (referral route); agency route 1 of 3, weak | Pay (micro1 payout rail NOT FOUND; bounties are one-off and platform-controlled) |
| 3 | `M2-bengali-eval-pod.md`: verified bn-BD evaluation pod for AI-data platforms' posted Bengali roles ($8–19/h; experts up to $65/h) | 1 (Pay, P8, E2) | 0 of 3 → **weak by design** (pod route) | Pay/Repeat: a job for individuals; vendor route unevidenced |
| 4 | `M2-direct-verified-hire.md`: the model's thesis: "met in person in Dhaka" hires sold to founders who posted remote roles | 1 (Read, soft, E1) | 0 of 3 → **weak by design** | Read, plus the Trust paradox (unknown agency = fraud signal) |
Tie-break of #3 vs #4 (R3): equal two-key, so steps at M + ≥E1 decide: about 6 for #3 vs 5 for #4. By judgment both are no-go as lead routes.

## My bet: #1, the Release QA desk, with #2 as its Mode B engine
**Why:**
- It is the only M2 road where the proof is about the buyer's own case and checkable in 30 seconds. A real bug in their live app, on video, needs no login.
- The partner's exact checklist work *is* the product.
- Upwork's own 2025 data says buyers are paying more humans to check AI-made software.
- Upwork escrow solves Pay into Bangladesh.

**How it scales:** placing testers we met in person in Dhaka. The bench in #2 supplies them and builds the references that every off-platform M2 route lacks.

**What would kill it:**
- The PARTNER CHECK finds Upwork QA posts mostly "US only", or carrying 50+ proposals.
- The bugs-per-hour test finds fewer than 2 real bugs per 45 minutes.
- Window: 12–24 months before AI testers absorb more of the work.

## Three most important verified facts
1. OEMA 2013 s.2(13), s.2(15), s.9: the recruiting licence covers only employment outside Bangladesh (bdlaws, primary).
2. Checkr 2026-10-15: fake-identity encounters 31% → 40%. DOJ 2025-06-30: fraud rings posed as companies vouching for remote workers.
3. Upwork releases: QA testing +9% (Sep 2025) and +19% (Nov 2025) MoM. Vitalis $2,499 sourcing / $150–200 per VA per month; micro1 referral up to $3,000.

## Not verified
- **Upwork's Conversion Fee:** 13.5% × hourly × 2,080, minimum $1,000. Seen only in a search summary of Upwork help plus GigRadar, because Upwork pages block automated reads.
- **Upwork QA post volume, proposal counts and agency mechanics:** PARTNER CHECK.
- **micro1's referral payout method** and the actual per-role amounts.
- Whether any offshore staffing agency pays an outside Bangladesh sourcing partner.
- Bangladesh rules for domestic placement fees.
- **The Gartner "1 in 4 fake by 2028" release:** page blocked. Secondary sources only, as in models.md.
- Staffing Industry Analysts' guidance that buyers should require anti-fraud controls from staffing partners (page blocked; SEARCH-SUMMARY).

## Corrections to models.md (for the manager; I did not edit it)
- **The licence plane is now VERIFIED as clear,** for home-based work only.
- **The Upwork conversion fee has a formula:** 13.5% × hourly × 2,080, minimum $1,000 (SEARCH-SUMMARY + VENDOR). It is no longer "exact fee unclear".
- **The M2 price assumptions** ($500–1,500 placement; $150–400/month margin) **are consistent with market prices:** Vitalis $2,499 sourcing fee and $150–200/VA/month management.
- **A replacement promise is table stakes, not an edge.** Lifetime (Offshore Launch), 5-year (Talent Hackers) and 100-day (Online Team Member) guarantees are all VERIFIED.
- **Mode B's identity-Trust "✔" needs a qualifier:** in-person verification helps only when the buyer already trusts the verifier, which an intermediary or a platform does better than an unknown new agency.

## New ideas outside M2 (one line each, for the final report)
- **Per-seat "verified and managed" service for foreign firms' existing Bangladeshi contractors.** Benchmark: Vitalis $150–200/VA/month. Checkr: 38% suspect an undetected fraudulent employee and 58% suspect dual employment. Fits M6 Dhaka Ground Desk.
- **UK-hours positioning for any offshore staffing:** Dhaka 15:00–23:00 covers UK 09:00–17:00 GMT, which Manila covers only at 17:00–01:00. Useful for M7/M8 UK-facing offers.
- **A Bengali register and safety scorecard on public chatbots,** as a proof asset for M4's language panel and for AI-data vendors.
- **Recruiting-partner networks** (Hyring: the partner keeps 40–65% of a 7–14% fee, waitlist, no Bangladesh yet). Watch for one opening to Bangladesh.
- **CRM / automation-ops roles** (HubSpot, GoHighLevel, n8n) are posted at $900–1,120/month via offshore agencies. That matches the CEO's skills, but it sits next to the killed "automation agency" and is exposed to n8n's AI Workflow Builder (Oct 2025). Skip unless the QA desk fails.
