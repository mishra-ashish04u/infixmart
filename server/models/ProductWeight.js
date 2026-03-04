import mongoose from "mongoose";

const productWeightSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

export const ProductWeight = mongoose.model("ProductWeight", productWeightSchema);
