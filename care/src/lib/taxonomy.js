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
