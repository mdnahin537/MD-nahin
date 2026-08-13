// itch.io download-key verification and device lifecycle.
//
// The seller API key is a Cloudflare Worker secret. It is never sent to the
// browser. Buyers submit their own itch.io download key; the Worker verifies
// it against the current itch.io server-side API, then issues an opaque device
// token with the same three-device cap used by the Lemon Squeezy path.
//
// Routes:
//   POST /verify                { key } -> initial activation
//   POST /api/itch/validate     { key } -> revalidate ownership + active device
//   POST /api/itch/deactivate   { key } -> release this device token

import { jsonResponse } from './cors';
import { checkRateLimit } from './ratelimit';
import type { RateLimitEnv } from './ratelimit';
import {
  deviceCookie,
  deviceTtlSeconds,
  findExistingDevice,
  issueOrRefresh,
  readToken,
  revoke,
} from './fingerprint';
import type { DeviceEnv } from './fingerprint';
import {
  BodyTooLargeError,
  MAX_PRODUCT_KEY_BYTES,
  isWithinUtf8Limit,
  readBoundedRequestText,
} from './input';

export interface ItchEnv extends RateLimitEnv, DeviceEnv {
  ALLOWED_ORIGINS: string;
  ITCHIO_API_KEY?: string;
  ITCHIO_GAME_ID?: string;
}

const ITCH_BASE = 'https://api.itch.io';
const ITCH_TIMEOUT_MS = 8000;

type KeyCheck =
  | { kind: 'valid' }
  | { kind: 'invalid' }
  | { kind: 'unavailable'; message: string };

export function normalizeItchDownloadKey(input: string): string {
  const raw = String(input || '').trim();
  if (!raw || raw.length > 2048) return '';

  const hasScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(raw);
  const looksLikeItchUrl = /^(?:https?:\/\/)?(?:[^/\s]+\.)?itch\.io\//i.test(raw);

  if (hasScheme || looksLikeItchUrl) {
    let parsed: URL;
    try {
      parsed = new URL(hasScheme ? raw : `https://${raw}`);
    } catch {
      return '';
    }

    const host = parsed.hostname.toLowerCase();
    if (host !== 'itch.io' && !host.endsWith('.itch.io')) return '';

    const match = parsed.pathname.match(/\/download\/([^/]+)/i);
    if (!match) return '';

    let token: string;
    try {
      token = decodeURIComponent(match[1]);
    } catch {
      return '';
    }
    return /^[^\s/?#]{1,256}$/.test(token) &&
      isWithinUtf8Limit(token, MAX_PRODUCT_KEY_BYTES) ? token : '';
  }

  // Bare itch.io tokens contain no path, query string, fragment, or spaces.
  return /^[^\s/?#]{1,256}$/.test(raw) &&
    isWithinUtf8Limit(raw, MAX_PRODUCT_KEY_BYTES) ? raw : '';
}

async function readKey(request: Request): Promise<string> {
  try {
    const text = await readBoundedRequestText(request);
    const body = JSON.parse(text) as { key?: string };
    return normalizeItchDownloadKey(typeof body?.key === 'string' ? body.key : '');
  } catch (error) {
    if (error instanceof BodyTooLargeError) throw error;
    return '';
  }
}

function configured(env: ItchEnv): boolean {
  return !!(env.ITCHIO_API_KEY && env.ITCHIO_GAME_ID);
}

async function deviceKeyFor(key: string): Promise<string> {
  const bytes = new TextEncoder().encode(key);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `itch:${hex}`;
}

async function checkDownloadKey(key: string, env: ItchEnv): Promise<KeyCheck> {
  const url =
    `${ITCH_BASE}/games/${encodeURIComponent(env.ITCHIO_GAME_ID!)}` +
    `/download_keys?download_key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${env.ITCHIO_API_KEY}`,
      },
      signal: AbortSignal.timeout(ITCH_TIMEOUT_MS),
    });

    // itch's documentation shows invalid/revoked/wrong-game keys as HTTP 200
    // with errors[], but the live API also returns that exact semantic result
    // as HTTP 400. Trust only the explicit "invalid download key" error. Other
    // 4xx responses (bad seller credential, missing scope, malformed request)
    // remain service/configuration failures so they can never revoke a buyer.
    let upstream: any;
    try {
      upstream = await res.json();
    } catch {
      return { kind: 'unavailable', message: 'Could not verify with itch.io. Try again in a moment.' };
    }

    const errors = Array.isArray(upstream?.errors) ? upstream.errors.map(String) : [];
    const explicitlyInvalid = errors.some((error: string) =>
      /\binvalid download key\b/i.test(error),
    );
    if (explicitlyInvalid) return { kind: 'invalid' };

    if (res.status !== 200) {
      return { kind: 'unavailable', message: 'Could not verify with itch.io. Try again in a moment.' };
    }

    const downloadKey = upstream?.download_key;
    if (!downloadKey?.id) return { kind: 'invalid' };
    if (downloadKey.game_id != null && String(downloadKey.game_id) !== String(env.ITCHIO_GAME_ID)) {
      return { kind: 'invalid' };
    }
    return { kind: 'valid' };
  } catch {
    return { kind: 'unavailable', message: 'Could not reach itch.io. Try again in a moment.' };
  }
}

