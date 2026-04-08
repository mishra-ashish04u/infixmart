import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import User from "../models/User.js";
import { sequelize } from "../config/connectDB.js";
import { buildCheckoutFromCart, buildCheckoutFromItems } from "../services/checkoutService.js";
import { createOrderFromCheckout, sendOrderConfirmationEmail } from "../services/orderService.js";

const withItems = { include: [{ model: OrderItem, as: "orderItems" }] };

export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { items, addressId, shippingAddress, couponCode, paymentMethod } = req.body;

    if ((paymentMethod || "COD") !== "COD") {
      await transaction.rollback();
      return res.status(400).json({
        message: "Online payments must be completed through the payment verification endpoint.",
        error: true,
        success: false,
      });
    }

    const checkout =
      Array.isArray(items) && items.length > 0
        ? await buildCheckoutFromItems({
            userId: req.userId,
            items,
            addressId,
            shippingAddress,
            couponCode,
            transaction,
            lockProducts: true,
          })
        : await buildCheckoutFromCart({
            userId: req.userId,
            addressId,
            shippingAddress,
            couponCode,
            transaction,
            lockProducts: true,
          });

    const order = await createOrderFromCheckout({
      userId: req.userId,
      checkout,
      paymentMethod: "COD",
      transaction,
    });

    await transaction.commit();

    const fullOrder = await Order.findByPk(order.id, withItems);
    sendOrderConfirmationEmail(req.userId, fullOrder);

    return res.status(201).json({ order: fullOrder, message: "Order created successfully", success: true, error: false });
  } catch (error) {
    await transaction.rollback();
    const status = error.status || 500;
    const message = status < 500 ? error.message : "Internal server error";
    return res.status(status).json({ message, error: true, success: false });
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
