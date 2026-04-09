import { HttpError } from "../api/http.js";
import { findOrderById } from "../repositories/orders.js";
import {
  createReturnRequest,
  findActiveReturnForOrder,
  findReturnById,
  listReturns,
  listReturnsByUserId,
  updateReturnStatus,
} from "../repositories/returns.js";

const RETURN_WINDOW_DAYS = 7;

async function createReturnRecord(userId, body) {
  const orderId = Number(body?.orderId);
  const reason = String(body?.reason || "").trim();

  if (!orderId || !reason) {
    throw new HttpError(400, "orderId and reason are required");
  }

  const order = await findOrderById(orderId);
  if (!order || order.userId !== Number(userId)) {
    throw new HttpError(404, "Order not found");
  }

  if (order.status !== "delivered") {
    throw new HttpError(400, "Return requests can only be raised for delivered orders");
  }

  const deliveredAt = new Date(order.updatedAt);
  const diffDays = Math.floor((Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > RETURN_WINDOW_DAYS) {
    throw new HttpError(400, `Return window of ${RETURN_WINDOW_DAYS} days has expired`);
  }

  const existing = await findActiveReturnForOrder(orderId);
  if (existing) {
    throw new HttpError(400, "A return request for this order already exists");
  }

  return {
    success: true,
    error: false,
    message: "Return request submitted",
    data: await createReturnRequest({ orderId, userId, reason }),
  };
}

async function getMyReturns(userId) {
  return {
    success: true,
    error: false,
    data: await listReturnsByUserId(userId),
  };
}

async function getAllReturnsAdmin(params) {
  return {
    success: true,
    error: false,
    ...(await listReturns(params)),
  };
}

async function updateReturnStatusRecord(id, body) {
  const status = body?.status;
  const validStatuses = ["approved", "rejected", "completed"];
  if (!validStatuses.includes(status)) {
    throw new HttpError(400, `status must be one of: ${validStatuses.join(", ")}`);
  }

  const existing = await findReturnById(id);
  if (!existing) {
    throw new HttpError(404, "Return request not found");
  }

  return {
    success: true,
    error: false,
    message: "Return status updated",
    data: await updateReturnStatus(id, {
      status,
      adminNote: body?.adminNote?.trim() || existing.adminNote,
    }),
  };
}

export {
  createReturnRecord,
  getAllReturnsAdmin,
  getMyReturns,
  updateReturnStatusRecord,
};
