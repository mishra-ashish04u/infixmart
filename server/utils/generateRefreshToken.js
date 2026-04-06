import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateRefreshToken = async (userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_REFRESH_TOKEN,
    { expiresIn: "7d" }
  );

  await User.update({ refreshToken: token }, { where: { id: userId } });

  return token;
};

export default generateRefreshToken;
