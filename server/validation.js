import { HttpError } from "./http/http-error.js";

export function toEnglishDigits(value = "") {
  return String(value)
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export function normalizeMobile(value) {
  return toEnglishDigits(value).replace(/[\s-]/g, "");
}

export function isValidIranianMobile(value) {
  return /^09\d{9}$/.test(normalizeMobile(value));
}

export function normalizeOtp(value) {
  return toEnglishDigits(value).replace(/\D/g, "").slice(0, 6);
}

// Shared slug rule for catalog items and journal articles. Returns the
// normalized slug or throws INVALID_CATALOG_SLUG (the historical error code,
// kept identical for both domains).
export function validateSlug(value) {
  const slug = String(value || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(slug)) throw new HttpError(400, "INVALID_CATALOG_SLUG");
  return slug;
}
