import { execute, query } from "../db/mysql.js";

async function ensureTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS ProductQA (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      productId  INT NOT NULL,
      userId     INT NOT NULL,
      question   TEXT NOT NULL,
      answer     TEXT DEFAULT NULL,
      answeredBy INT DEFAULT NULL,
      createdAt  DATETIME NOT NULL DEFAULT NOW(),
      answeredAt DATETIME DEFAULT NULL,
      INDEX idx_product (productId),
      INDEX idx_user (userId)
    )
  `);
}

function mapQA(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.productId,
    question: row.question,
    answer: row.answer || null,
    answeredAt: row.answeredAt || null,
    createdAt: row.createdAt,
    asker: row.askerName ? { name: row.askerName } : null,
    answerer: row.answererName ? { name: row.answererName } : null,
  };
}

async function listProductQA(productId, { page = 1, perPage = 10 } = {}) {
  await ensureTable();
  const offset = (page - 1) * perPage;
  const [countRows, rows] = await Promise.all([
    query(`SELECT COUNT(*) AS total FROM ProductQA WHERE productId = :productId`, { productId }),
    query(
      `SELECT pq.*, u1.name AS askerName, u2.name AS answererName
       FROM ProductQA pq
       LEFT JOIN Users u1 ON u1.id = pq.userId
       LEFT JOIN Users u2 ON u2.id = pq.answeredBy
       WHERE pq.productId = :productId
       ORDER BY pq.createdAt DESC
       LIMIT :limit OFFSET :offset`,
      { productId, limit: perPage, offset }
    ),
  ]);
  return {
    questions: rows.map(mapQA),
    total: Number(countRows[0]?.total || 0),
    page,
    totalPages: Math.max(1, Math.ceil(Number(countRows[0]?.total || 0) / perPage)),
  };
}

async function createQuestion(productId, userId, question) {
  await ensureTable();
  const result = await execute(
    `INSERT INTO ProductQA (productId, userId, question, createdAt) VALUES (:productId, :userId, :question, NOW())`,
    { productId, userId, question }
  );
  const rows = await query(
    `SELECT pq.*, u1.name AS askerName FROM ProductQA pq LEFT JOIN Users u1 ON u1.id = pq.userId WHERE pq.id = :id`,
    { id: result.insertId }
  );
  return mapQA(rows[0]);
}

async function answerQuestion(id, answeredBy, answer) {
  await execute(
    `UPDATE ProductQA SET answer = :answer, answeredBy = :answeredBy, answeredAt = NOW() WHERE id = :id`,
    { id, answeredBy, answer }
  );
  const rows = await query(
    `SELECT pq.*, u1.name AS askerName, u2.name AS answererName
     FROM ProductQA pq
     LEFT JOIN Users u1 ON u1.id = pq.userId
     LEFT JOIN Users u2 ON u2.id = pq.answeredBy
     WHERE pq.id = :id`,
    { id }
  );
  return mapQA(rows[0]);
}

export { listProductQA, createQuestion, answerQuestion };
