// Server-side view of the SAME taxonomy JSON the wizard/board/desk load
// client-side (design §5.4: "one shared JSON file... one source of
// truth"). Fetched through the ASSETS binding rather than duplicated as a
// second file, so there is truly only one copy to keep in sync.

let cache = null;

export async function loadTaxonomy(env) {
  if (cache) return cache;
  const res = await env.ASSETS.fetch(new Request('https://internal/data/taxonomy.json'));
  cache = await res.json();
  return cache;
}

/** Flat area-key -> area-object map, includes the idea-only "new" tile. */
export async function areaMap(env) {
  const tax = await loadTaxonomy(env);
  const map = new Map(tax.areas.map((a) => [a.key, a]));
  map.set(tax.ideaExtraTile.key, { ...tax.ideaExtraTile, parts: [] });
  return map;
}

/** True if `area` is a real taxonomy key (including "new" for ideas). */
export async function isValidArea(env, area) {
  const map = await areaMap(env);
  return map.has(area);
}

/**
 * True if `part` is valid for `area` — either a direct part key, or a
 * `children` leaf key one level down (design §5.4's "AI Copilot →
 * a specific generator → second chip row" case). `part` may be null/empty
 * (every area chip list ends in "not sure").
 */
export async function isValidPart(env, area, part) {
  if (!part) return true;
  const map = await areaMap(env);
  const areaObj = map.get(area);
  if (!areaObj) return false;
  for (const p of areaObj.parts || []) {
    if (p.key === part) return true;
    if (p.children && p.children.some((c) => c.key === part)) return true;
  }
  return false;
}

/**
 * The taxonomy's symptom list for `area`: universal symptoms every area
 * shares, plus any area-specific ones (design §5.4's symptomsUniversal /
 * symptomsByArea split).
 */
async function symptomsFor(env, area) {
  const tax = await loadTaxonomy(env);
  const areaSpecific = (tax.symptomsByArea && tax.symptomsByArea[area]) || [];
  return [...tax.symptomsUniversal, ...areaSpecific];
}

/**
 * True if `symptom` is a taxonomy key for `area` (universal or
 * area-specific), or null/empty (report.js only asks for it on bug
 * reports). Rejects anything not a plain string — including the objects a
 * hostile client could otherwise slip in and have tallied verbatim on the
 * Owner Desk ("[object Object]" pollution — the exact bug this closes).
 */
export async function isValidSymptom(env, area, symptom) {
  if (symptom == null || symptom === '') return true;
  if (typeof symptom !== 'string') return false;
  const symptoms = await symptomsFor(env, area);
  return symptoms.some((s) => s.key === symptom);
}

/**
 * True if `detail` is a valid follow-up key for `symptom` under `area`
 * (design §5.2 B3's inline "When?" follow-up — currently only
 * work_disappeared has any), or null/empty (every other symptom has none).
 */
export async function isValidSymptomDetail(env, area, symptom, detail) {
  if (detail == null || detail === '') return true;
  if (typeof detail !== 'string') return false;
  const symptoms = await symptomsFor(env, area);
  const s = symptoms.find((x) => x.key === symptom);
  const followups = (s && s.followups) || [];
  return followups.some((f) => f.key === detail);
}

/** True if `frequency` is one of the taxonomy's frequency keys, or null/empty. */
export async function isValidFrequency(env, frequency) {
  if (frequency == null || frequency === '') return true;
  if (typeof frequency !== 'string') return false;
  const tax = await loadTaxonomy(env);
  return tax.frequency.some((f) => f.key === frequency);
}

/** True if `ideaKind` is one of the taxonomy's idea-kind keys, or null/empty. */
export async function isValidIdeaKind(env, ideaKind) {
  if (ideaKind == null || ideaKind === '') return true;
  if (typeof ideaKind !== 'string') return false;
  const tax = await loadTaxonomy(env);
  return tax.ideaKinds.some((k) => k.key === ideaKind);
}

/** True if `importance` is one of the taxonomy's importance keys, or null/empty. */
export async function isValidImportance(env, importance) {
  if (importance == null || importance === '') return true;
  if (typeof importance !== 'string') return false;
  const tax = await loadTaxonomy(env);
  return tax.importance.some((i) => i.key === importance);
}
