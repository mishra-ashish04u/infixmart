import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const Return = sequelize.define(
  "Return",
  {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId:   { type: DataTypes.INTEGER, allowNull: false },
    userId:    { type: DataTypes.INTEGER, allowNull: false },
    reason:    { type: DataTypes.TEXT,    allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "completed"),
      defaultValue: "pending",
    },
    adminNote: { type: DataTypes.TEXT,    defaultValue: null },
  },
  { timestamps: true }
);

export default Return;
