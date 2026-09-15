"""Data-preservation checks for the one-time demo cleanup. No dependencies."""
from pathlib import Path
import sqlite3
import unittest

CARE = Path(__file__).resolve().parents[1]
SCHEMA = (CARE / 'migrations/0001_init.sql').read_text()
CLEANUP = (CARE / 'migrations/0005_hide_seed10_fixtures.sql').read_text()


class SeedCleanupTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.addCleanup(self.db.close)
        self.db.execute('PRAGMA foreign_keys = ON')
        self.db.executescript(SCHEMA)
        self.db.executemany(
            'INSERT INTO users(sub, name, email, created_at) VALUES (?, ?, ?, 1)',
            [(f'seed10-u{i}', f'Seed GM seed10-{i}', f'seed10{i}@example.test')
             for i in range(16)] + [
                ('mock-owner-sub-001', 'Hunter (Owner)', 'owner@example.test'),
                ('local-real', 'A GM', None),
            ],
        )
        for i in range(1, 12):
            self.item(i, 'seed10-u0', f'campaign — seeded bug #{i}',
                      status='shipped' if i == 10 else 'declined' if i == 11 else 'open')
        self.db.execute("INSERT INTO reports(item_id,user_sub,payload,created_at) VALUES (7,'local-real','{\"actual\":\"Keep this report\"}',2)")
        self.db.execute("INSERT INTO comments(item_id,user_sub,body,created_at) VALUES (7,'local-real','Keep this comment',2)")
        self.db.execute("INSERT INTO votes VALUES (7,'local-real',1,2)")
        self.db.execute("INSERT INTO vote_events(item_id,user_sub,value,created_at) VALUES (7,'local-real',1,2)")

    def item(self, item_id, author, title, status='open'):
        self.db.execute(
            'INSERT INTO items(id,type,area,title,status,created_at,created_by) VALUES (?,\'bug\',\'campaign\',?,?,1,?)',
            (item_id, title, status, author),
        )

    def run_cleanup(self):
        self.db.executescript(CLEANUP)

    def rows(self, table):
        return self.db.execute(f'SELECT * FROM {table} ORDER BY 1').fetchall()

    def test_hides_all_original_fixtures_including_shipped_and_declined(self):
        self.run_cleanup()
        self.assertEqual(self.db.execute('SELECT count(*) FROM items WHERE held=1').fetchone()[0], 11)
        self.assertEqual(self.db.execute('SELECT count(*) FROM items WHERE held=0').fetchone()[0], 0)

    def test_preserves_all_content_and_only_changes_visibility(self):
        tables = ('users', 'reports', 'comments', 'votes', 'vote_events', 'digests', 'owner_log')
        before = {t: self.rows(t) for t in tables}
        columns = [r[1] for r in self.db.execute('PRAGMA table_xinfo(items)') if r[1] != 'held']
        query = 'SELECT ' + ','.join(columns) + ' FROM items ORDER BY id'
        items_before = self.db.execute(query).fetchall()
        self.run_cleanup()
        self.assertEqual(before, {t: self.rows(t) for t in tables})
        self.assertEqual(items_before, self.db.execute(query).fetchall())

    def test_real_author_with_identical_fixture_title_stays_visible(self):
        self.db.execute("UPDATE items SET created_by='local-real' WHERE id=1")
        self.run_cleanup()
        self.assertEqual(self.db.execute('SELECT held FROM items WHERE id=1').fetchone()[0], 0)

    def test_real_title_by_seed_author_and_later_ids_stay_visible(self):
        self.db.execute("UPDATE items SET title='Campaign board loses notes' WHERE id=2")
        self.item(100, 'seed10-u0', 'campaign — seeded bug #100')
        self.run_cleanup()
        self.assertEqual(self.db.execute('SELECT id FROM items WHERE held=0 ORDER BY id').fetchall(), [(2,), (100,)])

    def test_synthetic_id_without_matching_name_and_email_is_not_enough(self):
        self.db.execute("UPDATE users SET email='person@example.com' WHERE sub='seed10-u0'")
        self.run_cleanup()
        self.assertEqual(self.db.execute('SELECT count(*) FROM items WHERE held=0').fetchone()[0], 11)

    def test_older_mock_owner_seed_is_supported(self):
        self.db.execute("UPDATE items SET created_by='mock-owner-sub-001' WHERE id=3")
        self.run_cleanup()
        self.assertEqual(self.db.execute('SELECT held FROM items WHERE id=3').fetchone()[0], 1)

    def test_rerun_is_idempotent_and_existing_hold_is_preserved(self):
        self.db.execute('UPDATE items SET held=1 WHERE id=4')
        self.run_cleanup()
        after = self.rows('items')
        self.run_cleanup()
        self.assertEqual(after, self.rows('items'))

    def test_owner_can_restore_without_reconstructing_records(self):
        self.run_cleanup()
        self.db.execute('UPDATE items SET held=0 WHERE id=7')
        self.assertEqual(self.db.execute('SELECT held FROM items WHERE id=7').fetchone()[0], 0)
        self.assertEqual(self.db.execute('SELECT body FROM comments WHERE item_id=7').fetchone()[0], 'Keep this comment')


if __name__ == '__main__':
    unittest.main()
