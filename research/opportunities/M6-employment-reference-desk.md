STATUS: FINAL

# M6 — Bangla Employment & Reference Desk: employer and referee calls in Bangladesh for foreign background-screening firms and global-hiring platforms
**Model:** M6 Dhaka Ground Desk · **Companion:** Phase 2 Opus, 2026-10-29 · **Helper:** helper 1 (Sonnet), checked by me
**One line:** A foreign screening firm (or the screening partner of an employer-of-record platform) needs to confirm that a Bangladeshi candidate really worked at a Bangladeshi company, with dates, title and, where allowed, the reason for leaving, plus one or two references. There is no online register for this. We call the employer's HR or owner in Bangla, get a written confirmation from the company's own email domain where possible, and return a timestamped log. Optional add-on: a "met in person, originals seen" identity check in Dhaka (the M2 Mode B skill, sold here to screening firms instead of to employers).
**Labels:** VERIFIED (I opened the primary page on 2026-10-29) · PRESS · VENDOR CLAIM · SEARCH-SUMMARY · ESTIMATE · NOT FOUND.

---

## (a) Path Test v2 card
```
OPPORTUNITY: Bangla Employment & Reference Desk | MODEL: M6
GATES: G1✔ G2✔ G3✔(cap breaker: call scripts + AI logs; a trained caller) G4✘-risk(AI voice agents already do US employment verifications: Superunit "over 70,000"; Certn uses an "AI-powered verification agent" from 1 Jun 2026) G5✔(Checkr: fake-identity encounters 31%→40%; third-party checks 53%→62%) G6✔
STEPS: Home 2(M,E2) · Road 2(M,E3: helper 1 list) · Letter 2(M,E2: their own price list omits Bangladesh) · Read 1(M,E1) · Impressed 1(H,E1) · Reply 1(H,E0) · Trust 2/1/2 · Pay 2(M,E2) · Repeat 2(M,E1)
CHAIN: 1 (Read/Reply, E1) and G4 at risk | TWO-KEY: Pay 2 + Trust 2 only after a completed test case → 1 of 3 today, 2 of 3 conditional
FALSE-0 FIXES: Read → Rb (firms that publish a partner/vendor page or a "Bangladesh: ask our team" gap; see helper 1) ; Trust-risk → Rc (written confirmation from the employer's own domain, forwarded with headers)
FALSE-2 CATCHES: Impressed → a screening firm cannot check our quality in 30 seconds without giving us a live case ; G4 → "native Bangla calls" is an edge only until AI voice agents handle Bangla well, likely inside 24 months (ESTIMATE) ; Repeat → Bangladesh is a small share of most firms' international volume (NOT FOUND; ESTIMATE)
SOFT-0 TESTS TO RUN (≤2h, $0): call 5 Bangladeshi employers' published HR numbers as a "verification desk" with a consented test case (the CEO's or partner's own past employer) and time the answers
```

### Gates
| Gate | Result | Evidence |
|---|---|---|
| G1 Halal | ✔ | Verifying employment is halal. End clients may include banks (interest); P12 adjacency is remote (we verify a CV, not a loan). Flag to the CEO; refuse casino/betting/alcohol employers' checks. |
| G2 Licence | ✔ | No licensed act. PDP Act 2026: the screening firm is the controller and holds the candidate's consent; we are its processor (Act 63 of 2026, s.5, s.8; VERIFIED, bdlaws act-1692). Bangladeshi vendors note screening is lawful with candidate consent under the Labour Act 2006 (VENDOR CLAIM, hr.com.bd). |
| G3 Capacity | ✔ | ≈ 45–90 min per employer check across 2–5 days (finding the right person, 2–3 calls, email confirmation) (ESTIMATE) → ~50–80 checks/month at most. Cap breaker: scripts and one trained caller. |
| G4 AI substitution | **✘-risk** | Superunit (YC) "deploys AI voice and email agents to complete employment verifications for background check companies", claiming "over 70,000" done (VENDOR CLAIM; YC page opened). Certn's 1 Jun 2026 help note says it may verify by phone or email and identify itself as an AI-powered verification agent (SEARCH-SUMMARY; page returned 403). ScreenXchange launched an AI voice agent for outbound education, employment and reference checks globally in June 2025 (SEARCH-SUMMARY). The paid human part shrinks to employers who will not talk to a bot, and to Bangla. |
| G5 Demand trend | ✔ | Checkr (2026-10-15, 3,000 US managers): fake-identity encounters **31% (2025) → 40% (2026)**; firms using third-party checks **53% → 62%** (VERIFIED by the M2 companion; see M2-direct-verified-hire.md). |
| G6 Killed list | ✔ | Not generic data work; primary-source calls with a signed log. |

