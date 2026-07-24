import mongoose, { Schema, model } from "mongoose";

const { models } = mongoose;

export const USER_ROLES = ["Super_Admin", "Admin", "Store_manager"];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: { type: String, required: true, trim: true, select: false },
    refreshToken: { type: String, select: false },
    refreshTokenExpiresAt: { type: Date, select: false },
    role: { type: String, required: true, enum: USER_ROLES, default: "Store_manager" },
    isActive: { type: Boolean, default: true },
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
        return ret;
      },
    },
  },
);

export const UserModel = models.User || model("User", userSchema);
