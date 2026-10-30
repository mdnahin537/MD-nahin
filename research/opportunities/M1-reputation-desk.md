STATUS: IN PROGRESS — next: shared buyer list (k) from helper-2; final check

# M1 — Restaurant Hard-Review Desk (the CEO's reputation desk, reshaped)
**Model:** M1 Proof-First Fixer · **Companion:** Phase 2 Opus (M1 owner), 2026-10-30
**One line:** Human judgment on a restaurant's 1–3 star reviews (classify, reply in the owner's voice within guardrails, escalate the operational cause, flag policy-violating or extortion reviews to Google with evidence), plus a monthly root-cause memo. The opener is a proof built from public reviews with no login. Access is a Manager invite, never a password. Buyers compared: **(a)** single low-rated owners, **(b)** multi-location groups (5–200 sites), **(c)** restaurant agencies buying it white-label. Countries: US, UK, CA, AU, IE, NZ.
**Labels:** VERIFIED = primary page opened on 2026-10-30 (by me or by helper-1 and spot-checked) · E3 · VENDOR CLAIM · SEARCH-SUMMARY · ESTIMATE · NOT FOUND.
**Source of the idea:** research/notes/ceo-idea-reputation-desk.md (CEO's voice idea + the manager's fact-check and reshape).

## Hard rules (non-negotiable, built into the product)
1. **Never a discount or any benefit in exchange for changing or removing a review.** Google's Maps content policy bans it (VERIFIED by the manager, support.google.com/contributionpolicy/answer/7400114). US law: 16 CFR 465.4 makes it unfair "to provide compensation or other incentives in exchange for, or conditioned expressly or by implication on" reviews "expressing a particular sentiment" (VERIFIED, eCFR text current to 2026-10-01). A genuine make-good is offered only privately, never mentions the review, and never asks for an edit.
2. **No false accusations in public replies.** 16 CFR 465.7(a) bans "a public false accusation in response to a consumer review" made knowing it is false or with reckless disregard, to get the review removed (VERIFIED, eCFR). "You never ate here" without proof is out.
3. **Speed alone is not a product.** Alerts are free (Google notification API, Zapier) and AI drafts cost $0–10 a month (see d). We sell judgment on hard cases.
4. **UK:** the DMCC Act's fake-review rules have applied since 6 Apr 2025; the CMA's 3-month grace period ended in July 2025 (VERIFIED, Greenberg Traurig note, July 2025; fines up to 10% of turnover per SEARCH-SUMMARY). We never write, buy or gate reviews.
5. **Halal:** the same licensed-premises filter as M1-shothik-open (~4 in 10 NYC food businesses hold an on-premises licence, E3).

---

## Evidence base
**What consumers expect (rising, dated):** BrightLocal Local Consumer Review Survey 2026 (VERIFIED, opened):
- 89% expect owners to respond; 80% are likely to use a business that responds to all reviews; 42% unlikely to use one that never replies.
- **19% expect a same-day response, up from 6% last year; 32% by the next day, up from 18% in 2025.**
- **"Generic or templated replies put off 50%"** of consumers. This is the evidence that a cheap AI template has a cost.
- "The owner has responded" is a top-4 review factor (37%).
- Requests for discounts in exchange for reviews fell from 45% (2024) to 36% (2025) to 27% (2026): the incentive practice is dying.
**What owners do:** 64% regularly ask for reviews and **51% respond** (BrightLocal Small Business Marketing Report 2026, VERIFIED). Restaurant brands reply to "just 13%" of reviews (QSR Magazine contributed piece, undated, SEARCH-SUMMARY, weak).
**Google's mechanics (VERIFIED, support.google.com/business/answer/3474050):** replies are moderated ("usually… up to 10 minutes… sometimes… up to 30 days"); the reviewer is notified and "can still change their review after reading your reply". No private channel to Google reviewers exists. Yelp lets businesses message reviewers privately (SEARCH-SUMMARY, older sources).
**Extortion is now a named problem:** Google runs a dedicated form for "negative review extortion scams", describing "a sudden increase in 1-star and 2-star reviews… followed by someone demanding money" (VERIFIED, support.google.com/business/answer/16404809). Earlier: Houston restaurants hit by one-star extortion (NRN 2022, SEARCH-SUMMARY). Triage of these cases is judgment work.
**Google's own AI replies:** a **limited test** of "Reply to reviews with AI" (Search Engine Land, 2026-03-20, SEARCH-SUMMARY; Location3, 2026-07-07: "not been broadly released", opened by helper-1; Engage Web UK blog: "experimenting with AI… reply suggestions", opened by me). Reported in the US, Brazil and India; UK, CA, AU, IE, NZ: NOT FOUND. No official Google page found.

