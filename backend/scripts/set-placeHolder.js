import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { ProductModel } from "../src/models/product.model.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const failureLogPath = path.join(scriptDir, "failed-product-images.json");

const PLACEHOLDER_URL = "/uploads/product_placeholder.webp";

const run = async () => {
  // ── Load failed products list ─────────────────────────────────────────────
  if (!fs.existsSync(failureLogPath)) {
    console.error(`❌ File not found: ${failureLogPath}`);
    process.exit(1);
  }

  const failedProducts = JSON.parse(
    await fs.promises.readFile(failureLogPath, "utf-8"),
  );

  if (!Array.isArray(failedProducts) || failedProducts.length === 0) {
    console.log("✅ No products in failed list. Nothing to do.");
    process.exit(0);
  }

  console.log(`📄 Loaded ${failedProducts.length} products from failed-product-images.json`);

  await connectDatabase();

  let success = 0;
  let notFound = 0;

  for (const item of failedProducts) {
    const { did, name } = item;

    if (!did) {
      console.log(`⚠ Skipping invalid entry: ${JSON.stringify(item)}`);
      continue;
    }

    const result = await ProductModel.updateOne(
      { did },
      {
        $set: {
          imageUrl: PLACEHOLDER_URL,
          thumbnailUrl: PLACEHOLDER_URL,
        },
      },
    );

    if (result.matchedCount === 0) {
      notFound += 1;
      console.log(`✖ Not found in DB — did: ${did} | name: ${name}`);
    } else {
      success += 1;
      console.log(`✔ Placeholder set — did: ${did} | name: ${name}`);
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Total in list : ${failedProducts.length}`);
  console.log(`Updated       : ${success}`);
  console.log(`Not in DB     : ${notFound}`);

  await closeDatabase();
};

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
