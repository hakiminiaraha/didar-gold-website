import { config } from "../config.js";
import { db, recordAudit, transaction } from "../db.js";
import { maskMobile } from "../security.js";
import { HttpError } from "../http/http-error.js";
import { sendJson } from "../http/respond.js";
import { readJson } from "../http/body.js";
import { publicUser, requireAdmin } from "../middleware/auth.js";

export async function adminOverview({ request, response }) {
  const user = await requireAdmin(request);
  const now = Date.now();
  const dayAgo = now - 86_400_000;
  // The six counts span five tables and are independent — run them concurrently
  // (real parallelism on Postgres via the pool; a harmless no-op on synchronous SQLite).
  const [users, wishlistItems, activeSessions, verifiedToday, otpFailuresToday, newInquiries] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS count FROM users").get(),
    db.prepare("SELECT COUNT(*) AS count FROM wishlist_items").get(),
    db.prepare("SELECT COUNT(*) AS count FROM sessions WHERE expires_at > ?").get(now),
    db.prepare("SELECT COUNT(*) AS count FROM users WHERE mobile_verified_at >= ?").get(dayAgo),
    db.prepare("SELECT COUNT(*) AS count FROM audit_log WHERE event_type = 'auth.otp_failed' AND created_at >= ?").get(dayAgo),
    db.prepare("SELECT COUNT(*) AS count FROM inquiries WHERE status = 'new'").get(),
  ]);
  recordAudit({ userId: user.id, eventType: "admin.overview_viewed", targetType: "admin" });
  sendJson(response, 200, {
    users: users.count,
    wishlistItems: wishlistItems.count,
    activeSessions: activeSessions.count,
    verifiedToday: verifiedToday.count,
    otpFailuresToday: otpFailuresToday.count,
    newInquiries: newInquiries.count,
  });
}

export async function adminUsers({ request, response, url }) {
  await requireAdmin(request);
  const query = String(url.searchParams.get("query") || "").replace(/\D/g, "").slice(0, 11);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 20, 1), 50);
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);
  const where = query ? "WHERE users.mobile LIKE ?" : "";
  const params = query ? [`%${query}%`] : [];
  const total = (await db.prepare(`SELECT COUNT(*) AS count FROM users ${where}`).get(...params)).count;
  const users = (await db.prepare(`
    SELECT users.id, users.mobile, users.role, users.mobile_verified_at, users.created_at,
      COUNT(DISTINCT wishlist_items.creation_id) AS wishlist_count,
      COUNT(DISTINCT CASE WHEN sessions.expires_at > ? THEN sessions.id END) AS active_sessions
    FROM users
    LEFT JOIN wishlist_items ON wishlist_items.user_id = users.id
    LEFT JOIN sessions ON sessions.user_id = users.id
    ${where}
    GROUP BY users.id
    ORDER BY users.created_at DESC
    LIMIT ? OFFSET ?
  `).all(Date.now(), ...params, limit, offset)).map((user) => ({
    ...user,
    id: String(user.id),
    mobileMasked: maskMobile(user.mobile),
    mobile: undefined,
  }));
  sendJson(response, 200, { users, total, limit, offset });
}

export async function updateUserRole({ request, response }) {
  const actor = await requireAdmin(request);
  const body = await readJson(request);
  const userId = Number(body.userId);
  const role = String(body.role || "");
  if (!Number.isInteger(userId) || !new Set(["user", "support", "editor", "admin"]).has(role)) throw new HttpError(400, "INVALID_USER_ROLE");
  const target = await db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!target) throw new HttpError(404, "USER_NOT_FOUND");
  if (target.id === actor.id && role !== "admin") throw new HttpError(409, "CANNOT_DEMOTE_SELF");
  if (config.adminMobiles.has(target.mobile) && role !== "admin") throw new HttpError(409, "ROLE_MANAGED_BY_ENV");

  // The last-admin guard is a read-modify-write: without serialization two
  // concurrent demotions both read count=2 and commit, leaving zero admins.
  // Postgres (READ COMMITTED) needs an explicit row lock; SQLite's BEGIN IMMEDIATE
  // already serializes writers, so the same transaction is safe there.
  await transaction(async (tx) => {
    if (config.databaseProvider === "postgres") {
      await tx.prepare("SELECT id FROM users WHERE role = 'admin' FOR UPDATE").all();
    }
    const current = await tx.prepare("SELECT role FROM users WHERE id = ?").get(userId);
    if (current?.role === "admin" && role !== "admin") {
      const adminCount = (await tx.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").get()).count;
      if (adminCount <= 1) throw new HttpError(409, "LAST_ADMIN_REQUIRED");
    }
    await tx.prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ?").run(role, Date.now(), userId);
    if (target.id !== actor.id) await tx.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  });
  recordAudit({ userId: actor.id, eventType: "admin.user_role_updated", targetType: "user", targetId: String(userId), metadata: { from: target.role, to: role } });
  const updated = await db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  sendJson(response, 200, publicUser(updated));
}

