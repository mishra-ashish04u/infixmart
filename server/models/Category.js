import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const Category = sequelize.define(
  "Category",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.id; } },
    name: { type: DataTypes.STRING, allowNull: false },
    images: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
      get() { return JSON.parse(this.getDataValue("images") || "[]"); },
      set(val) { this.setDataValue("images", JSON.stringify(val)); },
    },
    parentCatName: { type: DataTypes.STRING, defaultValue: null },
    parentCatId: { type: DataTypes.INTEGER, defaultValue: null },
  },
  { timestamps: true }
);

export { Category };
