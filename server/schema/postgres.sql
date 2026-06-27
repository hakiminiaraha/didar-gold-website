CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  mobile TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'support', 'editor', 'admin')),
  mobile_verified_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS otp_challenges (
  id TEXT PRIMARY KEY,
  mobile TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed_at BIGINT,
  ip_hash TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_otp_mobile_created ON otp_challenges (mobile, created_at DESC);

CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  last_seen_at BIGINT NOT NULL,
  user_agent TEXT,
  ip_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS wishlist_items (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creation_id TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (user_id, creation_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata_json TEXT,
  ip_hash TEXT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_content (
  route_path TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('fa', 'en')),
  content_key TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'video', 'poster', 'link', 'alt')),
  value TEXT NOT NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (route_path, locale, content_key, content_type)
);
CREATE INDEX IF NOT EXISTS idx_cms_route_locale ON cms_content (route_path, locale);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  public_url TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS catalog_items (
  id BIGSERIAL PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'collection')),
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  data_json TEXT NOT NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  UNIQUE (item_type, slug)
);
CREATE INDEX IF NOT EXISTS idx_catalog_type_status_order ON catalog_items (item_type, status, sort_order);

CREATE TABLE IF NOT EXISTS journal_articles (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  featured SMALLINT NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  category TEXT NOT NULL,
  pillar TEXT NOT NULL,
  image TEXT NOT NULL,
  date_label TEXT NOT NULL,
  read_label_json TEXT NOT NULL,
  content_json TEXT NOT NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_journal_status_order ON journal_articles (status, featured DESC, sort_order);

CREATE TABLE IF NOT EXISTS inquiries (
  id BIGSERIAL PRIMARY KEY,
  reference_code TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL CHECK (reason IN ('private', 'selection', 'service', 'general')),
  full_name TEXT NOT NULL,
  contact_value TEXT NOT NULL,
  preferred_channel TEXT NOT NULL,
  preferred_date TEXT,
  message TEXT,
  locale TEXT NOT NULL CHECK (locale IN ('fa', 'en')),
  source_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'closed')),
  internal_note TEXT,
  handled_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  ip_hash TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status_created ON inquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_ip_created ON inquiries (ip_hash, created_at DESC);