**Who already pays for human review handling, and how much (helper-1, research/handoffs/M1-helper-1-prices.md):**
| Seller | Price | What the human does | Label |
|---|---|---|---|
| Marqii Managed Review Response (restaurants; "AI + HI (Human Intelligence)") | $100/month for 50 reviews ($2.00 each) → $375 for 500 ($0.75 each), per brand; + $100 platform fee if standalone | AI drafts, humans check | VERIFIED price (helper-1, re-opened); human share VENDOR CLAIM |
| The Social Station (hotels; same offer for F&B outlets) | **$49/month per outlet** after 3 free months | "A real person… writes a thoughtful, property-specific response"; client approves | VERIFIED (helper-1, re-opened) |
| The HOTH (white-label to agencies) | **from $275/location/month wholesale** incl. managed responses, review generation, listings, weekly GBP posts; agencies resell at $500–900 | provider-written replies | VENDOR CLAIM (own blog, 2026-08-18; I opened it) |
| Widewail (car dealers) | $500–750/month per rooftop ("our specialists answering every review") | specialists | VERIFIED (helper-1); other industry |
| Wishup (VA firm) | $3–8 per drafted+published response; $150–400/location/month multi-location | VA | VENDOR CLAIM |
| Fiverr / ComeUp freelancers | $55/month "respond to all"; $95 for 45 replies | freelancer | SEARCH-SUMMARY |
| Upwork posts | $5–10 fixed-price review tasks (Sep 2026) | freelancer | SEARCH-SUMMARY |
**AI-only tools:** ReplyOnTheFly $9.99/month (VERIFIED); Moz Local Reviews AI +$10/location (VERIFIED); ReviewPush Lite $49/location (VERIFIED); Reputation.com Rep Core **$80/location** incl. "AI Responding" and listings (VERIFIED); Birdeye ~$299+/location (SEARCH-SUMMARY).
**Reading:** the market prices the human touch at **$0.75–8 per review, or $49–275 per location per month when bundled**. Routine replies are a commodity. Only the hard reviews, the escalation and the monthly "why" are worth paying a human for, and they must ride in a bundle to reach $50+ a location.

**Agencies already sell exactly this to restaurants:** MapsLeads' 2026 playbook for agencies pitches restaurants on rating gaps, "weekly response management" and a "$300 a month" starter (VENDOR, 2026-05-02). Lead tools now generate the proof-first opener automatically ("Reputation" data: rating, velocity, recent sentiment vs 3 competitors). **Our opener is not unique; their clients are our route (c).**

---

## Think bigger (imagine first, judge second)
**Imagined:**
1. **Bigger buyer:** sell the monthly root-cause memo as a "Voice of the Guest from public reviews" ops report to restaurant groups' COOs (20–200 sites): the same complaint at 5 sites is an operations finding, not a PR task.
2. **Bundle:** the white-label "Location Health" line (listings kept fixed + hard-review desk + AI-answer check) for agencies, one price per location.
3. **Different country:** the UK first: DMCC fake-review rules (Apr 2025) + CMA enforcement make agencies want a compliant, documented reply process; UK 09:00 = Dhaka 15:00; GBP transfer free.
4. **Public scoreboard:** a "Response Gap" index: of the top 50 UK restaurant groups, what share of their 1–3 star Google reviews in October got a reply? Each group gets its own row privately.
5. **Extortion response kit for agencies:** when a client gets a burst of 1–2 star reviews and a demand, we triage, assemble the evidence pack for Google's extortion form, and draft the public replies.

