import mongoose from "mongoose";
import dotenv from "dotenv";
import { CouponModel } from "../src/core/models/coupon.model.js";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

async function run() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in env");
    process.exit(1);
  }

  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
    });
    console.log("Connected.");

    const code = "DECANT8";
    const existing = await CouponModel.findOne({ code });

    if (existing) {
      console.log(`Coupon ${code} already exists. Updating details...`);
      existing.discountType = "percentage";
      existing.discountValue = 8;
      existing.minOrderAmount = 3499;
      existing.active = true;
      await existing.save();
      console.log("Updated.");
    } else {
      console.log(`Creating coupon ${code}...`);
      await CouponModel.create({
        code,
        discountType: "percentage",
        discountValue: 8,
        minOrderAmount: 3499,
        active: true,
      });
      console.log("Created.");
    }
  } catch (error) {
    console.error("Error creating/updating coupon:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
