import fs from "node:fs";
import path from "node:path";

import { config } from "../config.js";
import { db, recordAudit } from "../db.js";
import { randomToken } from "../security.js";
import { HttpError } from "../http/http-error.js";
import { sendJson } from "../http/respond.js";
import { readBinary } from "../http/body.js";
import { detectMediaType } from "../http/request.js";
import { requirePermission } from "../middleware/auth.js";

export async function listMedia({ request, response }) {
  await requirePermission(request, "media");
  // Quote the camelCase aliases: Postgres folds unquoted identifiers to lowercase
  // (breaking the client keys), while SQLite preserves them either way.
  const assets = await db.prepare(`
    SELECT id, file_name AS "fileName", public_url AS "publicUrl", mime_type AS "mimeType",
      size_bytes AS "sizeBytes", created_at AS "createdAt"
    FROM media_assets ORDER BY created_at DESC LIMIT 300
  `).all();
  sendJson(response, 200, { assets });
}

export async function uploadMedia({ request, response }) {
  const user = await requirePermission(request, "media");
  const mimeType = String(request.headers["content-type"] || "").split(";")[0].toLowerCase();
  const allowed = new Map([
    ["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"],
    ["image/gif", ".gif"], ["video/mp4", ".mp4"], ["video/webm", ".webm"],
  ]);
  if (!allowed.has(mimeType)) throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE");
  const data = await readBinary(request);
  if (detectMediaType(data) !== mimeType) throw new HttpError(415, "MEDIA_CONTENT_MISMATCH");
  const id = randomToken(12);
  const extension = allowed.get(mimeType);
  const originalName = decodeURIComponent(String(request.headers["x-file-name"] || `media${extension}`)).replace(/[^a-zA-Z0-9._؀-ۿ-]/g, "-").slice(0, 120);
  const diskName = `${Date.now()}-${id}${extension}`;
  const uploadDir = config.uploadsDir;
  const diskPath = path.join(uploadDir, diskName);
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(diskPath, data);
  const publicUrl = `/uploads/${diskName}`;
  try {
    await db.prepare(`
      INSERT INTO media_assets (id, file_name, public_url, mime_type, size_bytes, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, originalName, publicUrl, mimeType, data.length, user.id, Date.now());
  } catch (error) {
    // Don't leave an orphaned file on disk if the DB row never lands.
    fs.rmSync(diskPath, { force: true });
    throw error;
  }
  recordAudit({ userId: user.id, eventType: "cms.media_uploaded", targetType: "media", targetId: id, metadata: { mimeType, size: data.length } });
  sendJson(response, 201, { id, fileName: originalName, publicUrl, mimeType, sizeBytes: data.length });
}
