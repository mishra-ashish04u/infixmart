import { Router } from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";

const couponAdminRouter = Router();

couponAdminRouter.get("/",       auth, adminOnly, getAllCoupons);
couponAdminRouter.post("/",      auth, adminOnly, createCoupon);
couponAdminRouter.put("/:id",    auth, adminOnly, updateCoupon);
couponAdminRouter.delete("/:id", auth, adminOnly, deleteCoupon);

export default couponAdminRouter;
