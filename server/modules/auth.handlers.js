import { randomInt } from "node:crypto";

import { config } from "../config.js";
import { db, recordAudit, transaction } from "../db.js";
import { sendOtp } from "../otpProvider.js";
import {
  clearSessionCookie,
  hashIp,
  hashSessionToken,
  hmac,
  parseCookies,
  randomToken,
  safeEqual,
  sessionCookie,
} from "../security.js";
import {
  isValidIranianMobile,
  normalizeMobile,
  normalizeOtp,
} from "../validation.js";
import { HttpError } from "../http/http-error.js";
import { sendJson } from "../http/respond.js";
import { readJson } from "../http/body.js";
import { clientIp } from "../http/request.js";
import { getAuthenticatedUser, publicUser } from "../middleware/auth.js";

export async function requestOtp({ request, response }) {
  const body = await readJson(request);
  const mobile = normalizeMobile(body.mobile);
  if (!isValidIranianMobile(mobile)) throw new HttpError(400, "INVALID_MOBILE");

  const now = Date.now();
  const ipHash = hashIp(clientIp(request));

  // Dev-login account: an explicitly enabled (DEV_LOGIN=true), fixed-code login for
  // one configured mobile — for local/demo/reviewer use. It still goes through the
  // normal challenge + verify flow, but skips SMS delivery and rate limits.
  const devLogin = config.devLoginEnabled && mobile === normalizeMobile(config.devLoginMobile);

  if (!devLogin) {
    const ipWindowStart = now - config.otpIpWindowSeconds * 1000;
    const ipCount = (await db.prepare("SELECT COUNT(*) AS count FROM otp_challenges WHERE ip_hash = ? AND created_at >= ?").get(ipHash, ipWindowStart)).count;
    if (ipCount >= config.otpIpMaxRequests) {
      throw new HttpError(429, "OTP_RATE_LIMIT", "OTP_RATE_LIMIT", { retryAfter: config.otpIpWindowSeconds });
    }

    const recent = await db.prepare("SELECT created_at FROM otp_challenges WHERE mobile = ? ORDER BY created_at DESC LIMIT 1").get(mobile);
    const cooldownMs = config.otpCooldownSeconds * 1000;
    if (recent && now - recent.created_at < cooldownMs) {
      const retryAfter = Math.ceil((cooldownMs - (now - recent.created_at)) / 1000);
      throw new HttpError(429, "OTP_COOLDOWN", "OTP_COOLDOWN", { retryAfter });
    }
  }

  const challengeId = randomToken(18);
  const isConsoleDemo = config.otpProvider === "console" && !config.isProduction;
  const code = devLogin
    ? config.devLoginCode
    : (isConsoleDemo ? "123456" : String(randomInt(0, 1_000_000)).padStart(6, "0"));
  const codeHash = hmac(`${challengeId}:${code}`, "otp");
  const expiresAt = now + config.otpTtlSeconds * 1000;

  await db.prepare(`
    INSERT INTO otp_challenges (id, mobile, code_hash, expires_at, ip_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(challengeId, mobile, codeHash, expiresAt, ipHash, now);

  if (!devLogin) {
    try {
      await sendOtp({ mobile, code });
    } catch (error) {
      await db.prepare("DELETE FROM otp_challenges WHERE id = ?").run(challengeId);
      console.error("[didar:sms]", error.message);
      throw new HttpError(503, "OTP_DELIVERY_FAILED");
    }
  }

  recordAudit({ eventType: "auth.otp_requested", targetType: "mobile", targetId: hmac(mobile, "mobile-audit").slice(0, 16), ipHash });
  sendJson(response, 200, {
    challengeId,
    mobile,
    expiresIn: config.otpTtlSeconds,
    ...((devLogin || isConsoleDemo) ? { demoCode: code } : {}),
  });
}

export async function verifyOtp({ request, response }) {
  const body = await readJson(request);
  const mobile = normalizeMobile(body.mobile);
  const challengeId = String(body.challengeId || "");
  const code = normalizeOtp(body.code);
  if (!isValidIranianMobile(mobile) || !challengeId || !/^\d{6}$/.test(code)) {
    throw new HttpError(400, "INVALID_OTP");
  }

  const now = Date.now();
  // Atomically claim one attempt: the row is returned only if it is still
  // unconsumed, unexpired, and under the attempt limit. This serializes
  // concurrent guesses so the attempt cap cannot be bypassed by a race.
  const challenge = await db.prepare(
    "UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = ? AND mobile = ? AND consumed_at IS NULL AND expires_at > ? AND attempts < ? RETURNING *",
  ).get(challengeId, mobile, now, config.otpMaxAttempts);
  if (!challenge) {
    throw new HttpError(400, "INVALID_OTP");
  }

  const expectedHash = hmac(`${challengeId}:${code}`, "otp");
  if (!safeEqual(challenge.code_hash, expectedHash)) {
    recordAudit({ eventType: "auth.otp_failed", targetType: "challenge", targetId: challengeId, ipHash: hashIp(clientIp(request)) });
    throw new HttpError(400, "INVALID_OTP");
  }

  const configuredRole = config.adminMobiles.has(mobile) ? "admin" : null;
  const token = randomToken(32);
  const sessionTtlSeconds = config.sessionTtlDays * 24 * 60 * 60;
  const userAgent = String(request.headers["user-agent"] || "").slice(0, 300);
  const reqIpHash = hashIp(clientIp(request));

  // All-or-nothing: resolve the user, create the session, and consume the OTP in
  // one transaction. Consuming last means a failure anywhere rolls back the
  // consume too, so the user can retry immediately instead of being locked out
  // for the cooldown with a spent challenge and no session.
  const user = await transaction(async (tx) => {
    const byMobile = await tx.prepare("SELECT * FROM users WHERE mobile = ?").get(mobile);
    let current = byMobile;
    if (!current) {
      const result = await tx.prepare(`
        INSERT INTO users (mobile, role, mobile_verified_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(mobile, configuredRole || "user", now, now, now);
      current = await tx.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    } else {
      // Configured admins are (re)granted admin; a stored admin whose mobile is
      // no longer in ADMIN_MOBILES is demoted to user. Other roles are preserved.
      const nextRole = configuredRole || (current.role === "admin" ? "user" : current.role);
      await tx.prepare("UPDATE users SET role = ?, mobile_verified_at = ?, updated_at = ? WHERE id = ?").run(nextRole, now, now, current.id);
      current = await tx.prepare("SELECT * FROM users WHERE id = ?").get(current.id);
    }
    await tx.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
    await tx.prepare(`
      INSERT INTO sessions (user_id, token_hash, expires_at, created_at, last_seen_at, user_agent, ip_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(current.id, hashSessionToken(token), now + sessionTtlSeconds * 1000, now, now, userAgent, reqIpHash);
    await tx.prepare("UPDATE otp_challenges SET consumed_at = ? WHERE id = ?").run(now, challengeId);
    return current;
  });

  recordAudit({ userId: user.id, eventType: "auth.login_succeeded", targetType: "session", ipHash: reqIpHash });
  sendJson(response, 200, publicUser(user), { "Set-Cookie": sessionCookie(token, sessionTtlSeconds) });
}

export async function logout({ request, response }) {
  const token = parseCookies(request.headers.cookie).didar_session;
  if (token) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashSessionToken(token));
  sendJson(response, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
}

export async function me({ request, response }) {
  const user = await getAuthenticatedUser(request);
  sendJson(response, 200, user ? publicUser(user) : null);
}
