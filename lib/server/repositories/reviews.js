import { execute, query } from "../db/mysql.js";

function mapReview(row) {
  if (!row) {
    return null;
  }

  let images = [];
  try { images = JSON.parse(row.images || "[]"); } catch {}

  return {
    id: row.id,
    rating: Number(row.rating),
    title: row.title,
    comment: row.comment,
    verified: Boolean(row.verified),
    images: Array.isArray(images) ? images : [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    userId: row.userId,
    productId: row.productId,
    user:
      row.userName || row.userAvatar
        ? { name: row.userName || "User", avatar: row.userAvatar || "" }
        : undefined,
  };
}

async function listProductReviews(productId, { page = 1, perPage = 10 } = {}) {
  const offset = (page - 1) * perPage;
  const [countRows, reviewRows] = await Promise.all([
    query(
      `SELECT COUNT(*) AS total
       FROM Reviews
       WHERE productId = :productId`,
      { productId }
    ),
    query(
      `SELECT
         r.id,
         r.userId,
         r.productId,
         r.rating,
         r.title,
         r.comment,
         r.verified,
         r.images,
         r.createdAt,
         r.updatedAt,
         u.name AS userName,
         u.avatar AS userAvatar
       FROM Reviews r
       LEFT JOIN Users u ON u.id = r.userId
       WHERE r.productId = :productId
       ORDER BY r.createdAt DESC
       LIMIT :limit OFFSET :offset`,
      { productId, limit: perPage, offset }
    ),
  ]);

  return {
    reviews: reviewRows.map(mapReview),
    total: Number(countRows[0]?.total || 0),
    page,
    perPage,
  };
}

async function getProductReviewStats(productId) {
  const rows = await query(
    `SELECT rating, COUNT(*) AS count
     FROM Reviews
     WHERE productId = :productId
     GROUP BY rating`,
    { productId }
  );

  return rows.map((row) => ({
    rating: Number(row.rating),
    count: Number(row.count),
  }));
}

async function findReviewById(id) {
  const rows = await query(
    `SELECT
       r.id,
       r.userId,
       r.productId,
       r.rating,
       r.title,
       r.comment,
       r.verified,
       r.createdAt,
       r.updatedAt,
       u.name AS userName,
       u.avatar AS userAvatar
     FROM Reviews r
     LEFT JOIN Users u ON u.id = r.userId
     WHERE r.id = :id
     LIMIT 1`,
    { id }
  );

  return mapReview(rows[0]);
}

async function findUserReview(userId, productId) {
  const rows = await query(
    `SELECT
       r.id,
       r.userId,
       r.productId,
       r.rating,
       r.title,
       r.comment,
       r.verified,
       r.createdAt,
       r.updatedAt,
       u.name AS userName,
       u.avatar AS userAvatar
     FROM Reviews r
     LEFT JOIN Users u ON u.id = r.userId
     WHERE r.userId = :userId AND r.productId = :productId
     LIMIT 1`,
    { userId, productId }
  );

  return mapReview(rows[0]);
}

async function listReviewsByUserId(userId) {
  const rows = await query(
    `SELECT
       r.id,
       r.userId,
       r.productId,
       r.rating,
       r.title,
       r.comment,
       r.verified,
       r.createdAt,
       r.updatedAt,
       u.name AS userName,
       u.avatar AS userAvatar
     FROM Reviews r
     LEFT JOIN Users u ON u.id = r.userId
     WHERE r.userId = :userId
     ORDER BY r.createdAt DESC`,
    { userId }
  );

  return rows.map(mapReview);
}

async function createReview(payload) {
  const result = await execute(
    `INSERT INTO Reviews (
      userId,
      productId,
      rating,
      title,
      comment,
      verified,
      images,
      createdAt,
      updatedAt
    ) VALUES (
      :userId,
      :productId,
      :rating,
      :title,
      :comment,
      :verified,
      :images,
      NOW(),
      NOW()
    )`,
    {
      ...payload,
      verified: payload.verified ? 1 : 0,
      images: payload.images ? JSON.stringify(payload.images) : JSON.stringify([]),
    }
  );

  return findReviewById(result.insertId);
}

async function updateReview(id, payload) {
  const serialized = {
    ...payload,
    verified:
      payload.verified === undefined ? undefined : payload.verified ? 1 : 0,
  };
  const entries = Object.entries(serialized).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return findReviewById(id);
  }

  const setClause = entries.map(([key]) => `\`${key}\` = :${key}`).join(", ");
  await execute(
    `UPDATE Reviews
     SET ${setClause}, updatedAt = NOW()
     WHERE id = :id`,
    { id, ...Object.fromEntries(entries) }
  );

  return findReviewById(id);
}

async function deleteReview(id) {
  const result = await execute(
    `DELETE FROM Reviews
     WHERE id = :id`,
    { id }
  );

  return result.affectedRows > 0;
}

async function userHasPurchasedProduct(userId, productId) {
  const rows = await query(
    `SELECT o.id
     FROM Orders o
     INNER JOIN OrderItems oi ON oi.orderId = o.id
     WHERE o.userId = :userId
       AND o.status IN ('delivered', 'shipped')
       AND oi.productId = :productId
     LIMIT 1`,
    { userId, productId }
  );

  return Boolean(rows[0]);
}

async function updateProductRating(productId) {
  const rows = await query(
    `SELECT AVG(rating) AS avgRating
     FROM Reviews
     WHERE productId = :productId`,
    { productId }
  );

  const rating = rows[0]?.avgRating ? Number(Number(rows[0].avgRating).toFixed(1)) : 0;
  await execute(
    `UPDATE Products
     SET rating = :rating, updatedAt = NOW()
     WHERE id = :productId`,
    { rating, productId }
  );
}

export {
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
};
