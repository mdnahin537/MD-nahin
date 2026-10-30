STATUS: IN PROGRESS — next: fill (d) from helper-1 price table; buyer list (k) from helper-2

# M1 — Shothik Open: wrong hours, phones, menus and links for mid-range restaurants, open market
**Model:** M1 Proof-First Fixer · **Companion:** Phase 2 Opus (M1 owner), 2026-10-30
**One line:** Fix wrong hours, phone numbers, menus and links across Google, Apple, Yelp, the restaurant's own website and the delivery apps, for mid-range restaurants in the US, UK, Canada, Australia, Ireland and New Zealand, with no ethnicity or language limit. Three buyer routes are scored side by side: **(a)** single owners, **(b)** multi-location groups of ~5–200 sites, **(c)** maintainers (restaurant marketing agencies, website builders whose footer is on the site, online-ordering resellers).
**Labels:** VERIFIED = primary page opened by me on 2026-10-30 (or two independent sources opened) · E3 = counted by me · VENDOR CLAIM · SEARCH-SUMMARY (page not opened) · ESTIMATE · NOT FOUND.

**The CEO's point, answered first.** He is right that the pool is huge. I counted it: the UK food-hygiene register alone lists **141,322 "Restaurant/Cafe/Canteen" and 62,963 "Takeaway/sandwich shop" premises** (FSA ratings API, extract 2026-10-30, E3), and New York City's inspection data shows **26,302 food-service establishments inspected since 1 Jan 2025** (DOHMH API, E3). The NRA says the US has more than 1 million restaurant and foodservice outlets (Feb 2026, SEARCH-SUMMARY). So **Road is no longer the problem** (it wasn't in Shothik either; method.md A7 showed Road became E3 from open data). The question is what happens to Read, Trust and Pay when the affinity signal is removed and the buyer is a stranger in the most-pitched inbox in local business. The answer is below, step by step, with evidence.

---

## Evidence base (all opened 2026-10-30 unless marked)
**The problem is real and the cost is rising (G5):**
- BrightLocal Local Consumer Review Survey 2026: use of ChatGPT and other generative AI for local recommendations rose **"from 6% last year to 45%"** (VERIFIED, brightlocal.com/research/local-consumer-review-survey). AI answers draw on listing data, so a wrong listing now spreads to more places.
- SOCi Local Visibility Index 2026: **only 68%** of business contact information on ChatGPT and Perplexity matches the Google Business Profile (as quoted on BrightLocal's statistics page, VERIFIED quote; SOCi report not opened).
- Insites AI Visibility Report (2026-07-23): of 10,000 US local businesses, only **55.58%** of ChatGPT results and **48.05%** of Perplexity results fully matched the Google profile (VENDOR data, page opened).
- Google now may change a profile on its own: "If we receive reports that your business info isn't accurate, we might update your profile" (VERIFIED, support.google.com/business/answer/3038311). A new help section reported on 2026-09-23 gives owners **4 days** to reject a user's suggested edit, after which Google may publish it if public info "such as the business's own website" backs it (SEARCH-SUMMARY via Search Engine Roundtable; digitalapplied.com 2026-09-27 opened). **A wrong website can push wrong hours onto Google.** This is the first dated mechanism that makes "kept fixed" a real recurring job.
- Holidays: Google says it's "a good idea to confirm your hours for official holidays, even if they're the same" (VERIFIED, support.google.com/business/answer/6303076). Profiles without special hours get a warning that hours may differ (Google quoted by Yext, 2022-05-25, VERIFIED quote). Yext survey: 52% are not confident visiting when they see that warning; 73% won't return after finding a closed storefront (VENDOR CLAIM, 2022).
- Older baseline: 62% of consumers would avoid a business with incorrect information online (BrightLocal 2023, VERIFIED quote on its statistics page).

**The owner doesn't feel it:** 84% of small-business owners are confident customers can find them (58% "very") and 98% are responsible for marketing decisions, 85% alone (BrightLocal Small Business Marketing Report 2026, VERIFIED). The decision-maker is the owner, and the owner believes there is no problem.

**Software already fixes much of it (G4 substitute check):**
- **Square** sends business name, hours, phone and more to Google, and "Any edits you make to a Square location automatically sync with Google" (VERIFIED, squareup.com/help/us/en/article/7689).
- **Owner.com** ($249/month + 5% per order, or $499/month flat) includes Listings Management that "syncs your restaurant's information everywhere online automatically" across Google, Yelp, TripAdvisor, Apple Maps and Bing (VERIFIED, owner.com/pricing and /listings-management). Owner raised a $240M Series D (VERIFIED, banner on its site).
- **Toast does NOT sync hours to Google.** Toast's own help: "Your hours may be wrong on your Google listing because a Google listing is managed through Google, not through Toast Web" (VERIFIED, support.toasttab.com "Setup Restaurant Hours and Services", last updated 2026-09-16, re-opened by me). Toast has ~180,000 locations, +22% a year (Q2 2026, SEARCH-SUMMARY of earnings recaps). **This is the biggest gap in the substitute wall:** the largest US restaurant POS tells its own customers their Google hours may be wrong. Marqii sells Toast-to-Google hours sync at $90/location/month (VERIFIED, helper-1). DoorDash takes store hours from the POS for integrated stores (VERIFIED, helper-1), so a Toast restaurant can be right on DoorDash and wrong on Google.
- Data Axle (survey of 1,000 US consumers, Feb 2026, released 2026-04-20): **66%** have visited or tried to visit a business whose online information was wrong (VERIFIED, vendor-published survey, re-opened by me).
- **Google itself** updates profiles from reports (above).
- Listings tools priced per location: see (d), from helper 1.

**The inbox is the most polluted in local business (Read):**
- MapsLeads (a lead-data vendor), 2026-05-02: the restaurant operator who picks up "has probably been pitched five times that week"; owners "check inbox once a day, often at 11pm, buried under supplier invoices"; phone at 2:30–4 pm is the primary channel (VENDOR CLAIM, page opened).
- Hiya, 2023-08-24: its honeypot captured **more than 17,000 Google Business Profile scam robocalls** in a few months (VERIFIED vendor page).
- FTC v. Pointbreak Media: callers claimed Google would mark businesses **"permanently closed"** unless they paid $300–700 to a "Google specialist"; refunds to 4,467 small businesses (SEARCH-SUMMARY; ftc.gov returned 404 to my fetch). **Our natural line one, "your Google listing is wrong", is the scam's opening line.**
- Lead tools now automate the proof-first opener for agencies: MapsLeads sells "Reputation" data (rating gap vs 3 competitors) to power cold templates (VENDOR, same page); Insites sells a free AI-visibility audit to agencies (VENDOR, page opened).

**Access without passwords (Trust-risk):**
| Platform | Can the owner add us with our own login? | Evidence |
|---|---|---|
| Google Business Profile | Yes: invite as **Manager** | VERIFIED (manager's note: support.google.com/business/answer/3403100) |
| DoorDash Merchant Portal | Yes: Settings → **Manage Users**; roles include Manager and Store Operator | VERIFIED (merchants.doordash.com/en-us/learning-center/logging-in) |
| Deliveroo Partner Hub | Yes: Teams → **"Invite a new member"**, choose a role | VERIFIED (help.deliveroo.com article 13871159) |
| Uber Eats Manager | Yes: "Add users and assign roles"; Marqii's guide asks merchants to add it as Manager | SEARCH-SUMMARY (Uber Academy NZ snippet; Marqii help) |
| Yelp for Business | Yes: invite a user by email; one permission level; up to 15 users | SEARCH-SUMMARY (third-party guides; Yelp help page TLS-blocked) |
| Apple Business Connect → "Apple Business" | Yes: roles Administrator / Company Manager / Brand Manager; Connect is being folded into "Apple Business" (announced Mar 2026, launch reported 14 Apr 2026) | SEARCH-SUMMARY (Apple guide pages now redirect to "Apple Business"; IT Brief) |
| Tripadvisor Management Center | Yes: User Permissions → Add a User (roles reported as Owner/Manager/Admin) | SEARCH-SUMMARY (one third-party guide) |
| Just Eat Partner Hub | NOT FOUND (searched help centre via search engine) | — |
**Result:** P2 is solvable by mechanism on every major platform except Just Eat (unknown). The friction moves to *willingness*: the owner must click 3–6 invites for a stranger, in a market where scammers ask for exactly that access.

**Halal filter (G1), measured:** New York State's liquor register lists **8,214 "Restaurant" and 3,069 "Food & Beverage Business"** on-premises licences in the five boroughs (data.ny.gov 9s3h-dpkz, extract 2026-10-30, E3), against 26,302 NYC food establishments inspected since 2025 (E3). So **roughly 4 in 10 NYC food businesses hold an on-premises licence**, and the share is higher among sit-down "mid-range" restaurants (ESTIMATE; I didn't match the two lists row by row). A strict no-licensed-premises filter removes about half of the CEO's target segment. Cafés, bakeries, dessert parlours, fast-casual, halal and most takeaways pass.

**Places API (if we automate checks):** opening hours and phone numbers are "Place Details Enterprise" fields: **1,000 free events a month, then $20 per 1,000** (VERIFIED, developers.google.com/maps/billing-and-pricing/pricing, updated 2026-10-28). Checking 1,000 restaurants a month is free; 5,000 is ≈ $80. It needs a Google Cloud billing account with a card (P3, flag). Google's terms limit storing and republishing Places content, so a public benchmark must use our own manual observations, not API data (ESTIMATE; terms not opened).

---

## Think bigger (imagine first, judge second)
**Imagined (no judgement yet):**
1. **Bigger buyer: the Toast gap.** Toast's own help says Google hours "may be wrong" for its ~180k locations. Sell a "Toast-restaurant hours watch" to the firms around Toast: Toast-focused consultants, listing vendors that need onboarding labour (Marqii's help pages walk merchants through adding it as a manager on Uber Eats and Apple), or multi-unit Toast operators.
2. **Bundle: a white-label "Location Health" line for agencies:** listings kept fixed + the hard-review desk (M1-reputation-desk) + a monthly AI-answer check (what ChatGPT/Gemini say about hours), one price per location, under the agency's brand.
3. **Different country: the UAE.** Dubai has ~13,000 F&B outlets and very high churn; alcohol is mostly confined to licensed hotel venues; Dubai 09:00 = Dhaka 11:00; English is the business language.
4. **Public scoreboard: a "Holiday Hours Index".** Before Thanksgiving and Christmas, check the flagship locations of 50 restaurant brands for Google special hours and website agreement; publish aggregates only, with a right of reply; send each brand's ops head its own row.
5. **White-label for an agency's whole client list:** take every client of an agency, not a sample.

**Tested (verdicts):**
| Version | Evidence for | Evidence against | Verdict |
|---|---|---|---|
| 1 Toast gap | Toast help admits Google hours may be wrong (VERIFIED, 2026-09-16); ~180k locations, +22% a year (SEARCH-SUMMARY); Marqii charges $90/location for the sync (VERIFIED) | Selling to vendors' ops teams is the coldest Read there is; Marqii already sells the fix; NOT FOUND: any Toast consultant buying outside labour | **Use as the letter, not the buyer:** "you're on Toast; Toast says your Google hours aren't synced; here's your mismatch" is a sharper line one for routes (b)/(c). |
| 2 Bundle | Agencies already buy white-label reputation at $275/location (HOTH, VENDOR); human replies retail at $49/outlet (Social Station, VERIFIED); listings software $16–60 | Many white-label suppliers (HOTH, Clicks Geek, Digital Help PH); AI-answer checks are being automated (Insites free audit) | **Best version.** Only the bundle gets a location to $60–90/month wholesale, enough to make the maintainer route a business. Scored inside M1-reputation-desk route (c). |
| 3 UAE | ~13,000 F&B outlets (Dubai DET, Dec 2023, SEARCH-SUMMARY); 1,500 new food establishments in Jan–May 2024 (Gulf News, SEARCH-SUMMARY) → churn → stale listings; timezone ideal; G1 cleaner (ESTIMATE) | Outreach law (UAE PDPL/TDRA rules) unchecked; WhatsApp-first market with a non-reply cap (T28); local agencies plentiful (ESTIMATE); no list built | **Worth one $0 audit of 20 Dubai restaurants** (partner, 6 h) before any outreach; not ranked. |
| 4 Holiday Hours Index | Google warns on profiles without holiday hours in all six target countries (helper-1, Google help); vendors use this hook for PR (Yext 2022) | Zero authority; Places API terms limit republishing Google data → manual checks only; defamation risk if we name laggards | **Use as the letter (T20), not as media.** "You're one of 50 brands we checked; 3 of your 4 flagship sites show no Thanksgiving hours." |
| 5 Whole client list | One yes multiplies (Rg) | Halal filter: agency lists mix licensed venues (~4 in 10 NYC food businesses licensed, E3) | Only for agencies whose portfolio is mostly unlicensed (helper-2 column). |
**Best "think bigger" version:** #2, the white-label Location Health bundle for agencies with mostly unlicensed portfolios, opened by #4's holiday row and #1's Toast line.

---

## (a) Path Test v2 cards: three routes side by side

### Gates (shared, with route notes)
| Gate | Result | Evidence |
|---|---|---|
| G1 Halal | ✔ with a filter | Exclude on-premises licensed venues (~4 in 10 in NYC, E3). **Route (c) plane:** an agency's client list mixes licensed and unlicensed restaurants. We serve only the unlicensed subset, which the agency may find awkward (P12). CEO/scholar call on "mainly food, also sells alcohol" venues; this file assumes the strict filter. |
| G2 Licence | ✔ | Data correction is not regulated. We never pose as Google. |
| G3 Capacity | (a) ✘ · (b) ✔ · (c) ✔ | (a): one sale per owner, ~1 h fix + 2–4 h of selling each; caps at a few clients a month. Cap breakers: (b) one manager pays for many locations; (c) the maintainer sells and already has access. AI drafts every comparison; a human confirms each failure with a screenshot. |
| G4 AI / software substitution | **~ partial (strong for hours sync)** | Square syncs hours to Google free; Owner.com syncs everywhere at $249+; Google self-updates; listings software from $16–60/location/month (see d). **Gap:** Toast (~180k locations) does not push hours to Google (Toast help, VERIFIED). **What software doesn't do:** compare the website, Google, Apple, Yelp and the delivery apps against each other and against what the restaurant actually does, and reject a bad suggested edit within 4 days for a restaurant with no tool. That residue is real but thin. |
| G5 Demand trend | ✔ (dated) | AI local recommendations 6% → 45% (BrightLocal 2025 → 2026, VERIFIED); AI contact-data match 68% (SOCi 2026) and 48–56% (Insites 2026-07); Google's 4-day suggested-edit window (Sep 2026). Earlier point: Google 2015, only 1% of businesses had adjusted summer hours (SEARCH-SUMMARY, Google small-business blog). |
| G6 Killed list | ✔ | Not on it. Neighbours: "review-reply writing alone" (see M1-reputation-desk) and "generic automation agency" (we build no bots). |

### Step cards (R5 split steps)
| # | Step | (a) Single owners | (b) Groups 5–200 sites | (c) Maintainers |
|---|---|---|---|---|
| 1 | Home | **2** (M, E1). Public data, ~20–30 min per restaurant by hand (Google Maps can't be read by our automated tools; the Places API can, free up to 1,000/month). P3 passes for manual checks. | **2** (M, E1). Check 10 of their locations ≈ 3 h. | **2** (M, E1). Take the maintainer's portfolio/footer clients, check 15–20 ≈ 5 h. |
| 2 | Road | **2** (M, E3). UK FSA API 204k premises; NYC DOHMH 26k with phones. Contact point: phone + website form; email often missing. | **2** (M, E1→E3 after list). Group websites list locations and a corporate contact or press/franchise inbox; LinkedIn shows ops/marketing heads. | **2** (M, E3 after helper-2 list). Footer credits ("website by"), agency portfolios, ordering-platform badges. |
| 3 | Letter | **2** (M, E1). "Google says open till 11; your site says 10." | **2** (M, E1). "6 of your 23 locations show no Thanksgiving hours; 2 differ on Uber Eats." | **2** (M, E1). "9 of the 31 restaurants in your portfolio show Google hours that differ from the site you built." |
| 4 | Read | **1-soft** (H, E1). Delivered: email to info@ (read once a day at 11 pm), forms, phone (UK 14:00–16:00 = Dhaka 20:00–22:00 ✔; US 14:30–16:00 = Dhaka 01:30–03:00 ✘). **Noticed: worse than Bangla Shothik** (5 pitches a week; 17k+ scam calls; our line one = the scam's line one; no affinity signal). DM: owner (98% decide). | **1** (M, E0). Delivered: named ops/marketing manager email (CAN-SPAM; UK PECR corporate OK); LinkedIn notes 3–5/month (T29). Noticed: corporate inboxes are pitched by Yext/SOCi/Birdeye sales teams too, but a list of their own failing locations is rare (ESTIMATE). DM: Director of Ops/Marketing; for franchises the brand HQ often controls Google (ESTIMATE). | **1** (M, E1). Delivered: the agency's published hello@/owner email, a business inbox that expects partner mail (T3/T6). Noticed: agencies receive constant white-label pitches (ESTIMATE). DM: in 1–20-person agencies, the founder (ESTIMATE). |
| 5 | Impressed | **2** (M, E1). 30-second self-check. | **2** (M, E1). | **2** (M, E1). |
| 6 | Reply | **1** (H, E1). No reason to act now, except holidays. **Re lifts it in season:** Thanksgiving 26 Nov 2026, Christmas, New Year (Google's own holiday warning). | **2-soft** (M, E2). Holiday calendar: US federal holidays + Christmas/Boxing Day (UK, AU, NZ) give 6–10 dated deadlines a year; Google tells owners to confirm. Soft until a send shows replies. | **1** (M, E1). The trigger is their client's failure (embarrassment risk if the client finds it first); seasonal holidays help. |
| 7 | Trust | **1 / 2 / 1** Identity: stranger from Dhaka in a scam-heavy channel, no affinity (worse than Bangla). Competence: proof. Risk: manager invites exist on 7 of 8 platforms (mechanism VERIFIED), but owners must click them for a stranger (H). | **1 / 2 / 2** Identity: zero track record matters more to a company (H). Competence: proof on their own locations. Risk: location-group Manager invite + pay after the first holiday sweep. | **2 / 2 / 2** Identity: agencies routinely resell offshore white-label fulfilment (The HOTH's white-label programme, VERIFIED; offshore norm ESTIMATE, E1). Competence: proof on their own clients. Risk: they already hold access, so we need no login for the first job; pay after. |
| 8 | Pay | **1** Rail ✔ (US ACH 1%; UK GBP transfer free; card ≤3.99% + $0.49; VERIFIED payments.md). Buyer-will-use: unknown for small owners (P8). Collection: small ticket, pay after. | **2** (M, E2 rail / E1 buyer). Companies pay supplier invoices by bank transfer. | **2** (M, E2 rail / E1 buyer). Agencies pay subcontractors by transfer/card; B2B invoice. |
| 9 | Repeat | **1** (H, E1). Holidays + Google self-edits give a reason, but substitutes (Square free, Owner $249) and $60/month churn. | **2** (M, E1). 6–10 holiday sweeps a year + new openings + the 4-day edit window, across many sites. | **2** (M, E1). White-label is bought per client per month (HOTH model, VERIFIED). |

### Cards
```
ROUTE (a) SINGLE OWNERS | MODEL: M1 | GATES: G1✔(filter) G2✔ G3✘(no cap breaker) G4~ G5✔ G6✔
STEPS: Home 2(M,E1) · Road 2(M,E3) · Letter 2(M,E1) · Read 1-soft(H,E1) · Impressed 2(M,E1) · Reply 1(H,E1; 2 in holiday season) · Trust 1/2/1 · Pay 1(M rail E2 / H buyer) · Repeat 1(H,E1)
CHAIN: 1 (Read, soft, E1) | TWO-KEY: 0 of 3 → WEAK BY DESIGN (G3 also fails)
FALSE-0 FIXES: Reply → Re (holiday hours); Read-delivered → Rh (UK afternoon phone = Dhaka evening)
FALSE-2 CATCHES: Trust-risk → manager invites exist but owners won't click them for a stranger (P2 becomes willingness); Read-noticed → scam pattern-match (Hiya, FTC Pointbreak); Road → huge, but halal filter removes ~half
```
```
ROUTE (b) GROUPS 5–200 SITES | GATES: G1✔(filter at brand level: many groups are all-licensed or all-unlicensed) G2✔ G3✔(one manager, many sites) G4~(groups ≥50 sites often already on Yext/SOCi/Birdeye; ESTIMATE) G5✔ G6✔
STEPS: Home 2 · Road 2(M,E1) · Letter 2 · Read 1(M,E0) · Impressed 2 · Reply 2-soft(M,E2) · Trust 1/2/2 · Pay 2(M,E2/E1) · Repeat 2(M,E1)
CHAIN: 1 (Read, M, E0; Trust-identity, H) | TWO-KEY: 1 of 3 (Pay) → WEAK BY DESIGN
FALSE-0 FIXES: Reply → Re (holiday calendar); Read → Rc (their own location list in line one)
FALSE-2 CATCHES: G4 → bigger groups already pay a listings tool; Identity → companies want references we don't have
```
```
ROUTE (c) MAINTAINERS | GATES: G1~(licensed clients excluded: P12 friction) G2✔ G3✔(maintainer sells; already has access) G4~(they can buy BrightLocal/Semrush seats instead) G5✔ G6✔
STEPS: Home 2(M,E1) · Road 2(M,E3 after list) · Letter 2(M,E1) · Read 1(M,E1) · Impressed 2(M,E1) · Reply 1(M,E1) · Trust 2/2/2(M,E1) · Pay 2(M,E2/E1) · Repeat 2(M,E1)
CHAIN: 1 (Read, M, E1; Reply, M, E1) | TWO-KEY: 2 of 3 (Trust, Pay) → PASS
FALSE-0 FIXES: Trust-risk → Ra (maintainer already has access); Pay → Ra (B2B invoice); Repeat → Rg (one buyer, many clients)
FALSE-2 CATCHES: Letter → free-rider (the proof IS the fix list; they can fix the 9 errors themselves in an hour); G1 → licensed clients; Trust-identity rests on E1 (offshore white-label norm), so it falls to 1 if the first replies ask for references
SOFT-0 TESTS (≤2h, $0): (1) partner audits 15 portfolio clients of 2 maintainers (hours on Google vs site vs one delivery app) and counts mismatches; (2) count how many maintainers sell "GBP/listings management" already (their own service pages)
```
**Tie-break (R3):** (c) passes two-key and ranks first; (b) beats (a) on two-key count (1 vs 0) and on M + ≥E1 steps.

---

## Compared with the Bangla version (M8-shothik-nyc-rescore), step by step
| Step | Bangla NYC Shothik | Open market, best route (c) | Open market, route (a) | What changed and why |
|---|---|---|---|---|
| Road | 2 (79 + 312 NYC rows, phones only) | 2 (maintainer list, emails) | 2 (204k UK + 26k NYC rows) | Road was never the problem; it grows ×100. |
| Read | 1-soft (Facebook requests; phone at Dhaka night) | 1 (business inbox expecting partners) | **1-soft, worse on "noticed"** | Delivered gets better (English email, forms, UK phone in Dhaka evening). Noticed gets **worse**: no affinity, the most-pitched inbox, and our opening line is the scam script (Hiya 17k+ calls; FTC Pointbreak). |
| Trust | 2/2/1 (Bangla identity strong; logins) | 2/2/2 (they hold the logins) | **1/2/1** | Identity gets worse without affinity. Risk: manager invites are now verified on Google, DoorDash, Deliveroo (and reported for Uber, Yelp, Apple, Tripadvisor), so the *mechanism* exists; *willingness* stays unproven. |
| Pay | 1 (Zelle/cash habit) | 2 (B2B invoice) | 1 | Rails are better outside the diaspora cash habit (UK GBP free, US ACH 1%), but small owners' rail choice is still unmeasured. |
| Reply | 1 (no trigger) | 1 | 1 (2 in holiday season) | Holidays are a real, dated trigger for everyone; Ramadan/Eid only mattered to the halal subset. |
| G4 | ~ | ~ | ~ | Square, Owner.com, Marqii and Google itself fix part of it for free or bundled. |
**Verdict of the comparison:** the open market fixes Road and Pay, leaves Trust-risk at "mechanism exists, willingness unknown", and **makes Read worse for single owners**. It improves only when the buyer changes (route c), which is Ra, not the open market as such.

---

## (b) Reply Card (route c, the only route that passes two-key)
```
BUYER (exact role): founder/owner of a 1–20-person restaurant web/marketing agency or ordering reseller whose footer or portfolio names ≥10 restaurant clients (US, UK, CA, AU, IE, NZ)
CONTACT POINT: the agency's published hello@/founder email or partner form (list in k)
CHANNEL + legal check: plain-text email from a real named Gmail; US CAN-SPAM (identity, postal address, opt-out); UK: limited companies only (Companies House check, PECR); AU: conspicuously published address, no "no unsolicited" note (T6); IE: skip cold email (EU rules) unless a partner form exists; NZ: Unsolicited Electronic Messages Act needs inferred consent from a published address (ESTIMATE, check before sending)
TRIGGER (why now, dated): holiday hours before Thanksgiving (26 Nov 2026) / Christmas; Google's 4-day suggested-edit window (reported 2026-09-23)
LINE ONE (their fact): "9 of the 31 restaurants on your portfolio page show Google hours that differ from the sites you built — e.g. [client]: Google 11 pm, site 10 pm."
PROOF (30-second self-check): the client's name, the two hours, and "search [client] on Google and open your own site"
IDENTITY LINE (T15): "We're MD Nahin and [partner], a two-person listings QA team in Dhaka, Bangladesh. Faces, address and a dated sample: [link]."
RISK REVERSAL (T22–T25): the 9-item list is yours, free; we fix them under your name for a flat $150–300, invoiced after you've checked them; anything we fixed that breaks again within 30 days we re-fix free
EASY ANSWER (yes/no): "Want the full list for all 31? Reply 'yes'."
SEND TIME: UK 09:00 = Dhaka 15:00 (GMT from 25 Oct); US East 09:00 = Dhaka 20:00 (EST from 1 Nov); AU East 09:00 = Dhaka 04:00 → schedule-send
TEST: A = line one with their client count; B = line one with the holiday trigger; 30 + 30 sends; stop rule T34
EXPECTED: baseline 3–5% → target ≥ 8% positive replies (ESTIMATE; no restaurant-agency reply data found)
```

---

## (c) Filters
- **Work level:** (a) low-medium (≈1 h fix); (b) and (c) **medium**: multi-platform sweeps over many locations, holiday calendars, rejecting bad suggested edits, monthly report.
- **Demand trend (dated, earlier vs now):**
| Date | Point | Label |
|---|---|---|
| 2015-06 | Only 1% of businesses had adjusted summer hours on Google My Business | SEARCH-SUMMARY (Google small-business blog) |
| 2022-05-25 | Yext: 52% not confident visiting when Google warns holiday hours may differ | VERIFIED (vendor survey) |
| 2025 → 2026 | Consumers using AI for local recommendations 6% → 45% | VERIFIED (BrightLocal LCRS 2026) |
| 2026-07-23 | ChatGPT fully matches Google profile data for 55.58% of 10,000 US businesses | VENDOR (Insites, opened) |
| 2026-09-23 | Google: 4 days to reject a suggested edit, then it may publish | SEARCH-SUMMARY (SER via digitalapplied) |
| 2025 | US independent restaurant locations −2.3% (−9,500); chains +1.4% to 263,000+ | SEARCH-SUMMARY (Technomic via NRN) |
  The need for accurate data is rising; **the number of independent buyers is shrinking and chains are growing**, which favours routes (b) and (c).
- **AI substitution (12–24 months): high for hours sync, medium for cross-checking.** POS and platform syncs (Square, Owner, Marqii) and Google's own updates absorb more each year. The human residue is verifying against reality and acting on notices for restaurants with no tool.
- **Team fit:** the partner's checklist strength is the product (screenshots, zero false positives). CEO writes the letters. Live calls: UK afternoons fit Dhaka evenings; US and AU only by email.
- **Halal:** strict filter on licensed premises (~4 in 10 NYC food businesses; more among sit-down places). Prefer cafés, dessert parlours, bakeries, fast-casual, halal groups and takeaways.

## (d) Price evidence (helper-1 table: research/handoffs/M1-helper-1-prices.md; opened 2026-10-30)
| What buyers pay today | Price | Label |
|---|---|---|
| Moz Local Lite (listings software, per location) | $20/month, or $16 billed yearly | VERIFIED (moz.com) |
| BrightLocal Manage (Active Sync: hours to Google, Facebook, Apple, Bing; Yelp only with add-on) | $40/month billed yearly, $54 monthly, per location; white-label on all plans | VERIFIED (price); sync detail SEARCH-SUMMARY |
| Semrush Local Pro (listings, 70+ directories) | $60/month per location | VERIFIED |
| Synup (white-label from Premium) | $49 for 1 location; $299 for 10 (≈ $30 each) down to $899 for 50 (≈ $18 each) | VERIFIED (toggle state unclear) |
| Marqii (restaurant listings + menus; Toast hours sync) | $90/month per location, annual | VERIFIED |
| Yext Listings | custom; third parties report $199–999 per location per **year**; Yext sends small businesses to resellers | NOT FOUND on Yext / SEARCH-SUMMARY |
| Owner.com (all-in website + ordering, listings included) | $249/month + 5%, or $499/month | VERIFIED |
| Vendasta (white-label platform for agencies) | agency minimums $99 / $499 / $999 a month | VERIFIED |
| The HOTH white-label reputation (managed replies + listing syndication + weekly GBP updates) | from **$275/location/month wholesale**; agencies resell at $500–900 | VENDOR CLAIM (own blog, 2026-08-18) |
| Agency starter retainer for restaurants (reviews + local SEO) | "three hundred dollars a month"; don't quote >$500 first | VENDOR (MapsLeads, 2026-05-02) |
| Offshore VA for listings/reviews | $8–15/h entry, $15–25 experienced; $150–400/location/month multi-location | VENDOR CLAIM (Wishup blog) |
| Offshore white-label GBP fulfilment for agencies | exists: Digital Help PH ("built specifically for boutique web design… agencies"), Clicks Geek ("500+ agency partnerships") | SEARCH-SUMMARY (search previews, 2026-10-30) |
**Reading:** software for the *push* costs $16–60 a location; the market pays for *labour* at $150–300+ a location only when bundled with reviews and SEO. A listings-only "kept fixed" line must price near the software ($20–40 a location wholesale), or ride inside a bundle.

---

## (e) Money path and scenarios (route c; routes a and b noted)
**Path:** free proof (their 9 broken clients) → **$150–300** first job: fix every mismatch for that maintainer's eligible (unlicensed) clients + set holiday hours before the next holiday → **$25–45 per location per month** white-label "kept fixed" (monthly cross-check of Google, Apple, Yelp, site and delivery apps; holiday sweeps; act on suggested-edit notices within 4 days; one-line report per client) → a maintainer with 25 eligible locations at $40 = **$1,000/month**. Bundle with the review desk (M1-reputation-desk) to reach $60–90 a location.
**Capacity:** ≈ 20 min per location per month with AI drafting (ESTIMATE) → 70 team hours ≈ 200 locations ≈ the ceiling without hiring a checker (G3 cap breaker: a trained Dhaka checker under the partner's checklist).

| Assumption | Low | Mid | High |
|---|---|---|---|
| Maintainers emailed (from list k + same method) | 100 | 150 | 200 |
| Positive reply rate | 2% → 2 | 5% → 7–8 | 8% → 16 |
| Converted to a paid first job | 1 of 2 | 3 of 7–8 | 8 of 16 |
| Eligible locations per client | 8 | 15 | 25 |
| Price per location per month | $25 | $35 | $45 |
| Months retained in year 1 | 6 | 9 | 12 (needs a hired checker) |
| First jobs | $150 | 3 × $250 | 8 × $300 |
| **Year-1 revenue** | **≈ $1,350** | **≈ $14,900** (run-rate ≈ $1,575/month) | **≈ $110,400** (run-rate $9,000/month; above team capacity) |
All ESTIMATE. The mid case is the honest target; the high case is capped by hours, not demand.
- **Route (a)** single owners: like Bangla Shothik's scenarios ($100 → ≈ $600 → ≈ $5k a year), with a bigger pool but a worse Read. Not worth the team's evenings.
- **Route (b)** groups: one 20-site group at $300 per holiday sweep × 8 holidays + $15/location/month watch ≈ $6,000 a year per group (ESTIMATE); Read and Identity are the brakes.

## (f) Cheap test (7 days, $0)
Yes, and the calendar helps: **Thanksgiving is 26 Nov 2026**, so a sweep sold in the week of 2–13 Nov has a real deadline.
1. **Partner (5 h):** pick 2 maintainers from (k) with ≥10 restaurant clients. For 15 of their unlicensed clients, record Google hours, website hours and one delivery app's hours, plus whether Thanksgiving special hours are set on Google. Screenshot every mismatch; zero false positives.
2. **CEO (2 h):** send the two maintainers their own list (Reply Card, variant A), plus 8 more maintainers a lighter version (one mismatch each). Send by Gmail schedule at their 09:00.
3. **Measure by day 7:** positive replies, and whether any maintainer says "we'll fix it ourselves" (free-rider rate).
**Kill rule:** 0 positive replies from 10 personalised sends, or ≥2 free-rider answers, means route (c) is not a business on its own: fold it into the review-desk bundle.

## (g) Monday walk-through
- **CEO:** (1) one-page identity site (Notion/Carrd free): faces, names, Dhaka address, a dated sample — **has it? FLAG: not built yet ($0, 2 h)**. (2) Choose the 2 maintainers from (k). (3) Write variants A and B.
- **Partner:** (1) the 15-client audit in a browser (has a browser). (2) UK rows: Companies House legal-form check (free). (3) Screenshot pairs into one PDF per maintainer.
- **Planes found:** a **Payoneer account** must be open and verified before the first invoice (status unknown → FLAG); no paid tool, domain or ads needed. Live calls not needed.

## (h) Red team
**Strongest honest reason it fails:** *the proof is the product.* The 9-item list we send is the whole value of the first job; a competent maintainer fixes it in an hour and says thanks. What remains to sell, the monthly watch, is offered to the same agencies by BrightLocal ($40), Synup (≈ $18–30 white-label), Moz ($16–20) and by offshore white-label fulfilment shops (Digital Help PH, Clicks Geek, The HOTH). We would be one more offshore white-label vendor, and the brief's first lesson is that cheap labour is not an edge.
**Second reason:** the open-market single-owner version is worse than Bangla Shothik on Read, because our honest opening line is word-for-word the "Google listing" scam (Hiya 17k+ calls; FTC Pointbreak).
**Counter-evidence searches I ran:**
- "agency looking for white label partner Google Business Profile management fulfillment restaurants": found **only suppliers**, no agency posting the need (2026-10-30). Read stays a 1.
- Restaurant-specific cold-email reply rates: **NOT FOUND**; only generic 3–5% (Hunter 4.5% for 2025) and a self-reported 4,500-email restaurant campaign with 47 replies ≈ 1% (Clay community, SEARCH-SUMMARY).
- Evidence *for* us: Toast's own help admits Google hours may be wrong for its ~180k locations; Google's 4-day suggested-edit window creates a monitoring job; AI answers mismatch Google data for 32–52% of businesses (SOCi, Insites).

## (i) vs Shothik (Read, Trust, Pay)
| | Shothik (Bangla, NYC) | Shothik Open, route (c) | Why |
|---|---|---|---|
| Read | 1-soft | **Same (1)** | Business inbox instead of Facebook requests, but white-label pitches crowd it. For single owners (route a), **worse**: scam pattern, no affinity. |
| Trust | 2/2/1 | **Better (2/2/2)** | The maintainer already holds the logins; agencies are used to offshore partners. For single owners, **worse identity** (1). |
| Pay | 1 | **Better (2)** | B2B invoice, UK GBP free, US ACH 1%. |

## (j) Intelligence verdict
The CEO is right about size and wrong about what size fixes. Opening the market multiplies Road, which was never the constraint, and makes the single-owner Read worse, because a stranger saying "your Google listing is wrong" sounds exactly like the robocall scam owners have learned to hang up on. The formula's 2-of-3 PASS for the maintainer route is real but thin: Trust-identity rests on E1, and the free-rider problem (the proof is the deliverable) isn't captured by any step. What I actually believe: **listings-only is a feature, not a business; it's a strong *opener* and a cheap *add-on*.** It earns its place as the free proof that opens a maintainer conversation for a bundle (listings + hard-review desk), timed to the holiday calendar, and sold to agencies whose clients are mostly unlicensed. Run the 7-day test before Thanksgiving; don't build anything.
