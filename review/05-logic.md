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

---

## ROUND 2 — Cross-review, debunks, new findings & consolidated fixes

Method: re-traced the actual code at every cited line. Worked examples use real CORE_STATS
ranges (legitimacy 0–100 w=30; corruption/opposition 0–10; etc. per SEED_NATIONS) and the
real Compute formulas (6222–6353). RESEARCH ONLY.

---

### (A) CONFIRMED cross-refs — with worked numeric examples

#### A-1 — L2#2 confirmed: unvalidated tool `weight`/`type` corrupts era + dot math (`_buildProposal` 8312, `_applyProposal` 8348). HIGH.
L2 is right that `add_chronicle_entry` accepts any `weight` (`typeof args.weight==='number'?args.weight:0` at 8312 — **no clamp**) and any `type` string. L2 said it reaches "stability/pressures." That part is slightly off and I correct it here: a chronicle **event weight never enters `Compute.stability` or `Compute.pressures`** — those read only `stat.value` (6225–6235) and `PRESSURE_RULES` read `stat.value` (3827–3835). Event weight feeds **`eras()`, `_nameEra()`, `trend()`, and the chronicle-band dot sizing**, not stability. The real downstream corruption from `weight:9999`:

Worked example — apply `add_chronicle_entry{name:"X", type:"Magical", weight:9999, year=currentYear}`:
1. `eras()` 6299: `Math.abs(9999)>=20` → forces an era boundary at X. If X sits inside a calm run, that run is split in two (same defect as my Finding 3, now reachable via AI with no slider cap).
2. `_nameEra()` 6308: `Math.abs(9999)>=20` → X is the scarring event → the whole era is named "X … Era".
3. `chronicleBand` 6735: `isScar=Math.abs(9999)>=20` → 14px dot — cosmetically fine, but `trend()` for any stat X relates to: 6272 `tot=…+9999` → instantly `>5` → permanent **"rising"** arrow regardless of every other event. One hallucinated weight pins a stat's trend arrow forever.
4. `type:"Magical"` (not in the enum) flows into `_nameEra`'s `tc[e.type]` dominant-type tally (6319) and `Utils.typeColor` (6738) → unknown type → fallback color; era could be named by a bogus type bucket.

So the corruption is real but the **target** is era/trend/naming, not stability. Fix is still L2's: clamp `weight` to [-30,30] and whitelist `type` against the enum in `_buildProposal`. This is the same clamp gap as the canon path (`applyCandidates` 7063 builds the event with `weight:c.weight||0` — **also unclamped**) and the manual form (which DOES clamp the slider to ±30 by `min/max` attr but the stored value is `parseInt(...)||0` at 13258 with no numeric clamp — see D map).

#### A-2 — L1 import-range overlap with my Finding 5: confirmed and the same single bug. HIGH.
L1 Finding 1/observations note import does "no schema/size validation beyond shape." My Finding 5 is the value-range half. Both are the same root: `buildNationFromSeed` core-stat path (5170) takes `value=seedStats[c.key].value` with **no `Utils.clamp`** while the custom-stat path (5188) DOES clamp. Worked: import `stats.legitimacy.value=5000` → `inspector()` 6284 `pct:Math.round((5000-0)/100*100)=5000%`, `c:(50*30).toFixed(2)="1500.00"` → the math panel (7502) prints "Raw … Final" with a 1500 contribution; `stability()` itself is masked by the 0–100 clamp (6235) but **every per-stat display is poisoned**. Confirmed exactly as written. Consolidated in (D).

#### A-3 — L3 Finding 4.1 confirmed: AI `statDelta` bypasses `checkThresholds` AND front-triggers. HIGH.
Verified by direct comparison:
- Canon path `applyCandidates` 7057 → `State.setStat(nid,key,targetVal)` → `setStat` 5545 calls `Compute.checkThresholds(nid,key,old,newVal)` → fires threshold chronicle events (6336) **and** front optional-stat-triggers (6343–6351). Correct.
- Tool path `_applyProposal` statDelta 8386 → `s.value=p.data.newValue` **directly**, then dispatches `['stat']`. **No `setStat`, no `checkThresholds`.** So neither threshold events nor `tickFront` fire.