**Tested:**
| Version | For | Against | Verdict |
|---|---|---|---|
| 1 Groups' COO memo | Root cause is real judgment work; groups pay per location | AI insight tools target exactly this: Momos claims AI agents for "20K+ restaurant locations"; Ovation, Tattle ($59/location, SEARCH-SUMMARY) | **Weak alone** (G4); keep the memo as the bundle's differentiator. |
| 2 Bundle via agencies | Agencies already buy white-label reputation at $275 (HOTH) and retail $300–900; human replies retail at $49 (Social Station) | Many white-label suppliers (HOTH, Clicks Geek 500+ agency partners, Digital Help PH) | **Best version.** $60–90/location wholesale undercuts HOTH by 3–4×, and the proof-first opener is about the agency's own clients. |
| 3 UK first | Dated legal driver (DMCC, VERIFIED); timezone; free GBP rail; PECR allows corporate email | No evidence UK agencies outsource replies for compliance reasons (NOT FOUND) | **Use UK as the first country for route (c)**, on rail and timezone, not on the law. |
| 4 Response Gap index | Being named in a set prompts replies (T20, ESTIMATE); public facts | Manual counting only (Google Maps unreadable by our tools; Places API returns only 5 reviews per place, ESTIMATE); naming risk | **Use as the letter** for groups and agencies; publish aggregates only, after a right of reply. |
| 5 Extortion kit | Google's dedicated form (VERIFIED); SEL calls these scams "on the rise" (SEARCH-SUMMARY) | Event-driven, rare per client; no price evidence | **A feature of the desk**, not a product. |
**Best "think bigger" version:** #2 (the white-label Location Health bundle), sold to UK restaurant agencies first (#3).

---

## (a) Path Test v2 cards
### Gates
| Gate | Result | Evidence |
|---|---|---|
| G1 Halal | ✔ with filter | Licensed venues excluded; never an incentive for a review (no deception). Agencies' mixed portfolios = P12 friction (as in shothik-open). |
| G2 Licence | ✔ | No legal advice: we don't decide whether a review is defamatory; we flag policy categories and the owner/agency decides. |
| G3 Capacity | (a) ✘ · (b) ✔ · (c) ✔ | ≈ 15–20 min per hard review (read, classify, draft, check guardrails) + ~1 h memo per location per month (ESTIMATE). At ~5 hard reviews a month a location ≈ 2.5 h/location/month → **~25–30 locations fill the team** (ESTIMATE). Cap breaker: a trained Dhaka writer under the partner's checklist; AI first drafts. |
| G4 AI substitution | **✘/~ high risk** | Routine replies: done by AI at $0–10 (ReplyOnTheFly, Moz) and Google is testing its own. Paid human part: hard cases (allegations, safety, discrimination, extortion), escalation and the memo. 12–24 months: AI will absorb more hard cases; the human part shrinks to sign-off. |
| G5 Demand trend | ✔ | Same-day expectation 6% → 19%, next-day 18% → 32% (BrightLocal 2025 → 2026, VERIFIED); 50% put off by templated replies; extortion form (2025–26). |
| G6 Killed list | ✔ **only with the new path** | "Review-reply writing alone" is killed. **New evidence:** templated replies cost customers (50%), FTC 465.7 and DMCC create liability for careless replies, Google moderates replies and runs an extortion channel. **Different path:** not sold to single owners as reply writing; sold white-label to agencies as hard-review judgment + root-cause memo, bundled with listings. If it is pitched as "we reply to your reviews", it is the killed idea. |

