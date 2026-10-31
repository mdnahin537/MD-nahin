STATUS: FINAL

# M8 — Journey Shothik, re-scored honestly (NYC Bangladeshi restaurants: listing-mismatch fixes)
**Model:** M8 Affinity Desk (baseline; also M1) · **Companion:** Phase 2 Opus, 2026-10-29
**What it is (unchanged from the brief):**
- Fix mismatched hours and phone numbers across Google, the website and delivery apps for Bangladeshi-owned restaurants in New York.
- Path: a Bangla Facebook message from the CEO with one screenshot → free report → ~1 h fix → $100 (first 3), then $150, via Payoneer → $60/month upkeep.
**This file:** the full Path Test v2 re-score that method.md A7 started, with new evidence, and a plain answer to "can it beat its weak steps?"
**Labels:** VERIFIED · E3 · VENDOR CLAIM · SEARCH-SUMMARY · ESTIMATE · NOT FOUND.

---

## New evidence since A7
1. **Road is now countable (E3).** NYC's open restaurant-inspection data (DOHMH, Socrata API, queried 2026-10-29) lists:
   - **79 restaurants coded "Bangladeshi"** inspected since 2025-01-01 (82 in total: 48 Queens, 17 Brooklyn, 11 Bronx, 5 Manhattan, 1 Staten Island; 60 inspected in 2026);
   - **312 coded "Indian"**, many of them Bangladeshi-owned (ownership is not in the data; ESTIMATE).
   - Each row has the name, address and **phone**. No email. Examples: Sagar Restaurant (11432, inspected 2026-10-07), Bangla Garden Restaurant (Bronx 10472), Motin Spice and Sweets (Brooklyn 11208).
2. **Community middlemen exist:**
   - The **Bangladesh-USA Chamber of Commerce and Industry** co-hosted the Bangladesh Remittance Fair in Jackson Heights on 19–20 Apr 2025 (NY Senate resolution J263, VERIFIED).
   - The **Jackson Heights Bangladeshi Business Association**'s president was described as "a tax consultant and notary" (CUNY oral-history interview, undated, SEARCH-SUMMARY). Tax preparers are the trusted maintainers of small Bangladeshi businesses' paperwork.