### Step card (R5 splits)
| # | Step | Score | Basis / evidence | Plane check |
|---|---|---|---|---|
| 1 | Home | **2** | M/E2: a redacted sample log of a real check on the founders' own past employer (with consent), and a one-page "how employment verification works in Bangladesh" note. ≈ 4 h. | P2 passed. |
| 2 | Road | **2** | M/E3: 23 named firms with a public contact point (below), from 34 checked; about 100+ findable the same way via PBSA/SHRM directories (ESTIMATE). | — |
| 3 | Letter | **2** | M/E2: line one uses their own document, e.g. WorkPro's Aug 2026 schedule prices employment checks for India (AUD 70) and Pakistan (AUD 74) but lists Bangladesh only as "Other countries: ask our team" (VERIFIED, PDF). | — |
| 4 | Read | **1** | M/E1: helper 1 found **no data-supplier recruitment form** at 34 firms. Their "partner" pages are for resellers and integrations (Zinc, Veremark, Certn, Cisive, Back Check), and HireRight's vendor email is for screening *its* suppliers. Exceptions: ClearStar runs a "Supplier Network" (SEARCH-SUMMARY) and iCOVER publishes a vendor "Partner Code of Conduct" (helper 1, VERIFIED). Otherwise info@/sales@ inboxes. Mechanism for being read: these firms say they buy fulfilment from in-country partners (InfoMart: "in-country, local-language partners"; Veremark: "works securely with global providers"; ClearStar 2017: "Any company providing a full suite of global background screening services is using a supplier somewhere"; VENDOR CLAIMS, pages opened). | P7 corporate inboxes. |
| 5 | Impressed | **1** | H/E1: quality is only visible on a live case. | — |
| 6 | Reply | **1** | H/E0: no trigger except a pending Bangladesh case. | — |
| 7 | Trust | **2 / 1 / 2** | Identity M. Competence H until one live case is done. Risk M: pay per completed check; employer's own email as proof. | P11: we warrant the call log, not the candidate. |
| 8 | Pay | **2** | M/E2: B2B invoice to Payoneer (GBP free, USD ACH 1%, card ≤3.99%; VERIFIED rates). | P8 passed for firms. |
| 9 | Repeat | **2** | M/E1: screening is continuous flow; Bangladesh volume per firm unknown. | — |

---

## (b) Reply Card
```
BUYER (exact role): international operations / vendor manager at a foreign screening firm or EOR platform's screening partner
CONTACT POINT: the firm's partner/vendor form or published inbox (list below)
CHANNEL + legal check: plain-text email; CAN-SPAM + PECR corporate; no attachments
TRIGGER (why now, dated): Checkr 2026-10-15 (fake-identity encounters 31%→40%); their own price list's Bangladesh gap
LINE ONE (their fact): "Your [Aug 2026] schedule prices employment checks for India and Pakistan but lists Bangladesh as 'ask our team'."
PROOF (30-second self-check): a redacted sample log + the employer's confirmation email header format
IDENTITY LINE (T15): "MD Nahin and [partner], Dhaka. Faces and address: [link]."
RISK REVERSAL: first 3 checks paid only if the employer's written confirmation reaches you
EASY ANSWER (yes/no): "Send us your next Bangladesh employment check? Yes/no."
SEND TIME: UK 09:00 = Dhaka 15:00; Sydney 09:00 = Dhaka 04:00 → schedule-send (T11)
TEST: A = price-gap line vs B = fraud-trend line; 15 + 15 sends; stop rule T34
EXPECTED: 3–6% positive (ESTIMATE)
```

## (c) Filters
- **Work level:** medium. Finding the right HR person, persuading them in Bangla, recording exactly.
- **Demand trend (dated):** see G5 (Checkr 2025 → 2026).
- **AI-substitution risk:** **high within 24 months** (G4).
- **Team fit:** good, but calls must fall in Bangladeshi office hours (Sun–Thu): a P4 clash for part-timers.
- **Halal:** pass with screening (G1).

