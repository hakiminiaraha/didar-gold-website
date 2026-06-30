import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

import { config } from "../config.js";

// Already-compressed binaries (images/video/fonts) are skipped; only text assets
// benefit from on-the-fly compression.
const compressibleExtensions = new Set([".css", ".html", ".js", ".json", ".svg", ".xml", ".webmanifest", ".txt", ".map"]);

function negotiateEncoding(acceptEncoding = "") {
  if (/\bbr\b/.test(acceptEncoding)) return "br";
  if (/\bgzip\b/.test(acceptEncoding)) return "gzip";
  return null;
}

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

// Serve user-uploaded media from config.uploadsDir, independent of dist/. This
// decouples uploads from the SPA build (which is wiped/rebuilt each deploy) so a
// persistent volume/disk mounted at uploadsDir keeps them reachable at /uploads/*.
// Runs in every mode (dev + prod) so the API serves uploads on its own.
export function serveUploads(request, response, url) {
  if (!["GET", "HEAD"].includes(request.method)) return false;
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return false;
  }
  if (!pathname.startsWith("/uploads/")) return false;

  const root = config.uploadsDir;
  const relativePath = pathname.slice("/uploads/".length);
  const requestedPath = path.resolve(root, relativePath);
  const insideRoot = requestedPath === root || requestedPath.startsWith(`${root}${path.sep}`);
  if (!insideRoot || !relativePath || !fs.existsSync(requestedPath) || !fs.statSync(requestedPath).isFile()) return false;

  const extension = path.extname(requestedPath).toLowerCase();
  response.writeHead(200, {
    "Cache-Control": "public, max-age=604800",
    "Content-Security-Policy": "default-src 'none'",
    "Content-Type": mimeTypes[extension] || "application/octet-stream",
    ...(config.isProduction ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload" } : {}),
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  if (request.method === "HEAD") {
    response.end();
    return true;
  }
  fs.createReadStream(requestedPath).pipe(response);
  return true;
}

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
  const isIndex = filePath.endsWith("index.html");
  const immutable = filePath.includes(`${path.sep}assets${path.sep}`);
  // Vite-hashed /assets are immutable; index.html must always revalidate; other
  // static media (images/font/videos copied from public/) have stable names so a
  // moderate cache is safe.
  const cacheControl = immutable
    ? "public, max-age=31536000, immutable"
    : isIndex
      ? "no-cache"
      : "public, max-age=604800";

  const encoding = compressibleExtensions.has(extension)
    ? negotiateEncoding(String(request.headers["accept-encoding"] || ""))
    : null;

  response.writeHead(200, {
    "Cache-Control": cacheControl,
    // frame-ancestors 'self' (+ X-Frame-Options SAMEORIGIN) so the admin CMS live
    // preview can embed the SPA in a same-origin iframe; cross-origin framing
    // (clickjacking) is still blocked.
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
    "Content-Type": mimeTypes[extension] || "application/octet-stream",
    ...(encoding ? { "Content-Encoding": encoding, "Vary": "Accept-Encoding" } : {}),
    ...(config.isProduction ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload" } : {}),
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
  });

  if (request.method === "HEAD") {
    response.end();
    return true;
  }

  const fileStream = fs.createReadStream(filePath);
  if (encoding === "br") fileStream.pipe(zlib.createBrotliCompress()).pipe(response);
  else if (encoding === "gzip") fileStream.pipe(zlib.createGzip()).pipe(response);
  else fileStream.pipe(response);
  return true;
}
