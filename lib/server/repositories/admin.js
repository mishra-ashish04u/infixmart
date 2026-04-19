import { query } from "../db/mysql.js";

async function getAdminDashboardStats() {
  const [ordersRow, usersRow, productsRow, revenueRow, deliveredRow, lowStockRow] = await Promise.all([
    query(`SELECT COUNT(*) AS totalOrders FROM Orders`),
    query(`SELECT COUNT(*) AS totalUsers FROM Users`),
    query(`SELECT COUNT(*) AS totalProducts FROM Products`),
    query(`SELECT COALESCE(SUM(totalPrice), 0) AS totalRevenue FROM Orders WHERE status != 'cancelled'`),
    query(`SELECT COUNT(*) AS deliveredOrders FROM Orders WHERE status = 'delivered'`),
    query(`SELECT COUNT(*) AS lowStockCount FROM Products WHERE countInStock <= 5 AND countInStock >= 0`),
  ]);

  const totalOrders = Number(ordersRow[0]?.totalOrders || 0);
  const totalRevenue = Number(revenueRow[0]?.totalRevenue || 0);
  const deliveredOrders = Number(deliveredRow[0]?.deliveredOrders || 0);

  return {
    totalOrders,
    totalUsers: Number(usersRow[0]?.totalUsers || 0),
    totalProducts: Number(productsRow[0]?.totalProducts || 0),
    totalRevenue,
    aov: deliveredOrders > 0 ? Math.round(totalRevenue / deliveredOrders) : 0,
    deliveredOrders,
    lowStockCount: Number(lowStockRow[0]?.lowStockCount || 0),
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

async function listUsers({ page = 1, perPage = 20, search = "", segment = "" }) {
  const offset = (page - 1) * perPage;
  const filters = [];
  const params = { limit: perPage, offset };

  if (search) {
    filters.push("(u.name LIKE :search OR u.email LIKE :search)");
    params.search = `%${search}%`;
  }

  // Segment filters via subqueries
  if (segment === "new") {
    filters.push("u.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
  } else if (segment === "returning") {
    filters.push(`(SELECT COUNT(*) FROM Orders o WHERE o.userId = u.id) >= 2`);
  } else if (segment === "high_value") {
    filters.push(`(SELECT COALESCE(SUM(o.totalPrice),0) FROM Orders o WHERE o.userId = u.id AND o.status = 'delivered') >= 2000`);
  } else if (segment === "inactive") {
    filters.push("(u.last_login_date IS NULL OR u.last_login_date < DATE_SUB(NOW(), INTERVAL 60 DAY))");
    filters.push(`(SELECT COUNT(*) FROM Orders o WHERE o.userId = u.id) = 0`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const [countRows, userRows] = await Promise.all([
    query(
      `SELECT COUNT(*) AS totalUsers FROM Users u ${whereClause}`,
      params
    ),
    query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.avatar,
         u.mobile,
         u.country,
         u.verify_email,
         u.last_login_date,
         u.status,
         u.google_id,
         u.role,
         u.createdAt,
         u.updatedAt,
         (SELECT COUNT(*) FROM Orders o WHERE o.userId = u.id) AS orderCount,
         (SELECT COALESCE(SUM(o.totalPrice),0) FROM Orders o WHERE o.userId = u.id AND o.status = 'delivered') AS totalSpent
       FROM Users u
       ${whereClause}
       ORDER BY u.createdAt DESC
       LIMIT :limit OFFSET :offset`,
      params
    ),
  ]);

  const totalUsers = Number(countRows[0]?.totalUsers || 0);
  const totalPages = Math.max(1, Math.ceil(totalUsers / perPage));

  return {
    users: userRows.map((row) => {
      const orders = Number(row.orderCount || 0);
      const spent = Number(row.totalSpent || 0);
      const ageMs = Date.now() - new Date(row.createdAt).getTime();
      const isNew = ageMs < 30 * 24 * 60 * 60 * 1000;
      let seg = "regular";
      if (isNew && orders === 0) seg = "new";
      else if (orders >= 2) seg = spent >= 2000 ? "high_value" : "returning";
      else if (!orders && (!row.last_login_date || new Date(row.last_login_date) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))) seg = "inactive";

      return {
        ...row,
        _id: row.id,
        verify_email: Boolean(row.verify_email),
        orderCount: orders,
        totalSpent: spent,
        segment: seg,
      };
    }),
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

async function listOrdersForExport({ from, to, status }) {
  const filters = [];
  const params = {};

  if (from) { filters.push("o.createdAt >= :from"); params.from = from + " 00:00:00"; }
  if (to)   { filters.push("o.createdAt <= :to");   params.to   = to   + " 23:59:59"; }
  if (status) { filters.push("o.status = :status"); params.status = status; }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  return query(
    `SELECT o.id, u.name AS customerName, u.email AS customerEmail,
            o.totalPrice, o.itemsPrice, o.shippingPrice, o.gstAmount,
            o.status, o.paymentMethod, o.isPaid, o.paidAt,
            o.createdAt, o.shippingAddress
     FROM Orders o
     LEFT JOIN Users u ON u.id = o.userId
     ${whereClause}
     ORDER BY o.createdAt DESC
     LIMIT 5000`,
    params
  );
}

export { getAdminDashboardStats, getUserStats, listAdminOrders, listOrdersForExport, listUsers };
