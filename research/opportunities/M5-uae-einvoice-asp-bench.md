STATUS: FINAL

# M5 — Phase-2 e-invoice readiness and exception desk for UAE Accredited Service Providers (white-label, Gulf hours from Dhaka)
**Model:** M5 Wave Desk · **Companion:** Phase 2 Opus, 2026-10-30 (research 2026-10-29/30)
**One line:** Every business in the UAE that makes B2B or B2G sales must appoint a Ministry-accredited e-invoicing provider (ASP) by **31 March 2027** and send structured e-invoices from **1 July 2027**, with fines from day one. 80 ASPs now compete to onboard hundreds of thousands of small firms in about five months. We sell those ASPs (and the accounting firms among them) a white-label **readiness file per small client** (customer TRN/TIN checks, mandatory-field gap check, test-invoice checklist), then a **monthly rejection-triage log** after go-live. We check data and fields; we never decide VAT treatment and never represent anyone before the Federal Tax Authority (FTA).
**Labels:** VERIFIED = primary page opened by me · PRESS = news or professional-firm article opened · VENDOR CLAIM · SEARCH-SUMMARY (page not opened) · ESTIMATE · E3 = counted by me · NOT FOUND.

---

## The core evidence (read first)
1. **Dates (F3 passes for Phase 2).**
   - The KPMG TaxNewsFlash of 22 Jul 2026 lists three phases (PRESS, opened):
     | Phase | Who | Appoint an ASP by | Mandatory go-live |
     |---|---|---|---|
     | 1 | Revenue ≥ AED 50m | 30 Oct 2026 | 1 Jan 2027 |
     | 2 | Revenue < AED 50m | **31 Mar 2027** | **1 Jul 2027** |
     | 3 | Government entities | 31 Mar 2027 | 1 Oct 2027 |
     BusinessDubai (opened) and BDO (opened) give the same table.
   - **Date movement:** only the Phase 1 ASP deadline has moved, once (31 Jul → 30 Oct 2026, by an MoF amendment of 10 May 2026; SEARCH-SUMMARY, several trackers). The go-live dates have never moved.
   - **Today (2026-10-30)** is the Phase 1 ASP deadline. **Our target is Phase 2**, 5 months out: inside the 6–10-week trigger window by mid-January 2027.
   - The MoF's e-invoicing page footer reads "Last updated on 29/10/2026" (VERIFIED). Ministerial Decision 197 of 2026 (in force 1 Oct 2026) added a 24-month exclusion for transactions inside a tax group from 1 Jan 2027 (PRESS, Khaleej Times 19 Oct 2026). The rulebook is still being tuned, but the dates hold.
   - **Press error to ignore:** the same Khaleej Times piece says the system "began with larger businesses" in July 2026 and reaches smaller ones "from January 2027". That contradicts the MoF/KPMG table. July 2026 was only the voluntary pilot.
2. **Scope is wide (PRESS, BDO Indirect Tax News, opened).**
   - The system covers B2B, B2G, G2B and G2G transactions "whether or not the transacting party is registered for VAT". B2C is out.
   - Non-VAT-registered businesses must obtain a TIN. The Peppol identifier is "0235:" plus the first 10 digits of the TRN.
3. **Fines start on the date (PRESS, BDO; VENDOR CLAIM, BusinessDubai; Cabinet Decision 106 of 2025):**
   - AED 5,000 per month for not appointing an ASP or not implementing the system;
   - **AED 100 per non-compliant or late e-invoice, capped at AED 5,000 a month**, with a separate cap for credit notes;
   - AED 1,000 per day for failing to notify the FTA of a system failure, or the ASP of data changes.
4. **The post-date pain is measurable (VENDOR CLAIM, BusinessDubai, its source unnamed):**
   - Initial validation failures of 8–12% for firms on an existing ERP.
   - The causes: about **31% tax-calculation mismatches, 23% TRN-format errors and 22% missing conditional fields**.
   - At AED 100 per bad invoice, a firm sending 1,000 invoices a month can hit the AED 5,000 cap by mid-month.
