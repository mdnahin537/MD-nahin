STATUS: FINAL

# M5 — UK packaging EPR "RAM evidence files" for producers that import packaged goods (South Asian supply chains first)
**Model:** M5 Wave Desk · **Companion:** Phase 2 Opus, 2026-10-30
**One line:** Under UK packaging EPR, packaging is **reported as red (the highest fee) if the producer has no evidence that it is amber or green**. The red multiplier rises from 1.2× (2026/27) to 1.6× (2027/28) and 2.0× (2028/29). We build the evidence: a component-by-component packaging inventory, a RAM rating per component under the published RAM tables, and the supplier specification pack behind each rating, kept for 7 years. We refresh it before each half-year deadline (**1 April 2027**, 1 October 2027). We sell it white-label to the smaller compliance schemes, and directly to UK importers whose packaging is made by South Asian suppliers (chasing Bangladeshi suppliers in Bangla). Records and data only: the producer reports, and the scheme files.
**Labels:** VERIFIED = primary page opened by me · E3 = counted by me · PRESS · VENDOR CLAIM · SEARCH-SUMMARY · ESTIMATE · NOT FOUND.

---

## The core evidence (read first)
1. **The evidence rule (VERIFIED).** GOV.UK "RAM 2027 materials assessment guidance" (updated 20 Aug 2026) says:
   - packaging is "reported as red if you do not have evidence that the packaging meets either an amber or green rating";
   - "contact your supplier if you are missing technical details or evidence";
   - "you do not need to submit evidence … but you must keep the following records for 7 years and provide it to regulators if they ask".
   - RAM 2027 covers the reporting year 1 Jan – 31 Dec 2027. RAM v1.1 applies to 2026 data.
2. **Dated deadlines (VERIFIED by helper 1 from GOV.UK; page updated 19 Aug 2026):**
   - Large producers report Jul–Dec 2026 data by **1 Apr 2027** and Jan–Jun 2027 data by 1 Oct 2027.
   - Small producers report calendar-2026 data and register by **1 Apr 2027**.
   - From 2026 data, household disposal fees are modulated by RAM colour.
3. **The money at stake rises every year (VENDOR CLAIM, ERP UK compliance scheme page, Sep 2026, opened):**
   - The red multiplier is **1.2× amber in 2026/27, 1.6× in 2027/28 and 2.0× in 2028/29**.
   - Illustrative 2026/27 rates for plastic: green £415, amber £455, red £545 per tonne. For aluminium: green £245, amber £270, red £325.
   - "A £13,000 spread" between green and red on 100 t of plastic.
   - The same escalation appears in a second write-up citing the PackUK/Defra illustrative fees of 16 Dec 2025 (SEARCH-SUMMARY / secondary, ppwrconnect).
   - The 2025 fees were not modulated (Valpak brochure, opened).
4. **The Road is public (E3).**
   - Defra's 2026 register of packaging producers (CSV, "Last updated 29 October 2026") lists **12,078 producers (11,239 large)** with Companies House numbers and compliance scheme. The 2025 register lists 11,963 (11,258 large).
   - Members by scheme: Valpak 2,753; Wastepack GB 1,650; Beyondly 1,148; Comply with Clarity 904; Biffpack 738; Ecosurety 703; Veolia 472; ERP UK 457; Paperpak 353; Kite 347; smaller schemes below 135. 1,964 producers register directly.
   - The **register of 18 compliance schemes** (xlsx v2, 7 Apr 2026, VERIFIED) gives each scheme's contact email and phone.
5. **The substitute is real (VERIFIED, vendor page opened).** Valpak sells a "RAM Data Service":
   - automated RAM scoring from its Supplier Data Hub;
   - a 60-million-SKU database to fill gaps;
   - "our team can contact your suppliers directly to gather missing information".
   The largest scheme already does the core job for its own 2,753 members.
6. **Price:**
   - Public prices for RAM or data services: **NOT FOUND**. Valpak, ERP UK and others are quote-only; I searched for "per SKU" and "from £" price lists and for Upwork posts and found none.
   - What producers demonstrably pay for compliance today: the 2026 EA registration fee is **£1,803 for a large producer via a scheme, £2,842 direct, £696 small** (SEARCH-SUMMARY of the gov.uk fee page), plus scheme membership and the disposal fees above. PackUK expects about £1.56bn in producer fees for 2026–27 (SEARCH-SUMMARY).

