import { handleLogin, handleCallback, handleLogout } from '../lib/auth.js';

/** Routes everything under /auth/*. */
export async function routeAuth(request, env, url) {
  if (url.pathname === '/auth/login') return handleLogin(request, env, url);
  if (url.pathname === '/auth/callback') return handleCallback(request, env, url);
  if (url.pathname === '/auth/logout') return handleLogout(request, env, url);
  return new Response('Not found', { status: 404 });
}
