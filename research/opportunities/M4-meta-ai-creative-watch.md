STATUS: FINAL

# M4 — "Shipped vs approved" watch for AI-altered ads (non-bot test)
**Model:** M4 New-Category Bench · **Companion:** Phase 2 Opus, 2026-10-29
**One line:** A white-label weekly check for performance agencies. Have Meta's Advantage+ creative enhancements, or Google's AI Max text customisation, changed what a client's ads actually show (cropped logos, added music, rewritten text, warped products)? Are the opt-outs still off? Each check produces a signed discrepancy log for the client's brand and legal sign-off.
**Why tested:** the brief asked for at least one M4 opportunity that is *not* bot QA. This is a new duty (2025–26) that the platforms have pushed onto advertisers, and agencies are now doing it by hand.
**Labels:** VERIFIED = primary page opened by me on 2026-10-29 · VENDOR CLAIM · SEARCH-SUMMARY · ESTIMATE · NOT FOUND.

---

## (a) Path Test v2 card
```
OPPORTUNITY: AI-altered ad watch (Meta Advantage+ / Google AI Max) for agencies | MODEL: M4
GATES: G1✔(client screening) G2✔ G3✔(cap breaker: agency resells across many ad accounts) G4✘→partial (Meta approval workflow in testing; tools exist) G5✔ G6✔
STEPS: Home 1-soft(H,E1) · Road 1(H,E1) · Letter 1(H,E1) · Read 1(H,E1) · Impressed 2(M,E2 if artefact visible) · Reply 1(M,E2) · Trust 2/1/1 · Pay 2(M,E1) · Repeat 2(M,E1)
CHAIN: 1 (Home, soft, E1) | TWO-KEY: 1 of 3 (Pay) → WEAK BY DESIGN
FALSE-0 FIXES: Home → Rc (look for visible AI artefacts in Meta's public Ad Library instead of needing account access) — UNTESTED; Read → Rg (one agency = many ad accounts)
FALSE-2 CATCHES: Trust-risk → P2 (full checks need Ads Manager analyst access); Repeat → P10 (Meta says opt-outs now persist; approval workflow coming)
SOFT-0 TEST TO RUN (≤2h, $0): PARTNER CHECK below — does Ad Library show AI-altered versions?
```

### Gates
| Gate | Result | Evidence |
|---|---|---|
| G1 Halal | ✔ with screening | Refuse clients in alcohol, gambling, interest-based finance, adult and dating. Check modest-imagery comfort for fashion clients (a CEO judgment call). |
| G2 Licence | ✔ | No ad-claims legal opinion. We log differences against the client's approved asset and brand rules. |
| G3 Capacity | ✔ | ~20–30 min per ad account per week (ESTIMATE). One agency with 20 accounts ≈ 8–10 h/month. |
| G4 AI substitution | **partial ✘** | At Cannes Lions (June 2026), Meta announced an "AI Creative Solution" including "a creative approval workflow", still in testing, with WPP as the first pilot (adlibrary.com, 2026-09-20; VERIFIED page, vendor blog). Meta says advertisers "can opt out of AI creative testing at any time" (Marketing Brew 2026-04-21, VERIFIED). A secondary report says opt-outs have been saved persistently since March 2026 (SEARCH-SUMMARY, BizFluent). Google added previews of up to 10 AI-written samples and "text guidelines" (2025-09-10) (SEARCH-SUMMARY). Each of these shrinks the human check. |
| G5 Demand trend | ✔ | See (c). |
| G6 Killed list | ✔ | "AI video ads" is killed. This is checking ads, not making them. |

