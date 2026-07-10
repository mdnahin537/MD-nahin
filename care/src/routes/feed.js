import { json } from '../lib/http.js';
import { assembleFeed, applyGuardrail, guardrail, tagFor } from '../lib/feed.js';

const PAGE_SIZE = 24;
const VEL_WINDOW_DAYS = 7;
const CACHE_TTL_SECONDS = 60;

const VALID_STATUS_FILTER = new Set(['open', 'planned', 'in_progress', 'shipped', 'declined']);
const VALID_TYPE_FILTER = new Set(['bug', 'idea']);

/**
 * GET /api/feed — the public board feed (design §6.3). Edge-cached 60s with
 * stale-while-revalidate so a burst of curious readers costs ~1 feed compute
 * per minute, not one per reader (design §2.2 lever #2). The cache key
 * includes every query param so filtered/searched/paged variants cache
 * independently.
 *
 * Query params (all optional): area, type, status, q (title search),
 * page (0-based), sort ('woven' default | 'newest').
 */
export async function handleGetFeed(request, env, ctx, url) {
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const response = await computeFeed(env, url);

  // Only cache successful responses; clone before returning (body is single-use).
  if (response.status === 200) {
    const toCache = response.clone();
    ctx.waitUntil(cache.put(cacheKey, toCache));
  }
  return response;
}

async function computeFeed(env, url) {
  const now = Math.floor(Date.now() / 1000);
  const params = url.searchParams;
  const area = params.get('area');
  const type = params.get('type');
  const statusFilter = params.get('status'); // explicit status view (incl. 'declined')
  const q = (params.get('q') || '').trim();
  const page = Math.max(0, parseInt(params.get('page') || '0', 10) || 0);
  const sort = params.get('sort') === 'newest' ? 'newest' : 'woven';

  // Base visibility (design §6.3): held=0, not merged, status != declined.
  // A status filter of 'declined' is the ONE way declined items surface —
  // public but never promoted (design §6.3 top note).
  const where = ['held = 0', 'merged_into IS NULL'];
  const binds = [];
  if (statusFilter && VALID_STATUS_FILTER.has(statusFilter)) {
    where.push(`status = ?${binds.length + 1}`);
    binds.push(statusFilter);
  } else {
    where.push("status != 'declined'");
  }
  if (area) {
    where.push(`area = ?${binds.length + 1}`);
    binds.push(area);
  }
  if (type && VALID_TYPE_FILTER.has(type)) {
    where.push(`type = ?${binds.length + 1}`);
    binds.push(type);
  }
  if (q) {
    where.push(`title LIKE ?${binds.length + 1}`);
    binds.push(`%${q.replace(/[%_]/g, (m) => '\\' + m)}%`);
  }

  // Two-phase fetch so the feed stays fast at 10,000 items (design §6.4
  // "stays fast at 10,000"). Phase A pulls only the LIGHTWEIGHT ranking
  // columns (all numeric/short) for every visible item — the ranking needs
  // nothing else, and marshalling 8 small columns across the D1 boundary is
  // far cheaper than 16 columns including every title. Phase B pulls the
  // heavy DISPLAY columns only for the ~39 items actually shown (module +
  // shipped strip + current page). This keeps both the D1 transfer and the
  // response-build proportional to what's on screen, not to the whole board.
  const rankQuery = `SELECT id, status, created_at, pinned, net, total, reports_count, owner_note_at
    FROM items WHERE ${where.join(' AND ')}`;
  const windowStart = now - VEL_WINDOW_DAYS * 86400;

  // The ranking query and the velocity aggregate are independent, so fire
  // them together — the feed then waits for max(rankSQL, velSQL), not their
  // sum. Velocity = agrees-disagrees in the last 7 days (design §6.1); items
  // with no recent votes default to vel 0.
  const [rankResult, velResult] = await Promise.all([
    env.DB.prepare(rankQuery).bind(...binds).all(),
    env.DB.prepare(
      `SELECT item_id, SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) - SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) AS vel
       FROM votes WHERE created_at >= ?1 GROUP BY item_id`
    ).bind(windowStart).all(),
  ]);
  const rankRows = rankResult.results;
  const velByItem = new Map();
  for (const row of velResult.results) velByItem.set(row.item_id, row.vel);

  const { module, moduleShown, shipped, feed } = assembleFeed(rankRows, velByItem, now);

  // "Newest" power-user toggle (design §6.4): flat newest-first list, but the
  // net<0 guardrail STILL applies — even a newest sort never puts a rejected
  // item above accepted ones.
  let mainList = feed;
  if (sort === 'newest') {
    mainList = applyGuardrail([...feed].sort((a, b) => b.created_at - a.created_at || b.id - a.id));
  }

  const totalCount = mainList.length;
  const pageStart = page * PAGE_SIZE;
  // Pass #2 of the guardrail (assert-only): the page is sliced from an
  // already-guarded list, so this must find zero violations — if it ever
  // doesn't, it warns rather than silently masking the upstream bug.
  const { items: pageItems } = guardrail(mainList.slice(pageStart, pageStart + PAGE_SIZE), { assertOnly: true });

  const moduleIdSet = new Set(module.map((it) => it.id));
  const shownModule = moduleShown ? module : [];

  // Phase B: fetch display columns only for the items we will actually render.
  const shownIds = [...new Set([...shownModule.map((it) => it.id), ...shipped.map((it) => it.id), ...pageItems.map((it) => it.id)])];
  const displayById = await fetchDisplayRows(env, shownIds);

  const card = (rankItem, inModule) => publicCard(rankItem, displayById.get(rankItem.id), inModule);

  const body = {
    module: shownModule.map((it) => card(it, true)),
    moduleShown,
    shipped: shipped.map((it) => card(it, moduleIdSet.has(it.id))),
    items: pageItems.map((it) => card(it, moduleIdSet.has(it.id))),
    page,
    pageSize: PAGE_SIZE,
    totalCount,
    hasMore: pageStart + PAGE_SIZE < totalCount,
    sort,
  };

  return json(body, 200, {
    'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}, stale-while-revalidate=120`,
  });
}

/** Fetch heavy display columns for a bounded id list. Returns id -> row map. */
async function fetchDisplayRows(env, ids) {
  const map = new Map();
  if (ids.length === 0) return map;
  const placeholders = ids.map((_, i) => `?${i + 1}`).join(',');
  const { results } = await env.DB.prepare(
    `SELECT id, type, area, part, title, agree_count, disagree_count, comments_count, owner_note
     FROM items WHERE id IN (${placeholders})`
  ).bind(...ids).all();
  for (const row of results) map.set(row.id, row);
  return map;
}

/**
 * Public projection — merges the lightweight ranking row (net/tag inputs)
 * with the heavy display row. Coarse context only; never the raw report
 * payload, never email.
 */
function publicCard(rankItem, display, inModule) {
  const d = display || {};
  return {
    id: rankItem.id,
    type: d.type ?? null,
    area: d.area ?? null,
    part: d.part ?? null,
    title: d.title ?? '',
    status: rankItem.status,
    net: rankItem.net,
    agreeCount: d.agree_count ?? null,
    disagreeCount: d.disagree_count ?? null,
    reportsCount: rankItem.reports_count,
    commentsCount: d.comments_count ?? null,
    createdAt: rankItem.created_at,
    ownerNote: d.owner_note || null,
    tag: tagFor(rankItem, inModule),
  };
}
