import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId:   { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: true },
    name:      { type: DataTypes.STRING,  allowNull: false },
    image:     { type: DataTypes.STRING,  defaultValue: "" },
    price:     { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    qty:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  },
  { timestamps: true }
);

export default OrderItem;