function configError(request: Request, env: ItchEnv): Response {
  return jsonResponse(
    { error: 'License server is not configured. Contact support.' },
    503,
    request,
    env.ALLOWED_ORIGINS,
  );
}

export async function handleItchVerify(request: Request, env: ItchEnv): Promise<Response> {
  try {
    const rl = await checkRateLimit(request, env, 'itch-activate');
    if (!rl.ok) {
      return jsonResponse({ valid: false, error: 'Too many requests.' }, 429, request, env.ALLOWED_ORIGINS);
    }
    if (!configured(env)) return configError(request, env);

    const key = await readKey(request);
    if (!key) {
      return jsonResponse({ valid: false, error: 'Missing key.' }, 400, request, env.ALLOWED_ORIGINS);
    }

    const deviceKey = await deviceKeyFor(key);
    // Validate existing state before contacting itch.io. Corrupt KV must never
    // be mistaken for an empty bucket that silently reopens device slots.
    await findExistingDevice(env, deviceKey, readToken(request));

    const checked = await checkDownloadKey(key, env);
    if (checked.kind === 'unavailable') {
      // Activation fails closed: no new access is granted during a store outage.
      return jsonResponse({ valid: false, error: checked.message }, 502, request, env.ALLOWED_ORIGINS);
    }
    if (checked.kind === 'invalid') {
      return jsonResponse(
        { valid: false, error: 'Key not recognised on itch.io.' },
        200,
        request,
        env.ALLOWED_ORIGINS,
      );
    }

    const issued = await issueOrRefresh(env, deviceKey, readToken(request), null);
    if (!issued.ok) {
      return jsonResponse(
        { valid: false, error: issued.error, active_devices: issued.active_devices, cap: issued.cap },
        403,
        request,
        env.ALLOWED_ORIGINS,
      );
    }

    const ttl = deviceTtlSeconds(env);
    return jsonResponse(
      {
        valid: true,
        device_token: issued.token,
        active_devices: issued.active_devices,
        device_cap: issued.cap,
      },
      200,
      request,
      env.ALLOWED_ORIGINS,
      { 'Set-Cookie': deviceCookie(issued.token!, ttl) },
    );
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return jsonResponse(
        { valid: false, error: 'Request body is too large.' },
        413,
        request,
        env.ALLOWED_ORIGINS,
      );
    }
    return jsonResponse(
      { valid: false, error: 'License server is busy. Please try again in a moment.' },
      503,
      request,
      env.ALLOWED_ORIGINS,
    );
  }
}

