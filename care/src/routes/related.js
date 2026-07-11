import { json, jsonError } from '../lib/http.js';

/**
 * GET /api/related?type=&area=&part=  — the B5/I3 "GMs already reported
 * these" prior-art step. Public (no auth needed to look before signing in
 * — though the wizard itself gates at B0). Matches design §5.2 B5's "top
 * 5 open items matching (type, area[, part])"; interpreted as any
 * still-live status (open/planned/in_progress) rather than the literal
 * enum value 'open' — a bug already being worked on is exactly the kind
 * of thing a GM should still be able to say "this is mine" on.
 */
export async function handleGetRelated(request, env, url) {
  const type = url.searchParams.get('type');
  const area = url.searchParams.get('area');
  const part = url.searchParams.get('part');

  if (!['bug', 'idea'].includes(type) || !area) {
    return jsonError(400, 'type and area are required.');
  }

  let query = `SELECT id, title, status, reports_count, agree_count, disagree_count, net
               FROM items
               WHERE held = 0 AND merged_into IS NULL AND status IN ('open','planned','in_progress')
                 AND type = ?1 AND area = ?2`;
  const params = [type, area];
  if (part) {
    query += ' AND part = ?3';
    params.push(part);
  }
  query += ' ORDER BY reports_count DESC, net DESC, id ASC LIMIT 5';

  const { results } = await env.DB.prepare(query).bind(...params).all();

  return json({
    items: results.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      reportsCount: r.reports_count,
      net: r.net,
    })),
  });
}
