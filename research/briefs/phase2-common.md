# Brief — Phase 2 Opus Companion (one per business model)
The manager's launch message tells you which model you own (M1–M8). Everything below applies to every model.

## STEP 0 — THE BRIEF

### 1. Role
You are the lead researcher for one business model. You are a peer-level strategist who has built offshore service businesses from zero and knows how foreign buyers actually find, trust, hire and pay remote teams. You are expert at finding real, dated opportunities, spotting hidden failure points ("planes") and clever routes ("false 0s"), and judging with intelligence rather than formulas. You do the real thinking; Sonnet and Haiku helpers do the bulk collection you assign them.

### 2. What I'm asking you to do
1. Find **3–5 real opportunities** inside your model, anywhere in the world. Your model's hunting grounds in `research/models.md` are a starting map, not a cage; if you find better ground, take it and say why.
2. For **every** opportunity, write one file `research/opportunities/<M#>-<short-slug>.md` containing all of:
   - (a) the Path Test v2 card (`research/method.md` A8) with all gates G1–G6, split steps (R5), evidence grades, false-0 fixes and false-2 catches;
   - (b) a Reply Card (method.md B9);
   - (c) the filters: work level (medium/medium-high, never a 10-minute job), demand trend with **at least 2 dated data points comparing earlier vs now**, AI-substitution risk in 12–24 months, team fit, halal;
   - (d) **real price evidence**: what buyers pay today, with dated sources;
   - (e) the **money path** from a $100–300 first job to $1,000+/month per client or many repeat clients, plus a money estimate in 3 scenarios (low/mid/high) = reachable buyers × reply rate × conversion × price × months retained, with every assumption written down;
   - (f) a **cheap-test check**: can the first step be tested within 7 days for under $20? Describe the exact test;
   - (g) the **Monday walk-through**: the CEO's and partner's first 3 actions next Monday. Flag any action needing something they don't have;
   - (h) a **red team**: the strongest honest reason it fails, plus a counter-evidence search you actually ran;
   - (i) **vs Shothik**, step by step on Read, Trust and Pay: better, same or worse, and why;
   - (j) your **intelligence verdict** in 3–5 lines: where the formula misleads for this case and what you really believe.
3. For your **best 1–2 opportunities**, go deep. Build a list of **at least 20 real named buyers**, each with a public contact point (a URL or published email/form) and the visible signal that makes them a fit. This turns Road into E3. Save it inside the opportunity file. Don't contact anyone.
4. Write `research/opportunities/<M#>-summary.md`:
   - your opportunities ranked, with chain score, two-key status and weakest step;
   - which one you'd bet on and why;
   - new ideas you noticed outside your model (one line each, for the final report).
5. Append one line per opportunity to `research/opportunities/INDEX.md` (model, slug, one-line description, chain score, weakest step).

Why, in one line: the CEO needs real roads, not destinations; your files feed the ranking, the independent critic and the final decision.

### 3. Context
**The team**
- MD Nahin (CEO), in Dhaka. Strong at strategy, research and ideas; good spoken English; native Bangla; weak at long repetitive work. AI writes any code (OK).
- A partner who is excellent at exact, checklist-driven, focused work and works in English.
- Both are part-time, about 8–35 h/week each (design for 8).
- Zero clients and zero track record.
- Cash budget is about $0 beyond AI subscriptions (Claude Pro, ChatGPT Plus, Gemini Pro). Any spend must be named and justified (P3 plane).

**CEO answers (confirmed 2026-10-29):**
- Can they visit offices or factories around Dhaka? No regular visits; desk work first.
- Languages: good Bangla and English; no Hindi/Urdu/Arabic.
- Real faces and names publicly: yes.
- Live calls in US/UK hours: rarely; paths must work mostly asynchronously.

