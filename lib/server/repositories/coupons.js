import { execute, query } from "../db/mysql.js";

function mapCoupon(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    value: Number(row.value || 0),
    minOrderValue: Number(row.minOrderValue || 0),
    maxDiscount: row.maxDiscount == null ? null : Number(row.maxDiscount),
    usageLimit: row.usageLimit == null ? null : Number(row.usageLimit),
    usageCount: Number(row.usageCount || 0),
    isActive: Boolean(row.isActive),
    restrictionType: row.restrictionType || "none",
    restrictedEmail: row.restrictedEmail || null,
  };
}

async function listCoupons() {
  const rows = await query(
    `SELECT
       id,
       code,
       description,
       type,
       value,
       minOrderValue,
       maxDiscount,
       usageLimit,
       usageCount,
       isActive,
       expiresAt,
       restrictionType,
       restrictedEmail,
       createdAt,
       updatedAt
     FROM Coupons
     ORDER BY createdAt DESC`
  );

  return rows.map(mapCoupon);
}

async function findCouponById(id, conn = null) {
  const rows = await runQuery(
    conn,
    `SELECT
       id,
       code,
       description,
       type,
       value,
       minOrderValue,
       maxDiscount,
       usageLimit,
       usageCount,
       isActive,
       expiresAt,
       restrictionType,
       restrictedEmail,
       createdAt,
       updatedAt
     FROM Coupons
     WHERE id = :id
     LIMIT 1`,
    { id }
  );

  return mapCoupon(rows[0]);
}

async function findCouponByCode(code, conn = null) {
  const rows = await runQuery(
    conn,
    `SELECT
       id,
       code,
       description,
       type,
       value,
       minOrderValue,
       maxDiscount,
       usageLimit,
       usageCount,
       isActive,
       expiresAt,
       restrictionType,
       restrictedEmail,
       createdAt,
       updatedAt
     FROM Coupons
     WHERE code = :code
     LIMIT 1`,
    { code }
  );

  return mapCoupon(rows[0]);
}

async function createCoupon(payload) {
  const result = await execute(
    `INSERT INTO Coupons (
      code,
      description,
      type,
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      usageCount,
      isActive,
      expiresAt,
      restrictionType,
      restrictedEmail,
      createdAt,
      updatedAt
    ) VALUES (
      :code,
      :description,
      :type,
      :value,
      :minOrderValue,
      :maxDiscount,
      :usageLimit,
      0,
      :isActive,
      :expiresAt,
      :restrictionType,
      :restrictedEmail,
      NOW(),
      NOW()
    )`,
    {
      ...payload,
      isActive: payload.isActive ? 1 : 0,
    }
  );

  return findCouponById(result.insertId);
}

async function updateCoupon(id, payload) {
  const serialized = {
    ...payload,
    isActive:
      payload.isActive === undefined ? undefined : payload.isActive ? 1 : 0,
  };
  const entries = Object.entries(serialized).filter(([, value]) => value !== undefined);
  if (!entries.length) {
    return findCouponById(id);
  }

  const setClause = entries.map(([key]) => `\`${key}\` = :${key}`).join(", ");
  await execute(
    `UPDATE Coupons
     SET ${setClause}, updatedAt = NOW()
     WHERE id = :id`,
    { id, ...Object.fromEntries(entries) }
  );

  return findCouponById(id);
}

async function deleteCoupon(id) {
  const result = await execute(
    `DELETE FROM Coupons
     WHERE id = :id`,
    { id }
  );

  return result.affectedRows > 0;
}

async function incrementCouponUsage(id, conn = null) {
  await runExecute(
    conn,
    `UPDATE Coupons
     SET usageCount = usageCount + 1, updatedAt = NOW()
     WHERE id = :id`,
    { id }
  );
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

export {
  createCoupon,
  deleteCoupon,
  findCouponByCode,
  findCouponById,
  incrementCouponUsage,
  listCoupons,
  updateCoupon,
};
