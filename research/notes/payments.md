# Payments check: how a 2-person Bangladeshi team can receive foreign B2B money (October 2026)

Researched 2026-10-29. Brief: `research/briefs/payments-check.md`. No sign-ups, no contact with anyone, no git.

## One-line verdict

**PayPal: NOT USABLE for a Bangladesh-registered team as of 2026-10-29. No bank has launched a PayPal-linked service, and Payoneer's own rules block PayPal-funded payments to Bangladesh-registered accounts.**
**Usable now: Payoneer (request-a-payment by ACH or card, or a USD receiving account), Upwork withdrawal, and direct SWIFT to a Bangladeshi bank.**

## Label legend

- **VERIFIED** = an official or primary page (PayPal, Payoneer, Stripe, Wise) opened and read by me on 2026-10-29.
- **PRESS** = a news article I opened and read. It is not the circular itself, so I do not count it as VERIFIED.
- **SEARCH-SUMMARY** = only a search-result summary; the page itself was not opened.
- **VENDOR CLAIM** = a company with something to sell (Elevate Pay, nsave, Payoneer marketing).
- **ESTIMATE** = my arithmetic or a third-party figure.
- **NOT FOUND** = I looked and could not confirm it; what I tried is stated.

## Answers to the checklist

### 1. PayPal status in Bangladesh, October 2026

| Claim | Label | Source and date |
|---|---|---|
| Bangladesh is absent from PayPal's own country list. The Asia block lists Bhutan, India, Maldives, Nepal and Sri Lanka, with no Bangladesh anywhere on the page. | VERIFIED | `paypal.com/bd/webapps/mpp/country-worldwide`, opened twice on 2026-10-29 |
| Bangladesh does not appear on PayPal's developer "Countries and supported features" page (0 matches). | VERIFIED, weak: absence only | `developer.paypal.com/docs/payouts/standard/reference/country-feature/`, 2026-10-29 |
| A `/bd/` URL on paypal.com exists (`/bd/home`), but it is generic US content (US credit offers, Synchrony). It is not evidence of availability. | VERIFIED | `paypal.com/bd/home`, 2026-10-29 |
| On 23 Aug 2026, central-bank sources said PayPal "is reviewing its policies". One bank executive said they were "only exploring the scope". Another said the circular "only creates the regulatory opportunity". No launch date. | PRESS | TBS, 23 Aug 2026, "PayPal in Bangladesh: How close is the long-awaited entry?" Opened and re-opened. |
| One industry voice (the CEO of bdjobs.com) said PayPal has "moved forward with at least one or two banks". This is a single unnamed-bank claim and I found nothing to back it. | PRESS, single insider claim, UNCONFIRMED | Same TBS article |
| On 9 Sep 2026, PayPal's country list still omitted Bangladesh. | VENDOR CLAIM (Elevate Pay sells a competing product) | `elevatepay.co/blog/is-paypal-available-in-bangladesh`. My own check today agrees. |
| No report of any bank launching a DVA, or signing with PayPal or Payoneer, after 29 Jul 2026. | NOT FOUND. Tried: 5 searches (English and Bangla), TBS PayPal tag page (latest item is the 23 Aug piece), Daily Star and Financial Express coverage. | Absence of evidence, not proof. Check TBS and Daily Star again before relying on it. |
| A bdnews24 page dated "October 19, 2026" about a PayPal/Xoom rollout is a 2017 article with a wrong date header. | VERIFIED by manager 2026-10-29 15:26Z: page metadata datePublished 2017-10-19T12:02:23Z, updated 2022-10-19; "October 29, 2026" on the page is the site header showing today's date. Payoneer help a_id 12280 re-opened the same minute: Bangladesh still listed as unable to receive payments from payers via PayPal. | The October 19 date is the 2017 Xoom launch (Prothom Alo, Daily Star, Dhaka Tribune headlines). |

### 2. What the 29 Jul 2026 circular allows, and has any bank launched under it?

