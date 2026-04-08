import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const MyList = sequelize.define(
  "MyList",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.id; } },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productTitle: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    rating: { type: DataTypes.FLOAT, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    oldPrice: { type: DataTypes.FLOAT, allowNull: false },
    discount: { type: DataTypes.FLOAT, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
  },
  { timestamps: true }
);

export default MyList;
