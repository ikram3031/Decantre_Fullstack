import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const paymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    did: { type: String, default: () => generateDid(), unique: true, index: true },
    paymentMethod: { type: String, required: true, trim: true },
    paymentPhone: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

export const PaymentModel = mongoose.models.Payment || model("Payment", paymentSchema);
