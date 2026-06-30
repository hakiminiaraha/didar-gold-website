import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { config } from "./config.js";

export function hmac(value, purpose = "value") {
  return createHmac("sha256", config.authHashSecret).update(`${purpose}:${value}`).digest("hex");
}

export function hashSessionToken(token) {
  return createHmac("sha256", config.sessionSecret).update(token).digest("hex");
}

export function hashIp(value) {
  return hmac(value || "unknown", "ip");
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        if (index === -1) return [item, ""];
        const raw = item.slice(index + 1);
        // A malformed value (e.g. a stray '%') must not throw URIError and turn
        // every authenticated request into a 500 — fall back to the raw value.
        let value = raw;
        try { value = decodeURIComponent(raw); } catch { /* keep raw */ }
        return [item.slice(0, index), value];
      }),
  );
}

export function sessionCookie(token, maxAgeSeconds) {
  const secure = config.isProduction ? "; Secure" : "";
  return `didar_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function clearSessionCookie() {
  const secure = config.isProduction ? "; Secure" : "";
  return `didar_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function maskMobile(mobile) {
  return `${mobile.slice(0, 4)}***${mobile.slice(-4)}`;
}
