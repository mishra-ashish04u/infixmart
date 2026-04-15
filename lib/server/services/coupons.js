import { HttpError } from "../api/http.js";
import {
  createCoupon,
  deleteCoupon,
  findCouponByCode,
  findCouponById,
  listCoupons,
  updateCoupon,
} from "../repositories/coupons.js";
import { query } from "../db/mysql.js";

function normalizeCode(code) {
  return String(code || "").toUpperCase().trim();
}

function normalizeRestrictionType(type) {
  if (type === "first_order" || type === "email") return type;
  return "none";
}

function calculateCouponDiscount(coupon, total) {
  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.round((total * coupon.value) / 100);
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = Number(coupon.value || 0);
  }

  return Math.min(Math.round(discount), total);
}

// Returns the user's email and paid order count — used for restriction checks.
async function loadUserRestrictionInfo(userId) {
  if (!userId) return { email: null, paidOrderCount: 0 };

  const [userRows, countRows] = await Promise.all([
    query(`SELECT email FROM Users WHERE id = :userId LIMIT 1`, { userId }),
    query(
      `SELECT COUNT(*) AS cnt FROM Orders WHERE userId = :userId AND isPaid = 1`,
      { userId }
    ),
  ]);

  return {
    email: userRows[0]?.email || null,
    paidOrderCount: Number(countRows[0]?.cnt || 0),
  };
}

// Shared restriction validator — used by both applyCouponCode (preview) and
// validateCoupon (order creation). Pass conn only in the order-creation path.
async function checkCouponRestrictions(coupon, userId, conn = null) {
  if (coupon.restrictionType === "none") return; // no restriction — everyone can use it

  if (!userId) {
    throw new HttpError(401, "Please log in to use this coupon");
  }

  if (coupon.restrictionType === "email") {
    const rows = conn
      ? await (async () => { const [r] = await conn.query(`SELECT email FROM Users WHERE id = :userId LIMIT 1`, { userId }); return r; })()
      : await query(`SELECT email FROM Users WHERE id = :userId LIMIT 1`, { userId });

    const userEmail = String(rows[0]?.email || "").toLowerCase().trim();
    const restricted = String(coupon.restrictedEmail || "").toLowerCase().trim();

    if (!restricted) {
      throw new HttpError(400, "This coupon has no valid email restriction configured");
    }
    if (userEmail !== restricted) {
      throw new HttpError(403, "This coupon is not valid for your account");
    }
    return;
  }

  if (coupon.restrictionType === "first_order") {
    const rows = conn
      ? await (async () => { const [r] = await conn.query(`SELECT COUNT(*) AS cnt FROM Orders WHERE userId = :userId AND isPaid = 1`, { userId }); return r; })()
      : await query(`SELECT COUNT(*) AS cnt FROM Orders WHERE userId = :userId AND isPaid = 1`, { userId });

    const paidOrderCount = Number(rows[0]?.cnt || 0);
    if (paidOrderCount > 0) {
      throw new HttpError(403, "This coupon is only valid for first-time orders");
    }
    return;
  }
}

async function getAllCouponsAdmin() {
  return { coupons: await listCoupons(), success: true, error: false };
}

async function createCouponRecord(body) {
  const code = normalizeCode(body?.code);
  const value = Number(body?.value);
  if (!code || !value) {
    throw new HttpError(400, "Code and value are required");
  }

  const restrictionType = normalizeRestrictionType(body?.restrictionType);
  const restrictedEmail =
    restrictionType === "email"
      ? String(body?.restrictedEmail || "").toLowerCase().trim() || null
      : null;

  if (restrictionType === "email" && !restrictedEmail) {
    throw new HttpError(400, "An email address is required for email-restricted coupons");
  }

  const existing = await findCouponByCode(code);
  if (existing) {
    throw new HttpError(400, "Coupon code already exists");
  }

  return {
    coupon: await createCoupon({
      code,
      description: body?.description || null,
      type: body?.type || "percent",
      value,
      minOrderValue: Number(body?.minOrderValue || 0),
      maxDiscount: body?.maxDiscount ? Number(body.maxDiscount) : null,
      usageLimit: body?.usageLimit ? Number(body.usageLimit) : null,
      isActive: body?.isActive !== false,
      expiresAt: body?.expiresAt || null,
      restrictionType,
      restrictedEmail,
    }),
    message: "Coupon created successfully",
    success: true,
    error: false,
  };
}

async function updateCouponRecord(id, body) {
  const existing = await findCouponById(id);
  if (!existing) {
    throw new HttpError(404, "Coupon not found");
  }

  const restrictionType =
    body?.restrictionType !== undefined
      ? normalizeRestrictionType(body.restrictionType)
      : existing.restrictionType;

  const restrictedEmail =
    restrictionType === "email"
      ? String(body?.restrictedEmail ?? existing.restrictedEmail ?? "").toLowerCase().trim() || null
      : null;

  if (restrictionType === "email" && !restrictedEmail) {
    throw new HttpError(400, "An email address is required for email-restricted coupons");
  }

  return {
    coupon: await updateCoupon(id, {
      code: body?.code ? normalizeCode(body.code) : existing.code,
      description: body?.description ?? existing.description,
      type: body?.type ?? existing.type,
      value: body?.value !== undefined ? Number(body.value) : existing.value,
      minOrderValue:
        body?.minOrderValue !== undefined
          ? Number(body.minOrderValue)
          : existing.minOrderValue,
      maxDiscount:
        body?.maxDiscount !== undefined
          ? body.maxDiscount ? Number(body.maxDiscount) : null
          : existing.maxDiscount,
      usageLimit:
        body?.usageLimit !== undefined
          ? body.usageLimit ? Number(body.usageLimit) : null
          : existing.usageLimit,
      isActive: body?.isActive !== undefined ? body.isActive : existing.isActive,
      expiresAt: body?.expiresAt !== undefined ? body.expiresAt || null : existing.expiresAt,
      restrictionType,
      restrictedEmail,
    }),
    message: "Coupon updated",
    success: true,
    error: false,
  };
}

async function deleteCouponRecord(id) {
  const deleted = await deleteCoupon(id);
  if (!deleted) {
    throw new HttpError(404, "Coupon not found");
  }

  return { message: "Coupon deleted", success: true, error: false };
}

// userId is optional — guests can preview general coupons but not restricted ones.
async function applyCouponCode(body, userId = null) {
  const code = normalizeCode(body?.code);
  if (!code) {
    return { error: true, message: "Coupon code is required" };
  }

  const coupon = await findCouponByCode(code);
  if (!coupon || !coupon.isActive) {
    return { error: true, message: "Invalid or expired coupon code" };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { error: true, message: "This coupon has expired" };
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { error: true, message: "This coupon has reached its usage limit" };
  }

  const total = Number(body?.cartTotal) || 0;
  if (total < coupon.minOrderValue) {
    return {
      error: true,
      message: `Minimum order value ₹${coupon.minOrderValue} required for this coupon`,
    };
  }

  // Validate restrictions — surface a clear message to the user.
  try {
    await checkCouponRestrictions(coupon, userId);
  } catch (err) {
    return { error: true, message: err.message || "This coupon cannot be applied to your account" };
  }

  const discount = calculateCouponDiscount(coupon, total);
  return {
    error: false,
    discount,
    message: `Coupon applied! You save ₹${discount}`,
    couponCode: coupon.code,
    type: coupon.type,
    value: coupon.value,
  };
}

export {
  applyCouponCode,
  checkCouponRestrictions,
  createCouponRecord,
  deleteCouponRecord,
  getAllCouponsAdmin,
  updateCouponRecord,
};
