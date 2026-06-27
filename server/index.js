import { randomInt } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

import { config } from "./config.js";
import { audit, db, transaction } from "./db.js";
import { sendOtp } from "./otpProvider.js";
import {
  clearSessionCookie,
  hashIp,
  hashSessionToken,
  hmac,
  maskMobile,
  parseCookies,
  randomToken,
  safeEqual,
  sessionCookie,
} from "./security.js";
import {
  isValidIranianMobile,
  normalizeMobile,
  normalizeOtp,
} from "./validation.js";

class HttpError extends Error {
  constructor(status, code, message = code, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function commonHeaders() {
  return {
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };
}

function sendJson(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    ...commonHeaders(),
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders,
  });
  response.end(JSON.stringify(body));
}

async function readJson(request, maxSize = 32 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxSize) throw new HttpError(413, "PAYLOAD_TOO_LARGE");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "INVALID_JSON");
  }
}

async function readBinary(request, maxSize = 50 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxSize) throw new HttpError(413, "MEDIA_TOO_LARGE");
    chunks.push(chunk);
  }
  if (!size) throw new HttpError(400, "EMPTY_MEDIA");
  return Buffer.concat(chunks);
}

function clientIp(request) {
  return request.socket.remoteAddress || "unknown";
}

function verifyOrigin(request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  const origin = request.headers.origin;
  const protocol = String(request.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  const sameOrigin = `${protocol}://${request.headers.host}`;
  if (origin && origin !== sameOrigin && !config.appOrigins.includes(origin)) throw new HttpError(403, "ORIGIN_NOT_ALLOWED");
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

function serveFrontend(request, response, url) {
  if (!config.isProduction || !["GET", "HEAD"].includes(request.method)) return false;
  const distRoot = path.resolve("dist");
  if (!fs.existsSync(path.join(distRoot, "index.html"))) return false;

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return false;
  }
  const relativePath = pathname.replace(/^\/+/, "");
  const requestedPath = path.resolve(distRoot, relativePath);
  const insideDist = requestedPath === distRoot || requestedPath.startsWith(`${distRoot}${path.sep}`);
  let filePath = insideDist && relativePath && fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()
    ? requestedPath
    : path.join(distRoot, "index.html");
  if (path.extname(relativePath) && filePath.endsWith("index.html")) return false;

  const extension = path.extname(filePath).toLowerCase();
  const immutable = filePath.includes(`${path.sep}assets${path.sep}`);
  response.writeHead(200, {
    "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    "Content-Type": mimeTypes[extension] || "application/octet-stream",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  if (request.method === "HEAD") response.end();
  else fs.createReadStream(filePath).pipe(response);
  return true;
}

function publicUser(user) {
  return {
    id: String(user.id),
    mobileMasked: maskMobile(user.mobile),
    role: user.role,
    permissions: permissionsForRole(user.role),
  };
}

const rolePermissions = {
  user: [],
  support: ["inquiries"],
  editor: ["content", "catalog", "journal", "media"],
  admin: ["admin", "content", "catalog", "journal", "media", "inquiries", "users", "audit", "system"],
};

function permissionsForRole(role) {
  return rolePermissions[role] || [];
}

async function getAuthenticatedUser(request) {
  const token = parseCookies(request.headers.cookie).didar_session;
  if (!token) return null;
  const now = Date.now();
  const tokenHash = hashSessionToken(token);
  const row = await db.prepare(`
    SELECT users.id, users.mobile, users.role, sessions.id AS session_id
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).get(tokenHash, now);
  if (!row) return null;
  await db.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?").run(now, row.session_id);
  return row;
}

async function requireUser(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) throw new HttpError(401, "AUTH_REQUIRED");
  return user;
}

async function requireAdmin(request) {
  const user = await requireUser(request);
  if (user.role !== "admin") throw new HttpError(403, "ADMIN_REQUIRED");
  return user;
}

async function requirePermission(request, permission) {
  const user = await requireUser(request);
  if (!permissionsForRole(user.role).includes(permission)) throw new HttpError(403, "PERMISSION_REQUIRED");
  return user;
}

async function requestOtp(request, response) {
  const body = await readJson(request);
  const mobile = normalizeMobile(body.mobile);
  if (!isValidIranianMobile(mobile)) throw new HttpError(400, "INVALID_MOBILE");

  const now = Date.now();
  const recent = await db.prepare("SELECT created_at FROM otp_challenges WHERE mobile = ? ORDER BY created_at DESC LIMIT 1").get(mobile);
  const cooldownMs = config.otpCooldownSeconds * 1000;
  if (recent && now - recent.created_at < cooldownMs) {
    const retryAfter = Math.ceil((cooldownMs - (now - recent.created_at)) / 1000);
    throw new HttpError(429, "OTP_COOLDOWN", "OTP_COOLDOWN", { retryAfter });
  }

  const challengeId = randomToken(18);
  const code = config.otpProvider === "console" && !config.isProduction
    ? "123456"
    : String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = hmac(`${challengeId}:${code}`, "otp");
  const ipHash = hashIp(clientIp(request));
  const expiresAt = now + config.otpTtlSeconds * 1000;

  await db.prepare(`
    INSERT INTO otp_challenges (id, mobile, code_hash, expires_at, ip_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(challengeId, mobile, codeHash, expiresAt, ipHash, now);

  try {
    await sendOtp({ mobile, code });
  } catch (error) {
    await db.prepare("DELETE FROM otp_challenges WHERE id = ?").run(challengeId);
    console.error("[didar:sms]", error.message);
    throw new HttpError(503, "OTP_DELIVERY_FAILED");
  }

  await audit({ eventType: "auth.otp_requested", targetType: "mobile", targetId: hmac(mobile, "mobile-audit").slice(0, 16), ipHash });
  sendJson(response, 200, {
    challengeId,
    mobile,
    expiresIn: config.otpTtlSeconds,
    ...(config.otpProvider === "console" && !config.isProduction ? { demoCode: code } : {}),
  });
}

async function verifyOtp(request, response) {
  const body = await readJson(request);
  const mobile = normalizeMobile(body.mobile);
  const challengeId = String(body.challengeId || "");
  const code = normalizeOtp(body.code);
  if (!isValidIranianMobile(mobile) || !challengeId || !/^\d{6}$/.test(code)) {
    throw new HttpError(400, "INVALID_OTP");
  }

  const now = Date.now();
  const challenge = await db.prepare("SELECT * FROM otp_challenges WHERE id = ? AND mobile = ?").get(challengeId, mobile);
  if (!challenge || challenge.consumed_at || challenge.expires_at <= now || challenge.attempts >= config.otpMaxAttempts) {
    throw new HttpError(400, "INVALID_OTP");
  }

  const expectedHash = hmac(`${challengeId}:${code}`, "otp");
  if (!safeEqual(challenge.code_hash, expectedHash)) {
    await db.prepare("UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = ?").run(challengeId);
    await audit({ eventType: "auth.otp_failed", targetType: "challenge", targetId: challengeId, ipHash: hashIp(clientIp(request)) });
    throw new HttpError(400, "INVALID_OTP");
  }

  const configuredRole = config.adminMobiles.has(mobile) ? "admin" : null;
  const user = await transaction(async (tx) => {
    const byMobile = await tx.prepare("SELECT * FROM users WHERE mobile = ?").get(mobile);
    let current = byMobile;
    if (!current) {
      const result = await tx.prepare(`
        INSERT INTO users (mobile, role, mobile_verified_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(mobile, configuredRole || "user", now, now, now);
      current = await tx.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    } else {
      await tx.prepare("UPDATE users SET role = ?, mobile_verified_at = ?, updated_at = ? WHERE id = ?").run(configuredRole || current.role, now, now, current.id);
      current = await tx.prepare("SELECT * FROM users WHERE id = ?").get(current.id);
    }
    await tx.prepare("UPDATE otp_challenges SET consumed_at = ? WHERE id = ?").run(now, challengeId);
    return current;
  });

  const token = randomToken(32);
  const sessionTtlSeconds = config.sessionTtlDays * 24 * 60 * 60;
  await db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
  await db.prepare(`
    INSERT INTO sessions (user_id, token_hash, expires_at, created_at, last_seen_at, user_agent, ip_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(user.id, hashSessionToken(token), now + sessionTtlSeconds * 1000, now, now, String(request.headers["user-agent"] || "").slice(0, 300), hashIp(clientIp(request)));

  await audit({ userId: user.id, eventType: "auth.login_succeeded", targetType: "session", ipHash: hashIp(clientIp(request)) });
  sendJson(response, 200, publicUser(user), { "Set-Cookie": sessionCookie(token, sessionTtlSeconds) });
}

async function logout(request, response) {
  const token = parseCookies(request.headers.cookie).didar_session;
  if (token) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashSessionToken(token));
  sendJson(response, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
}

async function getWishlist(request, response) {
  const user = await requireUser(request);
  const items = (await db.prepare("SELECT creation_id FROM wishlist_items WHERE user_id = ? ORDER BY created_at ASC").all(user.id)).map((row) => row.creation_id);
  sendJson(response, 200, { items });
}

async function replaceWishlist(request, response) {
  const user = await requireUser(request);
  const body = await readJson(request);
  if (!Array.isArray(body.items) || body.items.length > 100) throw new HttpError(400, "INVALID_WISHLIST");
  const items = [...new Set(body.items.map(String))];
  if (items.some((item) => !/^[a-z0-9-]{1,80}$/.test(item))) throw new HttpError(400, "INVALID_WISHLIST");
  const now = Date.now();
  await transaction(async (tx) => {
    await tx.prepare("DELETE FROM wishlist_items WHERE user_id = ?").run(user.id);
    const insert = tx.prepare("INSERT INTO wishlist_items (user_id, creation_id, created_at) VALUES (?, ?, ?)");
    for (const item of items) await insert.run(user.id, item, now);
  });
  await audit({ userId: user.id, eventType: "wishlist.replaced", targetType: "wishlist", metadata: { count: items.length }, ipHash: hashIp(clientIp(request)) });
  sendJson(response, 200, { items });
}

async function adminOverview(request, response) {
  const user = await requireAdmin(request);
  const users = (await db.prepare("SELECT COUNT(*) AS count FROM users").get()).count;
  const wishlistItems = (await db.prepare("SELECT COUNT(*) AS count FROM wishlist_items").get()).count;
  const activeSessions = (await db.prepare("SELECT COUNT(*) AS count FROM sessions WHERE expires_at > ?").get(Date.now())).count;
  await audit({ userId: user.id, eventType: "admin.overview_viewed", targetType: "admin" });
  const verifiedToday = (await db.prepare("SELECT COUNT(*) AS count FROM users WHERE mobile_verified_at >= ?").get(Date.now() - 86_400_000)).count;
  const otpFailuresToday = (await db.prepare("SELECT COUNT(*) AS count FROM audit_log WHERE event_type = 'auth.otp_failed' AND created_at >= ?").get(Date.now() - 86_400_000)).count;
  const newInquiries = (await db.prepare("SELECT COUNT(*) AS count FROM inquiries WHERE status = 'new'").get()).count;
  sendJson(response, 200, { users, wishlistItems, activeSessions, verifiedToday, otpFailuresToday, newInquiries });
}

async function adminUsers(request, response, url) {
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

async function updateUserRole(request, response) {
  const actor = await requireAdmin(request);
  const body = await readJson(request);
  const userId = Number(body.userId);
  const role = String(body.role || "");
  if (!Number.isInteger(userId) || !new Set(["user", "support", "editor", "admin"]).has(role)) throw new HttpError(400, "INVALID_USER_ROLE");
  const target = await db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!target) throw new HttpError(404, "USER_NOT_FOUND");
  if (target.id === actor.id && role !== "admin") throw new HttpError(409, "CANNOT_DEMOTE_SELF");
  if (config.adminMobiles.has(target.mobile) && role !== "admin") throw new HttpError(409, "ROLE_MANAGED_BY_ENV");
  if (target.role === "admin" && role !== "admin") {
    const adminCount = (await db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").get()).count;
    if (adminCount <= 1) throw new HttpError(409, "LAST_ADMIN_REQUIRED");
  }
  await db.prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ?").run(role, Date.now(), userId);
  if (target.id !== actor.id) await db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  await audit({ userId: actor.id, eventType: "admin.user_role_updated", targetType: "user", targetId: String(userId), metadata: { from: target.role, to: role } });
  const updated = await db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  sendJson(response, 200, publicUser(updated));
}

async function adminSessions(request, response, url) {
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

async function revokeUserSessions(request, response) {
  const actor = await requireAdmin(request);
  const body = await readJson(request);
  const userId = Number(body.userId);
  if (!Number.isInteger(userId) || userId < 1) throw new HttpError(400, "INVALID_USER_ID");
  const target = await db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
  if (!target) throw new HttpError(404, "USER_NOT_FOUND");
  const result = userId === actor.id
    ? await db.prepare("DELETE FROM sessions WHERE user_id = ? AND id != ?").run(userId, actor.session_id)
    : await db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  await audit({ userId: actor.id, eventType: "admin.user_sessions_revoked", targetType: "user", targetId: String(userId), metadata: { count: result.changes } });
  sendJson(response, 200, { ok: true, revoked: result.changes });
}

async function adminAudit(request, response, url) {
  await requireAdmin(request);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 30, 1), 100);
  const events = (await db.prepare(`
    SELECT audit_log.id, audit_log.event_type, audit_log.target_type, audit_log.target_id,
      audit_log.metadata_json, audit_log.created_at, users.mobile AS actor_mobile
    FROM audit_log
    LEFT JOIN users ON users.id = audit_log.actor_user_id
    ORDER BY audit_log.created_at DESC
    LIMIT ?
  `).all(limit)).map((event) => ({
    id: String(event.id),
    eventType: event.event_type,
    targetType: event.target_type,
    targetId: event.target_id,
    metadata: event.metadata_json ? JSON.parse(event.metadata_json) : null,
    createdAt: event.created_at,
    actorMobileMasked: event.actor_mobile ? maskMobile(event.actor_mobile) : null,
  }));
  sendJson(response, 200, { events });
}

async function adminSystem(request, response) {
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

function normalizeCmsRoute(value) {
  const routePath = String(value || "/").trim();
  if (!routePath.startsWith("/") || routePath.includes("..") || routePath.length > 160) throw new HttpError(400, "INVALID_CONTENT_ROUTE");
  return routePath === "/" ? routePath : routePath.replace(/\/$/, "");
}

async function getCmsContent(request, response, url, adminOnly = false) {
  if (adminOnly) await requirePermission(request, "content");
  const routePath = normalizeCmsRoute(url.searchParams.get("route"));
  const locale = url.searchParams.get("locale") === "en" ? "en" : "fa";
  const entries = await db.prepare(`
    SELECT content_key AS contentKey, content_type AS contentType, value, updated_at AS updatedAt
    FROM cms_content WHERE route_path = ? AND locale = ? ORDER BY content_key, content_type
  `).all(routePath, locale);
  sendJson(response, 200, { routePath, locale, entries });
}

async function saveCmsContent(request, response) {
  const user = await requirePermission(request, "content");
  const body = await readJson(request, 1024 * 1024);
  const routePath = normalizeCmsRoute(body.routePath);
  const locale = body.locale === "en" ? "en" : "fa";
  if (!Array.isArray(body.entries) || body.entries.length > 1000) throw new HttpError(400, "INVALID_CONTENT_ENTRIES");
  const allowedTypes = new Set(["text", "image", "video", "poster", "link", "alt"]);
  const entries = body.entries.map((entry) => {
    const contentKey = String(entry.contentKey || "").slice(0, 500);
    const contentType = String(entry.contentType || "");
    const value = String(entry.value ?? "");
    if (!contentKey || !allowedTypes.has(contentType) || value.length > 100_000) throw new HttpError(400, "INVALID_CONTENT_ENTRY");
    return { contentKey, contentType, value };
  });
  const now = Date.now();
  await transaction(async (tx) => {
    const upsert = tx.prepare(`
      INSERT INTO cms_content (route_path, locale, content_key, content_type, value, updated_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(route_path, locale, content_key, content_type)
      DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at
    `);
    for (const entry of entries) await upsert.run(routePath, locale, entry.contentKey, entry.contentType, entry.value, user.id, now);
  });
  await audit({ userId: user.id, eventType: "cms.content_published", targetType: "route", targetId: routePath, metadata: { locale, count: entries.length } });
  sendJson(response, 200, { ok: true, routePath, locale, count: entries.length, updatedAt: now });
}

async function deleteCmsEntry(request, response) {
  const user = await requirePermission(request, "content");
  const body = await readJson(request);
  const routePath = normalizeCmsRoute(body.routePath);
  const locale = body.locale === "en" ? "en" : "fa";
  const contentKey = String(body.contentKey || "");
  const contentType = String(body.contentType || "");
  if (!contentKey || !contentType) throw new HttpError(400, "INVALID_CONTENT_ENTRY");
  await db.prepare("DELETE FROM cms_content WHERE route_path = ? AND locale = ? AND content_key = ? AND content_type = ?").run(routePath, locale, contentKey, contentType);
  await audit({ userId: user.id, eventType: "cms.content_reset", targetType: "route", targetId: routePath, metadata: { locale, contentKey, contentType } });
  sendJson(response, 200, { ok: true });
}

async function listMedia(request, response) {
  await requirePermission(request, "media");
  const assets = await db.prepare(`
    SELECT id, file_name AS fileName, public_url AS publicUrl, mime_type AS mimeType,
      size_bytes AS sizeBytes, created_at AS createdAt
    FROM media_assets ORDER BY created_at DESC LIMIT 300
  `).all();
  sendJson(response, 200, { assets });
}

async function uploadMedia(request, response) {
  const user = await requirePermission(request, "media");
  const mimeType = String(request.headers["content-type"] || "").split(";")[0].toLowerCase();
  const allowed = new Map([
    ["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"],
    ["image/gif", ".gif"], ["video/mp4", ".mp4"], ["video/webm", ".webm"],
  ]);
  if (!allowed.has(mimeType)) throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE");
  const data = await readBinary(request);
  const id = randomToken(12);
  const extension = allowed.get(mimeType);
  const originalName = decodeURIComponent(String(request.headers["x-file-name"] || `media${extension}`)).replace(/[^a-zA-Z0-9._\u0600-\u06ff-]/g, "-").slice(0, 120);
  const diskName = `${Date.now()}-${id}${extension}`;
  const uploadDir = path.resolve("public", "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, diskName), data);
  const publicUrl = `/uploads/${diskName}`;
  await db.prepare(`
    INSERT INTO media_assets (id, file_name, public_url, mime_type, size_bytes, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, originalName, publicUrl, mimeType, data.length, user.id, Date.now());
  await audit({ userId: user.id, eventType: "cms.media_uploaded", targetType: "media", targetId: id, metadata: { mimeType, size: data.length } });
  sendJson(response, 201, { id, fileName: originalName, publicUrl, mimeType, sizeBytes: data.length });
}

function serializeCatalogItem(row) {
  return {
    id: String(row.id),
    type: row.item_type,
    slug: row.slug,
    status: row.status,
    sortOrder: row.sort_order,
    data: JSON.parse(row.data_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function catalogType(value) {
  if (!new Set(["product", "collection"]).has(value)) throw new HttpError(400, "INVALID_CATALOG_TYPE");
  return value;
}

function catalogSlug(value) {
  const slug = String(value || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(slug)) throw new HttpError(400, "INVALID_CATALOG_SLUG");
  return slug;
}

function catalogPayload(body) {
  const type = catalogType(body.type);
  const slug = catalogSlug(body.slug);
  const status = body.status === "published" ? "published" : "draft";
  const sortOrder = Math.max(-100_000, Math.min(100_000, Number(body.sortOrder) || 0));
  if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) throw new HttpError(400, "INVALID_CATALOG_DATA");
  const dataJson = JSON.stringify(body.data);
  if (dataJson.length > 200_000) throw new HttpError(413, "CATALOG_DATA_TOO_LARGE");
  return { type, slug, status, sortOrder, dataJson };
}

async function publicCatalog(request, response, url) {
  const type = catalogType(url.searchParams.get("type"));
  const slug = url.searchParams.get("slug");
  if (slug) {
    const row = await db.prepare("SELECT * FROM catalog_items WHERE item_type = ? AND slug = ? AND status = 'published'").get(type, catalogSlug(slug));
    if (!row) throw new HttpError(404, "CATALOG_ITEM_NOT_FOUND");
    return sendJson(response, 200, serializeCatalogItem(row));
  }
  const items = (await db.prepare("SELECT * FROM catalog_items WHERE item_type = ? AND status = 'published' ORDER BY sort_order, created_at").all(type)).map(serializeCatalogItem);
  sendJson(response, 200, { items });
}

async function adminCatalog(request, response, url) {
  await requirePermission(request, "catalog");
  const typeValue = url.searchParams.get("type");
  const rows = typeValue
    ? await db.prepare("SELECT * FROM catalog_items WHERE item_type = ? ORDER BY sort_order, created_at").all(catalogType(typeValue))
    : await db.prepare("SELECT * FROM catalog_items ORDER BY item_type, sort_order, created_at").all();
  sendJson(response, 200, { items: rows.map(serializeCatalogItem) });
}

async function createCatalogItem(request, response) {
  const user = await requirePermission(request, "catalog");
  const payload = catalogPayload(await readJson(request, 256 * 1024));
  const now = Date.now();
  try {
    const result = await db.prepare(`
      INSERT INTO catalog_items (item_type, slug, status, sort_order, data_json, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(payload.type, payload.slug, payload.status, payload.sortOrder, payload.dataJson, user.id, now, now);
    const item = await db.prepare("SELECT * FROM catalog_items WHERE id = ?").get(result.lastInsertRowid);
    await audit({ userId: user.id, eventType: "catalog.item_created", targetType: payload.type, targetId: payload.slug });
    sendJson(response, 201, serializeCatalogItem(item));
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) throw new HttpError(409, "CATALOG_SLUG_EXISTS");
    throw error;
  }
}

async function updateCatalogItem(request, response) {
  const user = await requirePermission(request, "catalog");
  const body = await readJson(request, 256 * 1024);
  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, "INVALID_CATALOG_ID");
  const payload = catalogPayload(body);
  try {
    const result = await db.prepare(`
      UPDATE catalog_items SET item_type = ?, slug = ?, status = ?, sort_order = ?, data_json = ?, updated_by = ?, updated_at = ?
      WHERE id = ?
    `).run(payload.type, payload.slug, payload.status, payload.sortOrder, payload.dataJson, user.id, Date.now(), id);
    if (!result.changes) throw new HttpError(404, "CATALOG_ITEM_NOT_FOUND");
    const item = await db.prepare("SELECT * FROM catalog_items WHERE id = ?").get(id);
    await audit({ userId: user.id, eventType: "catalog.item_updated", targetType: payload.type, targetId: payload.slug, metadata: { status: payload.status } });
    sendJson(response, 200, serializeCatalogItem(item));
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) throw new HttpError(409, "CATALOG_SLUG_EXISTS");
    throw error;
  }
}

async function deleteCatalogItem(request, response) {
  const user = await requirePermission(request, "catalog");
  const body = await readJson(request);
  const id = Number(body.id);
  const item = await db.prepare("SELECT * FROM catalog_items WHERE id = ?").get(id);
  if (!item) throw new HttpError(404, "CATALOG_ITEM_NOT_FOUND");
  await db.prepare("DELETE FROM catalog_items WHERE id = ?").run(id);
  await audit({ userId: user.id, eventType: "catalog.item_deleted", targetType: item.item_type, targetId: item.slug });
  sendJson(response, 200, { ok: true });
}

function serializeArticle(row) {
  return {
    id: String(row.id), slug: row.slug, status: row.status, sortOrder: row.sort_order,
    featured: Boolean(row.featured), category: row.category, pillar: row.pillar, image: row.image,
    dateLabel: row.date_label, readLabel: JSON.parse(row.read_label_json), content: JSON.parse(row.content_json),
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function articlePayload(body) {
  const slug = catalogSlug(body.slug);
  const status = body.status === "published" ? "published" : "draft";
  const sortOrder = Math.max(-100_000, Math.min(100_000, Number(body.sortOrder) || 0));
  const category = String(body.category || "culture").slice(0, 50);
  const pillar = String(body.pillar || "Journal").slice(0, 100);
  const image = String(body.image || "").slice(0, 500);
  const dateLabel = String(body.dateLabel || "").slice(0, 50);
  const readLabel = body.readLabel && typeof body.readLabel === "object" ? body.readLabel : { fa: "", en: "" };
  const content = body.content;
  if (!content || typeof content !== "object" || !content.fa || !content.en) throw new HttpError(400, "INVALID_ARTICLE_CONTENT");
  const readLabelJson = JSON.stringify(readLabel);
  const contentJson = JSON.stringify(content);
  if (contentJson.length > 500_000) throw new HttpError(413, "ARTICLE_TOO_LARGE");
  return { slug, status, sortOrder, featured: body.featured ? 1 : 0, category, pillar, image, dateLabel, readLabelJson, contentJson };
}

async function publicJournal(request, response, url) {
  const slug = url.searchParams.get("slug");
  if (slug) {
    const row = await db.prepare("SELECT * FROM journal_articles WHERE slug = ? AND status = 'published'").get(catalogSlug(slug));
    if (!row) throw new HttpError(404, "ARTICLE_NOT_FOUND");
    return sendJson(response, 200, serializeArticle(row));
  }
  const articles = (await db.prepare("SELECT * FROM journal_articles WHERE status = 'published' ORDER BY featured DESC, sort_order, created_at").all()).map(serializeArticle);
  sendJson(response, 200, { articles });
}

async function adminJournal(request, response) {
  await requirePermission(request, "journal");
  const articles = (await db.prepare("SELECT * FROM journal_articles ORDER BY featured DESC, sort_order, created_at").all()).map(serializeArticle);
  sendJson(response, 200, { articles });
}

async function createArticle(request, response) {
  const user = await requirePermission(request, "journal");
  const payload = articlePayload(await readJson(request, 600 * 1024));
  const now = Date.now();
  try {
    const result = await db.prepare(`
      INSERT INTO journal_articles (slug, status, sort_order, featured, category, pillar, image, date_label, read_label_json, content_json, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(payload.slug, payload.status, payload.sortOrder, payload.featured, payload.category, payload.pillar, payload.image, payload.dateLabel, payload.readLabelJson, payload.contentJson, user.id, now, now);
    const article = await db.prepare("SELECT * FROM journal_articles WHERE id = ?").get(result.lastInsertRowid);
    await audit({ userId: user.id, eventType: "journal.article_created", targetType: "article", targetId: payload.slug });
    sendJson(response, 201, serializeArticle(article));
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) throw new HttpError(409, "ARTICLE_SLUG_EXISTS");
    throw error;
  }
}

async function updateArticle(request, response) {
  const user = await requirePermission(request, "journal");
  const body = await readJson(request, 600 * 1024);
  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, "INVALID_ARTICLE_ID");
  const payload = articlePayload(body);
  try {
    const result = await db.prepare(`
      UPDATE journal_articles SET slug = ?, status = ?, sort_order = ?, featured = ?, category = ?, pillar = ?, image = ?, date_label = ?, read_label_json = ?, content_json = ?, updated_by = ?, updated_at = ?
      WHERE id = ?
    `).run(payload.slug, payload.status, payload.sortOrder, payload.featured, payload.category, payload.pillar, payload.image, payload.dateLabel, payload.readLabelJson, payload.contentJson, user.id, Date.now(), id);
    if (!result.changes) throw new HttpError(404, "ARTICLE_NOT_FOUND");
    const article = await db.prepare("SELECT * FROM journal_articles WHERE id = ?").get(id);
    await audit({ userId: user.id, eventType: "journal.article_updated", targetType: "article", targetId: payload.slug, metadata: { status: payload.status } });
    sendJson(response, 200, serializeArticle(article));
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) throw new HttpError(409, "ARTICLE_SLUG_EXISTS");
    throw error;
  }
}

async function deleteArticle(request, response) {
  const user = await requirePermission(request, "journal");
  const body = await readJson(request);
  const article = await db.prepare("SELECT * FROM journal_articles WHERE id = ?").get(Number(body.id));
  if (!article) throw new HttpError(404, "ARTICLE_NOT_FOUND");
  await db.prepare("DELETE FROM journal_articles WHERE id = ?").run(article.id);
  await audit({ userId: user.id, eventType: "journal.article_deleted", targetType: "article", targetId: article.slug });
  sendJson(response, 200, { ok: true });
}

function serializeInquiry(row) {
  return {
    id: String(row.id), referenceCode: row.reference_code, reason: row.reason, fullName: row.full_name,
    contact: row.contact_value, preferredChannel: row.preferred_channel, preferredDate: row.preferred_date,
    message: row.message, locale: row.locale, sourcePath: row.source_path, status: row.status,
    internalNote: row.internal_note || "", createdAt: row.created_at, updatedAt: row.updated_at,
    handledBy: row.handled_by ? String(row.handled_by) : null,
  };
}

async function createInquiry(request, response) {
  const body = await readJson(request, 64 * 1024);
  const reason = new Set(["private", "selection", "service", "general"]).has(body.reason) ? body.reason : "general";
  const fullName = String(body.name || "").trim().slice(0, 120);
  const contact = String(body.contact || "").trim().slice(0, 160);
  const preferredChannel = String(body.channel || "").trim().slice(0, 80);
  const preferredDate = String(body.date || "").trim().slice(0, 20) || null;
  const message = String(body.message || "").trim().slice(0, 3000) || null;
  const locale = body.locale === "en" ? "en" : "fa";
  if (fullName.length < 2 || contact.length < 5 || !preferredChannel) throw new HttpError(400, "INVALID_INQUIRY");
  if (preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) throw new HttpError(400, "INVALID_INQUIRY_DATE");
  const ipHash = hashIp(clientIp(request));
  const recentCount = (await db.prepare("SELECT COUNT(*) AS count FROM inquiries WHERE ip_hash = ? AND created_at >= ?").get(ipHash, Date.now() - 10 * 60 * 1000)).count;
  if (recentCount >= 5) throw new HttpError(429, "INQUIRY_RATE_LIMIT");
  const now = Date.now();
  const referenceCode = `DIDAR-${now.toString(36).toUpperCase()}-${randomToken(4).toUpperCase()}`;
  const result = await db.prepare(`
    INSERT INTO inquiries (reference_code, reason, full_name, contact_value, preferred_channel, preferred_date, message, locale, source_path, ip_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(referenceCode, reason, fullName, contact, preferredChannel, preferredDate, message, locale, "/contact", ipHash, now, now);
  await audit({ eventType: "inquiry.created", targetType: "inquiry", targetId: String(result.lastInsertRowid), metadata: { reason, locale }, ipHash });
  sendJson(response, 201, { ok: true, referenceCode, status: "new" });
}

async function adminInquiries(request, response, url) {
  await requirePermission(request, "inquiries");
  const status = url.searchParams.get("status");
  const query = String(url.searchParams.get("query") || "").trim().slice(0, 100);
  const conditions = [];
  const params = [];
  if (status && new Set(["new", "contacted", "scheduled", "closed"]).has(status)) { conditions.push("status = ?"); params.push(status); }
  if (query) { conditions.push("(full_name LIKE ? OR contact_value LIKE ? OR reference_code LIKE ?)"); params.push(`%${query}%`, `%${query}%`, `%${query}%`); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await db.prepare(`SELECT * FROM inquiries ${where} ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 WHEN 'scheduled' THEN 2 ELSE 3 END, created_at DESC LIMIT 200`).all(...params);
  const counts = Object.fromEntries((await db.prepare("SELECT status, COUNT(*) AS count FROM inquiries GROUP BY status").all()).map((row) => [row.status, row.count]));
  sendJson(response, 200, { inquiries: rows.map(serializeInquiry), counts });
}

async function updateInquiry(request, response) {
  const user = await requirePermission(request, "inquiries");
  const body = await readJson(request, 64 * 1024);
  const id = Number(body.id);
  const status = String(body.status || "");
  const internalNote = String(body.internalNote || "").trim().slice(0, 5000);
  if (!Number.isInteger(id) || !new Set(["new", "contacted", "scheduled", "closed"]).has(status)) throw new HttpError(400, "INVALID_INQUIRY_UPDATE");
  const result = await db.prepare("UPDATE inquiries SET status = ?, internal_note = ?, handled_by = ?, updated_at = ? WHERE id = ?").run(status, internalNote, user.id, Date.now(), id);
  if (!result.changes) throw new HttpError(404, "INQUIRY_NOT_FOUND");
  const inquiry = await db.prepare("SELECT * FROM inquiries WHERE id = ?").get(id);
  await audit({ userId: user.id, eventType: "inquiry.status_updated", targetType: "inquiry", targetId: String(id), metadata: { status } });
  sendJson(response, 200, serializeInquiry(inquiry));
}

const server = http.createServer(async (request, response) => {
  try {
    verifyOrigin(request);
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    const route = `${request.method} ${url.pathname}`;

    if (route === "GET /api/health") return sendJson(response, 200, { ok: true, service: "didar-api" });
    if (route === "POST /api/auth/request-otp") return await requestOtp(request, response);
    if (route === "POST /api/auth/verify-otp") return await verifyOtp(request, response);
    if (route === "POST /api/auth/logout") return await logout(request, response);
    if (route === "GET /api/auth/me") {
      const user = await getAuthenticatedUser(request);
      return sendJson(response, 200, user ? publicUser(user) : null);
    }
    if (route === "GET /api/wishlist") return await getWishlist(request, response);
    if (route === "PUT /api/wishlist") return await replaceWishlist(request, response);
    if (route === "GET /api/admin/overview") return await adminOverview(request, response);
    if (route === "GET /api/admin/users") return await adminUsers(request, response, url);
    if (route === "PUT /api/admin/users/role") return await updateUserRole(request, response);
    if (route === "GET /api/admin/sessions") return await adminSessions(request, response, url);
    if (route === "DELETE /api/admin/sessions") return await revokeUserSessions(request, response);
    if (route === "GET /api/admin/audit") return await adminAudit(request, response, url);
    if (route === "GET /api/admin/system") return await adminSystem(request, response);
    if (route === "GET /api/content") return await getCmsContent(request, response, url);
    if (route === "GET /api/admin/content") return await getCmsContent(request, response, url, true);
    if (route === "PUT /api/admin/content") return await saveCmsContent(request, response);
    if (route === "DELETE /api/admin/content") return await deleteCmsEntry(request, response);
    if (route === "GET /api/admin/media") return await listMedia(request, response);
    if (route === "POST /api/admin/media") return await uploadMedia(request, response);
    if (route === "GET /api/catalog") return await publicCatalog(request, response, url);
    if (route === "GET /api/admin/catalog") return await adminCatalog(request, response, url);
    if (route === "POST /api/admin/catalog") return await createCatalogItem(request, response);
    if (route === "PUT /api/admin/catalog") return await updateCatalogItem(request, response);
    if (route === "DELETE /api/admin/catalog") return await deleteCatalogItem(request, response);
    if (route === "GET /api/journal") return await publicJournal(request, response, url);
    if (route === "GET /api/admin/journal") return await adminJournal(request, response);
    if (route === "POST /api/admin/journal") return await createArticle(request, response);
    if (route === "PUT /api/admin/journal") return await updateArticle(request, response);
    if (route === "DELETE /api/admin/journal") return await deleteArticle(request, response);
    if (route === "POST /api/inquiries") return await createInquiry(request, response);
    if (route === "GET /api/admin/inquiries") return await adminInquiries(request, response, url);
    if (route === "PUT /api/admin/inquiries") return await updateInquiry(request, response);

    if (!url.pathname.startsWith("/api/") && serveFrontend(request, response, url)) return;

    throw new HttpError(404, "NOT_FOUND");
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    if (status === 500) console.error("[didar:api]", error);
    sendJson(response, status, {
      error: error instanceof HttpError ? error.code : "INTERNAL_ERROR",
      message: error instanceof HttpError ? error.message : "Internal server error",
      ...(error instanceof HttpError && error.details ? { details: error.details } : {}),
    });
  }
});

server.listen(config.port, config.host, () => {
  console.log(`[didar:api] listening on http://${config.host}:${config.port}`);
  if (!config.isProduction && config.otpProvider === "console") {
    console.log("[didar:api] development OTP provider active; code is 123456");
  }
});

export { server };
