import { execute, query } from "../db/mysql.js";

const HOME_SLIDE_SELECT = `
  id,
  images,
  title,
  link,
  \`order\`,
  type,
  isActive,
  createdAt,
  updatedAt
`;

function mapHomeSlide(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    _id: row.id,
    images: safeParseJson(row.images, []),
    isActive: Boolean(row.isActive),
  };
}

async function listHomeSlides({ type = "" } = {}) {
  const rows = await query(
    `SELECT ${HOME_SLIDE_SELECT}
     FROM HomeSlides
     ${type ? "WHERE type = :type" : ""}
     ORDER BY \`order\` ASC, createdAt DESC`,
    type ? { type } : {}
  );

  return rows.map(mapHomeSlide);
}

async function findHomeSlideById(id) {
  const rows = await query(
    `SELECT ${HOME_SLIDE_SELECT}
     FROM HomeSlides
     WHERE id = :id
     LIMIT 1`,
    { id }
  );

  return mapHomeSlide(rows[0]);
}

async function createHomeSlide(payload) {
  const result = await execute(
    `INSERT INTO HomeSlides (
      images,
      title,
      link,
      \`order\`,
      type,
      isActive,
      createdAt,
      updatedAt
    ) VALUES (
      :images,
      :title,
      :link,
      :order,
      :type,
      :isActive,
      NOW(),
      NOW()
    )`,
    {
      ...payload,
      images: JSON.stringify(payload.images || []),
      isActive: payload.isActive ? 1 : 0,
    }
  );

  return findHomeSlideById(result.insertId);
}

async function updateHomeSlide(id, payload) {
  const serialized = {
    ...payload,
    images: payload.images ? JSON.stringify(payload.images) : undefined,
    isActive:
      payload.isActive === undefined ? undefined : payload.isActive ? 1 : 0,
  };
  const entries = Object.entries(serialized).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return findHomeSlideById(id);
  }

  const setClause = entries.map(([key]) => `\`${key}\` = :${key}`).join(", ");
  await execute(
    `UPDATE HomeSlides
     SET ${setClause}, updatedAt = NOW()
     WHERE id = :id`,
    { id, ...Object.fromEntries(entries) }
  );

  return findHomeSlideById(id);
}

async function deleteHomeSlide(id) {
  const result = await execute(
    `DELETE FROM HomeSlides
     WHERE id = :id`,
    { id }
  );

  return result.affectedRows > 0;
}

function safeParseJson(value, fallback) {
  try {
    return JSON.parse(value || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export {
  createHomeSlide,
  deleteHomeSlide,
  findHomeSlideById,
  listHomeSlides,
  updateHomeSlide,
};
