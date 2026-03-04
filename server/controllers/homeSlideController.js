import { HomeSlide } from "../models/HomeSlide.js";
import { v2 as cloudinary } from "cloudinary";
import pLimit from "p-limit";

export const uploadImages = async (req, res) => {
    try {
        const images = req.files;
        if (!images || images.length === 0) {
            return res.status(400).json({ success: false, message: "No images provided" });
        }

        const limit = pLimit(5);
        const imagesToUpload = images.map((image) => {
            return limit(async () => {
                const result = await cloudinary.uploader.upload(image.path, {
                    folder: "home_slides",
                });
                return result.secure_url;
            });
        });

        const uploadResults = await Promise.all(imagesToUpload);
        return res.status(200).json({ success: true, images: uploadResults });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const addHomeSlide = async (req, res) => {
    try {
        const { images } = req.body;

        if (!images || images.length === 0) {
            return res.status(400).json({ success: false, message: "At least one image is required" });
        }

        const newSlide = new HomeSlide({ images });
        await newSlide.save();

        return res.status(201).json({ success: true, message: "Home Slide added successfully", data: newSlide });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const getHomeSlides = async (req, res) => {
    try {
        const slides = await HomeSlide.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: slides });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const deleteHomeSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSlide = await HomeSlide.findByIdAndDelete(id);

        if (!deletedSlide) {
            return res.status(404).json({ success: false, message: "Home Slide not found" });
        }

        return res.status(200).json({ success: true, message: "Home Slide deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
