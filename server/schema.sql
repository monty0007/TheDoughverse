-- Oryn Database Schema (SQLite / Turso)

-- Images
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  r2_key TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  is_published INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Image <> Tag join
CREATE TABLE IF NOT EXISTS image_tags (
  image_id TEXT REFERENCES images(id) ON DELETE CASCADE,
  tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (image_id, tag_id)
);

-- Likes (for deduplication)
CREATE TABLE IF NOT EXISTS likes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  image_id TEXT REFERENCES images(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Prompt copy events (for trending)
CREATE TABLE IF NOT EXISTS prompt_copies (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  image_id TEXT REFERENCES images(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Cookie Products
CREATE TABLE IF NOT EXISTS cookie_products (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Classic',
  badge TEXT CHECK (badge IN ('NEW', 'BESTSELLER', 'SEASONAL', 'LIMITED') OR badge IS NULL),
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  is_limited INTEGER DEFAULT 0,
  quantity INTEGER DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_images_published ON images(is_published, is_deleted);
CREATE INDEX IF NOT EXISTS idx_images_created ON images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_tags_image ON image_tags(image_id);
CREATE INDEX IF NOT EXISTS idx_image_tags_tag ON image_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_likes_dedup ON likes(image_id, fingerprint);
CREATE INDEX IF NOT EXISTS idx_prompt_copies_image ON prompt_copies(image_id);
CREATE INDEX IF NOT EXISTS idx_prompt_copies_recent ON prompt_copies(created_at DESC);
