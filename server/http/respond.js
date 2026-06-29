import { config } from "../config.js";

export function commonHeaders() {
  return {
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    ...(config.isProduction ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload" } : {}),
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };
}

export function sendJson(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    ...commonHeaders(),
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders,
  });
  response.end(JSON.stringify(body));
}
