import { query, execute } from "../db/mysql.js";

// Auto-create table on first use
async function ensureTable() {
  await execute(
    `CREATE TABLE IF NOT EXISTS AbandonedCartReminders (
      id            INT PRIMARY KEY AUTO_INCREMENT,
      userId        INT NOT NULL,
      cartSubtotal  DECIMAL(10,2) NOT NULL DEFAULT 0,
      cartSnapshot  JSON,
      status        ENUM('active','recovered','dismissed') NOT NULL DEFAULT 'active',
      lastEmailSentAt     DATETIME DEFAULT NULL,
      lastWhatsappSentAt  DATETIME DEFAULT NULL,
      emailCount          INT NOT NULL DEFAULT 0,
      whatsappCount       INT NOT NULL DEFAULT 0,
      detectedAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user (userId)
    )`,
    {}
  );
}

// Find all users with items in cart older than `minIdleMinutes`, joined with reminder status
// dateFrom / dateTo filter on MAX(cp.updatedAt) — i.e. last cart activity date
async function listAbandonedCarts({ minIdleMinutes = 60, page = 1, perPage = 30, dateFrom = null, dateTo = null, exportAll = false } = {}) {
  await ensureTable();
  const offset = (page - 1) * perPage;

  const dateClause = [
    dateFrom ? `AND MAX(cp.updatedAt) >= :dateFrom` : "",
    dateTo   ? `AND MAX(cp.updatedAt) <= DATE_ADD(:dateTo, INTERVAL 1 DAY)` : "",
  ].join(" ");

  // For export we skip pagination
  const limitClause = exportAll ? "" : "LIMIT :perPage OFFSET :offset";

  const params = { minIdle: minIdleMinutes, perPage, offset, dateFrom, dateTo };

  const rows = await query(
    `SELECT
       u.id            AS userId,
       u.name          AS userName,
       u.email         AS userEmail,
       u.mobile        AS userPhone,
       COUNT(cp.id)    AS itemCount,
       SUM(p.price * cp.quantity) AS cartSubtotal,
       MAX(cp.updatedAt) AS lastCartActivity,
       TIMESTAMPDIFF(MINUTE, MAX(cp.updatedAt), NOW()) AS idleMinutes,
       acr.id          AS reminderId,
       acr.status      AS reminderStatus,
       acr.lastEmailSentAt,
       acr.lastWhatsappSentAt,
       acr.emailCount,
       acr.whatsappCount,
       acr.detectedAt
     FROM CartProducts cp
     JOIN Users u ON u.id = cp.userId
     JOIN Products p ON p.id = cp.productId
     LEFT JOIN AbandonedCartReminders acr ON acr.userId = u.id
     WHERE cp.updatedAt < DATE_SUB(NOW(), INTERVAL :minIdle MINUTE)
       AND (acr.status IS NULL OR acr.status = 'active')
     GROUP BY u.id, u.name, u.email, u.mobile,
              acr.id, acr.status, acr.lastEmailSentAt, acr.lastWhatsappSentAt,
              acr.emailCount, acr.whatsappCount, acr.detectedAt
     HAVING 1=1 ${dateClause}
     ORDER BY cartSubtotal DESC
     ${limitClause}`,
    params
  );

  const [countRow] = await query(
    `SELECT COUNT(*) AS total FROM (
       SELECT u.id
       FROM CartProducts cp
       JOIN Users u ON u.id = cp.userId
       LEFT JOIN AbandonedCartReminders acr ON acr.userId = cp.userId
       WHERE cp.updatedAt < DATE_SUB(NOW(), INTERVAL :minIdle MINUTE)
         AND (acr.status IS NULL OR acr.status = 'active')
       GROUP BY u.id
       HAVING 1=1 ${dateClause}
     ) sub`,
    params
  );

  return { rows, total: Number(countRow?.total || 0) };
}

// Get cart items for a specific user (for snapshot + email body)
async function getCartItemsForUser(userId) {
  return query(
    `SELECT cp.quantity, p.id AS productId, p.name, p.price, p.images
     FROM CartProducts cp
     JOIN Products p ON p.id = cp.productId
     WHERE cp.userId = :userId`,
    { userId }
  );
}

// Upsert reminder record, update channel counters
async function upsertReminder(userId, { cartSubtotal, cartSnapshot, channel }) {
  await ensureTable();

  if (channel === 'email') {
    await execute(
      `INSERT INTO AbandonedCartReminders
         (userId, cartSubtotal, cartSnapshot, lastEmailSentAt, emailCount, detectedAt, updatedAt)
       VALUES (:userId, :cartSubtotal, :cartSnapshot, NOW(), 1, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         cartSubtotal        = VALUES(cartSubtotal),
         cartSnapshot        = VALUES(cartSnapshot),
         lastEmailSentAt     = NOW(),
         emailCount          = emailCount + 1,
         updatedAt           = NOW()`,
      { userId, cartSubtotal, cartSnapshot: JSON.stringify(cartSnapshot) }
    );
  } else if (channel === 'whatsapp') {
    await execute(
      `INSERT INTO AbandonedCartReminders
         (userId, cartSubtotal, cartSnapshot, lastWhatsappSentAt, whatsappCount, detectedAt, updatedAt)
       VALUES (:userId, :cartSubtotal, :cartSnapshot, NOW(), 1, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         cartSubtotal          = VALUES(cartSubtotal),
         cartSnapshot          = VALUES(cartSnapshot),
         lastWhatsappSentAt    = NOW(),
         whatsappCount         = whatsappCount + 1,
         updatedAt             = NOW()`,
      { userId, cartSubtotal, cartSnapshot: JSON.stringify(cartSnapshot) }
    );
  }
}

async function setReminderStatus(userId, status) {
  await ensureTable();
  await execute(
    `INSERT INTO AbandonedCartReminders (userId, cartSubtotal, status, detectedAt, updatedAt)
     VALUES (:userId, 0, :status, NOW(), NOW())
     ON DUPLICATE KEY UPDATE status = :status, updatedAt = NOW()`,
    { userId, status }
  );
}

async function markRecovered(userId) {
  await ensureTable();
  await execute(
    `UPDATE AbandonedCartReminders SET status = 'recovered', updatedAt = NOW()
     WHERE userId = :userId`,
    { userId }
  );
}

export {
  listAbandonedCarts,
  getCartItemsForUser,
  upsertReminder,
  setReminderStatus,
  markRecovered,
};
