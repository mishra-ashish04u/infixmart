import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const Address = sequelize.define(
  "Address",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.id; } },
    name: { type: DataTypes.STRING, allowNull: false },
    mobile: { type: DataTypes.STRING, allowNull: false },
    pincode: { type: DataTypes.STRING, allowNull: false },
    flatHouse: { type: DataTypes.STRING, allowNull: false },
    areaStreet: { type: DataTypes.STRING, allowNull: false },
    landmark: { type: DataTypes.STRING, defaultValue: "" },
    townCity: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false, defaultValue: "India" },
    status: { type: DataTypes.BOOLEAN, defaultValue: true },
    isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { timestamps: true }
);

export default Address;
