// Lemon Squeezy license proxy. The LS license API requires no API key — it is
// a license-holder-facing endpoint. The Worker exists to:
//   1) eliminate the third-party CORS proxy that previously sat on the path,
//   2) layer per-IP rate limiting,
//   3) bind an opaque server-issued device_token to each license_key so the
//      3-device cap cannot be bypassed by tweaking a client-side fingerprint,
//   4) ENFORCE THE PAYWALL: a valid LS key only unlocks RealmWright if it
//      belongs to THIS product (store_id + product_id match via the LS `meta`
//      block). Ported from PR#5 — PR#4's base did not close this hole, so any
//      valid LS key from any store on the account could activate the app.
//
// FAIL-OPEN CONTRACT (CC-LIC, verified by audit §1/§3): a third-party outage
// must NEVER revoke a paying customer. validate therefore passes LS's response
// straight through and never fabricates valid:true/false; on any store error we
// return status text only (never a "disable" signal), and the client's
// _decideValidity keeps the user active. The product check below is written so
// it only ever rejects a key LS AFFIRMATIVELY says is valid-but-wrong-product;
// an absent/!ok response from LS is never treated as a mismatch.

import { jsonResponse } from './cors';
import { checkRateLimit } from './ratelimit';
import type { RateLimitEnv } from './ratelimit';
import { deviceCookie, findExistingDevice, issueOrRefresh, readToken, revoke, touch } from './fingerprint';
import type { DeviceEnv } from './fingerprint';

const LS_BASE = 'https://api.lemonsqueezy.com/v1/licenses';

// AUDIT FIX (MED #4): every external call gets an abort timeout so a hung
// upstream can't tie up the request up to the platform wall-clock limit.
const LS_TIMEOUT_MS = 8000;

