STATUS: FINAL

# Part D — Shothik reality test (restaurant reputation, and better-fitting versions)
Written 2026-10-31 by Companion D (Opus). No sub-agents used. Raw data and scripts were kept outside the repo (`/tmp/partD/`, `/tmp/partD_scripts/`).
**Labels:** VERIFIED (primary page or data opened by me) · VENDOR CLAIM · SEARCH-SUMMARY (search snippet only) · ESTIMATE (my arithmetic; inputs shown) · NOT FOUND.

---

## 0. The answer first
1. **The CEO's buyer barely exists.** I measured real Google review data, a near-complete copy of every restaurant's reviews in Washington DC and Rhode Island. In 2019, the last clean year, **0.4% (DC) and 0.1% (RI) of restaurants got ≥100 Google reviews a month**. 6% and 3% got 30–100, and 71–76% got fewer than 10. If volume has doubled since then, the ≥100 group is still only **0.8–2%**, and half of all restaurants still get under 10 a month. (VERIFIED data; scaled ESTIMATE.)
2. **The ≥100-a-month places are tourist landmarks and group flagships**, and most don't bother replying. Old Ebbitt Grill had 274 reviews a month and replied to 3%; Ben's Chili Bowl had 123 and replied to 0%. Those that do reply (Le Diplomate 93%, Cuba Libre 99%) belong to restaurant groups that have their own staff or tools. (VERIFIED data.)
3. **Care is low but rising.** In 2019 only **24–31% of restaurants replied to even one Google review** that year, and 8–11% replied to at least half. Owners *say* otherwise: 51% (BrightLocal 2026) or 86% (Uberall) say they respond. (VERIFIED data / SEARCH-SUMMARY.)
4. **Money per bad review is small for restaurants, and it shrinks as velocity rises.** For a typical 10–30-review-a-month restaurant, one bad review costs about **$45–130 of revenue a year per $1M of sales**. For a dentist, med spa, auto shop or law firm it is **$650–13,000** (ESTIMATE, from Luca's verified 5–9% revenue per star). The key result: **the monthly pain per $1M of revenue is about the same in every vertical (~$130–530 a year of new drag per month of bad reviews). Velocity only changes how many events you must handle to address it.** A human desk therefore earns most where velocity is *low* and each review is a big hit, which is the opposite of the CEO's velocity filter.
5. **Software has already eaten the reply.** HighLevel's Reviews AI costs about **$0.01–0.08 a reply**, Google is testing free AI replies, Toast's Reviews Agent replies from inside the POS, and Marqii sells human-checked replies at **$0.75–2**.
6. **Verdict: KILL the restaurant desk as a company. PIVOT only as a cheap side test,** to a **"bad-review incident desk" for low-velocity, high-stakes local businesses (dental and med spa first, where a careless reply is a HIPAA risk), sold white-label to their marketing agencies.** It is small: ≈ $3–12k/month (mid ≈ $6k) after 12–18 months if it works (ESTIMATE), with odds ≈ 10%. R1 stays the company.

---

## 1. Velocity: how many Google reviews restaurants really get
**Source.** UCSD "Google Local Data (2021)" (Li, Shang & McAuley; ACL 2022, arXiv 2207.00422): every review with its timestamp, star rating and owner reply, plus business metadata.
- **Access.** The primary host (datarepo.eng.ucsd.edu) failed TLS here: its certificate chains to an emSign root that is not in our trust store, and I did not override that. The lab's documented mirror (mcauleylab.ucsd.edu/public_datasets/gdrive/googlelocal/, files dated Jan 2025) worked.
- **Sample.** I used **District of Columbia** (a dense city) and **Rhode Island** (a small state of towns and suburbs).
- **Completeness: VERIFIED.** For businesses with ≥20 reviews, the reviews in the file divided by Google's own review count at crawl time give a median of **1.00** (DC n=2,633; RI n=2,841).
- **Why 2019.** The crawl ended mostly in Q2 2021: 1,656 DC food businesses have their last review in Q2 2021, and monthly totals collapse after April 2021. COVID also hit 2020–21: DC food reviews fell from 26,220 in April 2019 to 1,397 in April 2020. So **2019 is the clean year.** Jan–Feb 2020 ran +12% and +30% above Jan–Feb 2019, so volume was still growing before COVID.
- **Definitions.** "Food" means categories containing restaurant, café, pizza, bakery, coffee shop, fast food and similar. "Restaurant" means the category contains the word restaurant. A business is a "chain" if its name appears ≥3 times in the same state.

**Table 1: share of active restaurants by Google reviews per month (2019; VERIFIED data. The ×1.5 and ×2 columns scale every business by a growth multiplier: ESTIMATE)**
| Reviews/month | DC 2019 (n=2,490) | DC ×1.5 | DC ×2 | RI 2019 (n=2,790) | RI ×1.5 | RI ×2 |
|---|---|---|---|---|---|---|
| ≥100 | **0.4%** (11) | 1.2% | 2.0% | **0.1%** (3) | 0.3% | 0.8% |
| 30–100 | 5.8% | 11.0% | 16.1% | 2.9% | 7.7% | 12.7% |
| 10–30 | 22.7% | 29.0% | 32.2% | 20.7% | 29.1% | 34.7% |
| <10 | **71.1%** | 58.8% | 49.7% | **76.3%** | 62.9% | 51.9% |
| Median (p50) / p90 / p99 | 5.0 / 24.0 / 70.9 | | | 4.7 / 17.8 / 43.2 | | |
| Mean | 9.7 | | | 7.6 | | |

By tier (2019, VERIFIED data):
- **Mid-range ($$):** p50 is 7.6 (DC) and 7.8 (RI); p90 is 29.2 and 21.7. In DC, 0.7% reach ≥100 and 8.7% reach 30–100.
- **$$$:** p50 is 12.3 (DC).
- **Independents vs chains:** very similar spreads. DC independent "restaurant" category: ≥100 0.5%, 30–100 6.4%, 10–30 25.0%, <10 68.1%. Chains: p50 5.2, p90 25.1.

**Who is at ≥100 a month (DC 2019, reviews/month | owner-reply share):**
- Old Ebbitt Grill 274 | 3%
- Founding Farmers 256 | 21%
- The Hamilton 151 | 3%
- Ben's Chili Bowl 123 | 0%
- Fogo de Chão 110 | 0%
- Hard Rock Cafe 102 | 37%
- Le Diplomate 100 | 93%
- Cuba Libre 95 | 99%

They are landmarks and group flagships, not "mid-level restaurants". Several are bar-heavy, so our halal filter removes part of this tier.

**How much has volume grown since 2019?** Not settled. The evidence brackets it:
- **Up:** Birdeye says review volume grew **26% (2024) and 30.7% (2025)**, with Google volume per location +29.3% (VENDOR CLAIM, State of Online Reviews 2026, opened). This comes from its own customers, and the growth was "driven by" automated SMS and email review requests, so it overstates the whole market.
- **Flat:** Black Box Intelligence puts chain restaurant units at **"just over 9" Google reviews a month** (≈ 20 for top full-service, 5–6 for limited-service) (SEARCH-SUMMARY; page 403). That is about DC's 2019 mean of 9.7.
- **Reading:** the true multiplier is probably **1×–2×** (ESTIMATE). Appendix A's 2-hour sample pins it down.

**UK, CA, AU and IE:** no comparable open dataset found (NOT FOUND). The dataset covers the US only. The protocol in Appendix A covers other countries.

---

## 2. Negative share: how many "bad review events" happen per month
**Share of restaurant reviews that are 1–3★ (VERIFIED data):**
- 2019: **17.3% in DC and 17.8% in RI**; 1–2★ alone is 8.6% and 9.5%.
- Stable over time: in DC it fell from 25% (2012) to 17–18% (2019–21).
- Chains are worse: RI chains get **25–31%** 1–3★.
- **Restaurant negatives are mild:** the average 1–3★ review is **2.2★**, and about half are 3★. Professional verticals' negatives are mostly 1★ (§7).

**Table 2: bad-review events per month for the median restaurant in each tier (2019, VERIFIED data. "Now" = ×1 to ×2, ESTIMATE)**
| Tier (reviews/month) | 1–3★/month DC | 1–3★/month RI | of which 1–2★ (DC) | Now (×1–2) |
|---|---|---|---|---|
| <3 | 0.17 | 0.17 | 0.08 | 0.2–0.3 |
| 3–10 | 0.92 | 0.83 | 0.42 | 1–2 |
| 10–30 | 2.42 | 2.33 | 1.08 | 2.4–4.8 |
| 30–100 | 6.21 | 5.83 | 2.67 | 6–12 |
| ≥100 | 17.8 | 13.5 | 7.0 | 18–36 |

**Reading:** a typical mid-range independent sees **1–5 bad reviews a month, about half of them 3★.** Most of these are not crises. A truly hard case (1★ with an accusation, extortion or a legal issue) is a fraction of the 1★ share. Measuring that fraction needs review text (I didn't classify it; NOT FOUND).

---

## 3. Care: do owners reply, and do they pay for help?
**Table 3: owner replies on Google, food businesses (VERIFIED data)**
| | DC | RI |
|---|---|---|
| Share of all reviews with an owner reply | 2016 5.7% → 2017 7.6% → 2018 9.8% → **2019 12.4%** → 2020 13.2% | 2017 5.9% → 2018 8.4% → **2019 10.4%** → 2020 12.3% |
| Share of 1–3★ reviews replied to (2019) | 14.0% | 9.7% |
| Restaurants that replied to ≥1 review in 2019 | **30.7%** | **23.7%** |
| Restaurants replying to ≥50% of reviews (with ≥5 reviews) | **10.8%** | **7.8%** |
| Share replying at all, by tier (<3 → 3–10 → 10–30 → 30–100 → ≥100) | 18% → 32% → 41% → 54% → 64% | 17% → 23% → 34% → 47% → 67% |
| Median reply lag | 2.5 days (2019), 1.6 (2021) | 2.0 (2019), 1.2 (2021) |

Today's reply rate:
- **Projection:** if the 2016–2020 trend of about **+2 points a year** held, about 20–25% of restaurant reviews get an owner reply in 2026 (ESTIMATE; the protocol measures it).
- **What owners say:** "51% respond" (BrightLocal Small Business Marketing Report 2026, round 1; SEARCH-SUMMARY here) and "86% respond" (Uberall survey, undated, SEARCH-SUMMARY).
- **Tool users:** Birdeye's customers replied to **75.5% of reviews in 2025** (VENDOR CLAIM).

**Do restaurants that reply pay for help, or do it themselves?**
- **Direct evidence: NOT FOUND.** I ran two searches and found no survey that splits owner, staff and agency.
- **Indirect evidence:**
  - Reply rates rise with velocity, and the near-100% repliers are group-owned (Le Diplomate, Cuba Libre). That suggests staff or tools. (VERIFIED data plus inference.)
  - Replies come within 1–2.5 days, which looks like an in-house routine. (Inference.)
  - The top Google autocomplete for "respond to google reviews for" is DIY: "how to respond to google reviews for your business" (VERIFIED as observed, 2026-10-31).
  - Paid help exists, but cheap: Marqii $0.75–2 a reply; Social Station $49 an outlet; Restaurant Genie £400/month as an agency add-on (round 1, VERIFIED).
- **Reading:** the minority who care either do it themselves (single owners) or already have a tool or staff (groups).

---

## 4. Awareness: is an unaware market an opportunity or a cost for us?
**A cost.** The evidence:
1. **The free version goes unused.** Replying on Google is free and takes minutes, yet **69–76% of restaurants didn't reply to a single review in 2019** (VERIFIED data). Their problem isn't a missing tool; they don't value the activity.
2. **They are pitched, not unaware.** Agency playbooks already pitch restaurants on rating gaps at "$300 a month" (MapsLeads 2026, round 1). Owners get these pitches weekly; they are unconvinced.
3. **Self-report overstates care.** Owners claim 51–86% (above) against 24–31% observed. A pitch built on "you care about reviews" hits people who say yes and don't act.
4. **SMB churn is the tax on educated-but-unconvinced buyers.** Thryv (SMB SaaS, reviews included) reported SaaS monthly churn of 2.1% in Q4 2021 and seasoned net revenue retention of 94% (2025) and 90% (Q2 2026), with churn "higher among micro-businesses" (SEARCH-SUMMARY, earnings coverage).
5. **Buying triggers are events, not education:**
   - an extortion wave: Google runs a dedicated form for review-extortion scams (VERIFIED in round 1);
   - a visible rating drop across a threshold: both studies in §5 are built on rounding thresholds;
   - a new location opening.

   An unknown seller can catch an event but cannot afford to teach a category.

**Rule for the CEO:** an unaware market is an opportunity only for a seller who already owns distribution (POS vendors, Google, HighLevel agencies). For an unknown Dhaka team it means double education (who we are, and why this matters). Sell where the buyer already pays, or where an event forces the purchase.

---

## 5. Money per bad review
**Studies, checked at source:**
| Study | Finding | Label |
|---|---|---|
| Luca, *Reviews, Reputation, and Revenue: The Case of Yelp.com*, HBS Working Paper (Seattle restaurants, Yelp) | "a one-star increase in Yelp rating leads to a 5-9 percent increase in revenue"; the effect is driven by independents and "ratings do not affect restaurants with chain affiliation" | **VERIFIED** (hbs.edu item 41233) |
| Anderson & Magruder, *Learning from the Crowd*, Economic Journal 122(563), 2012 (328 San Francisco restaurants) | A half-star more → "19 percent greater likelihood" of selling out at peak times (UC Berkeley news release, 2012-09-04). The journal abstract says "19 percentage points (49%)". | Release **VERIFIED**; abstract wording SEARCH-SUMMARY (OUP 403, PDFs 404) |
| Proserpio & Zervas, *Online Reputation Management…*, Marketing Science 36(5), 2017 (Texas hotels, TripAdvisor vs Expedia) | Responding hotels get "a 0.12-star increase in ratings and a 12% increase in review volume", plus "fewer but longer negative reviews" | **VERIFIED** (Crossref abstract) |

**Conversion (ESTIMATE; inputs shown).**

The formula: revenue lost per year from one bad review = (avg rating − bad rating) ÷ lifetime reviews × 5–9% per star × revenue.

Inputs:
- **Restaurants:** avg 4.3; bad review 2.2★ (dataset mean of 1–3★); lifetime reviews by tier from the 2021 data (3–10 tier: 198; 10–30 tier: 564; 30–100 tier: 1,438), plus 58 months of growth at ×1–2.
- **Revenue:** $1M, a mid-range independent. Metrobi puts the average full-service restaurant at $1.2M and IBISWorld implies ~$1.7M (SEARCH-SUMMARY). Census and FRED were unreachable.

**Table 4: revenue at risk (ESTIMATE, per $1M of annual revenue)**
| Business (typical) | Lifetime reviews 2026 | Stars lost per bad review | $ lost/yr per bad review | Bad reviews/month | New drag per month of bad reviews ($/yr) |
|---|---|---|---|---|---|
| Restaurant, 3–10/month | 520–840 | 0.0025–0.0041 | **$126–366** | 0.9–1.8 | $187–416 |
| Restaurant, 10–30/month | 1,450–2,340 | 0.0009–0.0014 | **$45–130** | 2.4–4.8 | $175–391 |
| Restaurant, 30–100/month | 3,800–6,100 | 0.0003–0.0006 | **$17–50** | 6–12 | $172–383 |
| Dentist (rating 4.8, bad 1.4) | 106–164 | 0.021–0.032 | **$1,040–2,900** | 0.08–0.16 | $129–299 |
| Med spa (4.7 / 1.6) | 150–237 | 0.013–0.021 | **$654–1,860** | 0.15–0.30 | $155–353 |
| Auto repair (4.5 / 1.65) | 63–98 | 0.029–0.045 | **$1,460–4,084** | 0.10–0.20 | $227–526 |
| Law firm (4.7 / 1.5) | 22–36 | 0.088–0.146 | **$4,384–13,091** | 0.03–0.05 | $182–395 |

**What this says, in plain words:**
- **Velocity cancels out.** Busy places get more bad reviews, but each one moves the average less. So the pain per month, per dollar of revenue, is **about the same everywhere: roughly $130–530 a year of new revenue drag per $1M for each month's bad reviews.** A busy restaurant is not in more pain per dollar of revenue. It only creates **more events** for us to handle.
- **For a human desk, the economics point to low velocity.** One dentist incident carries 10–60× the money of one restaurant bad review, for the same 20 minutes of careful work.
- **What good replying is worth.** Applying Proserpio & Zervas (+0.12★, from hotels) to Luca gives **$6,000–10,800 a year of revenue per $1M**, ≈ **$500–900 a month** (ESTIMATE). That is revenue, not profit. And it comes from *replying at all*, which free AI drafts also deliver; the human adds quality only on the hard cases.
- **Caveats:**
  - Luca's data is Yelp in Seattle, 2003–09. Transferring it to Google in 2026, and to non-restaurant verticals, is unverified.
  - Chains show no rating effect at all.
  - Google shows one decimal, so the losses come in steps, not smoothly.

**For a typical mid-range restaurant:** 2.4–4.8 bad reviews a month, each worth ≈ $45–130 a year. Each month's batch adds ≈ **$175–390 a year of lasting revenue drag per $1M (≈ $15–33 a month)**. If nothing offsets it, that piles up to ≈ $175–390 a month after a year (ESTIMATE). A desk cannot remove those reviews. It can only reply. Even the best case (the +0.12★ effect, $500–900 a month of revenue) is mostly captured by simply replying, which costs $0.01 with AI.

---

## 6. Built-ins and rivals (what the restaurant already has or is offered)
| Who | What | Price | Label |
|---|---|---|---|
| **Google** | AI-suggested replies ("Reply to reviews with AI"): a **test** in the US, Brazil and India (Mar–May 2026 reports). Real-time review notifications already exist. | Free | SEARCH-SUMMARY (Search Engine Land 2026-03-20; May 2026 changelog) |
| **Toast** | Reviews Agent reads and replies to Google reviews through a connected Business Profile (help page updated 2026-10-06) | In Toast IQ / Grow | VERIFIED in round 2 (C6) |
| **Square** | Google review-request campaigns need Square Plus; Square AI uses local review data for insight; Square + Google "Ask Maps" ordering (Aug 2026). No AI reply feature found. | Plus $49/location | SEARCH-SUMMARY (competitor blog; Square press) |
| **HighLevel** (resold by agencies) | Reputation module + **Reviews AI auto-replies** | **$0.01–0.08 per reply**, or unlimited in $50/$97 AI plans per sub-account | SEARCH-SUMMARY (third-party 2026 guides; figures conflict) |
| **Thryv** | AI review responder for SMBs (Nov 2024) | Bundled | SEARCH-SUMMARY |
| **Marqii** | Restaurant "AI + HI" managed replies | $0.75–2 a review | VERIFIED (round 1) |
| **Birdeye** | Enterprise reviews, AI agents with "human-in-the-loop for sensitive feedback" | ~$299+/location | VENDOR CLAIM (own page, opened) / SEARCH-SUMMARY (price) |
| **Podium** | Reviews + messaging | Core $399, Pro $599 a month, 12-month contract | SEARCH-SUMMARY (CostBench, PricingSaaS) |
| **Owner.com** | All-in website + ordering + marketing | $249/month + 5%, or $499 | VERIFIED (round 1) |
| **Ovation** | Guest-feedback capture for restaurants | from $99–199/location (2020 article); quote only now | SEARCH-SUMMARY |
| **Reputation.com** | Rep Core incl. "AI Responding" + listings | $80/location | VERIFIED (round 1) |

**What an AI + human desk can do that these can't (honest list):**
- Judge the **rare high-stakes review**:
  - extortion waves (escalate with evidence to Google's form);
  - accusations where a careless reply breaks **FTC 16 CFR 465.7** (public false accusation);
  - in healthcare, replies that would disclose patient information.
- Write a **monthly root-cause memo** ("the same delivery complaint five times").

Everything routine (alerting, drafting, posting) is now ≈ free. Birdeye already markets "human-in-the-loop for sensitive feedback", so even the judgment slice is being productised.

---

## 7. Is restaurant the right vertical?
**Table 5: verticals compared (2019 Google data, DC | RI; VERIFIED data unless marked)**
| Vertical | Reviews/month p50 | 1–3★ share | Mean ★ of negatives | Lifetime reviews (2021 median) | Owners' reply share (all reviews) | Businesses replying at all | $ lost per bad review per $1M (Table 4, ESTIMATE) | Compliance hook for a careful human |
|---|---|---|---|---|---|---|---|---|
| Restaurant | 5.4 \| 5.2 | 17.5% \| 18.1% | 2.2 | 146 \| 158 | 12% \| 10.5% | 30% \| 24% | $17–366 | FTC 465 (all verticals) |
| Hotel | 15.7 \| 5.2 | 14.5% \| 21.4% | 2.1 | 658 \| 218 | 25% \| 20% | 48% \| 55% | low (high counts) | — (mature tools; human replies already $49/outlet) |
| Dentist | 1.25 \| 0.5 | 9.3% \| 5.9% | 1.3–1.5 | 58 \| 48 | 23% \| 24% | 39% \| 33% | **$1,040–2,900** | **HIPAA:** OCR settled with Elite Dental ($10k, 2019), New Vision Dental ($23k, 2022), Manasa Health ($30k, 2023) over review replies (SEARCH-SUMMARY; hhs.gov 403) |
| Med spa | 2.0 \| 1.1 | 8.5% \| 9.9% | 1.6 | 78 \| 35 | **49% \| 52%** | 70% \| 71% | **$654–1,860** | HIPAA if medical services |
| Home services | 0.33 \| 0.33 | 11.8% \| 8.4% | 1.4–1.5 | 14 \| 18 | **62% \| 62%** | 29% \| 50% | high (tiny counts); revenue NOT FOUND | — |
| Auto repair | 0.5 \| 0.75 | 15.1% \| 11.9% | 1.6 | 28 \| 36 | 32% \| 51% | 20% \| 33% | **$1,460–4,084** | — |
| Law firm | 0.25 \| 0.25 | 12.1% \| 7.7% | 1.5 | 7 \| 8 | 23% \| 38% | 16% \| 28% | **$4,384–13,091** | Lawyer confidentiality rules (not verified this session) |

Revenue inputs: GP dentist gross billings ≈ $942k–966k (ADA HPI via secondary sources) and med spa average revenue $1.40M (AmSpa 2024) (both SEARCH-SUMMARY). Small counts: DC home services n=21 and med spa n=20–24; treat these as directional.

**Reading:**
- **Restaurants** have the most events and the least money per event, and the routine part is already software. They are the **worst** fit for a human desk and the best fit for software, which is crowded.
- **Dental and med spa** fit the desk best:
  - each incident is 10–60× costlier;
  - negatives are mostly 1★ (vitriol, harder to answer);
  - owners already show they care: med spas reply to half of all reviews, and a third of dental practices reply at all;
  - a careless reply is a **federal compliance risk** with public penalties, which gives a human reviewer a reason to exist;
  - incidents are rare (one every 3–12 months per practice), so one person can cover many practices.
- **Law** is the extreme: stakes are high but events are once every few years. Sell it per incident, not by subscription.
- **Home services and auto** have high stakes per event but owners already reply at 50–60%, so they DIY.
- **Velocity is the wrong filter.** Use **stakes per event × the share of owners who already reply** instead.

---

## 8. Route for an unknown Dhaka team
| Route | Who bills / how we get paid | Bangladesh payout | Evidence | Verdict |
|---|---|---|---|---|
| **Agencies, white-label** (dental and med-spa marketing agencies for the pivot; restaurant agencies in round 1) | We invoice the agency through Payoneer | Works (Payoneer, VERIFIED in round 1) | Round 1: agencies already resell reputation; cold-email reply ≈ 1–5% | **Best route**, but Read is weak. Lead with a proof built from their clients' public reviews. |
| **HighLevel marketplace** (app or snapshot) | HighLevel bills agencies and remits our share; **"will not charge any commission on developers' revenue until December 31, 2026"** | **NOT FOUND** (re-searched docs and web; nothing on method or countries) | VERIFIED (gohighlevel.com/landing-marketplace) | A reply-writing app is dead (Reviews AI at $0.01). A "sensitive-review triage + HIPAA guard" snapshot might sell; check payouts first. |
| **Square App Marketplace** | App Subscriptions billing is for **US-based developers only** | No | SEARCH-SUMMARY (developer.squareup.com; page 404 on fetch) | Blocked |
| **Clover App Market** | Clover collects app fees; ~70% royalty; "revenue is issued to your US-based bank in dollars"; "Developers from any region may apply" | Needs a US bank. A Payoneer USD receiving account *might* qualify: NOT VERIFIED | VERIFIED (docs.clover.com) | Possible later; restaurant POS, so the same weak restaurant economics |
| **Google search demand** | n/a | n/a | Autocomplete shows software-shaped intent ("restaurant reputation management software", "ai restaurant reputation management", "dental reputation management software", "white label reputation management affordable") (VERIFIED as observed). Volumes: NOT FOUND (no keyword tool) | We would compete with Birdeye and Podium for software keywords. Weak for a service. |
| **Cold email to single owners** | Payoneer | Works | Round 1: ≈ 1% replies; most-pitched inbox | Don't |

---

## 9. Verdict
### KILL: the restaurant reputation desk (single owners or chains of mid-range restaurants)
1. **The buyer the CEO imagines (≥100 reviews a month) is 0.1–2% of restaurants,** and they are landmarks that either don't reply or already have staff (§1, VERIFIED data).
2. **Each month of a typical mid-range restaurant's bad reviews adds only ≈ $175–390 a year of revenue drag per $1M of sales** (§5, ESTIMATE), and the desk cannot erase it. The value of replying at all (≈ $500–900 a month of revenue, from the +0.12★ effect) is captured by $0.01 AI drafts.
3. **69–76% of restaurants don't use the free version.** An unaware market is a cost for an unknown seller (§4).

The CEO's instinct that "10 a month won't hire us" is right. His hope that "100 a month will" is wrong on count, and wrong on stakes too: busier places lose less per review.

### PIVOT (side test only, not the company): "bad-review incident desk" for dental and med-spa practices, white-label through their marketing agencies
- **What:** we watch every client's Google profile (free API or alerts). On each 1–2★ review we deliver within 24 hours:
  - a reply that is compliance-checked: no patient confirmation, no PHI, no accusation, no incentive;
  - an escalation pack when the review is extortion or violates policy;
  - a monthly "why" memo.

  The agency posts the reply or gives us Manager access. We never ask for a review change, which keeps us halal-clean and compliant with Google policy, FTC 465 and the DMCC Act.
- **Why it fits:**
  - each incident is $650–2,900 a year of revenue at risk per $1M (ESTIMATE);
  - the human has a real job (the compliance judgment);
  - work per client is tiny: 0.1–0.3 incidents a month, so ~150 practices is ~15–45 incidents a month, ≈ 10–30 team hours (ESTIMATE). That fits two people with jobs.
- **Price (ESTIMATE):** $49–79 per practice a month wholesale for watch + incidents, or $99 per incident ad hoc for practices with no subscription.
- **Size if it works:** 4–6 agencies × 15–25 practices × $49–79 = $2.9k–11.9k a month; **mid case 5 × 20 × $59 ≈ $5.9k a month in 12–18 months** (ESTIMATE). 150 practices is about the team's capacity ceiling. That is a solid side line, not a large company.
- **Odds:** ≈ 10% to reach $3k/month in 12 months (ESTIMATE). Birdeye, Weave and Podium already sell dental reviews software, and agencies may already do this in-house.
- **Months to first $:** 1–2 (a per-incident fee paid by Payoneer request).
- **Cheapest test** ($0, 7 days, about 5 team hours):
  1. **Partner (2 h):** pick 40 dental practices in 4 metros (NYC, Chicago, London, Toronto) from Google Maps results ranked 6–15 for "dentist". For each, record: reviews in the last 90 days; 1–2★ reviews in the last 12 months; how many of those got a reply; and whether any reply confirms the person was a patient or mentions treatment (a PHI-risk reply).
  2. **CEO (3 h):** find 10 dental or med-spa marketing agencies with public client lists. Send each a one-page proof covering 3–5 of their clients: unanswered 1★ reviews and PHI-risk replies, linked to the OCR cases. Offer 3 incidents free, then $99 per incident.
- **GO:** ≥2 positive replies out of 10 **and** ≥1 paid incident (≥$99) within 21 days, **and** the audit finds ≥20% of practices with an unanswered 1–2★ review or a PHI-risk reply.
- **STOP:** 0 positive replies from 10, or ≥2 answers of "our software already does this", or the audit finds <10% of practices with an unanswered 1–2★ review or a PHI-risk reply.

### KEEP? No
Re-open the restaurant version only if the Appendix A sample shows **≥25% of mid-range independents at ≥30 reviews a month** and **≥60% of their 1–3★ reviews unanswered**. That would require far more growth since 2019 than the evidence suggests.

**Niche Card (for the manager's merge)**
```
### Bad-review incident desk for dental / med-spa practices (white-label via agencies)
- Demand now: dentists ~0.5–1.25 Google reviews/month, 6–9% 1–3★ (mostly 1★); med spas ~1–2/month, 8.5–10% 1–3★ (VERIFIED data, 2019); healthcare review volume +36.3% in 2025 (Birdeye, VENDOR CLAIM via search summary)
- Trend: rising (reply share of reviews 2016→2020 +2 pts/yr; Birdeye 2024/2025 growth)
- Incumbents: Birdeye (~$299+/loc), Podium ($399–599/mo), Weave (bundled; NOT FOUND price), HighLevel Reviews AI ($0.01–0.08/reply)
- Weakness: AI replies are generic, and "Generic or templated replies put off 50%" of consumers (BrightLocal 2026, round 1); OCR has fined practices over replies ($10k–30k)
- Flood: AI review-reply tools are many (Chrome store, G2): routine replies are flooded; compliance-judged incidents are not (no seller found, NOT FOUND ≠ none)
- Platform build-in risk: HIGH for routine replies (Google AI test, HighLevel, Toast); LOW–MED for the judgment slice
- Blast radius: MED (a bad reply is public and can be a HIPAA breach): needs a checklist and agency approval
- Our edge: careful human judgment at Dhaka cost, on rare events; checklist discipline (partner)
- Revolutionary angle (hypothesis): sell "incidents handled", not "reviews replied"; price per event, priced off stakes
- Route beyond store search: dental/med-spa marketing agencies (white-label); HighLevel snapshot if payouts reach Bangladesh
- Money guess: 4–6 agencies × 15–25 practices × $49–79 = $2.9–11.9k/month; mid ≈ $5.9k in 12–18 months (ESTIMATE)
- Halal: OK (general healthcare); exclude haram-adjacent aesthetics only if the CEO judges so
- Scores 1–5: Demand 2 · Weakness 3 · Wave 3 · Edge 3 · Low flood 3 · Low blast 2 → MAYBE (side test only): stakes per event are real, but incumbents and the agencies themselves may already cover it
```

---

## Appendix A: 2-hour manual sampling protocol (to calibrate 2026 velocity)
**Goal:** replace the 2019 multiplier with 2026 counts in four of our countries.
1. **Frame (no Google ranking bias).** Draw 25 random food businesses per city from the official registers:
   - **NYC** DOHMH inspections (open data);
   - **London or Manchester** FSA ratings API (round 1 used it);
   - **Toronto** DineSafe;
   - **Chicago** food inspections.

   Keep only full-service "restaurant" types. Drop businesses with alcohol licences where the register shows them (NYC: ~4 in 10, round 1).
2. **Per restaurant (≤70 s):** open it on Google Maps → Reviews → sort "Newest". Record:
   - (a) reviews dated in **days or weeks** (≈ last 30 days), capped at 60 (write "60+");
   - (b) how many of those are 1–3★;
   - (c) how many of those 1–3★ have an owner reply;
   - (d) total review count and rating;
   - (e) price level.

   Use one shared sheet with no reviewer names.
3. **Decision rule:**
   - Velocity multiplier = median(2026 count) ÷ 5.1–5.5 (the 2019 median for restaurant-category businesses, DC/RI).
   - If **≥25% of the sample has ≥30 reviews/30 days and ≥60% of their 1–3★ are unanswered**, the restaurant desk earns a re-look (route: groups and agencies).
   - If **<15% has ≥30**, the kill stands.
   - In between: still kill for single owners; groups only.

## Appendix B: what I could not verify
- The 2019→2026 growth multiplier (Birdeye is biased up; Black Box page 403).
- UK, CA and AU velocity: no open dataset.
- Anderson–Magruder abstract wording (journal 403; release opened).
- Restaurant revenue from Census (API needs a key; FRED refused connection).
- Who writes replies (owner, staff or agency): no survey found.
- Whether Luca's elasticity transfers to Google in 2026 and to dental, med-spa or legal practices.
- **HighLevel payout method and Bangladesh eligibility.**
- Square payout terms (page 404).
- Whether Clover accepts a Payoneer US receiving account.
- Weave's price.
- HHS OCR pages (403; three law-firm or trade sources agree).
- Lawyer confidentiality rules on review replies (not searched).
- The share of 1★ reviews that are true "hard cases" (needs text classification).

## Sources (opened unless marked)
- UCSD Google Local Data page: jiachengli1995.github.io/google/index.html. Mirror: mcauleylab.ucsd.edu/public_datasets/gdrive/googlelocal/ (DC and RI review + meta files).
- Luca, HBS: hbs.edu/faculty/Pages/item.aspx?num=41233
- UC Berkeley news, 2012-09-04: news.berkeley.edu/2012/09/04/yelp-reviews-boost-restaurant-business/. RePEc entry for Anderson & Magruder (Economic Journal 122(563):957–989).
- Proserpio & Zervas: api.crossref.org/works/10.1287/mksc.2017.1043
- Birdeye State of Online Reviews 2026: birdeye.com/blog/state-of-online-reviews/
- HighLevel marketplace: gohighlevel.com/landing-marketplace
- Clover multiple markets: docs.clover.com/dev/docs/multiple-markets
- RecensioAI restaurant benchmark (US median 2,629 reviews per studied profile, n=360, Aug 2026; not velocity): recensio-ai.lovable.app/benchmark/restaurants
- Search-only (SEARCH-SUMMARY):
  - Black Box Intelligence reputation benchmarks;
  - Search Engine Land (Google AI replies, 2026-03-20);
  - HighLevel AI pricing guides (BotPenguin, netpartners);
  - CostBench and PricingSaaS (Podium);
  - Food on Demand (Ovation, 2020);
  - Thryv earnings coverage;
  - Uberall survey;
  - HIPAA cases (HIPAA Journal, DLA Piper, Nixon Peabody, Dinsmore);
  - AmSpa recaps;
  - ADA HPI via Becker's and Dentaltown;
  - Metrobi and IBISWorld (restaurant revenue);
  - Square developer docs (App Subscriptions);
  - Reviewflowz blog (Square Plus).
- Round-1 facts reused: research/notes/ceo-idea-reputation-desk.md; research/opportunities/M1-reputation-desk.md; research/round2/tests/C6-toast-hours-sync.md.

**Reproduce:** the scripts in `/tmp/partD_scripts/` (`gl_analyze.py`, `gl_verticals.py`, `gl_scale.py`, `gl_pain.py`, `gl_tierL.py`, `gl_top.py`) run with `python3 -I <script> <meta.gz> <review.gz>`.
