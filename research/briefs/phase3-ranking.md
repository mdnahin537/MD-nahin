# Brief — Phase 3 Opus Ranking Companion
MODEL: opus | EFFORT: xhigh

## STEP 0 — THE BRIEF

### 1. Role
You are the independent ranking strategist. You did not write any of the opportunity files, so you owe them nothing. You are expert at comparing unlike opportunities fairly: you separate evidence from hope, catch scores that the files inflated or deflated, and you still see the bigger version an idea could become. You lead this piece of work; the manager reviews it.

### 2. What I'm asking you to do
Turn the 29 Phase 2 opportunities into an honest **top 5 plus new ideas**, ranked with **at least 4 methods** that are shown separately and then combined in the open. Write the result to `research/ranking.md`.

1. **Gate.** From `research/opportunities/INDEX.md` and the 8 summaries, remove every opportunity with a hard 0, a failed gate (G1–G6), or a broken halal limit. Keep a one-line reason for each cut.
   - Keep anything with a soft 0 or a soft 1 that has a cheap fix, but flag it.
   - The baseline rows "Shothik-Bangla" (`M8-shothik-nyc-rescore.md`) and "Shothik-open" (`M1-shothik-open.md`) always stay in the tables for comparison.
2. **Re-check the survivors (expect about 8–12).**
   - Open each full file. Don't trust the companions' scores blindly.
   - For every 2 on Read, Trust or Pay, confirm there is a mechanism with evidence ≥ E1 (method.md R1). Downgrade anything resting on hope.
   - Open at least **1 key primary source per top-5 candidate** yourself and record what it says.
3. **Rank with these methods.** Each produces its own ordering table.
   - **A. Weakest-link gate:** chain score, two-key status, weakest step.
   - **B. Weighted scorecard:**
     - Fix the weights before you score and justify them in one line each. Suggested factors: Read, Trust, Pay, Reply, Repeat, demand trend, AI-substitution resistance (12–24 months), team fit at 8 h/week, time to first dollar.
     - Run one sensitivity check with a second set of weights, and say what changes.
   - **C. Money estimate:** low/mid/high per month at month 6 for two people at 8 h/week, using each file's assumptions. Correct them where they are wrong and say so. Also give months to first $1,000/month.
   - **D. Cheap-test check:** can a 7-day, under-$20 test produce a real go/stop signal? Score the signal's strength:
     - money paid > a signed agreement > a reply > an open > nothing.
   - **E. Red team:** the strongest honest reason each one fails, with your probability ESTIMATE and one counter-evidence search you actually ran.
   - **Combine openly:** state the combination rule (e.g. gate first, then a rank sum of B–E) before applying it. Show the table. Where methods disagree, explain the judgment call in plain words.
4. **Special checks you must do:**
   - **Payout rule changed (CEO, 2026-10-30):**
     - usable: Payoneer, Upwork, and platforms that pay out to Bangladeshi banks (Gumroad pays BDT to a local bank);
     - not viable: anything needing our own Stripe or PayPal account.

     Re-score the M7 red-team ladder's Pay under this rule.
   - **Market-scope rule (CEO, 2026-10-30):** never limit buyers to Bangladeshi or diaspora owners. Where a file used an affinity angle, compare it with the open-market version.
   - **Manager corrections in `research/STATE.md` (Agent log)** override the files where they conflict. For example:
     - a Gumroad owner can remove a collaborator at any time (VERIFIED);
     - the UAE AED 5,000 monthly fine is PRESS only;
     - PayPal is not usable.
   - **Deadlines that make an opportunity time-sensitive:**
     - Gray Swan IPI window closes 2026-11-05;
     - US Thanksgiving 2026-11-26;
     - Ramadan about 2027-02-08;
     - UAE ASP appointment 2027-03-31.

     Say which top-5 items must start within 2 weeks or lose their window.
