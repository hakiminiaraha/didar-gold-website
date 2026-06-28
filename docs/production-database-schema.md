# Didar Gold Production Database Schema

This schema is the recommended PostgreSQL/Supabase model for the production catalog, CMS, CRM, analytics, and appointment layer. The current app can keep `catalog_items` during migration, but launch data should move toward these normalized tables.

## Core Catalog

```sql
CREATE TABLE collections (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  code TEXT NOT NULL,
  title_fa TEXT NOT NULL,
  title_en TEXT NOT NULL,
  intro_fa TEXT,
  intro_en TEXT,
  hero_image_id BIGINT,
  story_image_id BIGINT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_fa TEXT NOT NULL,
  title_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  collection_id BIGINT REFERENCES collections(id),
  category_id BIGINT REFERENCES categories(id),
  title_fa TEXT NOT NULL,
  title_en TEXT NOT NULL,
  subtitle_fa TEXT,
  subtitle_en TEXT,
  story_fa TEXT,
  story_en TEXT,
  design_note_fa TEXT,
  design_note_en TEXT,
  weight_grams NUMERIC(8, 3),
  gold_type TEXT NOT NULL DEFAULT '18K',
  finish_fa TEXT,
  finish_en TEXT,
  certificate_status TEXT DEFAULT 'pending',
  digital_identity_status TEXT DEFAULT 'ready',
  guarantee_status TEXT DEFAULT 'available',
  buyback_status TEXT DEFAULT 'review_required',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE media_assets (
  id BIGSERIAL PRIMARY KEY,
  public_url TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_fa TEXT,
  alt_en TEXT,
  created_by BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_asset_id BIGINT NOT NULL REFERENCES media_assets(id),
  role TEXT NOT NULL DEFAULT 'gallery',
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (product_id, media_asset_id)
);
```

## Content, SEO, CRM

```sql
CREATE TABLE seo_metadata (
  route_path TEXT PRIMARY KEY,
  title_fa TEXT NOT NULL,
  title_en TEXT,
  description_fa TEXT NOT NULL,
  description_en TEXT,
  og_image_id BIGINT REFERENCES media_assets(id),
  canonical_url TEXT,
  noindex BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE journal_articles (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  category TEXT NOT NULL,
  title_fa TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_fa TEXT,
  excerpt_en TEXT,
  body_json JSONB NOT NULL DEFAULT '[]',
  featured_image_id BIGINT REFERENCES media_assets(id),
  published_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE leads (
  id BIGSERIAL PRIMARY KEY,
  reference_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  contact_value TEXT NOT NULL,
  preferred_channel TEXT NOT NULL,
  source_path TEXT NOT NULL,
  interest_product_id BIGINT REFERENCES products(id),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE appointments (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'requested',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  route_path TEXT,
  entity_type TEXT,
  entity_slug TEXT,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  payload_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Migration Notes

- Keep current `users`, `sessions`, `otp_challenges`, `wishlist_items`, and `audit_log`.
- Migrate `catalog_items` JSON into `collections`, `products`, and `product_images`.
- Move uploaded media to object storage before production scale.
- Keep admin APIs backward compatible during the migration window.
