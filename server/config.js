import fs from "node:fs";
import path from "node:path";

const isProduction = process.env.NODE_ENV === "production";
const databaseValue = process.env.DATABASE_PATH || "server/data/didar.sqlite";
const databaseUrl = process.env.DATABASE_URL || "";

function secret(name, developmentFallback) {
  const value = process.env[name] || (isProduction ? "" : developmentFallback);
  if (!value || (isProduction && value.length < 32)) {
    throw new Error(`${name} must be set to at least 32 characters in production`);
  }
  return value;
}

// Postgres CA certificate for verified TLS: inline PEM (DATABASE_CA_CERT) or a
// file path (DATABASE_CA_CERT_PATH). Required by most managed providers (their
// certs are not in the system trust store) once strict TLS is enabled.
function readCaCert() {
  if (process.env.DATABASE_CA_CERT) return process.env.DATABASE_CA_CERT;
  if (process.env.DATABASE_CA_CERT_PATH) return fs.readFileSync(process.env.DATABASE_CA_CERT_PATH, "utf8");
  return null;
}

export const config = {
  isProduction,
  port: Number(process.env.PORT || process.env.API_PORT || 8787),
  host: process.env.HOST || (isProduction ? "0.0.0.0" : "127.0.0.1"),
  databasePath: databaseValue === ":memory:" ? databaseValue : path.resolve(databaseValue),
  databaseUrl,
  databaseProvider: databaseUrl ? "postgres" : "sqlite",
  databaseSsl: process.env.DATABASE_SSL === "true",
  databaseCaCert: readCaCert(),
  // Escape hatch for emergencies only — disables TLS cert verification (MitM risk).
  databaseSslInsecure: process.env.DATABASE_SSL_INSECURE === "true",
  databaseSeed: process.env.DATABASE_SEED !== "false",
  // Where uploaded media is written and served from. Decoupled from dist/ so it
  // survives rebuilds; point at a persistent disk/volume in production.
  uploadsDir: path.resolve(process.env.UPLOADS_DIR || "public/uploads"),
  trustProxy: process.env.TRUST_PROXY === "true",
  appOrigins: (process.env.APP_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  authHashSecret: secret("AUTH_HASH_SECRET", "didar-development-auth-hash-secret-change-me"),
  sessionSecret: secret("SESSION_SECRET", "didar-development-session-secret-change-me"),
  otpProvider: process.env.OTP_PROVIDER || "console",
  otpTtlSeconds: Number(process.env.OTP_TTL_SECONDS || 120),
  otpCooldownSeconds: Number(process.env.OTP_COOLDOWN_SECONDS || 60),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
  otpIpWindowSeconds: Number(process.env.OTP_IP_WINDOW_SECONDS || 3600),
  otpIpMaxRequests: Number(process.env.OTP_IP_MAX_REQUESTS || 20),
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS || 30),
  adminMobiles: new Set((process.env.ADMIN_MOBILES || "").split(",").map((value) => value.trim()).filter(Boolean)),
  smsApiUrl: process.env.SMS_API_URL || "",
  smsApiKey: process.env.SMS_API_KEY || "",
  smsTemplate: process.env.SMS_TEMPLATE || "didar-login",
  payamSmsBaseUrl: (process.env.PAYAMSMS_BASE_URL || "https://www.payamsms.com").replace(/\/$/, ""),
  payamSmsClientId: process.env.PAYAMSMS_CLIENT_ID || "",
  payamSmsClientSecret: process.env.PAYAMSMS_CLIENT_SECRET || "",
  payamSmsSystemName: process.env.PAYAMSMS_SYSTEM_NAME || "",
  payamSmsUsername: process.env.PAYAMSMS_USERNAME || "",
  payamSmsPassword: process.env.PAYAMSMS_PASSWORD || "",
  payamSmsSender: process.env.PAYAMSMS_SENDER || "",
  payamSmsBodyTemplate: process.env.PAYAMSMS_BODY_TEMPLATE || "کد ورود دیدار: {code}",
};

if (config.isProduction && config.otpProvider === "console") {
  throw new Error("OTP_PROVIDER=console is forbidden in production");
}

if (config.isProduction && config.otpProvider === "payamsms") {
  const missing = [
    ["PAYAMSMS_CLIENT_ID", config.payamSmsClientId],
    ["PAYAMSMS_CLIENT_SECRET", config.payamSmsClientSecret],
    ["PAYAMSMS_SYSTEM_NAME", config.payamSmsSystemName],
    ["PAYAMSMS_USERNAME", config.payamSmsUsername],
    ["PAYAMSMS_PASSWORD", config.payamSmsPassword],
    ["PAYAMSMS_SENDER", config.payamSmsSender],
  ].filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) throw new Error(`Missing PayamSMS configuration: ${missing.join(", ")}`);
}
