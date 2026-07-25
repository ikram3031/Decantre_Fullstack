import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { ProductModel } from "../src/models/product.model.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const failureLogPath = path.join(scriptDir, "failed-product-images.json");

const normalizeUrlToLocalPath = (value) => {
  if (typeof value !== "string" || !value.trim()) return null;

  const normalized = value.replace(/\\/g, "/").trim();
  let relativePath = null;
  const uploadsRoot = path.resolve(scriptDir, "..", "uploads");

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      const url = new URL(normalized);
      return normalizeUrlToLocalPath(url.pathname);
    } catch {
      return null;
    }
  }

  if (normalized.startsWith("/content/")) {
    relativePath = normalized.replace("/content/", "uploads/");
  } else if (normalized.startsWith("/uploads/")) {
    relativePath = normalized.slice(1);
  } else if (normalized.startsWith("uploads/")) {
    relativePath = normalized;
  } else {
    const contentIndex = normalized.indexOf("/content/");
    const uploadsIndex = normalized.indexOf("/uploads/");

    if (contentIndex !== -1) {
      relativePath = normalized.slice(contentIndex + 1).replace("content/", "uploads/");
    } else if (uploadsIndex !== -1) {
      relativePath = normalized.slice(uploadsIndex + 1);
    }
  }

  if (!relativePath) return null;
  const trimmedRelativePath = relativePath.replace(/^uploads[\\/]+/, "");
  const candidate = path.resolve(uploadsRoot, trimmedRelativePath);
  if (fs.existsSync(candidate)) {
    return candidate;
  }

  // If files live in the flat uploads root, try the basename as a fallback.
  const fallbackName = path.basename(candidate);
  const fallbackRoot = path.resolve(uploadsRoot, fallbackName);
  if (fs.existsSync(fallbackRoot)) {
    return fallbackRoot;
  }

  return candidate;
};

const localPathToPublicUrl = (fullPath) => {
  const relative = path.relative(process.cwd(), fullPath).replace(/\\/g, "/");
  if (relative.startsWith("uploads/")) {
    return `/${relative}`;
  }
  return `/uploads/${relative}`;
};

const convertImageToWebp = async (sourcePath, options) => {
  const dir = path.dirname(sourcePath);
  const name = path.basename(sourcePath, path.extname(sourcePath));
  const outputPath = path.join(dir, `${name}.webp`);
  const tempPath = `${outputPath}.tmp`;

  await sharp(sourcePath)
    .rotate()
    .resize(options)
    .webp({ quality: 80 })
    .toFile(tempPath);

  await fs.promises.rename(tempPath, outputPath);
  return outputPath;
};

const processProductImages = async (product) => {
  const errors = [];
  const updates = {};

  for (const field of ["imageUrl", "thumbnailUrl"]) {
    const currentValue = product[field];
    if (!currentValue || typeof currentValue !== "string") continue;

    const localSource = normalizeUrlToLocalPath(currentValue);
    if (!localSource) {
      errors.push(`${field} path invalid: ${currentValue}`);
      continue;
    }

    try {
      await fs.promises.access(localSource, fs.constants.R_OK);
    } catch {
      errors.push(`${field} file not found: ${localSource}`);
      continue;
    }

    try {
      const resizeOptions = field === "thumbnailUrl"
        ? { width: 150, height: 150, fit: "inside", withoutEnlargement: true }
        : { width: 1000, height: 1000, fit: "inside", withoutEnlargement: true };

      const webpPath = await convertImageToWebp(localSource, resizeOptions);
      updates[field] = localPathToPublicUrl(webpPath);
    } catch (err) {
      errors.push(`${field} conversion failed: ${err.message}`);
    }
  }

  return { updates, errors };
};

const migrateProductImagePaths = async () => {
  await connectDatabase();
  const failedProducts = [];
  let productCount = 0;
  let productSuccessCount = 0;
  let productFailureCount = 0;
  let totalImagesProcessed = 0;
  let totalImagesFailed = 0;

  const cursor = ProductModel.find({
    $or: [
      { imageUrl: { $exists: true, $ne: "" } },
      { thumbnailUrl: { $exists: true, $ne: "" } },
    ],
  }).cursor();

  for await (const product of cursor) {
    productCount += 1;
    const { updates, errors } = await processProductImages(product);

    const imagesProcessed = Object.keys(updates).length;
    totalImagesProcessed += imagesProcessed;
    totalImagesFailed += errors.length;

    if (imagesProcessed > 0) {
      await ProductModel.updateOne({ _id: product._id }, { $set: updates });
    }

    if (errors.length === 0) {
      productSuccessCount += 1;
      console.log(`✔ product did=${product.did || product._id} processed (${imagesProcessed} image(s))`);
    } else {
      productFailureCount += 1;
      failedProducts.push({ did: product.did || null, _id: product._id?.toString?.() || null, errors });
      console.log(`✖ product did=${product.did || product._id} failed: ${errors.join("; ")}`);
    }
  }

  await fs.promises.writeFile(failureLogPath, JSON.stringify(failedProducts, null, 2), "utf-8");

  console.log("\n=== Migration summary ===");
  console.log(`Products scanned: ${productCount}`);
  console.log(`Products succeeded: ${productSuccessCount}`);
  console.log(`Products failed: ${productFailureCount}`);
  console.log(`Images converted: ${totalImagesProcessed}`);
  console.log(`Image conversion errors: ${totalImagesFailed}`);
  console.log(`Failed product list saved to: ${failureLogPath}`);

  await closeDatabase();
};

migrateProductImagePaths().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
