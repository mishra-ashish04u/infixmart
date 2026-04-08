import Coupon from "../models/Coupon.js";
import { Op } from "sequelize";

// ── Admin: GET /api/admin/coupons ─────────────────────────────────────────────
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [["createdAt", "DESC"]] });
    return res.status(200).json({ coupons, success: true, error: false });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true, success: false });
  }
};

// ── Admin: POST /api/admin/coupons ────────────────────────────────────────────
export const createCoupon = async (req, res) => {
  try {
    const { code, description, type, value, minOrderValue, maxDiscount, usageLimit, isActive, expiresAt } = req.body;

    if (!code || !value) {
      return res.status(400).json({ message: "Code and value are required", error: true, success: false });
    }

    const existing = await Coupon.findOne({ where: { code: code.toUpperCase().trim() } });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists", error: true, success: false });
    }

    const coupon = await Coupon.create({
      code:          code.toUpperCase().trim(),
      description:   description || null,
      type:          type || "percent",
      value:         Number(value),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount:   maxDiscount ? Number(maxDiscount) : null,
      usageLimit:    usageLimit ? Number(usageLimit) : null,
      isActive:      isActive !== false,
      expiresAt:     expiresAt || null,
    });

    return res.status(201).json({ coupon, message: "Coupon created successfully", success: true, error: false });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true, success: false });
  }
};

// ── Admin: PUT /api/admin/coupons/:id ─────────────────────────────────────────
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found", error: true, success: false });
    }

    const { code, description, type, value, minOrderValue, maxDiscount, usageLimit, isActive, expiresAt } = req.body;

    await coupon.update({
      code:          code ? code.toUpperCase().trim() : coupon.code,
      description:   description ?? coupon.description,
      type:          type ?? coupon.type,
      value:         value !== undefined ? Number(value) : coupon.value,
      minOrderValue: minOrderValue !== undefined ? Number(minOrderValue) : coupon.minOrderValue,
      maxDiscount:   maxDiscount !== undefined ? (maxDiscount ? Number(maxDiscount) : null) : coupon.maxDiscount,
      usageLimit:    usageLimit !== undefined ? (usageLimit ? Number(usageLimit) : null) : coupon.usageLimit,
      isActive:      isActive !== undefined ? isActive : coupon.isActive,
      expiresAt:     expiresAt !== undefined ? (expiresAt || null) : coupon.expiresAt,
    });

    return res.status(200).json({ coupon, message: "Coupon updated", success: true, error: false });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true, success: false });
  }
};

// ── Admin: DELETE /api/admin/coupons/:id ──────────────────────────────────────
export const deleteCoupon = async (req, res) => {
  try {
    const deleted = await Coupon.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: "Coupon not found", error: true, success: false });
    }
    return res.status(200).json({ message: "Coupon deleted", success: true, error: false });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true, success: false });
  }
};

// ── Public: POST /api/coupon/apply ────────────────────────────────────────────
export const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ error: true, message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({
      where: { code: code.toUpperCase().trim(), isActive: true },
    });

    if (!coupon) {
      return res.status(200).json({ error: true, message: "Invalid or expired coupon code" });
    }

    // Check expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(200).json({ error: true, message: "This coupon has expired" });
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res.status(200).json({ error: true, message: "This coupon has reached its usage limit" });
    }

    // Check min order value
    const total = Number(cartTotal) || 0;
    if (total < coupon.minOrderValue) {
      return res.status(200).json({
        error: true,
        message: `Minimum order value ₹${coupon.minOrderValue} required for this coupon`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "percent") {
      discount = Math.round((total * coupon.value) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, total); // can't discount more than total

    return res.status(200).json({
      error: false,
      discount,
      message: `Coupon applied! You save ₹${discount}`,
      couponCode: coupon.code,
      type: coupon.type,
      value: coupon.value,
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
};
