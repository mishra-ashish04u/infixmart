import { Router } from "express";
import multer from "multer";
import path from "path";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  getSection,
  getAllSections,
  createItem,
  updateItem,
  deleteItem,
  uploadImage,
} from "../controllers/homePageController.js";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

const homePageRouter = Router();

// ── Admin routes (must come before /:section to avoid param clash) ────────────
homePageRouter.get("/",               auth, adminOnly, getAllSections);
homePageRouter.post("/upload",        auth, adminOnly, upload.single("image"), uploadImage);
homePageRouter.post("/",              auth, adminOnly, createItem);
homePageRouter.put("/:id",            auth, adminOnly, updateItem);
homePageRouter.delete("/:id",         auth, adminOnly, deleteItem);

// ── Public: /api/homepage/:section ────────────────────────────────────────────
homePageRouter.get("/:section",       getSection);

export default homePageRouter;
