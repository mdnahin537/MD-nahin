// RealmWright license/demo Worker entrypoint.
//
// Routes:
//   POST /api/license/activate    -> license.handleActivate   (LS proxy + paywall)
//   POST /api/license/validate    -> license.handleValidate   (LS proxy + paywall)
//   POST /api/license/deactivate  -> license.handleDeactivate  (LS proxy)
//   POST /verify                  -> itch.handleItchVerify     (itch download-key check)
//   POST /api/demo/generate       -> demo.handleDemoGenerate   (Turnstile + OpenRouter + caps)
//
// Device capping is Lemon Squeezy's native activation_limit. No cron, no KV
// device buckets, no orphan reaper.

import { preflight, jsonResponse } from './cors';
import { handleActivate, handleDeactivate, handleValidate, LicenseEnv } from './license';
import { handleItchVerify, ItchEnv } from './itch';
import { handleDemoGenerate, DemoEnv } from './demo';

interface Env extends LicenseEnv, ItchEnv, DemoEnv {}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return preflight(request, env.ALLOWED_ORIGINS);
    }

    const url = new URL(request.url);

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
      case '/verify':
        return handleItchVerify(request, env);
      case '/api/demo/generate':
        return handleDemoGenerate(request, env);
      default:
        return jsonResponse({ error: 'Not found.' }, 404, request, env.ALLOWED_ORIGINS);
    }
  },
};
