STATUS: FINAL

# M6 — Student Funds Check: verifying Bangladeshi applicants' bank statements and solvency certificates for foreign universities and funds-verification vendors
**Model:** M6 Dhaka Ground Desk · **Companion:** Phase 2 Opus, 2026-10-29 · **Helpers:** none for this file
**One line:** For a foreign university's admissions-compliance team (or the vendor it uses), confirm that a Bangladeshi applicant's bank statement or solvency certificate is genuine (QR check against the bank's real domain, a call to the branch number published on the bank's own site, the bank head office's authentication letter) and flag the known fraud patterns, such as a large deposit just before issue, or a balance built from a loan.
**Verdict up front:** a real, dated pain with a **non-AI substitute that arrived in 2026**. Bangladesh Bank now requires an online-verifiable QR code on every statement and certificate. What remains is fraud that a desk cannot see. **Do not pursue as a product.** Keep it as a single line item inside the institution-liaison bet (M6-institution-liaison).
**Labels:** VERIFIED (I opened the primary page on 2026-10-29) · PRESS (news article opened) · VENDOR CLAIM · SEARCH-SUMMARY · ESTIMATE · NOT FOUND.

---

## (a) Path Test v2 card
```
OPPORTUNITY: Bangladesh Student Funds Check | MODEL: M6
GATES: G1✔ G2✔(fact verification for the sponsor, never advice to the student: no OISC/immigration-advice act) G3✔(cap breaker: checklist) G4✘(non-AI substitute: Bangladesh Bank QR mandate, 12 May 2026, makes the core check self-service) G5✔(dated: Australia EL2→EL3 on 8 Jan 2026; UK BCA refusal limit 10%→5%; Bangladesh refusal 14.0% YE Jun 2026) G6✔
STEPS: Home 2(M,E2) · Road 1(M,E1) · Letter 1(H,E1) · Read 1(H,E1) · Impressed 1(H,E1) · Reply 2(M,E2) · Trust 2/1/1 · Pay 1(P8,E1) · Repeat 1(M,E1)
CHAIN: 1 (Pay/Trust-risk/Impressed, E1) + G4 failed | TWO-KEY: 0 of 3 → WEAK BY DESIGN
FALSE-0 FIXES: none lifts G4
FALSE-2 CATCHES: Impressed → the QR code already proves the document matches the bank's record, so our "authentic" finding adds little ; Trust-risk → the fraud that remains is bank-issued (genuine statement, loan-backed balance), which a desk cannot detect without the applicant's full account data ; Pay → the vendor benchmark is $25 per document paid by the student (Veri Once), leaving almost nothing wholesale
SOFT-0 TESTS TO RUN: none worth running (see verdict)
```

### Gates
| Gate | Result | Evidence |
|---|---|---|
| G1 Halal | ✔ | Verifying a document is not riba, even if the account earns interest. Refuse any role in arranging "fund support". |
| G2 Licence | ✔ | We would report facts to the sponsor. Advising students on visas would be a regulated act in the UK: never do it. |
| G3 Capacity | ✔ | ≈ 0.5–1 h per document (ESTIMATE). |
| G4 Substitution | **✘** | **Bangladesh Bank BRPD circular, 12 May 2026:** every statement and certificate issued on request must carry an online-verifiable QR code showing account number, holder's name, opening and closing balance and issue date; records stay verifiable for at least 6 months; 90-day transition (PRESS, Bangladesh Monitor, opened). Embassies asked for it. The core "is it genuine?" check is now self-service. |
| G5 Demand trend | ✔ | Australia moved Bangladesh from Evidence Level 2 to 3 on **8 Jan 2026**; Rizvi: officers "might contact the bank to verify financial statements" (PRESS, Daily Star, opened). UK: BCA refusal limit cut from 10% to 5% (PRESS, PIE News 2026-03-10); Bangladesh refusal rate **14.0%** in the year to June 2026 (PRESS, PIE News 2026-10-26). |
| G6 Killed list | ✔ | — |

### Step card
| # | Step | Score | Note |
|---|---|---|---|
| 1 | Home | 2 | A public guide, "How to verify a Bangladeshi bank statement in 2026" (QR, real domains, head-office authentication). Public data only. |
| 2 | Road | 1 | Buyers are named (university compliance teams; Veri Once; INTCAS, which bought FundsV in 2016 per PIE News, opened) but there is no list here. |
| 3 | Letter | 1 | "Your Bangladesh refusal rate" is not public per university. |
| 4 | Read | 1 | Compliance inboxes are reachable; vendor pitches are common there (ESTIMATE). |
| 5 | Impressed | 1 | The QR code already gives the buyer the authenticity answer. |
| 6 | Reply | 2 | Hard, dated triggers: BCA thresholds, EL3, intakes in Sep/Jan (UK) and Feb/Jul (Australia). |
| 7 | Trust | 2/1/1 | Identity fine. Competence unproven. **Risk: a Dhaka checker of Bangladeshi bank documents sits next to a fraud market**: >100 consultancies sell fake solvency papers; insiders at "a second-generation Shariah-based bank" allegedly issued them (PRESS, Bonik Barta, opened). The buyer must ask whether we are part of it. |
| 8 | Pay | 1 | University procurement onboarding (company number, insurance) for an unknown foreign micro-vendor is slow (ESTIMATE). Veri Once charges the student $25 per document (VERIFIED, etsu.edu page). |
| 9 | Repeat | 1 | Seasonal flows, and they shrink: Bangladeshi CAS issued **−30.16%** YoY for Sep 2026 (VERIFIED, Enroly data briefing PDF). |

---

## (b) Reply Card (written for completeness; not recommended to run)
```
BUYER: head of admissions compliance at a UK university still recruiting in Bangladesh
CONTACT POINT: the university's published admissions-compliance or international-admissions inbox
CHANNEL + legal check: email; PECR fine (universities are corporate bodies)
TRIGGER: BCA refusal limit 5%; Bangladesh refusal 14.0% (YE Jun 2026)
LINE ONE: "Bangladesh refusals ran at 14% in the year to June; most fund fraud now uses genuine bank paper."
PROOF: our public QR-verification guide plus 3 red-flag patterns from Bonik Barta's 2026 investigation
IDENTITY LINE: real names, Dhaka, faces
RISK REVERSAL: pay per completed file
EASY ANSWER: "Useful for your January intake? Yes/no."
SEND TIME: UK 09:00 = Dhaka 15:00
TEST: not run (G4 failed)
EXPECTED: 1–3% (ESTIMATE)
```

## (c) Filters
- **Work level:** medium (pattern reading and calls).
- **Demand trend (dated):** refusal rate 22% (YE Sep 2025, FT figure via news summaries: SEARCH-SUMMARY) → 14.0% (YE Jun 2026, PIE): still almost 3× the 5% limit. Australia EL2 → EL3 (8 Jan 2026).
- **AI/substitution risk:** high, and not from AI: the QR mandate. The City Bank MD, as chairman of the bankers' association, wants a central Bangladesh Bank verification gateway (PRESS, Bonik Barta), which would remove even the residual check.
- **Team fit:** fine. **Halal:** fine.

## (d) Real price evidence
| Source | Price | Label |
|---|---|---|
| Veri Once (used by East Tennessee State University) | **$25** per verification, paid by the student; bank fees passed through at cost | VERIFIED (etsu.edu/international/cost/verionce.php) |
| Bangladesh "fund support" market (what fraud costs) | BDT 200,000–500,000 for a fake BDT 4–6m balance; BDT 120,000 for a UK solvency certificate | PRESS (Bonik Barta, opened) |
| Qualification Check (academic, not funds) | price "varies… by country, institution"; £49 list price per check | VERIFIED page wording; £49 SEARCH-SUMMARY |

## (e) Money path and 3-scenario estimate
| Scenario | Assumptions (ESTIMATE) | Month 6 |
|---|---|---|
| Low | 0 university clients; 0 vendor clients | $0 |
| Mid | 1 vendor × 20 docs/month × $8 wholesale | ≈ $160 |
| High | 2 universities × 40 files/intake month × $30 (only in intake months) | ≈ $2,400 in intake months, near $0 between |
The model never reaches a steady $1,000/month without a monopoly position we cannot have.

## (f) Cheap test
Not worth running. If the CEO insists: scan the QR on one of his own family's bank certificates (with consent) and check whether the bank has implemented the 12 May 2026 circular (5 minutes, $0). If most banks have, the product is dead.

## (g) Monday walk-through
Not recommended. The first action would be the QR test above (asset: a family member's statement, with consent ✔).

## (h) Red team
**Strongest reason it fails:** the regulator fixed the easy half (authenticity) by QR in May 2026, and the hard half (loan-backed balances issued by real banks with "authentication certificates" from head office, PRESS, Bonik Barta) cannot be seen from outside. **Counter-evidence search run:** "Bangladesh Bank QR code bank statement circular 2026": confirmed the circular and the 90-day window (Bangladesh Monitor, opened); Bonik Barta reports implementation is "incomplete". This is the only argument for a short-lived residual product, and it shrinks every month.

## (i) vs Shothik
- **Read:** same (cold inbox).
- **Trust:** worse (fraud-adjacent market).
- **Pay:** worse (university procurement; $25-per-document anchor).

## (j) Intelligence verdict
The formula would be fooled by the triggers (BCA, EL3 and refusal rates are all real and dated) into scoring Reply 2 and feeling urgent. But the buyer's real question, "is this money real and the student's own?", is no longer answerable by a desk check: the QR answers "is the paper real?", and only the bank's full records answer "is the money real?". **Drop as a product.** The one useful piece is the "how to verify a Bangladeshi bank paper in 2026" guide, as a free trust asset for the institution-liaison bet.

## Sources opened (2026-10-29)
- bangladeshmonitor.com.bd/en/bangladesh-bank-orders-qr-codes-on-bank-statements-for-visa-applications
- en.bonikbarta.com/bangladesh/Jvz2e3aLg5wvHKDF
- thedailystar.net/news/australia-tightens-visa-scrutiny-bangladeshi-students-citing-integrity-issues-4079141
- thepienews.com/too-big-to-brake-why-bangladesh-and-pakistan-escaped-the-visa-brake-and-what-comes-next/ (2026-10-26)
- thepienews.com/derby-suspends-pakistan-and-bangladesh-recruitment-as-uk-compliance-pressures-grow/ (2026-03-10)
- wonkhe.com/…/EnrolyUKInternationalStudentRecruitmentData_September2026.pdf
- etsu.edu/international/cost/verionce.php
- thepienews.com/funds-verification-platform-acquired-by-intcas/ (2016-07-12)
