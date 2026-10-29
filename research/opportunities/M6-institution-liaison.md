STATUS: FINAL

# M6 — Bangladesh Primary-Source Desk: getting Bangladeshi universities and boards to answer foreign verification requests, for the intermediaries that verify credentials
**Model:** M6 Dhaka Ground Desk · **Companion:** Phase 2 Opus, 2026-10-29 · **Helpers:** helper 1 (screening firms), helper 2 (credential intermediaries), both checked by me
**One line:** Foreign credential-verification intermediaries (qualification verifiers that UK and Australian universities pay, background-screening firms, credential evaluators, healthcare primary-source-verification firms) send verification requests to Bangladeshi universities and boards. Those requests often stall: the institution wants a local fee, a specific office, a follow-up call, or a reply in its own format. We run the Bangladesh end. We (1) check the official online systems first, (2) route the request to the right office, (3) pay the official fee locally with a receipt (passed through at cost, or the buyer pays the institution directly), and (4) chase in Bangla. Then (5) the **institution sends its answer directly to the intermediary**. We never write the verification ourselves, and every step is logged with timestamps.
**Labels:** VERIFIED (I opened the primary page on 2026-10-29) · PRESS (news article opened) · VENDOR CLAIM · SEARCH-SUMMARY (page not opened) · ESTIMATE · NOT FOUND.

**The finding that makes this road (read first):**
Dhaka University issued a press release (reported by The Daily Star, March–April 2026) defending itself against student protests over unanswered verification requests. In it, DU says:
- foreign universities never contact it directly; requests come through intermediaries, and it names them: **"WES, First Advantage, Qualification Check, DataFlow, AMS India, and UHR"**;
- each request needs a **USD 50 fee per student** (syndicate decision of 22 Nov 2015), paid by the intermediary;
- if the intermediary does not pay, the **student can deposit it at Sonali Bank's DU branch**;
- after payment the Controller of Examinations checks the record, and the Registrar emails the report to the intermediary;
- in the case that sparked the protest, **UHR (Sweden) emailed on 4 Mar 2026 without paying**, so the request stalled and the student lost her place ("University Admissions in Sweden does not pay for verifications").

(PRESS, both Daily Star articles opened: "DU students to hold a satirical event…" and "Bureaucratic hurdles stall DU student's higher education dreams".) The buyers, the friction, the local payment rail and the price are all named by the institution itself.

---

## (a) Path Test v2 card
```
OPPORTUNITY: Bangladesh Primary-Source Desk (institution liaison for verification intermediaries) | MODEL: M6
GATES: G1✔ G2✔(no licensed act; processor under PDP Act 2026 s.8) G3✔(cap breaker: short per-case work, checklist, one trained Dhaka helper for deposits/visits) G4✔-medium(paid part = making a non-digital institution answer; a few institutions are already online) G5✔(dated: QC/FT Jun 2026 Bangladesh top-5 falsified; Australia EL2→EL3 8 Jan 2026; Manchester extra checks for UKVI higher-risk countries; DIA 471 fake certificates Apr 2026) G6✔
STEPS: Home 2(M,E2) · Road 2(M,E3) · Letter 2(M,E2) · Read 1(M,E1) · Impressed 2(M,E2) · Reply 1(M,E1) · Trust 2/1→2 after test/2 · Pay 2(M,E2) · Repeat 2(M,E2)
CHAIN: 1 (Read, M, E1) | TWO-KEY: Pay 2 + Trust 2 (after the 7-day test makes competence E3) = 2 of 3 → PASS (conditional); 1 of 3 today
FALSE-0 FIXES: Read → Ra/Rb (sell to the six intermediaries DU itself names, through their supplier/ops inboxes; T3/T8) ; Trust-risk → Rc (the institution replies to the buyer directly: the proof never passes through us) ; Pay → Rd (pay per completed case; institution fee paid by the buyer or passed through with receipt)
FALSE-2 CATCHES: Road → "foreign universities" are NOT the buyer (DU: they never write directly; intermediaries do) ; Pay → fee float: DU alone is $50 per case; fronting 10 cases = $500 (P3) → buyer pays the institution or prepays ; Read → big evaluators (WES) may keep their own direct channel and not want a third party in the chain ; Trust → insiders at institutions have helped verify false records (QC via FT): a local liaison must prove it never touches the answer ; Repeat → Bangladeshi CAS −30.16% YoY (Enroly, Sep 2026): UK volume is shrinking ; Letter/Impressed → "Bangladesh stalls" is not universal: Zinc averages 3 days for Bangladesh education checks, while CRS quotes 15–25 days. Target the slow institutions (DU, NU) and the slow intermediaries, not "Bangladesh" ; Price → Back Check sells a whole Pakistan education check for $15 (excl. institution fees), so our step must be ≤$15–25
SOFT-0 TESTS TO RUN (≤2h, $0): (1) CEO calls DU Controller of Examinations verification desk: current fee, payment methods (Sonali Bank only? online?), turnaround, whether a third party may deposit on an intermediary's behalf; (2) same call to National University and Dhaka Education Board
```

