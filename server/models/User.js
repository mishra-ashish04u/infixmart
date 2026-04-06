import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.id; } },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    avatar: { type: DataTypes.STRING, defaultValue: "" },
    mobile: { type: DataTypes.STRING, defaultValue: null },
    country: { type: DataTypes.STRING, defaultValue: "" },
    accessToken: { type: DataTypes.TEXT, defaultValue: "" },
    refreshToken: { type: DataTypes.TEXT, defaultValue: "" },
    verify_email: { type: DataTypes.BOOLEAN, defaultValue: false },
    last_login_date: { type: DataTypes.DATE, defaultValue: null },
    status: {
      type: DataTypes.ENUM("active", "inactive", "Suspended"),
      defaultValue: "active",
    },
    otp: { type: DataTypes.STRING, defaultValue: null },
    otp_expires: { type: DataTypes.DATE, defaultValue: null },
    google_id: { type: DataTypes.STRING, defaultValue: null },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
  },
  { timestamps: true }
);

export default User;
