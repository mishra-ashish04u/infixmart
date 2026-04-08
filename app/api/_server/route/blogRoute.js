import express from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import upload from "../middleware/multer.js";
import {
  getBlogs,
  getBlogBySlug,
  getAllBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

const blogRouter = express.Router();

// Public
blogRouter.get("/",          getBlogs);
blogRouter.get("/:slug",     getBlogBySlug);

// Admin
blogRouter.get("/admin/all", auth, adminOnly, getAllBlogsAdmin);
blogRouter.post("/",         auth, adminOnly, upload.single("image"), createBlog);
blogRouter.put("/:id",       auth, adminOnly, upload.single("image"), updateBlog);
blogRouter.delete("/:id",    auth, adminOnly, deleteBlog);

export default blogRouter;