export async function handleItchValidate(request: Request, env: ItchEnv): Promise<Response> {
  try {
    const rl = await checkRateLimit(request, env, 'itch-validate');
    if (!rl.ok) return jsonResponse({ error: 'Too many requests.' }, 429, request, env.ALLOWED_ORIGINS);
    if (!configured(env)) return configError(request, env);

    const key = await readKey(request);
    if (!key) return jsonResponse({ valid: false, error: 'Missing key.' }, 400, request, env.ALLOWED_ORIGINS);

    const deviceKey = await deviceKeyFor(key);
    // Fail open for an already-unlocked buyer if persisted device state is
    // malformed; do not let a corrupt bucket become a fresh slot allocation.
    await findExistingDevice(env, deviceKey, readToken(request));

    const checked = await checkDownloadKey(key, env);
    if (checked.kind === 'unavailable') {
      // Deliberately omit `valid`: the client keeps the current paid state on
      // a temporary itch.io outage and retries on a later launch.
      return jsonResponse({ error: checked.message }, 502, request, env.ALLOWED_ORIGINS);
    }
    if (checked.kind === 'invalid') {
      return jsonResponse({ valid: false, error: 'This itch.io key is no longer valid.' }, 200, request, env.ALLOWED_ORIGINS);
    }

    // Ownership is still valid, so renew the browser lease even when its old
    // device record aged out after a long absence. DEVICE_TTL_SECONDS cleans up
    // inactive device slots; it must never behave like a 90-day purchase expiry.
    const issued = await issueOrRefresh(
      env,
      deviceKey,
      readToken(request),
      null,
    );
    if (!issued.ok) {
      return jsonResponse(
        {
          valid: false,
          error: issued.error,
          active_devices: issued.active_devices,
          cap: issued.cap,
        },
        403,
        request,
        env.ALLOWED_ORIGINS,
      );
    }

    const ttl = deviceTtlSeconds(env);
    return jsonResponse(
      {
        valid: true,
        device_token: issued.token,
        active_devices: issued.active_devices,
        device_cap: issued.cap,
      },
      200,
      request,
      env.ALLOWED_ORIGINS,
      { 'Set-Cookie': deviceCookie(issued.token!, ttl) },
    );
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return jsonResponse(
        { error: 'Request body is too large.' },
        413,
        request,
        env.ALLOWED_ORIGINS,
      );
    }
    return jsonResponse(
      { error: 'License server is busy. Please try again in a moment.' },
      503,
      request,
      env.ALLOWED_ORIGINS,
    );
  }
}

export async function handleItchDeactivate(request: Request, env: ItchEnv): Promise<Response> {
  try {
    const rl = await checkRateLimit(request, env, 'itch-deactivate');
    if (!rl.ok) return jsonResponse({ deactivated: false, error: 'Too many requests.' }, 429, request, env.ALLOWED_ORIGINS);

    const key = await readKey(request);
    const token = readToken(request);
    if (!key || !token) {
      return jsonResponse(
        { deactivated: false, error: 'Missing key or device token.' },
        400,
        request,
        env.ALLOWED_ORIGINS,
      );
    }

    const removed = await revoke(env, await deviceKeyFor(key), token);
    if (!removed) {
      return jsonResponse(
        { deactivated: false, error: 'This device was not active.' },
        409,
        request,
        env.ALLOWED_ORIGINS,
      );
    }

    return jsonResponse(
      { deactivated: true },
      200,
      request,
      env.ALLOWED_ORIGINS,
      { 'Set-Cookie': 'rw_device=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict' },
    );
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return jsonResponse(
        { deactivated: false, error: 'Request body is too large.' },
        413,
        request,
        env.ALLOWED_ORIGINS,
      );
    }
    return jsonResponse(
      { deactivated: false, error: 'License server is busy. Please try again in a moment.' },
      503,
      request,
      env.ALLOWED_ORIGINS,
    );
  }
}
