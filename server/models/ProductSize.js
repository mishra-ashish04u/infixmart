import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const ProductSize = sequelize.define(
  "ProductSize",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.id; } },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { timestamps: true }
);

export { ProductSize };
