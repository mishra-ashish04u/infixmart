import { query } from "../db/mysql.js";

const STATIC_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/productListing", changefreq: "daily", priority: "0.9" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/terms", changefreq: "monthly", priority: "0.3" },
  { path: "/shipping-policy", changefreq: "monthly", priority: "0.3" },
  { path: "/return-policy", changefreq: "monthly", priority: "0.3" },
  { path: "/payment-security", changefreq: "monthly", priority: "0.3" },
  { path: "/privacy-policy", changefreq: "monthly", priority: "0.3" },
  { path: "/cancellation-policy", changefreq: "monthly", priority: "0.3" },
];

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function buildSitemapXml() {
  const [products, blogs] = await Promise.all([
    query(
      `SELECT id, slug, updatedAt
       FROM Products
       ORDER BY updatedAt DESC
       LIMIT 5000`
    ),
    query(
      `SELECT slug, updatedAt, createdAt
       FROM Blogs
       WHERE published = 1
       ORDER BY updatedAt DESC
       LIMIT 5000`
    ),
  ]);

  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const route of STATIC_ROUTES) {
    xml += `\n  <url>\n    <loc>${escapeXml(`${frontendUrl}${route.path}`)}</loc>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`;
  }

  for (const product of products) {
    const productPath = `/product/${product.slug || product.id}`;
    xml += `\n  <url>\n    <loc>${escapeXml(`${frontendUrl}${productPath}`)}</loc>\n    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
  }

  for (const blog of blogs) {
    xml += `\n  <url>\n    <loc>${escapeXml(`${frontendUrl}/blog/${blog.slug}`)}</loc>\n    <lastmod>${new Date(blog.updatedAt || blog.createdAt).toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
  }

  xml += "\n</urlset>";
  return xml;
}

export { buildSitemapXml };