**Date and issuer.** Issued Wednesday 29 July 2026 by the Foreign Exchange Policy Department of Bangladesh Bank.
- PRESS: Prothom Alo (29 Jul, 16:40), TBS (29 Jul), Daily Star (30 Jul: "issued yesterday").
- Elevate Pay calls it "FEPD-1 Circular 25". That is a VENDOR CLAIM and I could not check the number.

**I could not open the circular itself.** `bb.org.bd` showed a CAPTCHA page ("what code is in the image?") for its circular index. Direct PDF URLs returned the same HTML challenge instead of a PDF. I did not try to get past the CAPTCHA. So everything below about its contents is PRESS, not VERIFIED.

**What the press agree on (PRESS):**
- Authorised-dealer banks may partner with foreign payment platforms, wallets and gateways, called "cross-border digital payment service providers" (CDPSPs).
- Banks may open Digital Value Accounts (DVAs). These are wallets in the customer's name, each tied to a bank-controlled Master DVA or settlement account. The bank must monitor in real time and keep a parallel ledger.
- Before launch, a bank must get prior acknowledgement from the Foreign Exchange Policy Department. It must submit its partnership, technology, cybersecurity and compliance details.
- Funding is available against ERQ and RFCD balances.

**What DVAs are for, mostly spending abroad (PRESS):**
- Travel quotas (private, medical, official), membership fees, IT-related fees, visa fees and hotel bookings.
- Online payments of "up to US$300 per transaction" (Prothom Alo, TBS, Financial Express).

**Where the press disagree: inward or outward.**
- Daily Star and The New Nation describe it as for **outward** remittances.
- TBS and Financial Express say **inward and outward**.
- Prothom Alo says freelancers "will be able to repatriate" earnings more easily.
- TBS (23 Aug) says a wallet "could potentially" send and receive freelance earnings.

**What this means for the CEO's belief.** "Bangladesh legally allowed PayPal via a bank link" is **only half right**. The central bank built a framework that banks can use with a foreign provider. It is not a PayPal licence. PayPal has not signed and has not launched, so there is nothing to use. The DVA uses described in the press are mostly outward spending, not receiving client invoices.

**Has any bank launched?** NOT FOUND, as in section 1.

**Related rule change, 22 Jul 2026 (PRESS: Prothom Alo and Financial Express, both opened; BSS and Dhaka Tribune were blocked).** A separate circular, "FEPD-1 Circular No. 22" per a search hit, eased rules for freelancers and individual service exporters:
- Electronic evidence (platform statements, emails) is accepted as proof of foreign income.
- Inward remittances up to US$20,000 can be credited without a formal declaration.
- Payments through online payment gateway service providers (OPGSPs) are allowed up to US$10,000 per transaction.
- ICT freelancers may retain up to 50% of export earnings in foreign currency (ERQ). Other service exporters may retain up to 30%.
- Dual-currency "Freelancer Cards" are allowed.
- A search hit says a consolidated directive (Circular No. 26, 30 Jul 2026) followed. I could not verify it.

**Gap: a registered company.** These easings are written for "freelancers and individual service exporters". I found nothing on what applies if the two-person team operates through a registered company or trade licence. NOT FOUND (a search for company-level export rules turned up nothing). Ask a Bangladeshi bank or accountant.

### 3. Can a Bangladeshi Payoneer user receive money from a client who wants to pay by PayPal?

**No. VERIFIED.** Payoneer's own help page "Request a payment - Information for Receivers" (`payoneer.custhelp.com/app/answers/detail/a_id/12280/`, opened twice on 2026-10-29) says:
- The heading is "Can I receive payments from payers via PayPal?" and the answer is a list of countries where an account registered there cannot.
- The list names **Bangladesh**, with Afghanistan, Burma, China, Pakistan, Russia, Switzerland and others.
- The same page's payment-method table shows PayPal as available only to "Individuals/ companies in the United States". The fee is up to 3.99% + 0.49 USD, with 2 calendar days to arrive.

The rule keys on the country where the **Payoneer account is registered**. Changing that to get around it is a terms break (see "Rejected").

