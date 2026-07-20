import {
  handleBootstrap,
  handleIssueRecovery,
  handleRecover,
  handleOwnerClaim,
  ownerSetupPage,
  handleLogout,
} from '../lib/auth.js';

/** Routes everything under /auth/*. No external identity provider is used. */
export async function routeAuth(request, env, url) {
  if (request.method === 'POST' && url.pathname === '/auth/bootstrap') {
    return handleBootstrap(request, env);
  }
  if (request.method === 'POST' && url.pathname === '/auth/recovery') {
    return handleIssueRecovery(request, env);
  }
  if (request.method === 'POST' && url.pathname === '/auth/recover') {
    return handleRecover(request, env);
  }
  if (request.method === 'GET' && url.pathname === '/auth/owner') {
    return ownerSetupPage();
  }
  if (request.method === 'POST' && url.pathname === '/auth/owner/claim') {
    return handleOwnerClaim(request, env);
  }
  if (request.method === 'GET' && url.pathname === '/auth/logout') {
    return handleLogout(request, env, url);
  }
  return new Response('Not found', { status: 404 });
}
