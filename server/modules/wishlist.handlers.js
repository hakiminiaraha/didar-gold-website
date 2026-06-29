import { audit, db, transaction } from "../db.js";
import { hashIp } from "../security.js";
import { HttpError } from "../http/http-error.js";
import { sendJson } from "../http/respond.js";
import { readJson } from "../http/body.js";
import { clientIp } from "../http/request.js";
import { requireUser } from "../middleware/auth.js";

export async function getWishlist({ request, response }) {
  const user = await requireUser(request);
  const items = (await db.prepare("SELECT creation_id FROM wishlist_items WHERE user_id = ? ORDER BY created_at ASC").all(user.id)).map((row) => row.creation_id);
  sendJson(response, 200, { items });
}

export async function replaceWishlist({ request, response }) {
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
