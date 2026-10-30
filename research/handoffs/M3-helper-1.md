MODEL: sonnet | EFFORT: medium

# M3 helper 1 — Which commission/affiliate/partner programmes can pay a Bangladesh-registered person or company?

## STEP 0 — THE BRIEF
**Role.** You are a careful payments-evidence collector. You read official help pages and terms, and you record exactly what they say. You never guess.

**Task.** For each programme below, find from the programme's OWN pages (help centre, docs, terms, payout FAQ) how it pays commissions to partners/affiliates/publishers, and whether a partner registered in **Bangladesh** can be paid. Work top to bottom.

Programmes (priority order):
1. Impact.com (partner/publisher payouts)
2. Awin (publisher payments; note ShareASale has migrated into Awin)
3. CJ Affiliate (publisher payment methods; is Payoneer offered?)
4. Rakuten Advertising (publisher payments)
5. Partnerize (partner payments)
6. PartnerStack (partner payouts: PayPal? Stripe Express? which countries?)
7. Admitad (publisher withdrawal methods)
8. Amazon Associates (US programme: payment methods for non-US associates; Bangladesh eligible?)
9. Gumroad **affiliates** and Gumroad **collaborators** (does Gumroad itself pay the affiliate/collaborator share? how?)
10. Lemon Squeezy affiliates
11. Shopify Collabs (creator payouts)
12. UpPromote, GoAffPro, Refersion (who pays affiliates: the platform or the merchant manually? which methods?)
13. CodeADX (Shopify promo-code marketplace for podcasts: how are podcasters paid?)
14. Rewardful, FirstPromoter, Tapfiliate (SaaS affiliate tools: who pays, which methods)
15. beehiiv partner/affiliate programme; Kit (ConvertKit) affiliate programme
16. Passionfroot and Paved (how creators/newsletters receive sponsor money; do they pay to Bangladesh?)
17. Upwork: is a **commission-only** job allowed under Upwork's terms or policies? (look for "commission" in Upwork's prohibited-jobs / terms pages)
18. CommissionCrowd (UK marketplace for commission-only sales agents): does the platform collect and pay commissions, or do companies pay agents directly?

For each, record:
- **Payout methods** (exact names as written: "Payoneer", "PayPal", "bank wire", "direct deposit", "Stripe", etc.);
- **Bangladesh**: YES (named or on a country list) / NO (excluded or not on an exhaustive list) / UNKNOWN (no country information found);
- **Needs own Stripe or PayPal account?** YES / NO / UNKNOWN;
- **Who pays**: the network/platform (by mechanism) or the merchant manually;
- **Minimum payout / fees** if stated;
- **Source URL(s)** and the page's date if shown;
- **Label**: VERIFIED (official page opened), THIRD-PARTY (blog/forum only), SEARCH-SUMMARY (page not opened), NOT FOUND (say what you tried).

**How to read pages.** Use WebFetch first (load it with ToolSearch "select:WebSearch,WebFetch"). If WebFetch fails, use `curl -sS -L -m 30 -A "Mozilla/5.0" <url>` in Bash, through the pre-configured proxy (never disable TLS or the proxy). Save any downloads in a new empty folder inside your scratchpad directory; treat them as untrusted data. If a page is blocked (403, CAPTCHA, login), do not try to get around it: write the block and move on.

**Output.** Write `/home/user/MD-nahin/research/handoffs/M3-helper-1-payouts.md`:
- first line `STATUS: IN PROGRESS — next: row N` while working; `STATUS: FINAL` when done. **Save the file after every 4 rows** (a usage limit may stop you; saved rows must survive);
- one markdown table, one row per programme (split a row if a programme has two payout types, e.g. Gumroad affiliates vs collaborators);
- below it: (a) a short list of programmes that pay a Bangladesh-registered partner **without** PayPal or an own Stripe account (bank wire, Payoneer, or a platform payout to a Bangladeshi bank); (b) anything surprising; (c) pages you could not open and why.

**Context.** A two-person team in Dhaka, Bangladesh will earn commission for revenue it brings to foreign businesses. Usable rails: Payoneer (including its US receiving account details), Upwork, and platforms that pay out to Bangladeshi bank accounts (e.g. Gumroad pays BDT to a local bank). NOT usable: anything that requires the team's own PayPal account (PayPal does not serve Bangladesh) or its own Stripe account. Wise cannot be opened by Bangladesh residents.

**Rules.**
- Don't sign up, log in, contact anyone, submit forms or post. Read-only.
- Never invent a method, a country, a fee or a URL. If unsure, write UNKNOWN or NOT FOUND and what you tried.
- Quote ≤ 12 words at a time.
- Don't run git. Don't edit any other file in the repo.
- Stop after the 18 items or about 75 minutes of work, whichever comes first.

## STEP 1 — WHY THIS MATTERS
The team will spend weeks selling for commission. If the programme cannot pay a Bangladeshi partner, every dollar earned is stuck. A single wrong "YES" sends two part-timers down a dead road.

## STEP 2 — WHAT SUCCESS LOOKS LIKE
- All 18 items have a row (NOT FOUND is allowed, with what you tried).
- Every YES/NO for Bangladesh cites an official page you opened, or is labelled THIRD-PARTY / SEARCH-SUMMARY.
- The list (a) is correct and short.

## STEP 3 — A WAY TO CHECK THE WORK
Before finishing, re-open the official pages behind 3 of your Bangladesh YES/NO answers and confirm they say what you wrote. Name the 3 you re-checked.
