import mongoose from "mongoose";

const productRamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

export const ProductRam = mongoose.model("ProductRam", productRamSchema);
