STATUS: FINAL

# M4 — Real-speaker language test panel for UK AI phone receptionists
**Model:** M4 New-Category Bench · **Companion:** Phase 2 Opus, 2026-10-29
**One line:** Native Bangla speakers in Dhaka (and, once recruited, Sylheti speakers) ring the demo lines of UK AI phone-receptionist vendors in Bangla, Sylheti and Bangladeshi-accented English. We score whether a booking, a prescription request or a hand-over to a human actually happened, and sell a dated, signed test log plus re-tests after every release. NHS GP vendors come first, then UK small-business receptionist vendors and the agencies that sell "Bengali language packs".
**Labels:** VERIFIED = primary page opened by me on 2026-10-29 · VENDOR CLAIM · SEARCH-SUMMARY (page not opened) · ESTIMATE (my reasoning) · NOT FOUND.

**Why this is M4 and why it is the reshaped first product.** The generic product, "QA of AI agents for small agencies", is now done free or cheaply by software (see `M4-voice-agent-qa-agencies.md`): Coval runs a free 30-scenario audit and Retell and Vapi have testing built in. The one part software cannot fake is a *real* speaker of a low-resource language. Sylheti, the home language of most older British Bangladeshis, has no mainstream speech-recognition or text-to-speech support (only a ~15-hour TTS research corpus turned up; SEARCH-SUMMARY, arXiv search). The category being tested, AI receptionists for GP surgeries, is under ~2 years old, and its vendors make language claims nobody has checked in public.

---

## (a) Path Test v2 card

```
OPPORTUNITY: Real-speaker Bangla/Sylheti/BD-English test panel for UK AI phone receptionists | MODEL: M4
GATES: G1✔ G2✔ G3✔(cap breaker: paid native-speaker panel under our checklist; AI drafts reports) G4✔(partial; paid part = real speakers + signed log) G5✔(dated evidence below) G6✔
STEPS: Home 2(M,E2) · Road 2(M,E3) · Letter 2-soft(M,E1 until test run) · Read 2(M,E2) · Impressed 2(M,E2) · Reply 2(M,E2) · Trust 2/2/2(M,E1–E2) · Pay 2(M,E2 rail / E1 buyer) · Repeat 1(M,E1)
CHAIN: 1 (Repeat, M, E1) | TWO-KEY: 3 of 3 by mechanism → PASS (Trust-competence and Letter turn E3 only after the $0 test)
FALSE-0 FIXES: Read → Ra (sell to the vendor, not the GP practice) + Re (Healthwatch/Fakenham trigger); Trust-identity → Rf (Dhaka + native Bangla is the qualification, not a weakness); Home → Rc (vendor's own public demo line)
FALSE-2 CATCHES: Letter → depends on what the test finds (a pass is still sellable, but weaker); Repeat → vendors may pay once, not monthly; Home → our Bangla is Dhaka-standard, UK callers are mostly Sylheti (panel needed); Home → P3 call cost from Dhaka to UK numbers
SOFT-0 TESTS TO RUN (≤2h, $0): run 10 calls on the free browser demo (ViveoAI) and the InTouchNow/Wavenet demo line; score them; this sets the Letter
REPLY CARD: see (b)
```

