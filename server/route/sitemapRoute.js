import { Router } from "express";
import Product from "../models/Product.js";
import Blog from "../models/Blog.js";

const sitemapRouter = Router();

const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

sitemapRouter.get("/sitemap.xml", async (req, res) => {
  try {
    const [products, blogs] = await Promise.all([
      Product.findAll({
        attributes: ["id", "slug", "updatedAt"],
        order: [["updatedAt", "DESC"]],
        limit: 5000,
      }),
      Blog.findAll({
        where: { published: true },
        attributes: ["slug", "updatedAt", "createdAt"],
        order: [["updatedAt", "DESC"]],
        limit: 5000,
      }),
    ]);

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
    const staticRoutes = [
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

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    staticRoutes.forEach((route) => {
      xml += `
  <url>
    <loc>${escapeXml(`${frontendUrl}${route.path}`)}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    });

    products.forEach((product) => {
      const productPath = `/product/${product.slug || product.id}`;
      xml += `
  <url>
    <loc>${escapeXml(`${frontendUrl}${productPath}`)}</loc>
    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    blogs.forEach((blog) => {
      xml += `
  <url>
    <loc>${escapeXml(`${frontendUrl}/blog/${blog.slug}`)}</loc>
    <lastmod>${new Date(blog.updatedAt || blog.createdAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += "\n</urlset>";

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    res.status(200).send(xml);
  } catch (error) {
    console.error("[SITEMAP ERROR]", error);
    res.status(500).end();
  }
});

export default sitemapRouter;
