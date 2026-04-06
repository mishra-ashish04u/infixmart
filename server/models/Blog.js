import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const Blog = sequelize.define(
  "Blog",
  {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title:     { type: DataTypes.STRING,       allowNull: false },
    slug:      { type: DataTypes.STRING,       allowNull: false, unique: true },
    excerpt:   { type: DataTypes.TEXT,         defaultValue: "" },
    content:   { type: DataTypes.TEXT("long"), defaultValue: "" },
    image:     { type: DataTypes.STRING,       defaultValue: "" },
    author:    { type: DataTypes.STRING,       defaultValue: "InfixMart Team" },
    published: { type: DataTypes.BOOLEAN,      defaultValue: false },
  },
  { timestamps: true }
);

export default Blog;
