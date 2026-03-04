import mongoose from "mongoose";

const productSizeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

export const ProductSize = mongoose.model("ProductSize", productSizeSchema);
