STATUS: FINAL

# M3 — Ramadan 1448 sponsor desk for Muslim-audience media (affinity), scored side by side with its open-market twin
Opus companion, 2026-10-30. Model M3, hunting ground 3 ("Muslim-audience creators and media"). Per the CEO's 2026-10-30 scope rule, the open-market version (a direct-to-owner sponsor desk for mainstream niche podcasts and newsletters, no affinity) is scored in the same card.
**Labels:** VERIFIED · VENDOR CLAIM · SEARCH-SUMMARY · ESTIMATE · E3 (counted by me).

## What it is
We write to English-language Muslim-audience podcasters, YouTubers and newsletter writers (UK, US, Canada, Australia):
- "Ramadan starts ~8 February 2027. You carried no sponsor last Ramadan."
- "These halal brands and Muslim organisations already sponsor shows like yours."
- "We'll sell 1–3 Ramadan sponsorships for you, commission only, you approve each sponsor."

The sponsor pays the owner; we invoice 20–30% of what was paid.

## Evidence base
**E3 scan of the owner side** (my count, 2026-10-30; file `research/handoffs/M3-muslim-podcast-feeds-2026-10-30.tsv`):
- **Method:** Apple Podcasts Search API (terms muslim, islam, islamic, quran, ummah, deen; stores US, GB, CA, AU; 9 of 24 queries rate-limited) → 559 shows → **148 active** (an episode since June 2026, feed parsed) → last 30 episodes' notes scanned.
- **Third-party commercial sponsors appear on only 4 of ~147 Muslim shows (≈3%)**, all small Muslim organisations:
  - Fawakih Arabic on *Quran Conversations* (UK);
  - Seed Education Trust and Musletter on *The Thinking Muslim*;
  - Naseeha Mental Health and a book discount code on *Adventures of Muslim Kids*;
  - Rabata on *Islamic Feelings*.
- About 25 shows ask listeners for donations or Patreon support. Many of the largest feeds are lecture archives (Muslim Central: Mufti Menk 3,152 episodes, Yasir Qadhi 2,541), not commercial creators.
- 86 active shows with ≥20 episodes publish an owner email in their feed.
- **Rough baseline, same method:** 7 of 61 active US "small business" podcasts show sponsor phrases in ≥3 of their last 30 episodes (≈11%, not hand-checked).

**The sponsor side exists, but it is concentrated in other formats:**
- **Muslim Ad Network** (Ummah Media Group, "16 years"; VERIFIED page) sells display, native, video and mosque screens:
  - Starter $1,000–2,500/month;
  - Growth $2,500–10,000/month ("Ramadan campaigns");
  - Enterprise $10,000+.
  - Case: **Amana Mutual Funds "$35K committed over 6 months"**.
  - Other named clients: UNHCR, ICNA Relief, Greenpeace, Air Canada, East Essence, Boxed Halal.
  - Publisher promise: "No alcohol, gambling, or interest-based financial ads."
- **Islam Channel's Ramadan Media Pack 2026** (VERIFIED PDF): Iftar/Suhur and programme sponsorships, "speak to them for rates".
  - Reach: 1.3M viewers in Ramadan 2025 (BARB).
  - Charity appeals: Islam Channel Bangla viewers donated over £1M in one night.
  - Testimonials from Al Rayan Bank and The Halal Guys.
- **Ramadan date:** projected to begin **8 February 2027**, with Eid on 9 or 10 March (The National, 9 Sep 2026, citing the UAE Astronomy Centre; VERIFIED).
- **Muslim-podcast rate cards:** NOT FOUND (searched IFG, Amaliah, "Muslim podcast media kit"). Islam Channel and Muslim Ad Network quote on request or in tiers.

**Open-market twin evidence:**
- Paved's January 2026 report: publishers earned 30% more than in 2024 and marketers ran 40% more campaigns (VERIFIED via ppc.land, 22 Jan 2026).
- Paved's Q3 2026 benchmarks: $1.22–18.47 per 1,000 subscribers by category (VERIFIED via ppc.land, 30 Aug 2026).
- InboxReads: **77% of newsletters submitted were seeking sponsorships** (17 Dec 2025, cited in ppc.land). Supply outnumbers sponsors.
- Book a Sponsor automates the sponsor search for any owner from $19/month for 600 emails, taking 0% (VERIFIED; see `M3-creator-sponsor-seat.md`).

