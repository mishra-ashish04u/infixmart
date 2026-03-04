import { ProductRam } from "../models/ProductRam.js";

export const addProductRam = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "RAM name is required" });
        }

        const existingRam = await ProductRam.findOne({ name });
        if (existingRam) {
            return res.status(400).json({ success: false, message: "Product RAM already exists" });
        }

        const newRam = new ProductRam({ name });
        await newRam.save();

        return res.status(201).json({ success: true, message: "Product RAM created successfully", data: newRam });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const getProductRams = async (req, res) => {
    try {
        const productRams = await ProductRam.find();
        return res.status(200).json({ success: true, data: productRams });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const deleteProductRam = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRam = await ProductRam.findByIdAndDelete(id);
        if (!deletedRam) {
            return res.status(404).json({ success: false, message: "Product RAM not found" });
        }
        return res.status(200).json({ success: true, message: "Product RAM deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