5. **The middlemen are publicly listed, with named contacts (VERIFIED, E3).**
   - The MoF "eInvoicing Accredited Service Providers" page lists **80 ASPs**, each with accreditation number, website, named contact person, email and phone. Saved verbatim: `research/handoffs/M5-uae-asp-list-2026-10-29.tsv`.
   - On 12 Jun 2026 the MoF listed **41 pre-approved** providers, with 15 in the pipeline and 40 in review (MoF programme deck of 30 Jun 2026; SEARCH-SUMMARY, because the PDF is served behind a bot check I did not get past).
   - So the supplier side doubled in about four months while the client deadline stayed fixed. Each ASP must win and onboard SMEs before 31 Mar–1 Jul 2027.
6. **What SMEs pay today (VENDOR CLAIMS, pages opened):**
   - **Tally** ("Implementation Cost: Budget Guide for UAE SMEs", 20 Jul 2026):
     - implementation consultant **AED 1,500–5,000 one-off**;
     - system integration AED 2,000–8,000;
     - support AED 500–2,400 a year;
     - licence AED 500–8,000 a year.
   - **BusinessDubai:**
     - ASP subscription AED 2,000–10,000 a year;
     - testing and certification AED 1,000–3,000;
     - training AED 2,000–5,000;
     - transactional pricing about AED 0.75 per invoice.
   - Every ASP must give **the first 100 e-invoices a year free** (BusinessDubai; SEARCH-SUMMARY attributes it to Ministerial Decision 64/2025). Micro firms therefore pay little for the ASP itself, but they still must onboard.
7. **Offshore help is not blocked by data-location rules (PRESS, BDO).** The guidelines say "geographic location is not determinative"; what matters is secure retention, integrity and retrieval. One commentary adds that an ASP that outsources stays fully responsible (SEARCH-SUMMARY). So ASPs can use a supplier, but they will want controls.
8. **Part of the check is a human job.** The FTA's public TRN lookup returns the registrant's legal name without a login, but it sits behind a security-code check (SEARCH-SUMMARY, several guides). A partner working through 200 customer TRNs by hand is checklist work that a bot can't simply do.

---

## (a) Path Test v2 card
```
OPPORTUNITY: UAE e-invoicing Phase-2 readiness + exception desk, white-label for ASPs | MODEL: M5
GATES: G1✔(rule: no files for alcohol/interest-finance end-clients) G2✔(by design: no VAT-treatment opinions, no FTA representation; client's accountant signs tax codes) G3✔(cap breaker: ASP sells; AI drafts mappings; trained Dhaka checkers later) G4✔ partial (platform validation automates error *detection*, not data repair or chasing staff) G5✔(ASPs 41 pre-approved 12 Jun 2026 → 80 accredited 29 Oct 2026; Phase-2 duty from 0 to all B2B firms on 1 Jul 2027) G6✔(not bookkeeping: no ledgers; not order entry)
STEPS: Home 2(M,E2) · Road 2(M,E3) · Letter 1(M,E1) · Read 1-soft(M,E2 delivered / H noticed) · Impressed 1(H,E1) · Reply 2(M,E2) · Trust 2/1/2 (identity/competence/risk) · Pay 2 for EU/UK-HQ ASPs, 1 for UAE-only (M,E2 rail / E1 buyer) · Repeat 2(M,E1)
CHAIN: 1 (Read-noticed / Trust-competence, soft, E1) | TWO-KEY: 1 of 3 today (Pay) → WEAK BY DESIGN; 2 of 3 after one paid pilot (Trust-competence → E3)
FALSE-0 FIXES: Read → Ra (sell to ASPs, not 300k SMEs) + Rb (regulator-published named contacts; DocFlow publishes partners@) + Rh (Gulf hours = Dhaka day) + Re (31 Mar 2027)
FALSE-2 CATCHES: Pay → P8 (UAE-only ASPs: USD wire into a Payoneer receiving account is unverified; card costs 3.99%). Reply → many small ASPs are consultancies chasing the same SME work (competitors, not buyers). G4 → ASP platforms already return validation errors. Price → 100 free e-invoices a year shrinks micro-SME spend.
SOFT-0 TESTS TO RUN (≤2h, $0): 10 emails to 10 ASPs (5 foreign-HQ platforms, 5 accounting-firm ASPs) offering 3 free readiness files; count positive replies in 7 days
REPLY CARD: see (b)
```

