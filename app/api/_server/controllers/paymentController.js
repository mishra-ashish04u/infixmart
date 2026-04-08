import crypto from "crypto";

import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import { QueryTypes } from "sequelize";

import { sequelize } from "../config/connectDB.js";
import { buildCheckoutFromCart, createHttpError, roundMoney } from "../services/checkoutService.js";
import {
  createOrderFromCheckout,
  findPaidOrderByPaymentId,
  getFullOrderById,
  sendOrderConfirmationEmail,
} from "../services/orderService.js";

const PAYMENT_STATE_SECRET =
  process.env.PAYMENT_STATE_SECRET ||
  process.env.JWT_SECRET_ACCESS_TOKEN ||
  process.env.JWT_SECRET;

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw createHttpError(500, "Razorpay is not configured.");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const signCheckoutState = (payload) => {
  if (!PAYMENT_STATE_SECRET) {
    throw createHttpError(500, "Payment state secret is not configured.");
  }

  return jwt.sign(payload, PAYMENT_STATE_SECRET, { expiresIn: "30m" });
};

const verifyCheckoutState = (token) => {
  if (!token) {
    throw createHttpError(400, "Checkout session is missing. Please try again.");
  }

  if (!PAYMENT_STATE_SECRET) {
    throw createHttpError(500, "Payment state secret is not configured.");
  }

  try {
    return jwt.verify(token, PAYMENT_STATE_SECRET);
  } catch {
    throw createHttpError(400, "Checkout session expired. Please try again.");
  }
};

const signaturesMatch = (expectedSignature, receivedSignature) => {
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(String(receivedSignature || ""), "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { addressId, shippingAddress, couponCode } = req.body;
    const razorpay = getRazorpayClient();
    const checkout = await buildCheckoutFromCart({
      userId: req.userId,
      addressId,
      shippingAddress,
      couponCode,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(checkout.totalPrice * 100),
      currency: checkout.currency,
      receipt: `rcpt_${req.userId}_${Date.now()}`.slice(0, 40),
      notes: {
        userId: String(req.userId),
        couponCode: checkout.couponCode || "",
      },
    });

    const checkoutToken = signCheckoutState({
      type: "razorpay_checkout",
      userId: req.userId,
      razorpayOrderId: order.id,
      createdAt: new Date().toISOString(),
      checkout,
    });

    return res.status(200).json({
      error: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      checkoutToken,
      totals: {
        itemsPrice: checkout.itemsPrice,
        shippingPrice: checkout.shippingPrice,
        gstAmount: checkout.gstAmount,
        totalPrice: checkout.totalPrice,
        couponDiscount: checkout.couponDiscount,
      },
    });
  } catch (error) {
    console.error("[Payment] createOrder error:", error);
    const status = error.status || 500;
    const message = status < 500 ? error.message : "Internal server error";
    return res.status(status).json({ error: true, message });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  let transaction = null;
  let lockAcquired = false;

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, checkoutToken } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !checkoutToken) {
      return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    }

    const checkoutState = verifyCheckoutState(checkoutToken);
    if (checkoutState.type !== "razorpay_checkout" || Number(checkoutState.userId) !== Number(req.userId)) {
      return res.status(403).json({ success: false, message: "Checkout session does not belong to this user." });
    }

    if (checkoutState.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Checkout session does not match the payment order." });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (!signaturesMatch(expectedSignature, razorpay_signature)) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const razorpay = getRazorpayClient();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const expectedAmount = Math.round(Number(checkoutState.checkout.totalPrice || 0) * 100);
    const paymentCaptured = payment?.captured === true || payment?.status === "captured";

    if (!payment || payment.order_id !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Payment order mismatch detected." });
    }

    if (Number(payment.amount) !== expectedAmount || payment.currency !== checkoutState.checkout.currency) {
      return res.status(400).json({ success: false, message: "Paid amount does not match the verified checkout total." });
    }

    if (!paymentCaptured) {
      return res.status(400).json({ success: false, message: "Payment is not captured yet. Enable auto-capture in Razorpay before going live." });
    }

    transaction = await sequelize.transaction();

    const lockKey = `rzp_payment_${razorpay_payment_id}`.slice(0, 64);
    const lockRows = await sequelize.query("SELECT GET_LOCK(:lockKey, 10) AS lockStatus", {
      replacements: { lockKey },
      type: QueryTypes.SELECT,
      transaction,
    });
    lockAcquired = Number(lockRows?.[0]?.lockStatus) === 1;

    if (!lockAcquired) {
      throw createHttpError(409, "This payment is already being processed. Please refresh in a moment.");
    }

    const existingOrder = await findPaidOrderByPaymentId(razorpay_payment_id, transaction);
    if (existingOrder) {
      await sequelize.query("SELECT RELEASE_LOCK(:lockKey) AS released", {
        replacements: { lockKey },
        type: QueryTypes.SELECT,
        transaction,
      });
      lockAcquired = false;
      await transaction.rollback();
      transaction = null;
      return res.status(409).json({ success: false, message: "This payment has already been used." });
    }

    const order = await createOrderFromCheckout({
      userId: req.userId,
      checkout: checkoutState.checkout,
      paymentMethod: "Razorpay",
      paymentResult: {
        id: razorpay_payment_id,
        status: payment.status || "captured",
        razorpay_order_id,
        razorpay_signature,
        amount: roundMoney(Number(payment.amount || 0) / 100),
        currency: payment.currency,
        method: payment.method || null,
      },
      isPaid: true,
      paidAt: payment.created_at ? new Date(Number(payment.created_at) * 1000) : new Date(),
      transaction,
    });

    await sequelize.query("SELECT RELEASE_LOCK(:lockKey) AS released", {
      replacements: { lockKey },
      type: QueryTypes.SELECT,
      transaction,
    });
    lockAcquired = false;

    await transaction.commit();
    transaction = null;

    const fullOrder = await getFullOrderById(order.id);
    sendOrderConfirmationEmail(req.userId, fullOrder);

    return res.status(200).json({ success: true, paymentId: razorpay_payment_id, order: fullOrder });
  } catch (error) {
    if (transaction) {
      try {
        if (lockAcquired) {
          const lockKey = `rzp_payment_${req.body?.razorpay_payment_id || ""}`.slice(0, 64);
          await sequelize.query("SELECT RELEASE_LOCK(:lockKey) AS released", {
            replacements: { lockKey },
            type: QueryTypes.SELECT,
            transaction,
          });
        }
      } catch (lockError) {
        console.error("[Payment] releaseLock error:", lockError);
      }

      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("[Payment] rollback error:", rollbackError);
      }
    }

    console.error("[Payment] verifyPayment error:", error);
    const status = error.status || 500;
    const message = status < 500 ? error.message : "Internal server error";
    return res.status(status).json({ success: false, message });
  }
};