### Step cards (R5 split)
| # | Step | (a) Single low-rated owners | (b) Groups 5–200 | (c) Agencies (white-label) |
|---|---|---|---|---|
| 1 Home | Read the last 40 Google reviews by hand (~20 min), count unanswered 1–3 stars and themes | **2** (M, E1) | **2** (M, E1): 10 locations ≈ 3 h | **2** (M, E1): 10 portfolio clients ≈ 3–4 h |
| 2 Road | | **2** (M, E3 pool; low-rating filter needs manual checks) | **2** (M, E1) | **2** (M, E3 after helper-2 list) |
| 3 Letter | | **2** (M, E1) "7 of your last 40 reviews are 1–3 stars; 5 have no reply; 4 say 'cold on delivery'." | **2** (M, E1) "The same delivery complaint appears at 5 of your 12 sites." | **2** (M, E1) "11 of your 25 restaurant clients have unanswered 1–3 star reviews from October." |
| 4 Read | | **1-soft** (H, E1): as shothik-open (a); agencies already pitch them on rating gaps weekly (MapsLeads) | **1** (M, E0) | **1** (M, E1): business inbox; crowded with white-label offers |
| 5 Impressed | | **2** (M, E1): their own public reviews | **2** | **2** |
| 6 Reply | | **2-soft** (M, E2): a fresh 1-star review is a dated, public trigger, and 32% of customers expect a reply by the next day | **2-soft** (M, E2) | **1** (M, E1): the trigger is their client's exposure, not their own pain, unless they sell reputation already |
| 7 Trust | | **1 / 2 / 1**: letting a stranger speak publicly in their name is a bigger risk than fixing hours; Manager invite needed to reply | **1 / 2 / 2**: draft → their approval → post; Manager on a location group | **2 / 2 / 2** (M, E1): the agency approves and posts or invites us; offshore white-label is normal (HOTH, Clicks Geek) |
| 8 Pay | | **1** (rail ✔; owner habit unknown) | **2** (M, E2/E1) | **2** (M, E2/E1) |
| 9 Repeat | | **2** (M, E2): reviews arrive every week | **2** (M, E2) | **2** (M, E2): per-location monthly white-label (HOTH model) |

### Cards
```
ROUTE (a) SINGLE LOW-RATED OWNERS | GATES: G1✔ G2✔ G3✘ G4✘/~ G5✔ G6✘ in practice (this IS "reply writing" to them)
STEPS: Home 2 · Road 2(M,E3) · Letter 2 · Read 1-soft(H,E1) · Impressed 2 · Reply 2-soft(M,E2) · Trust 1/2/1 · Pay 1 · Repeat 2(M,E2)
CHAIN: 1 (Read, soft, E1) | TWO-KEY: 0 of 3 → WEAK BY DESIGN
```
```
ROUTE (b) GROUPS 5–200 | GATES: G1✔ G2✔ G3✔ G4~ (groups ≥20 sites likely on Reputation.com/Birdeye/Marqii with AI replies; ESTIMATE) G5✔ G6✔
STEPS: Home 2 · Road 2(M,E1) · Letter 2 · Read 1(M,E0) · Impressed 2 · Reply 2-soft(M,E2) · Trust 1/2/2 · Pay 2(M,E2/E1) · Repeat 2(M,E2)
CHAIN: 1 (Read, M, E0; Trust-identity, H) | TWO-KEY: 1 of 3 (Pay) → WEAK BY DESIGN
```
```
ROUTE (c) AGENCIES, WHITE-LABEL | GATES: G1~ (licensed clients excluded) G2✔ G3✔ G4~ G5✔ G6✔ (new path)
STEPS: Home 2(M,E1) · Road 2(M,E3 after list) · Letter 2(M,E1) · Read 1(M,E1) · Impressed 2(M,E1) · Reply 1(M,E1) · Trust 2/2/2(M,E1) · Pay 2(M,E2/E1) · Repeat 2(M,E2)
CHAIN: 1 (Read, M, E1) | TWO-KEY: 2 of 3 (Trust, Pay) → PASS
FALSE-0 FIXES: Trust-risk → Ra (agency approves and holds access); Pay → Ra; Reply → Re (fresh 1-star reviews; holiday rush complaints)
FALSE-2 CATCHES: Repeat looks strong but price floor is $0.75–2/review (Marqii AI+HI) → only a bundle holds $50+/location; G6 → pitched as "replies" it becomes the killed idea; P11 → a defamatory reply posted under the client's name is our liability: agency approval + guardrail checklist on every reply
SOFT-0 TESTS (≤2h, $0): partner counts unanswered 1–3 star October reviews for 10 clients of 2 agencies; CEO sends those 2 agencies their table
```
**Tie-break (R3):** (c) passes two-key; (b) 1 of 3 beats (a) 0 of 3.

---

