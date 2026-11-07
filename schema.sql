-- Lista de espera de EkMira (Cloudflare D1)
CREATE TABLE IF NOT EXISTS waitlist (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL UNIQUE,
  company     TEXT NOT NULL DEFAULT '',
  units       TEXT NOT NULL DEFAULT '',
  source      TEXT NOT NULL DEFAULT 'hero',
  country     TEXT NOT NULL DEFAULT '',
  user_agent  TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist (created_at);
