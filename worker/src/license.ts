// Lemon Squeezy license proxy.
//
// Lemon Squeezy's license API is license-holder-facing and needs no API key.
// This Worker exists to:
//   1) remove the third-party CORS proxy that previously sat on the path,
//   2) add per-IP rate limiting, and
//   3) ENFORCE THE PAYWALL: a valid LS key only unlocks RealmWright if it
//      belongs to THIS product (store_id + product_id match). Without this
//      check any LS key from any store would activate the app.
//
// Device capping is handled by Lemon Squeezy's native `activation_limit`
// (set on the product). LS returns activated:false with an over-limit error
// once the cap is hit — we pass that straight through. No custom device
// tokens, no KV device buckets, no orphan reaper.

import { jsonResponse } from './cors';
import { checkRateLimit, RateLimitEnv } from './ratelimit';

const LS_BASE = 'https://api.lemonsqueezy.com/v1/licenses';

export interface LicenseEnv extends RateLimitEnv {
  ALLOWED_ORIGINS: string;
  // The product this Worker guards. Both must be set in production or the
  // Worker fails closed — an unconfigured paywall is worse than a down one.
  LS_PRODUCT_ID?: string;
  LS_STORE_ID?: string;
}

interface LSResult {
  status: number;
  json: any;
}

async function forwardToLS(path: string, params: URLSearchParams): Promise<LSResult> {
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
  const text = await request.text();
  const out: Record<string, string> = {};
  new URLSearchParams(text).forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

// Returns null if the LS `meta` block matches this product, otherwise an error
// string. Fails closed when the Worker is not configured.
function productMismatch(env: LicenseEnv, meta: any): string | null {
  if (!env.LS_PRODUCT_ID || !env.LS_STORE_ID) {
    return 'License server is not configured. Contact support.';
  }
  if (!meta) return 'This key is not valid for RealmWright.';
  if (String(meta.product_id) !== String(env.LS_PRODUCT_ID)) {
    return 'This license key is for a different product.';
  }
  if (String(meta.store_id) !== String(env.LS_STORE_ID)) {
    return 'This license key is for a different product.';
  }
  return null;
}

export async function handleActivate(request: Request, env: LicenseEnv): Promise<Response> {
  const rl = await checkRateLimit(request, env, 'activate');
  if (!rl.ok) {
    return jsonResponse(
      { activated: false, error: 'Too many activation attempts. Wait a minute and try again.' },
      429,
      request,
      env.ALLOWED_ORIGINS,
    );
  }

  const body = await readBody(request);
  const licenseKey = (body.license_key || '').trim();
  const instanceName = (body.instance_name || `RealmWright-${Date.now()}`).slice(0, 64);

  if (!licenseKey) {
    return jsonResponse({ activated: false, error: 'Missing license_key.' }, 400, request, env.ALLOWED_ORIGINS);
  }
  if (!env.LS_PRODUCT_ID || !env.LS_STORE_ID) {
    return jsonResponse(
      { activated: false, error: 'License server is not configured. Contact support.' },
      503,
      request,
      env.ALLOWED_ORIGINS,
    );
  }

  const upstream = await forwardToLS(
    'activate',
    new URLSearchParams({ license_key: licenseKey, instance_name: instanceName }),
  );

  // LS handles key validity AND the native activation_limit. Pass failures
  // (bad key, over device cap) straight through.
  if (!upstream.json?.activated) {
    return jsonResponse(upstream.json, upstream.status || 400, request, env.ALLOWED_ORIGINS);
  }

  // PAYWALL: the key activated, but is it OURS? If not, roll back the
  // activation slot we just consumed and reject.
  const mismatch = productMismatch(env, upstream.json?.meta);
  if (mismatch) {
    const instanceId: string | null = upstream.json?.instance?.id || null;
    if (instanceId) {
      try {
        await forwardToLS('deactivate', new URLSearchParams({ license_key: licenseKey, instance_id: instanceId }));
      } catch {
        /* best-effort rollback */
      }
    }
    return jsonResponse({ activated: false, error: mismatch }, 403, request, env.ALLOWED_ORIGINS);
  }

  return jsonResponse(upstream.json, 200, request, env.ALLOWED_ORIGINS);
}

export async function handleValidate(request: Request, env: LicenseEnv): Promise<Response> {
  const rl = await checkRateLimit(request, env, 'validate');
  if (!rl.ok) {
    return jsonResponse({ valid: false, error: 'Too many requests.' }, 429, request, env.ALLOWED_ORIGINS);
  }

  const body = await readBody(request);
  const licenseKey = (body.license_key || '').trim();
  if (!licenseKey) {
    return jsonResponse({ valid: false, error: 'Missing license_key.' }, 400, request, env.ALLOWED_ORIGINS);
  }
  if (!env.LS_PRODUCT_ID || !env.LS_STORE_ID) {
    return jsonResponse(
      { valid: false, error: 'License server is not configured. Contact support.' },
      503,
      request,
      env.ALLOWED_ORIGINS,
    );
  }

  const params = new URLSearchParams({ license_key: licenseKey });
  if (body.instance_id) params.set('instance_id', body.instance_id);

  const upstream = await forwardToLS('validate', params);

  // Re-check product on every validate so a cross-product key can never linger
  // valid even if it somehow slipped past activate.
  if (upstream.json?.valid) {
    const mismatch = productMismatch(env, upstream.json?.meta);
    if (mismatch) {
      return jsonResponse({ valid: false, error: mismatch }, 403, request, env.ALLOWED_ORIGINS);
    }
  }

  return jsonResponse(upstream.json, upstream.status || 200, request, env.ALLOWED_ORIGINS);
}

export async function handleDeactivate(request: Request, env: LicenseEnv): Promise<Response> {
  const rl = await checkRateLimit(request, env, 'deactivate');
  if (!rl.ok) {
    return jsonResponse({ deactivated: false, error: 'Too many requests.' }, 429, request, env.ALLOWED_ORIGINS);
  }

  const body = await readBody(request);
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

  const upstream = await forwardToLS(
    'deactivate',
    new URLSearchParams({ license_key: licenseKey, instance_id: instanceId }),
  );
  return jsonResponse(upstream.json, upstream.status || 200, request, env.ALLOWED_ORIGINS);
}
