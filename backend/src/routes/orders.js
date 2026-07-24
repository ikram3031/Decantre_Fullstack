import { Router } from "express";
import { createOrder, deleteOrder, getOrderById, listOrders, updateOrder } from "../controllers/orders.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const ordersRouter = Router();

ordersRouter.post("/new-order", createOrder);

ordersRouter.use(authenticateToken);
ordersRouter.get("/", listOrders);
ordersRouter.get("/:orderId", getOrderById);
ordersRouter.put("/:orderId", updateOrder);
ordersRouter.delete("/:orderId", deleteOrder);

export default ordersRouter;