### Gates
| Gate | Result | Evidence |
|---|---|---|
| G1 Halal | ✔ | Verifying credentials is halal. Official fees are paid with receipts and passed through openly. **No informal payments, ever.** TIB's 2023 household survey: 50.8% of households paid bribes for services, and 77.2% of those said services "cannot be obtained without paying a bribe" (VERIFIED, ti-bangladesh.org press release 7136). Where an office demands speed money, we stop and report to the buyer, and the case goes the slow official way. Screen buyers' end clients only for gambling, alcohol or interest-lending decisions (rare for degree checks). |
| G2 Licence | ✔ | No regulated act: we neither evaluate nor certify credentials, and we give no immigration or legal advice. **Data law:** the Personal Data Protection Act 2026 (Act 63 of 2026, dated 10 Apr 2026) is in force from 6 Nov 2025, except s.23 and ss.31–35 (complaints, fines, compensation), which start on a gazetted date after 18 months (s.1(3)). Consent must be voluntary, specific, clear and revocable, and must state purpose, retention, transfer and withdrawal (s.5(2)); the controller bears the burden of proof (s.5(4)). A processor acts under the controller's contract (s.8). The Act reaches processing abroad of people in Bangladesh (s.1(2)(গ)). (All VERIFIED, bdlaws.minlaw.gov.bd/act-1692.) **Practice:** the intermediary is the controller and collects the candidate's consent (Qualification Check and Manchester already use signed consent forms; VERIFIED, Manchester page). We sign a short processor clause and keep files 90 days. |
| G3 Capacity | ✔ | Per case ≈ 30–60 min of work spread over 3–15 days: online check 5 min, request and fee 10–15 min, 2–3 chase calls 15–30 min, log 5 min (ESTIMATE). 70 h/month covers about 60–90 cases. **Cap breaker:** one trained Dhaka helper (a student) does deposits and the rare visit under our checklist; AI drafts the letters and logs. |
| G4 AI substitution | ✔ (medium) | The paid part is making a slow, mostly offline institution answer: a Bangla call to the right desk, a local fee, sometimes a visit. A Prothom Alo op-ed says most public and many private universities have incomplete online records and no digital verification (PRESS/opinion, SEARCH-SUMMARY). Online verification exists at some institutions (BUP via BdREN, SUST digital certificates, Daffodil blockchain, IIUC form; SEARCH-SUMMARY), and **no UGC-run national platform was found** (NOT FOUND, one search). Risk: over 24 months more institutions go online. AI voice agents already make employment-verification calls in the US (Superunit: "over 70,000 employment verifications", VENDOR CLAIM, YC page opened), but they cannot pay at Sonali Bank or stand at Room 310. |
| G5 Demand trend | ✔ | (1) **Fraud data:** Qualification Check's analysis of ~55,000 offers at 45 UK institutions (2024–25): nearly 5% of international offers involved false claims, and **Bangladesh is third** after Nigeria and Ghana (PRESS, bdnews24 2026-06-28, summarising the FT). (2) **Regulators:** Australia moved Bangladesh from Evidence Level 2 to 3 on **8 Jan 2026** (PRESS, Daily Star, opened). The UK cut the BCA refusal limit from 10% to 5% (PRESS, PIE News). (2b) **The strongest dated point, from a buyer's own data:** Qualification Check's 2025/26 sector report (17,663 checks for 40 UK universities, Oct 2025–Jun 2026): checks on Bangladeshi qualifications "more than tripled" year on year, and Bangladesh's fraud-signal rate rose from 2.6% to 9.5% (small sample, flagged by QC); "review your Bangladesh applicants now" (VERIFIED as a VENDOR CLAIM, qualificationcheck.com report page opened; found by helper 2). (3) **Buyers adding checks:** Manchester is "proactively undertaking additional checks" on qualifications from UKVI higher-risk countries, through Qualification Check where no online system exists (VERIFIED, manchester.ac.uk). (4) **Inside Bangladesh:** DIA flagged 471 teachers and staff with forged certificates, confirmed through NU "official correspondence" (PRESS, Prothom Alo 2026-04-16, opened), after ~1,000 in a 2022 DIA report (SEARCH-SUMMARY). **Counter-point:** UK Bangladeshi CAS fell 30.16% YoY for Sep 2026 (VERIFIED, Enroly briefing), and UCAS-flagged suspicious applications fell from 1,375 (2024) to 435 (2025) (PRESS, bdnews24). Checks per applicant are rising while UK volume is falling. |
| G6 Killed list | ✔ | Not "generic research/data work" (it is a primary-source operation with local payment and calls), and not "translation checking". |