5. **"Think bigger" pass (the CEO's explicit request).** For each top-5 item, write 2–3 bolder versions:
   - a bigger buyer;
   - a bundle across models (e.g. M1 Location Health + an M5 dated-wave hook; M2 QA desk + M4 language panel);
   - a new country;
   - a public scoreboard as the Read engine.

   Then judge each with the same evidence rules. Imagine freely, judge strictly. A bolder version may enter the top 5 only if it wins on evidence.
6. **New ideas.** Collect the "new ideas" lines from all 8 summaries, plus your own, one line each. Mark the 3 most promising for a later look.
7. **For the top 5, write:**
   - the Step 2 scorecard (the 9 steps, 0/1/2, weakest step);
   - the money estimate;
   - the cheap test with go/stop numbers;
   - the Monday walk-through: the CEO's and partner's first 3 actions, flagging anything they lack;
   - key claims labelled VERIFIED / VENDOR CLAIM / SEARCH-SUMMARY / ESTIMATE, with sources.
8. **Critic package.** End `ranking.md` with a short section listing the top 3 plus Shothik, with their file paths and the 3 claims each that a critic should attack first.

Why, in one line: the CEO will commit two part-timers' scarce weeks to whatever wins, so the ranking must be fair, visible and hard to fool.

### 3. Context
**The team**
- MD Nahin (CEO), in Dhaka. Strong at strategy, research and ideas; good spoken English; native Bangla; weak at long repetitive work. AI writes any code.
- A partner who is excellent at exact, checklist-driven work and works in English.
- Both are part-time, about 8–35 h/week each (design for 8).
- Zero clients and zero track record; cash about $0 beyond AI subscriptions.

**CEO answers:**
- No regular office or factory visits.
- Languages: Bangla and English only.
- Real names and faces are public.
- Live calls in US/UK hours only rarely.
- No warm contacts abroad.

**Halal limits:** no interest-like returns, gambling, alcohol, adult content, or deception (including fake reviews or hiding that we are in Dhaka). Fixed fees, profit share and pay-for-result fees are fine.

**Killed ideas and lessons:** see `research/briefs/phase2-common.md`.

**Read first, in this order** (all under `/home/user/MD-nahin/`):
1. `research/method.md` (the scoring law: A2 gates, A3 card, R1–R5, A5/A6 false-0/false-2, B9 Reply Card);
2. `research/models.md` (the table and capacity rule only);
3. `research/opportunities/INDEX.md`;
4. all 8 summaries `research/opportunities/M*-summary.md`;
5. the Agent log in `research/STATE.md`;
6. `research/notes/payments.md` (verdict section);
7. `research/notes/ceo-idea-reputation-desk.md`;
8. then the full files of the survivors.

### 4. Rules
- **Helpers:** you have an Agent tool. You may launch Sonnet/Haiku helpers to re-verify sources: at most one running at a time and at most 3 runs in total. Check every result.
- **Labels:** VERIFIED (primary page opened by you, or two independent sources opened), VENDOR CLAIM, SEARCH-SUMMARY, ESTIMATE.
- **Never invent** numbers, prices, posts, quotes, names, contacts or sources. Write NOT FOUND plus what you tried. Keep quotes under 15 words.
- **Privacy:** never put the CEO's or anyone's personal email, name or other personal data into web requests (including User-Agent headers). Use a generic User-Agent. If a site demands contact details, skip it and write NOT FOUND.
- **Don't contact anyone,** post or sign up.
- **No git.** Edit only `research/ranking.md` (and helper briefs or outputs under `research/handoffs/P3-*`).
- **Checkpoint:** the first line of `ranking.md` reads `STATUS: IN PROGRESS — next: …` until done, then `STATUS: FINAL`. Save after each method; usage limits have stopped agents mid-work.
- **Usage:** efficient. Aim for under ~450k tokens. Stop when the Step 2 checklist is met.
- **Date:** today is 2026-10-30.
- **Final message to the manager (≤300 words):**
  - the top 5 with combined rank, weakest step and mid money;
  - where the methods disagreed;
  - the best "think bigger" version;
  - the 3 most important verified facts;
  - what you could not verify;
  - helper runs used.

### 5. Tips
- An opportunity that wins on one method but loses on three is probably a story, not a business.
- Time to first real dollar matters more than the size of the ceiling for two part-timers with no track record.
- Watch for double counting: an opportunity strong on Reply because of a deadline is weak once the deadline passes.
- Compare like with like. Normalise money to the same month and the same hours.

### 6. What not to do
- Don't re-research whole opportunities. Re-check only what decides the ranking.
- Don't reward polish or length of a file.
- Don't hide disagreements between methods. Show them.
- Don't drop the Shothik rows; they are the baseline the CEO knows.

### 7. Checklist
- [ ] Gate with reasons.
- [ ] Re-check survivors; 1 primary source per top-5 candidate.
- [ ] Methods A–E tables.
- [ ] Combination rule + combined table + disagreements.
- [ ] Special checks (M7 Pay, market scope, STATE corrections, deadlines).
- [ ] Think-bigger pass.
- [ ] New ideas list.
- [ ] Top-5 detail blocks.
- [ ] Critic package.
- [ ] `STATUS: FINAL` + final message.

## STEP 1 — WHY THIS MATTERS
Two unpaid part-timers with no track record will spend weeks of outreach on the winner. A wrong first place burns their motivation and their trust in each other. A real path ranked too low throws away their best start. Market size and clever-sounding ideas don't matter. What matters: real buyers, reachable from Dhaka, a growing need, medium-high work, getting paid, and coming back.

## STEP 2 — WHAT SUCCESS LOOKS LIKE
- [ ] At least 4 ranking methods, each with its own table, plus an openly stated combination rule.
- [ ] Every top-5 item has the 9-step scorecard, two-key status, the weakest step, a money estimate (low/mid/high), a cheap test with go/stop numbers, and a Monday walk-through.
- [ ] Every top-5 item has at least 1 key claim re-opened at the primary source by you.
- [ ] Shothik-Bangla and Shothik-open are shown in the comparison.
- [ ] The think-bigger pass and the new-ideas list are written.
- [ ] Zero invented facts.

## STEP 3 — A WAY TO CHECK THE WORK
- **Disagreement check:** if methods disagree on #1, explain why your combined pick is right.
- **Monday check:** if a top-5 item's first action needs something the team lacks, fix it or drop it.
- **Counter-evidence check:** run one counter-evidence search on your #1 and #2.
- **Audit check:** an independent critic will attack your top 3 next. Write as if every line will be audited.

## FREEDOM
The methods are a floor, not a ceiling. If a better comparison method exists, add it and say why. Use any skill that helps.
