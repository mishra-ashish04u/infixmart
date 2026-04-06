import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import AttributeType from "./AttributeType.js";

const AttributeValue = sequelize.define(
  "AttributeValue",
  {
    id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    attributeTypeId: { type: DataTypes.INTEGER, allowNull: false },
    value:           { type: DataTypes.STRING, allowNull: false },
  },
  { timestamps: true }
);

AttributeType.hasMany(AttributeValue, { foreignKey: "attributeTypeId", as: "values", onDelete: "CASCADE" });
AttributeValue.belongsTo(AttributeType, { foreignKey: "attributeTypeId" });

export default AttributeValue;
