import { Op } from "sequelize";

import CartProduct from "../models/CartProduct.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import sendOrderEmail from "../utils/sendOrderEmail.js";
import { createHttpError, roundMoney } from "./checkoutService.js";

const withItems = { include: [{ model: OrderItem, as: "orderItems" }] };

export const findPaidOrderByPaymentId = async (paymentId, transaction = null) => {
  if (!paymentId) return null;

  return Order.findOne({
    where: {
      isPaid: true,
      paymentResult: { [Op.like]: `%${paymentId}%` },
    },
    transaction,
  });
};

export const createOrderFromCheckout = async ({
  userId,
  checkout,
  paymentMethod,
  paymentResult = {},
  isPaid = false,
  paidAt = null,
  transaction,
}) => {
  if (!checkout?.secureOrderItems?.length) {
    throw createHttpError(400, "No order items.");
  }

  for (const item of checkout.secureOrderItems) {
    const product = await Product.findByPk(item.productId, {
      transaction,
      lock: transaction ? transaction.LOCK.UPDATE : undefined,
    });

    if (!product) {
      throw createHttpError(400, `Product ${item.productId} not found.`);
    }

    if (product.countInStock < item.qty) {
      throw createHttpError(400, `Insufficient stock for "${product.name}". Only ${product.countInStock} left.`);
    }

    await product.update(
      { countInStock: product.countInStock - item.qty },
      { transaction }
    );
  }

  const order = await Order.create(
    {
      userId,
      items: checkout.secureOrderItems,
      shippingAddress: checkout.shippingAddress,
      paymentMethod,
      paymentResult: {
        ...(paymentResult || {}),
        ...(checkout.couponCode
          ? {
              couponCode: checkout.couponCode,
              couponDiscount: checkout.couponDiscount,
            }
          : {}),
      },
      itemsPrice: roundMoney(checkout.itemsPrice),
      shippingPrice: roundMoney(checkout.shippingPrice),
      gstAmount: roundMoney(checkout.gstAmount),
      totalPrice: roundMoney(checkout.totalPrice),
      isPaid: isPaid === true,
      paidAt: isPaid ? paidAt || new Date() : null,
    },
    { transaction }
  );

  await OrderItem.bulkCreate(
    checkout.secureOrderItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      name: item.name,
      image: item.image,
      price: roundMoney(item.price),
      qty: item.qty,
    })),
    { transaction }
  );

  if (checkout.couponId) {
    const coupon = await Coupon.findByPk(checkout.couponId, { transaction });
    if (coupon) {
      await coupon.increment("usageCount", { by: 1, transaction });
    }
  }

  if (Array.isArray(checkout.cartItemIds) && checkout.cartItemIds.length > 0) {
    await CartProduct.destroy({
      where: {
        userId,
        id: { [Op.in]: checkout.cartItemIds },
      },
      transaction,
    });
  }

  return order;
};

export const getFullOrderById = (orderId) => Order.findByPk(orderId, withItems);

export const sendOrderConfirmationEmail = async (userId, order) => {
  User.findByPk(userId)
    .then((user) => sendOrderEmail(order, user))
    .catch((error) => console.error("[EMAIL ERROR]", error.message));
};