Worked example confirming L3's expectation: front "The Siege" has `optionalStatTrigger{statKey:'legitimacy', direction:'below', threshold:30}`, currently inactive-clock; legitimacy=35. AI calls `update_nation_stat{stat:'legitimacy', delta:-10}` → newValue=25. Via the tool path: clock does NOT tick, no "Treasury Bleeding"-style threshold event is logged. The identical change typed in the slider (→ `setStat`) or emitted as a CANON `Stat: legitimacy -10` line DOES tick the front and log the event. The headline automation is silently dead on exactly one of three stat-write channels. Fix: route 8386 through `State.setStat(n.id,p.data.stat,p.data.newValue)` and drop the manual dispatch (setStat dispatches its own). This is also why the D-map below treats setStat as the canonical chokepoint.

---

### (B) DEBUNKED / SELF-CORRECTED

#### B-1 — SELF-CORRECTION of my own Finding 1: the slice DIRECTION is correct; I mis-described it.
Re-derived: `trend()` 6270 does `.sort((a,b)=>a.year!==b.year?a.year-b.year:…)` = **ascending** by year, then `.slice(-5)` = the last five = the five **highest-year (most recent)** events. That is exactly the "recent" intent. My Round-1 sentence "the real bug is the SLICE direction relative to the 'recent' intent" was **wrong** — the direction is right. The genuine defect is narrower and survives: when ≥6 events tie on the *latest* year, `slice(-5)` drops one same-year event chosen purely by `createdAt` insertion order, so the arrow can flip on insertion order alone. My worked example (six events all year 100, weights +10+10+10−9−9−9) still stands as a real arbitrariness bug — but it is a **same-year-window** bug, not a slice-direction bug. Downgrade framing: still MEDIUM (was HIGH). Fix unchanged: don't split a tied boundary year (include all events of the boundary year) or weight by recency.

#### B-2 — DEBUNK (partial) of L2#2's "reaches `Compute.stability`/`pressures`."
As shown in A-1: event `weight` is never read by `stability()` or `pressures()`. The claim overstates the blast radius. The clamp is still needed (era/trend/naming corruption is real), but reviewers should not expect a bad event weight to move the stability number. The thing that DOES corrupt stability is an out-of-range **stat.value** (my Finding 5 / A-2), a different field on a different write path. Keeping these distinct matters for the fix: clamp `event.weight` AND clamp `stat.value`, at different boundaries.

#### B-3 — DEBUNK of L5-Finding-7 severity (my own): `repression`/`milCap` "out of range" is not reachable via normal stats.
Re-examined: corruption/opposition max at 10, legitimacy min 0, so `repression=(100-0)+(10*5)+(10*3)=180` is the true max and it's a *bounded display number*, not corruption. The only way to exceed it is an out-of-range import (Finding 5), which the (D) clamp already fixes. So Finding 7 is **subsumed** by the boundary-clamp fix and is not an independent bug. Keep only the documentation nit (undocumented output scale). Downgrade to NIT.

#### B-4 — NOT a bug: `tot===0→50` guard with all-negative-weight nations (brief asked me to check).
Worked: a nation whose every stat has weight<0 (e.g. only corruption w=−20, opposition w=−15). Then `pw=0, nw=35, tot=35≠0` → the `tot===0→50` branch does **not** fire. `stability=Math.round(((ps+ns+nw)/tot)*100)`. At corruption=0,opp=0: `ns=0`, shifted=`0+0+35=35`, `35/35*100=100` → THRIVING (correct: zero corruption/opposition is maximally stable). At corruption=10,opp=10: `ns=(1*−20)+(1*−15)=−35`, shifted=`−35+35=0`, `0/35*100=0` → COLLAPSE (correct). The guard only triggers when **every** weight is exactly 0, which the `weight===0` skip (6226) already excludes from pw/nw — so `tot===0` means literally no contributing stats → 50 is a sane neutral. **Sound. No bug.**

