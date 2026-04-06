import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const ProductRam = sequelize.define(
  "ProductRam",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.id; } },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { timestamps: true }
);

export { ProductRam };
