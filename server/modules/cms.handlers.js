import { db, recordAudit, transaction } from "../db.js";
import { HttpError } from "../http/http-error.js";
import { sendJson } from "../http/respond.js";
import { readJson } from "../http/body.js";
import { requirePermission } from "../middleware/auth.js";

function normalizeCmsRoute(value) {
  const routePath = String(value || "/").trim();
  if (!routePath.startsWith("/") || routePath.includes("..") || routePath.length > 160) throw new HttpError(400, "INVALID_CONTENT_ROUTE");
  return routePath === "/" ? routePath : routePath.replace(/\/$/, "");
}

export async function getCmsContent({ request, response, url }, adminOnly = false) {
  if (adminOnly) await requirePermission(request, "content");
  const routePath = normalizeCmsRoute(url.searchParams.get("route"));
  const locale = url.searchParams.get("locale") === "en" ? "en" : "fa";
  const entries = await db.prepare(`
    SELECT content_key AS contentKey, content_type AS contentType, value, updated_at AS updatedAt
    FROM cms_content WHERE route_path = ? AND locale = ? ORDER BY content_key, content_type
  `).all(routePath, locale);
  sendJson(response, 200, { routePath, locale, entries });
}

export async function saveCmsContent({ request, response }) {
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
  recordAudit({ userId: user.id, eventType: "cms.content_published", targetType: "route", targetId: routePath, metadata: { locale, count: entries.length } });
  sendJson(response, 200, { ok: true, routePath, locale, count: entries.length, updatedAt: now });
}

export async function deleteCmsEntry({ request, response }) {
  const user = await requirePermission(request, "content");
  const body = await readJson(request);
  const routePath = normalizeCmsRoute(body.routePath);
  const locale = body.locale === "en" ? "en" : "fa";
  const contentKey = String(body.contentKey || "");
  const contentType = String(body.contentType || "");
  if (!contentKey || !contentType) throw new HttpError(400, "INVALID_CONTENT_ENTRY");
  await db.prepare("DELETE FROM cms_content WHERE route_path = ? AND locale = ? AND content_key = ? AND content_type = ?").run(routePath, locale, contentKey, contentType);
  recordAudit({ userId: user.id, eventType: "cms.content_reset", targetType: "route", targetId: routePath, metadata: { locale, contentKey, contentType } });
  sendJson(response, 200, { ok: true });
}
