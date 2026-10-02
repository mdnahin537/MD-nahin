CREATE TABLE IF NOT EXISTS care_mail_outbox (
 event_key TEXT PRIMARY KEY,
 kind TEXT NOT NULL,
 snapshot TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','accepted','failed')),
 attempts INTEGER NOT NULL DEFAULT 0,
 next_attempt_at INTEGER NOT NULL DEFAULT 0,
 lease_token TEXT,
 lease_until INTEGER NOT NULL DEFAULT 0,
 accepted_at INTEGER,
 last_error TEXT
);
CREATE INDEX IF NOT EXISTS care_mail_due ON care_mail_outbox(state,next_attempt_at);
CREATE TRIGGER IF NOT EXISTS care_email_new_report AFTER INSERT ON reports BEGIN
 INSERT OR IGNORE INTO care_mail_outbox(event_key,kind,created_at,snapshot)
 SELECT 'report:'||NEW.id,'report',NEW.created_at,
 json_object('reportId',NEW.id,'itemId',NEW.item_id,'title',i.title,'type',i.type,'area',i.area,
 'payload',NEW.payload,'held',CASE WHEN NEW.held=1 OR i.held=1 THEN 1 ELSE 0 END,'name',u.name,'email',u.email)
 FROM items i JOIN users u ON u.sub=NEW.user_sub WHERE i.id=NEW.item_id;
END;
CREATE TRIGGER IF NOT EXISTS care_email_followup AFTER UPDATE OF payload ON reports
 WHEN OLD.payload<>NEW.payload BEGIN
 INSERT OR IGNORE INTO care_mail_outbox(event_key,kind,created_at,snapshot)
 SELECT 'followup:'||NEW.id||':'||json_array_length(NEW.payload,'$.followups'),'followup',CAST(strftime('%s','now') AS INTEGER),
 json_object('reportId',NEW.id,'itemId',NEW.item_id,'title',i.title,'type',i.type,'area',i.area,
 'payload',NEW.payload,'held',CASE WHEN NEW.held=1 OR i.held=1 THEN 1 ELSE 0 END,'name',u.name,'email',u.email)
 FROM items i JOIN users u ON u.sub=NEW.user_sub WHERE i.id=NEW.item_id;
END;
CREATE TRIGGER IF NOT EXISTS care_email_comment AFTER INSERT ON comments BEGIN
 INSERT OR IGNORE INTO care_mail_outbox(event_key,kind,created_at,snapshot)
 SELECT 'comment:'||NEW.id,'comment',NEW.created_at,
 json_object('commentId',NEW.id,'itemId',NEW.item_id,'title',i.title,'type',i.type,'area',i.area,
 'body',NEW.body,'parentId',NEW.parent_id,'held',CASE WHEN NEW.held=1 OR i.held=1 THEN 1 ELSE 0 END,'name',u.name,'email',u.email)
 FROM items i JOIN users u ON u.sub=NEW.user_sub WHERE i.id=NEW.item_id;
END;
