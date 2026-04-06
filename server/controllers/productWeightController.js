import { ProductWeight } from "../models/ProductWeight.js";

export const addProductWeight = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Weight name is required" });

    const existing = await ProductWeight.findOne({ where: { name } });
    if (existing) return res.status(400).json({ success: false, message: "Product Weight already exists" });

    const newWeight = await ProductWeight.create({ name });
    return res.status(201).json({ success: true, message: "Product Weight created successfully", data: newWeight });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getProductWeights = async (req, res) => {
  try {
    const productWeights = await ProductWeight.findAll();
    return res.status(200).json({ success: true, data: productWeights });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const deleteProductWeight = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProductWeight.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ success: false, message: "Product Weight not found" });
    return res.status(200).json({ success: true, message: "Product Weight deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