### Step card (R5 splits)
| # | Step | Score | Basis / evidence | Plane check |
|---|---|---|---|---|
| 1 | Home | **2** | M/E2: a public "Bangladesh Verification Route Map" for ~25 institutions (office, email, phone, fee, payment method, online portal, typical time), built from public pages and Bangla calls, plus one live test on the CEO's own certificate. About 10–12 h. DU's process is already public (PRESS). | P2 passed (no login). P3: phone credit ≈ $2. |
| 2 | Road | **2** | M/E3: DU names six buyers itself; 24 named organisations with a public contact point are listed below (helpers 1–2, 11 re-opened by me). | — |
| 3 | Letter | **2** | M/E2: "Dhaka University's statement names [you] among the intermediaries it serves. Its rule is $50 per student, paid in Bangladesh, or the request waits: UHR's request of 4 March stalled that way." Their own fact, from a public source. | — |
| 4 | Read | **1** | Delivered: business or ops inboxes ✔. Neither helper found a supplier-application form at 60 organisations. Noticed: likely, because supplier mail about their own Bangladesh backlog is on-topic (T3), and the industry openly buys this exact service: ClearStar (2017) says global screeners rely on local suppliers because "Fees and other payments are often required to be in local currency", often in advance or "by bank drafts" (VERIFIED, clearstar.net blog). Decision-maker: verification-operations or institution-relations lead (named only on LinkedIn for some) (M/E1). | P7: CAN-SPAM; UK/IE/AU corporate inboxes fine; Sweden (UHR) is a government agency: one polite message only. |
| 5 | Impressed | **2** | M/E2: they can check in 30 seconds, in their own queue, whether their DU/NU cases stalled, and DU's rule is public. | — |
| 6 | Reply | **1** | M/E1: no hard deadline. Soft triggers: UK January-intake verification peaks in Nov–Dec, Australian Feb intake; any public dispute like DU's. Easy yes/no: "Want us to clear 5 of your stuck Bangladesh cases, paid only on completion?" | — |
| 7 | Trust | **2 / 1→2 / 2** | Identity M/E2 (real names, faces, Dhaka address, Bangla; T15/T21). Competence H/E0 today → E3 after the test (one completed official verification, on the CEO's own record, with the institution's own email). Risk M/E2: **the institution replies to the buyer, not to us**; pay per completed case; receipts for every fee. | P11: we warrant only what we did (request filed, fee paid, call log), never the credential. |
| 8 | Pay | **2** | M/E2. Rail: Payoneer receiving account and requests. UK direct GBP bank transfer free; US ACH 1%; card ≤3.99% (VERIFIED rates, payments.md). Buyer uses it: verification firms pay suppliers by bank transfer (ESTIMATE, standard B2B). Collection: monthly invoice for completed cases; pass-through fees prepaid. | P8 passed for UK/US/AU firms. P3: **fee float**, fixed by prepayment or by the buyer paying the institution directly. Vendor onboarding may ask for company registration or insurance (see planes). |
| 9 | Repeat | **2** | M/E2: verification is a continuous flow at each intermediary (DU: requests "through intermediaries" routinely; Manchester checks every offer-holder from higher-risk countries). One client means a monthly case flow. Volume per client: NOT FOUND (ESTIMATE below). | — |

**Planes found by the Monday test (A6):**
- *Company registration / E&O:* screening firms that follow the PBSA standard must themselves hold $1M E&O, or, under the **General Standard**, attest where such cover "is not commonly available" (VERIFIED, PBSA accreditation tip, Clause 6.4). Whether they push E&O onto in-country suppliers is NOT FOUND. Fix: ask in the first reply; offer per-case pricing with no liability beyond re-doing the case.
- *Office hours:* institutions work Sun–Thu, roughly 09:00–17:00. Both founders are part-time. Fix: one fixed 45-minute call window on three weekdays.
- *Visits:* rare, but DU's fallback is a Sonali Bank deposit at the DU branch. Fix: batch deposits weekly, or have the buyer wire DU directly; a trained helper later.