### Gates
| Gate | Result | Evidence |
|---|---|---|
| G1 Halal | ✔ with a rule | E-invoicing is neutral. Some ASP end-clients will be alcohol distributors or conventional lenders. **Rule:** we decline files for haram-sector end-clients and say so in the partner agreement. No deception: we say "Dhaka" in line one of the identity block. |
| G2 Licence | ✔ by design | Representing taxpayers before the FTA requires a registered tax agent (ESTIMATE from FTA practice; not opened). We only check data formats, field presence and TRN/TIN validity against public lookups. **Tax-category mapping (standard/zero/exempt/reverse charge) is confirmed by the client's own accountant.** We never log in to EmaraTax. |
| G3 Capacity | ✔ | A readiness file is about 2–3 h with AI drafting (ESTIMATE). 18 files a month ≈ 45 h. Triage of ~40 SMEs at 0.5 h each ≈ 20 h. That is ~65 of the ~70 team hours. **Cap breaker:** the ASP does the selling; AI drafts the field mapping; after 3 months, trained Dhaka checkers work under the partner's checklist. |
| G4 AI substitution | ✔ partial | **Against:** ASP platforms validate each invoice and return errors, and AI can map invoice fields. **For:** detection is automated, but *repair* is not. Someone must chase the SME's staff for missing TRNs, run the TRN lookups that sit behind a security code, and turn rejection codes into a fix-list the accountant accepts. Window: 12–24 months, shrinking as ERPs ship "UAE-ready" templates (ESTIMATE). |
| G5 Demand trend | ✔ | See (c): ASP count 41 → 80 in about four months; the mandatory population goes from 0 to all B2B firms on 1 Jul 2027. |
| G6 Killed list | ✔ | Not bookkeeping (no ledgers, no VAT returns). Not "wholesaler order entry". Not "generic automation agency": it is a dated compliance data job sold to a named middleman class. |

### Step card (R5 split steps)
| # | Step | Score | Basis / evidence | Plane check | Route |
|---|---|---|---|---|---|
| 1 | Home | **2** | M / E2. A sample readiness file can be built from public documents only: the MoF "UAE Electronic Invoice Mandatory Field Requirements" and guidelines (listed on mof.gov.ae/einvoicing, VERIFIED), plus a synthetic 20-customer SME. About 6 h. | P2 none · P3 $0 · MoF PDFs are bot-blocked for scripts; a human browser opens them (PARTNER CHECK) | Rc |
| 2 | Road | **2** | M / E3. 80 ASPs with named contacts on the MoF page (saved TSV). 25 chosen buyers below. | — | Ra |
| 3 | Letter | **1** | M / E1. Line one can use *their* fact: their MoF listing (accreditation number), the Phase-2 dates, and the ASP's own public promise (e.g. "free onboarding"). It is not a proof of *their* failure, which can't be seen from outside. | False 2 caught: no outside-visible defect | Re |
| 4 | Read | **1 soft** | **Delivered:** M / E2. The emails were published by the regulator as business contacts for e-invoicing services, and many are named people (e.g. a "partners@" inbox at DocFlow). **Noticed:** H / E0. A supplier offer from an unknown Dhaka team. **Decision-maker:** often a founder or sales head at the small ASPs (E2, names on the list). | P7: business contacts published for this purpose; one plain email, identity and opt-out line (ESTIMATE; UAE email rules not opened) | Ra, Rb, Rh |
| 5 | Impressed | **1** | H / E1. They can open our sample in 2 minutes, but it shows our competence on a synthetic case, not on their client. Lifted to 2 only after a free pilot on 3 real client files (E3). | — | Rc |
| 6 | Reply | **2** | M / E2. 31 Mar 2027 (ASP appointment) and 1 Jul 2027 (go-live), with AED 5,000/month and AED 100-per-invoice fines. Each ASP's onboarding peak falls inside those 5 months. | P9: go-live dates unmoved since Sept 2025; re-check monthly (T12) | Re |
| 7 | Trust | **2 / 1 / 2** | **Identity:** names, faces, Dhaka, a one-page site (M / E1, once the site exists). **Competence:** zero track record (H) → 1 until a pilot. **Risk:** 3 free files, then pay per file after delivery; we hold no client logins (M / E1). | P2: we use the client's exported customer list, not ASP or ERP logins. P11: we sign "checked against MoF field list v2.0", not "guaranteed accepted". | Rd |
| 8 | Pay | **2 / 1** | **Rail:** B2B invoice through Payoneer: EU/UK company local bank transfer, up to 1% or free for GBP (VERIFIED, payments.md); card 3.99% from any country (VERIFIED, payments.md). **Buyer:** EU/UK-HQ platforms pay suppliers by bank transfer (ESTIMATE). For UAE-only ASPs, a USD wire into a Payoneer receiving account is not verified → 1. **Collection:** net-30 normal (ESTIMATE); per-file invoices keep exposure small. | P8 caught for UAE-only ASPs | — |
| 9 | Repeat | **2** | M / E1. After 1 Jul 2027 every bad invoice costs AED 100: a monthly triage log has a reason to exist. New SMEs keep onboarding. Same desk then serves **Oman** (OMR > 5m: 1 Apr 2027; others: 1 Oct 2027; PRESS, KPMG 13 Aug 2026 via helper) and **Saudi Wave 25** (revenue > SAR 187,500; integrate by 1 Feb 2027; VERIFIED, ZATCA news 24 Jul 2026 via helper). | False-2 check: some ASPs will build in-house teams after month 3 | Rg |

