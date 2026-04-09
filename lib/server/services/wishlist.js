import { HttpError } from "../api/http.js";
import {
  createWishlistItem,
  deleteWishlistItem,
  findWishlistItemByUserAndProduct,
  listWishlistItemsByUserId,
} from "../repositories/wishlist.js";

async function addToWishlist(userId, body) {
  const productId = Number(body?.productId);
  if (!productId) {
    throw new HttpError(400, "Product ID is required");
  }

  const existing = await findWishlistItemByUserAndProduct(userId, productId);
  if (existing) {
    throw new HttpError(400, "Product already in My List");
  }

  return {
    message: "Product added to My List",
    success: true,
    error: false,
    data: await createWishlistItem({
      productId,
      userId,
      productTitle: String(body?.productTitle || "").trim(),
      image: String(body?.image || ""),
      rating: Number(body?.rating || 0),
      price: Number(body?.price || 0),
      oldPrice: Number(body?.oldPrice || 0),
      discount: Number(body?.discount || 0),
      brand: String(body?.brand || ""),
    }),
  };
}

async function removeFromWishlist(userId, id) {
  const deleted = await deleteWishlistItem(id, userId);
  if (!deleted) {
    throw new HttpError(404, "Item not found in My List");
  }

  return {
    message: "Item removed from My List",
    success: true,
    error: false,
  };
}

async function getWishlist(userId) {
  return {
    message: "My List fetched successfully",
    success: true,
    error: false,
    data: await listWishlistItemsByUserId(userId),
  };
}

export { addToWishlist, getWishlist, removeFromWishlist };