## (d) Real price evidence
| Source | Price | Label |
|---|---|---|
| WorkPro (AU), employment history check | India AUD 70; Pakistan AUD 74; Philippines AUD 72; Bangladesh not listed ("ask our team") | VERIFIED (V28 Aug 2026 PDF) |
| HRBD (Dhaka), full candidate packages incl. employment checks | BDT 10,999–42,999 per candidate | VENDOR CLAIM, page opened |
| CRS Checks (US), Bangladesh | **Employment verification $69, 15–25 days**; reference $69; education $69 | VERIFIED (re-opened by me) |
| Certn (ANZ price page) | employment AUD 34.90; reference AUD 35.00 (not stated as international; international "varies") | helper 1, VERIFIED |
| Corra Group (US) | any degree worldwide $55 | helper 1, VERIFIED |
| Background Check Group (SG/PK) | Bangladesh criminal $95; Pakistan education $15 (excl. institution fees) | VERIFIED (re-opened by me) |
| Verifile (UK), Bangladesh | employment history 5–15 working days (no public price) | VERIFIED (re-opened by me) |
| HireRight "International Verification Researcher" (employee pay, not a vendor rate) | $19–32/hour | SEARCH-SUMMARY (Glassdoor, via helper 1) |
| What vendors are paid per check | NOT FOUND (helper 1 searched supplier terms and wholesale price lists) | NOT FOUND |
**Our wholesale price (ESTIMATE):** $12–25 per employer verified; $10–15 per reference call; $40–60 for an in-person ID check in Dhaka.

## (e) Money path and 3-scenario estimate
**Path:** 3 free-on-failure checks for one firm → $15–25 per check → 20–40 checks/month across 2–3 firms → $400–1,000/month. Bundle with institution liaison (education) and company checks for the same firms.
| Scenario | Assumptions (ESTIMATE) | Month 6 |
|---|---|---|
| Low | 30 firms emailed × 3% × 50% → 0–1 client × 5 checks × $15 | ≈ $0–75 |
| Mid | 30 × 6% × 50% → 1 client × 20 checks × $20 | ≈ $400 |
| High | 40 × 10% × 50% → 2 clients × 30 checks × $22 | ≈ $1,300 |
**Honest read:** low price, low volume, and an AI substitute arriving. On its own this does not reach $1,000/month reliably; as a second product for liaison clients it is worth having.

## (f) Cheap test (7 days, ≤$5)
1. With written consent from 3 people the founders know, call each person's past Bangladeshi employer as a verification desk (CEO, 2 h). Record: reached HR within 2 calls? Written email confirmation from the company domain within 3 days?
2. Write the sample log (partner, 2 h).
**Pass:** ≥2 of 3 confirmed in writing within 5 working days.

## (g) Monday walk-through
1. **CEO:** ask 3 acquaintances for consent and their past employers' details (asset: network ✔).
2. **Partner:** call script and log template (asset ✔).
3. **CEO:** first call in Bangladeshi office hours (asset: phone ✔; time window is a P4 plane).
Missing asset: the identity page (built Monday, 1 h, free).

## (h) Red team
**Strongest reason it fails:** Bangladesh is already covered, by local vendors who sell straight to foreign employers (HRBD: "foreign employers hiring Bangladeshi talent", BDT 10,999+; Verifications.asia; Enroute, 17 years) and by global firms' own networks. Meanwhile, AI voice agents are taking over the commodity part of employment verification. A new desk would compete on price in a shrinking human niche.
**Counter-evidence search I ran:** "AI voice agent automated employment verification 2026": found Superunit (launched on Product Hunt 28 Jul 2026), Certn (1 Jun 2026) and ScreenXchange (Jun 2025). The substitution is happening now, not in theory.
**Second counter-evidence search (helper 1, 34 firms):** First Advantage lists Bangladesh among its office locations, and Background Check Group (Singapore/Karachi) and Greves/Verifications.Asia (Dubai) claim field staff in Bangladesh (pages opened). No firm publishes a supplier-application page or what it pays vendors (NOT FOUND). Demand from screening firms is real in general (they say they use in-country partners) but unproven for a new Bangladesh supplier.

