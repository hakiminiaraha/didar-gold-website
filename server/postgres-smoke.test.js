import assert from "node:assert/strict";
import test from "node:test";

const testDatabaseUrl = process.env.TEST_DATABASE_URL || "";

test("PostgreSQL adapter supports schema, transactions, and cascades", { skip: !testDatabaseUrl }, async () => {
  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.DATABASE_SSL = process.env.TEST_DATABASE_SSL || "false";

  const { db } = await import(`./db.js?postgres-smoke=${Date.now()}`);
  const mobile = `0912${String(Date.now()).slice(-7)}`;
  const now = Date.now();

  try {
    const userId = await db.insert(`
      INSERT INTO users (mobile, role, mobile_verified_at, created_at, updated_at)
      VALUES (?, 'user', ?, ?, ?)
    `, [mobile, now, now, now]);
    assert.ok(userId > 0);

    await db.transaction(async (tx) => {
      await tx.run("INSERT INTO wishlist_items (user_id, creation_id, created_at) VALUES (?, ?, ?)", [userId, "postgres-smoke", now]);
    });
    assert.equal((await db.get("SELECT COUNT(*) AS count FROM wishlist_items WHERE user_id = ?", [userId])).count, 1);

    await db.run("DELETE FROM users WHERE id = ?", [userId]);
    assert.equal((await db.get("SELECT COUNT(*) AS count FROM wishlist_items WHERE user_id = ?", [userId])).count, 0);
  } finally {
    await db.run("DELETE FROM users WHERE mobile = ?", [mobile]);
    await db.close();
  }
});
