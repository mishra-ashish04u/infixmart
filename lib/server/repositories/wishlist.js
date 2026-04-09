import { execute, query } from "../db/mysql.js";

function mapWishlistItem(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    rating: Number(row.rating || 0),
    price: Number(row.price || 0),
    oldPrice: Number(row.oldPrice || 0),
    discount: Number(row.discount || 0),
  };
}

async function listWishlistItemsByUserId(userId) {
  const rows = await query(
    `SELECT
       id,
       productId,
       userId,
       productTitle,
       image,
       rating,
       price,
       oldPrice,
       discount,
       brand,
       createdAt,
       updatedAt
     FROM MyLists
     WHERE userId = :userId
     ORDER BY createdAt DESC`,
    { userId }
  );

  return rows.map(mapWishlistItem);
}

async function findWishlistItemByUserAndProduct(userId, productId) {
  const rows = await query(
    `SELECT
       id,
       productId,
       userId,
       productTitle,
       image,
       rating,
       price,
       oldPrice,
       discount,
       brand,
       createdAt,
       updatedAt
     FROM MyLists
     WHERE userId = :userId AND productId = :productId
     LIMIT 1`,
    { userId, productId }
  );

  return mapWishlistItem(rows[0]);
}

async function createWishlistItem(payload) {
  const result = await execute(
    `INSERT INTO MyLists (
      productId,
      userId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      discount,
      brand,
      createdAt,
      updatedAt
    ) VALUES (
      :productId,
      :userId,
      :productTitle,
      :image,
      :rating,
      :price,
      :oldPrice,
      :discount,
      :brand,
      NOW(),
      NOW()
    )`,
    payload
  );

  return { id: result.insertId, _id: result.insertId, ...payload };
}

async function deleteWishlistItem(id, userId) {
  const result = await execute(
    `DELETE FROM MyLists
     WHERE id = :id AND userId = :userId`,
    { id, userId }
  );

  return result.affectedRows > 0;
}

export {
  createWishlistItem,
  deleteWishlistItem,
  findWishlistItemByUserAndProduct,
  listWishlistItemsByUserId,
};
