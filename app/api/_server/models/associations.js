import Order from "./Order.js";
import OrderItem from "./OrderItem.js";

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "orderItems", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });
