import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const StoreSettings = sequelize.define(
  "StoreSetting",
  {
    key:   { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    value: { type: DataTypes.TEXT,   allowNull: false, defaultValue: "" },
  },
  { timestamps: true, createdAt: false, updatedAt: true }
);

const DEFAULTS = [
  { key: "min_order_value",           value: "999"  },
  { key: "cod_enabled",               value: "true" },
  { key: "gst_percent",               value: "18"   },
  { key: "membership_price_monthly",  value: "99"   },
  { key: "membership_price_yearly",   value: "799"  },
  { key: "cart_timeline_enabled",     value: "true" },
  { key: "cart_timeline_max",         value: "1999" },
  {
    key:   "cart_milestones",
    value: JSON.stringify([
      { amount: 1499, label: "Free Shipping", type: "free_shipping", enabled: true },
    ]),
  },
];

export const seedSettings = async () => {
  for (const row of DEFAULTS) {
    await StoreSettings.findOrCreate({ where: { key: row.key }, defaults: row });
  }
};

export default StoreSettings;
