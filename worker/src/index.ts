// RealmWright license/demo Worker entrypoint.
//
// Routes:
//   POST /api/license/activate         -> license.handleActivate
//   POST /api/license/validate         -> license.handleValidate
//   POST /api/license/deactivate       -> license.handleDeactivate
//   POST /api/license/cleanup-orphans  -> license.handleCleanupOrphans (cron + manual)
//   POST /verify                       -> itch.handleItchVerify (stub — see file)
//   POST /api/demo/generate            -> demo.handleDemoGenerate (stub — see file)
//
// Cron: fortnightly invokes reapOrphans().

import { preflight, jsonResponse } from './cors';
import {
  handleActivate,
  handleCleanupOrphans,
  handleDeactivate,
  handleValidate,
  LicenseEnv,
  reapOrphans,
} from './license';
import { handleItchVerify } from './itch';
import { handleDemoGenerate } from './demo';

interface Env extends LicenseEnv {
  // Optional shared secret for the manual cleanup-orphans endpoint.
  CLEANUP_TOKEN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return preflight(request, env.ALLOWED_ORIGINS);
    }

    const url = new URL(request.url);

    // Only POST is meaningful on these routes; GET returns a small banner so
    // health checks don't 404.
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response('rw-license worker ok\n', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed.' }, 405, request, env.ALLOWED_ORIGINS);
    }

    switch (url.pathname) {
      case '/api/license/activate':
        return handleActivate(request, env);
      case '/api/license/validate':
        return handleValidate(request, env);
      case '/api/license/deactivate':
        return handleDeactivate(request, env);
      case '/api/license/cleanup-orphans':
        return handleCleanupOrphans(request, env);
      case '/verify':
        return handleItchVerify(request, env);
      case '/api/demo/generate':
        return handleDemoGenerate(request, env);
      default:
        return jsonResponse({ error: 'Not found.' }, 404, request, env.ALLOWED_ORIGINS);
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Fortnightly orphan reaper. Wrap in waitUntil so logs flush before exit.
    ctx.waitUntil(
      (async () => {
        try {
          const r = await reapOrphans(env);
          console.log(`[cron] reapOrphans scanned=${r.scanned} reaped=${r.reaped}`);
        } catch (e: any) {
          console.error('[cron] reapOrphans failed:', e?.message || e);
        }
      })(),
    );
  },
};
