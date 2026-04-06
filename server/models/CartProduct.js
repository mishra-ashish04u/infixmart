import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const CartProduct = sequelize.define(
  "CartProduct",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.id; } },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { timestamps: true }
);

export default CartProduct;
