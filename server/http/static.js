import fs from "node:fs";
import path from "node:path";

import { config } from "../config.js";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

export function serveFrontend(request, response, url) {
  if (!config.isProduction || !["GET", "HEAD"].includes(request.method)) return false;
  const distRoot = path.resolve("dist");
  if (!fs.existsSync(path.join(distRoot, "index.html"))) return false;

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return false;
  }
  const relativePath = pathname.replace(/^\/+/, "");
  const requestedPath = path.resolve(distRoot, relativePath);
  const insideDist = requestedPath === distRoot || requestedPath.startsWith(`${distRoot}${path.sep}`);
  let filePath = insideDist && relativePath && fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()
    ? requestedPath
    : path.join(distRoot, "index.html");
  if (path.extname(relativePath) && filePath.endsWith("index.html")) return false;

  const extension = path.extname(filePath).toLowerCase();
  const immutable = filePath.includes(`${path.sep}assets${path.sep}`);
  response.writeHead(200, {
    "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    "Content-Type": mimeTypes[extension] || "application/octet-stream",
    ...(config.isProduction ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload" } : {}),
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  if (request.method === "HEAD") response.end();
  else fs.createReadStream(filePath).pipe(response);
  return true;
}