---

### (C) NEW correctness findings (concrete triggers)

#### C-1 — NEW: `null`/missing stat `value` propagates NaN through stability, inspector, breakdown, trend-arrows — MEDIUM — 5170, 6229, 6252, 6282.
`isFullStat=(v)=>v&&typeof v==='object'&&'value' in v` (5121) is true when the `value` **key exists but is null**. Import core-stat path 5170 then sets `value=seedStats[c.key].value` = `null` with no `??`/clamp. Downstream:
- `stability()` 6229: `r=(null-0)/100 = 0` (null coerces to 0) — actually `null` coerces to 0 in arithmetic, so `r=0`, not NaN. BUT `undefined` (key truly absent → isFullStat false → falls to `c.default`, safe). The dangerous case is `value: NaN` or `value:"58"` (string). A string `"58"` → `(("58")-0)/100=0.58` works by coercion; a string `"high"` → `(NaN)/100=NaN` → `c=NaN` → `ps+=NaN` → `tot` finite but `(NaN)/tot=NaN` → `Math.round(NaN)=NaN` → `Math.min(100,NaN)=NaN` → **stability renders "NaN"** in the identity strip (6835 `numEl.textContent=stab`). 
Worked trigger: import `stats.legitimacy.value:"unknown"` (a string an AI canon-import or hand-edit can produce). Identity strip shows "NaN", status `Compute.status(NaN)` 6237 → all comparisons false → returns 'COLLAPSE IMMINENT'. Inspector pct `Math.round(NaN)`→NaN. The breakdown gate `dev>0.5` with NaN is false → stat silently vanishes from both lists.
Fix: in the core-stat import path, coerce+clamp: `value=Utils.clamp(Number(seedStats[c.key].value), c.min, c.max)` and if `!Number.isFinite` fall back to `c.default`. (Part of the (D) `clampStat` helper.)

#### C-2 — NEW: `rs-year` realm-settings save has NO lower clamp and accepts 0 / negatives, desyncing from the event form's `≥1` rule — MEDIUM — 12419 (vs 13257).
The input is `min="0"` (3474) but `min` is not enforced on programmatic/typed submit, and the handler is `const yr=parseInt(get('rs-year'),10);if(!isNaN(yr))n.currentYear=yr;` (12419) — accepts `0`, `-500`, `99999999`. Meanwhile the manual event form clamps year to `[1,99999]` (13257) and threshold events inherit `n.currentYear` raw (6336). 
Worked trigger: set Current Year = `-500`. Add any event (form clamps it to ≥1). Now `eras()` 6296 `startYear:-500`, gap to the year-≥1 events > any `ERA_GAP` (max 100) → a spurious single-event era at −500; `chronicleBand` 6712 `oldest=-500`, `totalYears` balloons, every dot crams into a sliver. Threshold dedup 6333 `e.year>=n.currentYear-5 = >=-505` behaves oddly. This is the concrete half of my Finding 2 I only asserted before — now confirmed as a live, separate write path with zero clamp. Fix: clamp at 12419 to `[1,99999]` (or the chosen domain) exactly like 13257.

#### C-3 — NEW: session-advance writes fractional `currentYear`, then threshold events stamp a fractional year that the dedup window can never re-match — MEDIUM — 10312, 6333, 6336.
`n.currentYear=Math.round((cy+advanceDays/365.25)*100)/100` (10312); the integer-collapse guard `if(Number.isInteger(n.currentYear*1))` (10314) only snaps back when the value is *already* whole. Advance 90 days → 1247.2464… → rounds to `1247.25`, stays fractional. Then a stat drag crosses a threshold → `checkThresholds` stamps `year:1247.25` (6336). Dedup at 6333 is `e.year>=n.currentYear-5`. 
Worked re-fire trigger: advance 90d → cy=1247.25 → corruption crosses 7 → "Treasury Bleeding" logged at year 1247.25. Advance another 90d → cy=1247.49 → corruption dips below 7 and crosses 7 again → dedup looks for `e.year>=1242.49`; the prior event's 1247.25 ≥ 1242.49 is TRUE, so this particular dup IS caught — but advance a **full in-fiction decade** (cy→1257.25) and re-cross: `e.year(1247.25) >= 1252.25` is FALSE → the same-named auto-event re-fires, as intended (>5yr window). The genuine bug is narrower: the **window is in mixed integer/fractional units**, so two crossings 4.9 fractional-years apart that the GM perceives as "the same year" can both fire or both suppress unpredictably. Fix: compare on `Math.floor(e.year) >= Math.floor(n.currentYear)-5`, and stamp threshold events with `Math.floor(n.currentYear)` (or keep currentYear integer — see D's year domain decision).

