import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const HomeSlide = sequelize.define(
  "HomeSlide",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.id; } },
    images: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
      get() { return JSON.parse(this.getDataValue("images") || "[]"); },
      set(val) { this.setDataValue("images", JSON.stringify(val)); },
    },
    title:    { type: DataTypes.STRING, defaultValue: null, allowNull: true },
    link:     { type: DataTypes.STRING, defaultValue: null, allowNull: true },
    order:    { type: DataTypes.INTEGER, defaultValue: 0 },
    type:     { type: DataTypes.ENUM("main", "side"), defaultValue: "main" },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { timestamps: true }
);

export { HomeSlide };
