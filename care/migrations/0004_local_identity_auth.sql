-- Replace Google as Care's runtime identity provider with local opaque identities.
-- Existing Google-backed users are retained as legacy rows so their reports,
-- votes, and comments remain intact; they are not silently mapped to a new
-- person without proof of ownership.

ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'legacy-google';
ALTER TABLE users ADD COLUMN recovery_hash TEXT;
ALTER TABLE users ADD COLUMN recovery_issued_at INTEGER;
ALTER TABLE users ADD COLUMN is_owner INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX users_recovery_hash
  ON users(recovery_hash)
  WHERE recovery_hash IS NOT NULL;

-- There must be exactly one local Owner Desk identity.
CREATE UNIQUE INDEX users_single_owner
  ON users(is_owner)
  WHERE is_owner = 1;

-- Opaque browser sessions. Only an HMAC verifier is stored; the bearer token
-- itself exists only in the HttpOnly cookie in the user's browser.
CREATE TABLE care_sessions (
  token_hash TEXT PRIMARY KEY,
  user_sub TEXT NOT NULL REFERENCES users(sub),
  created_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER
);
CREATE INDEX care_sessions_user ON care_sessions(user_sub);
CREATE INDEX care_sessions_expiry ON care_sessions(expires_at);

-- IPs are never stored raw. fingerprint is an HMAC using SESSION_SECRET.
-- The bucketed counters stop account/recovery/owner-token abuse without a
-- paid CAPTCHA or third-party service.
CREATE TABLE care_auth_attempts (
  kind TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (kind, fingerprint, bucket)
);
CREATE INDEX care_auth_attempts_bucket ON care_auth_attempts(bucket);
