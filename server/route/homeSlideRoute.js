import express from "express";
import { addHomeSlide, getHomeSlides, deleteHomeSlide, updateHomeSlide, uploadImages } from "../controllers/homeSlideController.js";
import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

// Public
router.get("/", getHomeSlides);

// Admin-only
router.post("/upload-images", auth, adminOnly, upload.array("images"), uploadImages);
router.post("/create",        auth, adminOnly, addHomeSlide);
router.put("/:id",            auth, adminOnly, updateHomeSlide);
router.delete("/:id",         auth, adminOnly, deleteHomeSlide);

export default router;
