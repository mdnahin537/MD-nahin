import { routeAuth } from './routes/auth.js';
import { json, jsonError, notFound, isSameOrigin } from './lib/http.js';
import { handlePostReport, handlePatchFollowup } from './routes/report.js';
import { handlePutVote } from './routes/vote.js';
import { handlePostComment } from './routes/comment.js';
import { handleGetRelated } from './routes/related.js';
import { handleGetMe } from './routes/me.js';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Only /api/*, /auth/*, and /desk(/*) ever reach this Worker — every other
// path is served directly by Cloudflare's static-asset layer per
// wrangler.toml's `run_worker_first` list, which is what keeps the public
// board free & unlimited at any traffic level (design §2.2).
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith('/auth/')) {
        return await routeAuth(request, env, url);
      }

      if (url.pathname.startsWith('/api/')) {
        if (WRITE_METHODS.has(request.method) && !isSameOrigin(request, url)) {
          return jsonError(403, 'Cross-site request blocked.');
        }
        return await routeApi(request, env, ctx, url);
      }

      if (url.pathname === '/desk' || url.pathname.startsWith('/desk/')) {
        // Phase 4 fills this in: server-side OWNER_SUB gate + desk shell.
        return notFound(env);
      }

      // Anything else that somehow reached the Worker — hand it to the
      // asset layer rather than erroring; this keeps the Worker's own
      // fallback behavior identical to what a direct static request would do.
      return env.ASSETS.fetch(request);
    } catch (err) {
      return jsonError(500, "Something broke on our end — try again in a moment.");
    }
  },
};

/** Plain if/else path dispatch for /api/* — no router library, per §8's no-framework stance. */
async function routeApi(request, env, ctx, url) {
  const { pathname } = url;
  const method = request.method;

  if (method === 'GET' && pathname === '/api/health') {
    return json({ ok: true, service: 'realmwright-care', time: new Date().toISOString() });
  }
  if (method === 'GET' && pathname === '/api/me') {
    return handleGetMe(request, env, url);
  }
  if (method === 'POST' && pathname === '/api/report') {
    return handlePostReport(request, env, url);
  }
  const followupMatch = pathname.match(/^\/api\/report\/(\d+)\/followup$/);
  if (method === 'PATCH' && followupMatch) {
    return handlePatchFollowup(request, env, url, Number(followupMatch[1]));
  }
  const voteMatch = pathname.match(/^\/api\/vote\/(\d+)$/);
  if (method === 'PUT' && voteMatch) {
    return handlePutVote(request, env, url, Number(voteMatch[1]));
  }
  if (method === 'POST' && pathname === '/api/comment') {
    return handlePostComment(request, env, url);
  }
  if (method === 'GET' && pathname === '/api/related') {
    return handleGetRelated(request, env, url);
  }
  if (method === 'GET' && pathname === '/api/feed') {
    // Phase 1 (in progress): §6.3 module + shipped strip + woven feed + guardrail.
    return jsonError(501, 'Not built yet.');
  }
  const itemMatch = pathname.match(/^\/api\/item\/(\d+)$/);
  if (method === 'GET' && itemMatch) {
    // Phase 1/2: item detail + roll-up.
    return jsonError(501, 'Not built yet.');
  }
  if (pathname.startsWith('/api/desk/')) {
    // Owner-only — Phase 4 wires the real OWNER_SUB gate. Until then, and for
    // any non-owner always, this must look exactly like a normal 404 JSON,
    // never reveal that the path exists.
    return jsonError(404, 'Not found.');
  }

  return jsonError(404, 'Not found.');
}