### Gates
| Gate | Result | Evidence |
|---|---|---|
| G1 Halal | ✔ | Healthcare and small-business reception. No interest, gambling, alcohol or adult content in the buyer's own business. We test the vendor's product, not its end clients. No deception: we call **demo lines** as ourselves and never pose as patients of a real practice. |
| G2 Licence | ✔ | We do not give clinical advice and we do not sign clinical safety. DTAC/DCB0129 assurance belongs to the practice and the vendor's Clinical Safety Officer (NEL ICB statement, VERIFIED). We supply test evidence only, from fictional personas with no patient data. **Rule: never call a live GP surgery line.** It wastes NHS capacity and is unethical. |
| G3 Capacity | ✔ | One test set is 20 calls × ~4 min ≈ 80 min of calling, plus ~1 h scoring and ~1.5 h report ≈ 4 h per language set (ESTIMATE). Two people at 8 h/week ≈ 70 h/month, which covers ~15 sets a month. **Cap breaker:** a paid panel of native speakers in Bangladesh (Sylheti, Chittagonian, standard Bangla, BD-English) working to the partner's checklist, while AI drafts each report from the transcripts. |
| G4 AI substitution | ✔ partial | **Against:** Hamming sells synthetic Bengali testing ("Bangladeshi, West Bengali accents"; VENDOR CLAIM, page opened). Coval's free audit includes "edge-case accents" (VERIFIED, coval.dev/voice-agent-audit). **For:** neither mentions Sylheti. The live question in the UK is whether the system works for the practice's *own* patients: "a vendor's language and accent claims need checking against the practice's own patients… before go-live" (Resultsense, 2026-09-23, VERIFIED). Real-speaker evidence, recordings and a named signature are what software cannot supply. **Window: 12–24 months+ for Sylheti, ~12 months for standard Bangla** (ESTIMATE). |
| G5 Demand trend | ✔ | See (c). Earlier: InTouchNow launched GP AI receptionists in June 2024 (SEARCH-SUMMARY, itsecurityguru 2024-06-19). Now: 150+ practices and a £2.3m seed round on 2026-09-23 (VERIFIED). Further points: the Ufonia 10-language NHS trial including Bengali (2025-07-17, VERIFIED) and three EMMA accent stories in five weeks (Aug–Sep 2026, VERIFIED). |
| G6 Killed list | ✔ | "Translation checking" is killed. This is not translation: we are live callers producing recognition and outcome evidence. "Website accessibility fixes" is killed. We fix nothing, and this is phone-AI language access. "Generic AI chatbot agency" is killed. We build no bots. |

### Step card (R5 split steps)
| # | Step | Score | Basis / evidence | Plane check | Route |
|---|---|---|---|---|---|
| 1 | Home | **2** | M / E2. Public demo lines exist and are free to call: InTouchNow and Wavenet both print **"Try our AI: 020 3879 4499"**. The number on both sites is VERIFIED; that Wavenet resells InTouchNow is my inference from the shared number (ESTIMATE). ViveoAI has a **browser** demo, "Talk to Fiona" (VERIFIED). Answrd's demo line is 07874 432297 (VERIFIED). Moneypenny lists sector demo lines (VERIFIED). A sample takes ~3 h. | P3: UK call minutes from Dhaka cost a little. Fix: start with the browser demo ($0), then ≤$5 of VoIP credit (ESTIMATE; PARTNER CHECK on the rate). P2: no login needed. | Rc |
| 2 | Road | **2** | M / E3: 23 named buyers with contact points, listed below. Pool: ~15 UK health AI-phone vendors plus ~25 SMB AI-receptionist vendors and UK voice-AI agencies, ~40 in total (ESTIMATE). **100+ is not reachable** in the core niche, which caps Road (see red team). | — | Ra |
| 3 | Letter | **2-soft** | M / E1. Line one is their own demo line's result in Sylheti/Bangla/BD-English. It is soft until the test runs: if the demo passes, the letter becomes "independently tested by native speakers", which is weaker. | False-2 risk named above. | Rc |
| 4 | Read | **2** | Delivered: founder or role emails published on the vendor's own sites (daniel@intouchnow.com, hello@auxilis.ai, info@viveoai.com, hi@softomatesolutions.com; VERIFIED). Noticed: the subject is their product plus a live controversy (trigger). Decision-maker: startups of 2–50 people, where the founder reads that inbox (ESTIMATE). M / E2. Large vendors (Moneypenny, Netcall) reached through forms or role inboxes score **1**. | P7: UK limited companies are reachable by email under PECR with identity and opt-out. Check legal form on Companies House first. P6: none. | Ra, Re |
| 5 | Impressed | **2** | M / E2. They can play our recording, or ring their own demo line and say the same Sylheti sentence in 30 seconds. They do not have to trust us. | — | Rc |
| 6 | Reply | **2** | M / E2. Dated triggers: Healthwatch Rotherham's accent complaints (MiP 2026-08-25, VERIFIED); a Doncaster surgery withdrew EMMA (Resultsense 2026-08-26, VERIFIED); Fakenham dropped EMMA, with Healthwatch England reporting to DHSC (Resultsense 2026-09-23, VERIFIED); the NEL ICB tells practices to keep routes for patients with "language barriers" (Feb 2026, VERIFIED). Easy answer: "want the recordings? yes/no". | P9: no deadline that can move. | Re |
| 7 | Trust | **2 / 2 / 2** | Identity: real names, faces, Dhaka, native Bangla, all turned into the qualification (Rf); M / E1. Competence: their own demo's recordings shown first; M / E2-able, E3 after the test. Risk: first set £150, paid after they hear results; free re-test within 7 days; M / E1. | P11: we sign "what happened on these calls on this date", never "the system is safe". P2: no data access. | Rf, Rd |
| 8 | Pay | **2** | Rail: Payoneer request with **UK direct bank transfer (GBP), free** (VERIFIED, payments.md / Payoneer a_id 12280). Buyer side: UK startups pay supplier invoices by bank transfer routinely (ESTIMATE, E1). Collection risk: small tickets, invoice before the full report after the free sample. Payoneer's $20–50 minimum is below our £150 ticket. | P8: passes for UK companies. Note the $29.95/yr Payoneer fee under $6k. | — |
| 9 | Repeat | **1** | M / E1. Every model, ASR or prompt release can change recognition. Retell's own docs tell users to rerun test suites "after every prompt or flow change" (VERIFIED, docs.retellai.com batch test). Vendors add languages: Softomate sells each language as a £800–1,500 add-on (VERIFIED). **Unproven:** whether a vendor pays monthly or only once. | False 2 caught: "monthly upkeep nobody needs". Quarterly re-test is the realistic base. | Rg (an agency with many deployments) |

