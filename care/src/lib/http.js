// Small response helpers shared by every route. Kept as plain functions
// (no framework/router library) per §8's no-framework stance.

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

/** Human-readable error body, matching design §9: `{error:"..."}`, sentence-cased, no jargon. */
export function jsonError(status, message) {
  return json({ error: message }, status);
}

/**
 * Serve the site's 404 page through the Worker. Used both for genuinely
 * unmapped API paths AND for the Owner Desk's "invisible" gate (§7) — a
 * non-owner hitting /desk gets exactly this, indistinguishable from any
 * other not-found URL on the site.
 */
export async function notFound(env) {
  const res = await env.ASSETS.fetch(new Request('https://internal/404.html'));
  const body = await res.text();
  return new Response(body, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

/** Same-origin check for state-changing requests (light CSRF floor for cookie auth). */
export function isSameOrigin(request, url) {
  const origin = request.headers.get('Origin');
  if (!origin) {
    // SameSite=Lax cookies are the browser-side CSRF floor for legacy clients
    // and curl. Browser fetches that provide Origin are checked exactly below.
    return true;
  }
  try {
    return new URL(origin).origin === url.origin;
  } catch {
    return false;
  }
}
