# LENS 5 — Algorithmic Correctness & Domain-Logic Audit

Scope: the math and the data model of RealmWright (`src/index.html`, ~14,850 lines).
Method: read actual code, trace with concrete inputs. RESEARCH ONLY — no edits.
Cross-ref tags: security=L1, copilot=L2, flow=L3, ui=L4.

Acknowledged-known (not re-reported): `eras()` can emit a zero-width era when two
scar-weight events share a year (cosmetic; render adds +20px so no divide-by-zero);
the proposed `e.year > p.year` guard would change segmentation semantics.

---

## FINDING 1 — `trend()` weights the WRONG five events (off-by-sort) — HIGH — index.html:6269-6273

### Faulty logic
```js
const rel=chronicle.filter(...).filter(e=>e.relatedStats?.includes(key))
  .sort((a,b)=>a.year!==b.year?a.year-b.year:((a.createdAt||'')<(b.createdAt||'')?-1:1))
  .slice(-5);
const tot=rel.reduce((s,e)=>s+(e.weight||0),0);
return tot>5?'rising':tot<-5?'falling':'static';
```
The comparator's tiebreak returns `1` when `a.createdAt >= b.createdAt` — i.e. it returns
`1` even when the two createdAt strings are **equal**. A comparator that never returns 0 for
equal elements is not a valid total order; on V8 (TimSort) it is *mostly* stable but can
reorder runs of equal keys. More importantly the secondary key is only consulted on a
year tie — that part is fine — but the real bug is the SLICE direction relative to the
"recent" intent.

### Concrete triggering input
A stat `legitimacy` with 6 related events, years `[100, 100, 100, 100, 100, 100]`
(all same year — common when a GM logs a busy single year), weights
`[+10, +10, +10, -9, -9, -9]` inserted in that order with identical or monotonically
increasing `createdAt`. `slice(-5)` keeps the LAST five in sort order. Because all years
tie and createdAt orders them by insertion, the dropped event is the FIRST `+10`. Kept sum
= `+10+10-9-9-9 = -7` → **"falling"**. The true recent direction with all six is `+3`
(static-ish, mildly rising). The user sees a falling arrow on a stat that is net-positive.

### Why it matters
`trend()` drives the up/down arrow shown next to each stat in the workbench (line 6592).
The arrow can flip purely on which same-year event happens to fall outside the 5-window,
which is determined by insertion order — not by recency or magnitude. For same-year-heavy
chronicles the indicator is effectively arbitrary.

