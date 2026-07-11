#!/usr/bin/env node
// Local stand-in for Google's OAuth endpoints, so the server-side
// authorization-code flow (design §3.1) can be exercised end-to-end
// with no live Google Cloud project. It implements the same three
// endpoints Google exposes — the authorization redirect, the token
// exchange, and the JWKS — using a freshly generated RSA keypair each
// run (RS256, matching Google's real ID tokens exactly).
//
// Point .dev.vars's GOOGLE_AUTH_ENDPOINT / GOOGLE_TOKEN_ENDPOINT /
// GOOGLE_JWKS_ENDPOINT / GOOGLE_ISSUER at this server (see
// .dev.vars.example) and the Worker's auth code never has to know it's
// not talking to the real thing.
//
// Test-only control surface (never called by the Worker, only by test
// scripts): POST /_test/set-next-user sets which identity the NEXT
// /o/oauth2/v2/auth redirect will "log in" as; it reverts to a default
// identity after one use so sequential test runs stay deterministic.
//
// Usage: node scripts/mock-google.mjs [port]

import http from 'node:http';
import { webcrypto as crypto } from 'node:crypto';

const PORT = Number(process.argv[2]) || 8790;
const ISSUER = `http://127.0.0.1:${PORT}`;
// A fresh kid each startup, like real Google (whose keys rotate with new kids).
// This also means a restarted mock's tokens carry a kid the Worker hasn't
// cached, exercising the callback's refetch-on-unknown-kid path.
const KID = 'mock-key-' + Date.now();

// A self-contained data-URI avatar so the avatar-render path is exercised in
// local testing without a network request to a fake host (real Google returns
// a real https avatar; this stands in without ever erroring in the browser).
const DEFAULT_AVATAR =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%23f4a94f"/%3E%3Ctext x="16" y="21" font-size="15" text-anchor="middle" fill="%23241505" font-family="sans-serif"%3EG%3C/text%3E%3C/svg%3E';

const DEFAULT_USER = {
  sub: 'mock-gm-sub-001',
  name: 'Test GM',
  email: 'testgm@example.com',
  picture: DEFAULT_AVATAR,
};

let nextUser = null; // one-shot override
const pendingCodes = new Map(); // code -> { user, expiresAt }
const CODE_TTL_MS = 2 * 60 * 1000;

const { publicKey, privateKey } = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true,
  ['sign', 'verify']
);
const publicJwk = await crypto.subtle.exportKey('jwk', publicKey);

function b64url(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomHex(n) {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(n))).toString('hex');
}

async function mintIdToken(user, aud) {
  const header = { alg: 'RS256', typ: 'JWT', kid: KID };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: ISSUER,
    aud,
    sub: user.sub,
    email: user.email,
    email_verified: true,
    name: user.name,
    picture: user.picture || null,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, new TextEncoder().encode(signingInput));
  return `${signingInput}.${b64url(sig)}`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  const buf = Buffer.from(JSON.stringify(body));
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': buf.length });
  res.end(buf);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, ISSUER);

  if (req.method === 'GET' && url.pathname === '/o/oauth2/v2/auth') {
    const redirectUri = url.searchParams.get('redirect_uri');
    const state = url.searchParams.get('state');
    if (!redirectUri || !state) return sendJson(res, 400, { error: 'missing redirect_uri or state' });

    const user = nextUser || DEFAULT_USER;
    nextUser = null; // consume the one-shot override
    const code = randomHex(16);
    pendingCodes.set(code, { user, expiresAt: Date.now() + CODE_TTL_MS });

    const dest = new URL(redirectUri);
    dest.searchParams.set('code', code);
    dest.searchParams.set('state', state);
    res.writeHead(302, { Location: dest.toString() });
    return res.end();
  }

  if (req.method === 'POST' && url.pathname === '/token') {
    const raw = await readBody(req);
    const params = new URLSearchParams(raw);
    const code = params.get('code');
    const entry = pendingCodes.get(code);
    if (!entry || entry.expiresAt < Date.now()) {
      return sendJson(res, 400, { error: 'invalid_grant' });
    }
    pendingCodes.delete(code); // single-use, like a real auth code
    const aud = params.get('client_id') || 'mock-client-id';
    const idToken = await mintIdToken(entry.user, aud);
    return sendJson(res, 200, {
      id_token: idToken,
      access_token: `mock-access-${randomHex(8)}`,
      token_type: 'Bearer',
      expires_in: 3600,
    });
  }

  if (req.method === 'GET' && url.pathname === '/certs') {
    return sendJson(res, 200, { keys: [{ ...publicJwk, alg: 'RS256', use: 'sig', kid: KID }] });
  }

  if (req.method === 'POST' && url.pathname === '/_test/set-next-user') {
    const raw = await readBody(req);
    try {
      const body = JSON.parse(raw || '{}');
      nextUser = {
        sub: body.sub || DEFAULT_USER.sub,
        name: body.name || DEFAULT_USER.name,
        email: body.email || DEFAULT_USER.email,
        // Respect an explicitly-provided picture (including null for "no
        // avatar"); only fall back to the default when the field is absent.
        picture: 'picture' in body ? body.picture : DEFAULT_USER.picture,
      };
      return sendJson(res, 200, { ok: true, willLoginAs: nextUser });
    } catch {
      return sendJson(res, 400, { error: 'bad JSON body' });
    }
  }

  if (req.method === 'GET' && url.pathname === '/_test/health') {
    return sendJson(res, 200, { ok: true, issuer: ISSUER });
  }

  // Browsers auto-request /favicon.ico when they briefly land on this origin
  // during the OAuth redirect; answer 204 so it doesn't surface as a console
  // error during Playwright runs. Not part of the real Google surface.
  if (req.method === 'GET' && url.pathname === '/favicon.ico') {
    res.writeHead(204);
    return res.end();
  }

  sendJson(res, 404, { error: 'no such mock-google route', path: url.pathname });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`mock-google listening on ${ISSUER}`);
  console.log(`  auth:  GET  ${ISSUER}/o/oauth2/v2/auth`);
  console.log(`  token: POST ${ISSUER}/token`);
  console.log(`  jwks:  GET  ${ISSUER}/certs`);
  console.log(`  test:  POST ${ISSUER}/_test/set-next-user  {sub,name,email,picture}`);
});
