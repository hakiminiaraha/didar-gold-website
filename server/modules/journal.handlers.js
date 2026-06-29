import { audit, db } from "../db.js";
import { validateSlug } from "../validation.js";
import { HttpError } from "../http/http-error.js";
import { sendJson } from "../http/respond.js";
import { readJson } from "../http/body.js";
import { requirePermission } from "../middleware/auth.js";

function serializeArticle(row) {
  return {
    id: String(row.id), slug: row.slug, status: row.status, sortOrder: row.sort_order,
    featured: Boolean(row.featured), category: row.category, pillar: row.pillar, image: row.image,
    dateLabel: row.date_label, readLabel: JSON.parse(row.read_label_json), content: JSON.parse(row.content_json),
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function articlePayload(body) {
  const slug = validateSlug(body.slug);
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

export async function publicJournal({ request, response, url }) {
  const slug = url.searchParams.get("slug");
  if (slug) {
    const row = await db.prepare("SELECT * FROM journal_articles WHERE slug = ? AND status = 'published'").get(validateSlug(slug));
    if (!row) throw new HttpError(404, "ARTICLE_NOT_FOUND");
    return sendJson(response, 200, serializeArticle(row));
  }
  const articles = (await db.prepare("SELECT * FROM journal_articles WHERE status = 'published' ORDER BY featured DESC, sort_order, created_at").all()).map(serializeArticle);
  sendJson(response, 200, { articles });
}

export async function adminJournal({ request, response }) {
  await requirePermission(request, "journal");
  const articles = (await db.prepare("SELECT * FROM journal_articles ORDER BY featured DESC, sort_order, created_at").all()).map(serializeArticle);
  sendJson(response, 200, { articles });
}

export async function createArticle({ request, response }) {
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

export async function updateArticle({ request, response }) {
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

export async function deleteArticle({ request, response }) {
  const user = await requirePermission(request, "journal");
  const body = await readJson(request);
  const article = await db.prepare("SELECT * FROM journal_articles WHERE id = ?").get(Number(body.id));
  if (!article) throw new HttpError(404, "ARTICLE_NOT_FOUND");
  await db.prepare("DELETE FROM journal_articles WHERE id = ?").run(article.id);
  await audit({ userId: user.id, eventType: "journal.article_deleted", targetType: "article", targetId: article.slug });
  sendJson(response, 200, { ok: true });
}