## (b) Reply Card (route c)
```
BUYER (exact role): founder/owner of a 1–20-person restaurant web/marketing agency (UK limited companies first, then US/AU/CA/NZ) whose portfolio shows ≥10 restaurant clients, mostly unlicensed
CONTACT POINT: published hello@/founder email or partner form (shared list in M1-shothik-open (k))
CHANNEL + legal check: plain-text email; UK PECR (Ltd only; Companies House check), CAN-SPAM, AU Spam Act inferred consent (T6/T26); no calls
TRIGGER (why now, dated): October 1–3 star reviews still unanswered on their clients' profiles; 32% of customers expect a reply by the next day (BrightLocal 2026); Christmas-rush complaints in December
LINE ONE (their fact): "11 of the 25 restaurants in your portfolio have 1–3 star Google reviews from October with no reply — e.g. [client], 14 Oct: 'waited 50 min for delivery'."
PROOF (30-second self-check): client name + review date + first words; they open Google and see it
IDENTITY LINE (T15): "We're MD Nahin and [partner], a two-person review desk in Dhaka, Bangladesh. Faces, address, sample replies: [link]."
RISK REVERSAL (T22–T25): we draft replies for 3 of those reviews free, under your brand, you approve before anything posts; first month invoiced after you've seen it; no reply ever offers anything for a changed review
EASY ANSWER (yes/no): "Want the 3 drafts? Reply 'yes'."
SEND TIME: UK 09:00 GMT = Dhaka 15:00; US East 09:00 EST = Dhaka 20:00
TEST: A = line one with the count; B = line one with one quoted review; 30 + 30; stop rule T34
EXPECTED: baseline 3–5% → target ≥ 8% positive (ESTIMATE; NOT FOUND: any agency or restaurant reply-rate data)
```

---

## (c) Filters
- **Work level: medium-high.** Each hard review needs reading the history, classifying (genuine / policy-violating / extortion), drafting in the owner's voice within legal guardrails, and escalating the cause. The monthly memo groups complaints by cause with counts and quotes.
- **Demand trend:**
| Date | Point | Label |
|---|---|---|
| 2024-03-06 | 88% would use a business that replies to all reviews (LCRS 2024; wording differs from 2026) | VERIFIED (helper-1) |
| 2025 → 2026 | Same-day reply expected: 6% → 19%; next-day: 18% → 32% | VERIFIED (LCRS 2026) |
| 2024 → 2026 | Review-for-discount requests: 45% → 36% → 27% | VERIFIED (LCRS 2026) |
| 2025-04 / 2025-07 | UK DMCC fake-review rules in force; CMA grace period ends | VERIFIED (law-firm note) |
| 2026-03 → 2026-07 | Google tests AI-suggested replies (US/BR/IN) | SEARCH-SUMMARY / third-party opened |
- **AI substitution: high for routine replies, medium for hard ones.** The human edge narrows every year; this is a 12–24-month window, not a moat.
- **Team fit:** CEO's English writing + judgment; partner's checklist (guardrails, approval log). Async-friendly: US evening reviews land in Dhaka morning.
- **Halal:** licensed venues excluded; no incentives for reviews; honest identity.

## (d) Price evidence
See the evidence table above (Marqii $0.75–2/review; Social Station $49/outlet; HOTH $275 wholesale; Reputation.com $80 with AI; Widewail $500–750; freelancers $55–95/month; VA $3–8/response). Our proposed prices (ESTIMATE): **$35–50/location/month wholesale** for the hard-review desk + memo; **$60–90** bundled with listings kept-fixed; retail by the agency at $150–300.

