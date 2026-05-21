// Free-demo OpenRouter proxy.
//
// PHASE 1a SCOPE NOTE: the existing frontend (src/index.html line 4775) already
// calls `${WORKER_URL}/api/demo/generate` for free-tier model calls. That
// route — including the OpenRouter API key, Turnstile verification, and
// per-IP daily quota in KV — is owned by an older Worker build (Phase 5A).
// Phase 1a deliberately does NOT rewrite it.
//
// This stub keeps the route present in any Worker built from this directory.
// When the existing demo handler is migrated into this repo, replace the
// stub body with the real implementation. The contract is:
//   POST /api/demo/generate
//   body: { messages: [...], turnstile_token: string, fingerprint?: string }
//   -> { ok: true, content, usage, remaining_today } | { error }

import { jsonResponse } from './cors';

interface DemoEnv {
  ALLOWED_ORIGINS: string;
}

export async function handleDemoGenerate(
  request: Request,
  env: DemoEnv,
): Promise<Response> {
  return jsonResponse(
    {
      ok: false,
      error:
        'Demo generation is handled by the legacy Worker build. This stub is intentional — see worker/src/demo.ts.',
    },
    501,
    request,
    env.ALLOWED_ORIGINS,
  );
}
