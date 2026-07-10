// itch.io download-key verification.
//
// itch.io issues a unique download key to every buyer. The seller can verify a
// key server-side with their API key (never expose it client-side). A key that
// resolves to a real download_key for THIS game = a real buyer.
//
//   GET https://itch.io/api/1/{API_KEY}/game/{GAME_ID}/download_keys?download_key={KEY}
//     -> 200 { download_key: { id, key, ... } }   (valid)
//     -> 200 { errors: ["invalid download key"] }  (invalid)
//
// Contract:  POST /verify  { key: string }  ->  { valid: boolean, device_token?, error? }
//
// Env vars are standardized on the ITCHIO_* prefix (see wrangler.toml / README).
//
// DEVICE CAP (audit MED #9): a valid itch buyer is minted a server-issued
// device_token exactly like a Lemon Squeezy activation, so itch buyers are
// subject to the same DEVICE_CAP. The client persists json.device_token when
// present (realmwright-v7.html:6099); without this, itch buyers were entirely
// uncapped. itch has no per-key instance concept, so instance_id is null and
// deactivation is local-token-only (no LS round-trip).

import { jsonResponse } from './cors';
import { checkRateLimit } from './ratelimit';
import type { RateLimitEnv } from './ratelimit';
import { deviceCookie, issueOrRefresh, readToken } from './fingerprint';
import type { DeviceEnv } from './fingerprint';

export interface ItchEnv extends RateLimitEnv, DeviceEnv {
  ALLOWED_ORIGINS: string;
  ITCHIO_API_KEY?: string; // secret — seller's itch.io API key
  ITCHIO_GAME_ID?: string; // numeric game id this Worker guards
}

const ITCH_BASE = 'https://itch.io/api/1';

// AUDIT FIX (MED #4): abort timeout on the itch call.
const ITCH_TIMEOUT_MS = 8000;

export async function handleItchVerify(request: Request, env: ItchEnv): Promise<Response> {
  // AUDIT FIX (HIGH #1, applied for parity): wrap so any throw is a graceful
  // status-only failure — never a crash, never a "disable" signal.
  try {
    const rl = await checkRateLimit(request, env, 'verify');
    if (!rl.ok) {
      return jsonResponse({ valid: false, error: 'Too many requests.' }, 429, request, env.ALLOWED_ORIGINS);
    }

    if (!env.ITCHIO_API_KEY || !env.ITCHIO_GAME_ID) {
      return jsonResponse(
        { valid: false, error: 'License server is not configured. Contact support.' },
        503,
        request,
        env.ALLOWED_ORIGINS,
      );
    }

    let key = '';
    try {
      const body = (await request.json()) as { key?: string };
      key = (body?.key || '').trim();
    } catch {
      /* handled below */
    }
    if (!key) {
      return jsonResponse({ valid: false, error: 'Missing key.' }, 400, request, env.ALLOWED_ORIGINS);
    }

    const url =
      `${ITCH_BASE}/${encodeURIComponent(env.ITCHIO_API_KEY)}/game/${encodeURIComponent(env.ITCHIO_GAME_ID)}` +
      `/download_keys?download_key=${encodeURIComponent(key)}`;

    let upstream: any = {};
    let status = 0;
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(ITCH_TIMEOUT_MS),
      });
      status = res.status;
      upstream = await res.json();
    } catch {
      return jsonResponse(
        { valid: false, error: 'Could not reach itch.io. Try again in a moment.' },
        502,
        request,
        env.ALLOWED_ORIGINS,
      );
    }

    // A valid key returns a download_key object; anything else (errors[], 404)
    // is treated as invalid. We never echo itch's raw error text to the client.
    // Fails CLOSED on shape drift (no free access) — the correct direction.
    const valid = status === 200 && !!upstream?.download_key?.id;
    if (!valid) {
      return jsonResponse(
        { valid: false, error: 'Key not recognised on itch.io.' },
        200,
        request,
        env.ALLOWED_ORIGINS,
      );
    }

    // Valid buyer — mint/refresh a device token (3-device cap, same as LS).
    // Namespace the KV bucket so an itch key can never collide with an LS key.
    const deviceKey = `itch:${key}`;
    const presented = readToken(request);
    const issued = await issueOrRefresh(env, deviceKey, presented, null);
    if (!issued.ok) {
      return jsonResponse(
        { valid: false, error: issued.error, active_devices: issued.active_devices, cap: issued.cap },
        403,
        request,
        env.ALLOWED_ORIGINS,
      );
    }

    const ttl = parseInt(env.DEVICE_TTL_SECONDS || '7776000', 10);
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
  } catch {
    return jsonResponse(
      { valid: false, error: 'License server is busy. Please try again in a moment.' },
      503,
      request,
      env.ALLOWED_ORIGINS,
    );
  }
}
