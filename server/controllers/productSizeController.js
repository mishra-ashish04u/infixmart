import { ProductSize } from "../models/ProductSize.js";

export const addProductSize = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Size name is required" });

    const existing = await ProductSize.findOne({ where: { name } });
    if (existing) return res.status(400).json({ success: false, message: "Product Size already exists" });

    const newSize = await ProductSize.create({ name });
    return res.status(201).json({ success: true, message: "Product Size created successfully", data: newSize });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getProductSizes = async (req, res) => {
  try {
    const productSizes = await ProductSize.findAll();
    return res.status(200).json({ success: true, data: productSizes });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const deleteProductSize = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProductSize.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ success: false, message: "Product Size not found" });
    return res.status(200).json({ success: true, message: "Product Size deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
