// Server-issued opaque device tokens. The frontend NEVER computes the token
// itself, so a malicious client cannot forge a "new device" by tweaking
// UA/screen/timezone strings. The Worker is the authority on device identity.
//
// Storage shape per license key in the DEVICES KV namespace:
//   {
//     "tokens": [
//       { "token": "<uuid>", "instance_id": "<ls-instance-id|null>",
//         "created_at": 1716200000000, "last_seen_at": 1716200000000 }
//     ]
//   }
// TTL: 90 days (refreshed on every touch). Tokens beyond DEVICE_CAP are rejected.

export interface DeviceEnv {
  DEVICES: KVNamespace;
  DEVICE_CAP: string;
  DEVICE_TTL_SECONDS: string;
}

export interface DeviceRecord {
  token: string;
  instance_id: string | null;
  created_at: number;
  last_seen_at: number;
}

export interface DeviceBucket {
  tokens: DeviceRecord[];
}

function newToken(): string {
  // crypto.randomUUID is available in the Workers runtime.
  return crypto.randomUUID();
}

async function readBucket(env: DeviceEnv, key: string): Promise<DeviceBucket> {
  const raw = await env.DEVICES.get(key, 'json');
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as DeviceBucket).tokens)) {
    return { tokens: [] };
  }
  return raw as DeviceBucket;
}

async function writeBucket(env: DeviceEnv, key: string, bucket: DeviceBucket): Promise<void> {
  const ttl = parseInt(env.DEVICE_TTL_SECONDS || '7776000', 10);
  await env.DEVICES.put(key, JSON.stringify(bucket), { expirationTtl: ttl });
}

// Strip tokens older than TTL. KV expiration handles whole-record cleanup,
// but tokens within a bucket need explicit pruning since they share a key.
function prune(bucket: DeviceBucket, ttlSeconds: number): DeviceBucket {
  const cutoff = Date.now() - ttlSeconds * 1000;
  return { tokens: bucket.tokens.filter((t) => t.last_seen_at >= cutoff) };
}

export interface IssueResult {
  ok: boolean;
  token?: string;
  error?: string;
  active_devices?: number;
  cap?: number;
}

export interface ExistingDeviceResult {
  record: DeviceRecord;
  active_devices: number;
  cap: number;
}

// Read-only lookup used before Lemon Squeezy activation. A known token with an
// existing instance lets the Worker validate/reuse that instance instead of
// consuming a fresh LS activation slot on every re-entry of the same key.
export async function findExistingDevice(
  env: DeviceEnv,
  licenseKey: string,
  presentedToken: string | null,
): Promise<ExistingDeviceResult | null> {
  if (!presentedToken) return null;
  const ttl = parseInt(env.DEVICE_TTL_SECONDS || '7776000', 10);
  const cap = parseInt(env.DEVICE_CAP || '3', 10);
  const bucket = prune(await readBucket(env, licenseKey), ttl);
  const record = bucket.tokens.find((t) => t.token === presentedToken);
  return record ? { record, active_devices: bucket.tokens.length, cap } : null;
}

// Called on activate. If the request carries an existing valid token, refresh
// last_seen_at and return the same token. Otherwise check cap, issue a new one.
//
// RESIDUAL RACE (documented, accepted): readBucket -> push -> writeBucket is a
// read-modify-write on KV, which is eventually consistent and exposes no CAS.
// Two activations for the SAME license_key racing on different edge locations
// can each read a sub-cap bucket and each write a +1, so the effective ceiling
// can briefly exceed DEVICE_CAP by the in-flight concurrency for one license.
// Blast radius is one user's own key (not cross-tenant), self-heals on the next
// write, and the worst case is a paying customer briefly running on cap+N of
// THEIR OWN devices — never free access for a stranger. KV is the only store
// the platform free tier gives us; a Durable Object per license would make this
// exact, at the cost of a paid binding. Accepted for the money path.
export async function issueOrRefresh(
  env: DeviceEnv,
  licenseKey: string,
  presentedToken: string | null,
  instanceId: string | null,
): Promise<IssueResult> {
  const ttl = parseInt(env.DEVICE_TTL_SECONDS || '7776000', 10);
  const cap = parseInt(env.DEVICE_CAP || '3', 10);
  const now = Date.now();

  let bucket = prune(await readBucket(env, licenseKey), ttl);

  // Refresh path
  if (presentedToken) {
    const existing = bucket.tokens.find((t) => t.token === presentedToken);
    if (existing) {
      existing.last_seen_at = now;
      if (instanceId) existing.instance_id = instanceId;
      await writeBucket(env, licenseKey, bucket);
      return { ok: true, token: existing.token, active_devices: bucket.tokens.length, cap };
    }
    // Token not found — treat as new device.
  }

  if (bucket.tokens.length >= cap) {
    return {
      ok: false,
      error: `Device limit reached (${cap}). Deactivate one of your other devices first.`,
      active_devices: bucket.tokens.length,
      cap,
    };
  }

  const token = newToken();
  bucket.tokens.push({ token, instance_id: instanceId, created_at: now, last_seen_at: now });
  await writeBucket(env, licenseKey, bucket);
  return { ok: true, token, active_devices: bucket.tokens.length, cap };
}

// On validate — light touch, just refresh last_seen_at if we know the token.
export async function touch(
  env: DeviceEnv,
  licenseKey: string,
  token: string | null,
): Promise<void> {
  if (!token) return;
  const ttl = parseInt(env.DEVICE_TTL_SECONDS || '7776000', 10);
  const bucket = prune(await readBucket(env, licenseKey), ttl);
  const existing = bucket.tokens.find((t) => t.token === token);
  if (!existing) return;
  existing.last_seen_at = Date.now();
  await writeBucket(env, licenseKey, bucket);
}

// On deactivate — remove the token for this device only.
export async function revoke(
  env: DeviceEnv,
  licenseKey: string,
  token: string | null,
): Promise<void> {
  if (!token) return;
  const bucket = await readBucket(env, licenseKey);
  const filtered = bucket.tokens.filter((t) => t.token !== token);
  if (filtered.length === 0) {
    await env.DEVICES.delete(licenseKey);
    return;
  }
  await writeBucket(env, licenseKey, { tokens: filtered });
}

// Read token from cookie (preferred) or X-Device-Token header (itch.io iframe /
// file:// fallback where third-party cookies are blocked).
export function readToken(request: Request): string | null {
  const header = request.headers.get('X-Device-Token');
  if (header && /^[0-9a-f-]{36}$/i.test(header)) return header;

  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(/(?:^|;\s*)rw_device=([0-9a-f-]{36})/i);
  return m ? m[1] : null;
}

export function deviceCookie(token: string, ttlSeconds: number): string {
  return `rw_device=${token}; Path=/; Max-Age=${ttlSeconds}; HttpOnly; Secure; SameSite=Strict`;
}
