STATUS: FINAL

# Phase 4 — Independent critic: top 3 + Shothik baseline
Opus critic, 2026-10-30. Brief: `research/briefs/phase4-critic.md`.
Labels: VERIFIED (primary page opened by me today, or two independent sources opened) · VENDOR CLAIM · SEARCH-SUMMARY · ESTIMATE · NOT FOUND.
Tool note: WebFetch is DNS-blocked in this session for most hosts (upwork.com, stocktitan.net). I used curl with a generic browser User-Agent; upwork.com, stocktitan and GlobeNewswire returned 403, so Upwork facts come from syndicated copies (Finviz) or search summaries, labelled as such.

## Summary (read first)
| Target | Verdict | Confidence | Fatal flaw in one line | The one fix |
|---|---|---|---|---|
| #1 M2 Release QA desk | **FIX** | medium | A zero-review proposal in a crowded category may never be opened; in Web Development (nearest proxy) a first conversation costs ≈ $50 of Connects even for experienced agencies, on a marketplace whose job posts fell 4 quarters running. | One honest profile per founder (no shared account), 20 bug-video proposals over 2–3 weeks, crowdtesting in week 1 for references; money mid ≈ $300 at month 6, not $700. |
| #2 M8 Mosque Gift Aid desk | **FIX** (reframe) | medium | For never-recognised mosques the "4-year backlog" may not exist (HMRC sets an entitlement date; a vendor says claims start only at HMRC registration), and the examiner who reads our letter can do the work himself. | Sell white-label Gift Aid prep *to examiner accountants*, lead with recognised-but-lapsed charities; add the HMRC repayment-interest and taxpayer-only lines. |
| #3 M4 Bangla/Sylheti panel | **FIX → side test** | medium | Standard Bengali recognition is now commodity and vendors fail gracefully into a human; the only real gap (Sylheti) is one no vendor claims and the team can't yet supply. | Recruit Sylheti speakers before any send; score time-to-transfer and misheard names; keep it a $5 test, not a weekly commitment. |
| Shothik-Bangla (#11) | **DROP** as a business | high | ~79 named restaurants, logins needed, Zelle/cash habit. | Keep a 1-hour live Bangla call test as calibration only. |
| Shothik-open (#8) | **DROP** stand-alone; keep as opener | medium | The proof is the product (free-rider) against $16–60/location software. | Fold into M1's Location Health bundle; sell the suggested-edit/hijack *watch*, not the fix list. |

**Most dangerous single flaw:** the mosque desk's backlog arithmetic (2a, claim 2). The ranking calls #2 a co-#1 that must start within 2 weeks because of 5 April 2027 deadlines, but for the core segment (never-recognised mosques) the backlog and the deadline may both be void.
**Top-3 order:** keep #1 QA and #2 (reframed); demote #3 to a side test and leave the slot to week-1 evidence (§5b).
**Wrongly cut:** nothing. M6 (#4) and M5 (#6) are, if anything, placed generously: neither has a publicly evidenced buyer (§5d). Two ★ new ideas belong *inside* #1 and #2 now (crowdtesting; Gift Aid via examiners for any charity).

---

## Target 1 — #1 M2 Release QA desk (Upwork route)

### 1a. The three claims from ranking §13
| # | Claim | My check (what I opened or searched) | Verdict |
|---|---|---|---|
| 1 | A zero-review Dhaka profile is *approved* in Upwork's QA category and gets ≥ 7% replies with a bug video, against cheaper testers bidding in the first hour. | **Approval:** Upwork's help pages are 403 to me. Search summaries of Upwork's own beginner guide and staff forum replies say admission depends on "marketplace demand"; forum reports of rejections for "many freelancers with similar skills" are 2016–2020 (SEARCH-SUMMARY). No 2026 primary rule found. **Replies:** GigRadar's Q2 2026 Upwork report (opened by me; VENDOR data from 53k agency proposals, i.e. *experienced* profiles): average reply rate **5.1%** (Q1 5.8%); a Loom link in the cover letter replies at **11.3% vs 6.0%** without one; Web Development costs **≈ $50 of Connects per first conversation** and has "more proposals than jobs". GigRadar gives no QA-specific row; QA sits in Upwork's Web, Mobile & Software Dev category, so Web Development is the nearest proxy (ESTIMATE). | **Overstated.** 7% is *above* the measured average for established agency profiles (5.1%). The bug video is the one real lever (the video lift is the strongest single effect GigRadar reports), but it applies only after the client opens the proposal, and opening is where a zero-review profile is weakest. Honest range for a zero-review profile with a bug video: **3–8%** (ESTIMATE). Approval: an unknown, not a disproof. |
| 2 | QA demand still rises in 2026; Upwork's +9%/+19% (2025) isn't already reversed. | **For:** a search summary of Upwork's "Monthly Hiring Insights: June 2026" says QA Testing **+20% MoM** (June vs May 2026; SEARCH-SUMMARY, the page is 403 to me). Finviz's UPWK news list (opened) shows Upwork stopped press-releasing monthly hiring reports after the Dec 2025 report (2026-01-08), so there is no syndicated 2026 primary copy. **Against (VERIFIED, Upwork Q2 2026 results via Finviz, 2026-08-10):** GSV **$966.4m, −4% YoY**; active clients **763k vs 796k (−4%)**. **Against (VENDOR, GigRadar Q2 2026, opened):** 448,118 jobs posted in Q2, **−14.2% QoQ, the fourth straight quarterly fall**; UK client posts −18.1% QoQ; "Expert-level jobs fell 19.1%". | **Holds only as "QA is a relatively strong category in a shrinking marketplace."** MoM percentages are month-to-month swings, not a trend; the marketplace itself is shrinking and its Western clients are leaving fastest. G5 should read "category resilient, platform shrinking". |
| 3 | Small teams keep paying for release passes (Repeat H; $500/client/month average). | No evidence found for or against a $500/month QA retainer from Upwork SMB clients. GigRadar: sub-$500 fixed-price jobs have a **median of $74.62** (Q2 2026, all categories, opened), and "Fewer cheap jobs, priced the same". The M2 file's own price evidence for recurring work is a $500–1,000/month *full-time* tester (Vantum), i.e. an employee, not a desk retainer. | **Unsupported.** The $500 average is hope (H, E0). The realistic recurring unit is a $150–300 release pass when the client ships, not a monthly retainer. |

### 1b. Hidden planes the authors missed
1. **Two founders cannot share one Upwork freelancer profile.** Upwork's help centre (search summary of "Represent yourself authentically" and "Multiple accounts FAQ") says an account can't be shared; a team must work as an **Agency**, and community staff say team members need their own freelancer accounts (SEARCH-SUMMARY; support.upwork.com is 403 to me). The Reply Card's identity line ("MD Nahin and [partner], a two-person QA desk") on one profile is a terms breach. **Fix:** both open their own freelancer profiles (each must be approved, which doubles the approval risk) plus a free agency profile, or one founder is the named freelancer and the other works only on non-delivery tasks. The plane costs a week, not the idea.
2. **The marketplace is shrinking where the team wants to sell.** UK client posts −18.1% QoQ and France −31.3% in Q2 2026, while Pakistan +6.3% and India −4.1% (GigRadar, VENDOR, opened). The clients still posting are increasingly South Asian, i.e. the team's price competitors, paying South Asian rates.
3. **The off-Upwork "Road" is mostly employee hiring, not desk buying.** Of the 28 Himalayas rows, the file itself marks only 7 as Mode A fits; the rest are full-time roles where the buyer wants one 40-hour person. Two people at 8 h/week can't fill that, so Road off-Upwork is ~7 posts a month, not 28.
4. **Connects are real cash against a $0 budget.** Upwork's pricing page (search summary) gives Basic accounts 10 Connects a month at $0.15 each beyond that; a May 2026 Reddit thread cited by GigRadar reports new accounts often don't get the 10 (SEARCH-SUMMARY). Boosts can exceed 50 Connects. At GigRadar's ≈ $50 per first conversation in Web Dev, a $10–35/month budget buys **under one conversation a month** at the market average. The bug video must beat the average by 2–3× just to make the Connects pay.

### 1c. Fatal flaw
**Read-noticed on a shrinking, crowded marketplace, priced in Connects the team can't afford.** Everything else in the chain is good (proof on their own app, escrow, the partner's skill). But a zero-review proposal in Web/Software Dev, where (in GigRadar's Web Development proxy) proposals outnumber jobs and a first conversation costs ≈ $50 of Connects even for experienced agencies, may simply not be opened. The bug video only works if the proposal is opened. This is the "nobody replies" failure the brief warned about, and the file's 15% and the ranking's 7% both sit above measured averages.

### 1d. Money (ranking §5 mid $700 at month 6) — recomputed
- 15 proposals/month × 5% reply (zero reviews, bug video) × 30% close ≈ **0.23 new clients/month**, ≈ 1.4 clients won by month 6 (ESTIMATE).
- At month 6: ~1 client buying a $150–300 release pass about monthly, plus a $40–80 first pass now and then, minus Upwork's 0–15% fee → **≈ $250–350/month mid** (ESTIMATE). Low $0–100; high ~$1,200 (2 retained clients + 1 placed tester).
- First $1,000/month: **not within 12 months in the mid case**; ~6 months in the high case.
- **I cut the mid from $700 to ≈ $300.** That drops QA from C-rank 3.5 to ~7 in §5.

### 1e. Counter-evidence searches I ran (2026-10-30)
1. "Upwork 2026 monthly hiring report QA testing demand AI-generated code" → June 2026 QA +20% MoM (search summary only); no 2026 syndicated release; monthly releases stop after Dec 2025 (Finviz list, opened). Then the Q2 2026 results (opened): GSV −4%, active clients −4%.
2. "new Upwork freelancer no reviews proposal response rate data 2026" → no Upwork-published figure; GigRadar Q2 2026 (opened): 5.1% reply, Loom 11.3% vs 6.0%, jobs −14.2% QoQ.
3. "Upwork profile not approved similar skills 2026" and "Upwork terms … account sharing agency" → old forum reports of oversupply rejections; account sharing barred, teams via Agency (SEARCH-SUMMARY).

### 1f. Steelman
The best version is **not** "a QA desk bidding on Upwork". It is **one founder's own approved freelancer profile, positioned as "manual release testing for apps built with AI builders (Lovable/Bolt/Replit)", bidding only on posts that name a public app, each proposal opening with a 20-second bug video from that app**, while the partner builds the checklist and reviews every bug before it goes out. That keeps the honest proof, avoids the account-sharing plane, and aims at the buyer Upwork's own COO described (unsure AI-built code is ready). **The single change that most raises its odds:** add the crowdtesting route (uTest/Test IO, ranking §11 ★) *in week 1*, not as a fallback. It is the zero-review door: pay is per accepted bug, judged by the platform, and the bugs it pays for become the reviews Upwork needs. Treat it as a door to references, not income: a third-party uTest review (updated Aug 2026) says uTest pays by PayPal, "Payoneer where supported" or Wise bank transfer, and worker reviews describe very low effective pay (≈ $2/h, one anecdote) (all SEARCH-SUMMARY; Bangladesh eligibility NOT FOUND; PayPal is unusable, so only the Payoneer route counts).

### 1g. Halal
Clean as filed, provided the G1 screen (betting, interest banking, crypto-yield) is applied to *apps under test*, not only to posting companies. Add dating/adult-adjacent and loan apps to the screen. No deception issue if one profile is honestly one person.

### 1h. Verdict
**FIX — medium confidence.** Fixes: (1) solve the account plane on Monday (each founder's own profile, or one named freelancer); (2) run the Upwork test at **20 proposals over 2–3 weeks**, not 5 in 7 days (5 sends at a 5% rate return zero most of the time: 0.95^5 ≈ 77%); (3) start the crowdtesting door in parallel; (4) cut the money mid to ≈ $300 at month 6 in any CEO summary.
**What would prove me wrong in week 1:** a reply or escrow offer from the first 5–8 bug-video proposals, or a profile approved on the first try with ≥ 15 public-app posts a week. **What would change my mind toward DROP:** profile refused twice, or 0 replies after 20 bug-video proposals.

---

## Target 2 — #2 M8 Mosque Gift Aid start-up and recovery desk

### 2a. The three claims from ranking §13
| # | Claim | My check | Verdict |
|---|---|---|---|
| 1 | Willingness: committees that never registered *want* Gift Aid and will answer strangers about "HMRC refunds". | No mosque-specific evidence either way (search below). HMRC-commissioned research, as summarised by Charity Times, blames missed Gift Aid mainly on confusion about who counts as a taxpayer (SEARCH-SUMMARY). One religious objection is removed: Islamic Portal (Deobandi; answer dated 22 Jul 2025, approved by two muftis) says "Masjids can accept and use money received from the Gift Aid scheme" (VERIFIED, page opened). | **Unproven, not disproven.** Only replies can settle it. The fatwa is a usable proof line for Hanafi committees. |
| 2 | The recoverable base: identifiable UK-taxpayer donors are a meaningful share; the flag is rarely stale. | Taxpayer share: NOT FOUND (no source for mosque donors). Flag staleness: helper table shows 1 clear stale case (Chester) + 3 ambiguous of 25 = 4–16%. **New and bigger problem — the backlog may not exist for never-recognised mosques.** HMRC's own school-charities e-zine (gov.uk PDF, opened by me) says HMRC gives "a note of the date that entitlement to those reliefs began", which "may be before the date of the application", and Gift Aid cannot be claimed "on any donations received before the entitlement date". Swiftaid's FAQ (VENDOR, opened): "your charity can only claim Gift Aid on eligible donations collected since registering your charity with HMRC." The current HMRC Chapter 2 (updated 2026-10-20, opened) is silent on the entitlement date. | **Overstated for the core segment.** The file says regular donors "can therefore be Gift-Aided backwards" 4 years. That is true only for donations after HMRC's entitlement date, which HMRC sets case by case and which one vendor says starts at HMRC registration. For a never-recognised mosque the backlog is **uncertain, possibly zero**. For **recognised-but-lapsed** mosques (Brick Lane, Smethwick) the 4-year backlog is solid. |
| 3 | The design keeps us outside tax-adviser registration, and the fixed fee is fiqh-clean. | HMRC Ch. 6.3.1/6.3.7 (re-opened, updated 2026-10-20): only an authorised official, nominee or collection agency notified on ChA1/ChV1 may sign. UK AML rules (MLR 2017 reg 11(d), legislation.gov.uk, opened) define a "tax adviser" as anyone giving "material aid, or assistance or advice, in connection with the tax affairs of other persons"; preparing Gift Aid schedules plausibly fits. But reg 8(1) (opened) applies only to business "carried on by them in the United Kingdom". | **Holds, with a caveat.** Never touching HMRC keeps the team outside the Finance Act 2026 registration (M8's reading of the policy paper; not re-opened by me). The AML definition is broad; whether a Dhaka-run business is "carried on in the UK" is a legal question (ESTIMATE: probably not, while the team has no UK base). Not legal advice; one paid hour with a UK charity-tax adviser before stage 2 would settle it. Fee fiqh: see halal below. |

### 2b. The manager's question: the nominee or collection-agency route
- **What the route is (VERIFIED):** HMRC's ChA1 guide (gov.uk, opened) defines a **nominee** as an individual or organisation outside the charity, authorised to submit claims; it "might make the claim and receive the repayment". A **collection agency** is a nominee "recognised by HMRC" that submits large numbers of claims. The nominee's bank details go on the form. Changes need form ChV1, signed by 2 existing officials, at least 1 month before a claim (Ch. 6.3.5–6.3.6, opened).
- **What it would require of the team:** the charity names us on ChV1; we enrol in HMRC online services as a nominee and get an agent reference (gov.uk Charities Online page, search summary); we then *interact with HMRC on behalf of clients*, which triggers the Finance Act 2026 registration and, in practice, AML supervision; if repayments came to us we would hold charity money in a UK bank account we don't have. Collection-agency status is for high-volume firms HMRC already recognises.
- **Verdict:** the file's design **deliberately ignores** this route ("never become a nominee"), and that is right for a Dhaka team with no UK entity. But the cost is real: every claim must be submitted by a trustee through Charities Online, with an activation code posted to the charity (SEARCH-SUMMARY: within 7 days, activate within 28). A committee that never registered is exactly the buyer most likely to stall at that step. **The people who *can* be nominees or agents are the examiner accountants.** That makes the examiner not just the best Read route but the only party able to press "submit" for a stalled committee.

### 2c. Hidden planes the authors missed
1. **PECR reaches personal webmail even at a company or CIO.** The ICO's B2B page (opened) says an address is an individual subscriber when the person "chose to use their personal email address instead of their work one". In the file's 17 accounts-verified targets, **5 contact points are personal-name webmail** (e.g. AMUSTAKIM58@hotmail, abdul.matin62@yahoo, shammiah@hotmail, Mahmud.sylhet@yahoo, mmsheikh25@gmail), **6 are mosque-named webmail** (ambiguous), **5 are on the mosque's own domain**, and 1 is phone-only (my count from the file). Only ~5–11 of 17 are safely emailable. The planned "10 + 10" test can't be filled from Bangladeshi-linked corporate mosques alone without breaching PECR; widen to all 228 non-recognised mosque-named charities (which the market-scope rule requires anyway).
2. **The "single best first contact" is probably not cold-emailable.** My Companies House name search (E3) found **no active company called AM Accountancy Services at the E1 address**: the only active one was incorporated in Birmingham in Jan 2026, and an older Chester one was dissolved in 2025. Likewise Mohi & Co Ltd was dissolved in 2018, and its printed contact is a personal AOL address. These look like sole practitioners or partnerships, i.e. individual subscribers: post, or screened phone calls only. Roy & Co (GB) Limited at the Manchester address **is** a live company (emailable, but no email is printed).
3. **Examiner free-rider.** An email telling an accountant "your 4 mosque clients claim no Gift Aid" hands them a billable job they can do themselves; accountants routinely act as Gift Aid agents. This is the same "the proof is the product" flaw the ranking found in Shothik-open, and the ranking didn't apply it here.
4. **HMRC repayment interest (halal plane, VERIFIED).** Ch. 6.6.4 (opened): "Repayment interest may be due and payable on a Gift Aid claim"; for a charitable company it runs "from the day after the end of the accounting period", and HMRC pays "the total tax claimed plus interest due together as a single payment". A 3–4-year backlog claim is exactly the case that earns interest. The mosque receives riba bundled into the refund. Not haram for us (our fee is fixed and not drawn from it), but every offer must tell the committee to identify and give away the interest portion, or the desk quietly walks a mosque into receiving interest.
5. **The deadline trigger may be false for the core segment.** "5 April 2027 is the last day for 2024/25 GASDS" only bites if the mosque can make a 2024/25 Gift Aid claim (the matching rule, Ch. 8, opened). If HMRC's entitlement date for a newly recognised mosque falls after April 2025, there is no 2024/25 claim and no deadline. For never-recognised mosques the Reply trigger shrinks to "Ramadan envelopes", a soft seasonal hook.

### 2d. Fatal flaw
**The money the letter points at may not be recoverable, and the people who could recover it don't need us.** Line one says "£290,875 of donations, no Gift Aid". For a never-recognised mosque, only donations after HMRC's entitlement date count, and only from identified UK taxpayers. So the honest number is "future Gift Aid on your standing-order and card donors, plus up to £2,000 a year of GASDS per building", not a backlog. And the examiner who reads that letter can do the work himself. The desk survives only where it is (a) recovering lapsed claims for already-recognised charities, or (b) a white-label back office *for* examiners.

### 2e. Money (ranking §5 mid $500 at month 6) — recomputed
- Stage-1 packs (£150) still sell to never-recognised mosques, but stage-2 backlog fees (£300–600) mostly vanish for them. Lapse cases (recognised, under-claiming) keep stage 2, but they are a smaller pool (5 named; national count NOT FOUND).
- Mid at month 6: ~2–3 stage-1 packs in total plus 1 lapse claim fee landing after HMRC pays ≈ **£150–300/month averaged ≈ $200–400** (ESTIMATE). Low $0; high ~$1,200 (one examiner putting 5+ mosques through white-label prep).
- First $1,000/month: not within 12 months in the mid case.

### 2f. Counter-evidence searches I ran (2026-10-30)
1. "mosque Gift Aid claim help service UK fixed fee mosques recognition HMRC 2026" → still only Masjidbox auto-claim (digital gifts), Swiftaid 10% + VAT Finder, and a 2024 free GivenGain service (SEARCH-SUMMARY). No mosque backlog service. The gap claim holds.
2. "why mosques do not claim Gift Aid … Muslim Charities Forum unclaimed" → no mosque-specific study; Gift Aid misses blamed on taxpayer confusion generally; Islamic Portal fatwa approving Gift Aid for masjids (opened).
3. "newly recognised charity HMRC claim Gift Aid on donations received before recognition date" → **the entitlement-date problem** (HMRC e-zine opened; Swiftaid FAQ opened; Charity Excellence guide and an AccountingWeb Feb 2026 thread, SEARCH-SUMMARY, both say no claims before recognition).
4. Companies House name search for 4 examiner firms (E3, above).

### 2g. Steelman
**"Gift Aid back office for small charity examiners."** Sell to the accountants named in the accounts (UK Ltd/LLP only for email; post for the rest), not to mosques. The examiner keeps the client, signs or nominates, and bills it; we prepare the recognition answers, the declaration kit, the donor-matching schedule and the GASDS cash log under the partner's checklist, at a fixed fee per charity. Lead with **lapsed claims at already-recognised charities** (a solid 4-year backlog, statutory deadlines that really bite, and an existing authorised official), then start-ups. Open to all faith and community charities from week 1. **The single change that most raises its odds:** reframe from "we recover your mosque's money" to "we do the Gift Aid grunt work for your charity clients, under your name." It removes the free-rider problem, the stranger-and-HMRC trust problem and most of the PECR problem at once.

### 2h. Halal
- Gift Aid itself: approved for masjids by a Deobandi fatwa (VERIFIED). Fixed fee paid after HMRC repays: a contingent fixed fee (ju'ala-type) is generally accepted; a % of the refund is the contested form, and the file already bans it. Fee never from zakat: kept.
- **Missed:** HMRC repayment interest on backlog claims (above). Add to every offer: "any interest HMRC adds must be identified and given away; we can show you the line."
- **Missed:** donor declarations must only be signed by actual UK taxpayers. A "declaration drive" that pressures every donor to sign creates false claims (deception, and HMRC penalties under Sch. 24 FA 2007, which also block GASDS for 2 years per Ch. 8). The checklist must include a taxpayer-status script.
- No deception in outreach as filed (Dhaka is stated).

### 2i. Verdict
**FIX — medium confidence.** Exact fix: (1) make the examiner accountant the buyer and the product white-label prep under their name; (2) lead with recognised-but-lapsed charities, where the backlog and the 5 April 2027 deadline are real; (3) for never-recognised mosques, sell only the stage-1 start-up pack, quote future Gift Aid not backlog, and never quote a backlog until HMRC's entitlement date is known; (4) email only org-domain addresses at CIOs/companies and Ltd/LLP examiners; post for the rest; (5) add the repayment-interest and taxpayer-only lines.
**Evidence that would change my mind toward KEEP as filed:** a current HMRC statement, or 2 recognition letters, showing entitlement dates backdated ≥ 2 years for newly recognised charities. **Toward DROP:** 0 positive replies from 20 org-domain sends plus 5 posted letters to examiners, or examiners answering "we'll do it ourselves".

---

## Target 3 — #3 M4 Bangla/Sylheti real-speaker panel for UK AI phone receptionists

### 3a. The three claims from ranking §13
| # | Claim | My check | Verdict |
|---|---|---|---|
| 1 | UK demo lines *fail* in Bangla/Sylheti/BD-English (untested; the whole letter depends on it). | I can't place calls. What I could check: **standard Bengali speech recognition is now commodity.** ElevenLabs' speech-to-text docs (opened) list Bengali in its "High Accuracy (>5% to ≤10% WER)" band; Azure's language table (opened) supports Bengali (India) speech-to-text. **Neither lists Sylheti.** The vendor's own defence is built in: QuantumLoop told Management in Practice (25 Aug 2026, opened) that EMMA "supports 17 languages in addition to English", and that when she can't understand "the call is transferred to the reception team". InTouchNow's home page (re-opened) says "85+ languages" and "200+ accents" but names no languages; no Bengali or Sylheti mention. | **Likely wrong for standard Bangla, likely right for Sylheti, and a Sylheti failure is weak proof.** Vendors on modern stacks will often handle Dhaka-standard Bangla, or fail gracefully into a human transfer, which they call "working as designed". Sylheti will fail, but no vendor claims Sylheti, so "your product can't do a dialect you never sold" is a thin letter. The test's real value is the BD-English and code-switching calls. |
| 2 | Vendors will pay a Dhaka team rather than use synthetic Bengali (Hamming), Coval's free audit, or their own QA team. | Hamming's Bengali page (re-opened): "Test your voice agents across Bengali variants and dialects", with "Bangladeshi, West Bengali accents"; no Sylheti. Coval (re-opened): free audit, 30+ simulations including "edge-case accents", "Free, in two business days". UK-side real-speaker supply exists: a 2024 University of Surrey project ran Sylheti focus groups in Tower Hamlets with first-language outreach; ONS has cognitively tested Sylheti questionnaires; East London NHS trusts hire Bengali/Sylheti interpreters (SEARCH-SUMMARY). | **Overstated.** Synthetic standard-Bengali testing is sold; Sylheti is the only gap. And when a UK vendor wants real Sylheti speakers, the credible supply is **in East London**: the actual patients, community groups and research recruiters. A Dhaka panel is cheaper but less representative. Our Dhaka BD-English is also not the Sylheti-accented English of Tower Hamlets elders. |
| 3 | Pool ~40, and Repeat: any vendor pays more than once. | No evidence found of any UK AI-receptionist vendor buying recurring human language testing (searched in 2a/2b of the M4 file and again here). No Tower Hamlets or Newham practice found using an AI receptionist (my search below). | **Holds as a ceiling, not as a business.** ~40 buyers, Repeat unproven (H). |

### 3b. Hidden planes the authors missed
1. **The trigger is about English accents, not Bangla.** The Rotherham, Doncaster and Fakenham stories concern "variations in speech" such as "regional accents or speech impediments" in English (MiP, opened). They give a reason to discuss *accent* testing, not Bengali. Linking them to Bangla in line one is a stretch the vendor will notice.
2. **The demo line is not production.** A failure on "Try our AI: 020 3879 4499" invites the answer "the demo isn't configured for Bengali; per-practice languages are switched on at deployment". The proof is weaker than "your own app" in the QA desk.
3. **Graceful failure is the designed outcome.** If a call "transferred to a human" is scored as a failure, the vendor disputes the score; if it is scored as a pass, most calls pass. The score sheet must separate "completed", "transferred after N seconds" and "caller gave up", and the letter must lead with time-to-transfer and misheard names, not "failed".
4. **No Bengali-speaking demand site is visible yet.** I found no Tower Hamlets or Newham practice live on an AI receptionist. The NEL ICB note (Feb 2026, VERIFIED by M4) tells practices to keep human routes for "language barriers", which may *slow* deployment where Bengali speakers are concentrated.

### 3c. Fatal flaw
**The letter's bite depends on a failure that modern stacks may not produce, in a language no vendor is accused of failing.** Standard Bangla recognition is a commodity feature; graceful hand-off to a human is the vendors' public defence; the press triggers concern English accents. The one real gap, Sylheti, is the one the team can't yet supply, and the vendor never claimed it. With a ~40-buyer pool, a weak letter leaves nothing to scale.

### 3d. Money (ranking §5 mid $390 at month 6)
The file is honest; I'd shade it down. 40 sends × 8% positive × 30% paid ≈ 1 client; one £150 set plus maybe a £250 re-test by month 6 ≈ **$100–250/month averaged** (ESTIMATE). A retainer is the high case, not the mid. First $1,000/month: not within 12 months.

### 3e. Counter-evidence searches I ran (2026-10-30)
1. "Sylheti speakers user research recruitment UK lived experience panel testing NHS digital services" → UK-based Sylheti research and engagement capacity exists in Tower Hamlets (Surrey 2024; ONS Sylheti cognitive testing; NHS interpreter posts). A substitute for a Dhaka panel, and a more credible one (SEARCH-SUMMARY).
2. "Tower Hamlets OR Newham GP practice AI receptionist 2026 Bengali patients" → no practice found; vendor marketing only (SEARCH-SUMMARY).
3. Primary re-opens: MiP 2026-08-25 (accent story is English accents; EMMA's 17 languages + human transfer), ElevenLabs STT (Bengali high-accuracy), Azure STT (Bengali supported, no Sylheti), Hamming Bengali, Coval free audit, InTouchNow home page.

### 3f. Steelman
**"Claims vs evidence" for vendors that sell into multilingual ICBs, with Sylheti as the headline.** Recruit 2–3 paid Sylheti speakers in Sylhet *before* the first send (the only non-commodity asset). Test only vendors that make broad language claims (QuantumLoop "17 languages", InTouchNow "85+ languages"). Score time-to-transfer, misheard Bangladeshi names and addresses, and code-switching (Sylheti-English), not "pass/fail". Sell the result as procurement evidence for East London deployments, where NEL ICB already asks practices about "language barriers". **The single change that most raises its odds:** get the Sylheti speakers first. Without them, do not send.

### 3g. Halal
Clean. Calling demo lines as ourselves with fictional personas is what demo lines are for; never call a real surgery (the file already bans it). Publishing recordings of vendors' failures (the ranking's "scoreboard") carries UK defamation risk; keep results private to each vendor unless both the facts and a right of reply are documented.

### 3h. Verdict
**FIX → effectively CONDITIONAL — medium confidence.** Exact fix: recruit Sylheti speakers before any outreach; rewrite the score sheet around graceful-failure metrics; drop the Rotherham/Fakenham accent stories as the Bangla trigger (use them only for BD-English accent tests); keep it as a $5 side test, not a primary bet.
**Evidence that would change my mind toward KEEP:** in the $5 test, ≥ 3 of 10 *standard Bangla or BD-English* calls on a vendor claiming ≥ 17 languages end in a misbooking or a caller-gave-up (not a clean transfer). **Toward DROP:** no Sylheti speaker recruited in 2 weeks, or ≥ 9 of 10 standard-Bangla calls completed or cleanly transferred.

---

## Target 4 — Shothik baseline (two rows)
Row B = `M8-shothik-nyc-rescore.md` (NYC Bangladeshi restaurants, Bangla, ranked #11). Row O = `M1-shothik-open.md` (open market; only the maintainer route (c) passes, ranked #8).

### 4a. The three claims from ranking §13
| # | Claim | My check | Verdict |
|---|---|---|---|
| 1 | No channel lifts single-owner Read above 1 (Facebook requests; phone at Dhaka night; "your Google listing is wrong" = the scam script; Hiya's data is a vendor's). | **Scam script:** FTC's Pointbreak case: callers posed as Google, threatened to list businesses as "permanently closed" unless they paid $300–700; refunds paid in several rounds (SEARCH-SUMMARY from the FTC refunds page snippet plus 3 news outlets; ftc.gov returns 404 to my curl). **One channel the file under-scores:** for Row B, a live **Bangla** phone call at NY 09:30–11:00 = Dhaka 20:30–22:00 (after US DST ends 1 Nov) is not a robocall and not the scam's voice. In small family restaurants the owner is often on site before opening (ESTIMATE). | **Holds for writing; slightly understated for a live Bangla call.** A Bangla call could lift Read-delivered and -noticed to 2 for some owners. It doesn't rescue Row B: Trust-risk (logins) and Pay (Zelle/cash habit) stay at 1, so two-key stays ≤ 1/3. |
| 2 | "The open market is *worse* than Bangla for owners" rests on MapsLeads (VENDOR) + Hiya. Is it true for UK owners called at Dhaka 20:00? | **UK:** a search found **no UK wave of Google-listing robocalls** comparable to the US data; it found UK takeaways targeted by callers posing as Just Eat staff asking for bank and **login details** (The Caterer, Northern Ireland, date unclear; SEARCH-SUMMARY). UK calling law: the ICO B2B page (opened) confirms PECR applies to live calls to both corporate subscribers and sole traders, so every number must be screened against TPS/CTPS first (a cost, P3). UK 14:00 = Dhaka 20:00 fits. | **Partly holds.** For UK owners the "scam script" evidence is US-only, so "worse" is overstated on that ground. But UK takeaway owners are being primed against strangers who want platform logins, and our fix needs manager invites. Net: open-market UK owners are **no better** than Bangla owners, not clearly worse. |
| 3 | The maintainer route's 2/3 rests on an E1 "offshore white-label is normal" identity claim, and ignores the free-rider plane. | The ranking's own search found a glut of white-label suppliers (HOTH, Birdeye, Grade.us, Marqii, Digital Help PH, Clicks Geek). That *confirms* the identity norm (agencies do buy offshore white-label) and *also* confirms the crowding. The free-rider plane is real and was named by M1 itself: the 9-error list is the deliverable. | **Holds as "thin".** Identity 2 is plausible; Read-noticed and Repeat are the problem. Listings-only is a feature, as M1 said. |

### 4b. Fatal flaws
- **Row B (Bangla NYC):** a pool of ~79 named restaurants, no written channel, logins needed, and a cash/Zelle habit. Even the best case (~$5k a year) is below the work-level bar. **Fatal flaw: Pay + pool size**, not Read.
- **Row O (open, maintainers):** **the proof is the product.** A competent agency fixes the free list in an hour; the recurring part competes with $16–60/location software and offshore white-label shops.

### 4c. Money
Ranking §5: Row O mid $450, Row B mid $75 at month 6. I don't change them. Row O's mid depends on a 5% positive reply from agencies (ESTIMATE; M1 found one restaurant campaign at ≈ 1%, SEARCH-SUMMARY). If agencies reply at 1–2%, Row O's mid is ≈ $150.

### 4d. Counter-evidence searches I ran (2026-10-30)
1. "FTC Pointbreak Media Google listing robocalls permanently closed refunds" → confirmed the US scam pattern (multiple summaries; FTC pages 404 to bots).
2. "UK restaurants takeaways Google Business Profile scam calls … 2025 2026" → no UK Google-listing robocall wave; UK takeaway login-phishing calls posing as Just Eat; a London review-extortion case (£10k crypto demand); Ghana's July 2026 alert on listing hijacks via "suggest an edit" (SEARCH-SUMMARY). The last item supports M1's "edit watch" idea as a fraud-defence product, not a convenience.

### 4e. Steelman
- **Row B:** the only version worth an hour is the **live Bangla call** to 10 DOHMH-listed halal restaurants at Dhaka 20:30, offering a "done-with-you" fix on WhatsApp video. As a calibration test of Read only, not a business.
- **Row O:** M1's own answer is right: **"Location Health" white-label for UK takeaway-website builders** (Cholo Digital, Order Directly, Online Order Go): listings + holiday hours + suggested-edit watch + hard-review replies, $60–90 a location, opened with each builder's own clients' errors before Christmas. **Single change that most raises its odds:** sell the *watch* (suggested-edit and hijack defence, now a documented fraud vector) rather than the *fix list*, so the free proof doesn't give away the product.

### 4f. Halal
- Row B: filter BYOB and licensed venues (the file does). Row O: agency portfolios mix licensed and unlicensed venues; serving only the unlicensed subset is workable, but don't take a whole-portfolio contract that includes bars or pubs.
- Calls: never pretend to be Google, a platform, or a customer; say "Dhaka" in the first sentence.

### 4g. Verdict
- **Row B (Shothik-Bangla): DROP as a business; KEEP only as a 1-hour calibration call test. High confidence.** Evidence that would change my mind: ≥ 3 of 10 owners agreeing on the call to pay by ACH after a done-with-you fix.
- **Row O (Shothik-open, maintainers): DROP as a stand-alone; KEEP as the opener inside M1's Location Health bundle. Medium confidence.** Evidence that would change my mind: ≥ 2 of 10 maintainers answering with a paid trial rather than "thanks, we'll fix it".
- **Baseline status:** both rows remain valid *calibration* rows. Every top-3 row beats them on Pay and on Trust-risk. The QA desk and the language panel also beat them on Read; the mosque desk does not (Read 1-soft in both).

---

## 5. The ranking itself

### 5a. Does the order survive my corrections?
I changed only the month-6 money mids I re-examined (QA $700 → ≈ $300; mosque $500 → ≈ $300; panel $390 → ≈ $175) and re-ran the ranking's own rule (rank sum of B, C, D, E; A breaks ties). C ranks become: M5 1 · rep desk 2 · M6 3 · Shothik-open 4 · bench 5 · QA = mosque = M7 7 · panel 9 · M3 10 · Shothik-Bangla 11.
| Row | B | C (mine) | D | E | Sum | Was |
|---|---|---|---|---|---|---|
| QA desk | 3.5 | 7 | 1 | 1.5 | **13** | 9.5 |
| Mosque desk | 2 | 7 | 3.5 | 1.5 | **14** | 12 |
| Language panel | 1 | 9 | 3.5 | 3.5 | **17** | 15 |
| Dhaka bench | 3.5 | 5 | 3.5 | 5 | **17** | 20 |
| M6 primary-source desk | 8.5 | 3 | 3.5 | 3.5 | **18.5** | 19 |
| M5 UAE ASP bench | 5 | 1 | 8 | 7 | **21** | 21 |
- **#1 and #2 hold.** **#3 is no longer robust:** the panel ties the bench at 17 and keeps #3 only on the A tie-break; M6 is 1.5 behind. If my P(fail) for the panel (75%, I'd raise it from 65% given 3a) were used in E, the panel would fall below the bench.
- I did not re-score B or D; the shift comes from money alone, so it is conservative.

### 5b. Would I change the top-3 order?
- **#1 QA desk: keep #1, with the fixes in 1h.** It is still the only row where a week can produce money-level evidence, and its failure shows fast (no replies after 20 proposals).
- **#2 mosque desk: keep #2 only in its reframed form** (examiner white-label + lapsed claims first). The ranking's reason to "start it first", the 5 April 2027 deadline, bites only for already-recognised charities (2a claim 2). For never-recognised mosques there may be no backlog and no deadline.
- **#3 language panel: demote to a $5 side test, not a weekly commitment.** Commodity Bengali speech recognition and graceful human hand-off remove most of the letter's bite (3a). Its slot should be held open for whichever of the bench (as #1's Mode B) or M6 survives its week-1 test.
- **Net order I'd give the CEO:** #1 QA desk (fixed) · #2 Gift Aid back office for examiners (reframed M8) · #3 open, decided by week-1 evidence between the panel's $5 test and M6's CONDITIONAL test.

### 5c. Is the combination rule biased?
Yes, in one direction, and it should be said out loud:
1. **Toward platform-mediated offers.** The two-key gate (Read, Trust, Pay) lets a marketplace carry Trust-risk and Pay by mechanism (escrow), while **Reply, the marketplace's weak step, is outside the gate**. D then scores "escrow = 3" above any reply. So the Upwork row passes the gate easily *and* wins D, whether or not anyone replies.
2. **Speed is counted twice:** B's time-to-first-dollar (weight 15) and D's test-signal strength both reward a fast first dollar.
3. **C inherits the authors' own reply-rate guesses.** No row has measured reply data, and the most optimistic guess (QA 15%, cut to 7% by the ranker) still sits above the only external benchmark I found (5.1%).
4. **E is a single judge's P(fail)**, and a 60/60 tie between #1 and #2 decides 3 points of the sum.
Net: the rule ranks **testability** more than **business strength**, and it disfavours slow B2B relationship plays (M5, M6, rep desk). For two unpaid part-timers that bias is partly right (cash, morale). But the CEO should read the top 3 as "the three cheapest things to test first", not "the three best businesses".

### 5d. Wrongly cut or placed below?
- **M6 primary-source desk (#4, CONDITIONAL): not wrongly placed; if anything, too high.** Helper 1 (checked by me): Dhaka University's own statement (Daily Star, 6 Apr 2026, opened by me) names WES, First Advantage, Qualification Check, DataFlow, AMS India and UHR as regular requesters, paying DU a USD 50 fee per student by email. Zinc's live Bangladesh education average is 3 days (VERIFIED by the ranker and the helper). The 2026 pain stories are one DU case about a screener (UHR) that would not pay the fee, i.e. student-side friction, not a screener without a route. No public sign that any screener buys Dhaka liaison work (NOT FOUND). Keep it CONDITIONAL; its 12 buyer emails must test "stuck cases" (variant B), because routine checks already flow.
- **M5 UAE ASP bench (#6, alternate): placed correctly.** The sub-AED 50m dates still hold: appoint an ASP by 31 Mar 2027, go live 1 Jul 2027 (Dubai Week, 26 Oct 2026, opened by me; secondary, MoF text not opened). But helper 1 found **no 2026 post where any accredited ASP seeks onboarding partners or outsources SME work** (4 query variants, NOT FOUND); the visible behaviour is in-house hiring (DigiTax, Zawya 2 Sep 2026, SEARCH-SUMMARY via helper). The ASP list also doubled in four months (32 → 80; SEARCH-SUMMARY), which means more competitors per SME, not more outsourcing. Its #1 money rank (C) rests on a buyer that no public evidence shows exists. It stays an alternate, not a promotion.
- **M1 reputation desk (#7): placed correctly.** AI replies at $0–10, a glut of white-label suppliers and the free-rider problem are real (ranking §7 search; M1 file). Its best use is as half of the Location Health bundle with Shothik-open, which is how M1 already framed it.
- **Two ★ new ideas are placed too late:** crowdtesting belongs *inside* #1 in week 1 (the zero-review door), and "Gift Aid lapse recovery for any charity via examiners" should *be* #2, not its month-2 widening.
- **Screen-1 cuts:** I found nothing that reverses a Screen-1 cut. The M4 voice-agent QA cut is reinforced by Coval's free audit (re-opened today).

---

## 6. Halal check (all targets)
| Target | Adjacency the authors missed | Fix |
|---|---|---|
| QA desk | Apps under test can be haram even when the posting firm isn't (loan, betting, dating/adult-adjacent apps). Two founders on one Upwork profile is a misrepresentation of who is doing the work. | Screen each *app*, not only the company. One honest profile per person, or an Agency. |
| Mosque desk | **HMRC repayment interest** is paid inside backlog refunds (Ch. 6.6.4, VERIFIED). A declaration drive that pressures non-taxpayers to sign creates false claims. | Tell every mosque to identify and give away the interest portion. Taxpayer-only script in the declaration kit. Fee fixed, after delivery, never from zakat (kept). |
| Language panel | None in the work itself. Publishing vendors' failures risks unfair harm (and UK defamation) if loosely worded. | Private results to each vendor; publish only with documented facts and a right of reply. |
| Shothik (both) | Licensed venues inside agency portfolios (Row O); BYOB in NYC (Row B). | Serve only the unlicensed subset; no whole-portfolio contracts that include bars. |
| All | Payout accounts: none of the routes (Upwork, Payoneer) pays interest to us as used. Outreach: every identity line states Dhaka. | If any payout account ever offers a yield feature, leave it off. Keep "Dhaka, Bangladesh" in line one or two of every message and on every profile. |
No fee taken from zakat appears anywhere in the designs. No deception found beyond the Upwork account-sharing issue.

---

## 7. What I could not verify
- Upwork's own pages (help centre, monthly reports, beginner guide) are 403 to curl and WebFetch is DNS-blocked; Upwork facts are from syndicated results (Finviz) or search summaries.
- Whether a zero-review Dhaka profile is approved in QA in 2026; the actual reply rate for bug-video proposals (only a test can say).
- HMRC's current practice on entitlement dates for newly recognised charities (the gov.uk e-zine I opened is a 2013/2015 document; Swiftaid's answer is a vendor's).
- Taxpayer share of mosque donors (NOT FOUND); whether AM Accountancy Services trades through a company under another name (my Companies House check was a name search only).
- Whether any UK AI-receptionist demo line fails in standard Bangla (I can't place calls); whether any UK vendor has ever paid for human language testing.
- The FTC Pointbreak pages (404 to bots; multiple search summaries agree).
- Crowdtesting eligibility and payout for Bangladesh (third-party review only).

## 8. Primary sources I opened myself (2026-10-30)
1. gov.uk HMRC Charities Chapter 6 (updated 2026-10-20): 6.3.1, 6.3.4–6.3.8, 6.4.1, 6.5.1, **6.6.4 repayment interest** — re-opened at the end.
2. gov.uk HMRC Charities Chapter 2 (updated 2026-10-20): no entitlement-date rule stated.
3. gov.uk HMRC Charities Chapter 8 (GASDS; updated 2026-10-20): matching rule, 2-year limit, penalty bar.
4. gov.uk "How to complete form ChA1" (2014): nominee and collection-agency definitions, nominee bank details.
5. HMRC school-charities e-zine (gov.uk assets PDF, created 2013, modified 2015): entitlement date "may be before" the application — re-opened at the end.
6. ICO B2B marketing page: personal email address = individual subscriber; PECR applies to live calls.
7. legislation.gov.uk MLR 2017 reg 11(d) and reg 8(1).
8. Swiftaid FAQ (pre-registration donations) and pricing (5% / 10% + VAT).
9. Islamic Portal "Gift Aid for Masjids" (22 Jul 2025).
10. Companies House search (4 examiner names).
11. Upwork Q2 2026 results (Finviz syndication of the 2026-08-10 GlobeNewswire release) and Finviz's UPWK news list.
12. GigRadar Q2 2026 Upwork report (VENDOR) — re-opened at the end.
13. intouchnow.ai, quantumloopai.com, hamming.ai/language/bengali, coval.dev/voice-agent-audit, ElevenLabs STT docs, Azure Speech language table, Management in Practice 2026-08-25.

## 9. Helper runs
**1 of 3 used.** Helper 1 (Sonnet): Bangladesh degree-verification market (M6) and UAE ASP partner demand (M5); file `research/handoffs/P4-helper-1.md`. I checked it by re-opening 2 of its sources myself (Dubai Week 26 Oct 2026 table; Daily Star 6 Apr 2026 DU statement); both held. It went over its fetch budget (~19 searches, ~22 fetches) because many pages were JS shells or blocked. Its unverified items (a Zinc "1.5 and 35 days" search figure; a UAE "white-label" lead) are not used here.