### Step card (R5)
| # | Step | Score | Basis / evidence |
|---|---|---|---|
| 1 | Home | **1-soft** | H / E1. It is unknown whether Meta's public Ad Library shows Advantage+-altered versions. One search found no source either way (NOT FOUND). Without it, the sample needs the agency's account access (P2). |
| 2 | Road | 1 | H / E1. Meta-ads agencies are plentiful (directories, Shopify partners), but **no list was built** (not a top-2 pick). |
| 3 | Letter | 1 | Depends on Home. |
| 4 | Read | 1 | H / E1. Agency inboxes are flooded. The trigger is relevant, but this duty is also offered by VAs at $15–20/h. |
| 5 | Impressed | 2 | M / E2 *if* an artefact is visible. A "two handlebars on a bike" style error is checkable in 5 seconds: REI's two-handlebar bike ad ran about a week (SEARCH-SUMMARY, Gadget Review / Vibe Graveyard). |
| 6 | Reply | 1 | M / E2. A real trigger exists (Marketing Brew 2026-04-21: agencies report "trouble turning off AI tools despite their best efforts"). Many agencies absorb it in-house: Flat Circle (~$100M/yr Meta spend) is "setting aside several mornings a week to manually check" (Shopifreaks 2026-01-05 citing Business Insider; VERIFIED page). |
| 7 | Trust | 2 / 1 / 1 | Identity M. Competence: needs Ads Manager fluency we must show. Risk: account access must be granted (P2), although agencies routinely give analyst access to contractors (ESTIMATE). |
| 8 | Pay | 2 | M / E1. Agencies already pay offshore Meta-ads VAs (Upwork and onlinejobs.ph posts at $8–25/h; SEARCH-SUMMARY). Payoneer ACH for US, card for others. |
| 9 | Repeat | 2 | M / E1. Weekly by nature: settings and creatives change, and the client's sign-off cycle repeats. |

---

## (b) Reply Card
```
BUYER: founder / head of paid social at a 5–30 person e-commerce performance agency running Meta Advantage+
CONTACT POINT: agency site contact or founder email (list NOT built — not a top pick)
CHANNEL + legal: email to US/UK/AU companies (CAN-SPAM / PECR corporate / AU Spam Act conspicuous-publication rule); no EU
TRIGGER: Marketing Brew 2026-04-21 (agencies can't keep AI tools off); adlibrary.com 2026-09-20 ("the top complaint of the 2026 Advantage+ rollout"); Meta: reviewing AI output is "the advertiser's responsibility" (quoted by Common Thread Collective)
LINE ONE: "Your client [brand]'s live ad [Ad Library ID] shows text Meta rewrote: [quote]." (only if Ad Library shows it)
PROOF: Ad Library link + side-by-side with the brand's site/product photo
IDENTITY LINE: "MD Nahin and [partner], Dhaka, Bangladesh; faces and sample: [link]"
RISK REVERSAL: first 3 accounts checked free for 1 week; then $X per account/month, cancel anytime
EASY ANSWER: "Want the weekly log for this client? yes/no"
SEND TIME: US 09:00 EDT/EST = Dhaka 19:00/20:00; UK 09:00 GMT = Dhaka 15:00
TEST: A = artefact screenshot vs B = "settings drift" angle; 30 + 30; T34
EXPECTED: 3–5% (ESTIMATE; no edge beyond diligence)
```

---

## (c) Filters
- **Work level:** medium. This is checklist work, the partner's strength, but it sits close to "VA" work.
- **Demand trend (dated, earlier vs now):**
  1. **Oct 2025:** True Classic's AI-generated "grandma" ad, plus agencies reporting settings that switch back on (Shopifreaks 2026-01-05, citing Business Insider; VERIFIED page).
  2. **2026-04-21:** Marketing Brew: "Marketers and agencies say they have had trouble turning off AI tools despite their best efforts" (VERIFIED).
  3. **2026-09-20:** adlibrary.com calls it "the complaint spreading across agency accounts through 2026" and Meta's direction "more automated editing, not less" (VERIFIED, vendor blog).

  **Trend: rising complaints, but the platform fixes are arriving too** (persistent opt-out reported; approval workflow in testing).
- **AI substitution (12–24 months): high.** Meta's own approval workflow, Google previews, and third-party creative-analysis tools (adlibrary.com advertises "Structured AI Analysis of Ad Creatives"; VERIFIED on page).
- **Team fit:** partner yes. The CEO's edges (Bangla, Dhaka) are unused.
- **Halal:** OK only with client screening.

