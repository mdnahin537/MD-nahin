import { getSession } from '../lib/auth.js';
import { json } from '../lib/http.js';

/** GET /api/me — session probe. Used by the board/wizard to know login state without a redirect. */
export async function handleGetMe(request, env, url) {
  const session = await getSession(request, env);
  if (!session) return json({ loggedIn: false });
  return json({
    loggedIn: true,
    name: session.name,
    avatar: session.avatar,
    isOwner: session.sub === env.OWNER_SUB,
  });
}
