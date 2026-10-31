# Brief — Round 2 Opus Companion: test 6 candidate companies
MODEL: opus | EFFORT: xhigh | **NO sub-agents or helpers** (CEO rule: protect usage)

## STEP 0 — THE BRIEF

### 1. Role
You are a founder-investor who has built B2B companies from emerging markets into global businesses, and who has seen most such companies die from **distribution**, not product. You judge ideas by three things: how big they get if they work, the odds they work, and the time to first proof. You are ruthless about evidence and generous with imagination.

### 2. What I'm asking you to do
Test the 6 shortlisted candidates in `research/round2/candidates.md` (C1–C6) with real evidence. Find the **one or two companies worth building** and the exact ladder to start them.

1. **Per candidate, write `research/round2/tests/C#-<slug>.md`** covering these 8 items:
   1. **Route proof.** Can unknown sellers actually reach these buyers by the named route? Look for posted-demand counts, marketplace listing rules and approval requirements, partner programmes, and real reply or traction evidence from people who did it.
   2. **Demand trend:** ≥ 2 dated data points, earlier vs now.
   3. **Size if it works:** reachable buyers × realistic price → ceilings at year 1 and year 3. Show the arithmetic and label every input.
   4. **Odds:** the strongest failure reason, plus one counter-evidence search you actually ran.
   5. **Rung 1 in ≤ 3 months at $0:** the exact first offer, 20 named first targets with public contact points or listing URLs, and the first-money mechanics.
   6. **Pay rail:** which rail pays a Bangladeshi team for this, verified at source where possible. Known rails are in `demand-map.md` §7.
   7. **Competition and AI substitution:** who sells it now, at what price, and whether the platform will build it in within 12–24 months.
   8. **Halal and licence check.**
2. **Improve or replace.** If a candidate dies, say so in one line and move on. If you find a clearly better adjacent company while testing, you may replace a candidate. Say why, and give the replacement the same 8 items.
3. **Write `research/round2/companion-report.md`:**
   - a ranking table: size if it works, odds, months to first $, distribution strength, two-key (Read/Trust/Pay strong by mechanism);
   - your recommended company (or two) with the 90-day ladder: weeks 1–2, 3–6, 7–12, with go/stop numbers;
   - the 3 facts that most decide it, labelled;
   - what you could not verify.

Why, in one line: the CEO rejected round 1 because it produced small, safe services. This round must find a company that can grow big, with a road to customers that actually works.

### 3. Context
**The team**
- MD Nahin (CEO), Dhaka: strategy, ideas, AI tools, AI agents, automation (Make/n8n/Zapier), builds products with AI coding. His past products worked but **failed on distribution**: nobody knew about them.
- A partner: precise, checklist-driven, works for future profit.
- Both have jobs. Hours can grow beyond 8/week, and live calls in US/UK/AU hours are now OK.
- Cash $0 beyond AI subscriptions. First earnings needed within 3 months, then climb. The ambition is very large.
- Later: hire in Bangladesh (~20,000 BDT/month for a strong hire). This is a margin edge, never the pitch.

**Buyers and countries:** B2B only (businesses small to big, and agencies), in US/CA, UK/IE, EU, Gulf and AU/NZ. Each country's own rules create its own openings.

**Halal:** what we sell and do must be halal. A general business tool is fine; we never build for haram activity (alcohol, gambling, interest lending, adult). Flag grey cases.

**Payments:** usable rails are Payoneer, Upwork, Gumroad (BDT), and Lemon Squeezy (bank payouts list includes Bangladesh, VERIFIED 2026-10-31; its future is uncertain). Not usable: our own Stripe or PayPal account.

**Round 1 lessons:**
- Unknown senders from Dhaka are ignored (Read and Reply are the walls).
- Marketplaces and partners fix Trust and Pay.
- Single small owners pay ~$100–250/month.
- AI substitution kills low-complexity services.
- These are dead: the generic "AI chatbot/automation agency", review-reply writing alone, bookkeeping, website accessibility fixes, voice-agent QA-only offers.

**Read first** (under `/home/user/MD-nahin/`):
1. `research/round2/demand-map.md`;
2. `research/round2/candidates.md`;
3. `research/REPORT.md` (round 1 result, skim);
4. `research/method.md` §B (Reply playbook, skim) and A6 (false-2 planes, skim).

Use round-1 files only if needed.

### 4. Rules
- **No sub-agents or helpers.** Do the work yourself, efficiently. Budget: aim for ≤ ~450k tokens; stop at the Step 2 checklist.
- **Labels:** VERIFIED (primary page opened), VENDOR CLAIM, SEARCH-SUMMARY, ESTIMATE. **Never invent** numbers, names, contacts, prices or sources; write NOT FOUND plus what you tried. Quotes under 15 words.
- **Privacy:** never put anyone's personal email or name into web requests (including User-Agent headers). Use a generic User-Agent.
- **Don't contact anyone,** post or sign up. **No git.** Edit only files under `research/round2/`.
- **Checkpoint:** each file's first line reads `STATUS: IN PROGRESS — next: …` until done, then `STATUS: FINAL`. Save after each candidate; usage limits can stop you.
- **Tools:** load web tools via ToolSearch ("select:WebSearch,WebFetch"). If WebFetch fails, use curl with a generic User-Agent.
- **Date:** today is 2026-10-31.
- **Final message (≤ 300 words):** the ranking; your recommended company and its 90-day ladder in brief; the 3 deciding facts; what you could not verify.

### 5. Tips
- Distribution first: a candidate whose route has no evidence is a story, however big.
- A marketplace or partner that already holds buyers beats any amount of cold outreach.
- Be careful with market-size numbers from vendors. Count reachable buyers bottom-up.
- Bigger is not riskier if the first rung is cheap and fast. Look for ladders, not leaps.
- When a candidate fails, ask what adjacent version would pass before dropping it.

### 6. What not to do
- Don't re-run round 1.
- Don't recommend a destination without a road.
- Don't pad files. Dense and checkable beats long.

### 7. Checklist
- [ ] 6 test files (or replacements) with all 8 items.
- [ ] Companion report with ranking, recommendation, 90-day ladder and go/stop numbers.
- [ ] Final message.

## STEP 1 — WHY THIS MATTERS
The CEO wants a company that can become very large. He knows from his own failures that distribution decides everything. A big idea with no road wastes months. A small idea with a road wastes the ambition. The goal is a road that starts small, pays within 3 months, and keeps widening.

## STEP 2 — WHAT SUCCESS LOOKS LIKE
- [ ] Every candidate has route proof (or NOT FOUND), ≥ 2 dated demand points, bottom-up size arithmetic, a counter-evidence search, a $0 first rung with 20 named targets, a verified or flagged pay rail, a competition check and a halal check.
- [ ] One or two recommended companies with a 90-day ladder and go/stop numbers.
- [ ] At least 3 deciding facts VERIFIED at a primary source.
- [ ] Zero invented facts.

## STEP 3 — A WAY TO CHECK THE WORK
- **Monday check:** if the first action of the recommended company needs something the team lacks, fix it or change the pick.
- **Counter-evidence:** one counter-evidence search on the recommended company's route.
- **Self-audit:** re-open the 3 deciding sources before finishing.

## FREEDOM
Think big, check hard. If all 6 fail, say so and name the best adjacent company you found instead.
