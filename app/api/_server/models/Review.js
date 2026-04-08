import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const Review = sequelize.define(
  "Review",
  {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId:    { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    rating:    { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, validate: { min: 1, max: 5 } },
    title:     { type: DataTypes.STRING(120), defaultValue: "" },
    comment:   { type: DataTypes.TEXT, defaultValue: "" },
    verified:  { type: DataTypes.BOOLEAN, defaultValue: false }, // true if user actually bought the product
  },
  {
    timestamps: true,
    indexes: [
      { unique: true, fields: ["userId", "productId"] }, // one review per user per product
    ],
  }
);

export default Review;
