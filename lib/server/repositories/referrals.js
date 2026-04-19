import { execute, query } from "../db/mysql.js";

async function ensureTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS ReferralLogs (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      referrerId  INT NOT NULL,
      refereeId   INT NOT NULL,
      orderId     INT DEFAULT NULL,
      credited    TINYINT(1) NOT NULL DEFAULT 0,
      creditedAt  DATETIME DEFAULT NULL,
      createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_referee (refereeId)
    )
  `);
}

export async function logReferral(referrerId, refereeId) {
  await ensureTable();
  await execute(
    `INSERT IGNORE INTO ReferralLogs (referrerId, refereeId) VALUES (:referrerId, :refereeId)`,
    { referrerId, refereeId }
  );
}

export async function markReferralCredited(refereeId, orderId) {
  await ensureTable();
  await execute(
    `UPDATE ReferralLogs SET credited = 1, orderId = :orderId, creditedAt = NOW()
     WHERE refereeId = :refereeId AND credited = 0`,
    { refereeId, orderId }
  );
}

export async function getReferralByReferee(refereeId) {
  await ensureTable();
  const rows = await query(
    `SELECT * FROM ReferralLogs WHERE refereeId = :refereeId LIMIT 1`,
    { refereeId }
  );
  return rows[0] || null;
}

export async function getReferralsByReferrer(referrerId) {
  await ensureTable();
  const rows = await query(
    `SELECT rl.*, u.name AS refereeName, u.email AS refereeEmail
     FROM ReferralLogs rl
     JOIN Users u ON u.id = rl.refereeId
     WHERE rl.referrerId = :referrerId
     ORDER BY rl.createdAt DESC`,
    { referrerId }
  );
  return rows;
}
