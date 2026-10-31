STATUS: FINAL

# Part E — Independent critic of `decision.md` (Round 2B)
Companion E, 2026-10-31. No sub-agents. About 75 primary pages fetched (apps.shopify.com app and category pages ≥ 2.5 s apart, no search pages; shopify.dev; shopify.com/editions; community.shopify.dev and community.shopify.com thread JSON; aws.amazon.com). Raw files in /tmp/partE/ (not in repo).
Labels: **VERIFIED** (I opened the primary page) · **VENDOR CLAIM** · **SEARCH-SUMMARY** · **ESTIMATE** (inputs shown) · **NOT FOUND**.

## 0. Verdict in ten lines
1. **Overall: FIX, not KEEP, not REPLACE.** The road (a Shopify app company built on reliability and a fast human) survives. The niche survives, just. **The product pitch, the first-money sprint and the 90-day gates do not survive as written.** Confidence 70%.
2. **Most dangerous flaw: silence.** In the back-in-stock leaf, 182 of 323 apps (56%) have 0 reviews, and page 1 is 24 of 24 Built for Shopify (BFS) apps. In my sample, 16 of 18 apps launched in the last 12 months have 0 reviews (VERIFIED). The plan has no install engine beyond store search and "contact every install", so app #1 most likely joins that majority.
3. **The 10× claim is wrong as stated.** "AI restock plan" is already sold. XFlow (launched 2025-12-01, 70 reviews) offers "restock priorities & suggested quantities"; REZ offers "forecast inventory"; Notify! offers "Sales forecasting" plus an MCP link to Sidekick. Shopify's own Sidekick "can generate your purchase orders" (Spring '26). "Update-proof" is the BFS baseline. Flat, unlimited email is already free on Timesact and Kbite (all VERIFIED).
4. **The developer desk is the weakest part.** The whole official thread is 20 posts and 620 views. No developer asks for outside help; they ask Shopify for an API or an extension. A desk faces the same bottleneck the vendor does (merchants who don't answer), with less trust. The $8k guess needs about 1,600 switched merchants: **ESTIMATE $0–1.5k, likely $0.**
5. **The 90-day gates measure noise.** If the app is submitted on day 42 and the queue is 3–5+ weeks, it has been live 0–27 days by day 90. "≥ 30 installs, ≥ 2 paying" then needs top-5% newcomer performance from day 1.
6. **Single change that most raises the odds:** make **BFS (50 net installs from paid-plan shops + 5 reviews) by about day 150** the one target. Ship alerts-only, with no AI plan, and submit by about day 30. Feed installs by outbound concierge to named merchants. Page 1 and Sidekick both favour BFS apps.
7. **Wrong cuts:** none clearly wrong. Barcode labels (N10) is *not* a better app #1: Delta (free, 5.0, ~180 reviews per 90 days) has already taken the weak-Shopify-app wedge, and its 2026 entrants do no better than N1's. Quote forms (N3) page 1 is also 24 of 24 BFS. The dental test was parked fairly, but the developer desk deserves the same "7-day side test" status, not headline billing.
8. **Build-in risk is higher than "LOW–MED".** Merchants already send back-in-stock emails with a native Shopify Flow template and Shopify Messaging (community threads, 2026). Only the capture form is missing. Call it **MED**.
9. **Halal: OK with three guards.** (a) Defer deposits and get a scholar's ruling first. (b) Refuse haram verticals in the terms of service; Notify! already does. (c) The sprint must disclose who we are and must not claim an app "will break" when the scanner can't know that.
10. Not verified: the Bangladesh payout option, store-search ranking for a new app, installs per review for newcomers, and Upwork demand for migration jobs.

---

## 1. Claim by claim

### Claim 1 — The niche is attackable by a new two-person team → **OVERSTATED (holds only in a weaker form)**
**What the decision says:** demand is "spread over 5 leaders", the category is "among the least-flooded", and REZ shows the way.

**What I found (VERIFIED, all 14 pages of the stock-alerts category, 2026-10-31):**
| Fact | Number |
|---|---|
| Apps in the back-in-stock leaf | 323 |
| …with 0 reviews / < 5 / ≥ 50 / ≥ 1,000 | 182 (56%) / 227 (70%) / 47 / 9 |
| Page 1 (24 apps) carrying BFS | **24 of 24**; the lowest has 16 reviews |
| BFS apps in the leaf / BFS apps below page 4 | 51 / 0 |
| Sample of 27 apps ranked 49–323 (every 10th) launched in the last 12 months | 18, of which **16 have 0 reviews** (max 3) |
| Of those aged 3.5–11 months (n = 12) | 4 reviews in total; 10 at zero |

- **"5 leaders" undercounts.** Nine apps have ≥ 1,000 reviews. The leaf's own leader by reviews is Kbite (5.0★, 4,373), which the decision does not name. `essential-pre-order` (1,346) and `customer-back-in-stock-alert-user-notification-app` (1,458) are also big.
- **"Least-flooded" is true of the *pre-orders* leaf (121 apps, ~80 launches a year), not of the back-in-stock leaf where the product starts.** Part A's own CSV gives that leaf 323 apps and ~381 launches a year (flood quintile 2 of 5). My sample suggests ~190 live apps launched in the last 12 months (ESTIMATE: 18 of 27 sampled × 275 apps ranked 49–323, plus ~7 in the top 48).
- **REZ is a survivor outlier, not a base rate.** The best other entrants of 2025–26 got:

  | App | Launched | Reviews |
  |---|---|---|
  | XFlow | 2025-12-01 | 70 |
  | Out of Stock Labs | 2026-02-27 | 40 |
  | alertme | 2025-07-16 | 39 |
  | Dotsy | 2025-08-14 | 33 |
  | AOV AI Pre-order | 2026-03-25 | 26 |
  | Stockful | 2026-03-27 | 19 |
  | Notify Me (-2) | 2026-05-22 | 16 |

  That is ≈ 3–6 reviews a month for the top ~5% of newcomers. REZ did ≈ 25 a month in months 1–4 (C, VERIFIED), and it launched before the 2026 AI-clone flood and the July 2026 review purge.
- **What still holds:**
  - demand is real and rising (A: D90 1,241 + 1,591);
  - 2026 entrants *can* reach page 1 through BFS: AOV AI with 26 reviews and Notify Me (-2) with 16 did so within 5–7 months (VERIFIED);
  - all 6 leaders are BFS, so page 1 is reachable only through BFS.

**Verdict:** attackable, but by a BFS race, not by a better feature. **Evidence that would change my mind:** after approval, the first 14 days bring ≥ 10 installs from store search alone (no outreach).

### Claim 2 — The 10× bundle is better and not already offered → **WRONG on "not offered"; the real edge is about 1.2×**
**Competitor feature check (VERIFIED app pages, 2026-10-31; quotes < 15 words):**
| App (rating / reviews) | Restock planning or forecasting | "Update-proof" / set-up | Pricing |
|---|---|---|---|
| Notify! (4.9 / 3,974) | structured features "Sales forecasting", "Customer demand", "Inventory reports"; "forecast inventory"; "use our MCP (Integrated with Sidekick)" | BFS (so a theme app extension + status on the homepage) | Free (10 alerts); $9.90 for 500 alerts; $0.20 per pre-order over the limit |
| STOQ (5.0 / 3,888) | "Customer demand", "Inventory reports"; Klaviyo sync | "24*7 help" | Free (30 emails); $10; $0.025 per SMS |
| Timesact (5.0 / 2,127) | "Advanced analytics" | "Guided Video Call: To set up" | Free with "UNLIMITED email sending"; "NO transaction fees" |
| Globo (4.9 / 1,977) | — | a review thanks support for a fix after a "new Theme Update" | Free (100 emails); $9.90 |
| REZ (5.0 / 1,638) | "Track demand, forecast inventory, and measure revenue" | "onboard support" | Free (30 emails); $4.99 |
| Kbite (5.0 / 4,373) | "Product analytic to know most in-demand products" | — | Free, unlimited subscribers; from $5 |
| **XFlow (5.0 / 70; launched 2025-12-01)** | **"restock priorities & suggested quantities"**; "plan restocks & track recovered sales" | Works with Shopify Flow | — |
| **Prediko (4.9 / 266; forecasting app)** | AI demand forecasting, reorder alerts and purchase orders, MCP agent | — | from $49 |

- **Shopify itself (VERIFIED, Editions pages):**
  - Winter '26: Sidekick builds custom apps, and its own example is "Create an app that recommends which products I need to reorder." "Sidekick app extensions" let apps expose their data to Sidekick.
  - Spring '26: "Smarter purchase order workflows… Sidekick… can generate your purchase orders."
- **Is "restock planning from waitlists" standard?** The *demand report* is standard: 5 of 6 leaders list "Customer demand". *Suggested quantities* already exist in XFlow. Turning waitlists into purchase orders is one step away for anyone with Notify!'s MCP plus Sidekick's purchase-order generation. A search for an app that auto-creates purchase orders from waitlists found none (SEARCH-SUMMARY), so a thin slice remains. It is copyable in a week.
- **"Update-proof"** is a requirement, not an edge. BFS rule 3.2.1: storefront apps "need to use theme app extensions". Rule 4.2.3: an app is rejected if it fails to show its app-embed status on its homepage (VERIFIED shopify.dev). All 6 leaders are BFS. Shopify's Fall '26 Edition adds, "coming soon", a native monitor for "status of each app extension" (VERIFIED).
- **Can a daily storefront check work at scale?** It is legal for an installed app's own merchants, but fragile:
  - the button shows only on sold-out products, so the checker must find a sold-out URL each day;
  - password-protected stores (development stores, pre-launch stores) show only the password page (common knowledge; not verified this session);
  - bot protection and theme variety add false alarms.

  The robust way is a beacon from the embed itself plus `app.extensions()` status, which incumbents already must show. So the check is a nice support habit, not a moat.
- **"Flat, honest pricing" and "human within hours"** are already sold: Timesact and Kbite have generous free plans; Timesact has video-call set-up; REZ has concierge. What the complaints show (A §7: broke after an update ×10, too expensive ×7) is a *service* gap at some vendors, not a missing feature.
- **The name is taken.** "Restock Radar Alerts" (handle `restock-radar-8`, Istanbul) launched 2026-10-07 with a back-in-stock form and "monitor demand in reports", and has 0 reviews (VERIFIED). App Store rule 4.1.2 now requires a unique name (VERIFIED, staff post 2026-07-15).

**Verdict:** the positioning is the REZ play (concierge + price + reliability), a 1.2–1.5× improvement at best. **Fix:** drop the AI restock plan from v1 and from the pitch. **Evidence that would change my mind:** ≥ 5 of 15 merchants who use Notify!, REZ or XFlow say they would switch for waitlist-to-PO, unprompted by us.

### Claim 3 — Build-in risk is low → **OVERSTATED for back-in-stock; holds for pre-orders**
- **Shopify Flow already does back-in-stock sends.**
  - A merchant runs back-in-stock emails on Flow ("everything works correctly"). A reply says "there is already a back in stock email template" and links a Flow template (community.shopify.com t/592157, 2026-03-15/16, VERIFIED thread JSON). The template id decodes to 2025-02-21 if it is a UUIDv7 (ESTIMATE).
  - The limit: "Send marketing email" only reaches marketing-subscribed customers (t/581666, 2026-01-02, VERIFIED).
  - What is missing natively is the storefront capture form. Shopify Forms (Shopify's own app) plus Flow is one product decision away.
- **Editions:** no Summer '26 Edition exists (shopify.com/editions/summer2026 → HTTP 404, VERIFIED). The 2026 Editions are Winter, Spring and Fall. None ships a native back-in-stock button or pre-order button (B, and my keyword search of all three). Spring '26 only makes "back-in-stock updates reach your online store faster".
- **Pre-orders:** rails only ("Due on fulfillment terms for pre-orders", Winter '26, VERIFIED). B holds.
- **Sidekick** can generate a merchant's own reorder app (Winter '26) and purchase orders (Spring '26). That eats the AI half of the product, not the button.

**Verdict:** MED for back-in-stock (Flow + Messaging + Forms are all native; only the glue is missing); LOW for pre-orders. **Week-1 observation that would prove me wrong:** the native Flow template cannot be found in a fresh development store's Flow template library.

### Claim 4 — The script-tag sprint as first money → **MOSTLY WRONG as a developer desk; a small merchant-side side line survives**
**Deadline:** real (VERIFIED, changelog posted 2026-08-24, updated 2026-10-02). Creates and updates have been blocked since 2026-10-01; injection stops 2027-03-01; "pinning won't defer it".

**Will developers pay an unknown Dhaka desk per merchant?** Probably not. Evidence from the official thread (t/37108, VERIFIED JSON: 20 posts, 620 views, 2026-08-24 → 10-29):
- Buyers' signals: "thousands of merchants using ScriptTags" (#2); "thousands of customers that aren't very technical" (#5); "70-75% of our userbase on Script Tag" (#18).
- What they ask for: a programmatic path or an extension from Shopify (#2, #4, #5, #18). **No one mentions outsourcing.**
- Many leftover tags sit on stores "closed, frozen or paused" (#10, #11, #16).
- Reaching merchants is "impossible most of the time" (#19); vendors "sent multiple emails… mostly no response" (t/37965).
- **The logic flaw:** the fix is already one click, via Shopify's documented deep link that opens the theme editor with the embed on (VERIFIED, storefront doc, step 2). A desk using collaborator access needs the merchant to *approve a request*. That is the same attention bottleneck plus a stranger's request. Collaborator requests now show the requester's org details (Fall '26, VERIFIED), which is honest but no more persuasive. Sharing merchant contact data with a subcontractor is a privacy and contract question for the vendor (ESTIMATE; Partner Agreement clause not checked).

**Does Shopify kill it?**
- Partly. Shopify **dropped** the planned install-warning banner within 3 days of pushback (#13; doc: "decided not to show this banner for now", VERIFIED). That shows Shopify responds to partners, so a later bulk-enable path or date change is plausible.
- One developer says "someone from Shopify bulk-migrate[d] my older merchants" in the past (t/37965, VENDOR CLAIM).
- The Fall '26 extension-status monitor is "coming soon" (VERIFIED). It shows status but doesn't toggle embeds.

**Do merchants feel the deadline?** Not yet. Three counter-searches (SEARCH-SUMMARY) found only an agency blog (OnTap Group; host blocked here) and a developer blog. There is no merchant forum thread and no scanner tool. With the banner dropped, merchants won't learn of it until their widgets stop. Part D's own rule applies: an unaware market is a cost for an unknown seller.

**Is the public scanner legal and polite?**
- Legal: yes, if it fetches only the one public page the user submits (the same HTML any browser gets), rate-limited, with a generic UA.
- The risk is *accuracy*. A store can carry a leftover tag *and* an active embed, and the scanner cannot see the merchant's embed settings. Labelling a named vendor's app "will break" can be false. That is a deception and defamation risk. Say "loads a legacy script tag; ask your vendor" instead.

**The money guess, recomputed (ESTIMATE):**
- The decision's $8k needs 2 clients × 800 switches.
- A large vendor in the thread has "thousands" of affected merchants. Say 2,000, of which ~50% are dead or frozen (#10, #11, #16) → ~1,000 live. Assume the vendor's own deep-link emails convert some of these, and a desk reaches 10–20% of the rest → 100–200 switches × $5 = **$500–1,000 per client**, *if* a client signs.
- P(≥ 1 developer client by day 45) ≈ 10–15% (judgment: zero outsourcing signals in the thread).
- Merchant audits at $79 to an unaware market: likely 0–5.
- **Expected value ≈ $0–1.5k, median $0** (vs the decision's $10.4k headline and $0–2k floor).

**What survives:** a merchant-side Upwork offer. Theme-code moves for admin-created custom apps, which "can't use app extensions" (VERIFIED, storefront doc), are a real job no app can do. So is switching from abandoned apps. Upwork demand: NOT VERIFIED (not fetched).

**Fix:** demote the developer desk to a 7-day test. Gate: 3 named developers agree to a paid pilot, or stop. Keep the Upwork listing.

**Evidence that would change my mind:** ≥ 2 developers from the thread or cold email agree to a paid pilot within 14 days.

### Claim 5 — A non-coder builds, passes review and maintains it in ~6 weeks → **BUILD plausible; REVIEW and MAINTENANCE under-planned**
- **Build:** an alerts-only theme app extension plus webhooks plus email is plausible with Shopify's AI Toolkit and AI self-review (C, VERIFIED staff post 2026-04-20). This is an ESTIMATE; no rejection-rate data exists (NOT FOUND, as C found too).
- **Review queue (late 2026; VERIFIED forum self-reports, t/33472):**
  - Apr–May: 5–8+ weeks "assigning a reviewer";
  - 2026-08-26: approved in 3 weeks after 2 rounds;
  - 2026-10-26: submitted 09-22, "in review" 10-01, still in review 10-26 (≥ 5 weeks);
  - a resubmission goes to the back of the line.

  Submitting on day 42 (12 Dec) lands in the holiday period, so expect approval between about day 63 and day 112.
- **An extra gate the plan omits:** storing shopper emails is protected customer data at **level 2** (email/name fields). That means a separate access request plus "data protection reviews" (VERIFIED shopify.dev). Timing: NOT FOUND.
- **Email cost:** Amazon SES costs **$0.16 per 1,000 emails** (Essentials plan, VERIFIED pricing page). 1M alerts a month ≈ $160. Cost is not the risk. Sender authentication, production-access approval and inbox placement are (ESTIMATE, not tested).
- **What breaks first (ESTIMATE, ranked):**
  1. theme variety: the button placement and styling on hundreds of themes. This is the incumbents' daily support work, and the very complaint we promise to fix;
  2. email deliverability for merchants' own sender domains (REZ sells "Custom email domain" on its paid tier);
  3. the queue and rejection loop;
  4. the CEO's hours, split three ways in days 1–45 (app build + scanner + developer sales).

  Forced platform changes keep coming: expiring tokens 2027-01-01, Shopify App Pricing migration, yearly BFS re-review (B and C, VERIFIED).

**Fix:** cut the v1 scope to alerts only and submit by about day 30. Request level-2 data access early. Use Shopify Flow/Messaging as an optional sender, so merchants who want it send from their own domain. **Week-1 observation that would prove me wrong:** the AI Toolkit's self-review passes a working alerts build in a development store by day 21.

### Claim 6 — The 90-day numbers → **SELF-DECEIVING in timing, lenient in the stop rule**
Recomputed (ESTIMATE; inputs: queue from t/33472, newcomer data above, A's installs-per-review floor of ~8, C's 0–2 organic installs a week for a zero-review app [SEARCH-SUMMARY]):

| Case | Live on store | Days live by day 90 | Installs by day 90 (way 1: organic 0–2/wk) | Installs (way 2: top-5% newcomer 3–5 reviews/mo × 8) |
|---|---|---|---|---|
| Fast (3 wk, one pass) | ~day 63 | 27 | 0–8 | ~20–35 |
| Typical (5 wk, one pass) | ~day 77 | 13 | 0–4 | ~10–17 |
| One rejection (+3–5 wk) | day 84–112 | 0–6 | 0 | 0–7 |

- **≥ 30 installs by day 90** needs the fast case *and* top-5% performance (way 2's upper end). Both ways agree it is unlikely without outbound: ESTIMATE 10–20%.
- **≥ 2 paying by day 90** fights generous free tiers. Kbite has unlimited subscribers free, Timesact unlimited email free, and REZ/STOQ give 30 emails free. A new small store rarely exceeds a free tier in its first month (ESTIMATE).
- **≥ 3 reviews** is the only realistic item, through concierge plus a neutral ask (REZ's first review came 16 days after launch, C).
- **Failure at day 90 triggers "diagnose", not stop,** so the gate cannot stop anything. The day-150 rule ("< 60 installs **AND** < 5 paying") continues on 60 installs with 0 paying.
- Switching to N10 at day 150 restarts the clock: a 6-week build plus a 3–5-week queue puts it live around day 220+.
- **Month-12 money, recomputed:**
  - good 2026 newcomer: 3–5 reviews/mo × 8 ≈ 24–40 installs/mo × ~10 months ≈ 240–400 installs;
  - ~60% still installed (ESTIMATE) → 145–240;
  - × 15% paid → 22–36 paying × $5–10 ≈ **$110–360 MRR**;
  - the decision's ~$1,000 assumes the #4 app's pace, which among visible entrants since mid-2024 only REZ clearly reached (SMART Preorder, launched 2024-06-10, has 654 reviews; its current pace was not checked).

**Fix:** replace the gates with these.

| When | Gate |
|---|---|
| Day 30 | Submitted (alerts only) |
| Day 60 | ≥ 150 named merchants contacted through honest outreach |
| Day 120 | ≥ 25 net installs and ≥ 3 reviews |
| Day 180 | BFS applied (≥ 50 net installs on paid-plan shops + 5 reviews) **OR stop the niche** |
| Paying | not a gate before day 180 |

### Claim 7 — Wrong cuts → **no clear wrong cut; one mis-weighting**
| Option | For | Against (VERIFIED unless labelled) | Verdict |
|---|---|---|---|
| **N10 barcode/price labels** | admin-only, so no shopper data, no email and no theme breakage; page 1 admits non-BFS apps with 4–8 reviews; only 1 app ≥ 500 reviews; Shopify's own app is still 2.3★ (475) and still drawing reviews (Sep–Oct 2026) | **Delta (free, 5.0, 626, launched 2025-10-24) already took the weak-Shopify wedge**, with 10 reviews on Oct 27–31 alone; its 2026 entrants (Airo 37, Skywalk 11, LabelCraft 5) do no better than N1's; 77 of 121 apps at 0 reviews; demand ≈ ¼ of N1; the free leader caps price | Not better as #1. A sensible app #2 or fallback |
| **N3 quote/wholesale forms** | B2B lane; Shopify Forms is limited | quote leaf page 1 is 24 of 24 BFS; Shopify Forms builds in at MED (B) | Not better |
| **N9 done-for-you migration** | strongest human edge (A) | a service, not an app; Shopify's Store Migration app covers self-serve (A, SEARCH-SUMMARY) | A good Upwork line, not app #1 |
| **Dental/med-spa desk (D)** | $0, 7-day test, first $ in 1–2 months | odds ≈ 10% (D); HIPAA blast radius; Birdeye/Podium/Weave | Parked fairly. **But the developer desk deserves the same "side test" status**: its evidence is thinner than D's |
| **Missed by A–C** | XFlow's route: plug into Shopify Flow so the native sender does the sending. It is the best non-REZ 2025–26 entrant (70 reviews, BFS) | one data point | Copy the design choice, not the niche |

### Claim 8 — Halal → **OK with guards**
- **Pre-order deposits.**
  - AAOIFI has a standard on 'arbun (SS 53) and on salam (SS 10). Classical salam needs the price paid promptly; istisna'a (made to order) allows deferred price (SEARCH-SUMMARY: AAOIFI index pages, SBP circulars; full texts are members-only).
  - A deposit pre-order of goods the merchant does not yet own is a grey zone. It is the merchant's contract, not ours, and Shopify's checkout holds the money. Still: default to full-payment or refundable-deposit modes, never late fees or financing, and get a scholar's ruling **before** building pre-orders. The plan already defers pre-orders, so this is not urgent.
- **Stores selling haram goods.** A neutral button is a general tool. A *restock planner* for a liquor store actively helps a haram trade grow, which is deeper aid. Notify! already refuses some verticals ("adult", alcohol: A). Fix: an exclusion list in the terms (alcohol, adult, gambling, interest finance), and no concierge set-up for those stores.
- **Deception in the sprint.**
  - (a) Every merchant contact names our firm, Dhaka, and the vendor we work for. Collaborator requests now show org details (VERIFIED).
  - (b) The scanner must not say "will break" when it can't see embed settings.
  - (c) "Point them to a replacement app (later, ours)" needs an explicit "this is our app" disclosure, and the free fix (enable the embed) must come first.

---

## 2. Steelman (the best case for decision.md)
- Demand is the largest outside platform-owned leaves and still rising (A).
- REZ proves an emerging-market team can reach the top 5 with concierge and price.
- 2026 entrants (AOV AI, Notify Me (-2)) reached BFS and page 1 within 5–7 months with only 16–26 reviews, so the door is narrow but open.
- The plan already has the right shape:
  - the payout gate on day 1;
  - low blast radius first;
  - pre-orders deferred;
  - a stop rule at day 150;
  - support as the review engine (59–73% of 5★ reviews mention support: A, C).
- The script-tag date is real, the scanner is cheap, and it teaches app embeds.

If REZ's 2025 path is still open in 2026, the decision is roughly right. **My objection is to the pitch, the sprint and the gates, not the road.**

## 3. Final verdict
| Part | Verdict | Exact fix |
|---|---|---|
| Company (Shopify apps, reliable + human) | **KEEP** | Unchanged; the payout check stays the day-1 gate |
| Niche N1 back-in-stock (then pre-orders) | **KEEP, re-framed** | Drop "least-flooded" and "5 leaders"; state "9 leaders ≥ 1,000 reviews; page 1 is BFS-only; win = BFS race" |
| Product "10×" | **FIX** | v1 = alerts only + concierge styling + honest price + embed status/beacon. Drop the AI restock plan (XFlow, REZ, Notify! and Sidekick have it). New name (rule 4.1.2; "Restock Radar" is taken) |
| First money (developer desk) | **FIX → side test** | 7-day test: 3 developers agree to a paid pilot, or stop. The primary first-money line = the Upwork merchant offer (custom-app script moves, embed set-up, abandoned-app swaps). Scanner wording: "legacy tag found", never "will break" |
| 90-day gates | **FIX** | Day 30 submitted; day 120 ≥ 25 installs + ≥ 3 reviews; day 180 BFS applied OR stop the niche (§1 claim 6) |
| Halal | **FIX (small)** | terms-of-service exclusion list; scholar ruling before deposits; disclosure script for every contact |

**Confidence:** 70% that these fixes are needed. 55% that N1 with a BFS race beats every carded alternative.

**Single change that most raises the odds:** re-aim days 1–180 at **BFS for an alerts-only app**, fed by outbound concierge installs. Drop "AI restock plan + developer desk". BFS controls page 1 (24 of 24) and Sidekick ranking ("Built for Shopify apps receiving higher prioritization", Winter '26, VERIFIED), and needs only 50 net installs from paid-plan shops (free installs count) plus 5 reviews (VERIFIED).

**Week-1 observation that would prove the KEEP parts wrong:** the day-1 Partner Payouts screenshot shows no Bangladesh bank/wire option, or 30 outreach messages to merchants who use a script-tag-era alert app (found by the scanner) get 0 replies.

---

## 4. Self-check (Step 3)
**Re-opened my 3 most decisive sources (2026-10-31, second fetch, /tmp/partE/recheck):**
1. **Stock-alerts category page 1:** 24 cards, **24 BFS**, lowest 16 reviews. **Holds.**
2. **XFlow listing:** still says "restock priorities & suggested quantities", 5.0★ / 70 reviews. **Holds:** the AI restock plan is already sold.
3. **Official thread t/37108:** 20 posts, 620 views, last post 2026-10-29. Words like agency, outsource, hire, contractor or freelancer: **0 matches**. **Holds:** there is no visible demand for outside help.

**Decisive numbers recomputed a second way:**
- **Day-90 installs:** organic rate × days live gives 0–8. Newcomer review pace × installs per review gives 0–35 in the best case. Both put ≥ 30 out of reach without outbound plus fast approval (claim 6 table).
- **Zero-review share:** counted by "0 total reviews" → 182, and by "no star rating shown" → 182. Match.

**Counter-evidence searches run:**
- *Niche (2):* (1) apps turning waitlists into reorder quantities or purchase orders: found XFlow, BackSoon's "decide what to reorder", and AMP's "demand insights"; no auto-PO app (SEARCH-SUMMARY). (2) native Shopify Flow/Email back-in-stock: found the community Flow template threads (then VERIFIED by JSON).
- *Sprint (3):* (1) migration services or the deadline: only shopify.dev and the OnTap blog; (2) "script tag" audit or scanner tools: none, only blogs; (3) merchant forum worry: none (all SEARCH-SUMMARY).

**Where I might be wrong:**
- Category-page order is only one surface. App Store *search* ranking (the main install source) could not be checked: search pages are off-limits under robots.txt.
- My launch-rate estimate (~190/yr) comes from 27 sampled pages.
- REZ-style concierge may still beat the base rate by more than I assume.

## 5. What I could not verify
- The Bangladesh payout option (dashboard only).
- How a new app ranks in App Store search.
- Real installs per review for newcomers (StoreLeads' ~8 is for mature apps).
- Timing of the protected-customer-data (level 2) review.
- Whether the native Flow back-in-stock template is listed for all merchants: the admin link was seen only in a forum post (NOT VERIFIED in an admin).
- Upwork demand for script-tag or app-embed jobs (not fetched).
- The OnTap Group blog (host blocked in this session).
- The full AAOIFI SS 53 text (members only).
- Password-page and bot-protection rates on storefronts (not tested).

## 6. Sources opened (all 2026-10-31)
- **apps.shopify.com app pages:** preorder-back-in-stock, back-in-stock-restock-alerts, timesact-discount-pre-order, pre-order-pro, rez-back-in-stock-notify-me, cartbite, prediko, xflow, restock-radar-8, retail-barcode-labels (+ reviews), delta-retail-barcode (+ reviews), plus 47 smaller apps for launch dates.
- **Category pages:** stock-alerts pages 1–14; sku-and-barcodes pages 1–6; pricing-quotes page 1.
- **shopify.com/editions:** winter2026, spring2026, fall2026; summer2026 (404).
- **shopify.dev:**
  - built-for-shopify/requirements.md;
  - theme-app-extensions/configuration.md;
  - protected-customer-data.md;
  - changelog online-store-script-tags-deprecation.md;
  - script-tag-deprecation/storefront.md.
- **community.shopify.dev:** t/37108, t/37965, t/33472 (+ posts 21–36), t/36048.
- **community.shopify.com:** t/592157, t/581666.
- **aws.amazon.com/ses/pricing.**

## Appendix — evidence notes as collected
- Read decision.md, A §0–11, B §0–4/§6–8, C §0–1/§4–5/§7–11, D §0/§9, A CSVs.
- Desk finding from A's own CSV (no fetch): the back-in-stock leaf (stock-alerts) has 323 apps and ~381 launches/yr (flood quintile 2 of 5), led by Kbite (4,373 reviews, ~450 per 90 d), an app the decision's "5 leaders" omits. "Least-flooded" is true of the pre-orders leaf (121 apps, ~80/yr), not of the back-in-stock leaf the product starts in.
- Claim 2 evidence (VERIFIED, app pages fetched 2026-10-31 to /tmp/partE/raw): Notify! (4.9/3,974) lists "Sales forecasting", "Customer demand", "Inventory reports" + "forecast inventory" + "use our MCP (Integrated with Sidekick)"; STOQ (5.0/3,888) "Customer demand", "Inventory reports", Klaviyo sync; Timesact (5.0/2,127) free plan "UNLIMITED email sending", "NO transaction fees", guided video-call set-up; Globo (4.9/1,977) review text praises fix after "new Theme Update"; REZ (5.0/1,638) "Track demand, forecast inventory, and measure revenue"; Kbite (5.0/4,373) free unlimited subscribers, "Product analytic to know most in-demand products", paid from $5. Prediko (4.9/266, from $49, launched 2023-08-11): AI demand forecasting + purchase orders + MCP agent.
- Editions (VERIFIED shopify.com/editions, fetched 2026-10-31): Winter '26 Sidekick example "Create an app that recommends which products I need to reorder" + "/inventory-check"; Sidekick app extensions (apps expose data to Sidekick). Spring '26 "Smarter purchase order workflows … Sidekick can generate your purchase orders". Fall '26 "Coming soon, monitor the status of each app extension in app settings to spot issues early and contact the developer directly"; collaborator requests now show the org's details. /editions/summer2026 = HTTP 404 (no Summer '26 Edition).
- Newcomer evidence (VERIFIED, all 14 pages of apps.shopify.com/categories/marketing-and-conversion-upsell-and-bundles-stock-alerts, 323 apps, fetched 2026-10-31; note `?sort_by=newest` is now ignored, default order shown): 182 apps (56%) have 0 reviews; 227 (70%) < 5; 47 (15%) ≥ 50; median 0. Page 1 = 24/24 BFS; 51 BFS apps in the leaf; no BFS app below page 4. Sample of 27 apps ranked 49–323 (every 10th): 19 launched 2025-10→2026-10, 17 of them at 0 reviews, max 3. Best recent entrants in the top 48: alertme (2025-07-16, 39), dotsy (2025-08-14, 33), xflow (2025-12-01, 70), remind-stock (2026-01-09, 10), outofstocklabs (2026-02-27, 40), aov-ai-pre-order (2026-03-25, 26), stockful (2026-03-27, 19), notify-me-back-in-stock-2 (2026-05-22, 16), griffin (2026-07-17, 2). "Restock Radar Alerts" (handle restock-radar-8, FiDevStudio, Istanbul) launched 2026-10-07: back-in-stock form + "monitor demand in reports", 0 reviews.
- Flow (VERIFIED community.shopify.com JSON, t/592157 2026-03-15 and t/581666 2026-01-02): merchants already send back-in-stock emails with Shopify Flow + Messaging; a partner links a native Flow template ("search=back+in+stock", template id decodes to 2025-02-21 if UUIDv7: ESTIMATE); limit: "Send marketing email" reaches only marketing-subscribed customers; capture form is DIY (tags via webhooks).
- BFS req (VERIFIED shopify.dev built-for-shopify/requirements.md): storefront apps "need to use theme app extensions" (3.2.1); rejection if an app embed's status is not shown on the app homepage via app.extensions() (4.2.3). So every BFS competitor already has the update-safe build and an "is it on?" status.
- Protected customer data (VERIFIED shopify.dev protected-customer-data.md): email/name fields = level 2: request access + "Participate in data protection reviews".
- Script tags (VERIFIED shopify.dev changelog .md, posted 2026-08-24, updated 2026-10-02; storefront doc): fix = app embed via a one-click deep link; embed "works on vintage themes"; Shopify dropped the planned merchant install-warning banner ("decided not to show this banner for now"). Admin-created custom apps cannot use extensions → script must move into theme code (real merchant-side job).
- Official thread t/37108 (VERIFIED JSON): 20 posts, 620 views, 2026-08-24→10-29. Buyers' signals: #2 "thousands of merchants", #5 "thousands of customers", #18 "70-75% of our userbase". Against: #10/#11/#16 leftover tags on stores "closed, frozen or paused"; #13 staff dropped install warning after pushback (Shopify does respond); developers ask for an API/extension, nobody mentions hiring outside help; #17 merchants "busy running a store", #19 reaching them is "impossible most of the time". Thread t/37965: a dev says "someone from Shopify bulk-migrate[d] my older merchants" in the past; another "sent multiple emails … mostly no response".
- Sprint counter-searches (SEARCH-SUMMARY, 3 searches 2026-10-31): only OnTap Group (agency blog, host blocked here) and a zectox dev blog; no scanner tool, no merchant forum thread worried about the date.
- Review queue (VERIFIED forum posts, community.shopify.dev t/33472, staff post 2026-04-20 + 36 replies): Apr–May 2026 devs report 5–8+ weeks "assigning a reviewer"; 2026-08-26 one dev approved in 3 weeks after 2 rounds; 2026-10-26 a dev submitted 2026-09-22, "in review" 10-01, still in review 10-26 (≥ 5 weeks). Resubmission goes to the back of the line (staff + devs). Self-reports.
- App Store rule 4.1.2 unique app name (VERIFIED t/36048, 2026-07-15) — "Restock Radar" is already a live listing name (Restock Radar Alerts, 2026-10-07).
- Email cost (VERIFIED aws.amazon.com/ses/pricing 2026-10-31): $0.16 per 1,000 emails (Essentials, 0–10M/mo). Cost is not the risk; deliverability/sender set-up is.
- Leaf comparison (VERIFIED category pages 2026-10-31): back-in-stock leaf 323 apps, 14 with ≥ 500 reviews (9 with ≥ 1,000), page 1 24/24 BFS (lowest 16 reviews). SKU & barcodes leaf 121 apps: 77 at 0, 13 ≥ 50, only 1 ≥ 500 (Delta 626); page 1 16/24 BFS, incl. non-BFS apps with 5–15 reviews (labelcraft 5). Pricing-quotes leaf page 1: 24/24 BFS.