---

## (b) Reply Card (method B9)
```
BUYER (exact role): founder / head of onboarding or partnerships at a MoF-accredited ASP; first choice = foreign-HQ platforms with small UAE teams and accounting-firm ASPs with SME client books
CONTACT POINT: the named email the MoF publishes for that ASP (e.g. partners@docflow.ae; e-invoicingme@comarch.com; hello@casim.ae) — see buyer list
CHANNEL + legal check: one plain-text email from a named Gmail/Workspace account; contact published by the regulator for this business purpose; identity + opt-out line; no WhatsApp until they reply (T28); EU-HQ staff: email the UAE entity's MoF-listed address only
TRIGGER (why now, dated): Phase-2 SMEs must appoint an ASP by 31 Mar 2027 and go live 1 Jul 2027 (AED 5,000/month; AED 100 per bad invoice)
LINE ONE (their fact): "You're one of 80 MoF-accredited ASPs (no. 181172), and every Phase-2 client of yours must be onboarded between now and 31 March 2027."
PROOF (30-second self-check): a 1-page sample readiness file built on the MoF mandatory-field list v2.0 — sent only after a reply (T17)
IDENTITY LINE (T15): "We are MD Nahin and [partner], a two-person team in Dhaka, Bangladesh, working your hours (Dhaka is UAE +2). Faces and sample: [link]."
RISK REVERSAL: 3 client files free; then AED 400 per file, invoiced after delivery; no logins needed — we work from the customer list your client exports
EASY ANSWER (yes/no): "Want 3 free readiness files for clients you're onboarding this month? Reply 'yes'."
SEND TIME: UAE 09:00 = Dhaka 11:00, Mon–Thu (the UAE moved to a Monday–Friday week in 2022; ESTIMATE from memory, check before sending)
TEST: A = foreign-HQ platforms vs B = accounting-firm ASPs (same text), 10 + 10 sends; stop rule T34 (0 positives in 20 → change route: try Oman/Saudi providers or the affinity route)
EXPECTED: baseline 3–5% → target ≥ 8% positive (ESTIMATE: supplier mail to a published business contact + a dated peak in their own workload)
```

---

