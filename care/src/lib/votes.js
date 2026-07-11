// Shared vote-casting logic (design §3.3): one row per (item, user), agree
// XOR disagree. Used by the standalone PUT /api/vote endpoint AND folded
// directly into POST /api/report's batch (the "auto-agree" cast that
// happens when a report is created or joined) — so the counting logic
// exists in exactly one place, and report-creation can still satisfy
// design §10's "create/join + auto-agree + counts in one batch" literally
// (report insert + vote + counts as ONE atomic D1 batch, not two).

/**
 * Build the (unexecuted) D1 statements to set `userSub`'s vote on
 * `itemId` to `newValue` (1, -1, or 0 = un-vote) — pure, no I/O beyond
 * the one read needed to compute the count delta. Callers batch() these
 * alongside whatever else needs to be atomic with the vote (e.g. a
 * report insert). Idempotent: voting the same way twice yields an empty
 * statement list.
 */
export async function buildVoteStatements(env, itemId, userSub, newValue) {
  if (![1, -1, 0].includes(newValue)) throw new Error('invalid vote value');

  const existing = await env.DB.prepare('SELECT value FROM votes WHERE item_id = ?1 AND user_sub = ?2')
    .bind(itemId, userSub)
    .first();
  const oldValue = existing ? existing.value : null;

  if (oldValue === newValue || (oldValue === null && newValue === 0)) {
    return { statements: [], changed: false, agreeDelta: 0, disagreeDelta: 0 };
  }

  let agreeDelta = 0;
  let disagreeDelta = 0;
  if (oldValue === 1) agreeDelta -= 1;
  if (oldValue === -1) disagreeDelta -= 1;
  if (newValue === 1) agreeDelta += 1;
  if (newValue === -1) disagreeDelta += 1;

  const now = Math.floor(Date.now() / 1000);
  const statements = [];

  if (newValue === 0) {
    statements.push(env.DB.prepare('DELETE FROM votes WHERE item_id = ?1 AND user_sub = ?2').bind(itemId, userSub));
  } else {
    statements.push(
      env.DB.prepare(
        `INSERT INTO votes (item_id, user_sub, value, created_at) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(item_id, user_sub) DO UPDATE SET value = excluded.value, created_at = excluded.created_at`
      ).bind(itemId, userSub, newValue, now)
    );
  }

  statements.push(
    env.DB.prepare('UPDATE items SET agree_count = agree_count + ?1, disagree_count = disagree_count + ?2 WHERE id = ?3')
      .bind(agreeDelta, disagreeDelta, itemId)
  );

  statements.push(
    env.DB.prepare('INSERT INTO vote_events (item_id, user_sub, value, created_at) VALUES (?1, ?2, ?3, ?4)')
      .bind(itemId, userSub, newValue, now)
  );

  return { statements, changed: true, agreeDelta, disagreeDelta };
}

/** Convenience wrapper for the standalone vote endpoint: builds + executes in one call. */
export async function castVote(env, itemId, userSub, newValue) {
  const { statements, changed, agreeDelta, disagreeDelta } = await buildVoteStatements(env, itemId, userSub, newValue);
  if (statements.length) await env.DB.batch(statements);
  return { changed, agreeDelta, disagreeDelta };
}
