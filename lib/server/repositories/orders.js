import { execute, query } from "../db/mysql.js";

function mapOrder(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    items: safeParseJson(row.items, []),
    shippingAddress: safeParseJson(row.shippingAddress, {}),
    paymentResult: safeParseJson(row.paymentResult, {}),
    itemsPrice: Number(row.itemsPrice || 0),
    shippingPrice: Number(row.shippingPrice || 0),
    gstAmount: Number(row.gstAmount || 0),
    totalPrice: Number(row.totalPrice || 0),
    isPaid: Boolean(row.isPaid),
  };
}

async function createOrder(payload, conn = null) {
  const result = await runExecute(
    conn,
    `INSERT INTO Orders (
      userId,
      items,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      shippingPrice,
      gstAmount,
      totalPrice,
      isPaid,
      paidAt,
      status,
      createdAt,
      updatedAt
    ) VALUES (
      :userId,
      :items,
      :shippingAddress,
      :paymentMethod,
      :paymentResult,
      :itemsPrice,
      :shippingPrice,
      :gstAmount,
      :totalPrice,
      :isPaid,
      :paidAt,
      :status,
      NOW(),
      NOW()
    )`,
    {
      ...payload,
      items: JSON.stringify(payload.items || []),
      shippingAddress: JSON.stringify(payload.shippingAddress || {}),
      paymentResult: JSON.stringify(payload.paymentResult || {}),
      isPaid: payload.isPaid ? 1 : 0,
      paidAt: payload.paidAt || null,
      status: payload.status || "pending",
    }
  );

  return findOrderById(result.insertId, conn);
}

async function createOrderItems(orderId, items, conn = null) {
  for (const item of items) {
    await runExecute(
      conn,
      `INSERT INTO OrderItems (
        orderId,
        productId,
        name,
        image,
        price,
        qty,
        createdAt,
        updatedAt
      ) VALUES (
        :orderId,
        :productId,
        :name,
        :image,
        :price,
        :qty,
        NOW(),
        NOW()
      )`,
      {
        orderId,
        productId: item.productId,
        name: item.name,
        image: item.image || "",
        price: item.price,
        qty: item.qty,
      }
    );
  }
}

async function findOrderById(id, conn = null) {
  const rows = await runQuery(
    conn,
    `SELECT
       id,
       userId,
       items,
       shippingAddress,
       paymentMethod,
       paymentResult,
       itemsPrice,
       shippingPrice,
       gstAmount,
       totalPrice,
       isPaid,
       paidAt,
       status,
       createdAt,
       updatedAt
     FROM Orders
     WHERE id = :id
     LIMIT 1`,
    { id }
  );

  return mapOrder(rows[0]);
}

async function listOrdersByUserId(userId) {
  const rows = await query(
    `SELECT
       id,
       userId,
       items,
       shippingAddress,
       paymentMethod,
       paymentResult,
       itemsPrice,
       shippingPrice,
       gstAmount,
       totalPrice,
       isPaid,
       paidAt,
       status,
       createdAt,
       updatedAt
     FROM Orders
     WHERE userId = :userId
     ORDER BY createdAt DESC`,
    { userId }
  );

  return rows.map(mapOrder);
}

async function listAllOrders({ page = 1, perPage = 10 }) {
  const offset = (page - 1) * perPage;
  const [countRows, orderRows] = await Promise.all([
    query(`SELECT COUNT(*) AS totalOrders FROM Orders`),
    query(
      `SELECT
         id,
         userId,
         items,
         shippingAddress,
         paymentMethod,
         paymentResult,
         itemsPrice,
         shippingPrice,
         gstAmount,
         totalPrice,
         isPaid,
         paidAt,
         status,
         createdAt,
         updatedAt
       FROM Orders
       ORDER BY createdAt DESC
       LIMIT :limit OFFSET :offset`,
      { limit: perPage, offset }
    ),
  ]);

  const totalOrders = Number(countRows[0]?.totalOrders || 0);
  return {
    orders: orderRows.map(mapOrder),
    totalOrders,
    totalPages: Math.max(1, Math.ceil(totalOrders / perPage)),
    page,
  };
}

async function updateOrderStatus(id, status) {
  const result = await execute(
    `UPDATE Orders
     SET status = :status, updatedAt = NOW()
     WHERE id = :id`,
    { id, status }
  );

  return result.affectedRows > 0;
}

async function findPaidOrderByPaymentId(paymentId, conn = null) {
  if (!paymentId) return null;
  const rows = await runQuery(
    conn,
    `SELECT
       id,
       userId,
       items,
       shippingAddress,
       paymentMethod,
       paymentResult,
       itemsPrice,
       shippingPrice,
       gstAmount,
       totalPrice,
       isPaid,
       paidAt,
       status,
       createdAt,
       updatedAt
     FROM Orders
     WHERE isPaid = 1 AND paymentResult LIKE :paymentId
     LIMIT 1`,
    { paymentId: `%${paymentId}%` }
  );

  return mapOrder(rows[0]);
}

async function runQuery(conn, sql, params = {}) {
  if (conn) {
    const [rows] = await conn.query(sql, params);
    return rows;
  }
  return query(sql, params);
}

async function runExecute(conn, sql, params = {}) {
  if (conn) {
    const [result] = await conn.execute(sql, params);
    return result;
  }
  return execute(sql, params);
}

function safeParseJson(value, fallback) {
  try {
    return JSON.parse(value || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export {
  createOrder,
  createOrderItems,
  findOrderById,
  findPaidOrderByPaymentId,
  listAllOrders,
  listOrdersByUserId,
  updateOrderStatus,
};
