import { Category } from "../models/Category.js";
import { Op } from "sequelize";
import fs from "fs";

export const uploadImages = async (req, res) => {
  try {
    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    return res.status(200).json({ images: imageUrls, message: "Image uploaded successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const createCategory = async (req, res) => {
  try {
    const images = Array.isArray(req.body.images)
      ? req.body.images
      : JSON.parse(req.body.images || "[]");

    const category = await Category.create({
      name: req.body.name,
      images,
      parentCatName: req.body.parentCatName || null,
      parentCatId: req.body.parentCatId || null,
    });

    return res.status(201).json({ category, message: "Category created successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    const categoryMap = {};

    categories.forEach((cat) => {
      categoryMap[cat.id] = { ...cat.toJSON(), children: [] };
    });

    const rootCategories = [];

    categories.forEach((cat) => {
      if (cat.parentCatId) {
        if (categoryMap[cat.parentCatId]) {
          categoryMap[cat.parentCatId].children.push(categoryMap[cat.id]);
        }
      } else {
        rootCategories.push(categoryMap[cat.id]);
      }
    });

    return res.status(200).json({ categories: rootCategories, data: rootCategories, message: "Categories fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getCategoryCount = async (req, res) => {
  try {
    const categoryCount = await Category.count({ where: { parentCatId: null } });
    return res.status(200).json({ count: categoryCount, message: "Category count fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getSubCategoryCount = async (req, res) => {
  try {
    const count = await Category.count({ where: { parentCatId: { [Op.not]: null } } });
    return res.status(200).json({ count, message: "Subcategory count fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found", error: true, success: false });
    }
    return res.status(200).json({ categorybyId: category, message: "Category fetched successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const imgPath = req.query.img;
    const filename = imgPath.split("/uploads/")[1];
    if (filename) { try { fs.unlinkSync(`uploads/${filename}`); } catch (e) {} }
    return res.status(200).json({ result: "ok" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found", error: true, success: false });
    }

    // Delete local image files
    for (const img of category.images) {
      const filename = img.split("/uploads/")[1];
      if (filename) { try { fs.unlinkSync(`uploads/${filename}`); } catch (e) {} }
    }

    // Delete subcategories and their children
    const subCategories = await Category.findAll({ where: { parentCatId: req.params.id } });
    for (const sub of subCategories) {
      const thirdSubs = await Category.findAll({ where: { parentCatId: sub.id } });
      for (const third of thirdSubs) {
        await Category.destroy({ where: { id: third.id } });
      }
      await Category.destroy({ where: { id: sub.id } });
    }

    await Category.destroy({ where: { id: req.params.id } });

    return res.status(200).json({ message: "Category deleted successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const deleteMultipleCategories = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No category IDs provided", error: true, success: false });
    }

    for (const id of ids) {
      const category = await Category.findByPk(id);
      if (!category) continue;

      for (const img of category.images) {
        const filename = img.split("/uploads/")[1];
        if (filename) { try { fs.unlinkSync(`uploads/${filename}`); } catch (e) {} }
      }

      const subCategories = await Category.findAll({ where: { parentCatId: id } });
      for (const sub of subCategories) {
        const thirdSubs = await Category.findAll({ where: { parentCatId: sub.id } });
        for (const third of thirdSubs) {
          await Category.destroy({ where: { id: third.id } });
        }
        await Category.destroy({ where: { id: sub.id } });
      }
      await Category.destroy({ where: { id } });
    }

    return res.status(200).json({ message: "Categories deleted successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const images = Array.isArray(req.body.images)
      ? req.body.images
      : JSON.parse(req.body.images || "[]");

    await Category.update(
      {
        name: req.body.name,
        images: images.length > 0 ? images : undefined,
        parentCatName: req.body.parentCatName || null,
        parentCatId: req.body.parentCatId || null,
      },
      { where: { id: req.params.id } }
    );

    const category = await Category.findByPk(req.params.id);

    return res.status(200).json({ category, message: "Category updated successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};