## (a) Path Test v2 card (two columns: A = affinity, O = open-market twin)
```
OPPORTUNITY: Ramadan sponsor desk | MODEL: M3
GATES (A): G1✔ (pool is halal by self-selection; flag: charity ad budgets must not come from zakat; Islamic banks/takaful/screened funds OK; crypto, dating-adjacent and conventional finance out)
           G2✔ G3✔ (cap breaker: commission; AI does sponsor mapping) G4✔-mostly (generic tools pitch any brand; the halal screen + "who buys Muslim media" knowledge is human) G5✔ (dated: Ramadan 2027 = 8 Feb; MAN "Now booking Ramadan" pages) G6✔
GATES (O): G1✔ with screening  G2✔ G3✔  G4✘-partial (Book a Sponsor, beehiiv network, Paved)  G5✔ (Paved +30%/+40%, Jan 2026)  G6✔

STEP            A (affinity)                         O (open market)
Home            2 (M,E3) RSS method done, ≤4 h/show  2 (M,E3) same method
Road            2 (M,E3) 86 active shows w/ email    2 (M,E3) Apple API + feed emails; 77% want sponsors
Letter          2 (M,E2) "no sponsor last Ramadan"   2 (M,E2) "no sponsor in 30 episodes"
Read            1 (Delivered 2 · Noticed 1(H) · DM 2) 1 (Delivered 2 · Noticed 1 · DM 2; unsolicited commission offers read as broker scams)
Impressed       2 (M,E2) named sponsors, episode URLs 2 (M,E2)
Reply           2 (M,E2) dated trigger: Ramadan 8 Feb 2027 1 (H,E1) no dated trigger (Q4 budgets only)
Trust I/C/R     2/1/2 → 1                            2/1/2 → 1  (identity weaker: no shared signal)
Pay R/U/C       2/1/1 → 1                            2/1/1 → 1
Repeat          1 (two seasons a year: Ramadan, Dhul Hijjah/Qurbani) 2 (year-round renewals)
SPONSOR CHAIN   Road-sponsor 1 (thin pool: ~3% of shows carry any commercial sponsor; buyers concentrated in MAN/Islam Channel)
                O: Road-sponsor 2 (Book a Sponsor lists 227 emailable buyers for one niche) but Reply-sponsor 1 (0.31% yes/pitch, VENDOR)
CHAIN           A: 1 (Read/Trust/Pay, E1) | O: 1 (Read/Reply/Trust/Pay, E1)
TWO-KEY         A: 0 of 3 → WEAK BY DESIGN | O: 0 of 3 → WEAK BY DESIGN
FALSE-0 FIXES:  Sponsor Road (A) → Ra: sell the sponsor side through the intermediaries that already aggregate halal advertisers (Muslim Ad Network, Islam Channel), i.e. a seat, not a desk (untested)
FALSE-2 CATCHES: "Road = 2" on the owner side hid a thin sponsor side (E3: ~3% sponsored), and "affinity = Read ✔" is an ESTIMATE (no study; T4 says A/B test it)
SOFT-0 TESTS (≤2h, $0): ask 10 owners one yes/no question (below) and count replies; separately ask 5 past Muslim-media sponsors (Fawakih, Musletter, Seed, Rabata, Naseeha) whether they plan Ramadan 2027 placements
```
**Planes:**
- P5 is light: UK/Australian owners and sponsors sit in Dhaka-friendly hours.
- **P8:** creators may only pay by PayPal or Stripe (ESTIMATE; we cannot receive PayPal).
- **P12:** charity sponsors' ad money must not be zakat; we ask each sponsor in writing.
- P7: owners using Gmail addresses are individuals. UK sole traders need consent under PECR, but a podcast's published business-contact email used for its stated purpose is a grey area. Use only addresses published for business enquiries, and add an opt-out.
- P11: no promised sponsor.

