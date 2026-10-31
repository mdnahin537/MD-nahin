# Brief — Payments check (Sonnet agent)
MODEL: sonnet | EFFORT: xhigh

## STEP 0 — THE BRIEF
1. **Role:** you are a careful fintech and regulation researcher who knows cross-border freelancer payments into Bangladesh.
2. **What I'm asking:** establish, with primary sources, how a two-person Bangladeshi service team can legally receive money from foreign B2B clients in October 2026. Focus on PayPal (the CEO heard Bangladesh legally allowed PayPal via a bank link in 2026), and check Payoneer and the other real options. Why: the "Pay" step decides which business opportunities are possible at all.
3. **Context:** what we know so far (search summaries only; confirm or correct each):
   - PayPal is not live for Bangladesh residents per a September 2026 guide (elevatepay.co).
   - A Bangladesh Bank circular dated 2026-07-29 set a framework for cross-border digital payment providers, with a "digital value account" (DVA) at an authorised dealer bank. A Daily Sun headline called it a "greenlight for launching PayPal, Payoneer".
   - The PM's office formed a committee on a PayPal launch, and in April 2026 the PM spoke of "practical steps".
   - Receiving PayPal payments through Payoneer is contested: nsave.com says yes; Elevate Pay says Payoneer rules exclude Bangladesh recipients for PayPal-funded requests.
   - Wise and Stripe are not available to Bangladesh residents.
   - The team has Payoneer. Clients may be in the US, UK, EU, Australia or the Gulf.
4. **Rules:**
   - Page fetch works now. Use WebSearch, then open primary pages (Bangladesh Bank circulars at bb.org.bd, PayPal's country list and help pages, Payoneer help pages, Daily Star, Prothom Alo, TBS, Financial Express BD).
   - Label every claim VERIFIED (primary or official page opened), SEARCH-SUMMARY, VENDOR CLAIM or ESTIMATE.
   - Never invent anything. Write NOT FOUND plus what you tried.
   - Quotes under 15 words.
   - Write the output to `research/notes/payments.md`. Don't run git.
   - Final message: ≤200 words summarising the answer.
5. **Tips:** check the exact date and text of the Bangladesh Bank circular; whether any bank has actually launched a PayPal-linked service; PayPal's own Bangladesh page; Payoneer's rules for receiving from a PayPal-paying client; Payoneer fees for a $100–300 invoice (card vs ACH); Upwork withdrawal to Bangladesh; and any rules on declaring service export income (e.g. foreign-currency retention or tax notes for freelancers).
6. **What not to do:** don't sign up for anything or contact anyone. Don't recommend workarounds that break a provider's terms (a foreign-registered account, a relative's account) or hide the team's location. List them only as "rejected: breaks terms or honesty rule".
7. **What to do (checklist):**
   - [ ] PayPal status in Bangladesh, October 2026 (with dates).
   - [ ] What the 2026-07-29 circular actually allows, and whether any bank has launched under it.
   - [ ] Can a Bangladeshi Payoneer user receive money from a client who wants to pay by PayPal? Exact rule and source.
   - [ ] A table of receiving routes: Payoneer (request/invoice; ACH/card), Upwork, direct SWIFT to a BD bank, Xoom (personal only?) and others. For each: legal OK?, fees on a $200 payment, time to arrive, buyer friction, risks.
   - [ ] Recommended Pay setup for a first $1–10 test and for $100–300 invoices.

## STEP 1 — WHY THIS MATTERS
A business that can't get paid isn't a business. A wrong "PayPal works" could have the team promise a client a payment method that fails, or push them into a terms-breaking workaround that freezes their money and breaks their honesty rule.

## STEP 2 — WHAT SUCCESS LOOKS LIKE
- Every checklist item answered, or marked NOT FOUND with what was tried.
- At least 3 claims VERIFIED from official or primary pages (Bangladesh Bank, PayPal, Payoneer).
- A clear one-line verdict: "PayPal: usable / not usable / usable only via X", with its date.

## STEP 3 — A WAY TO CHECK THE WORK
Re-open the 3 most important sources and confirm they say what you wrote. Search specifically for counter-evidence: Bangladeshi users reporting a frozen account or a failed receipt in 2026.
