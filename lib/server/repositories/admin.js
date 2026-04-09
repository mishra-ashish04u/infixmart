import { query } from "../db/mysql.js";

async function getAdminDashboardStats() {
  const [ordersRow, usersRow, productsRow, revenueRow] = await Promise.all([
    query(`SELECT COUNT(*) AS totalOrders FROM Orders`),
    query(`SELECT COUNT(*) AS totalUsers FROM Users`),
    query(`SELECT COUNT(*) AS totalProducts FROM Products`),
    query(`SELECT COALESCE(SUM(totalPrice), 0) AS totalRevenue FROM Orders`),
  ]);

  return {
    totalOrders: Number(ordersRow[0]?.totalOrders || 0),
    totalUsers: Number(usersRow[0]?.totalUsers || 0),
    totalProducts: Number(productsRow[0]?.totalProducts || 0),
    totalRevenue: Number(revenueRow[0]?.totalRevenue || 0),
  };
}

async function listAdminOrders({ page = 1, perPage = 10, status = "" }) {
  const offset = (page - 1) * perPage;
  const filters = [];
  const params = { limit: perPage, offset };

  if (status) {
    filters.push("o.status = :status");
    params.status = status;
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const [countRows, orderRows] = await Promise.all([
    query(
      `SELECT COUNT(*) AS totalOrders
       FROM Orders o
       ${whereClause}`,
      params
    ),
    query(
      `SELECT
         o.*,
         u.name AS user_name,
         u.email AS user_email
       FROM Orders o
       LEFT JOIN Users u ON u.id = o.userId
       ${whereClause}
       ORDER BY o.createdAt DESC
       LIMIT :limit OFFSET :offset`,
      params
    ),
  ]);

  const totalOrders = Number(countRows[0]?.totalOrders || 0);
  const totalPages = Math.max(1, Math.ceil(totalOrders / perPage));

  return {
    orders: orderRows.map((row) => ({
      ...row,
      items: safeParseJson(row.items, []),
      shippingAddress: safeParseJson(row.shippingAddress, {}),
      paymentResult: safeParseJson(row.paymentResult, {}),
      user: row.user_name || row.user_email
        ? { name: row.user_name, email: row.user_email }
        : null,
    })),
    totalOrders,
    totalPages,
    page,
  };
}

async function listUsers({ page = 1, perPage = 20, search = "" }) {
  const offset = (page - 1) * perPage;
  const filters = [];
  const params = { limit: perPage, offset };

  if (search) {
    filters.push("(name LIKE :search OR email LIKE :search)");
    params.search = `%${search}%`;
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const [countRows, userRows] = await Promise.all([
    query(
      `SELECT COUNT(*) AS totalUsers
       FROM Users
       ${whereClause}`,
      params
    ),
    query(
      `SELECT
         id,
         name,
         email,
         avatar,
         mobile,
         country,
         verify_email,
         last_login_date,
         status,
         google_id,
         role,
         createdAt,
         updatedAt
       FROM Users
       ${whereClause}
       ORDER BY createdAt DESC
       LIMIT :limit OFFSET :offset`,
      params
    ),
  ]);

  const totalUsers = Number(countRows[0]?.totalUsers || 0);
  const totalPages = Math.max(1, Math.ceil(totalUsers / perPage));

  return {
    users: userRows.map((row) => ({
      ...row,
      _id: row.id,
      verify_email: Boolean(row.verify_email),
    })),
    totalUsers,
    totalPages,
    page,
  };
}

async function getUserStats(userId) {
  const [orderCountRows, totalSpentRows] = await Promise.all([
    query(
      `SELECT COUNT(*) AS orderCount
       FROM Orders
       WHERE userId = :userId`,
      { userId }
    ),
    query(
      `SELECT COALESCE(SUM(totalPrice), 0) AS totalSpent
       FROM Orders
       WHERE userId = :userId`,
      { userId }
    ),
  ]);

  return {
    orderCount: Number(orderCountRows[0]?.orderCount || 0),
    totalSpent: Number(totalSpentRows[0]?.totalSpent || 0),
  };
}

function safeParseJson(value, fallback) {
  try {
    return JSON.parse(value || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export { getAdminDashboardStats, getUserStats, listAdminOrders, listUsers };
