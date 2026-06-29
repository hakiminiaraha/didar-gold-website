import { db } from "../db.js";
import { hashSessionToken, maskMobile, parseCookies } from "../security.js";
import { HttpError } from "../http/http-error.js";

const rolePermissions = {
  user: [],
  support: ["inquiries"],
  editor: ["content", "catalog", "journal", "media"],
  admin: ["admin", "content", "catalog", "journal", "media", "inquiries", "users", "audit", "system"],
};

export function permissionsForRole(role) {
  return rolePermissions[role] || [];
}

export function publicUser(user) {
  return {
    id: String(user.id),
    mobileMasked: maskMobile(user.mobile),
    role: user.role,
    permissions: permissionsForRole(user.role),
  };
}

export async function getAuthenticatedUser(request) {
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

export async function requireUser(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) throw new HttpError(401, "AUTH_REQUIRED");
  return user;
}

export async function requireAdmin(request) {
  const user = await requireUser(request);
  if (user.role !== "admin") throw new HttpError(403, "ADMIN_REQUIRED");
  return user;
}

export async function requirePermission(request, permission) {
  const user = await requireUser(request);
  if (!permissionsForRole(user.role).includes(permission)) throw new HttpError(403, "PERMISSION_REQUIRED");
  return user;
}