3. **Pay rail:** Payoneer request with **US ACH debit costs 1%**, about 5 business days (VERIFIED, payments.md). Card is up to 3.99% (+$0.49). **PayPal is not usable** (VERIFIED 2026-10-29; a "PayPal launched" report dated 19 October is being checked by the manager; this file builds nothing on PayPal).
4. **Dead doors confirmed:** Google Business Profile chat ended 2024-07-31 (VERIFIED, method.md). Facebook messages from non-friends go to Message Requests (SEARCH-SUMMARY, method.md).
5. **Halal plane not seen in A7:** some NYC "Indian" restaurants (East Village's Curry Row tradition) are BYOB or licensed (ESTIMATE). Jackson Heights' Bangladeshi restaurants are mostly halal (ESTIMATE). Filter on "no alcohol" before outreach (PARTNER CHECK: NY State Liquor Authority public licence query).
6. **Timezone (DST ends 1 Nov 2026):** NY 09:30–11:00 EST = Dhaka 20:30–22:00. That is a workable calling window for a restaurant's pre-opening hour (ESTIMATE; the owner may not be in yet).

---

## (a) Path Test v2 card (re-score)
```
OPPORTUNITY: Journey Shothik — NYC Bangladeshi restaurant listing fixes | MODEL: M8/M1 baseline
GATES: G1~ (filter out BYOB/licensed) G2✔ G3✔(cap breaker: none proven; a tax-preparer resale is untested) G4~ (listing-sync tools and Google's own AI updates) G5✘ unproven (no dated evidence that listing errors are rising) G6✔
STEPS: Home 2(M,E1) · Road 2(M,E3 names+phones; no email) · Letter 2(M,E1) · Read 1-soft(H,E1) · Impressed 2(M,E1) · Reply 1(H,E0) · Trust 2/2/1 · Pay 1(M rail E2 / H buyer) · Repeat 1(H,E0)
CHAIN: 1 (Read, soft, E1) | TWO-KEY: 0 of 3 → WEAK BY DESIGN (unchanged)
FALSE-0 FIXES: Read → Ra (tax preparers / Chamber) — E1 only, untested; Read → Rb (a phone call at NY 09:30–11:00 = Dhaka 20:30–22:00) — possible but staff answer, not owners; Trust-risk → "done-with-you" (owner clicks while we guide on a WhatsApp video call; no manager access)
FALSE-2 CATCHES (from A7, all still standing): Road (now fixed to 2 by the DOHMH list), Reply (no trigger), Trust-risk (Google login), Pay (Zelle/cash habit)
SOFT-0 TESTS (≤2h, $0): (1) audit 10 DOHMH-listed Bangladeshi restaurants: Google vs website vs one delivery app (PARTNER CHECK; needs a browser); (2) count how many list a WhatsApp number or email publicly
```

### Step-by-step re-score
| # | Step | A7 (v2) | Now | Why it moved or didn't |
|---|---|---|---|---|
| 1 | Home | 2 | **2** (M, E1) | Still public-data only, ~30 min per restaurant. Not yet done by us (E1, not E3): Google Maps can't be read by our automated tools; it needs a human with a browser. |
| 2 | Road | 1 | **2** (M, E3) | **Fixed:** 79 named "Bangladeshi" restaurants with addresses and phones from city data, plus 312 "Indian". **But the contact point is a phone number only**, which moves the problem into Read. |
| 3 | Letter | 2 | **2** (M, E1) | Their own screenshot pair. |
| 4 | Read | 1-soft | **1-soft** (H, E1) | **Delivered:** Facebook goes to requests; GBP chat is gone; no emails in the data; phone calls reach staff at Dhaka night unless timed to the NY morning. **Decision-maker:** often a relative or manager runs the page (ESTIMATE). The middleman route (tax preparers, Chamber) is real (E1–E2) but untested. |
| 5 | Impressed | 2 | **2** (M, E1) | "Your Google says closed Sunday; your site says open" is self-checkable. |
| 6 | Reply | 1 | **1** (H, E0) | Still no dated trigger. A seasonal one exists (Ramadan 1448 from ~8 Feb 2027, Eid; ESTIMATE) but nothing forces action this month. |
| 7 | Trust | 2/2/1 | **2/2/1** | Identity and competence strong. Risk: the fix still needs the owner's Google and delivery-app logins (P2). "Done-with-you" lowers it, but the owner must still find the login (ESTIMATE). |
| 8 | Pay | 1 | **1** (M rail E2 / H buyer) | ACH at 1% works and needs a business bank account. Small NYC restaurants' habit of Zelle or cash is unmeasured (ESTIMATE). |
| 9 | Repeat | 1 | **1** (H, E0) | $60/month upkeep for hours that change a few times a year is easy to cancel. |

**Result:** chain 1 (Read, soft, E1); two-key **0 of 3**; **weak by design**, the same verdict as A7. Road improved from 1 to 2, but that only moves the bottleneck to Read. G5 is unproven.

---

## Can Shothik beat its weak steps? A plain answer
**As specified (direct to owners, Bangla Facebook message, $100 fix): no.** No mechanism fixes Read, and no rail habit fixes Pay. Every route I tried leaves at least two of Read, Trust and Pay at 1.

**What would have to be true for it to win (each one testable, none proven):**
1. **Read via a tax preparer:** one Jackson Heights tax preparer bundles a "listing health check" into the January–April tax-season visit for their restaurant clients. Then Read is the preparer's existing relationship, Trust is borrowed, and Pay is invoiced to the preparer by ACH. *Test:* email 5 preparers with a public email. **NOT FOUND:** any preparer that sells non-tax add-ons.
2. **A trigger:** a dated reason to fix now, for example a delivery platform suspending merchants for wrong hours. **NOT FOUND** in a search (none run successfully this session; I didn't verify any such policy).
3. **Pay habit:** ≥ 3 of 10 owners accept an ACH payment request. *Test:* ask during the first conversation.

**What actually beats Shothik inside M8** (see the other M8 files):
- **Rh (change the country) + Ra (change the buyer):** UK mosques via Gift Aid (`M8-mosque-gift-aid-desk.md`). It has a public, exact proof, statutory deadlines, a UK bank transfer to Payoneer GBP (free), the UK timezone, and examiner accountants as middlemen. It beats Shothik on Read, Trust and Pay.
- The UK restaurant version of Shothik inherits the same Trust-risk (logins) and adds a halal filter (licensed premises). It only gets better Read through accountants. I didn't make it a separate file, because it differs from Shothik only in Read and timezone (method.md A7, Rh).

---

## (b) Reply Card (best version, if tested)
```
BUYER: owner of a DOHMH-listed Bangladeshi restaurant (no alcohol) — or, better, a Jackson Heights tax preparer serving many
CONTACT POINT: restaurant phone from NYC open data; preparer's published email (to be listed)
CHANNEL + legal check: manual phone call to a business line (US; no autodialer, no recorded message — TCPA, ESTIMATE); email under CAN-SPAM (identity, postal address, opt-out); Facebook only as a public comment, never a cold DM
TRIGGER: none dated; seasonal only (Ramadan from ~8 Feb 2027; Eid ~10 Mar 2027, ESTIMATE)
LINE ONE: "ভাই, আপনার Google-এ রবিবার বন্ধ লেখা, কিন্তু ওয়েবসাইটে খোলা" (Brother, your Google listing says closed on Sunday, but your website says open)
PROOF: the two screenshots / their own listing
IDENTITY LINE: "MD Nahin, Dhaka — two-person team; faces + sample: [link]"
RISK REVERSAL: fix first, pay after; done-with-you on a WhatsApp video call; no login shared
EASY ANSWER: "Shall I fix it with you on a 10-minute call? yes/no"
SEND TIME: call NY 09:30–11:00 EST = Dhaka 20:30–22:00
TEST: A = call vs B = email-to-preparer; 10 + 10; stop rule: 0 positive in 20 → stop Shothik for good
EXPECTED: ≤ 3% (ESTIMATE)
```

## (c) Filters
- **Work level:** low-medium (≈1 h fix). Below the brief's "medium/medium-high" bar unless bundled.
- **Demand trend:** **NOT FOUND**. No dated data shows listing errors or their cost rising for this segment. Background: Curry Row fell from 30 to 6 restaurants and 28.2% of NYC Bangladeshis live below the poverty line (SEARCH-SUMMARY, models.md). The DOHMH data shows 60 "Bangladeshi" restaurants inspected in 2026 vs 19 last inspected in 2025 (E3; an inspection-cycle effect, not growth).
- **AI substitution:** medium-high. Listing-sync tools exist, and Google increasingly updates hours from signals (ESTIMATE).
- **Team fit:** good for Bangla. Poor for the timezone (live contact only in the NY morning).
- **Halal:** filter out BYOB and licensed restaurants.

## (d) Price evidence
- Shothik's own $100–150 is the brief's assumption.
- Listing-management tools (Yext, BrightLocal and similar) price per location per month; **not opened this session** (NOT FOUND as verified evidence).
- The brief's lesson: single owners pay about $100–250/month at most.

## (e) Money path and scenarios
| | Low | Mid | High |
|---|---|---|---|
| Restaurants reached | 79 | 150 (+ "Indian" coded) | 150 + 3 preparers |
| Positive reply | 1% → 1 | 3% → 4 | 5% → 8 + 1 preparer (10 clients) |
| Paid | 1 × $100 | 3 × $125 + 1 × $60 × 4 | 15 × $150 + 8 × $60 × 6 |
| Year 1 | **$100** | **≈ $615** | **≈ $5,130** |
All ESTIMATE. Even the high case is below $500/month run-rate.

## (f) Cheap test (7 days, < $20)
Yes. **PARTNER CHECK** (needs a browser):
1. Open 10 DOHMH-listed restaurants on Google Maps, their website and one delivery app; record mismatches (2 h).
2. Count those with a public email or WhatsApp.
3. Call 5 at NY 09:30–11:00 (≤ $5 VoIP; P3) and email 5 tax preparers.

## (g) Monday walk-through
- **CEO:** (1) script the Bangla call (has it); (2) **FLAG:** a VoIP number to call US lines (≈ $5, P3); (3) identity page (has it).
- **Partner:** (1) the 10-restaurant audit (has a browser); (2) SLA licence check (has it); (3) list 10 tax preparers with a public email (has it).
- **Plane:** calling needs a paid VoIP credit and a night-time slot in Dhaka.

## (h) Red team
**Strongest reason it fails:** a small, shrinking, cash-poor segment. The decision-maker can't be reached in writing. The fix needs logins owners can't find, and the price is too small to survive the 3.99% card fee and the time.

**Counter-evidence searches run:**
- "Bangladeshi restaurant owners association New York…": found only a multi-ethnic merchants' group, a small Bangladeshi Business Association (older interviews) and the Chamber's remittance fair. No owners' association with a member list.
- The DOHMH count (E3) shows the pool is ~80–390 restaurants, not thousands.

## (i) vs Shothik
This *is* Shothik. Versus A7: Road better (now E3); Read, Trust and Pay the same.

## (j) Intelligence verdict
The A7 verdict holds, and the new data makes it sharper. The pool is countable but small. The only door is a phone at night, and nothing makes the owner act this month. The formula even understates the problem: G5 can't be shown and the ticket sits below the work-level bar. **Keep Shothik only as a calibration case.** Run the 10-restaurant partner check once to settle Home at E3. Don't spend outreach weeks on it. M8's money is in the UK and in charities, not in NYC restaurants.

## Sources opened (2026-10-29)
- NYC Open Data, DOHMH Restaurant Inspection Results (resource 43nn-pn8j), Socrata API queries for cuisine "Bangladeshi" and "Indian"
- NY Senate resolution 2025-J263 (Bangladesh-USA Chamber of Commerce and Industry; remittance fair 19–20 Apr 2025)
- payments.md (Payoneer ACH 1%; PayPal not usable)