---

## (b) Reply Card
```
BUYER (exact role): head of verification operations / institution relations / international verifications at an intermediary that verifies Bangladeshi credentials (Qualification Check, DataFlow, First Advantage, WES, UHR, Ecctis, screening firms; list below)
CONTACT POINT: published ops/partner inbox or supplier form (per buyer, list below)
CHANNEL + legal check: plain-text email, no attachment (T17); CAN-SPAM identity + Dhaka postal address + opt-out; UK/IE limited companies OK under PECR; Swedish agency: one message
TRIGGER (why now, dated): DU's 2026 statement naming them; UK January-intake verification peak (Nov–Dec 2026); Australia EL3 since 8 Jan 2026
LINE ONE (their fact): "Dhaka University's statement this spring named [Firm] among the intermediaries it verifies for, and said requests wait until a $50 fee is paid in Bangladesh."
  (QC variant: "Your July report says Bangladeshi checks more than tripled this cycle, and Dhaka University says it answers only after a $50 local fee.")
PROOF (30-second self-check): "Check your open DU/NU cases: any older than 15 working days?" + our public route map (link after reply)
IDENTITY LINE (T15): "We are MD Nahin and [partner], a two-person desk in Dhaka. Faces and address: [link]."
RISK REVERSAL (T22/T25): "We clear 5 stuck cases first; you pay only for cases where the institution's own email reaches you. Fees prepaid or paid by you directly."
EASY ANSWER (yes/no): "Want us to take 5 stuck Bangladesh cases? Reply yes."
SEND TIME: UK 09:00 = Dhaka 15:00 (GMT since 25 Oct 2026); Sweden 09:00 = Dhaka 14:00 (CET); US East 09:00 = Dhaka 20:00 (EST from 1 Nov 2026); Dubai 09:00 = Dhaka 11:00
TEST: A = DU-statement line vs B = "stuck cases" line; 12 + 12 sends (pool is ~25–30); stop rule: 0 positive in 24 → change route to screening-firm vendor forms (helper 1 list)
EXPECTED: baseline 3–5% → target ≥8% positive (ESTIMATE; on-topic supplier mail about their own named problem)
```

## (c) Filters
- **Work level:** medium-high. Routing a request through an opaque public office, paying correctly, chasing in Bangla without bribes, and keeping an audit-grade log. The partner's checklist strength is the product; the CEO's Bangla calls are the edge.
- **Demand trend (≥2 dated points, earlier vs now):** Qualification Check: Bangladeshi checks more than tripled from the 2024/25 to the 2025/26 cycle; fraud signal 2.6% → 9.5% (VERIFIED, QC report July 2026). Also: 2022 DIA report ~1,000 teachers with fake certificates (SEARCH-SUMMARY) → 471 more flagged in April 2026 via NU official correspondence (PRESS, Prothom Alo, opened). Australia EL2 → EL3 on 8 Jan 2026 (PRESS). FT/QC 2024–25 cycle: Bangladesh third-most falsified (PRESS, Jun 2026). Bangladesh student-visa refusal 22% (YE Sep 2025, SEARCH-SUMMARY) → 14.0% (YE Jun 2026, PRESS), still nearly 3× the 5% limit, so sponsors keep checking.
- **AI-substitution risk (12–24 months):** medium (G4). Online records spread slowly; offline public universities are the core.
- **Team fit:** strong. Desk-first, Bangla, exact logs. Visits rare and batchable. Live calls with buyers are not needed (async email).
- **Halal:** pass, with an absolute no-bribe rule (G1).

