import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const Product = sequelize.define(
  "Product",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.id; } },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, unique: true, defaultValue: null },
    sku:  { type: DataTypes.STRING(64), unique: true, defaultValue: null },
    description: { type: DataTypes.TEXT, allowNull: false },
    images: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
      get() { return JSON.parse(this.getDataValue("images") || "[]"); },
      set(val) { this.setDataValue("images", JSON.stringify(val)); },
    },
    brand: { type: DataTypes.STRING, defaultValue: null },
    price: { type: DataTypes.FLOAT, defaultValue: 0 },
    oldprice: { type: DataTypes.FLOAT, defaultValue: 0 },
    catName: { type: DataTypes.STRING, defaultValue: null },
    catId: { type: DataTypes.INTEGER, defaultValue: null },
    subCatId: { type: DataTypes.INTEGER, defaultValue: null },
    subCat: { type: DataTypes.STRING, defaultValue: null },
    thirdSubCatId: { type: DataTypes.INTEGER, defaultValue: null },
    thirdSubCat: { type: DataTypes.STRING, defaultValue: null },
    countInStock: { type: DataTypes.INTEGER, defaultValue: 0 },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    discount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    productRam: { type: DataTypes.STRING, defaultValue: null },
    size: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
      get() { return JSON.parse(this.getDataValue("size") || "[]"); },
      set(val) { this.setDataValue("size", JSON.stringify(val)); },
    },
    productWeight: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
      get() { return JSON.parse(this.getDataValue("productWeight") || "[]"); },
      set(val) { this.setDataValue("productWeight", JSON.stringify(val)); },
    },
  },
  { timestamps: true }
);

export default Product;
