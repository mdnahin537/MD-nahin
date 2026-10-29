MODEL: sonnet | EFFORT: high
(Launched directly by the M6 Opus companion via the Agent tool; this file is the audit copy of the brief.)

# M6 helper 1 — Named-buyer list + Bangladesh prices: foreign background-screening firms that sell checks in Bangladesh

## STEP 0 — THE BRIEF
**Role.** You are an evidence collector for a two-person team in Dhaka, Bangladesh. You find real, dated, checkable facts. You never invent names, emails, prices, posts or quotes. If you cannot find something, write NOT FOUND and what you tried.

**Task.** Build a list of **at least 25 real named foreign (non-Bangladeshi) background-screening / verification firms** that sell **international** checks (education, employment, reference, address, identity, company/directorship) and could need a **Bangladesh desk partner**. Include, where you can, a mix of: (a) international screening wholesalers that serve other screening firms; (b) mid-size screening firms in the UK, Australia/NZ, Singapore/Malaysia, the Gulf (UAE, Saudi, Qatar), Canada and the US that publish international coverage or country pages; (c) global-hiring / EOR platforms that resell background checks in Bangladesh (they buy from screening partners). For each firm record:
1. Name, HQ country, website.
2. Type (wholesaler / screening firm / EOR or HR platform / healthcare PSV / other).
3. **Bangladesh signal** (the strongest you can find, with URL): a Bangladesh country page; Bangladesh named in a price list or coverage list; a published Bangladesh price or turnaround; or a price list that **omits** Bangladesh or says "on request/ask us" (that is a gap signal — record it exactly).
4. **Published prices** for international education / employment / reference / address / company checks: Bangladesh if shown, otherwise India and Pakistan as neighbours. Currency, amount, turnaround, and the document date or "as of" date.
5. **Public contact point for a supplier/partner approach**: a vendor or partner page, "become a partner / join our network / supplier registration" form, partnerships@ / vendors@ / info@ email, or a named head of international operations / vendor management (LinkedIn URL is fine). Write exactly what you found and where.
6. Any public statement about **how** they do international checks (own staff in a hub, "in-country partners", "global network of researchers").
7. Any **vendor requirements** they publish (E&O insurance amount, data-protection agreement, ISO 27001, PBSA accreditation).

**Seeds already found by the M6 lead (check and include):**
- WorkPro (Australia), pricing schedule V28 Aug 2026: https://irp.cdn-website.com/3f5c3df1/files/uploaded/WorkPro+Pricing+Schedule+-+%28V28%29+Aug+2026.pdf (employment/qualification tables list India, Pakistan, Philippines but not Bangladesh: "Other countries: ask our team").
- Zinc (UK) Bangladesh page: https://zincwork.com/global-background-checks/bangladesh
- Veremark (UK) Bangladesh page: https://www.veremark.com/country/bangladesh
- Skuad, Multiplier, RemotePeople Bangladesh background-check pages (EOR/HR platforms).
- Owens OnLine (US wholesaler, "250+ countries"), Choice Screening partner page https://www.choicescreening.com/company/partnerships/owens
- iCover (Bulgaria; native-speaker verification hub), Certiphi, Truescreen, IntelliCorp international pages.
- Verifile (UK) services-by-country support page: https://support.verifile.co.uk/support/solutions/articles/101000505804-services-links
- Checkr international (223 countries), Accurate, First Advantage, HireRight, Sterling, AuthBridge (India), DataFlow Group (Gulf healthcare primary-source verification).

**Also answer (short, with sources):**
- A. Is there public evidence of what screening firms or wholesalers **pay in-country partners/vendors** per check (any country)? Give up to 5 dated sources. If none, say NOT FOUND and what you searched.
- B. Is there public evidence of any screening firm **recruiting in-country partners for Bangladesh or South Asia** (vendor recruitment pages, posted requests, LinkedIn posts)? URLs and dates.
- C. Counter-evidence: 2–3 examples showing Bangladesh is already covered by an established route (e.g., a firm with a Dhaka office, or a Bangladeshi vendor that names international screening clients).

**Context.** The team (CEO: Bangla/English, research; partner: exact checklist work; both part-time, Dhaka) is testing whether to offer foreign screening firms a "Bangladesh desk": verification by phone in Bangla, official online systems (education board results, registries) and email to registrars and employers, with a dated evidence trail. Rare site visits only. Nothing will be sent now; this list is for planning.

**Rules.**
- Tools: load web tools with ToolSearch ("select:WebSearch,WebFetch"). WebFetch often fails on DNS here: use curl in Bash instead (the network is open via a proxy; use https URLs). PDFs: save with curl and read with `pdftotext -layout`. Some sites block automated reads (Upwork, Reddit, Facebook, LinkedIn pages): use search previews and label them SEARCH-SUMMARY.
- Label every fact: VERIFIED (you opened the page), SEARCH-SUMMARY (search preview only), VENDOR CLAIM (a firm's own marketing claim about itself), NOT FOUND.
- Never contact anyone, sign up, submit forms or send messages.
- Do not run git. Do not edit any file except your output file below.
- Quotes under 15 words.

**Output.** Write your table and answers to `/home/user/MD-nahin/research/handoffs/M6-helper-1-buyers.md` (first line `STATUS: IN PROGRESS` while working, `STATUS: FINAL` at the end; save after every ~8 rows so a usage stop loses little). Columns: # | Firm (HQ) | Type | Bangladesh signal (URL, date) | Published prices (check, amount, turnaround, date) | Contact point for partner approach | How they do international checks | Vendor requirements | Label. Then your final reply to me: 10 lines max — row count, how many have a Bangladesh price or gap signal, the 3 best-fit firms and why, and anything that contradicts the idea.

**Tips.** Country pages ("background checks in Bangladesh"), price lists (PDF "pricing schedule", "international price list"), RFP kits ("international checks" FAQs), and "partners/vendors" pages are the richest sources. PBSA member directory and SHRM vendor directory list firms by service. UK firms: search "BS7858 screening international checks"; Australia: "international police check employment verification price"; Gulf: "background screening Dubai education verification".

**What not to do.** Don't pad the list with firms that sell only domestic US criminal checks. Don't guess emails from patterns. Don't count a firm twice under brand names.

## STEP 1 — WHY THIS MATTERS
The team will spend weeks emailing whichever buyers this list names. A padded or invented list wastes that time and their trust. A real list with the firm's own Bangladesh gap or price is the first line of the letter.

## STEP 2 — WHAT SUCCESS LOOKS LIKE
- ≥25 rows, each with a real public contact point and a URL for the Bangladesh signal (or an explicit "no Bangladesh mention found on <URL>").
- ≥8 rows with a published price for an international check (Bangladesh or India/Pakistan), with date.
- Answers A–C with URLs, or NOT FOUND with what you tried.
- Zero invented facts.

## STEP 3 — A WAY TO CHECK THE WORK
- Re-open 5 random rows' URLs and confirm the contact point and signal are there.
- For every price, confirm currency, check type and date on the page itself.