#### C-4 — NEW: `breakdown()`/`inspector()` `r` is not clamped, so an out-of-range value yields `pct` like 5000% AND a `dev` that dominates the ±0.5 gate — LOW (rolls into D) — 6252, 6282.
Independent confirmation that the gate in my Finding 4 interacts with Finding 5: with legitimacy=5000 (range 0–100, w=30), `r=50`, `dev=actualC−expectedC=(50*30)−(0.5*30)=1500−15=1485` → dominates the `dev>0.5` "held up by" sort, pushing every legitimately-contributing stat out of the top-3. So one bad import value doesn't just print 5000% — it **silently empties the breakdown sentence of real contributors**. Fix is the same `clampStat` (D); but `breakdown`/`inspector` should also defensively `Utils.clamp(r,0,1)` so a stale bad value already in storage can't poison the panel.

#### C-5 — NEW (display): `population` accepts `parseInt` with no validation; `toLocaleString()` on a non-finite throws into the AI context builder — LOW — 12425, 8471.
`rs-pop` save 12425 `const pop=parseInt(get('rs-pop'),10);if(!isNaN(pop))n.population=pop;` accepts negatives and absurd magnitudes. `buildContext` 8471 does `nation.population.toLocaleString()`. If an import sets `population` to a string or a value that survives as a non-number (import path 5130 `population:seed.population||null` passes any truthy type verbatim — a string `"lots"` survives), `"lots".toLocaleString()` returns `"lots"` (harmless) but `NaN.toLocaleString()`→"NaN" and an object would throw in the prompt builder. Low, but `population` is another unvalidated numeric write path. Fix: coerce to a non-negative finite integer or null on both the import and rs-pop paths.

---

### (D) UNIFIED BOUNDARY-VALIDATION MAP + shared helpers

My Finding 5 + L2#2 + L1's import-shape finding are **one class of bug**: *every path that writes `stat.value`, `event.weight`, or `event.year`/`currentYear` must clamp to the declared range — and only some do.* Full map:

#### Write paths for `stat.value`
| Path | Line | Clamps? |
|---|---|---|
| Manual slider → `State.setStat` | 5538 | ✅ `Utils.clamp(val,min,max)` |
| Slider `input` live preview (pre-commit) | 6835 | ❌ `nat.stats[key].value=parseInt(v,10)` raw (transient, but stability/breakdown render off it) |
| AI canon `applyCandidates` → `setStat` | 7056–7057 | ✅ (clamps then routes through setStat) |
| AI tool `_applyProposal` statDelta | 8386 | ✅ value (`p.data.newValue` was clamped at 8341) **but ❌ bypasses checkThresholds** (A-3) |
| `editCustomStat` | 5685 | ✅ `Utils.clamp(s.value,s.min,s.max)` |
| **Import core stats** `buildNationFromSeed` | **5170** | ❌ **raw `seedStats[c.key].value`** (Finding 5 / A-2 / C-1) |
| Import custom stats | 5188 | ✅ `Utils.clamp(stat.value??0,…)` |

