import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import xlsx from "xlsx";
import { ProductModel } from "../src/models/product.model.js";

const mongodbUri = process.env.MONGODB_URI;
const mongodbDbName = process.env.MONGODB_DB_NAME || "perfume-store";

if (!mongodbUri) {
  throw new Error("MONGODB_URI must be defined");
}

const connectionString = mongodbUri;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultWorkbookPath = path.resolve(dirname, "../data/products_for_postgres.xlsx");
const workbookPath = path.resolve(process.argv[2] ?? defaultWorkbookPath);

function toText(value) {
  return String(value ?? "").trim();
}

function toSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toTextArray(value, separator) {
  return toText(value)
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toPriceArray(value) {
  return toText(value)
    .split("|")
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item) => Number.isFinite(item));
}

function toVariants(row) {
  const sizes = toTextArray(row.sizes, "|");
  const prices = toPriceArray(row.prices);

  return sizes.map((size, index) => ({
    size,
    price: prices[index] ?? 0,
    sortOrder: index,
  }));
}

function toCategories(row) {
  return toTextArray(row.categories, ",").map((name) => ({
    name,
    slug: toSlug(name),
  }));
}

function toBrand(row) {
  const name = toText(row.brand);
  return name ? { name, slug: toSlug(name) } : undefined;
}

function toThumbnail(row) {
  const externalId = toText(row.thumbnail_id);
  const url = toText(row.thumbnail_url);
  const storageKey = toText(row.storage_key);

  if (!externalId && !url && !storageKey) {
    return undefined;
  }

  return {
    externalId,
    url,
    storageKey,
    altText: toText(row.name),
  };
}

async function main() {
  const workbook = xlsx.readFile(workbookPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) {
    throw new Error(`No worksheet found in ${workbookPath}`);
  }

  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
  const validRows = rows.filter((row) => toText(row.slug) && toText(row.name));

  await mongoose.connect(connectionString, {
    dbName: mongodbDbName,
  });

  try {
    let variants = 0;
    let categoryLinks = 0;
    let images = 0;

    for (const row of validRows) {
      const document = {
        slug: toText(row.slug),
        name: toText(row.name),
        description: toText(row.description),
        brand: toBrand(row),
        thumbnail: toThumbnail(row),
        categories: toCategories(row),
        variants: toVariants(row),
        stockStatus: toText(row.stock_status) || "instock",
      };

      await ProductModel.updateOne({ slug: document.slug }, { $set: document }, { upsert: true });

      categoryLinks += document.categories.length;
      variants += document.variants.length;
      if (document.thumbnail) images += 1;
    }

    console.log(
      `Imported ${validRows.length} products, ${categoryLinks} category links, ${variants} variants, ${images} image references from ${workbookPath}`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
