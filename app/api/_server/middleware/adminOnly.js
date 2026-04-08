import User from "../models/User.js";

const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only.", error: true, success: false });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

export default adminOnly;
