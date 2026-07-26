import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { ProductModel } from "../src/models/product.model.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const failureLogPath = path.join(scriptDir, "failed-product-images.json");
const NEW_PLACEHOLDER_URL = "/uploads/product_placeholder.webp";

const updateFailedPlaceholders = async () => {
  if (!fs.existsSync(failureLogPath)) {
    console.error(`Failure log file not found at: ${failureLogPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(failureLogPath, "utf-8");
  const failedProducts = JSON.parse(rawData);

  console.log(`Loaded ${failedProducts.length} failed products from JSON log.`);

  await connectDatabase();

  let successCount = 0;
  let errorCount = 0;

  for (const item of failedProducts) {
    try {
      const query = item.did ? { did: item.did } : { _id: item._id };
      const updates = {
        imageUrl: NEW_PLACEHOLDER_URL,
        thumbnailUrl: NEW_PLACEHOLDER_URL,
      };

      const result = await ProductModel.updateOne(query, { $set: updates });
      if (result.modifiedCount > 0 || result.matchedCount > 0) {
        successCount += 1;
        console.log(`[updated] product did=${item.did || item._id} -> ${NEW_PLACEHOLDER_URL}`);
      } else {
        console.log(`[not found in DB] product did=${item.did || item._id}`);
      }
    } catch (err) {
      errorCount += 1;
      console.error(`[error] did=${item.did || item._id}:`, err.message);
    }
  }

  console.log("\n=== Failed Placeholder Update Summary ===");
  console.log(`Total products processed from log: ${failedProducts.length}`);
  console.log(`Successfully updated in DB: ${successCount}`);
  console.log(`Errors: ${errorCount}`);

  await closeDatabase();
};

updateFailedPlaceholders().catch((err) => {
  console.error("Script execution failed:", err);
  process.exit(1);
});