## (d) Real price evidence (what buyers pay today)
| Source | Price | Label |
|---|---|---|
| Dhaka University verification fee charged to intermediaries | **USD 50 per student** (syndicate decision 22 Nov 2015); student fallback: deposit at Sonali Bank DU branch | PRESS (Daily Star, DU release, opened) |
| DU transcript/attestation fees paid by students | emergency transcript Tk 2,800; attestation Tk 200 per page and Tk 200 per envelope | PRESS (Daily Star, opened) |
| Ecctis (UK ENIC) verification | from **£50** per verification; **+£20 flat per verification for "high risk" countries** | VERIFIED (help.ecctis.com) |
| Qualification Check | "Pricing varies based on where qualifications are being verified… by country, institution"; **£49** list price per check | VERIFIED wording; £49 SEARCH-SUMMARY |
| Teesside University (uses Qualification Check) | "usually £30.00" charged to applicants | SEARCH-SUMMARY |
| Atlantic Data (SRA degree validation) | £54.84 per international degree | SEARCH-SUMMARY |
| WorkPro (AU) qualification check | India AUD 57, Pakistan AUD 72; **Bangladesh not listed: "Other countries: ask our team"** (V28 Aug 2026) | VERIFIED (PDF) |
| HRBD (Dhaka) full candidate packages | BDT 10,999–42,999 per candidate | VENDOR CLAIM, page opened |
| CRS Checks (US), retail, Bangladesh | Education degree verification **$69, 15–25 days**; employment $69; reference $69; directorship $150 | VERIFIED (crschecks.com/order/form/bangladesh.asp; found by helper 1, re-opened by me) |
| Back Check Group (Singapore/Karachi), Pakistan education verification | **$15** (struck-through list price $49), "exclusive of university/board/Institute charges", 5–25 working days | VERIFIED (backcheckgroup.com, re-opened by me) |
| Background Check Group (Singapore/Karachi), **University of Dhaka degree verification** | **$49**, 10–15 working days, "exclusive of university charges" (an NU degree check is also listed at $49, per helper 1); claims "ground field officers" in Bangladesh | VERIFIED (backcheckgroup.com/product/university-dhaka-degree-verification-bangladesh-2/, price in page data, re-opened by me); field-officer claim VENDOR CLAIM |
| Zinc (UK), average turnaround of institution-verified education checks | **Bangladesh 3 days**; Pakistan 17 days ("Last updated October 29, 2026") | VERIFIED (zincwork.com/turnaround-times/education, re-opened by me) |
**What we would charge (ESTIMATE):** $8–12 for an online-system check with timestamped capture; **$15–25 per liaison case**, plus the institution's official fee at cost; $40–60 plus fares for a rare visit. Back Check's $15 retail price in Pakistan, which excludes institution fees, caps what an in-country step can charge. Retail buyers already pay $69 (CRS) or £50 + £20 (Ecctis) for the whole verification, so a $15–25 input leaves the intermediary its margin.

