-- Reconcile denormalized public comment counts with what the item route exposes.
-- Held or deleted comments remain available for moderation/audit but must not
-- contribute to the public count. This also repairs counts created before the
-- held-comment write path was hardened.
UPDATE items
SET comments_count = (
  SELECT COUNT(*)
  FROM comments
  WHERE comments.item_id = items.id
    AND comments.held = 0
    AND comments.deleted = 0
);
