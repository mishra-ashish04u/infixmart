import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import { sequelize } from "../config/connectDB.js";
import sendOrderEmail from "../utils/sendOrderEmail.js";

const withItems = { include: [{ model: OrderItem, as: "orderItems" }] };

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

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

export const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentResult,
      shippingPrice,
      gstAmount,
      totalPrice,
      isPaid,
      paidAt,
      couponCode,
    } = req.body;

    if (!items || !items.length) {
      await t.rollback();
      return res.status(400).json({ message: "No order items", error: true, success: false });
    }

    let secureItemsPrice = 0;
    const secureOrderItems = [];

    for (const item of items) {
      const productId = item.product || item.productId;
      const qty = item.qty || item.quantity || 1;

      const product = await Product.findByPk(productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!product) {
        await t.rollback();
        return res.status(400).json({ message: `Product ${productId} not found`, error: true, success: false });
      }
      if (product.countInStock < qty) {
        await t.rollback();
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.countInStock} left.`,
          error: true,
          success: false,
        });
      }

      secureItemsPrice += product.price * qty;
      secureOrderItems.push({
        orderId: null,
        productId: product.id,
        name: product.name,
        image: product.images?.[0] || "",
        price: roundMoney(product.price),
        qty,
      });

      await product.update({ countInStock: product.countInStock - qty }, { transaction: t });
    }

    if (Number(shippingPrice) < 0 || Number(gstAmount) < 0) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid price modifiers.", error: true, success: false });
    }

    const secureShippingPrice = roundMoney(shippingPrice || 0);
    const secureGstAmount = roundMoney(gstAmount || 0);
    const backendBaseTotal = roundMoney(secureItemsPrice + secureShippingPrice + secureGstAmount);

    let coupon = null;
    let couponDiscount = 0;

    if (couponCode) {
      coupon = await Coupon.findOne({
        where: { code: String(couponCode).toUpperCase().trim(), isActive: true },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!coupon) {
        await t.rollback();
        return res.status(400).json({ message: "Invalid or expired coupon code", error: true, success: false });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        await t.rollback();
        return res.status(400).json({ message: "This coupon has expired", error: true, success: false });
      }
      if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
        await t.rollback();
        return res.status(400).json({ message: "This coupon has reached its usage limit", error: true, success: false });
      }
      if (backendBaseTotal < coupon.minOrderValue) {
        await t.rollback();
        return res.status(400).json({
          message: `Minimum order value ₹${coupon.minOrderValue} required for this coupon`,
          error: true,
          success: false,
        });
      }

      couponDiscount = getCouponDiscount(coupon, backendBaseTotal);
    }

    const secureTotalPrice = roundMoney(backendBaseTotal - couponDiscount);
    const submittedTotalPrice = roundMoney(totalPrice || 0);

    if (Math.abs(submittedTotalPrice - secureTotalPrice) > 0.5) {
      console.error(`[SECURITY ALERT] Order rejected for User ${req.userId}. Expected ${secureTotalPrice}, got ${submittedTotalPrice}`);
      await t.rollback();
      return res.status(400).json({
        message: "Payment validation failed: The total amount does not match the product value.",
        error: true,
        success: false,
      });
    }

    const order = await Order.create(
      {
        userId: req.userId,
        items,
        shippingAddress: shippingAddress || {},
        paymentMethod: paymentMethod || "COD",
        paymentResult: {
          ...(paymentResult || {}),
          ...(coupon ? { couponCode: coupon.code, couponDiscount } : {}),
        },
        itemsPrice: roundMoney(secureItemsPrice),
        shippingPrice: secureShippingPrice,
        gstAmount: secureGstAmount,
        totalPrice: secureTotalPrice,
        isPaid: isPaid === true,
        paidAt: isPaid ? (paidAt || new Date()) : null,
      },
      { transaction: t }
    );

    const orderItemsData = secureOrderItems.map((item) => ({
      ...item,
      orderId: order.id,
    }));
    await OrderItem.bulkCreate(orderItemsData, { transaction: t });

    if (coupon) {
      await coupon.increment("usageCount", { by: 1, transaction: t });
    }

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, withItems);

    User.findByPk(req.userId)
      .then((user) => sendOrderEmail(fullOrder, user))
      .catch((err) => console.error("[EMAIL ERROR]", err.message));

    return res.status(201).json({ order: fullOrder, message: "Order created successfully", success: true, error: false });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.userId },
      order: [["createdAt", "DESC"]],
      ...withItems,
    });
    return res.status(200).json({ orders, message: "Orders fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, withItems);
    if (!order) {
      return res.status(404).json({ message: "Order not found", error: true, success: false });
    }

    if (order.userId !== req.userId) {
      const user = await User.findByPk(req.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied", error: true, success: false });
      }
    }

    return res.status(200).json({ order, message: "Order fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const totalOrders = await Order.count();
    const totalPages = Math.ceil(totalOrders / perPage);

    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * perPage,
      limit: perPage,
      ...withItems,
    });

    return res.status(200).json({ orders, totalPages, page, totalOrders, message: "All orders fetched", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value", error: true, success: false });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found", error: true, success: false });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({ order, message: "Order status updated", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};
