import Blog from "../models/Blog.js";
import { Op } from "sequelize";
import { sanitizeRichText, stripHtml } from "../utils/htmlSanitizer.js";

// ── Slug helper ───────────────────────────────────────────────────────────────
const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const uniqueSlug = async (title, excludeId = null) => {
  let base = toSlug(title);
  let slug = base;
  let n = 1;
  while (true) {
    const where = { slug };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const exists = await Blog.findOne({ where: { slug } });
    if (!exists || (excludeId && String(exists.id) === String(excludeId))) break;
    slug = `${base}-${n++}`;
  }
  return slug;
};

// ── Public ────────────────────────────────────────────────────────────────────
export const getBlogs = async (req, res) => {
  try {
    const page    = parseInt(req.query.page)    || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const { count, rows } = await Blog.findAndCountAll({
      where:  { published: true },
      order:  [["createdAt", "DESC"]],
      offset: (page - 1) * perPage,
      limit:  perPage,
      attributes: ["id", "title", "slug", "excerpt", "image", "author", "createdAt"],
    });

    return res.json({ blogs: rows, total: count, page, totalPages: Math.ceil(count / perPage), success: true, error: false });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true, success: false });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ where: { slug: req.params.slug, published: true } });
    if (!blog) return res.status(404).json({ message: "Blog not found", error: true, success: false });
    return res.json({ blog, success: true, error: false });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true, success: false });
  }
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.findAll({ order: [["createdAt", "DESC"]] });
    return res.json({ blogs, success: true, error: false });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true, success: false });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, author, published } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || "");
    const slug  = await uniqueSlug(title);
    const safeContent = sanitizeRichText(content || "");
    const safeExcerpt = stripHtml(excerpt || safeContent).slice(0, 220);

    const blog = await Blog.create({
      title,
      slug,
      excerpt:   safeExcerpt,
      content:   safeContent,
      image,
      author:    author    || "InfixMart Team",
      published: published === true || published === "true",
    });

    return res.status(201).json({ blog, message: "Blog created successfully", success: true, error: false });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true, success: false });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found", error: true, success: false });

    const { title, excerpt, content, author, published } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || blog.image);
    const slug  = title !== blog.title ? await uniqueSlug(title, blog.id) : blog.slug;
    const safeContent = content !== undefined ? sanitizeRichText(content) : blog.content;
    const safeExcerpt = excerpt !== undefined
      ? stripHtml(excerpt).slice(0, 220)
      : blog.excerpt || stripHtml(safeContent).slice(0, 220);

    await blog.update({
      title,
      slug,
      excerpt:   safeExcerpt,
      content:   safeContent,
      image,
      author:    author    || blog.author,
      published: published === true || published === "true",
    });

    return res.json({ blog, message: "Blog updated successfully", success: true, error: false });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true, success: false });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Blog not found", error: true, success: false });
    return res.json({ message: "Blog deleted successfully", success: true, error: false });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true, success: false });
  }
};
