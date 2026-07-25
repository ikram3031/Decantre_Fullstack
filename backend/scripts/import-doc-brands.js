// scripts/import-doc-brands.js
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import mongoose from "mongoose";
import { BrandModel } from "../src/models/brand.model.js";
import { generateDid } from "../src/utils/generateDid.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.resolve(__dirname, "../docs/Brands.json");

const mongodbUri = process.env.MONGODB_URI;
const mongodbDbName = process.env.MONGODB_DB_NAME || "perfume-store";
if (!mongodbUri) throw new Error("MONGODB_URI must be defined in .env");

async function main() {
  console.log("\n📦 Loading Brands.json...");
  const raw = fs.readFileSync(jsonPath, "utf8");
  const brands = JSON.parse(raw);
  console.log(`🏷️  Found ${brands.length} brands`);

  console.log("\n🔗 Connecting to MongoDB...");
  await mongoose.connect(mongodbUri, { dbName: mongodbDbName });
  try {
    let imported = 0, skipped = 0;
    // Prepare documents for bulk insert
    const docs = brands.map(b => {
      const name = (b.Name || "").trim();
      const slug = (b.Slug || "").trim().toLowerCase();
      if (!name || !slug) return null; // will be filtered out
      // Uncomment to filter only Xstore‑related brands
      // if (!name.toLowerCase().includes("xstore")) return null;
      return {
        name,
        slug,
        did: generateDid(),
        description: "",
        imageUrl: "",
        productCount: 0,
      };
    }).filter(Boolean);
    // Log collection name and a sample document
    console.log(`💾 Collection: ${BrandModel.collection.name}`);
    const total = await BrandModel.countDocuments();
    console.log(`📊 Total brands in collection: ${total}`);
    const sample = await BrandModel.findOne().lean();
    console.log('🔎 Sample brand:', sample);
    // insertMany ignores duplicates (ordered:false) and continues
    const result = await BrandModel.insertMany(docs, { ordered: false }).catch(err => {
      // Duplicate key errors (E11000) are expected; count inserted vs skipped
      if (err.writeErrors) {
        const insertedCount = err.result?.nInserted || 0;
        const dupCount = err.writeErrors.length;
        imported = insertedCount;
        skipped = dupCount;
        console.warn(`⚠️ Duplicate entries skipped: ${dupCount}`);
        return null;
      }
      throw err;
    });
    if (result) {
      imported = result.length;
      skipped = 0;
    }
    console.log(`✅ Brands → Imported: ${imported} | Skipped: ${skipped}`);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 MongoDB disconnected.");
  }
}

main().catch(err => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
