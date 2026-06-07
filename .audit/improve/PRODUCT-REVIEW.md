# RealmWright V7 — Ruthless Product-Value Review

*Lens: YC product diagnostic (job-to-be-done, narrowest wedge, activation, retention, scope-as-subtraction). Grounded in `.audit/MAP.md`, `.audit/verify/REPORT-v2.md`, and live 2026 competitor pricing. This is a product review, not a bug audit — bugs are referenced only where they break the product story.*

---

## BRUTAL SUMMARY

RealmWright is a **beautifully over-built worldbuilding wiki competing in a category it can't win, while sitting on top of the one feature that could actually win** — the AI "canon paste" + "Tonight" session-prep loop. As a wiki it's a worse Kanka/World Anvil/LegendKeeper (those are live, collaborative, hyperlinked, multi-world, and cost $5-9/mo with free tiers). Its real, defensible job is **"turn my messy world into a runnable session in 15 minutes the night before I play"** — and that job is buried under nine entity types, three themes, a relationship web, and a Foundry export almost nobody asked for. The single most important truth: **the product is wide where it should be deep.** A GM doesn't pay $29 for the 12th place to store a faction; they pay to never again sit down Thursday night with a cold campaign and no plan. Today the BYO-key wall, a demo pitch that reopens every launch, and a "Tonight" mode that's a viewer (not a generator) all stand between the user and that one payoff.

---

## TOP 3 MOVES (ranked by impact on paid conversion + retention)

| # | Move | Why it wins | Effort |
|---|------|-------------|--------|
| **1** | **Make "Tonight" a generator, not a viewer — and make it the product's front door.** Right now Tonight is session-prep *display*. Turn it into "press one button Thursday night → AI drafts tonight's scenes, NPC voices, 3 likely player questions, an opening read-aloud — from the canon you already have." That is the job. Lead the whole app with it. | This is the only wedge no competitor owns. World Anvil/LegendKeeper/Kanka are *storage*; none generate a runnable session from your world. Retention in TTRPG is weekly and bursty — a weekly "what do I run tonight?" hook is the *only* thing that earns a re-open. | **M** (the AI plumbing, canon model, and Tonight shell already exist; this is rewiring, not new infra) |
| **2** | **Kill the BYO-key wall for first value. Ship a "no-key demo world" that proves the magic before asking for a key.** Today: a GM must get + paste an OpenRouter key before *any* AI fires. That's a cliff between "I'm curious" and "I'm impressed." Pre-bake one fully-generated example session so the wow happens at second 30, not after a 10-minute key hunt. | The BYO-key wall is the single biggest activation killer (see Q2). You cannot convert on a feature the user never sees fire. The demo Worker proxy already exists — point it at a canned/rate-capped sample. | **S-M** (Worker proxy + one curated sample world) |
| **3** | **Cut the wiki ambitions to a spine and reframe the pitch from "worldbuilder" to "session co-GM."** Demote/merge the second-class entities (Bestiary, Relations, relationship web, Foundry export) that the audit already proves are half-wired and dropped from export/PDF/search. Sell the *outcome* ("run a great session with 15 min of prep"), not the *container* ("store your whole world"). | Focus is subtraction. A solo builder in Dhaka cannot out-feature a funded wiki, and every half-feature is a trust leak (a GM finds Fronts missing from the PDF and stops trusting the export). Narrowing the promise also narrows what must be bulletproof before launch. | **S** (mostly copy, positioning, and hiding — not deleting — features) |

---

## Q1 — JOB-TO-BE-DONE & WEDGE

**The job a GM actually hires this for.** Not "build a world." GMs build worlds for *fun*, in Notion, on legal pads, in their heads, for free. The job they'll *pay* for is the painful one they avoid: **"It's the night before the session, my world is a mess of notes, and I need a runnable plan for tonight — scenes, NPCs, a hook, what happens if the players go off-script."** Web evidence confirms this is *the* GM pain: "prep time versus game time — many like preparing but often don't have the time," and AI can compress multi-hour prep "down to 10-45 minutes." That is the wedge. That is the only thing here a free tool and a funded competitor both fail at.

**Does it do that ONE job better than the alternatives? Today: no.** Ranked honestly:

- **As a worldbuilding wiki** (nations, factions, characters, locations, glossary, timeline): it is a **worse** World Anvil / LegendKeeper / Kanka. Those are collaborative, cloud-synced, infinitely hyperlinked, multi-world, battle-tested, and cost $5-9/mo *with free tiers*. RealmWright is single-file, single-world-feeling, offline, $29. On the wiki axis it is strictly dominated. Do not fight here.
- **Against Notion/Obsidian templates:** RealmWright's structured entities + stats are nicer than a blank template, but a GM who lives in Notion won't switch containers for marginally-better structure. Not a wedge.
- **Against a legal pad:** the pad wins on speed-to-jot and loses on "turn this into a session." That gap is the opening.
- **The AI-canon + Tonight loop:** *this* is the sharp wedge, and **nobody in the category owns it.** "Paste your world → it becomes structured canon → press a button → tonight's session is drafted." That is a different product than storage. It's a *co-GM*, not a *wiki*.

**The sharpest possible wedge from existing features (pressure-tested):**

> **"RealmWright reads your world and runs your table. Bring your campaign, press Tonight, and get a session you can actually run in 15 minutes — scenes, NPC voices, the hook, and what to do when players go sideways."**

The AI-canon flow is the *input* that makes this cheap (the world is already structured, so the AI has clean material). "Tonight" is the *output* that delivers the job. The whole rest of the app (the nine entity types) is **scaffolding for those two moments**, and should be sold and built as such.

**The honest risk to this wedge:** it's BYO-key. The magic moment depends on the user having pasted an OpenRouter key — so the wedge and the activation killer are the same problem (Q2). And the wedge leans on AI quality the creator doesn't control (the user's chosen model). If a GM points it at a weak free model and gets mush, the wedge dies on arrival. The product must (a) recommend a known-good default model loudly, and (b) prove the magic on a curated demo before the key wall. Without that, the wedge is theoretical.
