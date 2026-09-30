import { json, jsonError } from './http.js';

// Recheck inside each public write transaction. Owner merges and holds may
// have completed since the route's earlier validation read.
export const visibleItemGuard = `EXISTS (SELECT 1 FROM items write_item
  WHERE write_item.id=?1 AND write_item.held=0 AND write_item.merged_into IS NULL)`;

export async function changedBoardItem(env, itemId) {
  const item = await env.DB.prepare('SELECT held,merged_into FROM items WHERE id=?1').bind(itemId).first();
  if (!item || item.held) return jsonError(404, 'Report not found.');
  if (item.merged_into) return json({
    error: 'That report was merged into another one. Open the updated discussion before trying again.',
    mergedInto: item.merged_into,
  }, 409);
  return jsonError(409, 'This discussion changed. Reload it before trying again.');
}