---

## (b) Reply Card (method B9)
```
BUYER (exact role): founder/CEO, Head of Product or Clinical Safety Officer at a UK AI phone-receptionist vendor (NHS GP first; then UK SMB receptionist vendors and AI-receptionist agencies that sell Bengali/Urdu/Punjabi packs)
CONTACT POINT: published founder/role email (e.g. daniel@intouchnow.com, hello@auxilis.ai, info@viveoai.com, hi@softomatesolutions.com) or the vendor's contact form (QuantumLoopAI, Ufonia, DrDoctor) — full list below
CHANNEL + legal check: plain-text email from a real named Gmail/Workspace account; UK limited companies only (Companies House check), identity + opt-out line (PECR); no phone calls (TPS/CTPS cost, P3); LinkedIn: like/comment on the founder's post, then a blank invite (T29)
TRIGGER (why now, dated): Healthwatch Rotherham accent complaints (2026-08-25) → Doncaster withdrawal (2026-08-26) → Fakenham ends EMMA trial and Healthwatch England reports to DHSC (2026-09-23); NEL ICB advice on "language barriers" (Feb 2026); InTouchNow's "85+ languages" claim called "untested in public" (Resultsense 2026-09-23)
LINE ONE (their fact): "We rang your demo line (020 3879 4499) 10 times in Sylheti, Bangla and Bangladeshi English: [N] of 10 reached a booking." (real numbers only, after the test)
PROOF (30-second self-check): 2 recordings plus the exact sentence to say on their own demo line
IDENTITY LINE (T15): "We are MD Nahin and [partner], a two-person test team in Dhaka, Bangladesh — native Bangla speakers. Faces, address and a dated sample: [link]."
RISK REVERSAL (T22–T25): the 10-call sample is free and already done; the first paid 20-call set is £150, invoiced after you hear the sample; any fix you ship is re-tested free within 7 days. No guarantee of safety, only a dated, signed record of what happened.
EASY ANSWER (yes/no): "Want all 10 recordings and the score sheet? Reply 'yes'."
SEND TIME: UK 08:30–10:00 GMT (clocks went back 25 Oct 2026) = Dhaka 14:30–16:00, via Gmail schedule-send
TEST: variant A = line one leads with the result; variant B = line one leads with the Healthwatch/Fakenham trigger; pool is small (~40), so 10 + 10 sends, then pool the agencies. Stop rule T34 adapted: 0 positive replies in 20 → change the route (go to agencies selling language packs), not the wording.
EXPECTED: baseline 3–5% → target ≥ 10% positive replies (ESTIMATE: own-demo proof plus a live controversy)
```

