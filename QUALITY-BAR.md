# Quality Bar — what "A+" means here, and the loop that earns it

**Foundation rule: nothing gets built on a sub-A+ foundation.** A grade is earned by passing a
written rubric — never by confidence, tone, or effort. "Real A+" means a third party could
re-check the evidence (resolve the citations, read the cited lines, re-run the logic) and reach
the same grade.

## The loop (every artifact)

1. **PRODUCE** — the author builds the artifact to its rubric.
2. **SELF-GRADE** — the author appends a gate-by-gate self-assessment to the artifact.
3. **INDEPENDENT CHECK** — a *different* mind grades it: spot-checks the evidence
   (citations resolved, line numbers read against source, pure logic re-executed) and
   actively tries to break the load-bearing claims.
4. **FIX → RE-GRADE** — loop steps 3↔4 until every gate passes.
5. **LEDGER** — the grade is recorded in `INDEX.md` with the date. Only after that may
   other work depend on the artifact.

Anti-inflation rules:
- A gate that cannot be verified **fails**.
- An artifact may be A+ **with declared unknowns**; it may never be A+ with hidden ones.
- The producer's self-grade is never final. Sub-bar grades are stated plainly in the ledger.
- If a checker finds one fabricated citation or one false line-citation, the whole artifact
  fails and is reworked — not patched around.

---

## Rubric R — Research (10 gates)

R1. **Coverage** — answers every decision question it was commissioned for; none skipped.
R2. **Sourcing** — every load-bearing claim has ≥2 independent sources, or is explicitly
    flagged single-source.
R3. **Citations real** — real URLs with access dates; a random spot-check of 10 citations
    resolves 10/10 and each actually supports the claim it backs.
R4. **Adversarial** — for each core thesis, the research *actively tried to refute it*
    (hostile queries, competitor counter-evidence) and reports what it found, even when
    inconvenient.
R5. **Recency** — market claims rest on 2025–2026 sources; older sources only for stable facts.
R6. **Confidence grades** — every claim marked CONFIRMED / PARTLY / UNVERIFIED.
R7. **Honest unknowns** — an explicit "what we still don't know" section.
R8. **Decision-linked** — every finding ends in a concrete implication for the product.
R9. **Clean lineage** — nothing inherited from any discredited source (the external dossier).
R10. **Survives independent spot-check** — a second mind verifies a sample of claims and
     finds no fabrication and no claim-source mismatch.

## Rubric P — Position / source-truth (6 gates)

P1. Every feature/subsystem of the product was read **firsthand** in the source file.
P2. Every claim is line-cited, and a spot-check of cited lines reads true.
P3. Zero unresolved "❔" — every "not yet read" item is read, or moved to a *truly
    unreadable* list (e.g. code that lives outside the file) with the reason.
P4. Every inherited audit claim used anywhere is independently **verified or refuted**, with
    line evidence.
P5. Pure-logic claims (math, parsing, state) are **executed** (Node) — not eyeballed —
    where feasible.
P6. Survives independent spot-check (a second mind re-reads N cited claims).

## Rubric I — Ideas (7 gates per idea + 1 portfolio gate)

I1. **Named pain** — solves a verified GM pain, citing the A+ research.
I2. **No-AI half** — genuinely useful with AI off; deterministic and offline.
I3. **AI half** — elevation, not the entry ticket; works with BYO-key/local models.
I4. **Feasible solo** — buildable by one person inside the single-file architecture; names
    the existing code hook(s) it builds on.
I5. **Differentiated** — no rival ships it, or ours is structurally better; cite the research.
I6. **Constraint-clean** — halal (incl. copy framing), Gumroad/Payoneer-compatible, offline-capable.
I7. **Failure modes** — the realistic ways it disappoints are listed, each with a mitigation.
I-PORT. **Portfolio gate** — the kept set collectively covers: first-hour wow, weekly
    retention, and the no-AI $49 value floor.

## Rubric B — Blueprint / Plan (8 gates)

B1. Built **only** on A+ inputs (research, position, ideas) — and cites them.
B2. Every existing feature has a keep / deepen / cut verdict **with a dual-mode spec**
    (its no-AI depth and its AI layer).
B3. Criticals-first sequencing — trust/money/data bugs precede deepening.
B4. Sliced so **every slice leaves the product working** — no half-wired features, ever.
B5. Effort-honest for a solo, non-coder-led build; no fantasy timelines.
B6. Risk register — top risks with mitigations.
B7. Constraint check passed — halal, Gumroad/Payoneer, single-file, offline, BYO-key.
B8. Survived an adversarial review pass (money / time / scope / security angles).

## Rubric C — Code change (6 gates)

C1. Root-caused — no fix without the investigation showing *why* it's the cause.
C2. Proven — Node-executed test where logic is pure; a desktop-runbook step where UI-only.
C3. Atomic — one coherent change per commit; the file is never left half-wired.
C4. No silent failure introduced — user-visible failures surface (toast/log), never swallowed.
C5. Style-native — matches the file's existing idiom (vanilla JS, `h()`, State/Render patterns).
C6. Reviewed — diff read by a second pass before it lands.
