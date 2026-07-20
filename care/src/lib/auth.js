// Google OAuth 2.0 server-side authorization-code flow (design §3.1).
// Deliberately NOT the "Sign in with Google" JS SDK — the redirect code
// flow has one moving part (a registered redirect URI) instead of GIS's
// FedCM migration churn and "authorized JavaScript origins" fussiness.
//
// Every Google endpoint URL is read from env (wrangler.toml [vars] defaults
// them to the real Google endpoints) so the exact same code path can be
// pointed at scripts/mock-google.mjs for local verification — no branching
// "if test mode" logic anywhere in here.

import { signHS256, verifyHS256, verifyRS256WithJwks, decodeJwtUnsafe } from './jwt.js';
import { parseCookies, serializeCookie, clearCookie } from './cookies.js';

const OAUTH_STATE_COOKIE = 'rw_oauth_state';
const OAUTH_STATE_TTL_SECONDS = 600; // 10 minutes — just long enough for a real login
const SESSION_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days (locked shape #7 / §3.1)

// Per-isolate JWKS cache. Isolates are short-lived but often handle many
// requests — this just avoids re-fetching Google's public keys on every
// single callback within that window. Correctness never depends on this
// cache hitting; a miss just re-fetches.
let jwksCache = { url: null, body: null, fetchedAt: 0 };
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchJwks(jwksUrl, { force = false } = {}) {
  const now = Date.now();
  if (!force && jwksCache.url === jwksUrl && now - jwksCache.fetchedAt < JWKS_CACHE_TTL_MS) {
    return jwksCache.body;
  }
  const res = await fetch(jwksUrl);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  const body = await res.json();
  jwksCache = { url: jwksUrl, body, fetchedAt: now };
  return body;
}

// Google rotates its signing keys periodically; a token can legitimately be
// signed with a key that isn't in our cached JWKS yet. If the token's kid
// isn't present, force ONE refetch before giving up — otherwise valid logins
// would fail for up to the cache TTL after every Google key rotation.
async function jwksHasKid(jwks, kid) {
  return !!(jwks && jwks.keys && jwks.keys.some((k) => k.kid === kid));
}

function isSecureEnv(env) {
  return env.ENVIRONMENT !== 'development';
}

function sessionCookieName(env) {
  return env.SESSION_COOKIE_NAME || 'rw_care_session';
}

/** Only allow same-origin relative paths as an OAuth `return` target — kills open-redirect. */
function sanitizeReturnPath(raw) {
  // Backslashes are rejected as well as absolute/scheme URLs. Browsers can
  // normalize a value such as "/\\evil.example" into a network-path URL,
  // turning an apparently relative return into an open redirect.
  if (
    typeof raw !== 'string' ||
    !raw.startsWith('/') ||
    raw.startsWith('//') ||
    raw.includes('://') ||
    raw.includes('\\')
  ) {
    return '/';
  }
  return raw;
}

function randomNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** GET /auth/login?return=/report — kicks off the redirect to Google (or its mock). */
export async function handleLogin(request, env, url) {
  const returnPath = sanitizeReturnPath(url.searchParams.get('return') || '/');
  const nonce = randomNonce();

  const stateJwt = await signHS256(
    { typ: 'oauth_state', nonce, return: returnPath },
    env.SESSION_SECRET,
    { expiresInSeconds: OAUTH_STATE_TTL_SECONDS }
  );

  const redirectUri = `${url.origin}/auth/callback`;
  const authUrl = new URL(env.GOOGLE_AUTH_ENDPOINT);
  authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', nonce);
  authUrl.searchParams.set('prompt', 'select_account');

  const headers = new Headers({ Location: authUrl.toString() });
  headers.append(
    'Set-Cookie',
    serializeCookie(OAUTH_STATE_COOKIE, stateJwt, {
      maxAgeSeconds: OAUTH_STATE_TTL_SECONDS,
      path: '/auth',
      secure: isSecureEnv(env),
      sameSite: 'Lax',
    })
  );
  return new Response(null, { status: 302, headers });
}

/** GET /auth/callback?code=&state= — exchanges the code, verifies the ID token, opens a session. */
export async function handleCallback(request, env, url) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = parseCookies(request);
  const stateCookieRaw = cookies[OAUTH_STATE_COOKIE];

  if (!code || !state || !stateCookieRaw) {
    return authErrorResponse('Missing code or state — please try signing in again.');
  }

  const statePayload = await verifyHS256(stateCookieRaw, env.SESSION_SECRET);
  if (!statePayload || statePayload.typ !== 'oauth_state' || statePayload.nonce !== state) {
    return authErrorResponse('Your sign-in link expired or was tampered with — please try again.');
  }

  const redirectUri = `${url.origin}/auth/callback`;
  const tokenRes = await fetch(env.GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return authErrorResponse('Google sign-in did not complete — please try again.');
  }
  const tokenBody = await tokenRes.json();
  const idToken = tokenBody.id_token;
  if (!idToken) return authErrorResponse('Google did not return an identity token.');

  // Verify the ID token's signature against Google's JWKS. If the token's kid
  // isn't in our cached key set (Google rotated keys since we last fetched),
  // force one refresh before trusting or rejecting it.
  const decoded = decodeJwtUnsafe(idToken);
  let jwks = await fetchJwks(env.GOOGLE_JWKS_ENDPOINT);
  if (decoded && !(await jwksHasKid(jwks, decoded.header.kid))) {
    jwks = await fetchJwks(env.GOOGLE_JWKS_ENDPOINT, { force: true });
  }
  const claims = await verifyRS256WithJwks(idToken, jwks);
  if (!claims) return authErrorResponse('Could not verify your Google identity.');
  if (claims.iss !== env.GOOGLE_ISSUER) return authErrorResponse('Unexpected identity issuer.');
  if (claims.aud !== env.GOOGLE_CLIENT_ID) return authErrorResponse('Unexpected identity audience.');

  const sub = claims.sub;
  const name = claims.name || 'A GM';
  const avatarUrl = claims.picture || null;
  const email = claims.email || null;
  const now = Math.floor(Date.now() / 1000);

  await env.DB.prepare(
    `INSERT INTO users (sub, name, avatar_url, email, created_at, last_seen)
     VALUES (?1, ?2, ?3, ?4, ?5, ?5)
     ON CONFLICT(sub) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url,
       email=excluded.email, last_seen=excluded.last_seen`
  )
    .bind(sub, name, avatarUrl, email, now)
    .run();

  const sessionJwt = await signHS256(
    { typ: 'session', sub, name, avatar: avatarUrl },
    env.SESSION_SECRET,
    { expiresInSeconds: SESSION_TTL_SECONDS }
  );

  const headers = new Headers({ Location: statePayload.return || '/' });
  headers.append(
    'Set-Cookie',
    serializeCookie(sessionCookieName(env), sessionJwt, {
      maxAgeSeconds: SESSION_TTL_SECONDS,
      path: '/',
      secure: isSecureEnv(env),
      sameSite: 'Lax',
    })
  );
  headers.append('Set-Cookie', clearCookie(OAUTH_STATE_COOKIE, { path: '/auth', secure: isSecureEnv(env) }));
  return new Response(null, { status: 302, headers });
}

