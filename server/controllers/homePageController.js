import HomePageContent from "../models/HomePageContent.js";
import fs from "fs";

// ── Public: GET /api/homepage/:section ───────────────────────────────────────
export const getSection = async (req, res) => {
  try {
    const { section } = req.params;
    const items = await HomePageContent.findAll({
      where: { section, isActive: true },
      order: [["order", "ASC"]],
    });
    return res.status(200).json({ items, success: true, error: false });
  } catch (err) {
    console.error("[homePageController.getSection]", err);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

// ── Admin: GET /api/admin/homepage ────────────────────────────────────────────
export const getAllSections = async (req, res) => {
  try {
    const items = await HomePageContent.findAll({ order: [["section", "ASC"], ["order", "ASC"]] });
    return res.status(200).json({ items, success: true, error: false });
  } catch (err) {
    console.error("[homePageController.getAllSections]", err);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

// ── Admin: POST /api/admin/homepage ───────────────────────────────────────────
export const createItem = async (req, res) => {
  try {
    const {
      section, key, title, subtitle, image, link,
      badge, badgeColor, bgColor, textColor, isActive, order, meta,
    } = req.body;

    if (!section || !key) {
      return res.status(400).json({ message: "section and key are required", error: true, success: false });
    }

    const item = await HomePageContent.create({
      section, key,
      title:      title      || null,
      subtitle:   subtitle   || null,
      image:      image      || null,
      link:       link       || null,
      badge:      badge      || null,
      badgeColor: badgeColor || "#1565C0",
      bgColor:    bgColor    || "#1565C0",
      textColor:  textColor  || "#fff",
      isActive:   isActive !== false,
      order:      Number(order) || 0,
      meta:       meta       || null,
    });

    return res.status(201).json({ item, message: "Item created", success: true, error: false });
  } catch (err) {
    console.error("[homePageController.createItem]", err);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

// ── Admin: PUT /api/admin/homepage/:id ────────────────────────────────────────
export const updateItem = async (req, res) => {
  try {
    const item = await HomePageContent.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found", error: true, success: false });
    }

    // Delete old uploaded image if replaced by a new uploaded file
    if (req.body.image && req.body.image !== item.image && item.image?.startsWith("/uploads/")) {
      const filename = item.image.split("/uploads/")[1];
      if (filename) { try { fs.unlinkSync(`uploads/${filename}`); } catch (e) {} }
    }

    await item.update({
      title:      req.body.title      ?? item.title,
      subtitle:   req.body.subtitle   ?? item.subtitle,
      image:      req.body.image      ?? item.image,
      link:       req.body.link       ?? item.link,
      badge:      req.body.badge      ?? item.badge,
      badgeColor: req.body.badgeColor ?? item.badgeColor,
      bgColor:    req.body.bgColor    ?? item.bgColor,
      textColor:  req.body.textColor  ?? item.textColor,
      isActive:   req.body.isActive   !== undefined ? req.body.isActive : item.isActive,
      order:      req.body.order      !== undefined ? Number(req.body.order) : item.order,
      meta:       req.body.meta       !== undefined ? req.body.meta : item.meta,
    });

    return res.status(200).json({ item, message: "Item updated", success: true, error: false });
  } catch (err) {
    console.error("[homePageController.updateItem]", err);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

// ── Admin: DELETE /api/admin/homepage/:id ─────────────────────────────────────
export const deleteItem = async (req, res) => {
  try {
    const item = await HomePageContent.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found", error: true, success: false });
    }
    if (item.image?.startsWith("/uploads/")) {
      const filename = item.image.split("/uploads/")[1];
      if (filename) { try { fs.unlinkSync(`uploads/${filename}`); } catch (e) {} }
    }
    await item.destroy();
    return res.status(200).json({ message: "Item deleted", success: true, error: false });
  } catch (err) {
    console.error("[homePageController.deleteItem]", err);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

// ── Admin: POST /api/admin/homepage/upload ────────────────────────────────────
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded", error: true, success: false });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    return res.status(200).json({ image: imageUrl, success: true, error: false });
  } catch (err) {
    console.error("[homePageController.uploadImage]", err);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};
