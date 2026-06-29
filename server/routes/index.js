import { createRouter } from "../http/router.js";
import { sendJson } from "../http/respond.js";
import * as auth from "../modules/auth.handlers.js";
import * as wishlist from "../modules/wishlist.handlers.js";
import * as admin from "../modules/admin.handlers.js";
import * as cms from "../modules/cms.handlers.js";
import * as media from "../modules/media.handlers.js";
import * as catalog from "../modules/catalog.handlers.js";
import * as journal from "../modules/journal.handlers.js";
import * as inquiries from "../modules/inquiries.handlers.js";

export function registerRoutes() {
  const r = createRouter();

  r.get("/api/health", ({ response }) => sendJson(response, 200, { ok: true, service: "didar-api" }));

  r.post("/api/auth/request-otp", auth.requestOtp);
  r.post("/api/auth/verify-otp", auth.verifyOtp);
  r.post("/api/auth/logout", auth.logout);
  r.get("/api/auth/me", auth.me);

  r.get("/api/wishlist", wishlist.getWishlist);
  r.put("/api/wishlist", wishlist.replaceWishlist);

  r.get("/api/admin/overview", admin.adminOverview);
  r.get("/api/admin/users", admin.adminUsers);
  r.put("/api/admin/users/role", admin.updateUserRole);
  r.get("/api/admin/sessions", admin.adminSessions);
  r.del("/api/admin/sessions", admin.revokeUserSessions);
  r.get("/api/admin/audit", admin.adminAudit);
  r.get("/api/admin/system", admin.adminSystem);

  r.get("/api/content", cms.getCmsContent);
  r.get("/api/admin/content", (ctx) => cms.getCmsContent(ctx, true));
  r.put("/api/admin/content", cms.saveCmsContent);
  r.del("/api/admin/content", cms.deleteCmsEntry);

  r.get("/api/admin/media", media.listMedia);
  r.post("/api/admin/media", media.uploadMedia);

  r.get("/api/catalog", catalog.publicCatalog);
  r.get("/api/admin/catalog", catalog.adminCatalog);
  r.post("/api/admin/catalog", catalog.createCatalogItem);
  r.put("/api/admin/catalog", catalog.updateCatalogItem);
  r.del("/api/admin/catalog", catalog.deleteCatalogItem);

  r.get("/api/journal", journal.publicJournal);
  r.get("/api/admin/journal", journal.adminJournal);
  r.post("/api/admin/journal", journal.createArticle);
  r.put("/api/admin/journal", journal.updateArticle);
  r.del("/api/admin/journal", journal.deleteArticle);

  r.post("/api/inquiries", inquiries.createInquiry);
  r.get("/api/admin/inquiries", inquiries.adminInquiries);
  r.put("/api/admin/inquiries", inquiries.updateInquiry);

  return r;
}
