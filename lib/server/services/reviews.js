import { HttpError } from "../api/http.js";
import { findProductById } from "../repositories/products.js";
import { findUserById } from "../repositories/users.js";
import {
  createReview,
  deleteReview,
  findReviewById,
  findUserReview,
  getProductReviewStats,
  listProductReviews,
  listReviewsByUserId,
  updateProductRating,
  updateReview,
  userHasPurchasedProduct,
} from "../repositories/reviews.js";

function toRatingMap(rows) {
  const ratingMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of rows) {
    ratingMap[row.rating] = row.count;
  }
  return ratingMap;
}

function normalizeRating(value) {
  return Number.parseInt(value, 10);
}

function cleanText(value, maxLength = null) {
  const text = String(value || "").trim();
  return maxLength ? text.slice(0, maxLength) : text;
}

async function getProductReviews(productId, params) {
  const [{ reviews, total, page, perPage }, stats] = await Promise.all([
    listProductReviews(productId, params),
    getProductReviewStats(productId),
  ]);

  const ratingMap = toRatingMap(stats);
  const totalRatings = Object.values(ratingMap).reduce((sum, value) => sum + value, 0);
  const avgRating = totalRatings
    ? Number(
        (
          Object.entries(ratingMap).reduce(
            (sum, [rating, count]) => sum + Number(rating) * count,
            0
          ) / totalRatings
        ).toFixed(1)
      )
    : 0;

  return {
    success: true,
    error: false,
    data: {
      reviews,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      currentPage: page,
      totalReviews: total,
    },
    summary: { avgRating, totalRatings, ratingMap },
  };
}

async function createReviewRecord(userId, body) {
  const productId = Number(body.productId);
  const rating = normalizeRating(body.rating);

  if (!productId || !rating) {
    throw new HttpError(400, "productId and rating are required");
  }

  if (rating < 1 || rating > 5) {
    throw new HttpError(400, "Rating must be between 1 and 5");
  }

  const product = await findProductById(productId);
  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  const existing = await findUserReview(userId, productId);
  if (existing) {
    throw new HttpError(400, "You have already reviewed this product");
  }

  const review = await createReview({
    userId,
    productId,
    rating,
    title: cleanText(body.title, 120),
    comment: cleanText(body.comment),
    verified: await userHasPurchasedProduct(userId, productId),
  });

  await updateProductRating(productId);

  return {
    success: true,
    error: false,
    message: "Review submitted successfully",
    data: review,
  };
}

async function updateReviewRecord(userId, id, body) {
  const existing = await findReviewById(id);
  if (!existing || existing.userId !== Number(userId)) {
    throw new HttpError(404, "Review not found");
  }

  let nextRating;
  if (body.rating !== undefined) {
    nextRating = normalizeRating(body.rating);
    if (nextRating < 1 || nextRating > 5) {
      throw new HttpError(400, "Rating must be between 1 and 5");
    }
  }

  const review = await updateReview(id, {
    rating: nextRating,
    title: body.title !== undefined ? cleanText(body.title, 120) : undefined,
    comment: body.comment !== undefined ? cleanText(body.comment) : undefined,
  });

  await updateProductRating(existing.productId);

  return {
    success: true,
    error: false,
    message: "Review updated",
    data: review,
  };
}

async function deleteReviewRecord(userId, id) {
  const review = await findReviewById(id);
  if (!review) {
    throw new HttpError(404, "Review not found");
  }

  if (review.userId !== Number(userId)) {
    const user = await findUserById(userId);
    if (!user || user.role !== "admin") {
      throw new HttpError(403, "Access denied");
    }
  }

  await deleteReview(id);
  await updateProductRating(review.productId);

  return {
    success: true,
    error: false,
    message: "Review deleted",
  };
}

async function getMyReviews(userId) {
  return {
    success: true,
    error: false,
    data: await listReviewsByUserId(userId),
  };
}

async function checkMyReview(userId, productId) {
  return {
    success: true,
    error: false,
    review: await findUserReview(userId, productId),
  };
}

export {
  checkMyReview,
  createReviewRecord,
  deleteReviewRecord,
  getMyReviews,
  getProductReviews,
  updateReviewRecord,
};