/** GET /auth/logout — clears the session cookie and returns home. */
export function handleLogout(request, env, url) {
  const returnPath = sanitizeReturnPath(url.searchParams.get('return') || '/');
  const headers = new Headers({ Location: returnPath });
  headers.append('Set-Cookie', clearCookie(sessionCookieName(env), { secure: isSecureEnv(env) }));
  return new Response(null, { status: 302, headers });
}

function authErrorResponse(message) {
  // A plain, human page — this is a rare path (network hiccup, expired
  // link, tampering) and it's still a normal person clicking "Sign in".
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Sign-in problem</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1.5rem;color:#1a1a1a">
  <h1 style="font-size:1.25rem">Sign-in didn't go through</h1>
  <p>${escapeHtml(message)}</p>
  <p><a href="/">Back to the board</a></p>
  </body></html>`;
  return new Response(html, { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * Read + verify the session cookie. Returns `{ sub, name, avatar }` or
 * `null`. This is the ONE function every authenticated route calls —
 * there is no separate "middleware" object, just this plus a per-route
 * `if (!session) return 401` check (kept explicit and readable rather
 * than hidden in a framework layer, matching §8's no-framework stance).
 */
export async function getSession(request, env) {
  const cookies = parseCookies(request);
  const raw = cookies[sessionCookieName(env)];
  if (!raw) return null;
  const payload = await verifyHS256(raw, env.SESSION_SECRET);
  if (!payload || payload.typ !== 'session' || !payload.sub) return null;
  return { sub: payload.sub, name: payload.name, avatar: payload.avatar };
}

export function isSecureCookieEnv(env) {
  return isSecureEnv(env);
}
