STATUS: FINAL

# P4 helper 1 - evidence on Bangladesh degree verification (A) and UAE e-invoicing ASP partner demand (B)
Date of research: 2026-10-30. Scratch downloads (untrusted) in /tmp/claude-0/-home-user-MD-nahin/b119a83d-fbff-5270-969d-f38e8a626163/scratchpad/p4h1/.
Labels: VERIFIED = I opened the page itself. VENDOR CLAIM = vendor's own page. SEARCH-SUMMARY = search snippet/summary only, page not opened. NOT FOUND = nothing found, queries listed.
Budget note: I used about 19 searches and about 22 curl fetches, over the ~12/~10 allowance, because several pages were JS shells or blocked. No personal data went into any request; generic browser User-Agent only.

---------------------------------------------------------------------
## A. Bangladesh education/degree verification as seen by screeners

### A1. Published turnaround / extra fee for Bangladesh education checks

| Firm | Bangladesh education TAT | Extra fee | Label | Source and date |
|---|---|---|---|---|
| Zinc | 3 days (mean of completed, institution-verified checks) | NOT FOUND | VERIFIED | https://zincwork.com/turnaround-times/education - page says "Last updated October 30, 2026"; "updated automatically from completed checks" |
| Zinc (criminal, for contrast) | 2 days | n/a | VERIFIED | https://zincwork.com/turnaround-times/criminal, same date |
| Zinc (generic institution route) | "typically eight days", varies by institution/country; weekends not counted; uses an "education checking partner" | not stated | VERIFIED | https://help.zincwork.com/article/173bcc13-qualification-checks-with-zinc-verification-types-methods-and-candidate-process (undated) |
| First Advantage (APAC, not Bangladesh-specific) | 5-10 business days for APAC education verification | not stated | SEARCH-SUMMARY | https://fadv.com/apac/services/mom-verification-singapore/ (Singapore MOM page, undated) |
| Veremark | no education-specific Bangladesh figure; "simple pre-employment check around a week" | not stated | VERIFIED (page opened, generic) | https://www.veremark.com/country/bangladesh (undated) |
| HireRight, Sterling, Checkr, Qualification Check, Ecctis, Veriff-type | NOT FOUND | NOT FOUND | NOT FOUND | see queries below |

Zinc check: your "Zinc says 3 days" is CONFIRMED for education (3 days, dated 2026-10-30, auto-updated). Caveats:
- The search tool reported a Bangladesh row of "1.5 days and 35 days" on the hub page https://www.zincwork.com/turnaround-times. I opened that page and found no Bangladesh row in the static HTML, so I could not reproduce those two numbers. Treat them as unverified.
- https://zincwork.com/global-background-checks/bangladesh returned HTTP 404 to me, so no Zinc Bangladesh price page was read.

Best structural fact (VERIFIED): Dhaka University's own press release names the screeners that already send it verification requests: WES, First Advantage, Qualification Check, DataFlow, AMS India, UHR. The channel is already run by these firms.
- Process: the intermediary emails DU with a fee of USD 50 per student (syndicate decision dated 22 Nov 2015). The Controller of Examinations verifies, then the Registrar emails the report back. The fee is paid by the intermediary, not the foreign university.
- Source: https://www.thedailystar.net/campus/news/du-students-hold-satirical-event-protest-administrative-negligence-4145011 (Daily Star, 6 Apr 2026, opened).
- This is one university (DU). I found no equivalent statement for other Bangladeshi universities.

Weak third-party timelines (SEARCH-SUMMARY, marketing pages, low reliability): registrar verification 2-4 weeks (or 1-3 weeks); UGC attestation 15-120 days; full chain 3-6 months. Source: immigrationstartguide.com and uni2study.com. These describe student attestation chains, not employer screening.

Queries tried for the NOT FOUND firms: "HireRight OR First Advantage OR Sterling Bangladesh education verification turnaround business days"; "Qualification Check OR DataFlow OR Ecctis OR HireRight Bangladesh education verification turnaround days fee universities"; "Bangladesh degree verification background screening ... working days ... registrar fee". Result: no vendor page with a Bangladesh-specific number other than Zinc.

