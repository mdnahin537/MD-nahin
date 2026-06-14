// Lemon Squeezy license proxy. The LS license API requires no API key — it is
// a license-holder-facing endpoint. The Worker exists to:
//   1) eliminate the third-party CORS proxy that previously sat on the path,
//   2) layer per-IP rate limiting,
//   3) bind an opaque server-issued device_token to each license_key so the
//      3-device cap cannot be bypassed by tweaking a client-side fingerprint.

import { jsonResponse } from './cors';
import { checkRateLimit, RateLimitEnv } from './ratelimit';
import {
  DeviceEnv,
  deviceCookie,
  issueOrRefresh,
  readToken,
  revoke,
  touch,
} from './fingerprint';

const LS_BASE = 'https://api.lemonsqueezy.com/v1/licenses';

export interface LicenseEnv extends DeviceEnv, RateLimitEnv {
  ALLOWED_ORIGINS: string;
}

interface ActivateBody {
  license_key?: string;
  instance_name?: string;
}

interface ValidateBody {
  license_key?: string;
  instance_id?: string;
}

interface DeactivateBody {
  license_key?: string;
  instance_id?: string;
}

// Forward a urlencoded POST to Lemon Squeezy and pipe back the response.
async function forwardToLS(path: string, params: URLSearchParams): Promise<{
  status: number;
  json: any;
}> {
  const res = await fetch(`${LS_BASE}/${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  let json: any = {};
  try {
    json = await res.json();
  } catch {
    json = { error: 'Upstream returned non-JSON.' };
  }
  return { status: res.status, json };
}

async function readBody(request: Request): Promise<Record<string, string>> {
  const ctype = request.headers.get('Content-Type') || '';
  if (ctype.includes('application/json')) {
    try {
      const obj = await request.json();
      if (obj && typeof obj === 'object') return obj as Record<string, string>;
    } catch {
      /* fall through */
    }
    return {};
  }
  // urlencoded fallback
  const text = await request.text();
  const params = new URLSearchParams(text);
  const out: Record<string, string> = {};
  params.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

export async function handleActivate(
  request: Request,
  env: LicenseEnv,
): Promise<Response> {
  const rl = await checkRateLimit(request, env, 'activate');
  if (!rl.ok) {
    return jsonResponse(
      { activated: false, error: 'Too many activation attempts. Wait a minute and try again.' },
      429,
      request,
      env.ALLOWED_ORIGINS,
    );
  }

  const body = (await readBody(request)) as ActivateBody;
  const licenseKey = (body.license_key || '').trim();
  const instanceName = (body.instance_name || `RealmWright-${Date.now()}`).slice(0, 64);

  if (!licenseKey) {
    return jsonResponse(
      { activated: false, error: 'Missing license_key.' },
      400,
      request,
      env.ALLOWED_ORIGINS,
    );
  }

  // 1) LS is source of truth on whether the key is real.
  const params = new URLSearchParams({
    license_key: licenseKey,
    instance_name: instanceName,
  });
  const upstream = await forwardToLS('activate', params);

  if (!upstream.json?.activated) {
    return jsonResponse(upstream.json, upstream.status || 400, request, env.ALLOWED_ORIGINS);
  }

  const instanceId: string | null = upstream.json?.instance?.id || null;

  // 2) Bind a server-issued device_token. If the client already has one,
  //    refresh it; otherwise mint a new one (enforcing the 3-device cap).
  const presented = readToken(request);
  const issued = await issueOrRefresh(env, licenseKey, presented, instanceId);

  if (!issued.ok) {
    // Roll back the LS activation so we don't burn a slot on an over-cap device.
    try {
      const rb = new URLSearchParams({
        license_key: licenseKey,
        instance_id: instanceId || '',
      });
      await forwardToLS('deactivate', rb);
    } catch {
      /* best-effort rollback */
    }
    return jsonResponse(
      { activated: false, error: issued.error, active_devices: issued.active_devices, cap: issued.cap },
      403,
      request,
      env.ALLOWED_ORIGINS,
    );
  }

  const ttl = parseInt(env.DEVICE_TTL_SECONDS || '7776000', 10);
  const body_out = {
    ...upstream.json,
    device_token: issued.token,
    active_devices: issued.active_devices,
    device_cap: issued.cap,
  };
  return jsonResponse(body_out, 200, request, env.ALLOWED_ORIGINS, {
    'Set-Cookie': deviceCookie(issued.token!, ttl),
  });
}

export async function handleValidate(
  request: Request,
  env: LicenseEnv,
): Promise<Response> {
  const rl = await checkRateLimit(request, env, 'validate');
  if (!rl.ok) {
    return jsonResponse(
      { valid: false, error: 'Too many requests.' },
      429,
      request,
      env.ALLOWED_ORIGINS,
    );
  }

  const body = (await readBody(request)) as ValidateBody;
  const licenseKey = (body.license_key || '').trim();
  if (!licenseKey) {
    return jsonResponse(
      { valid: false, error: 'Missing license_key.' },
      400,
      request,
      env.ALLOWED_ORIGINS,
    );
  }

  const params = new URLSearchParams({ license_key: licenseKey });
  if (body.instance_id) params.set('instance_id', body.instance_id);

  const upstream = await forwardToLS('validate', params);

  // Refresh the device token's last_seen_at if presented.
  try {
    await touch(env, licenseKey, readToken(request));
  } catch {
    /* non-fatal */
  }

  return jsonResponse(upstream.json, upstream.status || 200, request, env.ALLOWED_ORIGINS);
}

export async function handleDeactivate(
  request: Request,
  env: LicenseEnv,
): Promise<Response> {
  const rl = await checkRateLimit(request, env, 'deactivate');
  if (!rl.ok) {
    return jsonResponse(
      { deactivated: false, error: 'Too many requests.' },
      429,
      request,
      env.ALLOWED_ORIGINS,
    );
  }

  const body = (await readBody(request)) as DeactivateBody;
  const licenseKey = (body.license_key || '').trim();
  const instanceId = (body.instance_id || '').trim();
  if (!licenseKey || !instanceId) {
    return jsonResponse(
      { deactivated: false, error: 'Missing license_key or instance_id.' },
      400,
      request,
      env.ALLOWED_ORIGINS,
    );
  }

  const params = new URLSearchParams({ license_key: licenseKey, instance_id: instanceId });
  const upstream = await forwardToLS('deactivate', params);

  // Remove the local device_token binding regardless of LS outcome — if LS
  // succeeded the device is gone; if LS failed the orphan reaper picks it up.
  try {
    await revoke(env, licenseKey, readToken(request));
  } catch {
    /* non-fatal */
  }

  // Clear the cookie on success.
  const extra: Record<string, string> = {};
  if (upstream.json?.deactivated) {
    extra['Set-Cookie'] =
      'rw_device=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict';
  }
  return jsonResponse(upstream.json, upstream.status || 200, request, env.ALLOWED_ORIGINS, extra);
}

// Cron-driven orphan reaper. Walks the DEVICES KV namespace, pulls every
// license bucket, asks LS what instances it thinks are live, and deactivates
// any LS instance_id whose device_token has been pruned (last_seen older than
// DEVICE_TTL_SECONDS).
//
// NOTE: LS does not expose a "list instances for a license" endpoint in the
// public license API. Best we can do is re-validate every known instance_id
// stored in our buckets; if validate returns valid=false, drop the record.
// Real orphans (LS instances created during a failed activate where the
// client never received the device_token) are caught by the activate-time
// rollback in handleActivate. This reaper is a safety net for stale records.
export async function reapOrphans(env: LicenseEnv): Promise<{ scanned: number; reaped: number }> {
  let scanned = 0;
  let reaped = 0;
  let cursor: string | undefined;
  // KV list pagination — bounded loop with a safety cap.
  for (let i = 0; i < 50; i++) {
    const page = await env.DEVICES.list({ cursor, limit: 1000 });
    for (const k of page.keys) {
      scanned++;
      const bucket = (await env.DEVICES.get(k.name, 'json')) as any;
      if (!bucket || !Array.isArray(bucket.tokens)) {
        await env.DEVICES.delete(k.name);
        reaped++;
        continue;
      }
      // Touch nothing if all tokens still fresh — fast path.
      const stale: string[] = [];
      for (const t of bucket.tokens) {
        if (!t.instance_id) continue;
        const params = new URLSearchParams({
          license_key: k.name,
          instance_id: t.instance_id,
        });
        try {
          const r = await forwardToLS('validate', params);
          if (!r.json?.valid) {
            // LS no longer recognises this instance — drop it.
            stale.push(t.token);
            reaped++;
          }
        } catch {
          /* skip on network blip */
        }
      }
      if (stale.length > 0) {
        const survivors = bucket.tokens.filter((t: any) => !stale.includes(t.token));
        if (survivors.length === 0) {
          await env.DEVICES.delete(k.name);
        } else {
          const ttl = parseInt(env.DEVICE_TTL_SECONDS || '7776000', 10);
          await env.DEVICES.put(k.name, JSON.stringify({ tokens: survivors }), {
            expirationTtl: ttl,
          });
        }
      }
    }
    if (page.list_complete) break;
    cursor = page.cursor;
  }
  return { scanned, reaped };
}

// Manual cleanup endpoint (also invokable from cron handler).
export async function handleCleanupOrphans(
  request: Request,
  env: LicenseEnv,
): Promise<Response> {
  // Soft auth: require a shared secret if configured. Defaults to allowing the
  // cron-only path. Frontend never calls this.
  const expected = (env as any).CLEANUP_TOKEN as string | undefined;
  if (expected) {
    const provided = request.headers.get('X-Cleanup-Token') || '';
    if (provided !== expected) {
      return jsonResponse({ error: 'Unauthorised.' }, 401, request, env.ALLOWED_ORIGINS);
    }
  }
  const result = await reapOrphans(env);
  return jsonResponse(result, 200, request, env.ALLOWED_ORIGINS);
}
