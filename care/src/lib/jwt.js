// Minimal JWT sign/verify built directly on WebCrypto (crypto.subtle).
// No dependency — Workers ship crypto.subtle natively, and hand-rolling
// ~120 lines here avoids a runtime dependency for something this small.
//
// Two uses in this app:
//   - HS256: our own session cookie + the short-lived OAuth "state" cookie
//     (sign with SESSION_SECRET, symmetric).
//   - RS256 *verify only*: Google's ID token, checked against Google's
//     published JWKS (asymmetric — we never sign with RS256, only verify).

function base64urlEncode(bytes) {
  let binary = '';
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecodeToBytes(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64urlEncodeString(str) {
  return base64urlEncode(new TextEncoder().encode(str));
}

function base64urlDecodeToString(str) {
  return new TextDecoder().decode(base64urlDecodeToBytes(str));
}

function b64urlToBigUintBytes(str) {
  // For RSA JWK fields (n, e) — already base64url, just need raw bytes.
  return base64urlDecodeToBytes(str);
}

/** Sign a compact HS256 JWT. `payload` gets `iat` set automatically. */
export async function signHS256(payload, secret, { expiresInSeconds } = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now };
  if (expiresInSeconds) fullPayload.exp = now + expiresInSeconds;

  const headerB64 = base64urlEncodeString(JSON.stringify(header));
  const payloadB64 = base64urlEncodeString(JSON.stringify(fullPayload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  const sigB64 = base64urlEncode(sig);
  return `${signingInput}.${sigB64}`;
}

/**
 * Verify a compact HS256 JWT. Returns the parsed payload on success, or
 * null on any failure (bad signature, malformed, expired). Never throws —
 * callers should always be able to treat "not logged in" as the safe path.
 */
export async function verifyHS256(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = base64urlDecodeToBytes(sigB64);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    );
    if (!valid) return null;

    const payload = JSON.parse(base64urlDecodeToString(payloadB64));
    if (typeof payload.exp === 'number' && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // expired
    }
    return payload;
  } catch {
    return null;
  }
}

/** Decode (NOT verify) a JWT's header and payload. Used to read `kid` before JWKS lookup. */
export function decodeJwtUnsafe(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    return {
      header: JSON.parse(base64urlDecodeToString(parts[0])),
      payload: JSON.parse(base64urlDecodeToString(parts[1])),
      signingInput: `${parts[0]}.${parts[1]}`,
      signatureB64: parts[2],
    };
  } catch {
    return null;
  }
}

/**
 * Verify an RS256 JWT (Google's ID token) against a JWKS document
 * ({ keys: [...] }, standard JWK Set format). Returns the payload on
 * success (with iss/aud/exp NOT yet checked — caller checks those, since
 * the expected issuer/audience are deployment-specific), or null.
 */
export async function verifyRS256WithJwks(token, jwks) {
  const decoded = decodeJwtUnsafe(token);
  if (!decoded) return null;
  if (decoded.header.alg !== 'RS256') return null;

  const jwk = (jwks.keys || []).find((k) => k.kid === decoded.header.kid);
  if (!jwk) return null;

  try {
    const key = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = b64urlToBigUintBytes(decoded.signatureB64);
    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      sigBytes,
      new TextEncoder().encode(decoded.signingInput)
    );
    if (!valid) return null;

    const now = Math.floor(Date.now() / 1000);
    if (typeof decoded.payload.exp === 'number' && now > decoded.payload.exp) return null;
    if (typeof decoded.payload.iat === 'number' && decoded.payload.iat > now + 60) return null; // issued in the future (clock skew guard)

    return decoded.payload;
  } catch {
    return null;
  }
}
