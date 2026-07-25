import "dotenv/config";
import mongoose from "mongoose";
import { ProductModel } from "../src/models/product.model.js";
import { BrandModel } from "../src/models/brand.model.js";

const mongodbUri = process.env.MONGODB_URI;
const mongodbDbName = process.env.MONGODB_DB_NAME || "perfume-store";
if (!mongodbUri) throw new Error("MONGODB_URI must be defined in .env");

async function main() {
  console.log("\n🔧 Connecting to MongoDB...");
  await mongoose.connect(mongodbUri, { dbName: mongodbDbName });

  try {
    const brands = await BrandModel.find({}).lean();
    const brandByDid    = new Map(brands.map(b => [b.did, b]));
    const brandByObjId  = new Map(brands.map(b => [b._id.toString(), b]));
    const sortedSubBrands = brands
      .filter(b => b.parent !== null)
      .sort((a, b) => b.name.length - a.name.length);

    const products = await ProductModel.find({});

    const unmatched = [];

    for (const product of products) {
      const currentBrandArr = (product.brand || []).map(v => v?.toString?.() || v);
      let subBrand = null;

      for (const val of currentBrandArr) {
        if (brandByDid.has(val))   { subBrand = brandByDid.get(val);   break; }
        if (brandByObjId.has(val)) { subBrand = brandByObjId.get(val); break; }
      }

      if (!subBrand) {
        for (const b of sortedSubBrands) {
          if ((product.name || "").toLowerCase().includes(b.name.toLowerCase())) {
            subBrand = b;
            break;
          }
        }
      }

      if (!subBrand) {
        unmatched.push({
          name: product.name,
          brand: currentBrandArr,
        });
      }
    }

    console.log(`\n❓ Unmatched products: ${unmatched.length}\n`);
    console.log("─".repeat(60));
    unmatched.forEach((p, i) => {
      console.log(`${String(i + 1).padStart(2)}. ${p.name}`);
      console.log(`    brand field: ${JSON.stringify(p.brand)}`);
    });
    console.log("─".repeat(60));

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected.");
  }
}

main();
