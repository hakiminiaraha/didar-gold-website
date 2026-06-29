import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import pg from "pg";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL || "";
const sqlitePath = path.resolve(process.env.DATABASE_PATH || "server/data/didar.sqlite");
const includeAuthState = process.env.MIGRATE_AUTH_STATE === "true";

if (!databaseUrl) throw new Error("DATABASE_URL is required");
if (!fs.existsSync(sqlitePath)) throw new Error(`SQLite database not found: ${sqlitePath}`);

const tables = [
  { name: "users", columns: ["id", "mobile", "role", "mobile_verified_at", "created_at", "updated_at"] },
  ...(includeAuthState ? [
    { name: "otp_challenges", columns: ["id", "mobile", "code_hash", "expires_at", "attempts", "consumed_at", "ip_hash", "created_at"] },
    { name: "sessions", columns: ["id", "user_id", "token_hash", "expires_at", "created_at", "last_seen_at", "user_agent", "ip_hash"] },
  ] : []),
  { name: "wishlist_items", columns: ["user_id", "creation_id", "created_at"] },
  { name: "audit_log", columns: ["id", "actor_user_id", "event_type", "target_type", "target_id", "metadata_json", "ip_hash", "created_at"] },
  { name: "cms_content", columns: ["route_path", "locale", "content_key", "content_type", "value", "updated_by", "updated_at"] },
  { name: "media_assets", columns: ["id", "file_name", "public_url", "mime_type", "size_bytes", "created_by", "created_at"] },
  { name: "catalog_items", columns: ["id", "item_type", "slug", "status", "sort_order", "data_json", "updated_by", "created_at", "updated_at"] },
  { name: "journal_articles", columns: ["id", "slug", "status", "sort_order", "featured", "category", "pillar", "image", "date_label", "read_label_json", "content_json", "updated_by", "created_at", "updated_at"] },
  { name: "inquiries", columns: ["id", "reference_code", "reason", "full_name", "contact_value", "preferred_channel", "preferred_date", "message", "locale", "source_path", "status", "internal_note", "handled_by", "ip_hash", "created_at", "updated_at"] },
];

const serialTables = ["users", "sessions", "audit_log", "catalog_items", "journal_articles", "inquiries"];
const sqlite = new DatabaseSync(sqlitePath, { readOnly: true });
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  max: 1,
});
const client = await pool.connect();

try {
  await client.query(fs.readFileSync(new URL("../schema/postgres.sql", import.meta.url), "utf8"));
  const occupied = [];
  for (const { name } of tables) {
    const { rows } = await client.query(`SELECT COUNT(*)::int AS count FROM ${name}`);
    if (rows[0].count > 0) occupied.push(`${name}=${rows[0].count}`);
  }
  if (occupied.length) throw new Error(`PostgreSQL target must be empty (${occupied.join(", ")})`);

  await client.query("BEGIN");
  const migrated = {};
  for (const { name, columns } of tables) {
    const rows = sqlite.prepare(`SELECT ${columns.join(", ")} FROM ${name}`).all();
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
    const insert = `INSERT INTO ${name} (${columns.join(", ")}) VALUES (${placeholders})`;
    for (const row of rows) await client.query(insert, columns.map((column) => row[column]));
    migrated[name] = rows.length;
  }

  for (const table of serialTables) {
    if (!tables.some(({ name }) => name === table)) continue;
    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('${table}', 'id'),
        COALESCE((SELECT MAX(id) FROM ${table}), 1),
        EXISTS (SELECT 1 FROM ${table})
      )
    `);
  }

  for (const { name } of tables) {
    const { rows } = await client.query(`SELECT COUNT(*)::int AS count FROM ${name}`);
    if (rows[0].count !== migrated[name]) throw new Error(`Count mismatch for ${name}`);
  }
  await client.query("COMMIT");

  console.log("SQLite to PostgreSQL migration completed:");
  for (const [name, count] of Object.entries(migrated)) console.log(`- ${name}: ${count}`);
  if (!includeAuthState) console.log("- otp_challenges/sessions: intentionally skipped");
} catch (error) {
  try { await client.query("ROLLBACK"); } catch { /* transaction may not have started */ }
  throw error;
} finally {
  client.release();
  await pool.end();
  sqlite.close();
}
