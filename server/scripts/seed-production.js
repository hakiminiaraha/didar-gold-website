import fs from "node:fs";
import path from "node:path";

import { db, transaction } from "../db.js";
import { cmsContentSeed, productionCatalogSeed } from "../seeds/production.seed.js";

const publicRoot = path.resolve("public");
const mediaFolders = ["images", "videos", "icons"];
const mimeTypes = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
  [".mp4", "video/mp4"],
]);

function walkFiles(folder) {
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(folder, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function mediaAssets() {
  return mediaFolders.flatMap((folder) => walkFiles(path.join(publicRoot, folder)))
    .filter((filePath) => mimeTypes.has(path.extname(filePath).toLowerCase()))
    .map((filePath) => {
      const relativePath = path.relative(publicRoot, filePath).replace(/\\/g, "/");
      const publicUrl = `/${relativePath}`;
      const id = `media-${relativePath.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
      return {
        id,
        fileName: path.basename(filePath),
        publicUrl,
        mimeType: mimeTypes.get(path.extname(filePath).toLowerCase()),
        sizeBytes: fs.statSync(filePath).size,
      };
    });
}

async function upsertCatalog(tx, item, now) {
  const existing = await tx.get("SELECT id FROM catalog_items WHERE item_type = ? AND slug = ?", [item.type, item.slug]);
  const dataJson = JSON.stringify(item.data);
  if (existing) {
    await tx.run(`
      UPDATE catalog_items SET status = 'published', sort_order = ?, data_json = ?, updated_at = ?
      WHERE id = ?
    `, [item.sortOrder, dataJson, now, existing.id]);
    return "updated";
  }

  await tx.run(`
    INSERT INTO catalog_items (item_type, slug, status, sort_order, data_json, created_at, updated_at)
    VALUES (?, ?, 'published', ?, ?, ?, ?)
  `, [item.type, item.slug, item.sortOrder, dataJson, now, now]);
  return "inserted";
}

async function upsertCmsContent(tx, item, now) {
  const existing = await tx.get(`
    SELECT route_path FROM cms_content
    WHERE route_path = ? AND locale = ? AND content_key = ? AND content_type = ?
  `, [item.routePath, item.locale, item.contentKey, item.contentType]);

  if (existing) {
    await tx.run(`
      UPDATE cms_content SET value = ?, updated_at = ?
      WHERE route_path = ? AND locale = ? AND content_key = ? AND content_type = ?
    `, [item.value, now, item.routePath, item.locale, item.contentKey, item.contentType]);
    return "updated";
  }

  await tx.run(`
    INSERT INTO cms_content (route_path, locale, content_key, content_type, value, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [item.routePath, item.locale, item.contentKey, item.contentType, item.value, now]);
  return "inserted";
}

async function upsertMediaAsset(tx, item, now) {
  const existing = await tx.get("SELECT id FROM media_assets WHERE public_url = ?", [item.publicUrl]);
  if (existing) {
    await tx.run(`
      UPDATE media_assets SET file_name = ?, mime_type = ?, size_bytes = ?
      WHERE public_url = ?
    `, [item.fileName, item.mimeType, item.sizeBytes, item.publicUrl]);
    return "updated";
  }

  await tx.run(`
    INSERT INTO media_assets (id, file_name, public_url, mime_type, size_bytes, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [item.id, item.fileName, item.publicUrl, item.mimeType, item.sizeBytes, now]);
  return "inserted";
}

const now = Date.now();
const summary = {
  catalog: { inserted: 0, updated: 0 },
  cms: { inserted: 0, updated: 0 },
  media: { inserted: 0, updated: 0 },
};

await transaction(async (tx) => {
  for (const item of productionCatalogSeed) summary.catalog[await upsertCatalog(tx, item, now)] += 1;
  for (const item of cmsContentSeed) summary.cms[await upsertCmsContent(tx, item, now)] += 1;
  for (const item of mediaAssets()) summary.media[await upsertMediaAsset(tx, item, now)] += 1;
});

const counts = {
  products: (await db.get("SELECT COUNT(*) AS count FROM catalog_items WHERE item_type = 'product'")).count,
  collections: (await db.get("SELECT COUNT(*) AS count FROM catalog_items WHERE item_type = 'collection'")).count,
  cms: (await db.get("SELECT COUNT(*) AS count FROM cms_content")).count,
  media: (await db.get("SELECT COUNT(*) AS count FROM media_assets")).count,
};

console.log(JSON.stringify({ ok: true, provider: db.provider, summary, counts }, null, 2));
await db.close();
