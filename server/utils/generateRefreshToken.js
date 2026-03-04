import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateRefreshToken = async (userId) => {
  const token = await jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_REFRESH_TOKEN,
    {
      expiresIn: "7d",
    }
  );

  const updateRefreshToken = await User.updateOne(
    { _id: userId },
    {
      refreshToken: token,
    }
  );

  return token;
};

export default generateRefreshToken;
