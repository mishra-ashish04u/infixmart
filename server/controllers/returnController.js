import Return from "../models/Return.js";
import Order  from "../models/Order.js";
import User   from "../models/User.js";
import { Op } from "sequelize";

const RETURN_WINDOW_DAYS = 7; // customers can request a return within 7 days of delivery

/* ── POST /api/returns  (auth) — customer creates return request ── */
export const createReturn = async (req, res) => {
  try {
    const userId          = req.userId;
    const { orderId, reason } = req.body;

    if (!orderId || !reason?.trim()) {
      return res.status(400).json({ message: "orderId and reason are required", error: true, success: false });
    }

    const order = await Order.findOne({ where: { id: orderId, userId } });
    if (!order) {
      return res.status(404).json({ message: "Order not found", error: true, success: false });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        message: "Return requests can only be raised for delivered orders",
        error: true, success: false,
      });
    }

    // Enforce return window
    const deliveredAt = new Date(order.updatedAt);
    const diffDays    = Math.floor((Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > RETURN_WINDOW_DAYS) {
      return res.status(400).json({
        message: `Return window of ${RETURN_WINDOW_DAYS} days has expired`,
        error: true, success: false,
      });
    }

    // One active return per order
    const existing = await Return.findOne({
      where: { orderId, status: { [Op.in]: ["pending", "approved"] } },
    });
    if (existing) {
      return res.status(400).json({
        message: "A return request for this order already exists",
        error: true, success: false,
      });
    }

    const ret = await Return.create({ orderId, userId, reason: reason.trim() });

    return res.status(201).json({ success: true, error: false, message: "Return request submitted", data: ret });
  } catch (error) {
    console.error("[Return] createReturn:", error);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

/* ── GET /api/returns/my  (auth) — customer's own requests ── */
export const getMyReturns = async (req, res) => {
  try {
    const returns = await Return.findAll({
      where: { userId: req.userId },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ success: true, error: false, data: returns });
  } catch (error) {
    console.error("[Return] getMyReturns:", error);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

/* ── GET /api/returns  (auth + admin) — all return requests ── */
export const getAllReturns = async (req, res) => {
  try {
    const page    = parseInt(req.query.page)    || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const where   = {};
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await Return.findAndCountAll({
      where,
      order:  [["createdAt", "DESC"]],
      limit:  perPage,
      offset: (page - 1) * perPage,
    });

    // Attach user name + order total
    const userIds  = [...new Set(rows.map((r) => r.userId))];
    const orderIds = [...new Set(rows.map((r) => r.orderId))];
    const [users, orders] = await Promise.all([
      User.findAll({ where: { id: { [Op.in]: userIds } }, attributes: ["id", "name", "email"] }),
      Order.findAll({ where: { id: { [Op.in]: orderIds } }, attributes: ["id", "totalPrice"] }),
    ]);
    const userMap  = Object.fromEntries(users.map((u) => [u.id, u]));
    const orderMap = Object.fromEntries(orders.map((o) => [o.id, o]));

    const data = rows.map((r) => ({
      ...r.toJSON(),
      user:  userMap[r.userId]  || null,
      order: orderMap[r.orderId] || null,
    }));

    return res.status(200).json({
      success: true, error: false,
      data,
      totalPages:  Math.ceil(count / perPage),
      currentPage: page,
      total:       count,
    });
  } catch (error) {
    console.error("[Return] getAllReturns:", error);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

/* ── PUT /api/returns/:id  (auth + admin) — approve / reject with note ── */
export const updateReturnStatus = async (req, res) => {
  try {
    const { id }               = req.params;
    const { status, adminNote } = req.body;

    const validStatuses = ["approved", "rejected", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${validStatuses.join(", ")}`,
        error: true, success: false,
      });
    }

    const ret = await Return.findByPk(id);
    if (!ret) {
      return res.status(404).json({ message: "Return request not found", error: true, success: false });
    }

    ret.status    = status;
    ret.adminNote = adminNote?.trim() || ret.adminNote;
    await ret.save();

    return res.status(200).json({ success: true, error: false, message: "Return status updated", data: ret });
  } catch (error) {
    console.error("[Return] updateReturnStatus:", error);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};