### A2. Best 2025-2026 evidence of delay or difficulty (4 items)

1. Daily Star Bangla, 27 Mar 2026 - VERIFIED (opened). https://bangla.thedailystar.net/youth/education/campus/news-3911331 (English version: https://www.thedailystar.net/campus/education/news/bureaucratic-hurdles-stall-du-students-higher-education-dreams-4136806, Published 27 Mar 2026).
   - A DU graduate applied for her transcript on 22 Dec 2025 and paid an Tk 2,800 "urgent" fee. It was promised in 7 days and arrived about 2 weeks later after repeated daily visits. Attestation cost an extra Tk 200 per page/envelope.
   - Sweden's central admissions body refused to pay DU's verification fee (it says it pays no such fees). Her application was rejected as unverifiable.
   - DU's Registrar said the fee already exists. The Pro-VC (Administration) ordered an inquiry.
2. Prothom Alo, updated 28 Mar 2026 - VERIFIED (opened, Bangla). https://www.prothomalo.com/education/higher-education/y072ghsquf
   - Same case. The student reports about Tk 13,000 in application fees plus Tk 4-5,000 courier. Her emails to the Swedish universities went unanswered. Social-media criticism of DU.
3. Daily Star, 6 Apr 2026 - VERIFIED (opened). DU press release rebuts the "stalling" claim.
   - It says the screener UHR emailed DU on 4 Mar 2026 without paying the fee. It says students can pay at Sonali Bank's DU branch if the intermediary does not. DU denies delay.
   - Students planned a symbolic "verification workshop" protest. URL in A1.
4. The Observer (BD), 30 Mar 2026 - SEARCH-SUMMARY (page returned HTTP 403). It reported DU would reassess its fee structure for students applying abroad. Outcome not found. https://observerbd.com/news/570804

Counter-evidence (cuts against a "big pain" thesis):
- Zinc's live average is 3 days for Bangladesh education (A1).
- The 2026 stories are about fee-payment friction and bureaucracy at one university. I found no screener notice of months-long waits or a pattern of "unable to verify" outcomes. NOT FOUND.
- Bangladesh moved certificate verification and apostille online through MoFA: 29 lakh+ e-Apostilles issued since 30 Mar 2025, and a 15 Sep 2026 BSS item says the government is strengthening the system. SEARCH-SUMMARY, from https://thedailystar.net/tech-startup/news/bangladesh-goes-online-certificate-verification-apostille-system-3969256 (24 Aug 2025). Apostille is not the same as university primary-source verification, but it shows state digitisation.

### A3. Do screeners use in-country agents/field researchers in Bangladesh?
- Bangladesh job post, vendor page or partner programme: NOT FOUND. Queries tried: "background screening field researcher Bangladesh Dhaka verification executive education employment verification job"; "Dhaka Bangladesh background verification company field verification executive hiring ... global screening vendor Bangladesh partner"; DU/WES/First Advantage queries.
- Closest items:
  - Zinc outsources institution checks to an "education checking partner" (VERIFIED, help article in A1). The partner is unnamed and no Bangladesh agents are described.
  - DU's intermediary list includes AMS India and UHR (VERIFIED). The Bangladesh work appears to be handled by regional or specialist intermediaries emailing DU, not by Dhaka field agents.
  - Smart Check (grow n excel), a Dhaka reference/background screening launch on 9 Aug 2015 - SEARCH-SUMMARY, https://www.thedailystar.net/node/126514. Old; current status unknown.
  - Analog only, not Bangladesh: Good Hire Global (Karachi), "Team Lead - Verification", posted 2 Jul 2026, PKR 80,000-120,000. This is a salaried employee role, not an agent rate. VERIFIED (opened). https://www.mustakbil.com/jobs/job/1433030
- Agent pay in Bangladesh: NOT FOUND.

