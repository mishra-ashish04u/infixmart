import { HomeSlide } from "../models/HomeSlide.js";
import fs from "fs";

export const uploadImages = async (req, res) => {
  try {
    const images = req.files;
    if (!images || images.length === 0) {
      return res.status(400).json({ success: false, message: "No images provided" });
    }
    const imageUrls = images.map((file) => `/uploads/${file.filename}`);
    return res.status(200).json({ success: true, images: imageUrls });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const addHomeSlide = async (req, res) => {
  try {
    const { images, title, link, order, type, isActive } = req.body;
    if (!images || images.length === 0) {
      return res.status(400).json({ success: false, message: "At least one image is required" });
    }
    const newSlide = await HomeSlide.create({
      images: Array.isArray(images) ? images : JSON.parse(images || "[]"),
      title: title || null,
      link: link || null,
      order: order ?? 0,
      type: type || "main",
      isActive: isActive !== undefined ? isActive : true,
    });
    return res.status(201).json({ success: true, message: "Home Slide added successfully", data: newSlide });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getHomeSlides = async (req, res) => {
  try {
    const where = {};
    if (req.query.type) where.type = req.query.type;
    const slides = await HomeSlide.findAll({ where, order: [["order", "ASC"], ["createdAt", "DESC"]] });
    return res.status(200).json({ success: true, data: slides });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateHomeSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link, order, isActive, type } = req.body;

    const slide = await HomeSlide.findByPk(id);
    if (!slide) return res.status(404).json({ success: false, message: "Slide not found" });

    await slide.update({
      ...(title !== undefined && { title }),
      ...(link !== undefined && { link }),
      ...(order !== undefined && { order }),
      ...(isActive !== undefined && { isActive }),
      ...(type !== undefined && { type }),
    });

    return res.status(200).json({ success: true, message: "Slide updated", data: slide });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const deleteHomeSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await HomeSlide.findByPk(id);
    if (!slide) return res.status(404).json({ success: false, message: "Home Slide not found" });

    // Delete image files
    for (const img of slide.images) {
      const filename = img.split("/uploads/")[1];
      if (filename) { try { fs.unlinkSync(`uploads/${filename}`); } catch {} }
    }

    await slide.destroy();
    return res.status(200).json({ success: true, message: "Home Slide deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
