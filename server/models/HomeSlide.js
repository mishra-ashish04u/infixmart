import mongoose from "mongoose";

const homeSlideSchema = new mongoose.Schema(
    {
        images: [
            {
                type: String,
                required: true,
            },
        ],
    },
    { timestamps: true }
);

export const HomeSlide = mongoose.model("HomeSlide", homeSlideSchema);
