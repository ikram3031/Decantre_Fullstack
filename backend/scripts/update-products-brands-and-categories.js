import "dotenv/config";
import mongoose from "mongoose";
import { ProductModel } from "../src/models/product.model.js";
import { BrandModel } from "../src/models/brand.model.js";

const mongodbUri = process.env.MONGODB_URI;
const mongodbDbName = process.env.MONGODB_DB_NAME || "perfume-store";
if (!mongodbUri) throw new Error("MONGODB_URI must be defined in .env");

// ── Obsolete category IDs to REMOVE from product.categories ──
const OBSOLETE_CATEGORY_IDS = new Set([
  "6a64742900d5281346d5387c", // Designer   (now a Brand)
  "6a64742900d5281346d5387e", // Niche      (now a Brand)
  "6a64742900d5281346d53881", // Arabian and UAE Brand (now a Brand)
]);

// ── Manual mapping: old brand ObjectId → brand name in NEW collection ──
// Used when product name doesn't contain the brand name directly
const OLD_ID_TO_BRAND_NAME = {
  "6a647ac600d5281346d53d15": "Giorgio Armani",              // Emporio Armani products
  "6a647ac600d5281346d53d25": "INITIO PARFUMS PRIVÉS",       // Initio products
  "6a647ac700d5281346d53d9b": "Victoria's Secret",           // Victoria's Secret (apostrophe)
  "6a647ac600d5281346d53d3b": "Lancôme",                    // Lancome (accent)
  "6a647ac600d5281346d53d0d": "Office for men (fragrance only)", // Office For Men
  "6a647ac600d5281346d53d5f": "Montblanc",                  // Mont Blanc (spacing)
  "6a647ac600d5281346d53d4d": "Maison Martin Margiela",      // Maison Margiela products
  "6a647ac500d5281346d53cc2": "Ahmad Al Maghribi",           // Ahmed (typo) vs Ahmad
  "6a647ac600d5281346d53ce7": "Bvlgaris",                   // BVLGARI → Bvlgaris
  "6a647ac600d5281346d53cdb": "BDK Parfums",                // BDK Rouge → BDK Parfums
  "6a647ac600d5281346d53d47": "Maison Asrar",               // Maison Asar → Maison Asrar
};


async function main() {
  console.log("\n🔧 Connecting to MongoDB...");
  await mongoose.connect(mongodbUri, { dbName: mongodbDbName });

  try {
    // ── Load all brands ──
    const brands = await BrandModel.find({}).lean();
    console.log(`📦 Brands in DB: ${brands.length}`);

    // did → brand doc
    const brandByDid = new Map(brands.map(b => [b.did, b]));
    // _id string → brand doc
    const brandByObjId = new Map(brands.map(b => [b._id.toString(), b]));
    // sorted by name length DESC for name-matching (longer names match first)
    const sortedSubBrands = brands
      .filter(b => b.parent !== null)
      .sort((a, b) => b.name.length - a.name.length);

    // name (lowercase) → brand doc — for manual mapping lookups
    const brandByName = new Map(brands.map(b => [b.name.toLowerCase(), b]));

    // ── Load all products (raw, no mongoose casting issues) ──
    const products = await ProductModel.find({});
    const total = products.length;
    console.log(`🛒 Total products: ${total}\n`);

    let catsRemoved = 0;
    let brandUpdated = 0;
    let notMatched = 0;

    for (let i = 0; i < total; i++) {
      const product = products[i];
      let changed = false;

      // ══════════════════════════════════════════════════
      // JOB 1: Remove obsolete category IDs
      // ══════════════════════════════════════════════════
      const originalCats = (product.categories || []).map(id => id.toString());
      const cleanCats = originalCats.filter(id => !OBSOLETE_CATEGORY_IDS.has(id));

      if (cleanCats.length !== originalCats.length) {
        product.categories = cleanCats.map(id => new mongoose.Types.ObjectId(id));
        catsRemoved += originalCats.length - cleanCats.length;
        changed = true;
      }

      // ══════════════════════════════════════════════════
      // JOB 2: Build brand array → [sub-brand-did, parent-brand-did]
      // ══════════════════════════════════════════════════
      let subBrand = null;

      // Check if current brand array already has valid dids
      const currentBrandArr = (product.brand || []).map(v => v?.toString?.() || v);

      // Try to find sub-brand from existing brand array (did strings or old ObjectIds)
      for (const val of currentBrandArr) {
        if (brandByDid.has(val)) { subBrand = brandByDid.get(val); break; }
        if (brandByObjId.has(val)) { subBrand = brandByObjId.get(val); break; }
      }

      // Fallback 1: manual OLD_ID → brand name mapping
      if (!subBrand) {
        for (const val of currentBrandArr) {
          const mappedName = OLD_ID_TO_BRAND_NAME[val];
          if (mappedName) {
            subBrand = brandByName.get(mappedName.toLowerCase());
            if (subBrand) break;
          }
        }
      }

      // Fallback 2: match by product name containing brand name
      if (!subBrand) {
        for (const b of sortedSubBrands) {
          if ((product.name || "").toLowerCase().includes(b.name.toLowerCase())) {
            subBrand = b;
            break;
          }
        }
      }

      if (!subBrand) {
        notMatched++;
        process.stdout.write(
          `\r⏳ ${i + 1}/${total} | 🏷 brand: ${brandUpdated} | 🗑 cats: ${catsRemoved} | ❓ unmatched: ${notMatched}`
        );
        if (changed) await product.save();
        continue;
      }

      // Find parent brand
      const parentBrand = subBrand.parent
        ? brandByObjId.get(subBrand.parent.toString())
        : null;

      // Build new brand array: [sub-brand-did, parent-brand-did]
      const newBrandArr = [subBrand.did];
      if (parentBrand) newBrandArr.push(parentBrand.did);

      // Only update if changed
      const oldBrandStr = JSON.stringify(currentBrandArr.sort());
      const newBrandStr = JSON.stringify([...newBrandArr].sort());
      if (oldBrandStr !== newBrandStr) {
        product.brand = newBrandArr;
        brandUpdated++;
        changed = true;
      }

      if (changed) await product.save();

      process.stdout.write(
        `\r⏳ ${i + 1}/${total} | 🏷 brand: ${brandUpdated} | 🗑 cats: ${catsRemoved} | ❓ unmatched: ${notMatched}`
      );
    }

    console.log("\n");
    console.log("═══════════════════════════════════════════════════");
    console.log(`🏷  Brand arrays updated:        ${brandUpdated}`);
    console.log(`🗑  Obsolete cats removed:        ${catsRemoved}`);
    console.log(`❓  Brand not matched (skipped):  ${notMatched}`);
    console.log("═══════════════════════════════════════════════════");

  } catch (err) {
    console.error("\n❌ Migration failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

main();