**Reconciling the contested claims:**
- nsave (28 Apr 2026) says "eligible Bangladeshi freelancers" can receive PayPal through Payoneer. That is a VENDOR CLAIM and it contradicts Payoneer's own page for Bangladesh-registered accounts. The word "eligible" is doing the work: Bangladesh is not eligible.
- Elevate Pay (9 Sep 2026) says Bangladesh-registered recipients are excluded. That is a VENDOR CLAIM and Payoneer's own page confirms it.
- Payoneer's marketing guide "PayPal and Payoneer" (last modified 26 Aug 2026) says PayPal works "where eligible" and that "availability depends on account eligibility and location". It does not list countries and does not contradict the help page.

### 4. Receiving routes for foreign B2B clients, $200 invoice

Fees are on $200. Payoneer's published rates are VERIFIED. My arithmetic and third-party figures are ESTIMATE.

| Route | Legal OK in Bangladesh? | Fee on $200 | Time to arrive | Buyer friction | Risks |
|---|---|---|---|---|---|
| **Payoneer request-a-payment, US client pays by ACH debit** | Yes: Payoneer already operates in Bangladesh (TBS 29 Jul, PRESS). Withdrawal to a BD bank or bKash is a normal use. | **1% = $2.00** (VERIFIED, rate). Payer can choose who pays the fee. | ACH: "5 business days" (VERIFIED, Payoneer's estimate). Limit $20,000 per transaction. | **US payers only.** The client must link a bank account. Low for US B2B. | Holds or reviews on first payments. Annual fee, see below. Withdrawal cost on top. |
| **Payoneer request-a-payment, client pays by card** (any country: UK, EU, Australia, Gulf) | Yes, as above. | **Up to 3.99%, plus a 0.49 USD fixed fee in certain countries** = up to $7.98 (or $8.47). (VERIFIED, rate; arithmetic mine.) | "2 calendar days" (VERIFIED, Payoneer's estimate). | Low for the payer, but some corporate buyers dislike paying by card. | Highest fee. Ask the client to bear it, or price it in. |
| **Payoneer request-a-payment, local bank transfer** (companies in US, EU or UK) and **UK direct bank transfer (GBP)** | Yes. | Local bank transfer: "up to 1%", minimum fee may apply (about $2 or less). UK direct bank transfer: Free. (VERIFIED, rate.) | 1 to 3 business days (VERIFIED, Payoneer's estimate). | Medium: the payer pays "at your bank (online or in person)". | The "up to 1%" depends on eligibility. |
| **Payoneer-to-Payoneer balance** (client also holds Payoneer) | Yes. | Free (VERIFIED; the table marks this method "subject to availability"). | About 2 hours (VERIFIED, Payoneer's estimate). | Only works if the client has Payoneer. | Same account risks. |
| **Payoneer USD receiving account** (client sends ACH or wire to Payoneer-issued US details) | Yes: a Bangladesh row exists in Payoneer's fee table (VERIFIED). | USD: 1.00%, minimum $1.00 = **$2.00** (VERIFIED, rate). The table shows an effective date of 15/06/2022, so it may be stale. | NOT FOUND (not stated on the page I opened). | Low: the client sends an ordinary US bank transfer. | Same account risks. |
| **Payoneer withdrawal to a BD bank, bKash or ATM** (applies to every Payoneer route above) | Yes. Payoneer's Bangladesh page lists "local bank account", "bKash" and "ATM" (VENDOR CLAIM, Payoneer's own marketing). | **NOT FOUND officially.** Payoneer says the fee is "displayed to you prior to completing a withdrawal" and that conversion cost is built into the rate. Third parties say about 2% (nsave) or a 1.2% to 4% band (Elevate): ESTIMATE, **about $2.40 to $8.00 on $200**. | "As little as 1 working day" to a Bangladesh bank (Payoneer marketing, VENDOR CLAIM). bKash minimum is BDT 1,000 (SEARCH-SUMMARY). | n/a (seller side) | The withdrawal bank account must be in the Payoneer account holder's name (VERIFIED, Payoneer help). |
| **Payoneer annual account fee** | n/a | **$29.95 per year if the account receives under $6,000 in 12 months.** VERIFIED for Bangladesh, effective 23/02/2026 (`payoneer.custhelp.com/.../a_id/43738/`). | n/a | n/a | At low volume this exceeds per-invoice fees. At $2,400 a year it is about 1.25%. |
| **Upwork, withdraw to local bank (BDT)** | Yes. Upwork's help center lists Bangladesh (SEARCH-SUMMARY of Upwork's own pages; `support.upwork.com` blocked my curl, so I did not open it). | Upwork: **$0.99** per withdrawal, BD limits $5 to $10,000 (SEARCH-SUMMARY of Upwork help). Add an FX markup of about 1 to 2% (ESTIMATE, Elevate). About $3 to $5 in total on $200, **excluding Upwork's own 0 to 15% service fee** (VENDOR CLAIM, not checked). | About 4 business days (VENDOR CLAIM, nsave and Elevate). | Zero for Upwork-sourced clients. **Only works for clients on Upwork.** | Taking an Upwork client off-platform to pay breaks Upwork's terms. Do not do it. |
| **Upwork, withdraw to Payoneer** | Yes. | Upwork-side fee: conflicting (Elevate says "about $2.00", nsave says free), plus Payoneer's withdrawal fee. | 1 to 3 days (VENDOR CLAIM). | As above. | As above. |
| **Upwork, wire** | Yes. | $50 (SEARCH-SUMMARY of Upwork help, plus intermediary and BD bank fees). | 3 to 7 days (VENDOR CLAIM). | As above. | Poor value at $200. |
| **Upwork, Direct to U.S. Bank** | Needs a US bank account that accepts ACH. | $2.99 for non-US tax addresses since 1 Sep 2026 (SEARCH-SUMMARY of Upwork help). | 2 to 5 days (VENDOR CLAIM). | As above. | **Outside this project's payout rule** (see "Flags"). |
| **Direct SWIFT/wire to a BD bank account** | Yes in principle: service-export proceeds come in through banks. The 22 Jul 2026 circular eases documentation for freelancers and individual service exporters, up to $20,000 inward with no formal declaration (PRESS). **Company-level rules: NOT FOUND.** | Sender bank fee, typically up to $50 (Payoneer's own marketing page says "as much as $50": VENDOR CLAIM). Add intermediary-bank deductions and BD bank charges. Payoneer's page quotes DBBL at Tk 100 to 500 per foreign transaction (VENDOR CLAIM). Overall about $25 to $75 on $200 (ESTIMATE). The bank sets the exchange rate. | "Many days" (Payoneer marketing); Upwork's wire page says 3 to 7 days (VENDOR CLAIM). | Every finance department knows wires. They need your SWIFT code and account number. | Fees are fixed per wire, so small invoices lose a lot. The BD bank may ask for the invoice or contract. Intermediary fees are unpredictable. |
| **Wise (client sends USD to a BD bank account)** | Wise's own page says you can "receive to local bank accounts" in Bangladesh with no Wise account (VERIFIED, `wise.com/gb/send-money/send-money-to-bangladesh`). | Paid by the sender. I found no fee figure in the Wise page text I extracted (it uses a live calculator). Payoneer quotes 0.7% to 1.87% (VENDOR CLAIM, a competitor). | Real-time to 1 business day (VENDOR CLAIM). | **Wise Bangladesh may be personal-only.** Payoneer's page says "You can't use Wise to send business or commercial payments to Bangladesh" (VENDOR CLAIM, competitor). Not confirmed from Wise. | Business-use restriction unconfirmed. Do not promise it to a client. |
| **Xoom (PayPal's remittance service)** | **No for client invoices.** Xoom is for personal remittances. Search results say its terms bar commercial use (SEARCH-SUMMARY of Dhaka Tribune and Daily Star). | n/a | n/a | n/a | Rejected: breaks terms. |
| **PayPal** | Not available (sections 1 and 3). | n/a | n/a | n/a | Do not promise PayPal to any client. |
| **Stripe** | Not available. Bangladesh is absent from Stripe's country list (VERIFIED, `stripe.com/global`, 2026-10-29). A client's own Stripe checkout does not give you a merchant account. | n/a | n/a | n/a | n/a |
| **US-ACH accounts from Elevate Pay or nsave** | Not assessed. Their regulatory standing and their terms are unchecked. | Elevate says $0 incoming ACH, $1.50 per transfer to Bangladesh (VENDOR CLAIM). | Elevate says 24 to 48 hours to a bank (VENDOR CLAIM). | Low: the client sends a US ACH. | **Halal flag:** nsave advertises "3.2% annual rewards on USD holdings" (VENDOR CLAIM), which may be interest. Both companies are competitors writing about Payoneer. Needs a separate CEO decision. |

### 5. Recommended Pay setup

**First test of $1 to $10.**
- A $1 to $10 test through Payoneer's Request a Payment is **probably not possible**. The page says "the minimum amount can vary between 20-50 USD / EUR / GBP". It is not explicit that this means the request minimum (ESTIMATE). Plan the smallest test at **$20 to $50**.
- The test must be a **genuine commercial payment** from a third party for a real deliverable. Payoneer lists "Self-loading", "Topping up your Payoneer card" and "Gifts from family and friends" as not allowed (VERIFIED, same help page). Do not pay yourself and do not ask a relative to "send" money.
- Steps: send a Payoneer payment request to a real small client with an attached invoice. Have them pay by card, or by ACH if they are US-based. Watch the fee shown, the time to credit, and any hold or review. Then withdraw to the BD bank and **record the fee and the FX rate shown before confirming**, since the Bangladesh withdrawal fee is not public.
- Success is: money credited, withdrawal fee known, taka in the bank, and no review or hold.

**$100 to $300 invoices.**
1. **US clients: Payoneer request-a-payment with ACH debit.** The fee is 1% (about $1 to $3). Allow 5 business days.
2. **UK, EU, Australian and Gulf clients: Payoneer request-a-payment.**
   - Card is the universal option, up to 3.99% (about $4 to $12 on $100 to $300). Quote the price so the client covers it, or build it in.
   - UK clients: the free GBP direct bank transfer.
   - EU or UK companies: the local bank transfer, up to 1%.
3. **Wire to a BD bank only for large invoices** (about $1,000 and up). A fixed $25 to $75 is too heavy on $100 to $300.
4. **Never promise PayPal, Wise or Stripe.** State in every proposal: "Payment via Payoneer request or bank transfer."
5. **Budget a $29.95 annual Payoneer fee** unless the account receives $6,000 or more in 12 months.
6. **Keep a per-payment file** (invoice, contract, platform or email evidence). The 22 Jul 2026 circular accepts electronic evidence as proof of foreign income (PRESS). Registered company: confirm with the bank first (see section 2 gap).
7. **Use the Payoneer account in the real holder's name and country**, with the BD bank account in the same name.

**Tax (not a Pay-step blocker, but a declaration question).** SEARCH-SUMMARY and PRESS only; the Finance Act text was not accessible (PwC PDFs returned 403).
- NBR said on 4 Jun 2026 there is "no provision" for tax deduction on freelancers' or expatriate income (Dhaka Tribune, SEARCH-SUMMARY).
- The Finance Minister said on 22 Jun 2026 that the FY2026-27 budget lets freelancers remit up to $5,000 "without paperwork" and extends tax exemptions (UNB, PRESS, opened). This differs from the 22 Jul BB circular's $20,000 threshold. They are different instruments and I could not reconcile them.
- A June 2026 Dhaka Tribune op-ed claims a 1% withholding at inward remittance. That is opinion, it contradicts NBR, and I could not confirm it.
- Form-C declaration above $20,000 ($10,000 for ICT) is claimed by a US vendor blog. NOT FOUND from a Bangladesh Bank source.
- Practical note: income still needs to be declared, and an e-TIN is commonly cited (nsave guide, VENDOR CLAIM). **Ask a Bangladeshi accountant.** I have not verified any of this.

## Corrections to "what we know so far"

| Item in the brief | Finding |
|---|---|
| PayPal not live per the Sept 2026 elevatepay.co guide | **Confirmed**, and by PayPal's own country list (VERIFIED, today). Elevate Pay is a competing vendor, so I did not rely on it. |
| Circular dated 2026-07-29 with DVA at an authorised dealer bank | **Date confirmed** (PRESS, three outlets). **The circular itself was not opened** (CAPTCHA). Correction: it is a framework for banks and a provider. It is **not** a PayPal licence. The DVA uses described are mostly outward spending. |
| Daily Sun headline "greenlight for launching PayPal, Payoneer" | **Headline seen only in search results; page blocked.** The body coverage I did read (Prothom Alo, TBS, Daily Star) names PayPal and Payoneer only as examples of "cross-border digital payment service providers". |
| PM's office formed a committee; April 2026 PM spoke of "practical steps" | **Corrected wording.** TBS 15 Apr 2026: PM Tarique Rahman told Parliament "effective steps" were taken. A committee was formed per a PM's Office gazette of 2 March, chaired by Rehan Asif Asad (adviser, Posts/Telecom/IT). On 24 Jun 2026 the ICT minister said "efforts are continuing". |
| Receiving PayPal via Payoneer is contested | **Resolved: No for Bangladesh-registered accounts.** Payoneer's own help page lists Bangladesh as excluded (VERIFIED). nsave's claim is wrong for Bangladesh. |
| Wise and Stripe not available to Bangladesh residents | **Stripe confirmed** (absent from the official country list, VERIFIED). **Wise: partly.** Wise's own page confirms **sending to** BD bank accounts. That residents cannot get a Wise USD account is a VENDOR CLAIM (Elevate, nsave), not confirmed from Wise. |
| The team has Payoneer | Fine, but note the **$29.95 annual fee**, the **no-PayPal rule for Bangladesh accounts**, and the **withdrawal fee shown only in the account**. |

## Counter-evidence search (frozen accounts or failed receipts, 2026)

- **No Bangladesh-specific report found** of a Payoneer or PayPal freeze or failed receipt in Sep or Oct 2026. Tried 3 English and 1 Bangla search, Trustpilot and G2 snippets, and the Fiverr community.
- General 2026 Payoneer complaints exist but none say Bangladeshi (SEARCH-SUMMARY, anecdotal): a $1,525.22 payment held for "internal review" in April 2026, and a $612 balance frozen from 16 April 2026.
- A Bangladeshi Fiverr user said their Payoneer account was blocked (undated, SEARCH-SUMMARY).
- Treat **first payments on a new account as the highest hold risk**: have KYC documents ready, and match names and country across Payoneer, the bank and the invoices.

## Rejected: breaks terms or honesty rule

These are listed only so they are not proposed again.
- Buying or borrowing a foreign-registered PayPal account, or using a PayPal account under a foreign address. **Rejected: breaks terms or honesty rule.**
- Registering Payoneer in another country to get past the PayPal exclusion. **Rejected: breaks terms or honesty rule.**
- Using a relative's or friend's Payoneer or bank account to receive the team's income. **Rejected: breaks terms or honesty rule.**
- Hiding the team's location from clients or providers (VPN, false address). **Rejected: breaks terms or honesty rule.**
- Using Xoom for client invoices. **Rejected: breaks terms.**
- Self-paying or "gift" test payments to Payoneer. **Rejected: breaks Payoneer's rules.**
- Moving an Upwork client off-platform to pay. **Rejected: breaks Upwork's terms.**

## Flags for the CEO

1. **Project payout rule.** The repo's `CLAUDE.md` limits payouts to Gumroad and Payoneer. Everything recommended above sits inside that, except the Upwork bank routes and the vendor US-ACH accounts, which need an explicit decision.
2. **Halal check.** nsave advertises "annual rewards" on USD balances, which may amount to interest. A conventional Bangladeshi bank account usually pays interest too. If that matters, ask about an Islamic-bank current account. I have not checked any bank.
3. **Do not tell clients "PayPal is coming".** There is no date and no bank partner announced. Treat PayPal as an upside, not a plan.

## Access limits (what failed, and what I did not do)

- `WebFetch` failed on DNS (`getaddrinfo ENOTFOUND`) for paypal.com, prothomalo.com and dhakatribune.com. The brief allows curl, which reached these sites through the pre-configured proxy.
- **Blocked by Cloudflare or login, not bypassed:** Dhaka Tribune, Daily Sun, Jagonews24, Ittefaq, New Age, BSS, `support.upwork.com` (all 403), PwC Bangladesh PDFs (403), `payoneer.custhelp.com` pricing page a_id 44821 (401).
- **`bb.org.bd`:** CAPTCHA on the circular index and on direct circular PDFs. I did not try to defeat it. The circulars' own text is NOT FOUND. **The CEO or someone with a browser should open the two circulars and confirm the DVA text: allowed users, inward vs outward, and the $300 cap.**

## Sources opened (2026-10-29)

Official or primary:
- PayPal country list: https://www.paypal.com/bd/webapps/mpp/country-worldwide
- PayPal developer payouts country features: https://developer.paypal.com/docs/payouts/standard/reference/country-feature/
- Payoneer, Request a payment (receivers FAQ and method table): https://payoneer.custhelp.com/app/answers/detail/a_id/12280/
- Payoneer, annual account fee: https://payoneer.custhelp.com/app/answers/detail/a_id/43738/
- Payoneer, receiving-account fees table: https://payoneer.custhelp.com/app/answers/detail/a_id/38762
- Payoneer, withdraw to bank FAQ and per-transfer fee page: https://payoneer.custhelp.com/app/answers/detail/a_id/18605/ and https://payoneer.custhelp.com/app/answers/detail/a_id/33946/
- Payoneer, PayPal and Payoneer guide (marketing, 26 Aug 2026): https://pages.payoneer.com/receivers
- Payoneer, Bangladesh contractors page (marketing): https://www.payoneer.com/resources/business/pay-your-contractors-and-remote-employees-in-bangladesh/
- Stripe country list: https://stripe.com/global
- Wise, send to Bangladesh: https://wise.com/gb/send-money/send-money-to-bangladesh

Press (opened):
- Prothom Alo, 29 Jul 2026: https://en.prothomalo.com/business/local/lxga62dv91
- TBS, 29 Jul 2026: https://www.tbsnews.net/economy/bangladesh-bank-paves-way-paypal-payoneer-style-cross-border-payment-services-1501241
- Daily Star, 30 Jul 2026: https://www.thedailystar.net/business/economy/news/banks-can-now-tie-payment-platforms-paypal-4235756
- Financial Express, 30 Jul 2026: https://thefinancialexpress.com.bd/trade/bb-opens-door-to-global-payment-platforms
- The New Nation, 30 Jul 2026: https://dailynewnation.com/news/845978
- TBS, 23 Aug 2026: https://www.tbsnews.net/economy/banking/paypal-bangladesh-how-close-long-awaited-entry-1522191
- TBS, 15 Apr 2026 (PM and committee): https://www.tbsnews.net/node/1411786
- TBS, 24 Jun 2026 (ICT minister): https://www.tbsnews.net/bangladesh/efforts-continue-introduce-paypal-other-payment-services-freelancers-minister-1471251
- Prothom Alo, 22 Jul 2026 (freelancer FX rules): https://en.prothomalo.com/business/kxdj36rq19
- Financial Express, 22 Jul 2026: https://thefinancialexpress.com.bd/bangladesh/bb-streamlines-foreign-exchange-rules-to-facilitate-freelancers
- UNB, 22 Jun 2026 (budget): https://unb.com.bd/category/Bangladesh/budget-allows-freelancers-content-creators-to-remit-5000-without-paperwork-minister/188852

Vendor (opened, discounted):
- Elevate Pay, 10 Sep 2026: https://www.elevatepay.co/blog/is-paypal-available-in-bangladesh
- Elevate Pay, Upwork fees: https://www.elevatepay.co/blog/upwork-fees-bangladesh
- nsave, 28 Apr 2026: https://www.nsave.com/bangladesh/paypal
- nsave, Upwork: https://nsave.com/bangladesh/upwork
