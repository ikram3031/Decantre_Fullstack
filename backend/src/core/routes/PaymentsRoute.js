import { Router } from "express";
import {
  createPayment,
  deletePayment,
  getPaymentById,
  listPayments,
  updatePayment,
} from "../controllers/PaymentsController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const paymentsRouter = Router();

// CRUD endpoints for payments, authenticated by JWT
paymentsRouter.use(authenticateToken);

paymentsRouter.post("/", createPayment);
paymentsRouter.get("/", listPayments);
paymentsRouter.get("/:paymentId", getPaymentById);
paymentsRouter.put("/:paymentId", updatePayment);
paymentsRouter.delete("/:paymentId", deletePayment);

export default paymentsRouter;
