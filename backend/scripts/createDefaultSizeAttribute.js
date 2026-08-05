import mongoose from "mongoose";
import dotenv from "dotenv";
import { AttributeModel } from "../src/dashboard/models/attribute.model.js";

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

    const slug = "size";
    const existing = await AttributeModel.findOne({ slug });

    const sizeValues = [
      { name: "2ml", slug: "2ml" },
      { name: "3ml", slug: "3ml" },
      { name: "5ml", slug: "5ml" },
      { name: "8ml", slug: "8ml" },
      { name: "10ml", slug: "10ml" },
      { name: "15ml", slug: "15ml" },
      { name: "30ml", slug: "30ml" },
    ];

    if (existing) {
      console.log(`Attribute group "${slug}" already exists. Merging values...`);
      // Update values to make sure all specified sizes are present
      for (const val of sizeValues) {
        if (!existing.values.some(v => v.slug === val.slug)) {
          existing.values.push(val);
        }
      }
      await existing.save();
      console.log("Updated.");
    } else {
      console.log(`Creating attribute group "${slug}"...`);
      await AttributeModel.create({
        name: "Size",
        slug,
        values: sizeValues,
        createdBy: "66af9b0d9c49d21c988a6d66", // Dummy/default admin user ID
      });
      console.log("Created.");
    }
  } catch (error) {
    console.error("Error creating/updating default size attribute:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
