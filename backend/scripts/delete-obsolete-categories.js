import "dotenv/config";
import mongoose from "mongoose";
import { CategoryModel } from "../src/models/category.model.js";
import { ProductModel } from "../src/models/product.model.js";

const mongodbUri = process.env.MONGODB_URI;
const mongodbDbName = process.env.MONGODB_DB_NAME || "perfume-store";
if (!mongodbUri) throw new Error("MONGODB_URI must be defined in .env");

const obsoleteCategoryIds = [
  new mongoose.Types.ObjectId("6a64742900d5281346d5387c"), // Designer
  new mongoose.Types.ObjectId("6a64742900d5281346d5387e"), // Niche
  new mongoose.Types.ObjectId("6a64742900d5281346d53881"), // Arabian and UAE Brand
];

async function main() {
  console.log("\n🔧 Connecting to MongoDB...");
  await mongoose.connect(mongodbUri, { dbName: mongodbDbName });

  try {
    const categories = await CategoryModel.find({ _id: { $in: obsoleteCategoryIds } }).lean();
    if (categories.length === 0) {
      console.log("✅ No obsolete categories found. Nothing to delete.");
      return;
    }

    console.log(`✅ Found ${categories.length} obsolete category documents:`);
    categories.forEach((category) => {
      console.log(`  - ${category.name} (${category._id.toString()})`);
    });

    const productUpdate = await ProductModel.updateMany(
      { categories: { $in: obsoleteCategoryIds } },
      { $pull: { categories: { $in: obsoleteCategoryIds } } }
    );

    console.log(`✅ Removed obsolete category references from ${productUpdate.modifiedCount} products.`);

    const deleteResult = await CategoryModel.deleteMany({ _id: { $in: obsoleteCategoryIds } });
    console.log(`✅ Deleted ${deleteResult.deletedCount} obsolete categories.`);
  } catch (err) {
    console.error("❌ Failed to delete obsolete categories:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

main();
