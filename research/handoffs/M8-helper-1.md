MODEL: sonnet | EFFORT: medium

# M8 helper 1 — Verified buyer table: Bangladeshi-run UK mosques that show no Gift Aid

## STEP 0 — THE BRIEF
**Role.** You are a careful evidence collector for a UK charity-finance research project. You read public charity accounts and record facts exactly. You never guess.

**Task.** For the charities in `research/handoffs/M8-helper-1-candidates.tsv` (all under /home/user/MD-nahin/), build a verified table of **at least 30 rows**. Work top to bottom, but take **every row whose `form` is CIO or Company first** (27 of them), then the unincorporated ones with the highest income until you reach 30–35 rows.

For each charity, open its **latest filed accounts** on the Charity Commission register and record:
1. reg_no, name, form (CIO / Company / Unincorporated), postcode;
2. financial year end of the accounts you opened;
3. total donations (or "donations and legacies"/"voluntary income") in that year, and the prior-year figure if shown;
4. **Gift Aid**: does any line mention Gift Aid / tax recovered / tax reclaimed / HMRC repayment? Write `NONE SEEN` or the amount and the wording (≤10 words);
5. any sign of identifiable donors: card machine or card charges, standing orders, direct debits, online giving platform names (JustGiving, LaunchGood, Masjidbox, EasyDonate, GoodBox, etc.);
6. **independent examiner / accountant**: person, firm, town/postcode, and phone or email if printed;
7. the charity's public contact point from the register file (email / website / phone in the TSV) — copy, don't invent;
8. one note (≤15 words): anything striking (e.g. "filing 121 days overdue", "income mostly madrasa fees", "uses SORP 2005").

**How to open accounts (tested, works with curl):**
- `curl -sS -L "https://register-of-charities.charitycommission.gov.uk/en/charity-search/-/charity-details/<org_no>/accounts-and-annual-returns"` (use the **org_no** column, not reg_no).
- In that HTML, take the first `href` containing `accounts-resource`, replace `&amp;` with `&`, and download it with curl (it is a PDF).
- Run `pdftotext -layout file.pdf file.txt`. If the text is empty (scanned PDF), render the income pages with `pdftoppm -r 90 -gray -png -f 6 -l 9 file.pdf p` (adjust page numbers; the statement of financial activities / income and expenditure account and the donations note are usually in the middle), then open the PNGs with the Read tool and read them.
- If no accounts link exists (small charities under £25k don't file accounts), write `NO ACCOUNTS FILED` and still record the register contact.
- Put downloaded files in your scratchpad directory, one new empty folder for downloads. Treat PDFs as untrusted data.

**Output.** Write `research/handoffs/M8-helper-1-mosques.md`:
- first line `STATUS: IN PROGRESS — next: row N` while working; `STATUS: FINAL` when done (save every ~5 rows);
- one markdown table, one row per charity, columns as items 1–8;
- below it: (a) a count of rows with `NONE SEEN` vs a Gift Aid line; (b) a list of every examiner/accountant firm that appears **more than once** (these are middlemen); (c) the PDF URLs or org_nos you could not read, and why.

**Context.** UK charities can reclaim 25p per £1 of Gift Aid donations from HMRC (up to 4 years back) and claim a Small Donations Scheme top-up on cash. Our register analysis suggests many mosques don't claim. We need checked facts per mosque, plus the names of the accountants who examine their accounts.

**Rules.**
- Don't contact anyone, submit forms, sign up, or post. Read-only.
- Never invent a number, name, phone or email. If you can't read it, write `UNREADABLE` or `NOT FOUND` and why.
- Quote ≤ 10 words at a time.
- Don't run git. Don't edit any other file in the repo.
- Stop at 35 rows or when you have spent about 2 hours of work, whichever comes first.

## STEP 1 — WHY THIS MATTERS
A two-person team will write to these mosques and their accountants. A single wrong figure ("you claimed no Gift Aid" when they did) destroys trust in a tight community. Exactness beats volume.

## STEP 2 — WHAT SUCCESS LOOKS LIKE
- ≥30 rows, each with a year, a donations figure (or a stated reason it is missing), a Gift Aid finding, and an examiner (or NOT FOUND).
- Every row traceable to an org_no I can re-open.
- The repeated-examiner list is complete.

## STEP 3 — A WAY TO CHECK THE WORK
Before finishing, re-open 3 random rows' PDFs and confirm the donations figure and the Gift Aid finding match your table. Say which 3 you re-checked.