### Correct approach
"Recent" should mean recent in *time*, but when many events share the latest year the
window cut is meaningless. Either (a) take the 5 highest-year events and include ALL events
of the boundary year (don't split a year), or (b) weight by recency rather than a hard
top-5 cut. At minimum make the comparator return `0` on full equality so the sort is a
valid total order.

CROSS-REF: arrow rendering is L4; the math defect is mine.

---

## FINDING 2 — Threshold dedup window breaks on fractional / BCE `currentYear` — MEDIUM — index.html:6333

### Faulty logic
```js
const dup=n.chronicle.find(e=>e.name===t.eventName&&e.year>=n.currentYear-5);
...
const ev={...,year:n.currentYear,...};
```
`currentYear` can be **fractional**. The session-advance path sets
`n.currentYear=Math.round(((n.currentYear)+advanceDays/365.25)*100)/100` (line 10312),
producing e.g. `1247.25`. Threshold-generated events are then stamped with `year:1247.25`,
while every manually-entered event is integer-clamped to `[1,99999]` (line 13257). The
chronicle now mixes integer and fractional years.

### Concrete triggering input
1. Advance a session by 90 days → `currentYear` becomes `1247.25`.
2. Drag `corruption` from 6 to 8 → crosses the `rising@7` "Treasury Bleeding" threshold.
3. Event is created with `year:1247.25`.
4. Sort comparators (`a.year-b.year`) still work numerically, but the era timeline now
   has a non-integer tick, and the dedup check `e.year>=n.currentYear-5` (= `>=1242.25`)
   compares against later integer years inconsistently.

Separately: the **realm-settings reset** (`rs-year`, line 12419) does
`const yr=parseInt(...);if(!isNaN(yr))n.currentYear=yr;` with **no lower clamp**, so a GM
can set `currentYear = -500`. Threshold events then stamp `year:-500`. Manual events still
can't go below 1 (clamp at 13257), so you get a chronicle with one event at year -500 and
the rest at year ≥1 — `eras()` will treat the -500 event as the `startYear` and the gap to
the next event (>505 years) blows every `ERA_GAP` (max 100), producing a spurious
single-event era.

### Why it matters
Fractional/negative years are reachable through normal UI flows but the event model assumes
integer, ≥1 years. Era segmentation, the dup-suppression window, and the timeline scale
(`totalYears`, `dotX`) all silently misbehave. Threshold spam-suppression can fail (a
fractional currentYear means `currentYear-5` no longer aligns with prior integer-year
duplicates, so the same auto-event can re-fire).

### Correct approach
Pick ONE year domain. Either allow fractional years everywhere (and round consistently in
`eras`/`dotX`), or keep currentYear integer (round in the session-advance path and clamp
`rs-year` to ≥1 like the event form does). The dedup window should compare on
`Math.floor(year)` if fractional years stay.

CROSS-REF: the session-advance UI is L4; reset-form plumbing is L3.

---

## FINDING 3 — `eras()` segments on `Math.abs(weight)>=20` so a heavy POSITIVE event splits eras — MEDIUM — index.html:6299

### Faulty logic
```js
if(Math.abs(e.weight)>=20||e.year-p.year>gap){ ...start new era... }
```
A "scar" is conceptually a catastrophe, but the code splits on absolute magnitude. A
weight of `+20` or higher is a triumph, not a scar, yet it forces an era boundary and —
via `_nameEra` (line 6308, also `Math.abs>=20`) — can NAME the era after a positive event.

### Concrete triggering input
Chronicle: `[ {year:1200, w:+5}, {year:1205, w:+22 "Golden Coronation"}, {year:1210, w:+4} ]`,
era gap 50. At i=1, `Math.abs(+22)>=20` → era boundary. The "Golden Coronation" starts a
new era AND names it (`scarringEvents` includes it). User sees an era literally titled
"Golden Coronation Era" — fine narratively, but the SAME code path means a single positive
windfall fragments an otherwise-continuous calm period into two eras, distorting the
historical-phase view.

There is no UI to create weight ≥+20 by hand? The event weight slider is `min=-30 max=30`
(line 2814), so **+30 is directly reachable**. Imported JSON can carry any integer.

### Why it matters
The "era" abstraction is supposed to mark turning points. Splitting on positive magnitude
means a prosperous reign with one big win shows as two eras, and `_nameEra` will label an
era of recovery after the single brightest event in it, which can read as the opposite of
the era's actual tone (e.g. a decade of decline that happened to contain one `+21` victory
gets named after the victory).

### Correct approach
Decide whether "scarring" = catastrophe (use `e.weight <= -20`) or = any pivotal event
(keep `Math.abs`). If catastrophe-only, change both the segmentation test and `_nameEra`'s
filter. If pivotal-either-direction is intended, document it and make `_nameEra` choose a
neutral/dominant-type name when the heaviest event is positive, so eras aren't mislabeled.

CROSS-REF: pure domain-logic decision; no other lens.

---

## FINDING 4 — `breakdown()` "dragged down by" mislabels low-value NEGATIVE-weight stats — MEDIUM — index.html:6248-6264

### Faulty logic
```js
const r=(s.value-s.min)/range;
const actualC=r*s.weight;
const expectedC=0.5*s.weight;
const dev=actualC-expectedC;   // >0 over-performing → "held up by"; <0 → "dragged down by"
```
For a NEGATIVE-weight stat (Corruption w=-20, range 0–10), low value is GOOD. At value 1:
`r=0.1`, `actualC=0.1*-20=-2`, `expectedC=0.5*-20=-10`, `dev=-2-(-10)=+8` → dev>0 →
**"held up by Corruption 1"**. That is correct (low corruption helps). But check the
threshold gate: `dev>0.5` for "up", `dev<-0.5` for "down". The deviation magnitude scales
with `|weight|`. A small-weight stat can never reach the ±0.5 gate at realistic values.

### Concrete triggering input
`raw_materials` (w=+5, range 0–100) at value 0 (total depletion): `r=0`, `actualC=0`,
`expectedC=2.5`, `dev=-2.5`. That clears the `<-0.5` gate, fine. But
`urbanization` (w=+5) at value 5: `r=0.05`, actualC=0.25, expectedC=2.5, dev=-2.25 — also
clears. Now `corruption` (w=-20) at value 6 (bad): `r=0.6`, actualC=-12, expectedC=-10,
dev=-2 → dev<-0.5 → "dragged down by Corruption 6" — correct.
The real defect: **the gate ±0.5 is in contribution-units, not normalized**, so a heavy
stat (legitimacy w=30) trips the gate at tiny deviations (`dev>0.5` means
`30*(r-0.5)>0.5` → `r>0.517`, i.e. legitimacy just above 51 already counts as "holding up"),
while a w=5 stat needs `r>0.6` to register. The "held up / dragged down" lists are therefore
biased toward high-weight stats and nearly never surface low-weight ones even at extremes.

