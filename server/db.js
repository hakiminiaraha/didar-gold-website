import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import pg from "pg";

import { catalogSeed } from "./seeds/catalog.seed.js";
import { config } from "./config.js";
import { journalSeed } from "./seeds/journal.seed.js";

const { Pool, types } = pg;
types.setTypeParser(20, Number);

function postgresSql(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

class SqliteDatabase {
  constructor(databasePath) {
    if (databasePath !== ":memory:") fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    this.raw = new DatabaseSync(databasePath);
    this.provider = "sqlite";
  }

  async get(sql, params = []) { return this.raw.prepare(sql).get(...params); }
  async all(sql, params = []) { return this.raw.prepare(sql).all(...params); }
  async run(sql, params = []) {
    const result = this.raw.prepare(sql).run(...params);
    return { changes: result.changes, lastInsertRowid: Number(result.lastInsertRowid) };
  }
  async insert(sql, params = []) { return (await this.run(sql, params)).lastInsertRowid; }
  prepare(sql) {
    return {
      get: (...params) => this.get(sql, params),
      all: (...params) => this.all(sql, params),
      run: (...params) => this.run(sql, params),
    };
  }
  async exec(sql) { this.raw.exec(sql); }
  async transaction(callback) {
    this.raw.exec("BEGIN IMMEDIATE");
    try {
      const result = await callback(this);
      this.raw.exec("COMMIT");
      return result;
    } catch (error) {
      this.raw.exec("ROLLBACK");
      throw error;
    }
  }
  async close() { this.raw.close(); }
}

class PostgresDatabase {
  constructor(queryable, pool = null) {
    this.queryable = queryable;
    this.pool = pool || queryable;
    this.provider = "postgres";
  }

  async query(sql, params = []) { return this.queryable.query(postgresSql(sql), params); }
  async get(sql, params = []) { return (await this.query(sql, params)).rows[0]; }
  async all(sql, params = []) { return (await this.query(sql, params)).rows; }
  async run(sql, params = []) {
    const autoId = /^\s*INSERT\s+INTO\s+(users|sessions|audit_log|catalog_items|journal_articles|inquiries)\b/i.test(sql) && !/\bRETURNING\b/i.test(sql);
    const result = await this.query(autoId ? `${sql.trim().replace(/;$/, "")} RETURNING id` : sql, params);
    return { changes: result.rowCount, lastInsertRowid: autoId ? Number(result.rows[0]?.id) : undefined };
  }
  async insert(sql, params = []) {
    const result = await this.query(`${sql.trim().replace(/;$/, "")} RETURNING id`, params);
    return Number(result.rows[0].id);
  }
  prepare(sql) {
    return {
      get: (...params) => this.get(sql, params),
      all: (...params) => this.all(sql, params),
      run: (...params) => this.run(sql, params),
    };
  }
  async exec(sql) { await this.queryable.query(sql); }
  async transaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(new PostgresDatabase(client, this.pool));
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  async close() { await this.pool.end(); }
}

const sqliteSchema = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mobile TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'support', 'editor', 'admin')),
    mobile_verified_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS otp_challenges (
    id TEXT PRIMARY KEY, mobile TEXT NOT NULL, code_hash TEXT NOT NULL, expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0, consumed_at INTEGER, ip_hash TEXT NOT NULL, created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_otp_mobile_created ON otp_challenges (mobile, created_at DESC);
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL, user_agent TEXT, ip_hash TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions (expires_at);
  CREATE TABLE IF NOT EXISTS wishlist_items (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, creation_id TEXT NOT NULL,
    created_at INTEGER NOT NULL, PRIMARY KEY (user_id, creation_id)
  );
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT, actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, target_type TEXT, target_id TEXT, metadata_json TEXT, ip_hash TEXT, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS cms_content (
    route_path TEXT NOT NULL, locale TEXT NOT NULL CHECK (locale IN ('fa', 'en')), content_key TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'video', 'poster', 'link', 'alt')),
    value TEXT NOT NULL, updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL, updated_at INTEGER NOT NULL,
    PRIMARY KEY (route_path, locale, content_key, content_type)
  );
  CREATE INDEX IF NOT EXISTS idx_cms_route_locale ON cms_content (route_path, locale);
  CREATE TABLE IF NOT EXISTS media_assets (
    id TEXT PRIMARY KEY, file_name TEXT NOT NULL, public_url TEXT NOT NULL UNIQUE, mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL, created_by INTEGER REFERENCES users(id) ON DELETE SET NULL, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS catalog_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT, item_type TEXT NOT NULL CHECK (item_type IN ('product', 'collection')),
    slug TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    sort_order INTEGER NOT NULL DEFAULT 0, data_json TEXT NOT NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
    UNIQUE (item_type, slug)
  );
  CREATE INDEX IF NOT EXISTS idx_catalog_type_status_order ON catalog_items (item_type, status, sort_order);
  CREATE TABLE IF NOT EXISTS journal_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    sort_order INTEGER NOT NULL DEFAULT 0, featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
    category TEXT NOT NULL, pillar TEXT NOT NULL, image TEXT NOT NULL, date_label TEXT NOT NULL,
    read_label_json TEXT NOT NULL, content_json TEXT NOT NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_journal_status_order ON journal_articles (status, featured DESC, sort_order);
  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT, reference_code TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL CHECK (reason IN ('private', 'selection', 'service', 'general')),
    full_name TEXT NOT NULL, contact_value TEXT NOT NULL, preferred_channel TEXT NOT NULL,
    preferred_date TEXT, message TEXT, locale TEXT NOT NULL CHECK (locale IN ('fa', 'en')),
    source_path TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'closed')),
    internal_note TEXT, handled_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_hash TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_inquiries_status_created ON inquiries (status, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_inquiries_ip_created ON inquiries (ip_hash, created_at DESC);
`;

function migrateLegacySqlite(database) {
  const raw = database.raw;
  const userColumns = raw.prepare("PRAGMA table_info(users)").all().map((column) => column.name);
  const otpColumns = raw.prepare("PRAGMA table_info(otp_challenges)").all().map((column) => column.name);
  if (userColumns.includes("national_id_hash") || otpColumns.includes("national_id_hash")) {
    raw.exec("PRAGMA foreign_keys = OFF; BEGIN IMMEDIATE;");
    try {
      if (userColumns.includes("national_id_hash")) raw.exec(`
        CREATE TABLE users_next (id INTEGER PRIMARY KEY AUTOINCREMENT, mobile TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL DEFAULT 'user', mobile_verified_at INTEGER NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
        INSERT INTO users_next (id, mobile, role, mobile_verified_at, created_at, updated_at)
        SELECT id, mobile, role, mobile_verified_at, created_at, updated_at FROM users;
        DROP TABLE users; ALTER TABLE users_next RENAME TO users;
      `);
      if (otpColumns.includes("national_id_hash")) raw.exec(`
        CREATE TABLE otp_challenges_next (id TEXT PRIMARY KEY, mobile TEXT NOT NULL, code_hash TEXT NOT NULL,
          expires_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, consumed_at INTEGER,
          ip_hash TEXT NOT NULL, created_at INTEGER NOT NULL);
        INSERT INTO otp_challenges_next (id, mobile, code_hash, expires_at, attempts, consumed_at, ip_hash, created_at)
        SELECT id, mobile, code_hash, expires_at, attempts, consumed_at, ip_hash, created_at FROM otp_challenges;
        DROP TABLE otp_challenges; ALTER TABLE otp_challenges_next RENAME TO otp_challenges;
      `);
      raw.exec("COMMIT;");
    } catch (error) {
      raw.exec("ROLLBACK;");
      throw error;
    } finally {
      raw.exec("PRAGMA foreign_keys = ON;");
    }
  }

  const usersSql = raw.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'").get()?.sql || "";
  if (!usersSql.includes("'editor'") || !usersSql.includes("'support'")) {
    raw.exec("PRAGMA foreign_keys = OFF; BEGIN IMMEDIATE;");
    try {
      raw.exec(`
        CREATE TABLE users_roles_next (id INTEGER PRIMARY KEY AUTOINCREMENT, mobile TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'support', 'editor', 'admin')),
          mobile_verified_at INTEGER NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
        INSERT INTO users_roles_next (id, mobile, role, mobile_verified_at, created_at, updated_at)
        SELECT id, mobile, role, mobile_verified_at, created_at, updated_at FROM users;
        DROP TABLE users; ALTER TABLE users_roles_next RENAME TO users;
      `);
      raw.exec("COMMIT;");
    } catch (error) {
      raw.exec("ROLLBACK;");
      throw error;
    } finally {
      raw.exec("PRAGMA foreign_keys = ON;");
    }
  }

  const sessionColumns = raw.prepare("PRAGMA table_info(sessions)").all().map((column) => column.name);
  if (!sessionColumns.includes("user_agent")) raw.exec("ALTER TABLE sessions ADD COLUMN user_agent TEXT;");
  if (!sessionColumns.includes("ip_hash")) raw.exec("ALTER TABLE sessions ADD COLUMN ip_hash TEXT;");
  raw.exec("CREATE INDEX IF NOT EXISTS idx_otp_mobile_created ON otp_challenges (mobile, created_at DESC);");
}

async function createDatabase() {
  if (config.databaseProvider === "postgres") {
    const pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DATABASE_POOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    const database = new PostgresDatabase(pool);
    await database.exec(fs.readFileSync(new URL("./schema/postgres.sql", import.meta.url), "utf8"));
    return database;
  }

  const database = new SqliteDatabase(config.databasePath);
  await database.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  await database.exec(sqliteSchema);
  migrateLegacySqlite(database);
  return database;
}

export const db = await createDatabase();

if (config.databaseSeed && (await db.get("SELECT COUNT(*) AS count FROM catalog_items")).count === 0) {
  const now = Date.now();
  await db.transaction(async (tx) => {
    for (const item of catalogSeed) await tx.run(`
      INSERT INTO catalog_items (item_type, slug, status, sort_order, data_json, created_at, updated_at)
      VALUES (?, ?, 'published', ?, ?, ?, ?)
    `, [item.type, item.slug, item.sortOrder, JSON.stringify(item.data), now, now]);
  });
}

if (config.databaseSeed && (await db.get("SELECT COUNT(*) AS count FROM journal_articles")).count === 0) {
  const now = Date.now();
  await db.transaction(async (tx) => {
    for (const article of journalSeed) await tx.run(`
      INSERT INTO journal_articles (slug, status, sort_order, featured, category, pillar, image, date_label, read_label_json, content_json, created_at, updated_at)
      VALUES (?, 'published', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [article.slug, article.sortOrder, article.featured ? 1 : 0, article.category, article.pillar, article.image, article.dateLabel, JSON.stringify(article.readLabel), JSON.stringify(article.content), now, now]);
  });
}

export async function transaction(callback) {
  return db.transaction(callback);
}

export async function audit({ userId = null, eventType, targetType = null, targetId = null, metadata = null, ipHash = null }) {
  await db.run(`
    INSERT INTO audit_log (actor_user_id, event_type, target_type, target_id, metadata_json, ip_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [userId, eventType, targetType, targetId, metadata ? JSON.stringify(metadata) : null, ipHash, Date.now()]);
}