## (c) Filters
**Work level: medium-high.** For each SME:
- read its invoice and credit-note samples against a 50-plus-field mandatory list;
- check every B2B customer's TRN/TIN (format, public lookup, legal-name match);
- derive the Peppol identifiers;
- list missing conditional fields;
- prepare a test-invoice checklist for the ASP sandbox.
After go-live, classify rejection messages into a fix-list the accountant can act on. It is a 2–3-hour file, not a 10-minute job.

**Demand trend (dated, earlier vs now):**
| Date | Data point | Label |
|---|---|---|
| 29 Sep 2025 | Ministerial Decisions 243/244 set the framework and phases; first pre-approved list published | PRESS (BDO, KPMG) |
| 12 Jun 2026 | 41 pre-approved providers; 15 in pipeline, 40 in review | SEARCH-SUMMARY (MoF deck 30 Jun 2026) |
| 29 Oct 2026 | **80 accredited ASPs** with named contacts | VERIFIED, E3 count |
| Before 1 Jul 2027 → from 1 Jul 2027 | Mandatory population for Phase 2: zero → every business doing B2B/B2G in the UAE, VAT-registered or not | PRESS (BDO, KPMG) |

**AI-substitution risk (12–24 months): medium.** Validation is automatic. Repair, chasing and lookups behind a security code stay human until ERPs ship clean UAE templates and AI agents can pass the FTA lookup (ESTIMATE).

**Team fit: good.**
- The partner's checklist work *is* the product (field-by-field checks, TRN lookups).
- The CEO handles ASP relationships in UAE business hours, which are Dhaka daytime: UAE 09:00–18:00 = Dhaka 11:00–20:00 (standard offsets).
- No Arabic is needed: PINT-AE fields and ASP portals are in English (ESTIMATE; spot-check one ASP portal).

**Halal: ✔** with the end-client rule in G1.

---

## (d) Real price evidence (dated)
| What buyers pay today | Amount | Source (date) | Label |
|---|---|---|---|
| Implementation consultant for an SME | AED 1,500–5,000 one-off | Tally, 20 Jul 2026 (opened) | VENDOR CLAIM |
| System integration | AED 2,000–8,000 one-off | Tally, 20 Jul 2026 | VENDOR CLAIM |
| Ongoing support | AED 500–2,400 a year | Tally, 20 Jul 2026 | VENDOR CLAIM |
| ASP subscription (SME) | AED 2,000–10,000 a year; or ~AED 0.75 per invoice | BusinessDubai (opened, undated 2026 guide) | VENDOR CLAIM |
| Testing and certification | AED 1,000–3,000 | BusinessDubai | VENDOR CLAIM |
| Free tier | first 100 e-invoices a year free from every ASP | BusinessDubai; SEARCH-SUMMARY (Decision 64/2025) | VENDOR CLAIM |
| Our price (wholesale to the ASP) | **AED 400 (~$109) per readiness file; AED 200 (~$54) per SME per month for triage** | Set at ~10–25% of the consultant's retail AED 1,500–5,000 so the ASP keeps margin | ESTIMATE |
(AED→USD at the long-standing 3.6725 peg; standard figure.)

---

## (e) Money path and 3-scenario estimate
**Path:**
1. **Pilot:** 3 free files for one ASP.
2. **First paid batch:** 5 files = AED 2,000 (~$545).
3. **Peak:** 15–30 files a month per ASP from Jan to Jun 2027.
4. **From Jul 2027:** triage at AED 200 per SME per month.
5. **Then:** Oman (Oct 2027 group) and Saudi waves with the same ASPs, many of which operate GCC-wide (ESTIMATE).

**One ASP at mid volume:**
- 15 files × $109 ≈ **$1,600/month** during the peak.
- Then ~45 SMEs × 40% on triage × $54 ≈ **$970/month**.