---

## (a) Path Test v2 card
```
OPPORTUNITY: RAM evidence files for UK producers importing packaged goods | MODEL: M5
GATES: G1✔(rule: no alcohol/pork producers) G2✔(no licence; producer reports, scheme files; we keep records) G3✔(cap breaker: schemes sell; AI drafts component tables; partner checks against guidance) G4✔ partial (HIGH risk: Valpak automates RAM + supplier chasing) G5✔(red multiplier 1.0→1.2→1.6→2.0 over 2025–2029; producer count flat) G6✔(not bookkeeping; not data entry for a platform)
STEPS: Home 1(M,E1) · Road 2(M,E3) · Letter 1(M,E1) · Read 1-soft(M,E2 delivered / H noticed) · Impressed 1(H,E1) · Reply 2(M,E2) · Trust 2/1/2 · Pay 2(M,E2 rail/E1 buyer) · Repeat 2(M,E2)
CHAIN: 1 (Read-noticed / Trust-competence / Home, soft, E1) | TWO-KEY: 1 of 3 (Pay) → WEAK BY DESIGN
FALSE-0 FIXES: Read → Ra (18 schemes instead of 11,239 producers) + Re (1 Apr 2027; rising red multiplier) + Rf (Bangla for Bangladesh-sourced packaging)
FALSE-2 CATCHES: Home → evidence must come from suppliers (P2-lite), so outside-in work is only indicative. Read → scheme contacts are role inboxes (info@, solutions@). G4 → Valpak RAM Data Service. Price → no public service price.
SOFT-0 TESTS TO RUN (≤2h, $0): 3 indicative RAM sheets from public product pages + 8 emails (5 smaller schemes, 3 importers); count positive replies in 7 days
```

### Gates
| Gate | Result | Evidence |
|---|---|---|
| G1 Halal | ✔ with a rule | Food importers in the target list are halal or neutral. We decline alcohol and pork producers. |
| G2 Licence | ✔ | No licence regime for packaging-data preparation (ESTIMATE; none found in GOV.UK producer guidance). The producer submits through the Report Packaging Data service; we never log in. |
| G3 Capacity | ✔ | A 20-SKU evidence file is about 4 h plus supplier waiting time (ESTIMATE). 9 files a month ≈ 36 h. Cap breaker: schemes sell to their members, and AI drafts the component tables. |
| G4 AI substitution | ✔ partial, **high risk** | Valpak already automates RAM scoring and chases suppliers. AI can classify formats from photos. Two things stay human: getting signed spec sheets from overseas suppliers (email/WhatsApp, Bangla for Bangladesh), and keeping a 7-year evidence index. |
| G5 Demand trend | ✔ | The money at stake rises by rule each year (core evidence 3). The number of producers is flat (11,963 → 12,078), so the growth is in the value per producer, not in the number of producers. |
| G6 Killed list | ✔ | Not bookkeeping, not Shopify uploads, not generic data work: it is a named, dated compliance evidence file. |