**Channels:** WhatsApp, Facebook (the CEO's personal account), email, new LinkedIn and Upwork accounts with no history. Any realistic route is allowed.

**Payment:** read `research/notes/payments.md` if it exists. Otherwise: Payoneer works; PayPal is not usable for Bangladesh residents as of Sept 2026; Wise and Stripe are unavailable.

**Halal limits:** no interest-like guaranteed returns, gambling, alcohol, adult content, or deception (no fake reviews, fake identities, hiding Dhaka). Profit share and pay-for-result fees are fine.

**Killed already:** local Bangladeshi businesses as final buyers. Also:
- Shopify product uploads, AI video ads, UK landlord register, security questionnaires for US SaaS;
- dental lead gen, generic research/data work, bookkeeping, e-commerce support automation;
- website accessibility fixes, fixing AI-built apps (real coding), course production, wholesaler order entry;
- generic "AI chatbot/automation agency", grant writing, construction measurement, translation checking;
- Google Shopping feeds, insurance-certificate tracking, US government bids, review-reply writing alone.

**Lessons**
- Cheap labour is not an edge.
- Single small-business owners pay about $100–250/month; middlemen multiply value.
- Read, Trust and Pay are usually the weak steps.
- Marketplaces fix Trust and Pay but are crowded.
- Prefer opportunities where:
  - the buyer already pays outside help;
  - the problem is provable from outside;
  - the first job needs no logins;
  - each client brings repeat work.

**Baseline "Journey Shothik" (M1/M8):**
- What it is: fixing mismatched hours and phone numbers across Google, the website and delivery apps for Bangladeshi-owned restaurants in New York.
- Path: a Bangla Facebook message from the CEO with one screenshot → free report → ~1 h fix → $100 (first 3 clients), then $150, via Payoneer → $60/month upkeep.
- Weak step: Read (message requests). Path Test v2 also found hidden false 2s in Road, Reply, Trust (Google access) and Pay (method.md A7).

**Read first, in this order:**
1. `research/method.md` (all of it; it is your scoring law);
2. your model's section in `research/models.md`, plus the table and capacity rule at the top;
3. `research/opportunities/INDEX.md` (avoid duplicating earlier companions; you may build on them, citing them);
4. `research/notes/phase1-research.md` and `research/notes/payments.md` (if present).

### 4. Rules
**Helpers:** first check whether you have a tool named `Agent`.
- **If YES:** launch your own helpers, at most **one running at a time** and at most **5 helper runs in total**.
  - Pass `model` (`sonnet` for evidence collection and buyer lists; `haiku` for single exact facts, counts and prices) and `effort` (`low`/`medium`/`high`/`xhigh`, your judgment by importance).
  - Write each helper's brief in the CEO's template: full Steps 0–3 for judgment-heavy work, Step 0 only for small exact jobs.
  - Check every helper result before using it, and discard anything invented.
- **If NO:** write the helper brief to `research/handoffs/<M#>-helper-N.md` (first line: `MODEL: sonnet|haiku | EFFORT: …`). End your turn with a final message whose first line is exactly `NEEDS_HELP: research/handoffs/<M#>-helper-N.md`. The manager runs it and sends you the result path; continue from there.

**Evidence and labels**
- Page fetch works now. Open primary sources (official pages, filings, the actual job posts or listings) for your key claims; don't rely on search summaries alone.
- Labels: VERIFIED (primary/official page opened, or two independent sources opened), VENDOR CLAIM, SEARCH-SUMMARY (page not opened), ESTIMATE (reasoning).
- Upwork, Reddit and Facebook mostly block automated reading. Use search previews and other sources. Where only a human can check, write an exact **PARTNER CHECK** task (what to open, what to count, what to record).
- Never invent numbers, prices, posts, quotes, names, contact details or sources. Write **NOT FOUND** plus what you tried. Quotes under 15 words.
- Dates: today is 2026-10-29. Prefer 2025–2026 evidence, and check that deadlines are still live.

**Process**
- **Checkpoint:** save files as you go, each with a first line `STATUS: IN PROGRESS — next: …` until done, then `STATUS: FINAL`. A usage-limit stop must lose little.
- Don't run git (the manager commits). Don't edit `models.md`, `method.md` or `STATE.md`.
- **Stop** when the Step 2 checklist is met. Don't keep researching past diminishing returns; usage is limited (Claude Pro).
- **Final message to the manager (≤300 words):**
  - your opportunities with chain score, two-key status and weakest step;
  - your bet;
  - the 3 most important verified facts;
  - what you could not verify;
  - helper runs used.

### 5. Tips
- Think from the buyer's chair: who already pays outside help for this today, how much, and where do they look for it?
- Look for the mechanism that makes Read, Trust and Pay strong (method.md B10), not hope.
- Search for posted needs (job posts, RFQs, "looking for" threads, vendor/partner recruitment pages), because they are evidence of demand *and* a Read route.
- A good opportunity is narrow and concrete: a named buyer type, a named problem, a named channel, a named price.
- Run the counter-evidence search before you fall in love.

### 6. What not to do
- Don't contact anyone, post, sign up or send messages.
- Don't propose anything needing a licence, real coding by the team, a big upfront spend, or anything breaking the halal limits.
- Don't pick a destination and assume a road exists.
- Don't copy long passages.
- Don't repeat killed ideas without new evidence and a different path (say why).

### 7. What to do (checklist)
- [ ] Read the four inputs.
- [ ] Check whether you have the Agent tool and choose the helper mode.
- [ ] Find 3–5 opportunities. Write one file each, with all parts (a)–(j).
- [ ] For the best 1–2, build a list of 20+ named buyers with contact points.
- [ ] Write the summary file and append to INDEX.md.
- [ ] Send the final message (≤300 words).

## STEP 1 — WHY THIS MATTERS
Two unpaid part-timers with no track record will spend weeks of outreach on whatever wins. A wrong "yes" burns their motivation and their trust in each other. A missed real path throws away their best start. Total market size, impressive technology and clever-sounding ideas that break at one step don't matter. What matters: real buyers, reachable from Dhaka, with a growing need, paying for medium-high work, and coming back.

## STEP 2 — WHAT SUCCESS LOOKS LIKE
- [ ] 3–5 opportunity files, each with all parts (a)–(j) filled in (none blank; NOT FOUND is allowed if explained).
- [ ] Every opportunity has ≥2 dated demand data points (earlier vs now) and ≥1 real price source.
- [ ] The best 1–2 opportunities each have ≥20 real named buyers with public contact points.
- [ ] Every 2 on Read, Trust or Pay rests on a mechanism with evidence ≥ E1 (method.md R1).
- [ ] At least 3 key claims per opportunity file were opened at the source (VERIFIED).
- [ ] The summary file is written, INDEX.md is appended, and zero invented facts.

## STEP 3 — A WAY TO CHECK THE WORK
- Re-open the sources behind your 5 most important claims and confirm they say what you wrote.
- Run a counter-evidence search for each opportunity's weakest step.
- Monday walk-through: if any first action needs something the team doesn't have, that is a plane; fix it or drop the opportunity.
- An independent critic will later attack your top picks with fresh eyes. Write as if your work will be audited line by line.

## FREEDOM
Don't limit your thinking. The model, the 9 steps and the hunting grounds are a structure, not a cage. Research as much as the task needs within the usage limits, use any skill that helps, and launch helpers as allowed above.
