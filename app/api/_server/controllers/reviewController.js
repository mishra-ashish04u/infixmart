import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import { sequelize } from "../config/connectDB.js";
import { Op } from "sequelize";

/* ── GET /api/reviews/product/:productId  (public) ── */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page    = parseInt(req.query.page)    || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const { count, rows } = await Review.findAndCountAll({
      where: { productId },
      order: [["createdAt", "DESC"]],
      limit:  perPage,
      offset: (page - 1) * perPage,
    });

    // Attach user name to each review
    const userIds = [...new Set(rows.map((r) => r.userId))];
    const users   = await User.findAll({
      where:      { id: { [Op.in]: userIds } },
      attributes: ["id", "name", "avatar"],
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, { name: u.name, avatar: u.avatar }]));

    const reviews = rows.map((r) => ({
      id:        r.id,
      rating:    r.rating,
      title:     r.title,
      comment:   r.comment,
      verified:  r.verified,
      createdAt: r.createdAt,
      user:      userMap[r.userId] || { name: "User" },
    }));

    // Summary stats
    const stats = await Review.findAll({
      where:      { productId },
      attributes: ["rating", [sequelize.fn("COUNT", sequelize.col("rating")), "count"]],
      group:      ["rating"],
      raw:        true,
    });
    const ratingMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.forEach((s) => { ratingMap[s.rating] = parseInt(s.count); });
    const totalRatings = Object.values(ratingMap).reduce((a, b) => a + b, 0);
    const avgRating    = totalRatings > 0
      ? +(Object.entries(ratingMap).reduce((sum, [r, c]) => sum + r * c, 0) / totalRatings).toFixed(1)
      : 0;

    return res.status(200).json({
      success: true, error: false,
      data: { reviews, totalPages: Math.ceil(count / perPage), currentPage: page, totalReviews: count },
      summary: { avgRating, totalRatings, ratingMap },
    });
  } catch (error) {
    console.error("[Review] getProductReviews:", error);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

/* ── POST /api/reviews  (auth) ── */
export const createReview = async (req, res) => {
  try {
    const userId             = req.userId;
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ message: "productId and rating are required", error: true, success: false });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5", error: true, success: false });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found", error: true, success: false });
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({ where: { userId, productId } });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product", error: true, success: false });
    }

    // Mark as verified if user actually purchased this product
    const purchased = await Order.findOne({
      where:   { userId, status: { [Op.in]: ["delivered", "shipped"] } },
      include: [{ model: OrderItem, as: "orderItems", where: { productId }, required: true }],
    });

    const review = await Review.create({
      userId,
      productId,
      rating: parseInt(rating),
      title:   (title   || "").trim().slice(0, 120),
      comment: (comment || "").trim(),
      verified: !!purchased,
    });

    // Update product average rating
    await recalcProductRating(productId);

    const user = await User.findByPk(userId, { attributes: ["name", "avatar"] });
    return res.status(201).json({
      success: true, error: false,
      message: "Review submitted successfully",
      data: { ...review.toJSON(), user: { name: user.name, avatar: user.avatar } },
    });
  } catch (error) {
    console.error("[Review] createReview:", error);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

/* ── PUT /api/reviews/:id  (auth – owner only) ── */
export const updateReview = async (req, res) => {
  try {
    const userId   = req.userId;
    const { id }   = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({ where: { id, userId } });
    if (!review) {
      return res.status(404).json({ message: "Review not found", error: true, success: false });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5", error: true, success: false });
      }
      review.rating = parseInt(rating);
    }
    if (title   !== undefined) review.title   = title.trim().slice(0, 120);
    if (comment !== undefined) review.comment = comment.trim();
    await review.save();

    await recalcProductRating(review.productId);

    return res.status(200).json({ success: true, error: false, message: "Review updated", data: review });
  } catch (error) {
    console.error("[Review] updateReview:", error);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

/* ── DELETE /api/reviews/:id  (auth – owner or admin) ── */
export const deleteReview = async (req, res) => {
  try {
    const userId  = req.userId;
    const { id }  = req.params;
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found", error: true, success: false });
    }

    if (review.userId !== userId) {
      const user = await User.findByPk(userId, { attributes: ["role"] });
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied", error: true, success: false });
      }
    }

    const { productId } = review;
    await review.destroy();
    await recalcProductRating(productId);

    return res.status(200).json({ success: true, error: false, message: "Review deleted" });
  } catch (error) {
    console.error("[Review] deleteReview:", error);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

/* ── GET /api/reviews/my  (auth – get own reviews) ── */
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.userId },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ success: true, error: false, data: reviews });
  } catch (error) {
    console.error("[Review] getMyReviews:", error);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

/* ── GET /api/reviews/check/:productId  (auth) – did I review this? ── */
export const checkMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({ where: { userId: req.userId, productId: req.params.productId } });
    return res.status(200).json({ success: true, error: false, review: review || null });
  } catch (error) {
    console.error("[Review] checkMyReview:", error);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

/* ── helpers ── */
async function recalcProductRating(productId) {
  const result = await Review.findAll({
    where:      { productId },
    attributes: [[sequelize.fn("AVG", sequelize.col("rating")), "avg"], [sequelize.fn("COUNT", sequelize.col("id")), "cnt"]],
    raw:        true,
  });
  const avg = result[0]?.avg ? +parseFloat(result[0].avg).toFixed(1) : 0;
  await Product.update({ rating: avg }, { where: { id: productId } });
}
