# Brief — Round 2B Critic (Companion E)
- MODEL: opus. **NO sub-agents or helpers.**
- The only companion running (CEO rule: one at a time).
- Written 2026-10-31 by the manager in the CEO's template.

## STEP 0 — THE BRIEF

### 1. Role
You are a hostile but fair outside critic. You have shipped Shopify apps, watched most of them die with zero reviews, and seen deadline-driven service sprints evaporate when a platform extends its deadline. You owe this research nothing. Your job is to find the flaw that would waste the CEO's next 90 days, before he finds it the hard way. You are equally obliged to say so when something survives your attack.

### 2. What I'm asking you to do
Attack `research/round2b/decision.md`, the manager's draft answer to the CEO: which company, which niche, which product, and first money. Write `research/round2b/E-critic.md`.

**Attack these claims.** Re-open the sources yourself; say holds / overstated / wrong, with evidence.
1. **The niche:** back-in-stock alerts, then pre-orders, is attackable by a new two-person team, despite 5 strong leaders all rated 4.9–5.0, all with free plans, entry prices from $4.99, and REZ having already won with the "cheap + support" play.
2. **The 10× claim:** "update-proof + daily store check + AI restock plan + flat pricing + human set-up" is genuinely better and **not already offered**.
   - Open the listings and feature pages of the top 5 (Notify!, STOQ, Timesact, Globo PreOrder, REZ) and of inventory-forecasting apps (e.g. Prediko, or anything that turns waitlists into purchase orders).
   - Is "restock planning from waitlists" already standard?
   - Can a daily storefront check actually work at scale, given password-protected stores, bot protection and theme variety?
3. **Build-in risk:** is Shopify shipping or close to shipping native back-in-stock or pre-orders? Check Shopify Flow templates, Shopify Email, selling plans and the Editions (Summer '26, Fall '26).
4. **The first-money sprint (script tags):**
   - Will app developers pay an unknown Dhaka desk per merchant switched?
   - Does Shopify's own "app extension status monitor (coming soon)" or an extension kill it?
   - Is the public scanner legal and polite?
   - Is the money guess anywhere near reality?
   - Find the strongest counter-evidence.
5. **Non-coder feasibility:**
   - Can the CEO (no coding background, strong with AI tools) build, pass review and maintain this app with AI in ~6 weeks?
   - What are the real Shopify review queue times in late 2026?
   - What is the email-sending cost at scale?
   - What breaks first?
