import { execute, query } from "../db/mysql.js";

function mapReturn(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    user: row.userId
      ? { id: row.userId, name: row.userName || null, email: row.userEmail || null }
      : undefined,
    order: row.orderId
      ? {
          id: row.orderId,
          totalPrice: row.orderTotalPrice == null ? null : Number(row.orderTotalPrice),
        }
      : undefined,
  };
}

async function createReturnRequest(payload) {
  const result = await execute(
    `INSERT INTO Returns (
      orderId,
      userId,
      reason,
      status,
      adminNote,
      createdAt,
      updatedAt
    ) VALUES (
      :orderId,
      :userId,
      :reason,
      'pending',
      NULL,
      NOW(),
      NOW()
    )`,
    payload
  );

  return findReturnById(result.insertId);
}

async function findReturnById(id) {
  const rows = await query(
    `SELECT
       r.id,
       r.orderId,
       r.userId,
       r.reason,
       r.status,
       r.adminNote,
       r.createdAt,
       r.updatedAt,
       u.name AS userName,
       u.email AS userEmail,
       o.totalPrice AS orderTotalPrice
     FROM Returns r
     LEFT JOIN Users u ON u.id = r.userId
     LEFT JOIN Orders o ON o.id = r.orderId
     WHERE r.id = :id
     LIMIT 1`,
    { id }
  );

  return mapReturn(rows[0]);
}

async function findActiveReturnForOrder(orderId) {
  const rows = await query(
    `SELECT id, orderId, userId, reason, status, adminNote, createdAt, updatedAt
     FROM Returns
     WHERE orderId = :orderId AND status IN ('pending', 'approved')
     LIMIT 1`,
    { orderId }
  );

  return rows[0] || null;
}

async function listReturnsByUserId(userId) {
  const rows = await query(
    `SELECT
       r.id,
       r.orderId,
       r.userId,
       r.reason,
       r.status,
       r.adminNote,
       r.createdAt,
       r.updatedAt,
       o.totalPrice AS orderTotalPrice
     FROM Returns r
     LEFT JOIN Orders o ON o.id = r.orderId
     WHERE r.userId = :userId
     ORDER BY r.createdAt DESC`,
    { userId }
  );

  return rows.map(mapReturn);
}

async function listReturns({ page = 1, perPage = 20, status = "" }) {
  const offset = (page - 1) * perPage;
  const whereClause = status ? "WHERE r.status = :status" : "";
  const params = status ? { status, limit: perPage, offset } : { limit: perPage, offset };

  const [countRows, rows] = await Promise.all([
    query(
      `SELECT COUNT(*) AS total
       FROM Returns r
       ${status ? "WHERE r.status = :status" : ""}`,
      status ? { status } : {}
    ),
    query(
      `SELECT
         r.id,
         r.orderId,
         r.userId,
         r.reason,
         r.status,
         r.adminNote,
         r.createdAt,
         r.updatedAt,
         u.name AS userName,
         u.email AS userEmail,
         o.totalPrice AS orderTotalPrice
       FROM Returns r
       LEFT JOIN Users u ON u.id = r.userId
       LEFT JOIN Orders o ON o.id = r.orderId
       ${whereClause}
       ORDER BY r.createdAt DESC
       LIMIT :limit OFFSET :offset`,
      params
    ),
  ]);

  const total = Number(countRows[0]?.total || 0);
  return {
    data: rows.map(mapReturn),
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    currentPage: page,
  };
}

async function updateReturnStatus(id, payload) {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
  const setClause = entries.map(([key]) => `\`${key}\` = :${key}`).join(", ");
  await execute(
    `UPDATE Returns
     SET ${setClause}, updatedAt = NOW()
     WHERE id = :id`,
    { id, ...Object.fromEntries(entries) }
  );

  return findReturnById(id);
}

export {
  createReturnRequest,
  findActiveReturnForOrder,
  findReturnById,
  listReturns,
  listReturnsByUserId,
  updateReturnStatus,
};
