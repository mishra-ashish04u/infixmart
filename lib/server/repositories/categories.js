import { execute, query } from "../db/mysql.js";

const CATEGORY_SELECT = `
  id,
  name,
  images,
  parentCatName,
  parentCatId,
  createdAt,
  updatedAt
`;

function mapCategory(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    _id: row.id,
    images: safeParseJson(row.images, []),
  };
}

async function listCategories() {
  const rows = await query(
    `SELECT ${CATEGORY_SELECT}
     FROM Categories
     ORDER BY createdAt DESC`
  );

  return rows.map(mapCategory);
}

async function findCategoryById(id) {
  const rows = await query(
    `SELECT ${CATEGORY_SELECT}
     FROM Categories
     WHERE id = :id
     LIMIT 1`,
    { id }
  );

  return mapCategory(rows[0]);
}

async function countRootCategories() {
  const rows = await query(
    `SELECT COUNT(*) AS count
     FROM Categories
     WHERE parentCatId IS NULL`
  );

  return Number(rows[0]?.count || 0);
}

async function countSubCategories() {
  const rows = await query(
    `SELECT COUNT(*) AS count
     FROM Categories
     WHERE parentCatId IS NOT NULL`
  );

  return Number(rows[0]?.count || 0);
}

async function createCategory(payload) {
  const result = await execute(
    `INSERT INTO Categories (
      name,
      images,
      parentCatName,
      parentCatId,
      createdAt,
      updatedAt
    ) VALUES (
      :name,
      :images,
      :parentCatName,
      :parentCatId,
      NOW(),
      NOW()
    )`,
    {
      name: payload.name,
      images: JSON.stringify(payload.images || []),
      parentCatName: payload.parentCatName || null,
      parentCatId: payload.parentCatId || null,
    }
  );

  return findCategoryById(result.insertId);
}

async function updateCategory(id, payload) {
  const entries = Object.entries({
    name: payload.name,
    images: payload.images ? JSON.stringify(payload.images) : undefined,
    parentCatName: payload.parentCatName || null,
    parentCatId: payload.parentCatId || null,
  }).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return findCategoryById(id);
  }

  const setClause = entries.map(([key]) => `\`${key}\` = :${key}`).join(", ");
  await execute(
    `UPDATE Categories
     SET ${setClause}, updatedAt = NOW()
     WHERE id = :id`,
    { id, ...Object.fromEntries(entries) }
  );

  return findCategoryById(id);
}

async function deleteCategoryById(id) {
  const result = await execute(
    `DELETE FROM Categories
     WHERE id = :id`,
    { id }
  );

  return result.affectedRows > 0;
}

async function listChildCategories(parentCatId) {
  const rows = await query(
    `SELECT ${CATEGORY_SELECT}
     FROM Categories
     WHERE parentCatId = :parentCatId`,
    { parentCatId }
  );

  return rows.map(mapCategory);
}

function safeParseJson(value, fallback) {
  try {
    return JSON.parse(value || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export {
  countRootCategories,
  countSubCategories,
  createCategory,
  deleteCategoryById,
  findCategoryById,
  listCategories,
  listChildCategories,
  updateCategory,
};