### Why it matters
The breakdown sentence ("held up by Legitimacy 52, dragged down by …") is the user's
plain-English explanation of stability. It systematically omits low-weight contributors and
flags high-weight stats as significant at near-midpoint values, giving a misleading
narrative of what is actually driving the number.

### Correct approach
Normalize the gate per stat: compare `dev / |weight|` (a fraction in roughly [-0.5,0.5])
against a single threshold like 0.1, so a stat is "meaningful" when it's >10% off its own
midpoint regardless of weight. Then rank by `dev` for ordering.

CROSS-REF: sentence rendering is L4; the classification math is mine.

---

## FINDING 5 — Import does NOT clamp chronicle years or stat values into model range — MEDIUM — index.html:5134, 5170-5171

### Faulty logic
`buildNationFromSeed` maps imported chronicle events with
`(seed.chronicle||[]).map(e=>({...e,id:...,createdAt:...}))` — **no validation of `e.year`
or `e.weight`**. Core-stat values are taken raw:
```js
if(fullFormat&&isFullStat(seedStats[c.key])){value=seedStats[c.key].value;}
```
with **no `Utils.clamp`** (custom stats ARE clamped at line 5188; core stats are not).

### Concrete triggering input
Import a JSON with `stats.legitimacy.value = 5000` (range 0–100) and a chronicle event
`{year: 0, weight: 999}`. After import:
- `stability()`: `r=(5000-0)/100=50`, `c=50*30=1500`, and other stats normal. `tot=pw+nw`
  unchanged. The `Math.max(0,Math.min(100,...))` clamps the FINAL score to 100, so the
  number is hidden — but `inspector()` (line 6284) shows `pct: Math.round(50*100)=5000%`
  and `c: 1500.00` in the breakdown table. The math panel displays nonsense percentages.
- `eras()`: the `year:0` event becomes `startYear:0`; gap to next event likely > ERA_GAP →
  spurious era. `weight:999` → scar; `_nameEra` names era after it.
- The out-of-range value persists in storage and re-exports, propagating corruption.

### Why it matters
Round-trip is NOT value-safe for core stats. A hand-edited or copilot-generated import (L2
produces stat candidates) with an out-of-range value silently poisons every derived metric.
The 0–100 stability clamp masks the worst symptom on the dashboard but the inspector,
trend, breakdown, and era math all consume the unclamped value.

### Correct approach
Clamp core-stat `value` on import exactly like custom stats:
`value=Utils.clamp(seedStats[c.key].value, c.min, c.max)`. Validate/clamp chronicle `year`
to the same `[1,99999]` the manual form enforces, and `weight` to `[-30,30]`.

CROSS-REF: L1 owns malicious-payload security; this is the data-shape/range integrity angle.

---

## FINDING 6 — Orphaned `factionId` / location refs on characters are never swept — LOW/MEDIUM — index.html:5161-5167 (and faction-delete path)

### Faulty logic
`removeEvent` correctly sweeps `chronicleLinks` (line 5566). But there is **no equivalent
sweep when a faction is deleted**: a character's `c.factionId` continues to point at a
faction id that no longer exists. The migration at 5242 and the rebuild at 5161 only RESOLVE
name→id; they never null a dangling id.

### Concrete triggering input
1. Character "Veyna" has `factionId = "abc-123"` (the Merchant Assembly).
2. GM deletes the Merchant Assembly faction.
3. Veyna.factionId still = "abc-123". Anything that resolves the faction name from id
   (prompt templates, `resolveVars` at 6364, faction display in character cards) gets
   `undefined` → renders "unknown" or blank, or — if a `.name` is read off a `find()` that
   returned `undefined` — throws.

