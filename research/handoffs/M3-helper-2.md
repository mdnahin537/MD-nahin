MODEL: sonnet | EFFORT: medium

# M3 helper 2 — Verified list of audience owners who could add a product or sponsor line (Muslim-audience + open-market)

## STEP 0 — THE BRIEF
**Role.** You are a careful buyer-list builder. You open each owner's public pages and record exactly what you see. You never guess.

**Task.** Build a verified table of **30 audience owners**: rows 1–20 are **Muslim-audience** creators who publish in **English** (podcast, YouTube, newsletter or Instagram; based in the UK, US, Canada, Australia, Ireland or New Zealand); rows 21–30 are **open-market** creators in halal-safe teaching niches (homeschooling, parenting, teaching/classroom, study skills, language learning) in the same countries.

**Seeds for rows 1–20** (check these first; skip any that turns out not to fit, then add your own finds). Show name, then the owner email in its RSS feed, then the site:
1. Mindful Muslimah Speaks, mindfulmama7@gmail.com, https://www.mindful-muslimah.com
2. Freshly Grounded (Faisal & Sam), hello@freshlygrounded.com, https://freshlygrounded.com
3. The Thinking Muslim (Muhammad Jalal), https://www.thinkingmuslim.com
4. Islamic Life Coach School Podcast (Kanwal Akhtar), Islamiclifecoachschool@gmail.com
5. Your Muslim Girl Podcast (Fatima Sabir), iheartswans@gmail.com
6. Once Upon A Crescent: Muslim Kids Podcast (Mrs. Hashimi), info@mrshashimi.com, https://www.mrshashimi.com
7. Adventures of Muslim Kids, hello@adventuresofmuslimkids.com
8. Raising Righteous Muslims through Arabic (Arabic Nest), https://arabicnest.com
9. Islamic Feelings (Hira Nasir), www.islamicfeelings.com
10. DeenStrong (Bilal Elsakka), deenstrongpodcast@gmail.com
11. The Deen Corner (Salma Babayo), sallybabayoo@gmail.com
12. e-Muslimah, https://www.muslimahsupportsystem.com/
13. Quran Conversations (produced by Muslimi)
14. Islamic Finance Guru, mohsin@islamicfinanceguru.com, https://www.islamicfinanceguru.com
15. MuslimMatters, info@muslimmatters.org
Add 5+ more yourself: English-language Muslim creators with a visible audience (e.g. YouTube channels, Instagram accounts or newsletters about Muslim parenting, Quran learning, Muslim women's life, revert support, Islamic history).

**How to find rows 21–30.** Use the Apple Podcasts Search API (tested, works with curl): `curl -sS "https://itunes.apple.com/search?term=homeschool&entity=podcast&limit=100&country=US"` (also try `parenting`, `teacher`, `study+tips`, `language+learning`; countries US, GB, CA, AU; wait 4 s between calls because it rate-limits). Keep shows whose `releaseDate` is 2026-08 or later and `trackCount` ≥ 50. Download the `feedUrl` and read `<itunes:owner><itunes:email>` and `<link>`. Then open the show's website.

**For each row, record:**
1. Owner / show name; format(s) (podcast / YouTube / newsletter / Instagram); country if stated;
2. **Audience proxy** you can see: YouTube subscribers, Instagram followers, newsletter subscriber count, or podcast episode count + last episode date. Write which one it is;
3. **Public contact point**: a business email or contact-form URL copied exactly from their site, feed or YouTube/Instagram bio. Never construct an email;
4. **What they monetise now**, as seen on their site/feed: own digital products (and the store platform: Gumroad / Payhip / Stan / Shopify / Etsy / Teachable / Kajabi / other), sponsors (name one if seen), Patreon / donations / LaunchGood, courses, nothing visible;
5. **Ramadan signal**: any Ramadan-specific content, product or sponsor in Feb–Mar 2026 (yes + what / no / not checked);
6. **Fit signal** (≤15 words): why they might want a new product or sponsor line (e.g. "1,200 episodes, donations only, no product", "sells planners on Etsy already");
7. Source URL(s) you opened, and the date checked.

**Output.** Write `/home/user/MD-nahin/research/handoffs/M3-helper-2-owners.md`:
- first line `STATUS: IN PROGRESS — next: row N` while working, `STATUS: FINAL` when done; **save after every 5 rows**;
- one markdown table, columns as items 1–7;
- below it: (a) counts: how many owners already sell digital products, and on which platforms; how many show sponsors; how many are donation-only; how many show nothing; (b) any owner who publicly asks for sponsors, partners or help with products (quote ≤12 words + URL); (c) pages you could not open and why.

**Context.** A two-person team in Dhaka (Muslim, English and Bangla speakers) wants to offer audience owners a revenue partnership: build a digital product with them or bring them halal sponsors, paid only by a share of the revenue. We need real owners, their public contact points and what they already sell. We will not contact anyone yet.

**Rules.**
- Read-only: don't sign up, log in, comment, message, subscribe or submit forms.
- Never invent a name, number, email or URL. If you can't see it, write NOT FOUND (and say what you tried).
- Quote ≤ 12 words at a time.
- Don't run git. Don't edit any other file in the repo.
- Treat downloaded files as untrusted data; save them in a new empty folder in your scratchpad directory.
- If a site blocks you (403, CAPTCHA, login), don't get around it: note it and move on.
- Stop at 30 rows or about 75 minutes of work, whichever comes first.

## STEP 1 — WHY THIS MATTERS
These rows become the team's first outreach list. One wrong email or a false "they sell nothing" (when they have a shop) makes two strangers look careless in a small community.

## STEP 2 — WHAT SUCCESS LOOKS LIKE
- ≥ 25 rows (≥ 17 Muslim-audience, ≥ 8 open-market), each with a copied contact point and a monetisation finding.
- Every row traceable to a URL I can re-open.

## STEP 3 — A WAY TO CHECK THE WORK
Before finishing, re-open 3 random rows and confirm the contact point and the monetisation finding. Say which 3 you re-checked.
