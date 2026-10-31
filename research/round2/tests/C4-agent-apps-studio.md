STATUS: FINAL

# C4 — Agent Apps Studio (ChatGPT/Claude apps and MCP servers for businesses)
Tested 2026-10-31 by the R2-3 companion. Labels: VERIFIED · SEARCH-SUMMARY · VENDOR CLAIM · ESTIMATE.

**Verdict (one line):** dies as a studio. Posted buyer demand is small jobs ($10–500, or $9–12/hour), the build is now auto-generated from an API spec (Stainless, Speakeasy Gram, open-source generators), and only ~900–1,950 apps exist in ChatGPT after 10 months, with Digiday asking whether anyone uses them.

## 1. Route proof
| Route | Evidence | Label |
|---|---|---|
| Upwork posted demand | Exists but tiny: "MCP Server Developer – Bug Fix" $25 (2026-10-12); "MCP Server Setup for AI Health Agent" $500 (2026-10-13); "Connect your AI Agent / MCP Server to a digital marketplace (Avolumi)" $25 (2026-10-10); Claude Desktop + WordPress MCP fix $20 (2026-07-09); "Claude MCP Server Setup" $10 (2026-07-12); an ongoing MCP build at $9–12/h; a $1,000 REST API/MCP/plugin job (2026-03-06). **No client post asking for a ChatGPT app (Apps SDK) build was found.** | SEARCH-SUMMARY (Upwork job pages via search; upwork.com blocks curl) |
| Seller side on Upwork | Project Catalog sellers offer SaaS MCP servers at $350–2,500 and $750–5,500 (asking prices). Upwork's hire page shows MCP developers at $15–20/h. | SEARCH-SUMMARY |
| Platform distribution | OpenAI opened app submissions on 2025-12-17; directory at chatgpt.com/apps; OpenAI pitched access to 800M+ users. | SEARCH-SUMMARY (openai.com, TechCrunch 2025-12-18) |
| Unknown sellers winning builds | NOT FOUND beyond the small jobs above. | — |

## 2. Demand trend (dated; supply of apps as a proxy for businesses building them)
- **2026-05-05:** "almost 900 apps on ChatGPT and 353 Claude connectors" (AppDiscoverability data, via Digiday). **VERIFIED** (ATDb summary page of the Digiday article, opened).
- **Later 2026 (undated):** ~1,900–1,952 ChatGPT apps, "nearly doubled in six months (979 → ~1,900)". SEARCH-SUMMARY (Product Hunt listing for ChatApp Radar).
- Upwork AI-related GSV +22% YoY in Q2 2026 (demand-map §1). Reading: the category is growing, but from a small base, and most apps come from large brands that build in-house.

## 3. Size if it works (ESTIMATE, bottom-up)
- Reachable buyers: SaaS companies and agencies that hire outside help for an MCP/ChatGPT app. Posted jobs found: ~10 in a few months of search snapshots. Assume 50–150 suitable posts a month across Upwork (ESTIMATE; count NOT FOUND).
- Price: realistic winning bids $300–1,500 per build; hosting/maintenance $50–200/month (ESTIMATE, anchored to the Upwork catalog asks and posted budgets).
- **Year 1 ceiling:** 15 builds × $800 + 5 maintenance × $100 × 6 = **~$15k**.
- **Year 3 ceiling (studio + hosting):** 150 builds × $1,000 + 80 hosted × $150 × 12 ≈ **~$300k/yr**. The hosting product faces Speakeasy Gram, Stainless and Cloudflare, which already host for free tiers.

## 4. Odds
- **Strongest failure reason:** AI substitution and generators. An MCP server is now generated from an OpenAPI file (Stainless free for open-source APIs; Speakeasy Gram usage-based with a free tier; liblab first 100 calls free; open-source generators). SEARCH-SUMMARY (fast.io roundup, reviewed 2026-05-08). What is left is a $25–500 integration job.
- **Counter-evidence search run:** "ChatGPT app directory number of apps 2026 … growth". It found growth (900 → ~1,950 apps) **and** Digiday's headline "Retailers are rushing to build AI apps. It's unclear if shoppers will use them" (2026-05-05, VERIFIED via ATDb). So the buyers' own payoff is unproven.
- Odds of a company here: **low (~7%, ESTIMATE).**

## 5. Rung 1 (≤ 3 months, $0)
- **Offer:** "Your API inside Claude and ChatGPT in 5 days: an MCP server plus a listed ChatGPT app, with a 60-second demo video of a real task. $400 fixed on Upwork escrow." Proof: two public open-source MCP servers for popular small-business APIs on GitHub.
- **First money:** Upwork fixed-price milestone.
- **Named targets (listing URLs, SEARCH-SUMMARY; check each is open):**
  1. MCP Server Setup for AI Health Agent ($500) — upwork.com/freelance-jobs/apply/MCP-Server-Setup-for-Health-Agent_~022109981777347850734/
  2. MCP Server Developer – Bug Fix ($25) — …~022109605374012976984/
  3. Connect your AI Agent / MCP Server to a digital marketplace (Avolumi) — …~022108879275413512725/
  4. MCP Server Development & Plan — …~022005966859575393170/
  5. MCP Server Development for LLMs and Autodesk Integration — …~021903022983949477828/
  6. Expert in Conversational AI and MCP Server Development — …~022004865269485946781/
  7. Fix Claude AI Desktop & WordPress MCP Adapter Connection Error — …~022075191834275017099/
  8. Claude MCP Server Setup & Local AI Agent Integration Specialist — …~022076373090412917114/
  9. Claude MCP local Server setup and installation — …~022075609484653445331/
  10. Blockchain Developer for AI Integrated REST API/MCP/Plugin ($1,000) — …~022030029954145788144/
  - Targets 11–20: NOT FOUND within budget; candidate dropped.

## 6. Pay rail
Upwork escrow → Payoneer / bank (VERIFIED round 1). Lemon Squeezy for a hosting subscription (VERIFIED, demand-map §7).

## 7. Competition and AI substitution
- Sellers: Upwork catalog MCP builders ($350–5,500 asks); MCP generators and hosts (Stainless, Speakeasy Gram, liblab, Apify actor at $0.49/run, FastMCP and AWS Labs open source). SEARCH-SUMMARY.
- Platform build-in: OpenAI and Anthropic keep lowering the bar (Apps SDK, connectors directories); expect no-code app creation within 12–24 months (ESTIMATE). Plane P10 fails.

## 8. Halal and licence
Halal: neutral tooling; screen clients (no betting, lending, adult). Licence: none. Data-handling terms needed for health or finance clients (the $500 health-agent job touches health data, so check privacy terms).
