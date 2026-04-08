import Address from "../models/Address.js";
import CartProduct from "../models/CartProduct.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import StoreSettings from "../models/StoreSettings.js";

const DEFAULT_FREE_SHIPPING_THRESHOLD = 999;
const DEFAULT_SHIPPING_COST = 49;

export const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

export const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const toPositiveInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getCouponDiscount = (coupon, total) => {
  if (!coupon) return 0;

  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.round((total * coupon.value) / 100);
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = Number(coupon.value || 0);
  }

  return Math.min(roundMoney(discount), roundMoney(total));
};

const normalizeShippingAddressInput = (shippingAddress) => {
  if (!shippingAddress || typeof shippingAddress !== "object") {
    throw createHttpError(400, "Delivery address is required.");
  }

  const normalized = {
    name: String(shippingAddress.name || "").trim(),
    phone: String(shippingAddress.phone || shippingAddress.mobile || "").trim(),
    address: String(shippingAddress.address || "").trim(),
    city: String(shippingAddress.city || shippingAddress.townCity || "").trim(),
    state: String(shippingAddress.state || "").trim(),
    postalCode: String(shippingAddress.postalCode || shippingAddress.pincode || "").trim(),
    country: String(shippingAddress.country || "India").trim() || "India",
  };

  if (!normalized.name || !normalized.phone || !normalized.address || !normalized.city || !normalized.state || !normalized.postalCode) {
    throw createHttpError(400, "Delivery address is incomplete.");
  }

  return normalized;
};

const mapAddressRecord = (address) => ({
  name: address.name,
  phone: address.mobile,
  address: address.flatHouse + (address.areaStreet ? `, ${address.areaStreet}` : ""),
  city: address.townCity,
  state: address.state,
  postalCode: address.pincode,
  country: address.country || "India",
});

const resolveShippingAddress = async ({ userId, addressId, shippingAddress, transaction }) => {
  if (addressId) {
    const address = await Address.findOne({
      where: { id: addressId, userId },
      transaction,
    });

    if (!address) {
      throw createHttpError(400, "Selected address was not found.");
    }

    return mapAddressRecord(address);
  }

  return normalizeShippingAddressInput(shippingAddress);
};

const loadCheckoutSettings = async (transaction) => {
  const rows = await StoreSettings.findAll({ transaction, raw: true });
  const map = rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  const gstPercent = Math.max(0, Number(map.gst_percent) || 0);
  const cartMilestones = safeJsonParse(map.cart_milestones || "[]", []);

  return {
    gstPercent,
    cartMilestones: Array.isArray(cartMilestones) ? cartMilestones : [],
  };
};

const normalizeCheckoutItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError(400, "Your cart is empty.");
  }

  const merged = new Map();

  for (const rawItem of items) {
    const productId = toPositiveInteger(rawItem?.product ?? rawItem?.productId);
    const qty = toPositiveInteger(rawItem?.qty ?? rawItem?.quantity);
    const cartItemId = toPositiveInteger(rawItem?.cartItemId ?? rawItem?.id);

    if (!productId || !qty) {
      throw createHttpError(400, "Invalid checkout item payload.");
    }

    const existing = merged.get(productId) || { productId, qty: 0, cartItemIds: [] };
    existing.qty += qty;
    if (cartItemId) {
      existing.cartItemIds.push(cartItemId);
    }
    merged.set(productId, existing);
  }

  return [...merged.values()];
};

const findCoupon = async ({ couponCode, baseTotal, transaction }) => {
  if (!couponCode) {
    return { couponId: null, couponCode: null, couponDiscount: 0 };
  }

  const coupon = await Coupon.findOne({
    where: { code: String(couponCode).toUpperCase().trim(), isActive: true },
    transaction,
  });

  if (!coupon) {
    throw createHttpError(400, "Invalid or expired coupon code.");
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw createHttpError(400, "This coupon has expired.");
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw createHttpError(400, "This coupon has reached its usage limit.");
  }

  if (baseTotal < coupon.minOrderValue) {
    throw createHttpError(400, `Minimum order value Rs.${coupon.minOrderValue} required for this coupon.`);
  }

  return {
    couponId: coupon.id,
    couponCode: coupon.code,
    couponDiscount: getCouponDiscount(coupon, baseTotal),
  };
};

export const buildCheckoutFromItems = async ({
  userId,
  items,
  addressId,
  shippingAddress,
  couponCode,
  transaction = null,
  lockProducts = false,
}) => {
  const normalizedItems = normalizeCheckoutItems(items);
  const [{ gstPercent, cartMilestones }, resolvedShippingAddress] = await Promise.all([
    loadCheckoutSettings(transaction),
    resolveShippingAddress({ userId, addressId, shippingAddress, transaction }),
  ]);

  const secureOrderItems = [];
  const cartItemIds = [];
  let itemsPrice = 0;

  for (const item of normalizedItems) {
    const product = await Product.findByPk(item.productId, {
      transaction,
      lock: lockProducts && transaction ? transaction.LOCK.UPDATE : undefined,
    });

    if (!product) {
      throw createHttpError(400, `Product ${item.productId} not found.`);
    }

    if (product.countInStock < item.qty) {
      throw createHttpError(400, `Insufficient stock for "${product.name}". Only ${product.countInStock} left.`);
    }

    const unitPrice = roundMoney(product.price);
    itemsPrice += unitPrice * item.qty;
    secureOrderItems.push({
      productId: product.id,
      name: product.name,
      image: product.images?.[0] || "",
      price: unitPrice,
      qty: item.qty,
    });
    cartItemIds.push(...item.cartItemIds);
  }

  itemsPrice = roundMoney(itemsPrice);
  const milestoneShippingFree = cartMilestones.some(
    (milestone) =>
      milestone &&
      milestone.type === "free_shipping" &&
      milestone.enabled !== false &&
      itemsPrice >= Number(milestone.amount || 0)
  );
  const shippingPrice =
    itemsPrice >= DEFAULT_FREE_SHIPPING_THRESHOLD || milestoneShippingFree
      ? 0
      : DEFAULT_SHIPPING_COST;
  const gstAmount = roundMoney(itemsPrice * (gstPercent / 100));
  const baseTotal = roundMoney(itemsPrice + shippingPrice + gstAmount);
  const coupon = await findCoupon({ couponCode, baseTotal, transaction });
  const totalPrice = roundMoney(baseTotal - coupon.couponDiscount);

  return {
    userId,
    addressId: addressId ? Number(addressId) : null,
    shippingAddress: resolvedShippingAddress,
    secureOrderItems,
    cartItemIds: [...new Set(cartItemIds)],
    itemsPrice,
    shippingPrice,
    gstAmount,
    totalPrice,
    gstPercent,
    milestoneShippingFree,
    couponId: coupon.couponId,
    couponCode: coupon.couponCode,
    couponDiscount: coupon.couponDiscount,
    currency: "INR",
  };
};

export const buildCheckoutFromCart = async ({
  userId,
  addressId,
  shippingAddress,
  couponCode,
  transaction = null,
  lockProducts = false,
}) => {
  const cartItems = await CartProduct.findAll({
    where: { userId },
    transaction,
  });

  const checkoutItems = cartItems.map((item) => ({
    cartItemId: item.id,
    productId: item.productId,
    qty: item.quantity,
  }));

  return buildCheckoutFromItems({
    userId,
    items: checkoutItems,
    addressId,
    shippingAddress,
    couponCode,
    transaction,
    lockProducts,
  });
};