### Step card (R5 split steps)
| # | Step | Score | Basis / evidence | Plane check | Route |
|---|---|---|---|---|---|
| 1 | Home | **1** | M / E1. An *indicative* RAM sheet can be built from a producer's public product pages: format, materials, visible components. For example, metallised flexible film pouches are likely red under RAM (ESTIMATE, to confirm against the guidance tables). Real evidence needs the supplier's spec sheet. | P2-lite caught | Rc |
| 2 | Road | **2** | M / E3. Register CSV (12,078) + scheme register (18, with emails). 8 South-Asian/halal food producers extracted: `research/handoffs/M5-uk-pepr-southasian-producers-2026-10-29.tsv`. | P7: register shows Companies House numbers, so legal form is checkable (PECR) | Ra |
| 3 | Letter | **1** | M / E1. Line one quotes their register line (large producer, scheme) and the rule "red without evidence". It cannot show their missing evidence, because evidence isn't public. | — | Re |
| 4 | Read | **1 soft** | **Delivered:** scheme contact emails are published by the regulator (E2). **Noticed:** they are role inboxes (info@, solutions@, team@): the method's false-2 trap. **Decision-maker:** unknown. | P6/P7 ok for limited companies | Ra |
| 5 | Impressed | **1** | H / E1. The indicative sheet is checkable against their own packs in minutes, but it is our reading, not their evidence. | — | Rc |
| 6 | Reply | **2** | M / E2. 1 Apr 2027 deadline; RAM 2027 from 1 Jan 2027; red multiplier rising to 1.6× for 2027/28 fees. | P9: modulation policy and RAM roadmap published; dates from GOV.UK (Aug 2026) | Re |
| 7 | Trust | **2 / 1 / 2** | **Identity:** names, faces, Dhaka (M / E1, once the page exists). **Competence:** none in packaging (H) → 1. **Risk:** first file free or paid after delivery; no logins (M / E1). | P11: we label ratings "per RAM 2027 table X, evidence attached"; the producer decides what to report | Rd |
| 8 | Pay | **2** | **Rail:** Payoneer UK direct bank transfer (GBP), free (VERIFIED, payments.md). **Buyer:** UK limited companies pay suppliers by bank transfer (ESTIMATE). **Collection:** small invoices; net-30. | P8 passes | — |
| 9 | Repeat | **2** | M / E2. Large producers report every half-year, and RAM is revised annually (roadmap to 2030, per ERP UK; VENDOR CLAIM). Each new SKU or supplier change needs new evidence. | False-2 check: once built, evidence needs only light refresh, so the per-client value falls in year 2 | Rg |

---

## (b) Reply Card (method B9)
```
BUYER (exact role): (A) data/compliance manager at a smaller compliance scheme; (B) operations/compliance lead at a large producer importing South-Asian packaged goods
CONTACT POINT: (A) scheme email from the regulator's register (e.g. hello@smartcomply.co.uk, team@paperpak.co.uk, enquiries@recyclinglives-services.com); (B) company website contact (PARTNER CHECK per importer)
CHANNEL + legal check: plain email to limited companies only (Companies House numbers on the register; PECR corporate subscriber); identity + opt-out; no calls (TPS/CTPS screening costs money)
TRIGGER (why now, dated): 1 Apr 2027 report (H2 2026 data); RAM 2027 applies to packaging supplied from 1 Jan 2027; red = 1.6× amber in 2027/28 fees
LINE ONE (their fact): "Your register entry says large producer via [scheme]; under RAM 2027 any pack without supplier evidence must be reported red — 1.2× amber now, 1.6× next year."
PROOF (30-second self-check): the GOV.UK RAM 2027 guidance sentence ("reported as red if you do not have evidence…") + an indicative RAM sheet of 10 of their own SKUs, sent after a reply
IDENTITY LINE (T15): "We are MD Nahin and [partner], a two-person team in Dhaka, Bangladesh; we chase South-Asian suppliers for spec sheets in Bangla and English. Faces and sample: [link]."
RISK REVERSAL: first 10-SKU evidence file free; then £350 per 20-SKU file, invoiced after delivery
EASY ANSWER (yes/no): "Shall I send the 10-SKU indicative sheet for [company]? Reply 'yes'."
SEND TIME: UK 09:00 GMT = Dhaka 15:00 (Gmail schedule-send); replies handled Dhaka 19:00–23:00 = UK 13:00–17:00
TEST: A = schemes vs B = importers, 5 + 5 sends first (pool is small); stop rule T34 adapted: 0 positives in 20 → drop
EXPECTED: baseline 3–5% → target ≥ 8% (ESTIMATE: rising fee + statutory default-red rule)
```

---

## (c) Filters
**Work level: medium-high.** For each SKU:
- split the pack into components (body, closure, label, sleeve);
- identify material and colour, and whether it is metallised or multilayer;
- apply the RAM 2027 stage tables (collection, sortation, reprocessing, application);
- obtain and file the supplier spec or declaration;
- record the rating and the evidence reference, kept for 7 years.

