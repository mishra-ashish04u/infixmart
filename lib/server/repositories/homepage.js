import { execute, query } from "../db/mysql.js";

const HOMEPAGE_SELECT = `
  id,
  section,
  \`key\`,
  title,
  subtitle,
  image,
  link,
  badge,
  badgeColor,
  bgColor,
  textColor,
  isActive,
  \`order\`,
  meta,
  createdAt,
  updatedAt
`;

function mapHomePageItem(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    _id: row.id,
    isActive: Boolean(row.isActive),
  };
}

async function listHomePageItemsBySection(section, { activeOnly = true } = {}) {
  const rows = await query(
    `SELECT ${HOMEPAGE_SELECT}
     FROM HomePageContents
     WHERE section = :section
       ${activeOnly ? "AND isActive = 1" : ""}
     ORDER BY \`order\` ASC, createdAt ASC`,
    { section }
  );

  return rows.map(mapHomePageItem);
}

async function listAllHomePageItems() {
  const rows = await query(
    `SELECT ${HOMEPAGE_SELECT}
     FROM HomePageContents
     ORDER BY section ASC, \`order\` ASC, createdAt ASC`
  );

  return rows.map(mapHomePageItem);
}

async function findHomePageItemById(id) {
  const rows = await query(
    `SELECT ${HOMEPAGE_SELECT}
     FROM HomePageContents
     WHERE id = :id
     LIMIT 1`,
    { id }
  );

  return mapHomePageItem(rows[0]);
}

async function createHomePageItem(payload) {
  const result = await execute(
    `INSERT INTO HomePageContents (
      section,
      \`key\`,
      title,
      subtitle,
      image,
      link,
      badge,
      badgeColor,
      bgColor,
      textColor,
      isActive,
      \`order\`,
      meta,
      createdAt,
      updatedAt
    ) VALUES (
      :section,
      :key,
      :title,
      :subtitle,
      :image,
      :link,
      :badge,
      :badgeColor,
      :bgColor,
      :textColor,
      :isActive,
      :order,
      :meta,
      NOW(),
      NOW()
    )`,
    {
      ...payload,
      isActive: payload.isActive ? 1 : 0,
    }
  );

  return findHomePageItemById(result.insertId);
}

async function updateHomePageItem(id, payload) {
  const serialized = {
    ...payload,
    isActive:
      payload.isActive === undefined ? undefined : payload.isActive ? 1 : 0,
  };
  const entries = Object.entries(serialized).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return findHomePageItemById(id);
  }

  const setClause = entries.map(([key]) => `\`${key}\` = :${key}`).join(", ");
  await execute(
    `UPDATE HomePageContents
     SET ${setClause}, updatedAt = NOW()
     WHERE id = :id`,
    { id, ...Object.fromEntries(entries) }
  );

  return findHomePageItemById(id);
}

async function deleteHomePageItem(id) {
  const result = await execute(
    `DELETE FROM HomePageContents
     WHERE id = :id`,
    { id }
  );

  return result.affectedRows > 0;
}

export {
  createHomePageItem,
  deleteHomePageItem,
  findHomePageItemById,
  listAllHomePageItems,
  listHomePageItemsBySection,
  updateHomePageItem,
};
