import {
  getCookieDomain,
  getCookieSameSite,
  getCookieSecure,
  isProduction,
} from "../config/env.js";

const cookieDomain = isProduction ? getCookieDomain() : undefined;
const cookieSameSite = getCookieSameSite();
const cookieSecure = getCookieSecure() || cookieSameSite === "none";

function buildCookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    path: "/",
    maxAge,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };
}

function setAuthCookies(response, { accessToken, refreshToken }) {
  if (accessToken) {
    response.cookies.set("accessToken", accessToken, buildCookieOptions(15 * 60));
  }

  if (refreshToken) {
    response.cookies.set(
      "refreshToken",
      refreshToken,
      buildCookieOptions(7 * 24 * 60 * 60)
    );
  }
}

function clearAuthCookies(response) {
  response.cookies.set("accessToken", "", {
    ...buildCookieOptions(0),
    expires: new Date(0),
  });
  response.cookies.set("refreshToken", "", {
    ...buildCookieOptions(0),
    expires: new Date(0),
  });
}

function setPasswordResetCookie(response, token) {
  response.cookies.set(
    "passwordResetToken",
    token,
    buildCookieOptions(10 * 60)
  );
}

function clearPasswordResetCookie(response) {
  response.cookies.set("passwordResetToken", "", {
    ...buildCookieOptions(0),
    expires: new Date(0),
  });
}

function getCookieValue(request, name) {
  return request.cookies.get(name)?.value || null;
}

function getAuthorizationBearer(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim() || null;
}

export {
  clearAuthCookies,
  clearPasswordResetCookie,
  getAuthorizationBearer,
  getCookieValue,
  setAuthCookies,
  setPasswordResetCookie,
};
