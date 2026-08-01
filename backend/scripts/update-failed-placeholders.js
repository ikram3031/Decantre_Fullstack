import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { ProductModel } from "../src/models/product.model.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_JSON_PATH = path.join(scriptDir, "failed-product-images.json");
const PLACEHOLDER_URL = "/uploads/product_placeholder.webp";

const buildPlaceholderProductJson = async () => {
  await connectDatabase();

  const query = { imageUrl: PLACEHOLDER_URL };
  const cursor = ProductModel.find(query).lean().cursor();

  const products = [];
  let totalCount = 0;

  for await (const product of cursor) {
    totalCount += 1;
    products.push({
      _id: product._id?.toString(),
      did: product.did,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      thumbnailUrl: product.thumbnailUrl,
    });
  }

  await fs.promises.writeFile(OUTPUT_JSON_PATH, JSON.stringify(products, null, 2), "utf-8");

  console.log("\n=== Placeholder Product JSON Export ===");
  console.log(`Products matched by placeholder imageUrl: ${totalCount}`);
  console.log(`JSON written to: ${OUTPUT_JSON_PATH}`);

  await closeDatabase();
};

buildPlaceholderProductJson().catch((err) => {
  console.error("Script execution failed:", err);
  process.exit(1);
});
