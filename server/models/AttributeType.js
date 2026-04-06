import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const AttributeType = sequelize.define(
  "AttributeType",
  {
    id:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { timestamps: true }
);

export default AttributeType;