---

## (c) Filters

**Work level: medium-high.** Each set needs script design in three language varieties, 20 timed calls with recordings, outcome scoring (did the request reach the right place, was a human offered, how long until the caller gave up), and a signed report. This is not a 10-minute task.

**Demand trend (dated, earlier vs now):**
| Date | Data point | Label |
|---|---|---|
| 2024-06-19 | InTouchNow launches AI receptionists for GPs | SEARCH-SUMMARY (itsecurityguru) |
| 2025-07-17 | Moorfields + Ufonia announce an NIHR-funded trial to extend the Dora voice agent to 10 non-English languages "including Polish, Bengali and Spanish" | VERIFIED (moorfields.nhs.uk) |
| Feb 2026 | NE London ICB: "A number of suppliers are now offering virtual receptionist solutions to GP practices"; keep routes for patients with "language barriers" | VERIFIED (ICB PDF) |
| 2026-02-24 | Univ. of Sheffield + ICS.AI accent and dialect study for public-sector conversational AI | VERIFIED (sheffield.ac.uk) |
| 2026-08-25 | Healthwatch Rotherham: AI receptionists "do not respond well" to variations in speech; QuantumLoop says EMMA "supports 17 languages" | VERIFIED (Management in Practice) |
| 2026-09-23 | InTouchNow £2.3m seed, "more than 150 practices", claims 80+ languages and 200 accents; the same day Fakenham drops EMMA ("three EMMA stories in five weeks"); QuantumLoopAI "serves over two million patients" | VERIFIED (Resultsense ×2) |
| 2026-10-29 | InTouchNow's own site: "Fluent in 85+ languages commonly spoken in the NHS, and 200+ regional UK accents" | VERIFIED |
| 2026-10-11 | 11 UK SMB AI receptionist offers with published prices; Hey Jodie "Speaks 32 languages" (VERIFIED on its site); Ringmere 30+ languages on Growth/Pro | VENDOR CLAIM (AInora guide, a competitor) + VERIFIED for Hey Jodie |
**Trend: rising.** Supply grew from one launch (2024) to several funded vendors, an ICB policy note and national watchdog attention (2026). Language claims grew faster than evidence.

**Who speaks Bengali in the UK (sizing the need):** Bengali is a main language for **102,000 Londoners**, 33,000 in Tower Hamlets ("a tenth of the borough") and 21,000 in Newham (GLA Census 2021 release, VERIFIED). A Tower Hamlets or Newham practice using an AI receptionist: **NOT FOUND** (one search; no local announcement found).

**AI-substitution risk (12–24 months): medium.** Synthetic accent testing exists (Hamming Bengali, Coval accents). It will improve and may reach Sylheti (ESTIMATE). Two things survive longest: lived-experience evidence from real speakers, which watchdogs and practices ask for, and a named human signature. Vendors also run internal QA (InTouchNow lists a "Quality assurance team"; VERIFIED), which competes with us.

**Team fit: strong but with one gap.**
- CEO: native Bangla, good spoken English, strategy, and the outreach letters.
- Partner: exact checklist work, which is the heart of this (scripts, timing, scoring, logs).
- Gap: Sylheti. By default neither is a native Sylheti speaker (ESTIMATE; **CEO question**). Recruit 2–3 Sylheti speakers in Dhaka or Sylhet as paid panel members.
- Do not claim Hindi, Urdu or Punjabi (brief default: no Hindi/Urdu/Arabic).

**Halal:** clean. See G1.

---