export interface LicenseEnv extends DeviceEnv, RateLimitEnv {
  ALLOWED_ORIGINS: string;
  // The product this Worker guards. Both must be set in production or the
  // paywall fails closed — an unconfigured paywall is worse than a down one.
  LS_PRODUCT_ID?: string;
  LS_STORE_ID?: string;
  // Optional shared secret for the manual cleanup-orphans endpoint.
  CLEANUP_TOKEN?: string;
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
//
// AUDIT FIX (HIGH #1): this no longer lets a fetch rejection (DNS/connection
// error/timeout) escape as an unhandled throw. A network failure resolves to
// { status: 0, json: {} }, which every handler reads as "not activated / not
// valid" and surfaces a graceful "try again" — never a crash, never a CORS-less
// 500, and (critically) never a revoke, since json.valid is simply absent.
async function forwardToLS(path: string, params: URLSearchParams): Promise<{
  status: number;
  json: any;
}> {
  try {
    const res = await fetch(`${LS_BASE}/${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
      signal: AbortSignal.timeout(LS_TIMEOUT_MS),
    });
    let json: any = {};
    try {
      json = await res.json();
    } catch {
      json = { error: 'Upstream returned non-JSON.' };
    }
    return { status: res.status, json };
  } catch {
    // Network error or timeout — caller treats this as a soft failure.
    return { status: 0, json: {} };
  }
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

// PAYWALL CHECK (ported from PR#5). Returns null if the LS `meta` block matches
// this product, otherwise a user-facing error string. Two modes:
//   strict=true  (activate): an absent meta on an otherwise-activated key is a
//                rejection — a genuine purchase always carries meta, so a
//                missing one means we cannot prove ownership; prefer a support
//                ticket over a free unlock.
//   strict=false (validate): an absent meta is NOT a rejection. This preserves
//                the fail-open-for-the-customer contract — if LS says valid:true
//                but drops/renames meta (shape drift), we keep the paying user
//                active rather than revoking on a third-party change. We only
//                reject when meta is PRESENT and affirmatively wrong-product.
// In BOTH modes an unconfigured Worker (missing LS_PRODUCT_ID/LS_STORE_ID) is a
// hard rejection — an unconfigured paywall is worse than a down one.
function productMismatch(env: LicenseEnv, meta: any, strict: boolean): string | null {
  if (!env.LS_PRODUCT_ID || !env.LS_STORE_ID) {
    return 'License server is not configured. Contact support.';
  }
  if (!meta) {
    return strict ? 'This key is not valid for RealmWright.' : null;
  }
  if (String(meta.product_id) !== String(env.LS_PRODUCT_ID)) {
    return 'This license key is for a different product.';
  }
  if (String(meta.store_id) !== String(env.LS_STORE_ID)) {
    return 'This license key is for a different product.';
  }
  return null;
}

export async function handleActivate(
  request: Request,
  env: LicenseEnv,
): Promise<Response> {
  // AUDIT FIX (HIGH #1): whole handler body wrapped so any throw becomes a
  // graceful, CORS-bearing "try again" — status text only, NEVER a revoke.
  try {
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
    // Paywall must be configured (fails closed).
    if (!env.LS_PRODUCT_ID || !env.LS_STORE_ID) {
      return jsonResponse(
        { activated: false, error: 'License server is not configured. Contact support.' },
        503,
        request,
        env.ALLOWED_ORIGINS,
      );
    }

    // Idempotent same-device path. Re-entering the same key must not mint a new
    // Lemon Squeezy instance when this device already owns a live one.
    const presented = readToken(request);
    const existing = await findExistingDevice(env, licenseKey, presented);
    if (existing?.record.instance_id) {
      const existingInstanceId = existing.record.instance_id;
      const check = await forwardToLS(
        'validate',
        new URLSearchParams({ license_key: licenseKey, instance_id: existingInstanceId }),
      );
      if (check.json?.valid === true) {
        const mismatch = productMismatch(env, check.json?.meta, false);
        if (mismatch) {
          return jsonResponse(
            { activated: false, error: mismatch },
            403,
            request,
            env.ALLOWED_ORIGINS,
          );
        }
        const refreshed = await issueOrRefresh(env, licenseKey, presented, existingInstanceId);
        if (!refreshed.ok) {
          return jsonResponse(
            { activated: false, error: refreshed.error, active_devices: refreshed.active_devices, cap: refreshed.cap },
            403,
            request,
            env.ALLOWED_ORIGINS,
          );
        }
        const ttl = parseInt(env.DEVICE_TTL_SECONDS || '7776000', 10);
        return jsonResponse(
          {
            activated: true,
            valid: true,
            instance: { id: existingInstanceId },
            meta: check.json?.meta,
            device_token: refreshed.token,
            active_devices: refreshed.active_devices,
            device_cap: refreshed.cap,
            reused: true,
          },
          200,
          request,
          env.ALLOWED_ORIGINS,
          { 'Set-Cookie': deviceCookie(refreshed.token!, ttl) },
        );
      }
      // Unknown/outage response: do not risk creating a duplicate upstream slot.
      // Only an explicit valid:false proves the old instance is dead and allows a
      // fresh activation attempt.
      if (check.json?.valid !== false) {
        return jsonResponse(
          { activated: false, error: 'License server is busy. Please try again in a moment.' },
          503,
          request,
          env.ALLOWED_ORIGINS,
        );
      }
    }

    // 1) LS is source of truth on whether the key is real.
    const params = new URLSearchParams({
      license_key: licenseKey,
      instance_name: instanceName,
    });
    const upstream = await forwardToLS('activate', params);

    if (!upstream.json?.activated) {
      // AUDIT FIX (LOW #12): do not reflect LS's raw error text. On a server-side
      // failure (status 0 from a network error/timeout, or 5xx) return a fixed
      // "try again"; on a genuine 4xx (bad/expired key) return a fixed message.
      // Either way this is status-only — never a disable/kill signal.
      if (upstream.status === 0 || upstream.status >= 500) {
        return jsonResponse(
          { activated: false, error: 'License server is busy. Please try again in a moment.' },
          503,
          request,
          env.ALLOWED_ORIGINS,
        );
      }
      return jsonResponse(
        { activated: false, error: 'Activation failed. Check the key and try again.' },
        upstream.status || 400,
        request,
        env.ALLOWED_ORIGINS,
      );
    }

    // 1b) PAYWALL: the key activated — but is it OURS? If not, roll back the
    // activation slot we just consumed on LS, then reject.
    const mismatch = productMismatch(env, upstream.json?.meta, true);
    if (mismatch) {
      const badInstanceId: string | null = upstream.json?.instance?.id || null;
      if (badInstanceId) {
        // best-effort rollback; forwardToLS already swallows its own throws.
        await forwardToLS(
          'deactivate',
          new URLSearchParams({ license_key: licenseKey, instance_id: badInstanceId }),
        );
      }
      return jsonResponse(
        { activated: false, error: mismatch },
        403,
        request,
        env.ALLOWED_ORIGINS,
      );
    }

    const instanceId: string | null = upstream.json?.instance?.id || null;

    // 2) Bind a server-issued device_token. If the client already has one,
    //    refresh it; otherwise mint a new one (enforcing the 3-device cap).
    const issued = await issueOrRefresh(env, licenseKey, presented, instanceId);

    if (!issued.ok) {
      // Roll back the LS activation so we don't burn a slot on an over-cap device.
      if (instanceId) {
        await forwardToLS(
          'deactivate',
          new URLSearchParams({ license_key: licenseKey, instance_id: instanceId }),
        );
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
  } catch {
    return jsonResponse(
      { activated: false, error: 'License server is busy. Please try again in a moment.' },
      503,
      request,
      env.ALLOWED_ORIGINS,
    );
  }
}

export async function handleValidate(
  request: Request,
  env: LicenseEnv,
): Promise<Response> {
  // AUDIT FIX (HIGH #1): wrapped. CRITICAL fail-open property — on ANY internal
  // failure we return status text WITHOUT a `valid` field, so the client's
  // _decideValidity keeps the user in their current state. We never fabricate
  // valid:false here; a worker hiccup must not revoke a paying customer.
  try {
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

    // Refresh the device token's last_seen_at if presented (non-fatal).
    try {
      await touch(env, licenseKey, readToken(request));
    } catch {
      /* non-fatal */
    }

    // PAYWALL re-check (non-strict / fail-open). Only when LS AFFIRMATIVELY says
    // valid:true do we look at meta; a wrong-product key is rejected, but a
    // valid response that merely lacks meta (shape drift / outage where status
    // is non-200 and `valid` is absent) is passed straight through so the paying
    // user is never revoked by a third-party change.
    if (upstream.json?.valid === true) {
      const mismatch = productMismatch(env, upstream.json?.meta, false);
      if (mismatch) {
        return jsonResponse({ valid: false, error: mismatch }, 403, request, env.ALLOWED_ORIGINS);
      }
    }

    // Pass LS's response through verbatim (minus nothing it didn't send). On a
    // network error forwardToLS returned { status:0, json:{} } → no `valid`
    // field → client keeps current state. Correct fail-open.
    return jsonResponse(upstream.json, upstream.status || 200, request, env.ALLOWED_ORIGINS);
  } catch {
    // Status text only, NO `valid` field → client keeps the user active.
    return jsonResponse(
      { error: 'License server is busy. Please try again in a moment.' },
      503,
      request,
      env.ALLOWED_ORIGINS,
    );
  }
}

export async function handleDeactivate(
  request: Request,
  env: LicenseEnv,
): Promise<Response> {
  // AUDIT FIX (HIGH #1): wrapped → graceful "try again" on any throw.
  try {
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
  } catch {
    return jsonResponse(
      { deactivated: false, error: 'License server is busy. Please try again in a moment.' },
      503,
      request,
      env.ALLOWED_ORIGINS,
    );
  }
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
        // forwardToLS swallows network throws (status 0). Only drop a record
        // when LS AFFIRMATIVELY says the instance is no longer valid — a blip
        // (status 0) leaves the record intact so we never reap on an outage.
        const r = await forwardToLS('validate', params);
        if (r.status !== 0 && !r.json?.valid) {
          stale.push(t.token);
          reaped++;
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
//
// AUDIT FIX (MED #10): this now FAILS CLOSED. If CLEANUP_TOKEN is not set, the
// HTTP endpoint is disabled entirely (404-style refusal) instead of running an
// expensive KV+LS scan for any anonymous caller. The cron path calls
// reapOrphans() directly and never needs this guard.
export async function handleCleanupOrphans(
  request: Request,
  env: LicenseEnv,
): Promise<Response> {
  try {
    const expected = env.CLEANUP_TOKEN;
    if (!expected) {
      return jsonResponse(
        { error: 'Not found.' },
        404,
        request,
        env.ALLOWED_ORIGINS,
      );
    }
    const provided = request.headers.get('X-Cleanup-Token') || '';
    if (provided !== expected) {
      return jsonResponse({ error: 'Unauthorised.' }, 401, request, env.ALLOWED_ORIGINS);
    }
    const result = await reapOrphans(env);
    return jsonResponse(result, 200, request, env.ALLOWED_ORIGINS);
  } catch {
    return jsonResponse(
      { error: 'Cleanup failed. Try again later.' },
      503,
      request,
      env.ALLOWED_ORIGINS,
    );
  }
}
