import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        images: [{ type: String , required: true }],
        brand: { type: String, default: null },
        price: { type: Number, default: 0 },
        oldprice: { type: Number, default: 0 },
        catName: { type: String, default: null },
        catId: {type: String, default: null },
        subCatId: {type: String, default: null },
        subCat: { type: String, default: null },
        thirdSubCatId: {type: String, default: null },
        thirdSubCat: { type: String, default: null },
        countInStock: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
        discount: { type: Number, required: true },
        productRam: { type: String, default: null },
        size: [{ type: String, default: null }],
        productWeight: [{ type: String, default: null }],
        dateCreated: { type: Date, default: Date.now },
    },
    { timestamps: true
    }
)

const Product = mongoose.model('Product', productSchema);

export default Product;
