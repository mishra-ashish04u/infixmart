import Product from "../models/Product.js";
import { Op } from "sequelize";
import { sanitizeRichText } from "../utils/htmlSanitizer.js";
import { deleteUploadByPublicPath } from "../config/uploads.js";

// ── Slug helper ───────────────────────────────────────────────────────────────
const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const uniqueProductSlug = async (name, excludeId = null) => {
  let base = toSlug(name);
  let slug = base;
  let n = 1;
  while (true) {
    const where = { slug };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const exists = await Product.findOne({ where });
    if (!exists) break;
    slug = `${base}-${n++}`;
  }
  return slug;
};

export const uploadImages = async (req, res) => {
  try {
    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    return res.status(200).json({ images: imageUrls, message: "Image uploaded successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const createProduct = async (req, res) => {
  try {
    const images = Array.isArray(req.body.images)
      ? req.body.images
      : JSON.parse(req.body.images || "[]");

    // Auto-generate slug if not provided
    const slug = req.body.slug
      ? await uniqueProductSlug(req.body.slug)
      : await uniqueProductSlug(req.body.name || "product");

    // Auto-generate SKU if not provided
    const sku = req.body.sku
      ? req.body.sku.trim().toUpperCase()
      : `SKU-${Date.now()}`;

    const description = sanitizeRichText(req.body.description || "");

    const product = await Product.create({
      name: req.body.name,
      slug,
      sku,
      description,
      images,
      brand: req.body.brand || null,
      price: req.body.price || 0,
      oldprice: req.body.oldprice || 0,
      catName: req.body.catName || null,
      catId: req.body.catId || null,
      subCatId: req.body.subCatId || null,
      subCat: req.body.subCat || null,
      thirdSubCatId: req.body.thirdSubCatId || null,
      thirdSubCat: req.body.thirdSubCat || null,
      countInStock: req.body.countInStock || 0,
      rating: req.body.rating || 0,
      isFeatured: req.body.isFeatured || false,
      discount: req.body.discount,
      productRam: req.body.productRam || null,
      size: Array.isArray(req.body.size) ? req.body.size : JSON.parse(req.body.size || "[]"),
      productWeight: Array.isArray(req.body.productWeight) ? req.body.productWeight : JSON.parse(req.body.productWeight || "[]"),
    });

    return res.status(201).json({ product, message: "Product created successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const where = {};
    if (req.query.category) where.catId = req.query.category;
    if (req.query.subCategory) where.subCatId = req.query.subCategory;
    if (req.query.thirdCategory) where.thirdSubCatId = req.query.thirdCategory;
    if (req.query.search) where.name = { [Op.like]: `%${req.query.search}%` };
    if (req.query.onSale === "true") where.discount = { [Op.gt]: 0 };
    if (req.query.minRating) where.rating = { [Op.gte]: Number(req.query.minRating) };
    if (req.query.inStockOnly === "true") where.countInStock = { [Op.gt]: 0 };
    if (req.query.minPrice && req.query.maxPrice) {
      where.price = { [Op.between]: [+req.query.minPrice, +req.query.maxPrice] };
    } else if (req.query.minPrice) {
      where.price = { [Op.gte]: +req.query.minPrice };
    } else if (req.query.maxPrice) {
      where.price = { [Op.lte]: +req.query.maxPrice };
    }

    // Build order clause
    let order = [["createdAt", "DESC"]];
    const sort = req.query.sort;
    if (sort === "price-asc")   order = [["price", "ASC"]];
    else if (sort === "price-desc")  order = [["price", "DESC"]];
    else if (sort === "rating-desc") order = [["rating", "DESC"]];
    else if (sort === "name-asc")    order = [["name", "ASC"]];
    else if (sort === "popular")     order = [["rating", "DESC"]];
    else if (sort === "bestseller")  order = [["discount", "DESC"], ["rating", "DESC"]];

    const totalPosts = await Product.count({ where });
    const totalPages = Math.ceil(totalPosts / perPage) || 1;

    const products = await Product.findAll({ where, order, offset: (page - 1) * perPage, limit: perPage });

    return res.status(200).json({ products, totalPages, page, message: "Products fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getProductByCatId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await Product.count();
    const totalPages = Math.ceil(totalPosts / perPage);

    const products = await Product.findAll({
      where: { catId: req.params.id },
      offset: (page - 1) * perPage,
      limit: perPage,
    });

    return res.status(200).json({ products, totalPages, page, message: "Products fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getProductByCatName = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await Product.count();
    const totalPages = Math.ceil(totalPosts / perPage);

    const products = await Product.findAll({
      where: { catName: req.query.catName },
      offset: (page - 1) * perPage,
      limit: perPage,
    });

    return res.status(200).json({ products, totalPages, page, message: "Products fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getProductBySubCatId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;
    const totalPosts = await Product.count();
    const totalPages = Math.ceil(totalPosts / perPage);

    const products = await Product.findAll({
      where: { subCatId: req.params.id },
      offset: (page - 1) * perPage,
      limit: perPage,
    });

    return res.status(200).json({ products, totalPages, page, message: "Products fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getProductBySubCatName = async (req, res) => {
  try {
    const products = await Product.findAll({ where: { subCat: req.query.subCat } });
    return res.status(200).json({ products, message: "Products fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getProductByThirdSubCatId = async (req, res) => {
  try {
    const products = await Product.findAll({ where: { thirdSubCatId: req.params.id } });
    return res.status(200).json({ products, message: "Products fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getProductByThirdSubCatName = async (req, res) => {
  try {
    const products = await Product.findAll({ where: { thirdSubCat: req.query.thirdSubCat } });
    return res.status(200).json({ products, message: "Products fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getProductByPrice = async (req, res) => {
  try {
    const where = {};
    if (req.query.catId) where.catId = req.query.catId;
    else if (req.query.subCatId) where.subCatId = req.query.subCatId;
    else if (req.query.thirdSubCatId) where.thirdSubCatId = req.query.thirdSubCatId;

    if (req.query.minPrice && req.query.maxPrice) {
      where.price = { [Op.between]: [+req.query.minPrice, +req.query.maxPrice] };
    } else if (req.query.minPrice) {
      where.price = { [Op.gte]: +req.query.minPrice };
    } else if (req.query.maxPrice) {
      where.price = { [Op.lte]: +req.query.maxPrice };
    }

    const products = await Product.findAll({ where });

    return res.status(200).json({ products, message: "Products fetched successfully", totalPages: 0, page: 0, success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getProductByRating = async (req, res) => {
  try {
    const where = { rating: req.query.rating };
    if (req.query.catId) where.catId = req.query.catId;
    else if (req.query.subCatId) where.subCatId = req.query.subCatId;
    else if (req.query.thirdSubCatId) where.thirdSubCatId = req.query.thirdSubCatId;

    const products = await Product.findAll({ where });

    return res.status(200).json({ products, message: "Products fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getProductCount = async (req, res) => {
  try {
    const productCount = await Product.count();
    return res.status(200).json({ productCount, message: "Product count fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getFeaturedProduct = async (req, res) => {
  try {
    const products = await Product.findAll({ where: { isFeatured: true } });
    return res.status(200).json({ products, message: "Featured Products fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found", error: true, success: false });
    }

    // Delete local image files
    for (const img of product.images) {
      deleteUploadByPublicPath(img);
    }

    await Product.destroy({ where: { id: req.params.id } });

    return res.status(200).json({ message: "Product deleted successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found", error: true, success: false });
    }
    return res.status(200).json({ product, message: "Product fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { slug: req.params.slug } });
    if (!product) {
      return res.status(404).json({ message: "Product not found", error: true, success: false });
    }
    return res.status(200).json({ product, message: "Product fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const imgPath = req.query.img;
    if (!imgPath || !deleteUploadByPublicPath(imgPath)) {
      return res.status(400).json({ message: "Invalid path", error: true, success: false });
    }
    return res.status(200).json({ result: "ok" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const images = Array.isArray(req.body.images)
      ? req.body.images
      : JSON.parse(req.body.images || "[]");

    // Compute slug: if provided use it (ensure unique), else keep existing
    let slugUpdate = undefined;
    if (req.body.slug) {
      slugUpdate = await uniqueProductSlug(req.body.slug, req.params.id);
    }

    const skuUpdate = req.body.sku ? req.body.sku.trim().toUpperCase() : undefined;

    const description = sanitizeRichText(req.body.description || "");

    await Product.update(
      {
        name: req.body.name,
        ...(slugUpdate !== undefined && { slug: slugUpdate }),
        ...(skuUpdate  !== undefined && { sku:  skuUpdate }),
        description,
        images,
        brand: req.body.brand || null,
        price: req.body.price || 0,
        oldprice: req.body.oldprice || 0,
        catName: req.body.catName || null,
        catId: req.body.catId || null,
        subCatId: req.body.subCatId || null,
        subCat: req.body.subCat || null,
        thirdSubCatId: req.body.thirdSubCatId || null,
        thirdSubCat: req.body.thirdSubCat || null,
        countInStock: req.body.countInStock || 0,
        rating: req.body.rating || 0,
        isFeatured: req.body.isFeatured || false,
        discount: req.body.discount,
        productRam: req.body.productRam || null,
        size: Array.isArray(req.body.size) ? req.body.size : JSON.parse(req.body.size || "[]"),
        productWeight: Array.isArray(req.body.productWeight) ? req.body.productWeight : JSON.parse(req.body.productWeight || "[]"),
      },
      { where: { id: req.params.id } }
    );

    const product = await Product.findByPk(req.params.id);

    return res.status(200).json({ product, message: "Product updated successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const deleteMultipleProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No product IDs provided", error: true, success: false });
    }

    const products = await Product.findAll({ where: { id: { [Op.in]: ids } } });
    for (const product of products) {
      for (const img of product.images) {
        deleteUploadByPublicPath(img);
      }
    }

    await Product.destroy({ where: { id: { [Op.in]: ids } } });

    return res.status(200).json({ message: "Products deleted successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};