export async function adminSessions({ request, response, url }) {
  await requireAdmin(request);
  const userId = Number(url.searchParams.get("userId"));
  if (!Number.isInteger(userId) || userId < 1) throw new HttpError(400, "INVALID_USER_ID");
  const sessions = (await db.prepare(`
    SELECT id, expires_at, created_at, last_seen_at, user_agent
    FROM sessions WHERE user_id = ? ORDER BY last_seen_at DESC
  `).all(userId)).map((session) => ({
    id: String(session.id), expiresAt: session.expires_at, createdAt: session.created_at,
    lastSeenAt: session.last_seen_at, userAgent: session.user_agent || "Unknown device",
  }));
  sendJson(response, 200, { sessions });
}

export async function revokeUserSessions({ request, response }) {
  const actor = await requireAdmin(request);
  const body = await readJson(request);
  const userId = Number(body.userId);
  if (!Number.isInteger(userId) || userId < 1) throw new HttpError(400, "INVALID_USER_ID");
  const target = await db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
  if (!target) throw new HttpError(404, "USER_NOT_FOUND");
  const result = userId === actor.id
    ? await db.prepare("DELETE FROM sessions WHERE user_id = ? AND id != ?").run(userId, actor.session_id)
    : await db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  recordAudit({ userId: actor.id, eventType: "admin.user_sessions_revoked", targetType: "user", targetId: String(userId), metadata: { count: result.changes } });
  sendJson(response, 200, { ok: true, revoked: result.changes });
}

export async function adminAudit({ request, response, url }) {
  await requireAdmin(request);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 30, 1), 100);
  // Keyset pagination on the indexed created_at: deep pages stay O(limit) instead
  // of degrading like OFFSET. `before` is the createdAt of the last row seen.
  const before = Number(url.searchParams.get("before")) || null;
  const where = before ? "WHERE audit_log.created_at < ?" : "";
  const params = before ? [before, limit] : [limit];
  const rows = await db.prepare(`
    SELECT audit_log.id, audit_log.event_type, audit_log.target_type, audit_log.target_id,
      audit_log.metadata_json, audit_log.created_at, users.mobile AS actor_mobile
    FROM audit_log
    LEFT JOIN users ON users.id = audit_log.actor_user_id
    ${where}
    ORDER BY audit_log.created_at DESC
    LIMIT ?
  `).all(...params);
  const events = rows.map((event) => ({
    id: String(event.id),
    eventType: event.event_type,
    targetType: event.target_type,
    targetId: event.target_id,
    metadata: event.metadata_json ? JSON.parse(event.metadata_json) : null,
    createdAt: event.created_at,
    actorMobileMasked: event.actor_mobile ? maskMobile(event.actor_mobile) : null,
  }));
  // Cursor for the next page; null when this page wasn't full (no more rows).
  const nextCursor = events.length === limit ? events[events.length - 1].createdAt : null;
  sendJson(response, 200, { events, nextCursor });
}

export async function adminSystem({ request, response }) {
  await requireAdmin(request);
  const now = Date.now();
  const expiredSessions = (await db.prepare("SELECT COUNT(*) AS count FROM sessions WHERE expires_at <= ?").get(now)).count;
  const pendingOtps = (await db.prepare("SELECT COUNT(*) AS count FROM otp_challenges WHERE consumed_at IS NULL AND expires_at > ?").get(now)).count;
  sendJson(response, 200, {
    api: "operational",
    database: "operational",
    databaseProvider: config.databaseProvider,
    otpProvider: config.otpProvider,
    pendingOtps,
    expiredSessions,
    timestamp: now,
  });
}
