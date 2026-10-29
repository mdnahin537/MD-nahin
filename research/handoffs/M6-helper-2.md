MODEL: sonnet | EFFORT: medium
(Launched directly by the M6 Opus companion via the Agent tool; this file is the audit copy of the brief.)

# M6 helper 2 — Named-buyer list: intermediaries that send verification requests to Bangladeshi universities and boards

## STEP 0 — THE BRIEF
**Role.** You are an evidence collector for a two-person team in Dhaka, Bangladesh. You find real, dated, checkable facts. You never invent names, emails, prices, posts or quotes. If you cannot find something, write NOT FOUND and what you tried.

**Task.** Build a list of **at least 22 real named organisations outside Bangladesh** that **verify academic credentials directly with the issuing institution** and therefore send requests to Bangladeshi universities and education boards. Types to cover:
1. Qualification verifiers paid by universities (UK, Ireland, Australia): Qualification Check, Ecctis (UK ENIC), Prospects HEDD (check if it does international), Atlantic Data, Veremark, Verifile, Vero Screening, etc.
2. Credential evaluators: WES (US/Canada), ECE, SpanTran, Josef Silny, IERF, Educational Perspectives, CES (Toronto), ICES (BC), ICAS, IQAS (Alberta), NZQA, VETASSESS, UHR / University Admissions in Sweden, Nuffic (NL), others that publish a **Bangladesh** document page.
3. Healthcare primary-source verification and licensing intermediaries: DataFlow Group, CGFNS, ECFMG/EPIC, Prometric-linked PSV, Gulf health-authority PSV partners.
4. Global screening firms' education-verification arms (First Advantage, HireRight, Sterling, Checkr, Certn, Accurate) — **only add basic rows for these; another helper already covers screening firms in depth** (`research/handoffs/M6-helper-1-buyers.md`; read it first and do not duplicate its work beyond name + contact).

For each organisation record:
- Name, country, website, type.
- **Bangladesh signal** (URL): a Bangladesh country/document-requirements page; a statement about verifying with Bangladeshi institutions; Bangladesh fees, delays or special rules (e.g., "documents must be sent directly by the university", "Bangladesh is high-risk", extra fee). Quote under 15 words.
- **What the applicant or client pays** (fee, currency, page date) if published.
- **Public contact point** for a supplier / institution-relations / operations approach: a published email (verification@, institutions@, partnerships@, info@), a contact or partner form URL, or the named head of verification operations / institution relations (LinkedIn URL fine). Write exactly what you found and where.
- Any statement about **delays with non-responsive institutions** or **local agents/partners** used in-country.

**Seed facts the lead already verified (use, don't re-research):** Dhaka University's 2026 statement (Daily Star) names "WES, First Advantage, Qualification Check, DataFlow, AMS India, and UHR" as intermediaries that send it verification requests with a USD 50 fee. Identify **AMS India** precisely (full company name, website, what it does) — that is a priority question.

**Also answer (short, with sources):**
- A. Does any of these organisations publish that it pays fees to Bangladeshi institutions, or that it uses **in-country agents** to obtain verifications (any country)? URLs.
- B. Which of them publish a **Bangladesh-specific** rule (sealed envelopes sent by the university, attestation by the board, extra fees, longer turnaround)? URLs and short quotes.
- C. Counter-evidence: any sign that Bangladeshi institutions now answer these requests online and fast (e.g., an online verification portal used by evaluators).

**Context.** The team is testing a "Bangladesh Primary-Source Desk": it would help these intermediaries get Bangladeshi institutions to answer (route the request, pay the official fee locally with receipt, chase by phone in Bangla), while the **institution replies to the intermediary directly**. Nothing will be sent now; this list is for planning.

**Rules.**
- Tools: load web tools with ToolSearch ("select:WebSearch,WebFetch"). WebFetch often fails on DNS here: use curl in Bash with https URLs (the network is open via a proxy). PDFs: save with curl and read with `pdftotext -layout`.
- Label every fact: VERIFIED (you opened the page), SEARCH-SUMMARY (search preview only), VENDOR CLAIM, NOT FOUND.
- Never contact anyone, sign up, submit forms or send messages. Do not run git. Do not edit any file except your output file.
- Quotes under 15 words.

**Output.** Write to `/home/user/MD-nahin/research/handoffs/M6-helper-2-intermediaries.md` (first line `STATUS: IN PROGRESS` while working, `STATUS: FINAL` at the end; save every ~8 rows). Columns: # | Organisation (country) | Type | Bangladesh signal (URL, quote) | Fee published | Contact point for supplier/ops approach | Delays / local agents note | Label. Then answers A–C. Final reply to me: 10 lines max — row count, how many have a Bangladesh-specific page, what AMS India is, the 3 best-fit buyers and why, and anything that contradicts the idea.

**What not to do.** Don't pad with organisations that only verify domestic (UK-only, US-only) qualifications. Don't guess emails from patterns. Don't list Bangladeshi firms as buyers.

## STEP 1 — WHY THIS MATTERS
The team will email whichever organisations this list names. Real contact points and a Bangladesh-specific signal per row turn a guess into a road.

## STEP 2 — WHAT SUCCESS LOOKS LIKE
- ≥22 rows, each with a real public contact point and a URL.
- ≥8 rows with a Bangladesh-specific page or rule.
- AMS India identified, or NOT FOUND with what you tried.
- Zero invented facts.

## STEP 3 — A WAY TO CHECK THE WORK
- Re-open 5 random rows' URLs and confirm the contact point and the Bangladesh signal are on the page.