#### Write paths for `event.weight`
| Path | Line | Clamps to [-30,30]? |
|---|---|---|
| Manual event form | 13258 | ⚠️ slider `min/max` only; stored `parseInt(...)||0` — **no numeric clamp** (a programmatic/edit value out of ±30 stores raw) |
| AI canon `applyCandidates` event | 7063 | ❌ `weight:c.weight||0` raw |
| AI tool `add_chronicle_entry` | 8312 | ❌ `typeof==='number'?args.weight:0` raw (L2#2 / A-1) |
| Threshold-generated event | 6336 | ✅ uses `t.eventWeight` from a controlled threshold def (bounded by definition) |
| **Import chronicle** map | **5134** | ❌ spreads `{...e}` — raw weight survives |

#### Write paths for `event.year` / `currentYear`
| Path | Line | Clamps to [1,99999] integer? |
|---|---|---|
| Manual event form | 13257 | ✅ `Math.max(1,Math.min(99999,y))` (integer via parseInt) |
| Threshold event | 6336 | ❌ inherits `n.currentYear` (may be fractional/negative) |
| Session-advance | 10312 | ❌ writes fractional `currentYear` (C-3) |
| `rs-year` realm-settings | 12419 | ❌ no lower bound, accepts 0/negative (C-2) |
| **Import chronicle** map | **5134** | ❌ raw year survives |

#### `event.type` enum (Political/Economic/…)
| Path | Clamps to enum? |
|---|---|
| Manual form (select) | ✅ select options |
| AI canon | ❌ `c.evType||'Political'` (any string) |
| AI tool | ❌ `args.type` (any string) (A-1) |
| Import | ❌ raw |

#### Proposed shared helpers (apply at EVERY boundary above)
```js
const CLAMP = {
  statValue(v, stat){            // stat = {min,max,default}
    const n = Number(v);
    return Number.isFinite(n) ? Utils.clamp(n, stat.min, stat.max)
                              : (stat.default ?? stat.min ?? 0);
  },
  eventWeight(w){
    const n = Number(w);
    return Number.isFinite(n) ? Utils.clamp(Math.round(n), -30, 30) : 0;
  },
  year(y, fallback){
    const n = Math.floor(Number(y));
    return Number.isFinite(n) ? Utils.clamp(n, 1, 99999) : fallback;
  },
  eventType(t){
    return EVENT_TYPES.includes(t) ? t : 'Political'; // EVENT_TYPES = the declared enum
  },
};
```
Wire-up (the only edits needed to close the whole class):
1. **Import core stats** 5170 → `value = CLAMP.statValue(seedStats[c.key].value, c)`.
2. **Import chronicle** 5134 → map each event through `weight:CLAMP.eventWeight(e.weight), year:CLAMP.year(e.year, n.currentYear), type:CLAMP.eventType(e.type)`.
3. **AI tool** `_buildProposal` add_chronicle_entry 8312 → `weight:CLAMP.eventWeight(args.weight), type:CLAMP.eventType(args.type)` (reject-and-return-error variant if you want model self-correction — preferred per L2).
4. **AI canon** `applyCandidates` 7063 → same `CLAMP.eventWeight`/`CLAMP.eventType`.
5. **Manual event form** 13258 → `weight:CLAMP.eventWeight(...)`.
6. **`rs-year`** 12419 → `n.currentYear = CLAMP.year(yr, n.currentYear)`.
7. **Session-advance** 10312 → decide year domain; if integer, `n.currentYear = CLAMP.year(Math.round(cy+yearDelta), n.currentYear)`; threshold stamp 6336 → `year: Math.floor(n.currentYear)`.
8. **AI tool statDelta apply** 8386 → route through `State.setStat` (A-3) so value-clamp + thresholds + front-triggers all fire from one chokepoint.
9. Defensive: `breakdown`/`inspector` clamp `r=Utils.clamp(r,0,1)` (C-4) so any already-stored bad value can't poison the panel.

Single principle: **`State.setStat` is the only sanctioned `stat.value` writer; a `CLAMP.event*` pass is the only sanctioned event writer; one `CLAMP.year` is the only sanctioned year writer.** Every boundary (manual, import, AI tool, AI canon, session-advance, settings) funnels through these. That collapses Finding 5, L2#2, L1-import, C-1, C-2, C-3, C-5 and the A-3 threshold gap into one coherent fix.