**Formula:** reachable ASPs × reply rate × conversion → partner ASPs; then × files/month × 6 peak months × $109, plus triage SMEs × $54 × 12 months.
| Assumption | Low | Mid | High |
|---|---|---|---|
| Reachable relevant ASPs | 40 | 40 | 40 |
| Positive reply rate | 3% | 6% | 10% |
| Conversion to paying partner | 33% | 50% | 50% |
| → Partner ASPs | 0.4 | 1.2 | 2.0 |
| Files per partner per month (6-month peak) | 5 | 15 | 30 |
| Peak revenue (6 months) | $1,300 | $11,800 | $39,200 |
| Share of onboarded SMEs on triage | 30% | 40% | 50% |
| Triage revenue (12 months) | $2,300 | $28,000 | $116,600 |
| **Total over ~18 months** | **≈ $3,600 (~$200/month)** | **≈ $39,800 (~$2,200/month)** | **≈ $155,800 (~$8,700/month)** |
**Capacity check:**
- **Mid** needs ~65 h/month, which is the whole team.
- **High** needs ~180 h/month of triage alone, so it requires 2 trained Dhaka checkers (the cap breaker). Without them, high collapses to mid.
- All figures are ESTIMATES built on the vendor prices in (d).

---

## (f) Cheap-test check: yes, 7 days, $0
1. **Days 1–2 (partner, ~6 h):** build the readiness checklist from the MoF mandatory-field list and guidelines. Make 1 sample file on a synthetic 20-customer SME.
2. **Day 3 (CEO, ~2 h):**
   - build the one-page identity site: a free Google Sites page with faces and the sample (T21);
   - write 10 emails (5 foreign-HQ platforms, 5 accounting-firm ASPs);
   - schedule them for UAE 09:00.
3. **Days 4–7:** count positive replies. A "yes" gets 3 free files on that ASP's real clients.
4. **Pass:** ≥ 1 positive reply and ≥ 1 pilot accepted.
   **Fail:** 0 of 10. Send 10 more with variant B. If that also fails, stop (T34).

---

## (g) Monday walk-through
1. **CEO:** open `research/handoffs/M5-uae-asp-list-2026-10-29.tsv` and pick 10 ASPs from the buyer list below. For each, note its own "SME onboarding" promise from its website (30 min).
   *Assets: laptop, internet. ✔*
2. **Partner:** open mof.gov.ae/einvoicing in a browser and download "UAE Electronic Invoice Mandatory Field Requirements" and the guidelines. Turn them into a checklist spreadsheet with one row per field and a "where it comes from in the SME's data" column (3 h).
   *Plane: scripts are bot-checked, so do this by hand in a normal browser. ✔*
3. **CEO:** draft the 10 emails from the Reply Card and the Google Sites identity page with both faces.
   *Missing asset: **the identity page and a short intro video don't exist yet.** That is a plane, fixed in ~2 h at $0.*
   *Flag: the CEO's UAE time-zone advantage is real only if he answers within ~1 h during UAE 09:00–14:00 = Dhaka 11:00–16:00, which collides with shop hours (ESTIMATE). Check his availability.*

---

## (h) Red team
**The strongest honest reason it fails:**
- The ASPs don't need us.
- The big platforms (Zoho, Tally, Wafeq, Avalara) ship UAE-ready templates and do onboarding themselves. Tally writes that "most established accounting software vendors offer implementation support as part of their onboarding" (opened).
- Many of the 80 ASPs are small consultancies with Indian or Pakistani back offices, i.e. **competitors, not buyers**. The UAE's accounting talent pool is dominated by Indian chartered accountants (ICAI Dubai is the largest of ICAI's 53 overseas chapters; SEARCH-SUMMARY).
- With 100 free invoices a year, the smallest SMEs will do the minimum themselves.

**Counter-evidence searches I ran (2026-10-29/30):**
- "e-invoicing UAE onboarding specialist / implementation consultant hiring 2026" → only a PwC senior role (31 May 2026). **No posted need for outside onboarding capacity was found.**
- "UAE ASP partner program / reseller" → **NOT FOUND.** One ASP (DocFlow) publishes a partners@ inbox on the MoF list (E3), and a 2026 amendment allows white-label partnering between national and international providers (SEARCH-SUMMARY).
- "similar offers get replies?" → **NOT FOUND either way.**

