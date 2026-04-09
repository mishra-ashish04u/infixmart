import { HttpError } from "../api/http.js";
import { findProductById } from "../repositories/products.js";
import {
  clearCartItems,
  createCartItem,
  deleteCartItem,
  findCartItemByUserAndProduct,
  listCartItemsByUserId,
  updateCartItemQuantity,
} from "../repositories/cart.js";

async function addToCart(userId, body) {
  const productId = Number(body?.productId);
  if (!productId) {
    throw new HttpError(400, "Product ID is required");
  }

  const product = await findProductById(productId);
  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  const existing = await findCartItemByUserAndProduct(userId, productId);
  if (existing) {
    return { message: "Product already in cart", error: true, success: false };
  }

  return {
    data: await createCartItem(userId, productId, 1),
    message: "Product added to cart successfully",
    error: false,
    success: true,
  };
}

async function getCartItems(userId) {
  return {
    cartItem: await listCartItemsByUserId(userId),
    message: "Cart items fetched successfully",
    error: false,
    success: true,
  };
}

async function updateCartQuantity(userId, body) {
  const cartItemId = Number(body?._id);
  const quantity = Number(body?.quantity);
  if (!cartItemId || !quantity) {
    throw new HttpError(400, "Cart item ID and quantity are required");
  }
  if (quantity < 1) {
    throw new HttpError(400, "Quantity must be at least 1");
  }

  const updated = await updateCartItemQuantity(cartItemId, userId, quantity);
  if (!updated) {
    throw new HttpError(404, "Cart item not found");
  }

  return {
    message: "Cart item quantity updated successfully",
    error: false,
    success: true,
  };
}

async function removeCartItem(userId, body) {
  const cartItemId = Number(body?._id);
  if (!cartItemId) {
    throw new HttpError(400, "Cart item ID is required");
  }

  const deleted = await deleteCartItem(cartItemId, userId);
  if (!deleted) {
    throw new HttpError(404, "Cart item not found");
  }

  return {
    message: "Cart item removed successfully",
    error: false,
    success: true,
  };
}

async function clearCart(userId) {
  await clearCartItems(userId);
  return { message: "Cart cleared", error: false, success: true };
}

export { addToCart, clearCart, getCartItems, removeCartItem, updateCartQuantity };
