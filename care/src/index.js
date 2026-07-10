import { routeAuth } from './routes/auth.js';
import { json, jsonError, notFound } from './lib/http.js';

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

      if (url.pathname === '/api/health') {
        return json({ ok: true, service: 'realmwright-care', time: new Date().toISOString() });
      }

      if (url.pathname.startsWith('/api/')) {
        // Phase 1 fills this in: report/vote/comment/feed/item/related/me.
        return jsonError(501, 'Not built yet.');
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
