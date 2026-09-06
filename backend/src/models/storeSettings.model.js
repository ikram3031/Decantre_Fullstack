import mongoose, { Schema, model } from "mongoose";

const storeSettingsSchema = new Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
      index: true,
      trim: true,
    },
    metaPixel: {
      pixelId: {
        type: String,
        default: "",
        trim: true,
      },
      accessToken: {
        type: String,
        default: "",
        trim: true,
      },
      testEventCode: {
        type: String,
        default: "",
        trim: true,
      },
      isEnabled: {
        type: Boolean,
        default: true,
      },
      enableBrowserPixel: {
        type: Boolean,
        default: true,
      },
      enableCapi: {
        type: Boolean,
        default: true,
      },
      advancedMatching: {
        type: Boolean,
        default: true,
      },
      lastVerifiedAt: {
        type: Date,
        default: null,
      },
      lastTestStatus: {
        type: String,
        enum: ["connected", "failed", "untested"],
        default: "untested",
      },
      lastTestMessage: {
        type: String,
        default: "",
      },
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
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

export const StoreSettingsModel =
  mongoose.models.StoreSettings || model("StoreSettings", storeSettingsSchema);
