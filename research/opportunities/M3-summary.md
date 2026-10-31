STATUS: FINAL

# M3 Revenue Partner — Phase 2 summary
Opus companion, 2026-10-30.

**Helper runs used:** 2 of 5, both Sonnet, effort medium, one at a time.
- **Run 1: payout rails for 18 commission programmes.** Output: `research/handoffs/M3-helper-1-payouts.md`. I re-opened Impact.com's currency page (Bangladesh/BDT as a supported bank location; BDT among wire currencies) and Gumroad's collaborator page (the collaborator's portion is "paid out the same way as all other Gumroad creators"; max cut 50%). Both hold.
- **Run 2: owner list.** Output: `research/handoffs/M3-helper-2-owners.md`, 30 rows.
  - 13 Muslim-audience and 10 open-market rows were opened; 7 seeds were not opened, and one domain is now gambling spam (excluded).
  - The helper re-checked 3 rows. I re-checked its seed emails against the owners' own RSS feeds (the helper had marked them "brief only").
  - Gap: the helper saved only at the end instead of every 5 rows, and the Apple API returned 403 to it (the API worked for me earlier).

**My own E3 evidence:** `research/handoffs/M3-muslim-podcast-feeds-2026-10-30.tsv`, 148 active Muslim-audience podcast feeds scanned for sponsors and donation appeals.

## The central findings (read these first)
1. **Pay was M3's weak step, and owner-paid commission cannot fix it.** In every sponsor-sales route the money flows sponsor → owner → us. Collection rests on a stranger's honesty, and the owner's rail is unknown (P8). Pay = 1 by design.
   - **One mechanism does fix it:** a platform that splits each sale at checkout and pays both sides.
   - **Gumroad does this**, and pays Bangladesh in BDT to a local bank: collaborators up to 50%, plus affiliates (VERIFIED, help pages re-opened).
   - **Impact.com** pays partners by BDT wire ($10 minimum; VERIFIED), and **Lemon Squeezy** lists Bangladesh for affiliate bank payouts (helper, VERIFIED page).
   - Networks that name Payoneer but publish no Bangladesh list (CJ, Awin, Admitad) are **plausible, not confirmed**.
   - PartnerStack, beehiiv (now via Dub/Stripe Express), Passionfroot (Stripe) and CommissionCrowd (Stripe Connect) fail or are unknown for Bangladesh.
2. **The core M3 ground, commission sponsorship sales, has been productised.**
   - **Book a Sponsor** finds every brand that sponsored similar shows in the last 90 days plus the ad buyer, and emails them daily: "$1 to start", $19/month for 600 emails, 0% commission.
   - Its live counter reads **39,151 pitches, 123 yeses in 30 days = 3.1 yes per 1,000 pitches** (VERIFIED page; numbers are VENDOR CLAIM).
   - beehiiv's ad network pays ~$1M/month automatically (SEARCH-SUMMARY).
   - What owners still pay 20–35% for is a seller's **relationships**. The posted seats ask for exactly that: 4 of 8 dated Podnews posts require US residence, 2–5+ years, a closed-deal record, or no AI.
3. **Owners are not the scarce side; sponsors are.**
   - 77% of newsletters submitted to InboxReads seek sponsors (Dec 2025).
   - In my scan of 148 active Muslim-audience podcasts, **only ~3% carry any commercial sponsor**, all small Muslim organisations (Fawakih Arabic, Seed Education Trust, Musletter, Rabata, Naseeha), and ~25 rely on donation appeals (E3).
   - The large halal advertisers buy through **Muslim Ad Network** (published tiers $1k–10k+/month; Amana Mutual Funds $35K over 6 months) and **Islam Channel** (Ramadan media pack; Al Rayan Bank, The Halal Guys).
4. **Halal screen, measured.** Among Magellan's September 2026 top-15 US podcast advertisers ($72.1M):
   - betting (DraftKings) = 7.7% of spend;
   - conventional insurance (Progressive, State Farm) = 10.2%;
   - so a strict screen removes ~18% of top-tier spend.
   - The Muslim-media pool loses ~0% (it self-selects), but it is small.
5. **Dated trigger:** Ramadan 1448 is projected for **8 February 2027** (The National, 9 Sep 2026, VERIFIED). Ramadan products and sponsors are bought in November–January, so the test window is now.

6. **Most audience owners worth having already sell something.** Helper 2 opened 22 owners: **12 already sell products, courses or memberships** (Shopify, Beacons, own sites), **none on Gumroad**, and 8 show nothing or donations only. Owner-branded Ramadan products sell above the commodity floor: Freshly Grounded's Ramadan Limited Edition card game costs £18.99, against Gumroad Ramadan planners at $0–5. So the product route's real targets are smaller owners without a store. That caps its volume.

## Buyer list
`M3-creator-product-partner.md` section (k) holds **26 named owners with public contact points** (19 Muslim-audience, 7 open-market): 6 immediate targets, 11 who already sell, and 9 needing a 3-minute PARTNER CHECK. The same rows serve the Ramadan sponsor desk.

## Ranked opportunities
| Rank | File | Chain score | Two-key | Weakest step |
|---|---|---|---|---|
| 1 | `M3-creator-product-partner.md`: build a small paid product with an audience owner from their own content; Gumroad splits each sale and pays us in BDT. A = Muslim creators, Ramadan launch; O = teaching/parenting creators | **1 (Read, H, E1)** | **A: 1 of 3 today (Pay 2 by mechanism); 2 of 3 if the sample test lifts Trust-competence → conditional PASS.** O: 1 of 3, weak | Read (owner inbox, no posted need) + volume (the bigger owners already sell, 12 of 22; the open targets are small) |
| 2 | `M3-ramadan-sponsor-desk.md`: commission on Ramadan 2027 sponsors for Muslim-audience podcasts/YouTube/newsletters; open-market twin scored alongside | 1 (Read/Trust/Pay, E1) | A: 0 of 3; O: 0 of 3 → **weak by design** | The sponsor side: ~3% of Muslim shows sponsored (E3); halal advertisers buy via MAN/Islam Channel |
| 3 | `M3-creator-sponsor-seat.md`: answer posted commission-only sponsorship-sales seats (PodKeys 35% + 20% renewals, closes 4 Nov 2026; KSL 30%; Multitude; Niched; Solomin) | **0 (Trust-competence, soft, E2)** | 1 of 3 (Read) → **weak by design** | Competence: posts demand closed-deal records; 4 of 8 filter out a Dhaka team; G4 partial (Book a Sponsor) |
| 4 | `M3-brand-sponsorship-buyer.md`: sponsor-side buying desk for brands that just started newsletter sponsorships; we invoice the brand (prepaid fee) | 0 (Read, soft, E1) | 0 of 3 → **weak by design** | Read: the brand ad buyer is the most-pitched inbox in the market; zero media-buying record |

**Tie-breaks (R3):** #2 ranks above #3 on chain (1 vs 0). #3 ranks above #4 on two-key (1 vs 0).

## My bet: #1, the creator product partner, A variant first, as a 7-day $0 test
**Why:**
- It is the only M3 road where Pay is a 2 **by mechanism, VERIFIED at the platform's own pages**: Gumroad pays our share at the moment of sale into a Bangladeshi bank. That answers the brief's central question.
- Trust-risk is zero for the owner.
- The proof is their own content turned into a product (Rc).
- The Ramadan launch date gives a real Reply trigger.
- It uses the CEO's existing Gumroad know-how without repeating M7's mistake of selling to no audience.

**What would kill it:**
- 0 yeses from 40 owners (T34).
- Our Gumroad payout verification fails for Bangladesh. Check this first.
- Owners say yes but launch nothing by 15 January 2027.

**Honest ceiling:** mid case ≈ $290/month, high case ≈ $2,500/month (ESTIMATE). Volume is unproven.

**Fold-ins:**
- #2's sponsor intros become stage 2 for owners who launch products.
- #3 is worth exactly one $0 application (PodKeys, before 4 Nov 2026).
- #4 only as a service for brands met through #1/#2.

## M3 as a stage-2 upsell for other models (noted, not filed)
Impact.com's BDT wire makes referral commissions on SaaS used by other models' clients collectable by mechanism. This applies wherever a brand runs its programme on Impact. Programme-by-programme checks are not done here.

## New ideas outside M3 (one line each)
- **AI training-data licensing for creators' back catalogues** (Troveo, Protege/Calliope; agencies such as Viral Nation supply creators). It is money left on the table, but our payout route and the 25,000-hour minimum are unchecked.
- **Paved pays newsletter publishers in BDT** ($1,000 minimum, 2-month cycle; helper, VERIFIED page). If the team ever owns a newsletter (M7 asset), Paved can pay it in Bangladesh by mechanism.
- **A commission seat at a halal ad intermediary** (Muslim Ad Network, Islam Channel) instead of selling show by show: the Ra route for #2. Not researched.
- **Bangla Muslim media in the UK:** Islam Channel Bangla viewers donated over £1M in one night (Ramadan pack, VERIFIED). A Bangla-language sponsor and charity-media niche for M8.
- **Lemon Squeezy affiliate payouts list Bangladesh** (bank, USD): a second rail for M7 asset sales if Gumroad payouts fail (untested in practice).
- **CodeADX** (Shopify stores sponsor podcasts by promo code at ~15%): a substitute for small-show sponsor sales, and a possible tool for #1's owners.

## Three most important verified facts
1. **Gumroad collaborators:** "paid out the same way as all other Gumroad creators", max cut 50% (gumroad.com/help/article/341-collaborations). Gumroad pays Bangladesh in BDT to a local bank, $100 minimum, no Payoneer. **Impact.com** lists Bangladesh/BDT as a supported bank location for wires (help.impact.com, supported currencies).
2. **Book a Sponsor:** 39,151 pitches and 123 yeses in 30 days (3.1 per 1,000), $19/month for 600 emails, 0% commission (bookasponsor.com, read 2026-10-30, re-opened).
3. **Podnews commission seats:**
   - PodKeys 35% + 20% renewal (posted 14 Oct 2026, closes 4 Nov 2026);
   - KSL/Bonneville 30% of net, 5+ years (17 Aug 2026);
   - Solomin $500 + 10%/5%, US-only (25 Oct 2026);
   - Multitude "never use generative AI tools" (8 Jul 2026).

## Not verified
- **Upwork's policy on commission-only contracts.** Support pages blocked (403); search summaries only.
- **Bangladesh coverage for CJ, Awin and Admitad** (they name Payoneer but publish no country list), and for PartnerStack and Dub (beehiiv).
- **A first-hand Gumroad payout to a Bangladeshi bank.** The docs say yes; the CEO's own account would prove it.
- **Sales volumes of owner-branded Muslim digital products**, and Muslim-podcast sponsorship prices (no rate cards public).
- **Whether a Gumroad owner can remove a collaborator after launch.**
- **Whop's payout rail to Bangladesh**, which matters because Whop is the growing platform.
- **Whether Muslim creators' audiences convert** at the assumed 1%.

## Corrections to models.md (for the manager; I did not edit it)
- **M3 "Read ✔ (they post for commission reps)":** posted seats exist (8 dated Nov 2025–Oct 2026 on Podnews, 2 open now), but 4 of 8 filter for US residence or a closed-deal record. Read ✔, Reply and Trust-competence ✘.
- **M3 "Trust ✔ (no risk)":** Trust-risk ✔, Trust-competence ✘. Owners hire sellers for relationships.
- **M3 "Pay ~":** confirmed 1 for owner-paid commission. **New Pay-2 route:** a platform split at checkout (Gumroad collaborators/affiliates; Impact.com for brand programmes).
- **M3 "Why now: AI makes the sponsor-fit research a medium-sized job":** it is now a $19/month product (Book a Sponsor). That part is no longer a paid service (G4).
- **M3 plane "Sponsor data looks paywalled → use public ad reads":** confirmed workable for free. Apple's Search API plus RSS show notes list sponsors and owner emails (E3 method, 148 feeds).
- **M3 hunting ground 3 (Muslim-audience media):** the halal sponsor pool for creator media is thin (~3% of active Muslim podcasts sponsored). Large halal advertisers buy through Muslim Ad Network and Islam Channel.
- **CLAUDE.md "Gumroad via Payoneer":** wrong, as M7 found. Re-confirmed: Gumroad pays BDT to a local bank and does not support Payoneer.