## (e) Money path and scenarios (route c)
**Path:** free proof (their clients' unanswered October reviews) → 3 free drafts → **$150–300 first job**: clear the 1–3 star backlog of the last 90 days for 10 clients + one memo each → **$40/location/month** desk → bundle with listings at **$75/location** → an agency with 15 eligible locations = **$1,125/month**.
| Assumption | Low | Mid | High |
|---|---|---|---|
| Agencies emailed | 100 | 150 | 200 |
| Positive reply | 2% → 2 | 5% → 7–8 | 8% → 16 |
| Paid first job | 1 | 3 | 6 |
| Eligible locations per agency | 6 | 12 | 20 |
| Price/location/month | $35 (desk only) | $60 (half bundled) | $75 (bundle) |
| Months retained in year 1 | 5 | 8 | 10 |
| **Year-1 revenue** | **≈ $1,200** | **≈ $18,000** (run-rate ≈ $2,160/month) | **≈ $91,800**: needs ~120 locations ≈ 3–4× team capacity → requires 2–3 trained writers |
All ESTIMATE. Mid is at the team's capacity ceiling (36 locations ≈ 70–90 h/month), so **G3 binds before demand does**.
- **Route (a):** a single owner at $79–149/month churns fast and is the most pitched buyer in local business; ≈ $1–3k a year. Don't.
- **Route (b):** one 15-site group at $40/location ≈ $7,200 a year; Read and Identity are the brakes.

## (f) Cheap test (7 days, $0)
1. **Partner (4 h):** for 10 restaurant clients of 2 agencies from the list, count October 1–3 star Google reviews and how many have no reply; copy the first 8 words of each, with date.
2. **CEO (2 h):** write 3 sample replies for one client (in the agency's voice, guardrail-checked) and send both agencies their table (variant A). Send 8 more agencies a lighter version.
3. **Measure:** positive replies in 7 days; any "we use [tool] already" answers (G4 signal).
**Kill rule:** 0 positive from 10 personalised sends → this route is dead alone; keep the memo as an add-on to listings.

## (g) Monday walk-through
- **CEO:** (1) identity page with **3 public sample replies to real-style (anonymised) hard reviews** (FLAG: not built; $0, 3 h). (2) The guardrail checklist (no incentives, no accusations, offline contact, apology without admitting liability) — has the knowledge, needs 1 h. (3) Variant A/B letters.
- **Partner:** (1) the 10-client count (browser). (2) UK Companies House checks. (3) Approval-log template.
- **Planes:** Payoneer account status unknown (FLAG); no tools, no spend. Posting replies needs Manager access only after a yes.

## (h) Red team
**Strongest honest reason it fails:** *the human part is priced at pennies and shrinking.* Marqii already sells AI-plus-human replies to restaurants at $0.75–2 a review, Reputation.com includes AI replies at $80 a location, and Google is testing free AI suggestions. The "hard review" share of volume is small, so the desk's revenue per location is small unless bundled, and bundles are a crowded white-label market (HOTH, Clicks Geek, Digital Help PH). Single owners are the most-pitched buyers in local business.
**Counter-evidence searches run (2026-10-30):**
- Human review-response price floor (helper-1): found $49/outlet (Social Station) and $0.75–2/review (Marqii): **confirms the low ceiling**.
- "Agency looking for white label partner… restaurants": only suppliers found, **no posted need** (Read stays 1).
- Evidence *for*: 50% of consumers put off by templated replies; same-day expectations tripled in a year; FTC 465.7 and DMCC make careless replies a liability, which is a reason for a human checklist.

## (i) vs Shothik (Read, Trust, Pay)
| | Shothik (Bangla NYC listings) | Hard-Review Desk, route (c) | Why |
|---|---|---|---|
| Read | 1-soft | **Same (1)** | Business inbox, but crowded with white-label offers; single owners are worse (rating-gap pitches every week). |
| Trust | 2/2/1 | **Better (2/2/2)** | The agency approves and holds access; Risk is lower than letting us edit hours. |
| Pay | 1 | **Better (2)** | B2B invoice. |
| Repeat | 1 | **Better (2)** | Reviews arrive weekly; listings change rarely. |

## (j) Intelligence verdict
The reshaped desk is better than the CEO's original (speed + discounts), which was both illegal in part and already free. Repeat is the only step clearly stronger than listings, because reviews keep coming. But the formula's PASS for route (c) hides a pricing truth: the market already values human-touched replies at $0.75–8 each, and the "hard review" slice is too small to carry a business on its own. **What I believe:** the desk is the *retention engine* of a bundle, and listings are its *opener*. Sold together, white-label, to UK-first restaurant agencies with mostly unlicensed portfolios, at $60–90 a location, it is a plausible $1–2k/month line inside 6 months. Sold alone to owners, it is the killed "reply writing" idea in new clothes.
