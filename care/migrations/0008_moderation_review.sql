-- Keep held content and record explicit owner review without deleting records.
ALTER TABLE items ADD COLUMN moderation_reviewed_at INTEGER;
ALTER TABLE reports ADD COLUMN moderation_reviewed_at INTEGER;
ALTER TABLE comments ADD COLUMN moderation_reviewed_at INTEGER;
CREATE INDEX reports_pending_review ON reports(held, moderation_reviewed_at);
CREATE INDEX comments_pending_review ON comments(held, deleted, moderation_reviewed_at);
