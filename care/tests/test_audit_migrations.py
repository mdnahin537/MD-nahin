"""Upgrade preserved customer rows in isolation; never contacts live D1."""
from pathlib import Path
import json
import sqlite3
import unittest

CARE = Path(__file__).resolve().parents[1]

class AuditMigrationTests(unittest.TestCase):
    def test_existing_content_and_identity_verifiers_survive_new_migrations(self):
        db = sqlite3.connect(':memory:')
        self.addCleanup(db.close)
        db.executescript((CARE / 'migrations/0001_init.sql').read_text())
        db.executescript((CARE / 'migrations/0004_local_identity_auth.sql').read_text())
        db.execute("INSERT INTO users(sub,name,email,created_at,auth_provider,is_owner,recovery_hash) VALUES ('local-preserved','Owner','legacy@example.test',1,'local',1,'dummy-recovery-verifier')")
        db.execute("INSERT INTO care_sessions(token_hash,user_sub,created_at,last_seen,expires_at) VALUES ('dummy-session-verifier','local-preserved',1,1,9999999999)")
        db.execute("INSERT INTO items(id,type,area,title,created_at,created_by,held) VALUES (41,'bug','exports-data','Original title',1,'local-preserved',1)")
        original = json.dumps({'freetext': 'Keep every original <&> বাংলা detail', 'ctx': {'schema': 4}})
        db.execute("INSERT INTO reports(id,item_id,user_sub,payload,created_at) VALUES (55,41,'local-preserved',?,1)", (original,))
        db.execute("INSERT INTO comments(id,item_id,user_sub,body,created_at,held) VALUES (71,41,'local-preserved','Original comment',1,1)")
        db.execute("INSERT INTO votes VALUES (41,'local-preserved',1,1)")
        before = {table: db.execute(f'SELECT * FROM {table} ORDER BY 1').fetchall()
                  for table in ('users','care_sessions','items','reports','comments','votes')}
        widths = {table: len(rows[0]) for table, rows in before.items()}
        for name in ('0006_mail_outbox.sql','0007_submission_retries.sql','0008_moderation_review.sql'):
            db.executescript((CARE / 'migrations' / name).read_text())
        for table, expected in before.items():
            actual = db.execute(f'SELECT * FROM {table} ORDER BY 1').fetchall()
            self.assertEqual([row[:widths[table]] for row in actual], expected)
        self.assertEqual(db.execute('SELECT COUNT(*) FROM care_mail_outbox').fetchone()[0], 0)
        self.assertEqual(db.execute('SELECT submission_key,submission_hash,moderation_reviewed_at FROM reports WHERE id=55').fetchone(), (None,None,None))
        db.execute("INSERT INTO reports(item_id,user_sub,payload,created_at) VALUES (41,'local-preserved',?,2)", (original,))
        self.assertEqual(db.execute('SELECT COUNT(*) FROM care_mail_outbox').fetchone()[0], 1)
        snapshot = json.loads(db.execute('SELECT snapshot FROM care_mail_outbox').fetchone()[0])
        self.assertEqual(snapshot['payload'], original)
        self.assertEqual(snapshot['held'], 1)

if __name__ == '__main__':
    unittest.main()