**Demand trend (dated):**
| Date | Data point | Label |
|---|---|---|
| 2025 fees | Not modulated (flat rate per tonne) | VENDOR CLAIM (Valpak brochure, opened) |
| 2026/27 → 2027/28 → 2028/29 | Red = 1.2× → 1.6× → 2.0× amber | VENDOR CLAIM (ERP UK, opened) + secondary citing PackUK 16 Dec 2025 |
| 2025 → 2026 registers | 11,963 → 12,078 producers (flat) | E3 |
| 1 Jul / 20 Aug 2026 | RAM 2027 published; applies to 2027 packaging | VERIFIED (GOV.UK page updated 20 Aug 2026) |

**AI-substitution risk:** high for rating, low for supplier evidence.
**Team fit:**
- The partner's checklist strength fits the component tables.
- The CEO runs supplier relations in Bangla/English.
- Weakness: no packaging background. The guidance tables must be learned (~1 day).
**Halal:** ✔ with the rule in G1.

---

## (d) Real price evidence
| Item | Amount | Source (date) | Label |
|---|---|---|---|
| EA registration fee, large producer via scheme / direct / small | £1,803 / £2,842 / £696 (2026) | gov.uk fee guidance via search (2026) | SEARCH-SUMMARY |
| Illustrative disposal fee, plastic, green/amber/red | £415 / £455 / £545 per tonne (2026/27) | ERP UK (Sep 2026, opened) | VENDOR CLAIM |
| Green-to-red spread on 100 t plastic | £13,000 a year | ERP UK (opened) | VENDOR CLAIM |
| RAM / data service prices (Valpak, ERP UK, others) | **NOT FOUND**: quote-only; no Upwork posts found | searches 2026-10-30 | NOT FOUND |
| Our price | £350 per 20-SKU evidence file; £150 per half-year refresh | ESTIMATE: ~4% of the red–amber gap on 100 t of plastic in 2026/27 | ESTIMATE |

---

## (e) Money path and 3 scenarios
**Path:**
1. A free 10-SKU file for one scheme's member.
2. A first paid batch: 5 files = £1,750 (~$2,200).
3. Half-year refreshes.
4. A Bangladesh-sourcing variant: UK fashion and home brands whose polybags and cartons come from Bangladeshi factories. Here the Bangla supplier chase is a real edge (ESTIMATE; not researched).

| Assumption | Low | Mid | High |
|---|---|---|---|
| Schemes reachable / reply / convert | 18 / 5% / 50% → 0.45 | 18 / 10% / 50% → 0.9 | 18 / 15% / 50% → 1.35 |
| Files per scheme per half-year | 10 | 20 | 40 |
| Scheme revenue per year (2 half-years × £350) | £3,150 | £12,600 | £37,800 |
| Direct importers reachable / reply / convert | 60 / 4% / 33% → 0.8 | 60 / 7% / 50% → 2.1 | 60 / 10% / 100% of replies → 6 |
| Per importer per year (£350 + 2 × £150) | £520 | £1,365 | £3,900 |
| **Total per year** | **≈ £3,700 (~$390/month)** | **≈ £14,000 (~$1,480/month)** | **≈ £41,700 (~$4,400/month)** |
**Notes:**
- GBP→USD at ~1.27 (ESTIMATE).
- "60 reachable importers" is an ESTIMATE. The register keyword search found 8 South-Asian/halal food producers. The rest would come from a Companies House SIC-code filter, a PARTNER CHECK needing a free API key that we don't create now.
- Capacity in the high case: ~108 files a year ≈ 9 a month × 4 h = 36 h. It fits.

---

## (f) Cheap-test check: yes, 7 days, $0
1. **Days 1–2:** the partner reads the RAM 2027 materials guidance and makes a component checklist.
2. **Day 3:** build indicative 10-SKU sheets for Ambala Foods, Taj Foods and Shazan Foods from their public product pages (~2 h each).
3. **Day 4:** send 8 emails: 5 smaller schemes (Smart Comply, Packcare, Paperpak, Recycling Lives, Kite) and 3 importers. All recipients are limited companies.
4. **Days 5–7:** count positive replies.
5. **Pass:** ≥ 1 "yes" to a free file. **Fail:** 0 of 8. Send 12 more; then stop.

