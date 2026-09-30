
export async function buildVoteStatements(env, itemId, userSub, newValue) {
  if (![1,-1,0].includes(newValue)) throw new Error("invalid vote value");
  const now = Math.floor(Date.now()/1000);
  const statements = [env.DB.prepare(`INSERT INTO vote_events (item_id,user_sub,value,created_at)
    SELECT ?1,?2,?3,?4 WHERE COALESCE((SELECT value FROM votes WHERE item_id=?1 AND user_sub=?2),0) != ?3`)
    .bind(itemId,userSub,newValue,now)];
  statements.push(newValue===0
    ? env.DB.prepare("DELETE FROM votes WHERE item_id=?1 AND user_sub=?2").bind(itemId,userSub)
    : env.DB.prepare(`INSERT INTO votes (item_id,user_sub,value,created_at) VALUES (?1,?2,?3,?4)
      ON CONFLICT(item_id,user_sub) DO UPDATE SET value=excluded.value,created_at=excluded.created_at WHERE votes.value != excluded.value`)
      .bind(itemId,userSub,newValue,now));
  statements.push(env.DB.prepare(`UPDATE items SET
    agree_count=(SELECT COUNT(*) FROM votes WHERE item_id=?1 AND value=1),
    disagree_count=(SELECT COUNT(*) FROM votes WHERE item_id=?1 AND value=-1) WHERE id=?1`).bind(itemId));
  return {statements,changed:true};
}

export async function castVote(env,itemId,userSub,newValue) {
  const {statements}=await buildVoteStatements(env,itemId,userSub,newValue);
  statements.push(env.DB.prepare("SELECT net,agree_count,disagree_count FROM items WHERE id=?1").bind(itemId));
  const results=await env.DB.batch(statements);
  const row=results[results.length-1].results?.[0] || {};
  return {changed:(results[0].meta?.changes || 0)>0,net:row.net,agreeCount:row.agree_count,disagreeCount:row.disagree_count,value:newValue};
}


