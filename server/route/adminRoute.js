import { Router } from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  adminLoginController,
  getDashboardStats,
  getAllOrdersAdmin,
  getAllUsers,
  updateUserStatus,
  getUserStats,
  sendTestEmail,
} from "../controllers/adminController.js";
import { getSettingsAdmin, upsertSetting } from "../controllers/settingsController.js";

const adminRouter = Router();

// ── Public ─────────────────────────────────────────────────────────────────────
adminRouter.post("/login",              adminLoginController);

adminRouter.get("/stats",               auth, adminOnly, getDashboardStats);
adminRouter.get("/orders",              auth, adminOnly, getAllOrdersAdmin);
adminRouter.get("/users",               auth, adminOnly, getAllUsers);
adminRouter.put("/users/:id/status",    auth, adminOnly, updateUserStatus);
adminRouter.get("/users/:id/stats",     auth, adminOnly, getUserStats);

// ── Store settings ────────────────────────────────────────────────────────────
adminRouter.get("/settings",            auth, adminOnly, getSettingsAdmin);
adminRouter.put("/settings",            auth, adminOnly, upsertSetting);

// ── SMTP smoke test — remove after verifying email works in production ───────
adminRouter.get("/test-email",          auth, adminOnly, sendTestEmail);

export default adminRouter;