## (b) Reply Card (A)
```
BUYER: the host/owner of a Muslim-audience show or channel (solo creators decide alone)
CONTACT POINT: the owner email published in their own podcast feed (<itunes:email>) or "business enquiries" email on YouTube/site
CHANNEL + legal check: plain-text email, identity + opt-out; UK sole traders → only published business-contact addresses; US CAN-SPAM postal address in footer
TRIGGER: Ramadan 1448 ≈ 8 Feb 2027 (The National, 9 Sep 2026); sponsors book in Nov–Jan
LINE ONE: "Assalamu alaikum. Your Ramadan 2026 episodes carried no sponsor; Fawakih Arabic and Musletter sponsored two shows like yours."
PROOF: the two episode URLs where those sponsors ran (their own medium, 30-second check)
IDENTITY LINE: "MD Nahin and [partner], two Muslims in Dhaka, Bangladesh; faces and a sample sheet at [page]."
RISK REVERSAL: commission only; you approve every sponsor; halal screen in writing; we're paid only after the sponsor pays you
EASY ANSWER: "Would one halal Ramadan sponsor be welcome on your show? Reply yes or no."
SEND TIME: UK 09:00 = Dhaka 15:00 (GMT after 25 Oct); Sydney 09:00 = Dhaka 04:00 → schedule-send; US East 09:00 = Dhaka 20:00
TEST: A = Muslim greeting + faith line vs B = neutral English, identical facts (T4); 20 + 20 sends; stop rule T34
EXPECTED: owner replies 8–15% (A) vs 3–5% (B) (ESTIMATE); the real gate is the sponsor reply, not the owner reply
```

## (c) Filters
- **Work level:** medium-high (sponsor mapping, halal screen, pitch, IO, delivery check).
- **Demand trend, dated (≥2 points):**
  - Owner side: Paved publisher revenue +30% vs 2024 and campaigns +40% (22 Jan 2026, VERIFIED via ppc.land); Muslim Ad Network "Now booking Ramadan 2026 campaigns" (VERIFIED page) and its Ramadan tier.
  - Muslim-podcast sponsorship trend: **NOT FOUND**. No earlier dataset exists to compare my E3 count against, so the trend for the affinity niche is unproven.
- **AI substitution (12–24 months):** medium. Discovery is automated (Book a Sponsor). The faith screen and trust are human. But the owner can run Book a Sponsor and screen sponsors themselves.
- **Team fit:** strong for A. Muslim identity, English, Bangla not needed; the partner can run the halal checklist and the tracker. Live calls are rare: sponsors buy by email.
- **Halal:** the screen removes almost nothing from the affinity pool, which self-selects. It removes ~18% of top-tier mainstream podcast spend (betting plus conventional insurance; see the seat file) and more of finance and crypto newsletter sponsors (ESTIMATE). Charity sponsors need a non-zakat budget statement.

## (d) Price evidence
- **Muslim Ad Network tiers** (VERIFIED): $1,000–2,500 / $2,500–10,000 / $10,000+ per month; Amana Mutual Funds $35,000 over 6 months.
- **Muslim-podcast or creator sponsorship prices:** NOT FOUND (no public rate cards).
- **Podcasts generally:** Acast host-read guidance ~$25–40 CPM (SEARCH-SUMMARY).
- **Newsletters:** Paved Q3 2026, e.g. Education $7.21 and Finance $7.11 per 1,000 subscribers (VERIFIED via ppc.land).
- **Our commission benchmark:** 20–35% (posted seats, VERIFIED).

## (e) Money path and 3 scenarios
**Path:** first Ramadan sponsor for one show ($300–1,500, ESTIMATE) → 25% = $75–375 → 4–6 shows × 2 seasons → recurring Ramadan/Qurbani sponsor slates.

**Formula:** owners contacted × owner yes × sponsors closed per yes-owner × deal size × commission × seasons per year.