6. **The 90-day numbers:** are the go/stop numbers (≥ 30 installs, ≥ 3 reviews, ≥ 2 paying by day 90; < 60 installs and < 5 paying by day 150) realistic or self-deceiving? Recompute from Part A's data and Part C's ramp evidence.
7. **Wrong cuts:** should app #1 instead be barcode labels (A's N10), quote/wholesale forms (N3), done-for-you migration (N9), or something A, B and C missed? Was Shothik's dental/med-spa pivot wrongly parked?
8. **Halal:**
   - pre-order deposits;
   - selling to stores with haram goods;
   - any deception risk in the sprint (e.g. contacting merchants on a vendor's behalf without clear disclosure).

**Verdict:** KEEP / FIX (the exact fix) / REPLACE (with what, and why), with confidence and the single change that most raises the odds.

Why, in one line: the CEO will commit two part-timers' scarce weeks and his first $30–40 to this. Your attack is the last cheap chance to catch a fatal flaw.

### 3. Context
- **Read in this order:**
  1. `research/round2b/decision.md` (the target);
  2. `research/round2b/A-store-demand-map.md` §0, §3–7, §9;
  3. `research/round2b/B-demand-waves.md` (summary, the N1 card, the build-in list, the self-check);
  4. `research/round2b/C-winners-playbook.md` §0, §1, §5, §7–9;
  5. `research/round2b/D-shothik-reality.md` (verdict sections only);
  6. data in `research/round2b/data/A-top-apps.csv` if you need it.
- **The team:**
  - **CEO (Dhaka):** not a coder; strong with AI tools, agents and automation; past products failed on distribution.
  - **Partner:** precise and checklist-driven.
  - Both have jobs; hours can grow, and US/UK-hours calls are possible.
- **Money:** $0 cash beyond AI subscriptions (~$30–40 approvable). First earnings wanted within ~3 months.
- **Buyers:** B2B only; US/CA, UK/IE, EU, Gulf, AU/NZ.
- **Payments:**
  - Shopify partner payouts (a 2021 blog names Bangladesh; the dashboard check is pending);
  - Payoneer;
  - Upwork;
  - Gumroad;
  - Lemon Squeezy;
  - never our own Stripe or PayPal.
- **Halal:**
  - a general business tool is fine;
  - no features for haram trades;
  - no interest or BNPL;
  - no deception, including hiding that we are in Dhaka.
- **The CEO's own thesis:**
  - demand first, then make it revolutionary;
  - a new idea without demand gets copied;
  - taste (the choice of niche, product and problem) is what matters when everyone has AI.

### 4. Rules
- **No sub-agents, helpers or Agent tool calls.**
- **Budget:** aim for ≤ ~200k tokens. Parse pages with small `python3 -I` scripts; keep raw downloads in `/tmp/partE/`.
- **Labels:**
  - VERIFIED (you opened the primary page);
  - VENDOR CLAIM;
  - SEARCH-SUMMARY;
  - ESTIMATE (show the inputs).

  **Never invent** anything; write NOT FOUND plus what you tried. Keep quotes under 15 words.
- **apps.shopify.com:** robots.txt disallows `*q=*`, so never fetch its search pages. App, review, category and partner pages are fine; leave ≥ 2 s between requests.
- **Privacy:** never put anyone's email or name into a web request; use a generic User-Agent. Don't contact anyone, post or sign up.
- **No git.** Edit only `research/round2b/E-critic.md`.
- **Checkpoint:** the first line reads `STATUS: IN PROGRESS — next: …` until done, then `STATUS: FINAL`. Save after each claim. If told "continue from your checkpoint", resume from your file.
- **Date:** 2026-10-31.
- **Final message to the manager (≤ 300 words):**
  - your verdict and confidence;
  - the single most dangerous flaw;
  - the one change you'd make;
  - any wrong cut;
  - what you could not verify;
  - your tokens.

### 5. Tips
- The most common death on app stores is silence: no installs, no reviews. Look for evidence of what a zero-review newcomer actually gets in this category.
- A "10× feature" that incumbents already list on their pages is not 10×. Read their feature lists before believing the claim.
- A deadline sprint lives or dies on whether buyers feel the deadline. Look at what developers in the official thread actually plan to do.
- A non-coder's first app fails on maintenance as often as on build. Check how often Shopify forces changes.
- If a claim rests on one vendor page, treat it as one data point.

### 6. What not to do
- Don't rewrite decision.md, and don't re-run Parts A–D.
- Don't soften a finding to be polite, and don't invent a flaw to look tough.
- Don't recommend a replacement without demand numbers and a route.

### 7. Checklist
- [ ] Claims 1–8 attacked, each with at least one primary source re-opened.
- [ ] At least 2 counter-evidence searches for the niche, and 2 for the sprint.
- [ ] A competitor feature check of the top 5 back-in-stock apps, plus at least one forecasting app.
- [ ] The 90-day numbers recomputed.
- [ ] The wrong-cut check.
- [ ] The halal check.
- [ ] Verdict + steelman + confidence.
- [ ] The Step 3 self-check section.
- [ ] `STATUS: FINAL` + the final message.

## STEP 1 — WHY THIS MATTERS
This is the last check before the CEO commits. Two rounds were already rejected as too small or too weak. If a fatal flaw survives to the decision, he loses months and his trust in the process. If the plan is right but wrongly killed here, he loses his best start, and the script-tag window closes on 2027-03-01.

## STEP 2 — WHAT SUCCESS LOOKS LIKE
- Every claim judged with evidence you opened yourself, and at least 6 primary sources re-opened.
- A clear verdict on the niche, the 10× claim, the sprint and the 90-day numbers.
- If you replace anything: a better option with demand numbers, a route and a Monday test.
- Zero invented facts.

## STEP 3 — A WAY TO CHECK THE WORK
- **For each FIX or REPLACE:** state the evidence that would change your mind.
- **For each KEEP:** state the week-1 observation that would prove you wrong.
- **Re-open your 3 most important sources** before finishing, and write a "Self-check" section.
- **Recompute one decisive number a second way.**

## FREEDOM
Attack from any angle that matters: platform rules, merchant psychology, competition, money, time, team fit, halal. If the whole Shopify road is wrong, say so with evidence.
