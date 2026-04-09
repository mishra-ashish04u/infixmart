import { HttpError } from "../api/http.js";
import { getAuthorizationBearer, getCookieValue } from "./cookies.js";
import {
  verifyAccessToken,
  verifyPasswordResetToken,
  verifyRefreshToken,
} from "./tokens.js";

function getAccessTokenFromRequest(request) {
  return getCookieValue(request, "accessToken") || getAuthorizationBearer(request);
}

function getRefreshTokenFromRequest(request) {
  return getCookieValue(request, "refreshToken") || getAuthorizationBearer(request);
}

function getPasswordResetTokenFromRequest(request) {
  return getCookieValue(request, "passwordResetToken");
}

function requireAccessUserId(request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) {
    throw new HttpError(401, "Unauthorized");
  }

  try {
    const decoded = verifyAccessToken(token);
    return decoded.id;
  } catch {
    throw new HttpError(401, "Unauthorized");
  }
}

function requireRefreshToken(request) {
  const token = getRefreshTokenFromRequest(request);
  if (!token) {
    throw new HttpError(401, "No refresh token provided");
  }

  return token;
}

function requirePasswordResetEmail(request, expectedEmail) {
  const token = getPasswordResetTokenFromRequest(request);
  if (!token) {
    throw new HttpError(403, "Password reset session expired");
  }

  try {
    const decoded = verifyPasswordResetToken(token);
    if (
      decoded.purpose !== "password-reset" ||
      String(decoded.email).toLowerCase() !== String(expectedEmail).toLowerCase()
    ) {
      throw new Error("invalid");
    }

    return decoded.email;
  } catch {
    throw new HttpError(403, "Password reset session expired");
  }
}

function verifyRefreshTokenOrThrow(token) {
  try {
    return verifyRefreshToken(token);
  } catch {
    throw new HttpError(403, "Invalid refresh token");
  }
}

export {
  requireAccessUserId,
  requirePasswordResetEmail,
  requireRefreshToken,
  verifyRefreshTokenOrThrow,
};