**What survives:**
- The demand peak is statutory and dated, so it exists whether or not anyone has posted a job.
- Foreign-HQ ASPs (Ecosio, Infinite IT, Ravera, Oxinus, RTC Novatech, Unified SSK, A-Cube, Comarch, EDICOM, Fonoa) have the weakest UAE ground teams (ESTIMATE from their HQ locations) and the strongest reason to rent Gulf-hours capacity.
- The test in (f) answers this in 7 days.

---

## (i) vs Shothik (Read, Trust, Pay)
| Step | Shothik | This | Verdict |
|---|---|---|---|
| Read | Facebook message requests; Dhaka night for calls | A regulator-published named business email; UAE office hours are Dhaka daytime | **Better.** Delivery and decision-maker are E2. Noticing is still unproven. |
| Trust | Bangla identity strong; risk weak (Google logins) | No affinity; competence unproven; risk strong (no logins, free pilot, per-file invoices) | **Same overall (1).** Different weak part: competence instead of risk. |
| Pay | Payoneer card, buyer habit Zelle/cash (P8) | B2B bank transfer to Payoneer for EU/UK-HQ ASPs; card or unverified wire for UAE-only ASPs | **Better** for EU/UK-HQ buyers; same for UAE-only |

---

## (j) Intelligence verdict
- **Where the formula misleads.** It scores this "weak by design" (1 of 3), but that understates its best feature. It is the only wave I found where a **government-published list of named middlemen** meets a **hard, unmoved 2027 date with per-invoice fines** and a **time zone that suits Dhaka**.
- **The real risk is commercial, not structural.** Will a busy ASP give an unknown two-person team its clients' customer lists? Many of the 80 are competitors with cheaper back offices.
- **What I believe.** It is worth exactly one 7-day test aimed at foreign-HQ platforms. If no ASP accepts a free pilot, drop it. Don't drift into selling to SMEs directly; that is the weaker affinity file (`M5-uae-einvoice-bangla-sme.md`).

---

