import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const Coupon = sequelize.define(
  "Coupon",
  {
    id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code:          { type: DataTypes.STRING(32), allowNull: false, unique: true },
    description:   { type: DataTypes.STRING, defaultValue: null },
    type:          { type: DataTypes.ENUM("percent", "flat"), defaultValue: "percent" },
    value:         { type: DataTypes.FLOAT, allowNull: false },
    minOrderValue: { type: DataTypes.FLOAT, defaultValue: 0 },
    maxDiscount:   { type: DataTypes.FLOAT, defaultValue: null },
    usageLimit:    { type: DataTypes.INTEGER, defaultValue: null },
    usageCount:    { type: DataTypes.INTEGER, defaultValue: 0 },
    isActive:      { type: DataTypes.BOOLEAN, defaultValue: true },
    expiresAt:     { type: DataTypes.DATE, defaultValue: null },
  },
  { timestamps: true }
);

export default Coupon;
