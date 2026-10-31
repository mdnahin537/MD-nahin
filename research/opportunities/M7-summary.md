STATUS: FINAL

# M7 Platform-Native Seller — Phase 2 summary
Opus companion, 2026-10-29. Helper runs used: **3 of 5**, all Sonnet (details at the end). Buyer lists: 22 paying red-team programmes/roles in `M7-redteam-arena-ladder.md`; 22 organisations hiring Bengali AI-data contributors in `M7-bangla-ai-eval-contractor.md`.

## The central findings (read these first)
1. **"The platform carries Read, Trust and Pay" is true only for sellers who already have reviews or results.** With the R5 splits, a new seller's Read-noticed and Trust-competence are 1s on every open marketplace. The M7 grounds that work for a zero-track-record team are the ones where **the work is judged, not the seller**: arenas, bounties and vetted platforms.
2. **Open-marketplace automation work is shrinking per seller.** On Freelancer.com (public API, my counts) posts mentioning n8n fell from 134 (Nov 2025) to 29 (Oct 2026) a month, while median bids per post rose from 30.5 to 110. Upwork "fix my n8n workflow" posts in Oct 2026 are budgeted at $5–30 (search summaries of the posts). OpenClaw service demand peaked in April 2026 (22 posts) and fell to 3 a month by September.
3. **Assets are a free glut.** The n8n template library holds 13,826 templates and now adds ~1,000 a month (up from ~450 in early 2026); the paid share of new templates fell from 22% (Apr–May 2025) to 5–9% (2026). On Gumroad, 68 of the 72 most-reviewed n8n products are free. ClawHub has 67,000+ free skills. Sales go to creators with audiences.
4. **Two payment facts change the project's rules (both VERIFIED, pages opened):**
   - **Gumroad pays Bangladeshi sellers by bank deposit in BDT**, through Stripe KYC, and "does not support… Payoneer". CLAUDE.md's "Gumroad via Payoneer" is wrong.
   - **Stripe Connect payouts reach Bangladeshi banks** on Mercor ("Payouts use Stripe Connect"; Bangladesh listed with no Wise tag) and OpenTrain (Bangladesh on its payout list). payments.md's "Stripe unavailable" holds for merchant accounts only. **CLAUDE.md's hard rule "Stripe-dependent platforms are non-viable" needs a CEO re-decision.** I flagged it and did not override it.
5. **The live red-team window is now.** Gray Swan's IPI Black challenge ($300,000; Anthropic, Meta, Google DeepMind, Reflection AI) runs 15 Oct–5 Nov 2026, and its prize pools grew $40k (2024) → $171.8k (2025) → $300k (2026). BanglaSafe (arXiv, 2026-08-23) found 53.6% of 18 frontier models' answers to Bengali harm prompts unsafe or partly unsafe. Bangla is a measured weakness, not a hoped-for edge. And a paid rung is open to Bangladesh today: an OpenTrain-listed "AI Jailbreak & Prompt-Injection Security Expert" contract at $50–90/h (posted 2026-10-28; Bangladesh among 51 countries; Stripe → local bank). Mercor and OpenTrain both ran Bengali–English red-team roles at $20–22/h in mid-2026 (now closed). But arena supply grew from 631 to 15,000+ people, the best rung asks for prior jailbreak experience, and the prize payout rail is unknown.

## Ranked opportunities
| Rank | File | Chain score | Two-key | Weakest step |
|---|---|---|---|---|
| 1 | `M7-redteam-arena-ladder.md`: Gray Swan Arena (IPI Black, $300k, to 2026-11-05) + huntr + Mozilla 0DIN ($500–15,000) as a judged portfolio → paid red-team contracts open to Bangladesh (OpenTrain-listed jailbreak/prompt-injection role, $50–90/h, posted 2026-10-28; Bengali–English red-team roles at $20–22/h when re-posted) | **1 (Reply, H, E2)** | **3 of 3 → PASS** if the CEO lifts the Stripe rule (contract rung pays Stripe → Bangladeshi bank); 2 of 3 without it | Reply: tournament odds (161 winners of thousands) and a credential gate on the best rung; prize payout rail NOT FOUND |
| 2 | `M7-bangla-ai-eval-contractor.md`: individual Bengali/English AI-evaluation contracts on vetted platforms (Mercor, OpenTrain, micro1, Productive Playhouse, Sigma, TELUS…) | 1 (Reply, H, E1); Repeat 1 | 3 of 3 by formula (same Stripe condition) | **G3 fails**: income = hours × a falling rate (Mercor Bengali $13/h Sep → $10–11/h Oct 2026; TELUS $8–10/h; Productive Playhouse $8/h; Welo $3.50/h) |
| 3 | `M7-automation-rescue-catalog.md`: 48-hour fixed-price Make/n8n/Zapier fix as an Upwork Catalog project + 1–3 proposals/month | 1 (Reply, H, E3-backed) + **G5 failed** | 1 of 3 → **weak by design** at zero reviews | Reply (median 110 bids/post on Freelancer.com; $5–30 Upwork fix budgets) + G4 |
| 4 | `M7-template-install-funnel.md`: $29 templates/skills on Gumroad + free n8n-library/ClawHub listings → $150–300 installs | **0 (Read, soft, E3)** | 1 of 3 → **weak by design** | Read (one listing among thousands; no audience); G5 failed for paid assets |
**Tie-break #1 vs #2 (R3):** equal chain (1) and equal conditional two-key (3 of 3); equal count of steps at M + ≥E1 (8 each). #2 fails gate G3 (no cap breaker), so #1 ranks first by rule as well as by judgment.

