import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  listOrders,
  updateOrder,
  bulkDeleteOrders,
} from "../controllers/OrdersController.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const ordersRouter = Router();

ordersRouter.post("/new-order", createOrder);

ordersRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager"),
  listOrders,
);
ordersRouter.get(
  "/:orderId",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager"),
  getOrderById,
);
ordersRouter.put(
  "/:orderId",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager"),
  updateOrder,
);
ordersRouter.delete(
  "/:orderId",
  authenticateToken,
  authorizeRoles("Owner", "Admin"),
  deleteOrder,
);
ordersRouter.post(
  "/bulk-delete",
  authenticateToken,
  authorizeRoles("Owner", "Admin"),
  bulkDeleteOrders,
);

export default ordersRouter;
