import { execute, query } from "../db/mysql.js";

const BLOG_SELECT = `
  id,
  title,
  slug,
  excerpt,
  content,
  image,
  author,
  published,
  createdAt,
  updatedAt
`;

function mapBlog(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    _id: row.id,
    published: Boolean(row.published),
  };
}

async function listPublishedBlogs({ page = 1, perPage = 10 }) {
  const offset = (page - 1) * perPage;
  const [countRows, blogRows] = await Promise.all([
    query(
      `SELECT COUNT(*) AS total
       FROM Blogs
       WHERE published = 1`
    ),
    query(
      `SELECT ${BLOG_SELECT}
       FROM Blogs
       WHERE published = 1
       ORDER BY createdAt DESC
       LIMIT :limit OFFSET :offset`,
      { limit: perPage, offset }
    ),
  ]);

  const total = Number(countRows[0]?.total || 0);
  return {
    blogs: blogRows.map(mapBlog),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

async function findPublishedBlogBySlug(slug) {
  const rows = await query(
    `SELECT ${BLOG_SELECT}
     FROM Blogs
     WHERE slug = :slug AND published = 1
     LIMIT 1`,
    { slug }
  );

  return mapBlog(rows[0]);
}

async function listAllBlogs() {
  const rows = await query(
    `SELECT ${BLOG_SELECT}
     FROM Blogs
     ORDER BY createdAt DESC`
  );

  return rows.map(mapBlog);
}

async function findBlogById(id) {
  const rows = await query(
    `SELECT ${BLOG_SELECT}
     FROM Blogs
     WHERE id = :id
     LIMIT 1`,
    { id }
  );

  return mapBlog(rows[0]);
}

async function slugExists(slug, excludeId = null) {
  const rows = await query(
    `SELECT id
     FROM Blogs
     WHERE slug = :slug
       ${excludeId ? "AND id != :excludeId" : ""}
     LIMIT 1`,
    excludeId ? { slug, excludeId } : { slug }
  );

  return Boolean(rows[0]);
}

async function createBlog(payload) {
  const result = await execute(
    `INSERT INTO Blogs (
      title,
      slug,
      excerpt,
      content,
      image,
      author,
      published,
      createdAt,
      updatedAt
    ) VALUES (
      :title,
      :slug,
      :excerpt,
      :content,
      :image,
      :author,
      :published,
      NOW(),
      NOW()
    )`,
    {
      ...payload,
      published: payload.published ? 1 : 0,
    }
  );

  return findBlogById(result.insertId);
}

async function updateBlog(id, payload) {
  const serialized = {
    ...payload,
    published:
      payload.published === undefined ? undefined : payload.published ? 1 : 0,
  };
  const entries = Object.entries(serialized).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return findBlogById(id);
  }

  const setClause = entries.map(([key]) => `\`${key}\` = :${key}`).join(", ");
  await execute(
    `UPDATE Blogs
     SET ${setClause}, updatedAt = NOW()
     WHERE id = :id`,
    { id, ...Object.fromEntries(entries) }
  );

  return findBlogById(id);
}

async function deleteBlogById(id) {
  const result = await execute(
    `DELETE FROM Blogs
     WHERE id = :id`,
    { id }
  );

  return result.affectedRows > 0;
}

export {
  createBlog,
  deleteBlogById,
  findBlogById,
  findPublishedBlogBySlug,
  listAllBlogs,
  listPublishedBlogs,
  slugExists,
  updateBlog,
};
