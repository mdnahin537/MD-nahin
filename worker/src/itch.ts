// itch.io key verification.
//
// PHASE 1a SCOPE NOTE: the existing frontend (src/index.html line 4685) already
// calls `${WORKER_URL}/verify` for itch.io keys. That route is owned by an
// older Worker build (Phase 5A); Phase 1a deliberately does NOT rewrite it.
// This stub exists so a Worker built from this directory has a route present
// and returns a documented "not implemented in this build" response rather
// than 404'ing for itch.io users.
//
// When the existing /verify implementation is migrated into this repo, replace
// the stub body with the real handler. The contract is:
//   POST /verify  { key: string }  ->  { valid: boolean, error?: string }

import { jsonResponse } from './cors';

interface ItchEnv {
  ALLOWED_ORIGINS: string;
}

export async function handleItchVerify(
  request: Request,
  env: ItchEnv,
): Promise<Response> {
  return jsonResponse(
    {
      valid: false,
      error:
        'itch.io verification is handled by the legacy Worker build. This stub is intentional — see worker/src/itch.ts.',
    },
    501,
    request,
    env.ALLOWED_ORIGINS,
  );
}
