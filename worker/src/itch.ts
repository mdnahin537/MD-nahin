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
// Contract:  POST /verify  { key: string }  ->  { valid: boolean, error?: string }

import { jsonResponse } from './cors';
import { checkRateLimit, RateLimitEnv } from './ratelimit';

export interface ItchEnv extends RateLimitEnv {
  ALLOWED_ORIGINS: string;
  ITCH_API_KEY?: string; // secret — seller's itch.io API key
  ITCH_GAME_ID?: string; // numeric game id this Worker guards
}

const ITCH_BASE = 'https://itch.io/api/1';

export async function handleItchVerify(request: Request, env: ItchEnv): Promise<Response> {
  const rl = await checkRateLimit(request, env, 'verify');
  if (!rl.ok) {
    return jsonResponse({ valid: false, error: 'Too many requests.' }, 429, request, env.ALLOWED_ORIGINS);
  }

  if (!env.ITCH_API_KEY || !env.ITCH_GAME_ID) {
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
    `${ITCH_BASE}/${encodeURIComponent(env.ITCH_API_KEY)}/game/${encodeURIComponent(env.ITCH_GAME_ID)}` +
    `/download_keys?download_key=${encodeURIComponent(key)}`;

  let upstream: any = {};
  let status = 0;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
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

  // A valid key returns a download_key object; anything else (errors[], 404) is
  // treated as invalid. We never echo itch's raw error text to the client.
  const valid = status === 200 && !!upstream?.download_key?.id;
  if (!valid) {
    return jsonResponse(
      { valid: false, error: 'Key not recognised on itch.io.' },
      200,
      request,
      env.ALLOWED_ORIGINS,
    );
  }

  return jsonResponse({ valid: true }, 200, request, env.ALLOWED_ORIGINS);
}
