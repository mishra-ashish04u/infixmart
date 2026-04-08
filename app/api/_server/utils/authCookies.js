const isProduction = process.env.NODE_ENV === "production";

// Derive the bare hostname (e.g. "infixmart.com") from FRONTEND_URL for the
// cookie domain, so both www and non-www share the same cookie.
function getCookieDomain() {
  if (!isProduction) return undefined; // localhost doesn't use a domain attribute
  try {
    const url = new URL(process.env.FRONTEND_URL || "");
    const hostname = url.hostname; // e.g. "www.infixmart.com"
    // Strip leading "www." to get the apex domain so cookies work on both
    return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  } catch {
    return undefined;
  }
}

const COOKIE_DOMAIN = getCookieDomain();

function createAuthCookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure:   isProduction,          // HTTPS only in production
    sameSite: isProduction ? "None" : "Lax", // None required for cross-subdomain cookies
    path:     "/",
    maxAge,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  };
}

function clearAuthCookies(res) {
  const opts = createAuthCookieOptions(undefined);
  res.clearCookie("accessToken",  opts);
  res.clearCookie("refreshToken", opts);
}

export { clearAuthCookies, createAuthCookieOptions };