## (d) Real price evidence (what buyers pay today)
| Price point | What it shows | Label |
|---|---|---|
| Softomate (UK): AI receptionist setup **from £2,000** + **£99/month**; "Hindi, Punjabi, Urdu, Polish, Arabic and **Bengali** language packs… Each additional language adds **£800–£1,500** to setup cost" | UK end buyers already pay per language. A sign-off at £150–300 per language is 10–35% of that add-on. | VERIFIED (softomatesolutions.com/ai-receptionist-uk, 2026-10-29) |
| UK G-Cloud "User Research and Testing Participants Recruitment": **£55 to £110 a user an hour** (recruitment only, before incentives), "specialist recruitment for hard-to-reach audiences" | What a UK buyer pays just to *find* real testers | VERIFIED (Digital Marketplace listing; listing date not shown) |
| Retell forum, 2026-10-06: UK builder Calem Taylor (Answrd) offers "real test calls and a fix list, **$350 fixed**" | Seller asking price for human agent audits (an ask, not proof of a sale) | VERIFIED (community.retellai.com/t/3733) |
| Coval: **free** 30+ simulation voice-agent audit in 2 business days; Cekura **$0.25 per voice-testing minute** | What *synthetic* testing costs: ~$0. Our price must rest on what software cannot do. | VERIFIED (coval.dev, cekura.ai/pricing) |
| Upwork conversational-AI QA tester posts: **$15–20/h**, others $4–5/h and $10–20/h | Generic human QA labour is cheap. Cheap labour is not our edge; the language is. | SEARCH-SUMMARY (Upwork listings, relative dates) |
**Our price (ESTIMATE):** first set £150 (≈$195 at ~1.3 USD/GBP, ESTIMATE); standard set £250–400 per language variety per release; retainer £300–500/month for monthly or release-triggered re-tests across 2–3 varieties.

---

## (e) Money path and three scenarios
**Path:**
1. Free 10-call sample on their demo line (the letter).
2. £150 first paid 20-call set.
3. £250–400 per release re-test.
4. A £300–500/month retainer once they ship monthly.
5. More varieties via the panel (Sylheti, Chittagonian, BD-English, and later other South Asian-accented English if real speakers can be recruited and verified).
6. Agencies selling language packs pay £150 per *client deployment* per language (Rg: one agency, many deployments).

