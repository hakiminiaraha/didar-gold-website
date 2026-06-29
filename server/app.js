import { HttpError } from "./http/http-error.js";
import { sendJson } from "./http/respond.js";
import { verifyOrigin } from "./http/request.js";
import { serveFrontend } from "./http/static.js";
import { registerRoutes } from "./routes/index.js";

const router = registerRoutes();

// Builds the single request handler passed to http.createServer. Per request:
// verify origin (state-changing methods only) → match a route → fall back to the
// static SPA for non-API GET/HEAD → 404 → one error handler shapes every throw.
export async function handleRequest(request, response) {
  try {
    verifyOrigin(request);
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    // The single source of truth for a request. Note: we deliberately do NOT
    // stash an authenticated user here — route guards (requireUser/Admin/
    // Permission) return the user in-scope, so authorization can never be
    // bypassed by reading a stale ctx.user.
    const ctx = { request, response, url, params: {} };

    const handler = router.match(request.method, url.pathname);
    if (handler) return await handler(ctx);

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
}
