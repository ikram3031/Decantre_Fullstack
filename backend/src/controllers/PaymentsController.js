import mongoose from "mongoose";
import { PaymentModel } from "../models/payment.model.js";
import { logger } from "../config/logger.js";

const { Types } = mongoose;

// Create Payment
export const createPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod, paymentPhone, amount, status } = req.body ?? {};

    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: "error", message: "Invalid or missing orderId" });
    }
    if (!paymentMethod || paymentMethod.trim() === "") {
      return res.status(400).json({ status: "error", message: "paymentMethod is required" });
    }
    if (amount === undefined || typeof amount !== "number" || amount < 0) {
      return res.status(400).json({ status: "error", message: "Valid amount is required" });
    }

    const paymentData = {
      orderId,
      paymentMethod: paymentMethod.trim(),
      paymentPhone: paymentPhone?.trim() || "",
      amount,
      status: status || "completed",
    };

    const payment = await PaymentModel.create(paymentData);

    return res.status(201).json({
      status: "success",
      message: "Payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    logger.error({ error }, "Failed to create payment");
    next(error);
  }
};

// List Payments
export const listPayments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const filter = {};

    if (req.query.orderId && Types.ObjectId.isValid(req.query.orderId)) {
      filter.orderId = req.query.orderId;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const total = await PaymentModel.countDocuments(filter);
    const payments = await PaymentModel.find(filter)
      .populate("orderId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({
      status: "success",
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error({ error }, "Failed to list payments");
    next(error);
  }
};

// Get Payment By ID
export const getPaymentById = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    if (!Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ status: "error", message: "Invalid payment ID" });
    }

    const payment = await PaymentModel.findById(paymentId).populate("orderId").lean();
    if (!payment) {
      return res.status(404).json({ status: "error", message: "Payment record not found" });
    }

    return res.json({ status: "success", data: payment });
  } catch (error) {
    next(error);
  }
};

// Update Payment
export const updatePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    if (!Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ status: "error", message: "Invalid payment ID" });
    }

    const payload = req.body ?? {};
    const allowedUpdates = {};

    if (payload.status) {
      allowedUpdates.status = payload.status;
    }
    if (payload.paymentMethod) {
      allowedUpdates.paymentMethod = payload.paymentMethod.trim();
    }
    if (payload.paymentPhone !== undefined) {
      allowedUpdates.paymentPhone = payload.paymentPhone.trim();
    }
    if (payload.amount !== undefined && typeof payload.amount === "number") {
      allowedUpdates.amount = payload.amount;
    }

    const payment = await PaymentModel.findByIdAndUpdate(paymentId, allowedUpdates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!payment) {
      return res.status(404).json({ status: "error", message: "Payment record not found" });
    }

    return res.json({ status: "success", data: payment });
  } catch (error) {
    next(error);
  }
};

// Delete Payment
export const deletePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    if (!Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ status: "error", message: "Invalid payment ID" });
    }

    const deletedPayment = await PaymentModel.findByIdAndDelete(paymentId).lean();
    if (!deletedPayment) {
      return res.status(404).json({ status: "error", message: "Payment record not found" });
    }

    return res.json({ status: "success", message: "Payment record deleted successfully" });
  } catch (error) {
    next(error);
  }
};