$1,000+/month from **one** client is realistic only for a funded vendor (InTouchNow, QuantumLoopAI, Ufonia's 10-language trial) or an agency with steady deployments (ESTIMATE). Most of the money is likely to come from **several** small repeat clients.

**Formula:** reachable buyers × positive-reply rate × conversion × price × months retained.
| | Low | Mid | High |
|---|---|---|---|
| Reachable buyers in 12 months | 40 | 40 | 40 |
| Positive reply rate | 4% (plain cold-email baseline) | 10% (own-demo proof + trigger) | 15% |
| Reply → paid | 25% | 33% | 50% |
| Paying clients | 0.4 → 0–1 | 1.3 → 1 | 3 |
| Revenue | one £150 set ≈ $195 total | 1 retainer at £300/mo × 6 months + 2 one-off sets ≈ $2,700/yr; run-rate ≈ $400/mo | 3 retainers at £400/mo avg × 9 months + 1 agency at 4 deployments × £150/mo ≈ $16,000/yr; run-rate ≈ $2,300/mo |
All rows are ESTIMATE. Assumptions: pool of 40 (23 listed + ~17 findable the same way); rates from method.md baseline (3–5%) and the B9 target; GBP→USD ≈ 1.3; retention 6–9 months because releases are frequent but budgets are small. **Honest read:** this is a $300–2,500/month niche, not a $5k/month business, unless the panel expands into more languages and into AI-scribe vendors (new-ideas list).

---

## (f) Cheap-test check: can the first step be tested in 7 days for under $20? **Yes.**
- **Day 1 (CEO, 2 h):** write a 10-scenario script. Book a GP appointment, request a repeat prescription, cancel, ask for a human, give a callback number, and say a hard proper noun (a Bangladeshi name, a Tower Hamlets street). Write it in standard Bangla and in Bangladeshi-accented English, plus Sylheti if a speaker is available.
- **Day 2 (partner, 1.5 h):** build the score sheet: call ID, date/time, variety, task, outcome (completed / transferred / failed / caller gave up), seconds to failure, verbatim misheard words.
- **Day 3 (both, 2 h):** run 10 calls on the ViveoAI **browser** demo ($0) and 10 on the InTouchNow/Wavenet demo line 020 3879 4499 (≤$5 VoIP credit; ESTIMATE). Record our own side. Never call a real surgery.
- **Day 4 (partner, 1 h):** score the calls; the CEO checks every failure against the recording (zero false claims).
- **Day 5 (CEO, 1 h):** send the result to InTouchNow (daniel@intouchnow.com) and Wavenet (contact form), the two names behind that one demo line, plus ViveoAI and Softomate.
- **Success:** ≥1 positive reply in 7 days, or a request for the recordings. **Total cash: ≤$5.** Payoneer cannot take a payment under $20–50, so the first *paid* test is the £150 set (payments.md).

---

## (g) Monday walk-through (first 3 actions each)
**CEO**
1. Write the 10-scenario Bangla + BD-English script with AI help (2 h). *Has it.*
2. Ask his personal network for one native **Sylheti** speaker willing to do 5 recorded test calls for a small fee. **FLAG: may not have this contact.** Fallback: run Bangla + BD-English only, and say so honestly in the letter.
3. Make the identity page: a free Notion page with both names, faces, "Dhaka, Bangladesh" and the dated sample (1 h). *Has it.*

**Partner**
1. Build the score sheet and a one-page test protocol (1 h). *Has it.*
2. Get a way to ring UK numbers from Dhaka and record our own side. **FLAG: needs ~$5 of VoIP credit (P3, a named spend)**, or start with the $0 browser demo only.
3. Look up each target's legal form on Companies House (free) and keep only limited companies for cold email (PECR) (1 h). *Has it.*

**Planes found:** UK call cost (fixed by the browser demo first) and Sylheti access (fixed by recruiting or by honest scope). No login, licence or large cash is needed.

---

## (h) Red team
**Strongest honest reason it fails:**
- The buyer pool is tiny and defensive. There are perhaps 15 UK health AI-phone vendors and ~25 SMB receptionist vendors.
- A vendor fresh from bad press may not want an outsider documenting failures. It may answer "our internal QA team covers this" (InTouchNow lists one; VERIFIED) or "we use Hamming/Coval" (synthetic Bengali exists; VENDOR CLAIM).
- Our Dhaka Bangla is not the Sylheti most older UK callers speak. Without Sylheti speakers our edge shrinks to something a TTS can imitate.
- Even after a reply, a funded vendor may prefer a UK research recruiter (£55–110/user-hour) for procurement comfort.

**Counter-evidence searches I ran:**
1. Is synthetic Bengali testing already sold? **Yes:** Hamming's Bengali page covers "Bangladeshi, West Bengali accents" (opened). No Sylheti.
2. Do vendors already do this in-house? InTouchNow lists a "Quality assurance team" and says its platform was "fully assured" by practices and ICS commissioners (opened). QuantumLoop says EMMA was "trained across a wide range of accents" (MiP, opened).
3. Is any real-speaker panel for Sylheti/Bangla offered to UK vendors? **NOT FOUND** (2 searches: "Sylheti voice AI test", "AI receptionist Bengali UK"). The UK SMB search returned only Indian vendor marketing (Edesy).
4. Is any Tower Hamlets or Newham practice live on an AI receptionist? **NOT FOUND** (1 search).

**Net:** the risk is real, but no-one occupies the Sylheti real-speaker spot. The cheap test answers the biggest unknown (does the demo fail?) in a week.

---

## (i) vs Shothik (Read, Trust, Pay)
| Step | Shothik (NY restaurants) | This | Verdict and why |
|---|---|---|---|
| Read | Facebook message requests to owners: weak (method A7) | Published founder and role emails at small UK B2B startups, plus a live public controversy | **Better.** It is a business inbox that expects supplier mail, and the subject is their own product's reputation. |
| Trust | Identity strong (Bangla); risk weak (needs a Google login) | Identity is the qualification (native Bangla, Dhaka); competence comes from recordings of their own demo; no login at any stage | **Better.** Dhaka becomes an asset (B10 point 5), and P2 disappears. |
| Pay | Payoneer works, but small NY restaurants may want Zelle or cash (P8) | UK companies pay bank transfers; Payoneer's GBP local transfer is free | **Better.** The buyer's normal rail matches ours. Shothik's one advantage is a bigger pool; this pool is ~40. |

---

## (j) Intelligence verdict
The formula flatters this one: two-key passes 3 of 3, and the chain is only held down by Repeat. The truth is narrower. It is a **small, sharp niche** with an unusually good trigger and a non-copyable asset, native Bangla speakers who can field Sylheti callers. Its ceiling is set by pool size, not by the steps. What I believe: it is the best M4 road because it is the only one where software and cheaper offshore labour cannot do the paid part. Run the $5 test first. If the demo lines handle Bangla well, the letter loses its bite. Pivot it to "independent native-speaker evidence for your sales into East London" or drop it. The upside paths are Ufonia's 10-language trial and agencies selling Bengali packs.

---

## Named buyer list (23, each with a public contact point)
All contact points were seen on the organisation's own site or listing on 2026-10-29 unless marked. Fit: A = health AI phone vendor, B = UK SMB AI-receptionist vendor or agency, C = public-sector or adjacent. **Don't contact anyone until the CEO approves.**

| # | Buyer | Fit | Public contact point | Visible signal that makes them a fit |
|---|---|---|---|---|
| 1 | InTouchNow (London) | A | daniel@intouchnow.com (on site); demo 020 3879 4499 | "Fluent in 85+ languages… 200+ regional UK accents"; 150+ practices; £2.3m seed 2026-09-23 |
| 2 | Wavenet — AI GP Reception | A | wavenet.co.uk/contact-us (form) | Same demo number as InTouchNow (likely a reseller, ESTIMATE; a middleman multiplies); sells to NHS GP via GP Voice |
| 3 | QuantumLoopAI (EMMA) | A | quantumloopai.com/contact (form) | "Supports 17 languages"; Healthwatch accent complaints; 3 practice withdrawals Aug–Sep 2026 |
| 4 | Auxilis (Jackie) | A | hello@auxilis.ai | AI receptionist for GP practices / frontline healthcare |
| 5 | Ufonia (Dora) | A | ufonia.com/uk/get-in-touch (form) | NIHR trial to add 10 languages incl. Bengali (Moorfields, 2025-07-17) |
| 6 | DrDoctor — Agentic Voice | A | drdoctor.co.uk/contact (form); support@drdoctor.co.uk | NHS hospital voice agent for rebooking and patient queries |
| 7 | ViveoAI (dental, UK & Ireland) | A | info@viveoai.com | Browser demo "Fiona"; "tailored voice & accent" |
| 8 | Verbalise (MSK/allied health) | A | verbalise.ai/#demo (form) | British AI receptionist for clinics; accent mentioned on site |
| 9 | ICS.AI | C | info@ics.ai | Accent/dialect study with Univ. of Sheffield (2026-02-24); council contact centres |
| 10 | Netcall | C | marketing@netcall.com | AI contact centre for local government; NHS diagnostic booking |
| 11 | Softomate Solutions | B | hi@softomatesolutions.com | Sells **Bengali**, Urdu, Punjabi, Hindi packs at £800–1,500 each for London/Birmingham/Leicester/Bradford |
| 12 | Answrd (Calem Taylor, London) | B | hello@answrd.co.uk; calem.taylor@answrd.co.uk (published in Retell forum 2026-10-06) | AI receptionist for UK trades and clinics on Retell; sells $350 audits, so is also a partner prospect |
| 13 | Legacy AI (London; Gold Retell partner) | B | legacyai.agency (site, via Retell partner page) | Partner page lists languages "Chinese, English, **Punjabi**, German"; 52+ clients |
| 14 | Sidekiq AI (London; Gold Retell partner) | B | calendly.com/michael-sidekiq/30min (on Retell partner page) | UK agency that "designs, builds and runs voice agents" |
| 15 | Antek Automation (London; Gold Retell partner) | B | cal.com/antek-automation/30min (on Retell partner page) | Voice AI for home services, hospitality, wellness |
| 16 | Moneypenny | B | hello@moneypenny.co.uk | AI receptionist with human back-up; sector demo lines by phone (own site) |
| 17 | Ringmere | B | info@ringmere.com (site has an "Agency enquiry" mailto) | "30+ languages" on Growth/Pro (AInora guide); UK appointment businesses incl. dental and vet |
| 18 | Hey Jodie | B | team@heyjodie.com | "Speaks 32 languages and switches mid-call" (own site) |
| 19 | Team-Connect | B | support@team-connect.co.uk; team-connect.co.uk/contact | "Multilingual AI" on Business Pro (AInora guide); partners page |
| 20 | Answer.co.uk | B | answer.co.uk/contact/ (form) | UK answering bureau selling an AI receptionist with test calls |
| 21 | ALEPI Solutions (Diamond Retell partner) | B | calendly.com/alex-alepisolutions/30min; alepisolutions.com | Deploys voice agents at scale. **UK location NOT VERIFIED** (keyword match only) |
| 22 | Fasthosts — Spark AI receptionist | B | fasthosts.co.uk/spark/ai-receptionist (contact via site) | "English plus 30 more languages" (AInora guide, VENDOR CLAIM); large company, low fit |
| 23 | babblevoice (GP telephony) | C | babblevoice.com/contact/ (form) | GP surgery cloud telephony; possible channel partner for AI receptionists. **Weak signal** (no AI-language claim seen) |
**PARTNER CHECK (30 min):** for #21–23, open each site and record (a) the UK registered address, (b) whether any language claim exists. Drop any without both. Also try X-on (Surgery Assist, named by iatroX): its site blocked my automated fetch, so record its contact page by hand.

---

## Sources opened (2026-10-29)
- intouchnow.ai; wavenet.co.uk/artificial-intelligence/ai-gp-reception; quantumloopai.com; auxilis.ai; viveoai.com; verbalise.ai; ringmere.com; heyjodie.com/en-gb; team-connect.co.uk; answrd.co.uk; moneypenny.com/uk/ai-receptionist; netcall.com; ics.ai/contact; drdoctor.co.uk/platform-hybridos/agentic-voice; ufonia.com sitemap
- primarycare.northeastlondon.icb.nhs.uk/wp-content/uploads/2026/02/Virutal-Receptionist-comms-to-practices-FINAL.pdf
- managementinpractice.com/news/ai-receptionists-can-struggle-to-understand-regional-accents/ (2026-08-25)
- resultsense.com/news/2026-09-23-fakenham-gp-drops-emma-ai-receptionist/ ; …/2026-09-23-intouchnow-seed-gp-ai-voice-agent/ ; …/2026-08-26-ai-receptionist-stroke-decommissioned/
- moorfields.nhs.uk/…/ai-trial-expands-patient-access-with-multilingual-clinical-consultations (2025-07-17)
- sheffield.ac.uk/news/ey-ai-landmark-study-helps-ai-better-understand-accents-and-dialects (2026-02-24)
- softomatesolutions.com/ai-receptionist-uk/ ; applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/265160136325799
- hamming.ai/language/bengali ; coval.dev/voice-agent-audit ; cekura.ai/pricing
- data.london.gov.uk Census 2021 ethnicity/language release PDF
- retellai.com/partner/{legacy-ai, sidekiq, antek-automation, alepi-solutions}; community.retellai.com/t/3733
- iatrox.com/blog/best-ai-receptionist-tools-nhs-gp-surgeries-2026 (2026-03-23); ainora.lt/md/blog/best-ai-receptionist-uk-2026.md (competitor guide, checked 2026-10-11)
