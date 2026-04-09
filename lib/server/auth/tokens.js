import jwt from "jsonwebtoken";

function createAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_ACCESS_TOKEN, {
    expiresIn: "15m",
  });
}

function createRefreshToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_REFRESH_TOKEN, {
    expiresIn: "7d",
  });
}

function createPasswordResetToken(email) {
  return jwt.sign(
    { email, purpose: "password-reset" },
    process.env.JWT_SECRET || process.env.JWT_SECRET_ACCESS_TOKEN,
    { expiresIn: "10m" }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET_REFRESH_TOKEN);
}

function verifyPasswordResetToken(token) {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || process.env.JWT_SECRET_ACCESS_TOKEN
  );
}

export {
  createAccessToken,
  createPasswordResetToken,
  createRefreshToken,
  verifyAccessToken,
  verifyPasswordResetToken,
  verifyRefreshToken,
};