| Scenario | Assumptions (ESTIMATE) | Result per year |
|---|---|---|
| Low | 40 owners × 10% yes = 4 → 0.25 deals each × $300 × 25% × 1 season | **≈ $75** |
| Mid | 60 × 15% = 9 → 0.5 deals × $600 × 25% × 2 seasons | **≈ $1,350 (~$110/month)** |
| High | 86 × 20% = 17 → 1 deal × $1,200 × 30% × 2 seasons | **≈ $12,200 (~$1,000/month)** |

The binding assumption is "sponsors closed per yes-owner". The E3 scan says the halal sponsor pool for podcasts is small and made of small organisations, so the mid case is more honest than the high case.

**Open-market twin:** larger pool and deal sizes ($450–1,100 per newsletter send from Paved's per-1,000 rates × list sizes, my arithmetic), but no trigger and a commodity substitute. Its mid case ≈ the seat file's mid case (~$180/month).

## (f) Cheap-test check
**Yes: ≤7 days, $0.**
1. Send the Reply Card (A vs B) to 20 + 20 owners from the TSV.
2. **In parallel, send 5 sponsor-side emails** to organisations that already sponsored Muslim shows (Fawakih Arabic, Musletter, Seed Education Trust, Rabata, Naseeha), asking whether they plan Ramadan 2027 podcast placements and at what budget.

Pass = at least 3 owner yeses **and** at least 1 sponsor with a budget. Owner yeses without a sponsor budget = fail (the thin side).

## (g) Monday walk-through
1. **CEO:** pick 20 active owners with feed emails from `M3-muslim-podcast-feeds-2026-10-30.tsv` (or the verified helper list `M3-helper-2-owners.md`). Write the A/B emails.
   - Plane: **identity page missing** (fix: 2 h, Notion, $0).
2. **Partner:** write the halal screen checklist (betting, alcohol, interest finance, BNPL, crypto, adult/dating-adjacent; charity budget = non-zakat) and a 1-page commission agreement (approve each sponsor; pay within 7 days of sponsor payment; Payoneer / UK GBP transfer).
3. **CEO:** email the 5 known small sponsors from a business address.
   - **Plane: no business domain email yet.** Gmail is acceptable for a test but weaker (P3: a domain costs ~$10–15/yr; name it before spending).

## (h) Red team
- **Strongest reason it fails:** the halal sponsor pool for creator media is thin and small-ticket. Only ~3% of active Muslim podcasts carry any commercial sponsor (E3), and those sponsors are small organisations, while the large halal advertisers buy through Muslim Ad Network and Islam Channel, which already have sales teams. Ramadan's biggest money is charity appeals, which run on TV and in the charities' own channels, not as podcast reads. The affinity raises the owner's reply, but the owner was never the bottleneck.
- **Counter-evidence searches run:**
  1. "sponsored by Muzz / Wahed / Tarteel / Islamic Relief… Ramadan 2026": none found; only one 2025 series "supported by Islamic Relief".
  2. "Muslim newsletter/podcast rate card": NOT FOUND.
  3. My own feed scan (≈3% sponsored vs ≈11% in a rough small-business baseline).
  4. Muslim Ad Network's own page shows the incumbent intermediary.

## (i) vs Shothik
- **Read: same.** Both rely on an affinity message to a solo owner. Ours uses a published business email rather than Facebook requests (slightly better delivery), but noticed is unproven for both.
- **Trust: better on risk** (commission only, no logins) and the same on identity (shared faith vs shared origin).
- **Pay: worse.** Shothik's buyer pays us after our own fix. Here the money must first come from a third-party sponsor we haven't found.

## (j) Intelligence verdict
The affinity is real and the trigger is the best dated one in M3. But the formula scores the owner side, and the owner side is easy: owners want sponsors (77% of newsletters do). The scarce side is halal sponsors who buy creator media, and my count says they barely exist at podcast level. I would run only the **5-email sponsor-side test** first: if no small Muslim sponsor names a Ramadan 2027 budget, don't write to a single owner. The open-market twin is worse: no trigger, and the same commodity substitute.
