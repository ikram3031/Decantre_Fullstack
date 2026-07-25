import mongoose, { Schema, model } from "mongoose";
import { randomUUID } from "crypto";
import { generateDid } from "../utils/generateDid.js";

const { models } = mongoose;

const orderItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    size: { type: String, trim: true },
    concentration: { type: String, trim: true },
  },
  { _id: false },
);

const customerSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    thana: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true },
    giftWrap: { type: Boolean, default: false },
  },
  { _id: false },
);

const orderTotalsSchema = new Schema(
  {
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    did: { type: String, default: () => generateDid(), unique: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ["received", "processing", "shipped", "completed", "cancelled"],
      default: "received",
    },
    customer: { type: customerSchema, required: true },
    paymentMethod: { type: String, required: true, trim: true },
    shippingAddress: { type: Schema.Types.Mixed, default: {} },
    items: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, "items must contain at least one item"] },
    totals: { type: orderTotalsSchema, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret._id;
        return ret;
      },
    },
  },
);

export const OrderModel = models.Order || model("Order", orderSchema);
