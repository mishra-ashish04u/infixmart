import jwt from "jsonwebtoken";

const generateAccessToken = async (userId) => {
  const token = await jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_ACCESS_TOKEN,
    {
      expiresIn: "15m", // OWASP A07: short-lived access tokens
    }
  );
  return token;
};

export default generateAccessToken;
