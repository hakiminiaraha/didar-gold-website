import { config } from "../config.js";
import { HttpError } from "./http-error.js";

export function clientIp(request) {
  if (config.trustProxy) {
    const forwarded = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
    if (forwarded) return forwarded;
  }
  return request.socket.remoteAddress || "unknown";
}

const mediaSignatures = [
  { mimeType: "image/jpeg", test: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mimeType: "image/png", test: (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mimeType: "image/gif", test: (b) => b.length >= 6 && (b.toString("ascii", 0, 6) === "GIF87a" || b.toString("ascii", 0, 6) === "GIF89a") },
  { mimeType: "image/webp", test: (b) => b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  { mimeType: "video/mp4", test: (b) => b.length >= 12 && b.toString("ascii", 4, 8) === "ftyp" },
  { mimeType: "video/webm", test: (b) => b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3 },
];

export function detectMediaType(buffer) {
  return mediaSignatures.find((signature) => signature.test(buffer))?.mimeType || null;
}

export function verifyOrigin(request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  const origin = request.headers.origin;
  const protocol = String(request.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  const sameOrigin = `${protocol}://${request.headers.host}`;
  if (origin && origin !== sameOrigin && !config.appOrigins.includes(origin)) throw new HttpError(403, "ORIGIN_NOT_ALLOWED");
}
