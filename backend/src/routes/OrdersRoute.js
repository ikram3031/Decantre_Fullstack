import { Router } from "express";
import { createOrder, deleteOrder, getOrderById, listOrders, updateOrder } from "../controllers/OrdersController.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const ordersRouter = Router();

ordersRouter.post("/new-order", createOrder);

ordersRouter.use(authenticateToken);
ordersRouter.get("/", authorizeRoles("Owner", "Admin", "Manager"), listOrders);
ordersRouter.get("/:orderId", authorizeRoles("Owner", "Admin", "Manager"), getOrderById);
ordersRouter.put("/:orderId", authorizeRoles("Owner", "Admin", "Manager"), updateOrder);
ordersRouter.delete("/:orderId", authorizeRoles("Owner", "Admin"), deleteOrder);

export default ordersRouter;
