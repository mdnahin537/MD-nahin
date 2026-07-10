// Per-UTC-day rate limits (design §3.4) — each check is one COUNT query
// against the relevant table at write time. Generous ceilings: this is an
// anti-abuse floor, not a UX constraint for real GMs.

const REPORTS_PER_DAY = 5;
const REPORTS_PER_DAY_NEW_ACCOUNT = 2;
const NEW_ACCOUNT_WINDOW_SECONDS = 24 * 60 * 60;
const COMMENTS_PER_DAY = 30;
const VOTE_CHANGES_PER_DAY = 200;

function startOfUtcDaySeconds(nowSeconds) {
  const d = new Date(nowSeconds * 1000);
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000);
}

/** {allowed, message?} — message is the human-readable §9-style error body when blocked. */
export async function checkReportLimit(env, userSub) {
  const now = Math.floor(Date.now() / 1000);
  const dayStart = startOfUtcDaySeconds(now);

  const userRow = await env.DB.prepare('SELECT created_at FROM users WHERE sub = ?1').bind(userSub).first();
  const isNewAccount = userRow && now - userRow.created_at < NEW_ACCOUNT_WINDOW_SECONDS;
  const limit = isNewAccount ? REPORTS_PER_DAY_NEW_ACCOUNT : REPORTS_PER_DAY;

  const { count } = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM reports WHERE user_sub = ?1 AND created_at >= ?2'
  )
    .bind(userSub, dayStart)
    .first();

  if (count >= limit) {
    return {
      allowed: false,
      message: `You've filed ${limit} reports today — the board opens again at midnight UTC.`,
    };
  }
  return { allowed: true };
}

export async function checkCommentLimit(env, userSub) {
  const dayStart = startOfUtcDaySeconds(Math.floor(Date.now() / 1000));
  const { count } = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM comments WHERE user_sub = ?1 AND created_at >= ?2'
  )
    .bind(userSub, dayStart)
    .first();
  if (count >= COMMENTS_PER_DAY) {
    return {
      allowed: false,
      message: `You've posted ${COMMENTS_PER_DAY} comments today — the board opens again at midnight UTC.`,
    };
  }
  return { allowed: true };
}

export async function checkVoteLimit(env, userSub) {
  const dayStart = startOfUtcDaySeconds(Math.floor(Date.now() / 1000));
  const { count } = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM vote_events WHERE user_sub = ?1 AND created_at >= ?2'
  )
    .bind(userSub, dayStart)
    .first();
  if (count >= VOTE_CHANGES_PER_DAY) {
    return {
      allowed: false,
      message: `You've changed ${VOTE_CHANGES_PER_DAY} votes today — the board opens again at midnight UTC.`,
    };
  }
  return { allowed: true };
}
