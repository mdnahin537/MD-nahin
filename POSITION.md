# RealmWright V7 — Position Map (firsthand, read from source)

*Purpose: know exactly what this product **is** and **where it stands** before any move toward greatness. Every claim here was read directly from `realmwright-v7.html` (17,864 lines) this session and is line-cited. Where this conflicts with `.audit/`, trust this — the audit was verified against code and found **wrong on the flagship feature** and **imprecise on data-loss**, so nothing from it is asserted here without firsthand confirmation.*

**Coverage honesty:** Sections 1–6 are read firsthand. Section 8 lists what I have **not** yet read — those are flagged, not guessed.

---

## 1. What it actually is

A **living-nation simulation** with a **GM / session-prep layer** on top and a **tool-calling AI** woven through — *not* a worldbuilding wiki.

- Single self-contained `.html`: vanilla JS, **no framework**, custom `h()` hyperscript, custom `Router`, `State` singleton, **IndexedDB** persistence (one `kv` store). ~1.08 MB.
- **Core loop:** a realm has 10 live **stats** (Legitimacy, Cohesion, Food…). Each stat has **thresholds that auto-fire named historical events** with era-aware prose (e.g. Legitimacy < 30 → *"the proclamations from the palace are read aloud, but no one repeats them at home"*). Nine **pressure rules** surface live situations. (`CORE_STATS` L4752, `PRESSURE_RULES` L4783.) **This emergent-history engine is the real moat — no competitor in the research has it.**
- **Framing:** default is *"Strategist / High Command"*; a **GM-Mode toggle** re-skins vocabulary for tabletop (`TERM_GM_MAP` L5970). So today it is a geopolitics sim that *can* wear a GM hat — a positioning fork to decide.

## 2. The surface

**12 nav routes** (L3456+): War Room (dashboard), Chronicle, Sessions, Hooks, Secrets, Fronts, Locations, Bestiary, Relations, Relationship Web, Solo, Threads.
**Overlays / modes:** Tonight (L17727), Campaign prep-board (L17756), Decipher Notes (L17795), Global Search (L17823), Transparency Log (L17842), FrontDoor, License Activate modal.

## 3. Data model

Per-nation arrays: `chronicle, characters, factions, sessions, hooks, secrets, fronts, locations, bestiary, artifacts` + `stats` (L7036). **Sessions** track number, in-fiction date, hooks opened/closed, NPCs appeared, time advanced (L7104). **Hooks** link NPCs, factions, and the sessions they were raised/closed in (L7147). Bounded version **snapshots**, lossless **migrations**, corrupt-storage recovery. This is a real campaign-continuity engine.

## 4. The AI layer (rich and real — not "phase 2")

- **Context engine** with cost-tiers (`buildContext` L9882, low/medium/high/full).
- **~15 generators**: world-from-text (`importFromText` L10576), `generateStrongStart` L10641, `generateSessionPrep` L10795, plus factions/characters/locations/cross-realm-relations/encounters (L10668–10977).
- **Tool-calling copilot** (`streamOnce` L10187, `COPILOT_TOOLS` L9346): read tools + write tools (add event/NPC/plot-seed, resolve hook, shift faction, change stat), **writes gated by scope and queued for human approval** unless auto-apply.
- **49-prompt "Arsenal"** (`PROMPTS` L4845), tiered/gated, **already halal-swept** ("nothing referencing divination, demonology, gambling, or oracle-fate framing" L4844).
- **BYO-key** (OpenRouter) **+ local Ollama** (zero data leaves machine). **Transparency log** of every AI call + running cost. **Demo proxy** (`Demo` L6205) where the Worker holds the key — a no-key path, Turnstile-gated.

## 5. Feature state — VERIFIED firsthand