## Which one I'd bet on, and why
**#1, the red-team ladder, as a $0 two-week test inside the live IPI Black window. #2 only as cash flow for one founder if the CEO lifts the Stripe rule. Don't spend evenings on #3 or #4.**
- #1 is the only M7 road where a zero-track-record team is judged purely on its work, the work is medium-high, prize money is growing on dated primary evidence ($40k → $171.8k → $300k), a Bangladesh-eligible paid rung exists today ($50–90/h, VERIFIED), and native Bangla is a measured model weakness (BanglaSafe 2026) with Bengali–English red-team roles posted twice in 2026.
- #2 passes two-key by formula, but it is a job with a falling wage: ≈ $550–900/month for all the team's hours.
- **What would kill #1:** two IPI Black waves with zero judged breaks in either the English or the Bangla arm; or the contract rung rejects applicants without a public track record.
- **What would kill #2 even as cash flow:** Stripe payout setup rejects a Bangladeshi bank, or no project hours within 30 days of a passed test.
- Keep the CEO's existing Gumroad products and one free Catalog listing as $0 passive doors.

## Upwork Connects: what $10–15/month changes
Only #3 uses Connects. $15 buys ~100 Connects (or Freelancer Plus at $14.99 with 100 Connects, SEARCH-SUMMARY) = 6–16 extra proposals at an assumed 6–16 Connects each (ESTIMATE) ≈ +0.5–1 win/month at 5–8%. Worth it only after the free test shows ≥ 1 reply in 5 proposals. #1, #2 and #4 cost no Connects.

## Payout routes for a Bangladesh-registered person (checked 2026-10-29)
| Platform | Route to Bangladesh | Label |
|---|---|---|
| Gumroad | Bank deposit in **BDT** via Stripe KYC; $100 minimum; no Payoneer/Wise | VERIFIED |
| Mercor | Stripe Connect to own-name bank; Bangladesh listed; standard payout free; first payout 7-day hold | VERIFIED (re-opened) |
| OpenTrain | Stripe-hosted payout to a local bank; Bangladesh listed | VERIFIED (re-opened) |
| micro1 | Deel (contractors); referral via an unnamed "payout partner"; Bangladesh NOT FOUND | VERIFIED method / country NOT FOUND |
| Outlier | PayPal, Airtm, ACH; official pages unreachable (502) | THIRD-PARTY |
| DataAnnotation, Prolific | PayPal only → closed | VERIFIED |
| HackerOne | Bank transfer (Currencycloud), PayPal, BTC/USDC; no Payoneer; Bangladesh not stated | VERIFIED methods |
| Mozilla 0DIN | Pays within 30 days of agreement; ID + W-8; excludes US-sanctioned countries; method not stated | VERIFIED terms |
| Gray Swan Arena | NOT FOUND (app blocks bots) → PARTNER CHECK | SEARCH-SUMMARY |
| Upwork | Escrow → BD bank ($0.99) or Payoneer | SEARCH-SUMMARY (payments.md) |
| n8n Expert Partner | Closed to Bangladesh: needs ≥3 n8n customers and work in UK/Ireland/N. Europe/N. America | VERIFIED (re-opened) |
| Clay partner directory | "Apply to become a partner"; criteria NOT FOUND; no South-Asian partner named on the page | E3 scan |