## (i) vs Shothik
- **Read: better** (B2B inbox, their own price-list gap).
- **Trust: better** (no logins; the employer's email is the proof).
- **Pay: better** (B2B invoice).

## (j) Intelligence verdict
The formula likes this (Road, Letter and Pay are solid, and Trust lifts after one case). But it does not price the AI substitute, which is already selling to exactly these buyers. **I would not lead with it.** It belongs as a bundled second service for the screening firms won through the institution-liaison bet, priced per check, for the cases a bot cannot close (small Bangladeshi employers who only answer a Bangla speaker).

## Named buyers (23 with a public contact point; from helper 1's 34-firm table, research/handoffs/M6-helper-1-buyers.md)
Helper 1 opened each page on 2026-10-29. I re-opened 7 rows (WorkPro, Zinc, CRS, Back Check, Verifile, First Advantage, ClearStar) and they held. "Signal" is the fit reason. None publishes a data-supplier application form, so every approach is a cold email to the inbox shown.
| # | Firm (HQ) | Type | Signal | Contact point |
|---|---|---|---|---|
| 1 | WorkPro (AU) | screening firm | Aug 2026 schedule: Bangladesh absent from employment, qualification and address tables ("ask our team") | info@workpro.com.au (home page source) |
| 2 | CRS Checks (US) | screening firm | Bangladesh employment/education $69, **15–25 days** (slow) | contact form crschecks.zendesk.com/hc/en-us/requests/new |
| 3 | Verifile (UK) | screening firm | Bangladesh page: employment 5–15 working days, no price | service@verifile.co.uk |
| 4 | Veremark (UK) | screening platform | Bangladesh page; "works securely with global providers" | veremark.com/contact |
| 5 | NetForce Global (US) | **wholesaler** | "worldwide network of researchers", wholesale-only | sales@netforceglobal.com, contact@netforceglobal.com |
| 6 | InfoMart (US) | screening firm | "in-country, local-language partners" do its intl education and employment checks | Sales@InfoMart-USA.com |
| 7 | ClearStar (US) | screening firm | runs a "Supplier Network"; its blog explains local-currency fees and local language | clearstar.net/partners; +1 877 796 2559 |
| 8 | iCOVER Group (FR/BG) | screening firm | publishes a vendor "Partner Code of Conduct"; no Bangladesh mention | commercial@icover-services.com |
| 9 | Truescreen / Certiphi (US) | screening firm | "in-country resource partners" (SEARCH-SUMMARY) | truescreen.com/contact form |
| 10 | Credibled (CA) | screening firm | Bangladesh criminal CAD 248.63 (premium tier, reviewed 29 Aug 2026); education "confirmed with the institution" | info@credibled.com |
| 11 | Certn (CA/ANZ/UK) | screening platform | international checks "price varies"; also uses AI verification agents | certn.co/anz/partner-with-certn |
| 12 | Avvanz (SG) | APAC screening | Bangladesh not named; "Other (We likely cover it)" | consult@avvanz.com |
| 13 | eeCheck (SG) | Asia screening | no Bangladesh page | inquiry@eecheck.com |
| 14 | Secure Screening Services (UK) | small screening firm | "Global Qualifications Check £35"; intl criminal "£POA" | hello@securescreeningservices.com |
| 15 | Business Screen (US) | investigations-style screening, white label | intl checks by "licensed private investigator" | info@businessscreen.com |
| 16 | Corra Group (US) | screening firm | "$55 per degree" worldwide | (310) 524-9800 |
| 17 | Global Background Screening (US) | online screening | "international checks usually range from $20 to $300" | globalbackgroundscreening.com/contact |
| 18 | Background Check Group (SG/PK) | regional screening | sells Bangladesh checks and claims field officers there: **competitor or buyer** | info@backcheckgroup.com |
| 19 | Greves Verification Solutions / Verifications.Asia (UAE) | Gulf verification firm | Bangladesh page; claims on-ground screeners: **competitor or buyer** | info@gvs.ae |
| 20 | Zinc (UK) | screening platform | Bangladesh education averages 3 days (likely already served) | zincwork.com/partner-application |
| 21 | Skuad (SG/IN) | EOR platform | Bangladesh check page; suggests "local professional agencies or partners" | skuad.io/demo |
| 22 | Checkr (US) | screening platform | Bangladesh in its 223-country list | checkr.com/company/partners |
| 23 | Cisive / IntelliCorp (US) | screening firm | "global research network"; India named, Bangladesh not | cisive.com/partners |
**Excluded (no contact point or not a buyer):** First Advantage (lists Bangladesh as a location: has its own presence), HireRight (vendor email is for screening its suppliers), Accurate, Owens OnLine (JS site; contact NOT FOUND), DataFlow (pages rate-limited), AuthBridge, RiskAware, Multiplier, RemotePeople, ISS, Choice Screening.

## Sources opened (2026-10-29)
- WorkPro Pricing Schedule V28 Aug 2026 (PDF)
- ycombinator.com/companies/superunit
- hr.com.bd/history-and-profile-background-verification/
- bdlaws.minlaw.gov.bd/act-1692 (s.1, s.5, s.8)
- M2-direct-verified-hire.md (Checkr 2026-10-15, VERIFIED by the M2 companion)