---

## (g) Monday walk-through
1. **CEO:** open the two saved TSVs (`research/handoffs/M5-uk-pepr-southasian-producers-2026-10-29.tsv`, and the scheme register below). Confirm each target's legal form on Companies House (free).
   *Assets: ✔*
2. **Partner:** open GOV.UK "RAM 2027 materials assessment guidance" and build the component checklist with an evidence column (3 h).
   *Assets: ✔*
3. **CEO:** build the identity page and write the 8 emails.
   *Missing assets:* the identity page (~2 h, $0), and **any packaging knowledge** (a competence plane, partly fixed by the guidance). Flag: supplier spec sheets in Bangladesh may need a phone call during Dhaka office hours, which fits.

---

## (h) Red team
**The strongest honest reason it fails:**
- The schemes already own this work. Valpak automates RAM and chases suppliers itself. Smaller schemes will either copy that model or partner with a software vendor, not with an unknown Dhaka team.
- Many importers will simply report red and pass the cost on, because a few hundred pounds of fee difference is less than the hassle.

**Counter-evidence searches I ran (2026-10-30):**
- "packaging EPR data / RAM assessment price per SKU" → no public prices.
- "Upwork packaging EPR UK data" → **no posted jobs found**.
- Valpak RAM Data Service page (opened) → **substitute confirmed**.

**What survives:**
- Only the supplier-evidence chase in South Asia, where language and time zone matter, and the producer count is small.

---

## (i) vs Shothik
| Step | Shothik | This | Verdict |
|---|---|---|---|
| Read | Message requests | Regulator-published role inboxes at UK limited companies; UK afternoon = Dhaka evening | **Slightly better** (delivered, but role inboxes) |
| Trust | Identity strong, risk weak | Identity OK, competence weak, risk strong (no logins) | **Same** (1) |
| Pay | Zelle/cash habit | UK GBP bank transfer into Payoneer, free | **Better** |

---

## (j) Intelligence verdict
- **The formula is fair here.** The wave is real, dated, and the rule ("red unless you have evidence") is a gift to a records business.
- **But the obvious seller of the evidence, the compliance scheme, already sells it.** Valpak automates it, and the market is UK-mature.
- **Our only edge is narrow:** chasing South-Asian suppliers in Bangla/English during Dhaka office hours.
- **Rank it #2 and run its test only alongside the UAE test, not instead of it.** If a scheme says yes, the Bangladesh-sourced fashion and home variant is the better second step.

---

