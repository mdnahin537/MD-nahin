-- Add a retry key without rewriting or removing existing customer records.
ALTER TABLE reports ADD COLUMN submission_key TEXT;
ALTER TABLE reports ADD COLUMN submission_hash TEXT;
CREATE UNIQUE INDEX care_report_submission_key
  ON reports(user_sub, submission_key) WHERE submission_key IS NOT NULL;
ALTER TABLE comments ADD COLUMN submission_key TEXT;
ALTER TABLE comments ADD COLUMN submission_hash TEXT;
CREATE UNIQUE INDEX care_comment_submission_key
  ON comments(user_sub, submission_key) WHERE submission_key IS NOT NULL;
