/**
 * insert-static-categories.js
 *
 * Inserts predefined category entries that are not present in the WordPress CSVs.
 *   - For Him
 *   - For Her
 *   - Unisex
 *   - Miniature
 *   - Designer
 *   - Niche
 *   - Arabian and UAE Brand
 *
 * Run this once after `import-wp-taxonomies.js` (or anytime you need the entries).
 *
 * Usage:
 *   node scripts/insert-static-categories.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import { CategoryModel } from "../src/models/category.model.js";

const mongodbUri = process.env.MONGODB_URI;
const mongodbDbName = process.env.MONGODB_DB_NAME || "perfume-store";
if (!mongodbUri) throw new Error("MONGODB_URI must be defined in .env");

function toSlug(str) {
  return (str || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const staticCategories = [
  "For Him",
  "For Her",
  "Unisex",
  "Miniature",
];

async function main() {
  console.log("\n🔗 Connecting to MongoDB...");
  await mongoose.connect(mongodbUri, { dbName: mongodbDbName });
  try {
    let inserted = 0, existed = 0;
    for (const name of staticCategories) {
      const slug = toSlug(name);
      const result = await CategoryModel.updateOne(
        { slug },
        {
          $setOnInsert: {
            name,
            slug,
            description: "",
            imageUrl: "",
            productCount: 0,
            parent: null,
          },
        },
        { upsert: true }
      );
      if (result.upsertedCount) inserted++; else existed++;
    }
    console.log(`✅ Static categories – Inserted: ${inserted}, Already existed: ${existed}`);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

main().catch((err) => {
  console.error("❌ Failed to insert static categories:", err);
  process.exit(1);
});
