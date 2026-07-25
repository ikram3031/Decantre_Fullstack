import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { ProductModel } from "../src/models/product.model.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const uploadsDir = path.resolve(projectRoot, "uploads");
const failureLogPath = path.join(scriptDir, "failed-product-images.json");

/**
 * DB path / filename theke actual file Path find koro
 */
const findLocalSourceFile = (dbPath) => {
  if (!dbPath || typeof dbPath !== "string") return null;

  const rawFilename = path.basename(dbPath.replace(/\\/g, "/").trim());
  const rawBaseName = path.basename(rawFilename, path.extname(rawFilename));
  // Strip timestamp if present (e.g. -1784973479540)
  const cleanBaseName = rawBaseName.replace(/-\d{10,}$/, "");

  const candidates = [
    path.join(uploadsDir, rawFilename),
    path.join(uploadsDir, `${rawBaseName}.webp`),
    path.join(uploadsDir, `${rawBaseName}.jpg`),
    path.join(uploadsDir, `${rawBaseName}.png`),
    path.join(uploadsDir, `${rawBaseName}.jpeg`),
    path.join(uploadsDir, `${cleanBaseName}.webp`),
    path.join(uploadsDir, `${cleanBaseName}.jpg`),
    path.join(uploadsDir, `${cleanBaseName}.png`),
    path.join(uploadsDir, `${cleanBaseName}.jpeg`),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  // Scan uploads dir for case-insensitive match
  try {
    const allFiles = fs.readdirSync(uploadsDir);
    const lowerClean = cleanBaseName.toLowerCase();
    const matched = allFiles.find((f) => {
      const fLower = f.toLowerCase();
      return (
        fLower === lowerClean ||
        fLower.startsWith(lowerClean + ".") ||
        fLower.startsWith(lowerClean + "-")
      );
    });

    if (matched) return path.join(uploadsDir, matched);
  } catch {
    // ignore
  }

  return null;
};

const localPathToPublicUrl = (fullPath) => {
  const relative = path.relative(projectRoot, fullPath).replace(/\\/g, "/");
  if (relative.startsWith("uploads/")) {
    return `/${relative}`;
  }
  return `/uploads/${relative}`;
};

const convertImageToWebp = async (sourcePath, options) => {
  const dir = path.dirname(sourcePath);
  const name = path.basename(sourcePath, path.extname(sourcePath));
  const outputPath = path.join(dir, `${name}.webp`);

  // If already webp and exists, return
  if (path.extname(sourcePath).toLowerCase() === ".webp" && fs.existsSync(outputPath)) {
    return outputPath;
  }

  const tempPath = `${outputPath}.tmp`;

  await sharp(sourcePath)
    .rotate()
    .resize(options)
    .webp({ quality: 82 })
    .toFile(tempPath);

  await fs.promises.rename(tempPath, outputPath);

  // If source was not webp, delete original file to save space
  if (sourcePath !== outputPath && fs.existsSync(sourcePath)) {
    try {
      await fs.promises.unlink(sourcePath);
    } catch {
      // ignore
    }
  }

  return outputPath;
};

const processProductImages = async (product) => {
  const errors = [];
  const updates = {};

  for (const field of ["imageUrl", "thumbnailUrl"]) {
    const currentValue = product[field];
    if (!currentValue || typeof currentValue !== "string") continue;

    const localSource = findLocalSourceFile(currentValue);
    if (!localSource) {
      errors.push(`${field} file not found for: ${currentValue}`);
      continue;
    }

    try {
      const resizeOptions =
        field === "thumbnailUrl"
          ? { width: 300, height: 300, fit: "inside", withoutEnlargement: true }
          : { width: 800, height: 800, fit: "inside", withoutEnlargement: true };

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
      { imageUrl: { $exists: true, $ne: null, $ne: "" } },
      { thumbnailUrl: { $exists: true, $ne: null, $ne: "" } },
    ],
  })
    .skip(0)
    .limit(5)
    .cursor();

  for await (const product of cursor) {
    productCount += 1;
    const { updates, errors } = await processProductImages(product);

    const imagesProcessed = Object.keys(updates).length;
    totalImagesProcessed += imagesProcessed;
    totalImagesFailed += errors.length;

    if (imagesProcessed > 0) {
      await ProductModel.updateOne({ _id: product._id }, { $set: updates });
    }

    const pDid = product.did || product._id;

    if (errors.length === 0) {
      productSuccessCount += 1;
      console.log(`did: ${pDid}`);
    } else {
      productFailureCount += 1;
      failedProducts.push({ did: pDid, _id: product._id?.toString?.() || null, errors });
      console.log(`✖ product did=${pDid} failed: ${errors.join("; ")}`);
    }
  }

  await fs.promises.writeFile(failureLogPath, JSON.stringify(failedProducts, null, 2), "utf-8");

  console.log("\n=== Migration summary ===");
  console.log(`Products scanned: ${productCount}`);
  console.log(`Products succeeded: ${productSuccessCount}`);
  console.log(`Products failed: ${productFailureCount}`);
  console.log(`Images converted/updated: ${totalImagesProcessed}`);
  console.log(`Image conversion errors: ${totalImagesFailed}`);
  console.log(`Failed product list saved to: ${failureLogPath}`);

  await closeDatabase();
};

migrateProductImagePaths().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
