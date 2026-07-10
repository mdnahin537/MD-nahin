import { routeAuth } from './routes/auth.js';
import { json, jsonError, notFound, isSameOrigin } from './lib/http.js';
import { handlePostReport, handlePatchFollowup, handleGetFollowupQuestion } from './routes/report.js';
import { handlePutVote } from './routes/vote.js';
import { handlePostComment } from './routes/comment.js';
import { handleGetRelated } from './routes/related.js';
import { handleGetMe } from './routes/me.js';
import { handleGetFeed } from './routes/feed.js';
import { handleGetItem } from './routes/item.js';
import { routeDeskApi, serveDeskShell } from './routes/desk.js';

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
        // Owner-gated shell (HTML/JS/CSS). A non-owner gets the public 404 —
        // the whole /desk tree is invisible, not merely locked (§7).
        return await serveDeskShell(request, env, url);
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
  const followupQMatch = pathname.match(/^\/api\/report\/(\d+)\/followup-question$/);
  if (method === 'GET' && followupQMatch) {
    return handleGetFollowupQuestion(request, env, url, Number(followupQMatch[1]));
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
    return handleGetFeed(request, env, ctx, url);
  }
  const itemMatch = pathname.match(/^\/api\/item\/(\d+)$/);
  if (method === 'GET' && itemMatch) {
    return handleGetItem(request, env, url, Number(itemMatch[1]));
  }
  if (pathname.startsWith('/api/desk/')) {
    // Owner-gated inside routeDeskApi; a non-owner gets the public 404,
    // indistinguishable from any other not-found path.
    return routeDeskApi(request, env, url);
  }

  return jsonError(404, 'Not found.');
}