| Feature | State | Note (evidence) |
|---|---|---|
| **Simulation engine** (stats→events→pressures) | ✅ works, high craft | Well-written, distinctive (L4752–4793) |
| **Tonight generator** | ✅ works, well-built | One line → builds a nation → parallel Strong Start + Session Pack, per-step error isolation + retry + orphan cleanup (`generate` L12477). **Audit's "viewer" claim was FALSE.** |
| **LiveMode (Campaign live rail)** | ⚠ half | AI fire is a **stub** (`// Stub` L12217) — but the **no-API heuristics engine works** and is genuinely useful (L12251+). The no-AI half is a built-in proof of the "$49 without AI" thesis. |
| **Campaign prep-board** | ✅ wired (depth TBD) | Every card has manual `+Add` **and** `⌘AI` (`_openAiPop` L11845; AI actions wired to real generators L11984). |
| **Primary JSON export (your backup)** | ✅ COMPLETE / safe | Dumps the full nation object(s), strips only `meta` so the key never leaks (L8846). **Your data-ownership safety net loses nothing.** |
| **Foundry VTT export** | ⚠ incomplete | Omits Fronts/Bestiary/Relations/Artifacts/Sessions (L8933). Product review wanted this cut anyway. |
| **Story-Bible PDF** | ❔ partial | Includes chronicle/factions/characters/artifacts/secrets via checkboxes (L8963+); Fronts/Bestiary/Relations/Hooks/Sessions coverage **not yet confirmed**. |
| **Markdown / XSS** | ✅ safe | Escape-first → DOMPurify w/ URI allow-list (L5873). |
| **No-key demo** | ✅ architected, unconfigured | `Demo` proxy + `DemoCounter` exist; gated on empty `TURNSTILE_SITEKEY` + Worker (L6184–6212). The review's "#1 build" mostly already exists. |

## 6. Verified problems (firsthand)

- 🔴 **License self-revokes on transient server error.** `_backgroundValidate` (L6144) calls `res.json()` with **no `res.ok` check**, then `this._data.valid=!!json.valid` + persist; a 500/429 with a body flips a paid license invalid and fires `license:expired`. Catch only handles network throws. → downgrade only on `res.ok && json.valid===false`.
- 🔴 **Secret-leak.** `CLAMP` (L5863) has no `visibility` normalizer → a stray `"Private"`/unknown value bypasses the lowercase-exact player-visibility filters; hidden canon can render to players. → add `CLAMP.visibility` (public|private|forecast) at parse/import/render.
- 🟠 **Payout-constraint conflict.** Licensing supports **Lemon Squeezy + itch.io, not Gumroad** (`_activate…` L6124/6138, `LS_PRODUCT_ID` L4663). Collides with the Gumroad+Payoneer-only rule. → add a Gumroad license-key path.
- 🟡 **Halal copy.** A Tonight loading tagline says *"Reviewing recent oracle results…"* (L12396) — "oracle" is the framing the prompt sweep removed elsewhere. One-word fix.

## 7. Where the $49 / $229 / $19 vision already lives

- **No-AI ($49) value present today:** the simulation engine, LiveMode heuristics, Campaign manual cards, complete JSON ownership/backup, structured-canon spine, global search, snapshots.
- **AI ($229) value present today:** Tonight generator, ~15 generators, Campaign `⌘AI`, tool-calling copilot, the 49-prompt Arsenal, Decipher Notes.
- **Gap to the vision:** finish LiveMode's AI fire; make "every feature has AI" *uniform*; configure the no-key demo; add Gumroad licensing; fix the two criticals. **The dual-mode is ~70% built — the job is completion + polish, not a rebuild.**

## 8. NOT yet read (honest gaps — verify during the build)

Solo / Fronts / Bestiary / Relations / Web / Locations panel render logic · Campaign CRUD + `_openAiPop` internals · the canon parser (`[CANON]` ingestion — claimed bugs: re-paste doubling, decimal stat deltas dropped) · generator bodies (`importFromText`/`generateStrongStart`/`generateSessionPrep`) · `Compute` (stability/eras) · bootstrap/onboarding · full PDF entity coverage · audit-claimed-but-unverified: lost-write-on-close debounce (C05-1), theme breakage (C14), listener leaks. The Cloudflare Worker source is **not in this file**.

## 9. Implication for the build

This is **"complete + polish + finish specific gaps + repoint licensing,"** not a rebuild — and that protects the two months of work. Order: (1) the two verified criticals (license, secret-leak) — they guard trust and money; (2) finish the half-built (LiveMode AI fire, configure demo, Gumroad path); (3) deepen toward uniform dual-mode per Section 7. Verify the Section 8 items as each is touched.
