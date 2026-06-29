import { audit, db } from "../db.js";
import { hashIp, randomToken } from "../security.js";
import { HttpError } from "../http/http-error.js";
import { sendJson } from "../http/respond.js";
import { readJson } from "../http/body.js";
import { clientIp } from "../http/request.js";
import { requirePermission } from "../middleware/auth.js";

function serializeInquiry(row) {
  return {
    id: String(row.id), referenceCode: row.reference_code, reason: row.reason, fullName: row.full_name,
    contact: row.contact_value, preferredChannel: row.preferred_channel, preferredDate: row.preferred_date,
    message: row.message, locale: row.locale, sourcePath: row.source_path, status: row.status,
    internalNote: row.internal_note || "", createdAt: row.created_at, updatedAt: row.updated_at,
    handledBy: row.handled_by ? String(row.handled_by) : null,
  };
}

export async function createInquiry({ request, response }) {
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

export async function adminInquiries({ request, response, url }) {
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

export async function updateInquiry({ request, response }) {
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
