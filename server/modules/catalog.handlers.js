import { db, isUniqueViolation, recordAudit } from "../db.js";
import { validateSlug } from "../validation.js";
import { HttpError } from "../http/http-error.js";
import { sendJson } from "../http/respond.js";
import { readJson } from "../http/body.js";
import { requirePermission } from "../middleware/auth.js";

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

function catalogPayload(body) {
  const type = catalogType(body.type);
  const slug = validateSlug(body.slug);
  const status = body.status === "published" ? "published" : "draft";
  const sortOrder = Math.max(-100_000, Math.min(100_000, Number(body.sortOrder) || 0));
  if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) throw new HttpError(400, "INVALID_CATALOG_DATA");
  const dataJson = JSON.stringify(body.data);
  if (dataJson.length > 200_000) throw new HttpError(413, "CATALOG_DATA_TOO_LARGE");
  return { type, slug, status, sortOrder, dataJson };
}

export async function publicCatalog({ response, url }) {
  const type = catalogType(url.searchParams.get("type"));
  const slug = url.searchParams.get("slug");
  if (slug) {
    const row = await db.prepare("SELECT * FROM catalog_items WHERE item_type = ? AND slug = ? AND status = 'published'").get(type, validateSlug(slug));
    if (!row) throw new HttpError(404, "CATALOG_ITEM_NOT_FOUND");
    return sendJson(response, 200, serializeCatalogItem(row));
  }
  const items = (await db.prepare("SELECT * FROM catalog_items WHERE item_type = ? AND status = 'published' ORDER BY sort_order, created_at").all(type)).map(serializeCatalogItem);
  sendJson(response, 200, { items });
}

export async function adminCatalog({ request, response, url }) {
  await requirePermission(request, "catalog");
  const typeValue = url.searchParams.get("type");
  const rows = typeValue
    ? await db.prepare("SELECT * FROM catalog_items WHERE item_type = ? ORDER BY sort_order, created_at").all(catalogType(typeValue))
    : await db.prepare("SELECT * FROM catalog_items ORDER BY item_type, sort_order, created_at").all();
  sendJson(response, 200, { items: rows.map(serializeCatalogItem) });
}

export async function createCatalogItem({ request, response }) {
  const user = await requirePermission(request, "catalog");
  const payload = catalogPayload(await readJson(request, 256 * 1024));
  const now = Date.now();
  try {
    const result = await db.prepare(`
      INSERT INTO catalog_items (item_type, slug, status, sort_order, data_json, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(payload.type, payload.slug, payload.status, payload.sortOrder, payload.dataJson, user.id, now, now);
    const item = await db.prepare("SELECT * FROM catalog_items WHERE id = ?").get(result.lastInsertRowid);
    recordAudit({ userId: user.id, eventType: "catalog.item_created", targetType: payload.type, targetId: payload.slug });
    sendJson(response, 201, serializeCatalogItem(item));
  } catch (error) {
    if (isUniqueViolation(error)) throw new HttpError(409, "CATALOG_SLUG_EXISTS");
    throw error;
  }
}

export async function updateCatalogItem({ request, response }) {
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
    recordAudit({ userId: user.id, eventType: "catalog.item_updated", targetType: payload.type, targetId: payload.slug, metadata: { status: payload.status } });
    sendJson(response, 200, serializeCatalogItem(item));
  } catch (error) {
    if (isUniqueViolation(error)) throw new HttpError(409, "CATALOG_SLUG_EXISTS");
    throw error;
  }
}

export async function deleteCatalogItem({ request, response }) {
  const user = await requirePermission(request, "catalog");
  const body = await readJson(request);
  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, "INVALID_CATALOG_ID");
  const item = await db.prepare("SELECT * FROM catalog_items WHERE id = ?").get(id);
  if (!item) throw new HttpError(404, "CATALOG_ITEM_NOT_FOUND");
  await db.prepare("DELETE FROM catalog_items WHERE id = ?").run(id);
  recordAudit({ userId: user.id, eventType: "catalog.item_deleted", targetType: item.item_type, targetId: item.slug });
  sendJson(response, 200, { ok: true });
}
