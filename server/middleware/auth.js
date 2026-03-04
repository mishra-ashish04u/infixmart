import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    console.log("Cookies:", req.cookies);
    console.log("Headers Auth:", req.headers.authorization);

    const token =
      req.cookies.accessToken || req?.headers?.authorization?.split(" ")[1];

    if (!token) {
      console.log("No token provided");
      return res
        .status(401)
        .json({
          message: "Unauthorized",
          error: true,
          success: false,
          debug: {
            authHeader: req?.headers?.authorization,
            cookies: req.cookies
          }
        });
    }
    const decoded = await jwt.verify(
      token,
      process.env.JWT_SECRET_ACCESS_TOKEN
    );

    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized", error: true, success: false });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: true, success: false });
  }
};

export default auth;