## (e) Money path and 3-scenario estimate
**Path:** first job = 5–10 stuck cases for one intermediary at $15–25 each ($100–250) → monthly flow of 20–40 cases from that intermediary → 2–3 intermediaries plus bundled employment and company checks for the same clients → $1,000+/month. Second products for the same buyers: employment calls (M6-employment-reference-desk, $15–25 per check) and company checks (M6-counterparty-quick-check, $150–250 each).
Formula: reachable intermediaries × positive-reply rate × conversion × cases/month × fee (+ bundled checks).
| Scenario | Assumptions (all ESTIMATE; volume per buyer is NOT FOUND) | Month 6 |
|---|---|---|
| Low | 30 emailed × 4% → 1 reply × 50% → 0–1 client × 10 cases × $15 | ≈ $0–150 |
| Mid | 40 (helpers' lists) × 8% → 3 replies × 50% → 1–2 clients × 25 cases × $20, plus 10 employment checks × $20 and 1 company check × $200 | ≈ $900–1,400 |
| High | 40 × 12% → 2–3 clients × 40 cases × $25, plus 30 employment checks × $20 and 3 company checks × $200 | ≈ $3,600–4,200 (≈ 110–130 h of work → needs the Dhaka helper at ~$150–250/month, ESTIMATE) |
**Honest read:** liaison alone reaches $1,000/month only at ~50 cases a month. The mid case needs the bundle. And it depends on one fact we do not have: how many Bangladesh cases a single intermediary handles per month. The 7-day test cannot measure it; the first reply can, so ask it.

## (f) Cheap test (7 days, ≤$20)
1. **Route map (partner, 6 h, $0):** for DU, NU, BUET, CU, RU, JU, KU, SUST, BUP, NSU, BRAC, IUB, AIUB, DIU, EWU, Dhaka/Chattogram/Rajshahi education boards, the Madrasah board and BTEB, record from public pages: verification office, email, phone, fee, payment method, online portal and stated turnaround.
2. **Bangla calls (CEO, 2 h over 2 days, ≈$2 credit):** call 10 of them in office hours. Ask: "A foreign verification company has sent a request; how is it paid and who replies?" Record who answered, the fee and the method, and whether a third party may pay on the requester's behalf.
3. **Live proof (CEO, ≤$15 in fees):** request official verification of the CEO's own HSC or degree through the institution's foreign-request channel or online system, with the reply sent to a Gmail the CEO controls. Time it.
**Pass:** ≥15 of 20 institutions mapped; ≥6 of 10 calls answered with a usable process; the live proof returns an institution-sent email within 15 working days.
**Fail → stop:** most institutions have working online systems (the problem is already solved), or none will deal with a third party.

## (g) Monday walk-through (Monday is a Bangladeshi working day)
- **CEO 1:** call DU's Controller of Examinations verification desk (examcontroller@du.ac.bd is the published contact, SEARCH-SUMMARY; the phone number comes from du.ac.bd). Ask the four soft-0 questions. *Asset: phone ✔.*
- **CEO 2:** build the identity page: names, faces, Dhaka address, one paragraph, on Google Sites (free, 1 h). *Asset: missing today → built Monday.*
- **CEO 3:** draft Reply Card variants A and B (AI drafts; CEO edits). *Asset ✔.*
- **Partner 1:** route-map sheet, first 8 institutions from public pages. *Asset: browser ✔.*
- **Partner 2:** case-log template (case ID, institution, request date, fee and receipt, calls, institution reply date, reply forwarded by institution Y/N). *Asset ✔.*
- **Partner 3:** one-page processor clause (PDP Act s.5/s.8: we act on the intermediary's instructions and its candidate consent; 90-day retention; no onward transfer). *Asset ✔; not legal advice.*
**Missing assets (planes):** no registered company (some vendor onboarding needs it; sole-proprietor invoicing via Payoneer works for the first jobs, ESTIMATE). No E&O (see planes). No cash float (fixed by prepayment).

## (h) Red team
**Strongest honest reason it fails:** the big intermediaries already have a working, if slow, route. They email the institution, wire the fee, or push the applicant to pay at Sonali Bank, and the applicant does the chasing for free. A two-person Dhaka desk sells **speed** on a cost the intermediary does not bear (the applicant's lost time). Some will not pay for speed. Worse, after the FT/QC finding that "insiders at educational institutions allegedly helped verify false academic records", a local middleman in the chain can look like the fraud channel itself.
**Counter-evidence search I ran:** (1) "Do verification intermediaries already use Bangladesh agents?" DU names **AMS India**, an India-based intermediary, among its requesters (PRESS), and Bangladeshi screening vendors (HRBD, Verifications.asia, Enroute: "strong relationships with [institution] authorities") already verify education for local and foreign employers (VENDOR CLAIM, pages opened). So the job is done today by some, at some speed. (2) "Is Bangladesh going online centrally?" No UGC platform found; the 2025 MoFA online system is for apostille and applicants (PRESS, Daily Star 2025-08-23). (3) Indian analogue: Zoho-hosted "DocsWallet" knowledge base handles verification requests from Indian institutes to WES (SEARCH-SUMMARY). The liaison model exists next door.
(4) **A direct competitor sells our core case retail:** Background Check Group (Singapore HQ, Karachi office) lists a University of Dhaka degree verification at $49 (+ university charges, 10–15 working days) and an NU check at $49 (VERIFIED for DU). It also claims field officers in Bangladesh. So DU liaison is a known, priced product. Our opening is the wholesale step for intermediaries that lack such a route, at a price well below $49.
(5) **The strongest counter-fact, found by helper 1 and re-opened by me:** Zinc's live turnaround table shows institution-verified education checks for **Bangladesh averaging 3 days**, against Pakistan's 17. So at least one intermediary already gets fast Bangladeshi answers, probably through online board results or a local route. Meanwhile CRS Checks quotes 15–25 days and Verifile 5–15 working days. The friction is uneven. It probably sits in specific institutions (DU's paid process, NU's volume), not in "Bangladesh".
(6) **Who pays?** Helper 2: many credential evaluators (WES, CES Toronto, NZQA, ECFMG) make the **applicant** arrange for records to be sent by the institution, so the evaluator never feels the delay. The paying buyers are the verifiers that do the institution contact themselves and sell turnaround to universities or employers (QC, DataFlow, TEC's DVS, Ecctis, screening firms). UHR refuses to pay institution fees at all.
**What would kill it:** in the 7-day test, most institutions answer foreign emails promptly once paid online. Then the friction is only the fee, which intermediaries can pay themselves. Or the first replies say "we already average under a week".
**What keeps it alive:** the buyer never has to trust our word, because the institution's own email arrives in their inbox. That is the only design that survives the insider-fraud objection.

## (i) vs Shothik (step by step)
- **Read: better.** Shothik's Facebook message lands in Message Requests. Here, a B2B ops inbox gets supplier mail about a problem a Bangladeshi university publicly tied to the buyer's name.
- **Trust: better.** Shothik needed the owner's Google login (P2). Here we need no access, and the proof is the institution's own email to the buyer.
- **Pay: better.** A restaurant may pay by Zelle or cash. Here a verification firm pays monthly by bank transfer into Payoneer GBP/USD.

## (j) Intelligence verdict
The formula undersells this a little and oversells it a little. **Undersells:** Letter, Impressed and Road all rest on one public document in which a Bangladeshi university names the buyers, the fee and the failure. That is rarer and stronger than any E-grade suggests. **Oversells:** Repeat scores 2 on mechanism, but volume per buyer is unknown and UK volume is falling (−30%). I believe this is **the one M6 road where "only in Bangladesh" is true for a desk team**: local fee rails, Bangla calls to registrar offices, and a weekly Dhaka errand. It is narrow (a realistic $500–2,000/month) and best used as the wedge into verification firms, which can later buy employment calls and company checks from a supplier they already trust. **Bet on it, with the 7-day test first.**

---

## Named buyers (24 with a public contact point)
Sources: helper 2 (`research/handoffs/M6-helper-2-intermediaries.md`, 26 rows) and helper 1 (`research/handoffs/M6-helper-1-buyers.md`, 34 rows), both 2026-10-29. I re-opened 11 of these pages myself: QC report and contact, DataFlow FAQ and contact, UHR Bangladesh page, CRS, Back Check DU product, Verifile, Zinc, First Advantage, ClearStar. All held. **No organisation publishes a supplier-application form for in-country partners** (both helpers), so every approach is a cold email or form to the address shown. "DU-named" = named in Dhaka University's 2026 statement.
| # | Organisation (country) | Type | Fit signal | Public contact point |
|---|---|---|---|---|
| 1 | **Qualification Check** (UK) | verifier paid by 40+ UK universities; WES's verification partner (helper 2) | **DU-named.** Its own July 2026 report: Bangladeshi checks "more than tripled"; fraud signal 9.5% vs 2.6%; "review your Bangladesh applicants now" (VERIFIED) | enquiries@qualificationcheck.com (VERIFIED); newinstitute@qualificationcheck.com (helper 2, purpose inferred) |
| 2 | **DataFlow Group** (UAE) | healthcare/professional PSV for Gulf regulators | **DU-named.** FAQ: "Some issuing authorities may require an additional fee" (VERIFIED) | business@dataflowgroup.com (VERIFIED) |
| 3 | **The Evaluation Company (TEC, ex-SpanTran)** (US) | credential evaluator with a Document Verification Service | "Response time may vary by country and institution" | verification@evalcompany.com |
| 4 | **Ecctis (UK ENIC)** (UK) | evaluator; verification for organisations, 180+ countries | £50 per verification **+£20 for high-risk countries** (VERIFIED) | ecctis.com/contact form ("Verification for organisations") |
| 5 | **A.M.S. Inform** ("AMS India", probable) (India) | background verification | **DU-named** (identity PROBABLE); Bangladesh listed as a support region | hello@amsinform.com |
| 6 | CRS Checks (US) | screening firm | Bangladesh education check $69, **15–25 days** | crschecks.zendesk.com/hc/en-us/requests/new |
| 7 | Verifile (UK) | screening firm | Bangladesh education 5–15 working days | service@verifile.co.uk |
| 8 | Credibled (Canada) | screening firm | education "confirmed with the institution"; Bangladesh priced at a premium | info@credibled.com |
| 9 | InfoMart (US) | screening firm | intl education checks via "in-country, local-language partners" | Sales@InfoMart-USA.com |
| 10 | Veremark (UK) | screening platform | Bangladesh page; buys from "global providers" | veremark.com/contact |
| 11 | WorkPro (Australia) | screening firm | qualification table omits Bangladesh ("ask our team") | info@workpro.com.au |
| 12 | Secure Screening Services (UK) | screening firm | "Global Qualifications Check £35" worldwide | hello@securescreeningservices.com |
| 13 | Corra Group (US) | screening firm | "$55 per degree" worldwide | (310) 524-9800 |
| 14 | Educational Perspectives (US) | credential evaluator | Bangladesh in its country list; may request documents sent by the institution | info@edperspective.org |
| 15 | VETASSESS (Australia) | skills assessor with an integrity-checking service | runs employment/qualification integrity checks abroad (Bangladesh not named) | info@vetassess.com.au |
| 16 | NZQA (New Zealand) | government qualification assessor | some records must be "emailed direct to NZQA from awarding institution" | QRSenquiries@nzqa.govt.nz |
| 17 | ECE (US) | credential evaluator | Bangladesh on its country list | ece.org/Contact |
| 18 | CES, University of Toronto (Canada) | credential evaluator | institution-sealed records required | learn@utoronto.ca |
| 19 | IQAS (Alberta, Canada) | government evaluator | Bangladesh education guide | alberta.ca/iqas-contact |
| 20 | ICAS of Canada | credential evaluator | (Bangladesh page NOT FOUND) | icascanada.ca/en/contact-us |
| 21 | Nuffic (Netherlands) | Dutch ENIC | Bangladesh education-system page | nuffic.nl/en/contact; +31 70 4260 260 |
| 22 | UHR, University Admissions in Sweden | national admissions body | **DU-named**; Bangladesh page "checks the authenticity of your documents with the issuing institution" (updated 06 Oct 2026, VERIFIED). **But it does not pay institution fees**: low fit as a payer | support-centre link on the Bangladesh page |
| 23 | Background Check Group (Singapore/Karachi) | regional screening firm | sells DU and NU degree checks at $49 and claims field officers: **competitor or buyer** | info@backcheckgroup.com |
| 24 | Greves Verification Solutions / Verifications.Asia (UAE) | Gulf verification firm | Bangladesh education checks; claims on-ground screeners: **competitor or buyer** | info@gvs.ae |
**Not counted:** WES (DU-named; contact page returned 403; per helper 2, QC fulfils WES verifications, so reach WES through QC), First Advantage (DU-named, but lists its own Bangladesh location), HireRight, Accurate, Checkr, Certn (no data-supplier route), IERF, ERES, ECFMG (sites returned 403), Josef Silny (phone from a search preview only), uni-assist (role in verification not shown), CGFNS (no verification mailbox).
**Order of approach:** QC → DataFlow → TEC → Ecctis → AMS Inform → CRS → Verifile → Credibled → InfoMart → the rest. **About 100+ more are findable** the same way (other ENICs, US NACES members, PBSA members) (ESTIMATE).

## Sources opened (2026-10-29)
- thedailystar.net/campus/news/du-students-hold-satirical-event-protest-administrative-negligence-4145011 (DU release: intermediaries named, $50 fee, Sonali Bank, UHR 4 Mar 2026)
- thedailystar.net/campus/education/news/bureaucratic-hurdles-stall-du-students-higher-education-dreams-4136806 (Swedish case; DU fees)
- bdnews24.com/education/72ebc49dd302 (FT/Qualification Check: 55,000 offers, 45 HEIs, Bangladesh third; insiders)
- manchester.ac.uk/study/student-terms-and-conditions/verification-admissions/ (QC partner; extra checks for UKVI higher-risk countries; university pays)
- help.ecctis.com/…/understand-credit-pricing (£50; +£20 high-risk)
- qualificationcheck.com/pricing/ (price varies by country and institution)
- irp.cdn-website.com/…/WorkPro Pricing Schedule V28 Aug 2026.pdf
- en.prothomalo.com/youth/education/j78gsj8mwt (2026-04-16, 471 fake certificates; NU official correspondence)
- thedailystar.net/news/australia-tightens-visa-scrutiny-bangladeshi-students-citing-integrity-issues-4079141 (EL3, 8 Jan 2026)
- thepienews.com/too-big-to-brake-… (2026-10-26) and /derby-suspends-… (2026-03-10)
- qualificationcheck.com/insights/research/university-international-admissions-fraud-report-july-2026/ (Bangladesh volume tripled; 2.6% → 9.5%)
- qualificationcheck.com/contact-us/ (enquiries@); dataflowgroup.com/faqs-dataflow-verification/ and /contact-us/ (issuing-authority fees; business@)
- universityadmissions.se/…/country-instructions/bangladesh/ (updated 2026-10-06)
- backcheckgroup.com/product/university-dhaka-degree-verification-bangladesh-2/ ($49); crschecks.com/order/form/bangladesh.asp ($69, 15–25 days); zincwork.com/turnaround-times/education (Bangladesh 3 days); verifile.co.uk/bangladesh; fadv.com/contact/locations/; clearstar.net/what-you-use-vendors/ (local-currency fees, local language)
- wonkhe.com/…/EnrolyUKInternationalStudentRecruitmentData_September2026.pdf
- bdlaws.minlaw.gov.bd/act-1692 (+ sections 57267, 57271, 57274)
- ti-bangladesh.org/en/articles/press-release/7136
- pubs.thepbsa.org/pub/C2B9147E-… (E&O clause 6.4)
- ycombinator.com/companies/superunit
- hr.com.bd/history-and-profile-background-verification/ ; enroute.com.bd/…/pre-employment-background-verification/