## (d) Real price evidence
| Price | Label |
|---|---|
| Meta-ads roles on Upwork: $8–25/h (expert, part-time) and $10–45/h; onlinejobs.ph agency role $15–20/h; a full-time VA doing pre-launch QA (budgets, links, creatives, copy, placements) at **$1,500/month** | SEARCH-SUMMARY (listings, some undated) |
| A hiring guide says freelancers cost ~$25–100/h, and agencies bundle the work into $3,000–10,000/month retainers | VENDOR CLAIM (Adsnipper 2026 guide) |
| A price for a standalone "AI-alteration watch" service | **NOT FOUND** (2 searches). It seems to be bundled into management fees or VA work. |
**Implied price (ESTIMATE):** $40–80 per ad account per month, at about 1 h/month per account. That is a cheap-labour price band.

## (e) Money path and scenarios
**Path:** 1 agency trial (3 accounts free for 1 week) → $50/account/month → an agency with 20 accounts = **$1,000/month** (Rg; ESTIMATE).
| | Low | Mid | High |
|---|---|---|---|
| Reachable agencies | 100 | 100 | 100 |
| Positive reply | 2% | 4% | 8% |
| Reply → paid | 20% | 25% | 33% |
| Clients | 0.4 → 0 | 1 | 2–3 |
| Accounts × $50 × months | 0 | 8 × $50 × 6 = $2,400/yr | 2.5 × 15 × $50 × 9 ≈ $16,900/yr |
All rows are ESTIMATE. The high case depends on Meta *not* shipping its approval workflow broadly within 12 months, which is unlikely in my judgment.

## (f) Cheap test (7 days, <$20)
**Yes, $0:**
1. **PARTNER CHECK (2 h):** open facebook.com/ads/library for 20 DTC brands known to run Meta ads (fashion, outdoor, cosmetics). For each, record (a) whether any version shows a visible AI artefact (garbled text, warped product, added music on an image ad) and (b) whether Ad Library shows more than one version per ad.
2. **Decision:** if ≥3 of 20 brands show checkable artefacts, Home turns into a 2 by Rc. Then email the 3 agencies behind those brands, found from their own client pages. If 0 of 20, **drop it**: the product needs account access first, which kills cold proof.

## (g) Monday walk-through
- **CEO:**
  1. Choose 20 DTC brands (1 h).
  2. Find each brand's agency from agency case-study pages (2 h).
  3. Draft the letter.
- **Partner:**
  1. Run the Ad Library check (2 h).
  2. Screenshot and log.
  3. Screen out haram-vertical brands.
- **Plane:** if Ad Library shows nothing altered, step 2 needs agency logins we don't have. That is P2, and the opportunity drops.

## (h) Red team
**Strongest reason it fails:**
- The platform fixes it. Meta says opt-outs persist and is testing a creative approval workflow.
- Meanwhile agencies already do the check with in-house staff or $15–20/h VAs.
- Our only edge is diligence, which is not an edge against cheap offshore labour (brief lesson: "Cheap labour is not an edge").

**Counter-evidence search run:** "Meta Ad Library shows Advantage+ variations" found nothing. The visibility of AI changes from outside is **unproven**. "Ad QA specialist" found no standalone market, only bundled VA roles.

## (i) vs Shothik
| Step | Verdict | Why |
|---|---|---|
| Read | **Same (1)** | Flooded agency inboxes vs message requests |
| Trust | **Worse** | Needs account access (P2) and Ads Manager competence. Shothik needs Google access too, so it is roughly equal on risk and worse on competence. |
| Pay | **Better** | Agencies pay VAs online |

## (j) Intelligence verdict
It is a real, dated, new duty, so the M4 thesis ("a new category agencies can't yet deliver") is correct here. But this is the case where the **formula would mislead upward on Repeat and Pay**. The weekly money and an easy rail don't matter when the platform owner is shipping the fix and the substitute is a $15/h VA. I don't believe in it as a lead opportunity. Keep it only as a two-hour Ad Library check. Its main value is confirming that the bot-QA verdict generalises: **M4 works only where the human part is something software and cheap labour cannot supply** (language, presence, identity).

## Sources opened (2026-10-29)
- shopifreaks.com/meta-advantage-is-forcing-unwanted-ai-creative-on-brands/ (2026-01-05)
- marketingbrew.com/stories/2026/04/21/meta-ai-creative-tools-marketer-response
- adlibrary.com/posts/advantage-plus-creative-changes (2026-09-20)
- commonthreadco.com/blogs/coachs-corner/meta-ai-ad-tools-auto-enrollment-audit-2026 (undated)
