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
