import { Router } from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import { createOrder, getAllOrders, getOrderById, getUserOrders, updateOrderStatus } from "../controllers/orderController.js";

const orderRouter = Router();

orderRouter.post("/", auth, createOrder);
orderRouter.get("/myorders", auth, getUserOrders);
orderRouter.get("/all", auth, adminOnly, getAllOrders);
orderRouter.get("/:id", auth, getOrderById);
orderRouter.put("/:id/status", auth, adminOnly, updateOrderStatus);

export default orderRouter;