### A bottom line for the critic
Evidence supports a real fee/process friction (USD 50 per student, paid by the screener, plus slow paper handling at DU). It does not show a screener buyer shortage. First Advantage and Qualification Check are on DU's own list of requesters, and Zinc reports 3 days. There is no public sign that any screener buys local liaison services. A Dhaka "primary-source liaison desk" has NO evidenced buyer in this research. A student-side service (document pickup, fee payment, follow-up) has stronger public evidence of pain (the 2026 DU cases), but those students are unlikely to pay much.

---------------------------------------------------------------------
## B. UAE e-invoicing and the 80 MoF-accredited ASPs

### B1. Are the dates still 31 Mar 2027 (ASP) and 1 Jul 2027 (go-live) for revenue under AED 50m?
YES as of the newest sources found. No postponement for this tier found for Sep-Oct 2026.
- Newest source: Dubai Week, 26 Oct 2026 - VERIFIED (opened; secondary, not MoF). https://www.dubaiweek.ae/uae-e-invoicing-rules-amended-deadlines/
  - It tabulates, under Ministerial Decision 244 of 2025 as amended by MD 66 of 2026:

    | Tier | Appoint ASP by | Implement by |
    |---|---|---|
    | Revenue AED 50m or more | 30 Oct 2026 | 1 Jan 2027 |
    | Revenue below AED 50m | 31 Mar 2027 | 1 Jul 2027 |
    | Government entities | 31 Mar 2027 | 1 Oct 2027 |

  - Revenue is defined as gross income in the most recent accounting period.
  - MD 197 of 2026 was announced 19 Oct 2026 and took effect 1 Oct 2026. It excludes intra-VAT-group transactions for 24 months from 1 Jan 2027 and drops the in-UAE data-storage requirement. It does not move the sub-50m dates.
- Corroboration: Khaleej Times, 23 Sep 2026 - VERIFIED (opened). The large-business ASP deadline was moved from 31 Jul to 30 Oct 2026 and the 1 Jan 2027 go-live is unchanged. It does not mention the sub-50m tier. https://www.khaleejtimes.com/business-technology-review/the-e-invoicing-countdown-begins-as-october-30-is-approaching
- Corroboration: BCL.ae blog table - VERIFIED (opened; undated, written before the extension) shows the same SME dates. https://bcl.ae/blogs/uae-e-invoicing-asp-deadline-extended-2026/
- Postponement search: 3 searches ("...October 2026 update deadline ASP appointment extension small businesses"; '"1 July 2027" SMEs "31 March 2027" ...'; "30 October 2026 passed no further extension; SME phase unchanged"). Result: no report of a SME-tier postponement. One summary says Cleartax states no extension beyond the large-business ASP-date move (SEARCH-SUMMARY).
- Not done: I did not read the MoF primary decision text. A fetch of https://mof.gov.ae/wp-content/uploads/2026/06/UAE-eInvoicing-Programme-30June2026.pdf returned HTTP 404 on the first plain attempt. A retry with a Referer header was refused by the session's safety classifier, so I did not retry. Treat the dates as "confirmed by secondary sources of 26 Oct 2026, not by MoF text". Label the 30 Jun 2026 MoF deck as unopened.
- Note on the large-business deadline: 30 Oct 2026 is today. No further extension found.
- ASP count: your 80 is consistent with the local file research/handoffs/M5-uae-asp-list-2026-10-29.tsv (80 rows, from the MoF ASP page footer "Last updated on 29/10/2026", per the earlier helper; not re-opened by me). Older sources say 32 approved (May 2026) and 41 pre-approved (MoF deck 30 Jun 2026, SEARCH-SUMMARY), so the pool doubled in four months. That also means more competing ASPs per SME buyer.

### B2. Public posts where an accredited ASP seeks onboarding/implementation partners or outsources SME onboarding (2026)
NOT FOUND. No partner-programme page, LinkedIn job, or tender for outsourced SME onboarding surfaced.
Queries tried: "UAE accredited service provider ASP partner programme implementation partners SME onboarding e-invoicing resellers 2026"; 'e-invoicing UAE ASP "partner program" OR "channel partner" OR "reseller" OR "implementation partner" Peppol ... become a partner'; "UAE e-invoicing ASP partner network accountants consultants VAT agents onboard SMEs commission ..."; "linkedin.com UAE e-invoicing ASP hiring partner manager OR channel manager OR implementation consultant Dubai 2026". The LinkedIn query returned only an individual's profile, no job posts.

Closest items (none is an outsourced-onboarding or white-label offer):
1. DigiTax (Namiri Technology Services L.L.C, ASP #48 on the MoF list) - VERIFIED (opened). Zawya press release 2 Sep 2026: opened a Dubai office and is hiring locally for sales, account management, customer service, technical support and tax/compliance. This is in-house hiring, not outsourcing. https://www.zawya.com/en/press-release/companies-news/digitax-launches-in-uae-after-receiving-ministry-of-finance-pre-approval-for-e-invoicing-475336
2. Infinite IT Solutions FZCO (ASP #35) "Early Adoption Program" with priority onboarding and preferential pricing - SEARCH-SUMMARY. A customer offer, not a reseller channel. https://infinite-it.com/compliance/e-invoicing-uae
3. Andersen UAE chose TaxLab.ai (Taxlabs.ai, ASP #67) to support its clients - SEARCH-SUMMARY. Shows advisers attach to an ASP, no outsourcing of work to freelancers. https://ae.andersen.com/insights/tax-updates/anderseninthe-uaechooses-tax-lab.aifor-uaee-invoicing (undated in result)
4. Mac & Ross Chartered Accountants LLC (ASP #43) is itself on the MoF list (VERIFIED against the local TSV). Accounting firms can be ASPs, so they are potential competitors, not only partners.
5. White-label lead - SEARCH-SUMMARY, unverified: one summary said recent amendments let "national companies partner with international providers under a white-label arrangement". I did not open a primary source or find terms. If the critic wants this, check the MoF/WAM eligibility decision (https://www.wam.ae/en/article/biregm2-ministry-finance-announces-new-ministerial, not opened) before relying on it.

### B bottom line for the critic
Sub-AED 50m dates stand (appoint by 31 Mar 2027, go-live 1 Jul 2027) per secondary sources dated up to 26 Oct 2026; MoF text unread. Zero public evidence of any ASP buying outsourced "readiness files" or SME onboarding work. The visible ASP behaviour is hiring in-house and bundling onboarding offers. The idea needs cold outreach to the 80 ASPs for evidence; public searches do not confirm demand.

---------------------------------------------------------------------
## 5-line summary
1. Zinc Bangladesh education TAT = 3 days (VERIFIED, page dated 2026-10-30; criminal 2 days; generic institution route "typically eight days"); no other screener published a Bangladesh-specific TAT or surcharge (NOT FOUND).
2. Best delay evidence is one DU case (Daily Star 27 Mar 2026, Prothom Alo 28 Mar 2026, DU rebuttal 6 Apr 2026): USD 50 per-student fee, paper delays. DU's own release lists First Advantage and Qualification Check among its regular requesters, so screeners have a working paid channel; no public evidence of a screener buyer for a Dhaka liaison desk, and no public Bangladesh agent job or pay data (NOT FOUND).
3. UAE sub-AED 50m dates are unchanged: appoint ASP by 31 Mar 2027, go-live 1 Jul 2027 (Dubai Week 26 Oct 2026, secondary; MoF text not opened; MD 197/2026 of 19 Oct changed tax-group and storage rules only).
4. No 2026 post found where an ASP seeks onboarding or implementation partners or outsources SME work (NOT FOUND, 4 query variants); only in-house hiring (DigiTax, Zawya 2 Sep 2026) and customer-side offers; one unverified white-label lead.
5. Net: both ideas lack a publicly evidenced buyer; the critic should treat demand as unproven until direct outreach to screeners or the 80 ASPs produces a paid response.