### Why it matters
Silent orphan references. Best case the UI shows a blank faction; worst case a `.name` of
`undefined` throws during render (that's L3/L4 territory to confirm), but the data-model
invariant "every stored factionId resolves to an existing faction" is not maintained.

### Correct approach
On faction delete, sweep `characters[].factionId`, `hooks[].relatedFactions`,
`secrets[].relatedFactions`, and any `relations` endpoints referencing that faction —
either null them or block deletion with a confirm. Same pattern as `removeEvent`'s
chronicleLink sweep.

CROSS-REF: whether the dangling read throws is L3/L4; the missing invariant is mine.

---

## FINDING 7 — `milCap` / `repression` read raw values with no range normalization — LOW — index.html:6267-6268

### Faulty logic
```js
milCap(n){const m=n.stats.manpower?.value??0,...; return Math.round(m*.35+r*.25+f*.2+t*.2);}
repression(n){const l=...??50,c=...??0,o=...??0; return(100-l)+(c*5)+(o*3);}
```
These assume the underlying stats are on a 0–100 scale, but `corruption` and `opposition`
are 0–10 (see CORE_STATS). `repression` multiplies `corruption*5` and `opposition*3` — the
×5/×3 factors appear chosen to rescale 0–10 stats toward the 0–100 `(100-l)` term, which is
fine for defaults. But if a user imports or builds a CUSTOM stat keyed `manpower`/`trade`
with a different range, or an out-of-range value (Finding 5), the weighted sum is silently
wrong, and `repression` has no upper bound or clamp.

### Concrete triggering input
`corruption.value = 10` (max), `opposition.value = 10`, `legitimacy = 0`:
`repression = 100 + 50 + 30 = 180`. There's no documented scale, so "180" is meaningless
without context. If `milCap` inputs are out of range (Finding 5), it can exceed any
expected band. These are display-only derived numbers, so impact is low, but the magic
coefficients (.35/.25/.2/.2 and 5/3) are undocumented and brittle to range changes.

### Why it matters
Low — display only. Flagged for completeness: the coefficients silently assume fixed stat
ranges; any range edit or out-of-range value desyncs the derived number from intent.

### Correct approach
Normalize each input to its own `(value-min)/(max-min)` before weighting (as `stability`
does), then scale to the intended output band. Document the output scale.

CROSS-REF: none; pure logic.

---

## OBSERVATIONS — verified CORRECT (no action)

- **`stability()` sign handling** (6224-6235): the `ps+ns+nw` shift correctly maps a
  fully-bad negative stat (r=1 → c=-|w|) to remove its whole `nw` bonus, and `tot===0→50`
  guards the all-zero-weight case. `range<=0` guard prevents divide-by-zero. Sound.
- **`eras()` empty-array** (6294): `if(!sorted.length)return[]` guards. Sound.
- **Comparators** in `eras`/`recentPulse`/`chronicleBand` (6293, 6630, 6709) correctly
  return `0` on full (year,createdAt) equality — these are valid total orders. The defective
  one is only `trend()` (Finding 1) and `last5`/`resolveVars` (6359, 6362) which use the
  `<?-1:1` form lacking a 0 branch — minor, V8-stable in practice.
- **Migration chain** (5201-5323): linear, idempotent-looking, each step guards
  `||[]`/`??`. The per-nation single-import path (7527) wraps with the file's schemaVersion;
  the multi-nation path defaults to `'1.0'` (7534) which is NOT a key in the migration
  chain (lowest is `'1.2.0'`), so a `nations`-array file lacking schemaVersion gets
  `'1.0'` → `migrateIfNeeded` sets it to `'1.2.0'` only via the `!d.schemaVersion` branch,
  which DOESN'T fire because `'1.0'` is truthy. **The whole chain is then SKIPPED** —
  worth flagging as a latent migration gap (see below).

### MINOR FINDING 8 — multi-nation import with schemaVersion `'1.0'` skips ALL migrations — LOW — index.html:5534, 5201-5202
`migrateIfNeeded({nations,schemaVersion:'1.0'})`: `d.schemaVersion='1.0'` is truthy so the
`if(!d.schemaVersion)` default to `'1.2.0'` never runs, and no `if(d.schemaVersion==='1.0')`
block exists → returns unmigrated. `buildNationFromSeed` backfills most fields anyway, so
impact is limited, but any migration-only normalization (e.g. the B19 relatedFactions
name→id at 5269) is skipped for these imports. Add an `'1.0'`/unknown→`'1.2.0'` normalization
at the top of the chain.

---

## TOP 3 — must fix

1. **FINDING 5** — Import does not clamp core-stat values or chronicle year/weight into the
   model's declared ranges. A single out-of-range import silently corrupts stability
   inspector %, trend, breakdown, and era math, and re-propagates on export. (index.html:5170)

2. **FINDING 1** — `trend()` arrow can flip arbitrarily based on insertion order when events
   share a year, because `slice(-5)` cuts a tied-year run by createdAt. The per-stat
   direction indicator is unreliable on same-year-heavy chronicles. (index.html:6269)

3. **FINDING 2** — Year domain is inconsistent: session-advance writes fractional
   `currentYear` and `rs-year` reset allows negatives, while the event form clamps to
   integer ≥1. Threshold events inherit the fractional/negative year, breaking the dedup
   window and era segmentation. Pick one year domain and enforce it everywhere. (index.html:10312, 12419, 6333)