## Three most important verified facts
1. **Gumroad pays Bangladesh in BDT to a local bank (Stripe KYC), not via Payoneer**; Mercor and OpenTrain pay Bangladesh by Stripe Connect / Stripe-hosted payouts to a local bank (help and docs pages opened and re-opened 2026-10-29).
2. **Gray Swan IPI Black: $300,000, 15 Oct–5 Nov 2026**, after $40,000 (2024) and $171,800 to 161 winners (2025); community 631 → 15,000+ (Gray Swan pages). **OpenTrain-listed jailbreak/prompt-injection contract, $50–90/h, posted 2026-10-28, Bangladesh eligible** (job page opened).
3. **Open-marketplace automation work is shrinking per seller**: Freelancer.com n8n posts 134/month (Nov 2025) → 29/month (Oct 2026), median bids 30.5 → 110 (my API counts); n8n Expert Partner pilot is region-locked to UK/Ireland/N. Europe/N. America (page opened).

## Not verified
- **Prize payout rails:** Gray Swan (app blocks bots), 0DIN (method not stated) and huntr (FAQ not rendered). PARTNER CHECK in a browser.
- **A first-hand Stripe payout to a Bangladeshi bank** on Mercor or OpenTrain. The docs say yes; no person's report was found.
- **Whether Bangla-language attacks are accepted** by IPI Black's judges.
- **Upwork post volumes and proposal counts** (Upwork returns 403): PARTNER CHECK. Upwork Catalog rules and fees: search summaries only.
- **Make and Zapier partner criteria** (403/404). Clay's criteria.
- **The CEO's own Gumroad sales history.** Only he can export it.
- Crypto legality in Bangladesh (used only to exclude crypto payouts; ESTIMATE).

## Corrections to models.md and CLAUDE.md (for the manager; I edited neither)
- **CLAUDE.md, "Gumroad via Payoneer":** wrong. Gumroad does not pay to Payoneer; it pays Bangladeshi sellers in BDT to a local bank (VERIFIED).
- **CLAUDE.md, "Stripe-dependent platforms are non-viable":** needs a CEO re-decision. Stripe *payouts* reach Bangladeshi banks on Gumroad, Mercor and OpenTrain (VERIFIED docs). Only Stripe *merchant accounts* are unavailable. This is a hard constraint, so I flag it and do not override it.
- **models.md M7 "Read ✔ · Trust ✔ (after reviews) · Pay ✔":** for a new seller, Read-noticed and Trust-competence are 1s on open marketplaces. M7 passes two-key only on judged grounds (arenas, bounties, vetted platforms).
- **models.md M7 hunting ground 2, "ClawHub is free to list, so money comes from install and setup services":** the install wave peaked in April 2026 (Freelancer.com: 22 OpenClaw posts in Apr → 3 in Sep), and ClawHub has 67,000+ free skills. No evidence that buyers now pay for skill installs at volume.
- **models.md M7 hunting ground 3, "Payout to Bangladesh NOT FOUND":** still NOT FOUND for prizes, but the contract rung (OpenTrain) has a documented Bangladesh rail.
- **models.md M7 hunting ground 5, n8n Expert Partner:** closed to Bangladesh by its region rule (VERIFIED).

## New ideas outside M7 (one line each)
- **Bangla red-team panel, B2B:** sell verified native-Bangla adversarial testing to labs and safety vendors (BanglaSafe gap; Mercor/OpenTrain Bengali red-team roles in 2026). Bridge to M4's language panel.
- **Crowdtesting platforms** (uTest/Applause, Test IO, Testlio) pay testers per accepted bug; Payoneer reported by third parties. A results-judged rung for M2's QA desk.
- **Stripe-payout platforms re-opened:** if the CEO lifts the Stripe rule, M2/M3 should re-check platforms they dismissed for "Stripe" reasons.
- **Upwork's MCP connector (Q2 2026):** AI agents can now reach the marketplace; Catalog listings may need machine-readable scopes. Watch, don't build.
- **Results as identity:** a public, dated record of judged breaks (Arena profile, 0DIN leaderboard) is a Trust asset any model's letters can link to.

## Helper runs (3 of 5, one at a time)
1. **Sonnet, medium:** payout rails for 10 AI-data/bounty platforms → `research/handoffs/M7-helper-1-payouts.md`. I re-opened the Mercor and OpenTrain pages; both hold.
2. **Sonnet, high:** 35 red-team/safety programmes → `research/handoffs/M7-helper-2-redteam-buyers.md`. I re-opened 6 rows (Gray Swan ×2, 0DIN, the OpenTrain jailbreak role, Mercor's closed Bengali role, Anthropic's bounty); all hold.
3. **Sonnet, medium:** 25 organisations hiring Bengali AI-data contributors → `research/handoffs/M7-helper-3-bengali-buyers.md`. I re-opened Outlier's Bengali page and Invisible's Greenhouse record; both hold.
Nothing invented was found in the rows I checked. Where a helper used aggregators, the rows are labelled THIRD-PARTY.