## Named buyers and contact points
**A. Compliance schemes (18; contacts as published in the regulator's 2026 scheme register, xlsx v2, 7 Apr 2026, VERIFIED; member counts from the 2026 producer register, E3)**
| # | Scheme (operator) | Contact point | Signal |
|---|---|---|---|
| 1 | Smart Comply (Smart Comply Ltd) | hello@smartcomply.co.uk · 0333 344 2390 | 87 members: small scheme, likely thin data team (ESTIMATE) |
| 2 | Packcare (Wastecare Compliance PLC) | packaging.compliance@wastecare.co.uk · 0330 331 1801 | 119 members |
| 3 | Paperpak (Paperpak Ltd) | team@paperpak.co.uk · 01235 760011 | 353 members |
| 4 | Recycling Lives Compliance Services | enquiries@recyclinglives-services.com · 0330 175 1111 | 44 members |
| 5 | Kite Environmental Solutions | EPR@kitepackaging.co.uk · 02476 420 080 | 347 members incl. Shazan Foods |
| 6 | REPIC (RESC Ltd) | info@ecogenesys.co.uk · 0161 272 0001 | 53 members |
| 7 | Avask (Avask Global Compliance) | epr@avaskgroup.com · 023 8060 0120 | Serves e-commerce/overseas sellers |
| 8 | Scotpak (Nipak (Scotland) Ltd) | info@scotpak.eu · 0141 883 0121 | 55 members |
| 9 | ERP UK Ltd | uk@erp-recycling.org · 0203 142 6452 | 457 members incl. Bombay Halwa; publishes RAM fee guidance |
| 10 | Comply With Clarity (Clarity Environmental) | info@clarity.eco · 0845 129 7177 | 904 members incl. Taj Foods, Tilda |
| 11 | Ecosurety (EA) | info@ecosurety.com · 0333 4330 370 | 703 members incl. Gafoor Pure Halal |
| 12 | Beyondly (Beyondly Global Ltd) | solutions@beyond.ly · 01756 794 951 | 1,148 members incl. Ambala Foods |
| 13 | Biffpack (Biffa Waste Services) | ProducerComplianceSolutions@biffa.co.uk · 01494 556 565 | 738 members |
| 14 | Veolia – EA (Properpak Ltd) | packaging@veolia.co.uk · 0203 567 2000 | 472 members |
| 15 | Wastepack (Wastepack Ltd) | help@wastepack.co.uk · 01279 620000 | 1,650 members (GB, SEPA) |
| 16 | Wastepack Northern Ireland (Nipak Ltd) | niea@wastepack.co.uk · 01279 620015 | 97 members |
| 17 | Valpak Limited | info@valpak.co.uk · 03450 682 572 | 2,753 members; **substitute, not a buyer** (has its own RAM service) |
| 18 | Valpak Scotland | info@valpak.co.uk | 134 members; same caveat |
**B. Large producers importing South-Asian packaged food (2026 register, E3; contact = company website, PARTNER CHECK unless noted)**
| # | Producer (Companies House no.) | Scheme | Contact point |
|---|---|---|---|
| 19 | Ambala Foods Ltd (06544656), Enfield | Beyondly | www.ambalafoods.com (opened, title "Ambala, Sweets at Ambala") |
| 20 | Taj Foods Ltd (05669542), Woodford Green | Comply with Clarity | PARTNER CHECK: find the site |
| 21 | Shazan Foods Ltd (08929070), Birmingham | Kite | PARTNER CHECK |
| 22 | Gafoor Pure Halal Ltd (07876663), Preston | Ecosurety | PARTNER CHECK |
| 23 | Bombay Halwa Ltd (01093486), London | ERP UK | PARTNER CHECK |
| 24 | Natco Foods Ltd (00782674), Buckingham | Valpak | PARTNER CHECK |
| 25 | Tilda Ltd (00990202), Rainham | Clarity | tilda.com (Cloudflare-blocked to scripts; PARTNER CHECK) |
Count with a verified public contact point: **19** (18 schemes + Ambala). Two schemes (Valpak, Valpak Scotland) are substitutes, so the honest buyer count is 17 with contacts. This is below the 20 target. It is the #2 opportunity, and the gap is a 30-minute PARTNER CHECK (find 6 importer websites).

## Sources opened
- GOV.UK RAM 2027 materials assessment guidance (API): https://www.gov.uk/government/publications/assess-packaging-recyclability-recyclability-assessment-methodology-ram-2027/ram-2027-materials-assessment-guidance
- Defra register of packaging producers (2026 + 2025 CSVs): https://report-packaging-data.defra.gov.uk/public-register
- GOV.UK guidance on the public registers: https://www.gov.uk/guidance/find-large-producers-on-the-report-packaging-data-service
- Register of compliance schemes 2026 v2: https://assets.publishing.service.gov.uk/media/69d514bd4d39faba1f3b27af/Public_register_of_packaging_compliance_schemes_2026_V2.xlsx
- ERP UK, "Packaging EPR fees: why recyclability matters" (Sep 2026): https://erp-recycling.org/uk/news-and-events/2026/09/packaging-epr-fees-why-recyclability-now-costs-more/
- ppwrconnect, UK Packaging EPR year two: https://ppwrconnect.com/blog/ppwr-uk-packaging-epr-year-two-data-deadline-ram-2027
- Valpak RAM Data Service: https://www.valpak.co.uk/insights/ram-data-service-suppliers/ ; Valpak brochure PDF (Nov 2025)
- Helper calendar row 5 (deadlines): research/handoffs/M5-helper-1-wave-calendar.md
