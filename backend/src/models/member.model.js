import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const { models } = mongoose;

const billingInfoSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: "" },
    address1: { type: String, required: true, trim: true },
    address2: { type: String, trim: true, default: "" },
    district: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postcode: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const shippingInfoSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: "" },
    address1: { type: String, required: true, trim: true },
    address2: { type: String, trim: true, default: "" },
    district: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postcode: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const memberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    phone: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true, trim: true, select: false },
    did: { type: String, default: () => generateDid(), unique: true, index: true },
    isActive: { type: Boolean, default: true },
    role: { type: String, trim: true, default: "Customer" },
    emailOtp: { type: String, trim: true, select: false },
    emailOtpExpiresAt: { type: Date, select: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, select: false },
    refreshToken: { type: String, trim: true, select: false },
    refreshTokenExpiresAt: { type: Date, select: false },
    billingInfo: { type: billingInfoSchema, default: () => ({}) },
    shippingInfo: { type: shippingInfoSchema, default: () => ({}) },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
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
        delete ret.passwordHash;
        delete ret.emailOtp;
        delete ret.emailOtpExpiresAt;
        delete ret.refreshToken;
        delete ret.refreshTokenExpiresAt;
        delete ret.emailVerifiedAt;
        return ret;
      },
    },
  },
);

export const MemberModel = models.Member || model("Member", memberSchema);
