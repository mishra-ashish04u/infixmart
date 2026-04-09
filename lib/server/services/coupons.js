import { ok } from "../api/http.js";
import {
  createCoupon,
  deleteCoupon,
  findCouponByCode,
  findCouponById,
  listCoupons,
  updateCoupon,
} from "../repositories/coupons.js";

function normalizeCode(code) {
  return String(code || "").toUpperCase().trim();
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

async function getAllCouponsAdmin() {
  return { coupons: await listCoupons(), success: true, error: false };
}

async function createCouponRecord(body) {
  const code = normalizeCode(body?.code);
  const value = Number(body?.value);
  if (!code || !value) {
    return ok({ message: "Code and value are required", error: true, success: false }, 400);
  }

  const existing = await findCouponByCode(code);
  if (existing) {
    return ok({ message: "Coupon code already exists", error: true, success: false }, 400);
  }

  return ok(
    {
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
      }),
      message: "Coupon created successfully",
      success: true,
      error: false,
    },
    201
  );
}

async function updateCouponRecord(id, body) {
  const existing = await findCouponById(id);
  if (!existing) {
    return ok({ message: "Coupon not found", error: true, success: false }, 404);
  }

  return ok({
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
          ? body.maxDiscount
            ? Number(body.maxDiscount)
            : null
          : existing.maxDiscount,
      usageLimit:
        body?.usageLimit !== undefined
          ? body.usageLimit
            ? Number(body.usageLimit)
            : null
          : existing.usageLimit,
      isActive: body?.isActive !== undefined ? body.isActive : existing.isActive,
      expiresAt: body?.expiresAt !== undefined ? body.expiresAt || null : existing.expiresAt,
    }),
    message: "Coupon updated",
    success: true,
    error: false,
  });
}

async function deleteCouponRecord(id) {
  const deleted = await deleteCoupon(id);
  if (!deleted) {
    return ok({ message: "Coupon not found", error: true, success: false }, 404);
  }

  return ok({ message: "Coupon deleted", success: true, error: false });
}

async function applyCouponCode(body) {
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
      message: `Minimum order value Rs.${coupon.minOrderValue} required for this coupon`,
    };
  }

  const discount = calculateCouponDiscount(coupon, total);
  return {
    error: false,
    discount,
    message: `Coupon applied! You save Rs.${discount}`,
    couponCode: coupon.code,
    type: coupon.type,
    value: coupon.value,
  };
}

export {
  applyCouponCode,
  createCouponRecord,
  deleteCouponRecord,
  getAllCouponsAdmin,
  updateCouponRecord,
};