## Named buyers (25, from the MoF accredited list, VERIFIED 2026-10-29; contacts exactly as published by the MoF)
**Why these 25:** foreign-HQ platforms with small UAE teams and accounting-firm ASPs with SME client books. I left out the large ERP vendors (Zoho, Tally, SAP), which onboard in-house. Every row is MoF-accredited and has 31 Mar–1 Jul 2027 Phase-2 onboarding ahead of it.
| # | ASP (MoF accreditation no.) | Contact point (MoF-published) | Visible signal / why a fit |
|---|---|---|---|
| 1 | Cloud Consulting LLC-FZ (DocFlow) (181172) | partners@docflow.ae · www.docflow.ae | Publishes a **partners@** inbox: a posted partner channel |
| 2 | Ecosio Emea IT Services FZCO (132670) | Martina.Landauer@ecosio.com · www.ecosio.com | Austrian-HQ platform; foreign team (ESTIMATE) |
| 3 | Infinite IT Solutions FZCO (171157) | Andrzej.mioduski@infinite.pl · www.infinite-it.com | Polish-HQ; publishes UAE compliance trackers |
| 4 | Ravera EInvoicing Services FZCO (199307) | mbr@ravera.ae · www.ravera.ae | E-invoicing-only firm; among the highest accreditation numbers on the list, so possibly a recent entrant (ESTIMATE) |
| 5 | Oxinus Holding Limited (198978) | invoicing@oxinus.holdings · www.oxinus.holdings | Foreign-HQ; among the highest accreditation numbers on the list |
| 6 | RTC Novatech Solutions (139410) | ridvan.yigit@rtcsuite.com · www.rtcsuite.com | Turkish-HQ multi-country e-invoicing suite |
| 7 | Unified SSK Information Technology LLC (163006) | contact@unifiedssk.com · www.unifiedssk.com | Foreign-staffed; contact inbox only |
| 8 | Platform ACube Technologies LLC (A-Cube) (188961) | thanveer.taju@a-cube.io · www.acubeapi.com/en/uae | Italian API provider, new to UAE |
| 9 | Comarch Middle East FZ LLC (110668) | e-invoicingme@comarch.com · comarch.com | Polish-HQ; dedicated ME e-invoicing inbox |
| 10 | EDICOM Middle East Services (102434) | amenezes@edicomgroup.com · edicomgroup.com | Spanish-HQ global e-invoicing network |
| 11 | Fonoa Gulf Technology Services LLC (149104) | e-invoicing-tax@fonoa.com · fonoa.com | API-first, lean ops (ESTIMATE) |
| 12 | Casim L.L.C-FZ (178533) | hello@casim.ae · www.casim.ae | Small UAE start-up ASP |
| 13 | InvoiceQ For IT Limited (114413) | mmneimne@invoiceq.com · ae.invoiceq.com | Saudi-origin e-invoicing firm (also fits the Saudi Wave 25 extension) |
| 14 | Orchida Soft Computer Systems LLC (194498) | baamer@orchida-soft.com · orchidatax.com | Recent accreditation; ZATCA background (ESTIMATE) |
| 15 | Global Experts of IT Consultants (160689) | mohamed.hefnawy@global-experts.co.uk · global-experts.co.uk | Small consultancy ASP |
| 16 | LightIdea Information Technology LLC (111062) | jmetry@lightidea.org · lightidea.org | Small ASP, named founder contact |
| 17 | Hamwi Computer Software (Fatorly) (131375) | basheer@ha-consultancy.com · fatorly.com | Consultancy-run ASP brand |
| 18 | KGRN Chartered Accountants (120915) | gopu@kgrnaudit.com · kgrnaudit.com | Audit firm ASP with an SME client base |
| 19 | Mac & Ross Chartered Accountants LLC (130476) | dheeraj@macnrossdubai.com · macnross.com | Accounting firm ASP |
| 20 | SNB Accounting Management & Tax Consultancy (192393) | manishbucha@snbconsulting.ae · snbconsulting.ae | Accounting firm ASP; 3 named contacts |
| 21 | UHY James Advisory LLC (148957) | einvoicing@uhy-ae.com · uhy-ae.com | Mid-tier audit network; dedicated e-invoicing inbox |
| 22 | Moore JFC Consulting LLC (158006) | e-invoicing@moorejfcgroup.com · moorejfcgroup.com | Mid-tier network; dedicated inbox |
| 23 | Hamt IT LLC (EVATRA, HLB Hamt) (144576) | einv@hlbhamt.com · hlbhamt.com | HLB member's ASP arm |
| 24 | GSS Management Consultancy (167585) | kaleem@gssmcgulf.com · gssmcgulf.com | Consultancy ASP, 3 named contacts |
| 25 | Advintek Consulting Services LLC (196766) | sajid@advintek.ae · einvoice.advintek.ae | Consultancy ASP, recent accreditation number |
Another 55 ASPs on the same MoF page are findable the same way (Road "100+ findable" is capped at 80 for UAE; Oman's and Saudi Arabia's provider lists add more, NOT counted).

## Sources opened
- MoF ASP list: https://mof.gov.ae/en/about-us/initiatives/einvoicing/einvoicing-accredited-service-providers-asps/ (footer "Last updated on 29/10/2026")
- MoF e-invoicing hub: https://mof.gov.ae/einvoicing
- KPMG TaxNewsFlash 22 Jul 2026: https://kpmg.com/us/en/taxnewsflash/news/2026/07/tnf-uae-phased-implementation-of-e-invoicing-beginning-january-1-2027.html
- BDO Indirect Tax News: https://www.bdo.global/en-gb/insights/tax/indirect-tax/united-arab-emirates-e-invoicing-the-regulatory-build-out-and-the-road-ahead
- Khaleej Times 19 Oct 2026: https://www.khaleejtimes.com/business/uae-amends-e-invoicing-regulations-to-reduce-operational-burden-on-businesses
- Tally 20 Jul 2026: https://tallysolutions.com/mena/uae-vat/e-invoicing-implementation-cost-uae-smes/
- BusinessDubai: https://www.businessdubai.ae/blogs/uae-e-invoicing-2026
- Helper calendar rows 12–13 (Saudi, Oman): research/handoffs/M5-helper-1-wave-calendar.md
