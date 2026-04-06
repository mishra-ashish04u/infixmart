import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.id; } },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    items: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
      get() { return JSON.parse(this.getDataValue("items") || "[]"); },
      set(val) { this.setDataValue("items", JSON.stringify(val)); },
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      defaultValue: "{}",
      get() { return JSON.parse(this.getDataValue("shippingAddress") || "{}"); },
      set(val) { this.setDataValue("shippingAddress", JSON.stringify(val)); },
    },
    paymentMethod: { type: DataTypes.STRING, defaultValue: "" },
    paymentResult: {
      type: DataTypes.TEXT,
      defaultValue: "{}",
      get() { return JSON.parse(this.getDataValue("paymentResult") || "{}"); },
      set(val) { this.setDataValue("paymentResult", JSON.stringify(val)); },
    },
    itemsPrice: { type: DataTypes.FLOAT, defaultValue: 0 },
    shippingPrice: { type: DataTypes.FLOAT, defaultValue: 0 },
    gstAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    totalPrice: { type: DataTypes.FLOAT, defaultValue: 0 },
    isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
    paidAt: { type: DataTypes.DATE, defaultValue: null },
    status: {
      type: DataTypes.ENUM("pending", "processing", "shipped", "delivered", "cancelled"),
      defaultValue: "pending",
    },
  },
  { timestamps: true }
);

export default Order;
