const isProduction = process.env.NODE_ENV === "production";

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function parseInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function normalizeOrigin(value) {
  if (!value) return null;

  try {
    return new URL(String(value).trim()).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins() {
  const configured = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_WWW,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_API_URL,
    ...String(process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ]
    .map(normalizeOrigin)
    .filter(Boolean);

  if (!isProduction) {
    configured.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return [...new Set(configured)];
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  return getAllowedOrigins().includes(origin);
}

function getCookieSameSite() {
  const configured = String(process.env.COOKIE_SAME_SITE || "")
    .trim()
    .toLowerCase();

  if (["lax", "strict", "none"].includes(configured)) {
    return configured;
  }

  return "lax";
}

function getCookieSecure() {
  return parseBoolean(process.env.COOKIE_SECURE, isProduction);
}

function getCookieDomain() {
  if (process.env.COOKIE_DOMAIN) {
    return String(process.env.COOKIE_DOMAIN).trim();
  }

  try {
    const url = new URL(process.env.FRONTEND_URL || "");
    return url.hostname.startsWith("www.")
      ? url.hostname.slice(4)
      : url.hostname;
  } catch {
    return undefined;
  }
}

function getRateLimitConfig() {
  return {
    enabled: parseBoolean(process.env.RATE_LIMIT_ENABLED, true),
    authWindowMs: parseInteger(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 10 * 60 * 1000),
    authMax: parseInteger(process.env.RATE_LIMIT_AUTH_MAX, 10),
    adminWindowMs: parseInteger(process.env.RATE_LIMIT_ADMIN_WINDOW_MS, 5 * 60 * 1000),
    adminMax: parseInteger(process.env.RATE_LIMIT_ADMIN_MAX, 120),
    paymentWindowMs: parseInteger(process.env.RATE_LIMIT_PAYMENT_WINDOW_MS, 5 * 60 * 1000),
    paymentMax: parseInteger(process.env.RATE_LIMIT_PAYMENT_MAX, 20),
    uploadWindowMs: parseInteger(process.env.RATE_LIMIT_UPLOAD_WINDOW_MS, 5 * 60 * 1000),
    uploadMax: parseInteger(process.env.RATE_LIMIT_UPLOAD_MAX, 30),
    mutationWindowMs: parseInteger(process.env.RATE_LIMIT_MUTATION_WINDOW_MS, 60 * 1000),
    mutationMax: parseInteger(process.env.RATE_LIMIT_MUTATION_MAX, 120),
  };
}

export {
  getAllowedOrigins,
  getCookieDomain,
  getCookieSameSite,
  getCookieSecure,
  getRateLimitConfig,
  isOriginAllowed,
  isProduction,
  normalizeOrigin,
  parseBoolean,
};
