import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { ProductModel } from "../src/models/product.model.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const uploadsDir = path.resolve(projectRoot, "uploads");
const srcUploadsDir = path.resolve(projectRoot, "src", "uploads");
const outputDir = path.join(srcUploadsDir, "26072600");

const PLACEHOLDER_PUBLIC_URL = "/uploads/260726/product_placeholder.webp";
const failureLogPath = path.join(scriptDir, "failed-product-images.json");

const resolveStoredPath = (dbPath) => {
  if (!dbPath || typeof dbPath !== "string") return null;

  const normalizedPath = dbPath.replace(/\\/g, "/").trim();
  const relativePath = normalizedPath.replace(/^\/+/, "");
  const candidates = new Set();

  const add = (value) => {
    if (!value) return;
    candidates.add(path.resolve(value));
  };

  if (path.isAbsolute(normalizedPath)) {
    add(normalizedPath);
    add(path.join(uploadsDir, path.relative(projectRoot, normalizedPath)));
  }

  if (relativePath.startsWith("uploads/")) {
    add(path.join(projectRoot, relativePath));
    add(path.join(uploadsDir, relativePath.replace(/^uploads\//, "")));
  } else if (relativePath.startsWith("src/uploads/")) {
    add(path.join(uploadsDir, relativePath.replace(/^src\/uploads\//, "")));
  }

  add(path.join(uploadsDir, relativePath));
  add(path.join(projectRoot, relativePath));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }

  return null;
};

const getSearchKeywords = (product, dbPath) => {
  const rawFilename = dbPath ? path.basename(dbPath.replace(/\\/g, "/").trim()) : "";
  const rawBaseName =
    rawFilename && rawFilename !== "product_placeholder.webp"
      ? path.basename(rawFilename, path.extname(rawFilename))
      : "";

  const withoutTimestamp = rawBaseName.replace(/-\d{10,}(-[a-z0-9]+)?$/i, "");
  const withoutRandomSuffix = withoutTimestamp.replace(/-([a-z0-9]{4,8})$/i, "");
  const withoutDimension = withoutRandomSuffix.replace(/-\d{1,4}x\d{1,4}/g, "");
  const withoutFieldLabel = withoutDimension
    .replace(/-(imageurl|thumbnailurl|image|thumbnail|thumb)$/i, "")
    .replace(/-(imageurl|thumbnailurl|image|thumbnail|thumb)-/g, "-");
  const trimmedBase = withoutFieldLabel.replace(/-+/g, "-").replace(/^-+|-+$/g, "");

  const productName = product?.name || product?.title || product?.slug || "";
  const productNameVariants = [
    productName,
    productName.replace(/\s+/g, "-"),
    productName.replace(/\s+/g, ""),
    productName.replace(/[^a-zA-Z0-9]+/g, "-"),
  ].filter(Boolean);

  const normalizedVariants = [
    rawBaseName,
    rawFilename,
    withoutTimestamp,
    withoutRandomSuffix,
    withoutDimension,
    withoutFieldLabel,
    trimmedBase,
    trimmedBase.replace(/-/g, ""),
    trimmedBase.replace(/[^a-zA-Z0-9]+/g, "-"),
    ...productNameVariants,
    ...productNameVariants.map((value) => value.replace(/[^a-zA-Z0-9]+/g, "")),
    ...productNameVariants.map((value) => value.replace(/[^a-zA-Z0-9]+/g, "-")),
  ].filter(Boolean);

  return [...new Set(normalizedVariants)];
};

const findSourceByDbPathOrName = (product, dbPath) => {
  if (dbPath && typeof dbPath === "string" && !dbPath.includes("product_placeholder.webp")) {
    const directMatch = resolveStoredPath(dbPath);
    if (directMatch) return directMatch;
  }

  const searchKeys = getSearchKeywords(product, dbPath);
  const matchedFiles = [];

  const walkDir = (dirPath) => {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          walkDir(fullPath);
          continue;
        }

        if (!entry.isFile()) continue;

        const fileName = entry.name.toLowerCase();
        if (fileName === "product_placeholder.webp") continue;

        const matchedKey = searchKeys.find((key) => {
          const lowerKey = key.toLowerCase();
          if (!lowerKey || lowerKey === "product_placeholder" || lowerKey === "product_placeholder.webp") return false;

          const normalizedFileName = fileName.replace(/[^a-z0-9]+/g, "");
          const normalizedKey = lowerKey.replace(/[^a-z0-9]+/g, "");

          return (
            fileName === lowerKey ||
            fileName.startsWith(lowerKey + ".") ||
            fileName.startsWith(lowerKey + "-") ||
            fileName.includes(lowerKey) ||
            normalizedFileName === normalizedKey ||
            (normalizedKey.length >= 4 && (normalizedFileName.includes(normalizedKey) || normalizedKey.includes(normalizedFileName)))
          );
        });

        if (matchedKey) {
          matchedFiles.push(fullPath);
        }
      }
    } catch {
      // ignore
    }
  };

  walkDir(uploadsDir);

  if (matchedFiles.length === 0) return null;

  matchedFiles.sort((a, b) => {
    try {
      return fs.statSync(b).size - fs.statSync(a).size;
    } catch {
      return 0;
    }
  });

  return matchedFiles[0];
};

const convertImageToWebp = async (sourcePath, options, outputPath) => {
  if (fs.existsSync(outputPath)) {
    return outputPath;
  }

  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  const tempPath = `${outputPath}.tmp`;

  let quality = 100;
  try {
    const stats = await fs.promises.stat(sourcePath);
    if (stats.size > 100 * 1024) {
      quality = 90;
    }
  } catch {
    // fallback
  }

  await sharp(sourcePath)
    .rotate()
    .resize(options)
    .webp({ quality })
    .toFile(tempPath);

  await fs.promises.rename(tempPath, outputPath);
  return outputPath;
};

const processUnmatchedProducts = async () => {
  await connectDatabase();
  await fs.promises.mkdir(outputDir, { recursive: true });

  const failedProductsList = [];
  let totalScanned = 0;
  let totalRecovered = 0;
  let totalFailed = 0;

  const cursor = ProductModel.find({
    $or: [
      { imageUrl: { $regex: /product_placeholder\.webp/i } },
      { thumbnailUrl: { $regex: /product_placeholder\.webp/i } },
      { imageUrl: { $exists: true, $ne: null, $ne: "" } },
      { thumbnailUrl: { $exists: true, $ne: null, $ne: "" } },
    ],
  }).cursor();

  for await (const product of cursor) {
    totalScanned += 1;
    const updates = {};
    let hasRecoveredAny = false;
    let stillHasPlaceholder = false;

    for (const field of ["imageUrl", "thumbnailUrl"]) {
      const dbValue = product[field];

      const sourceFile = findSourceByDbPathOrName(product, dbValue);

      if (sourceFile) {
        try {
          const resizeOptions =
            field === "thumbnailUrl"
              ? { width: 600, height: 600, fit: "inside", withoutEnlargement: true }
              : { width: 1000, height: 1000, fit: "inside", withoutEnlargement: true };

          const slugify = (text) => {
            if (!text) return "product";
            return text
              .toString()
              .toLowerCase()
              .trim()
              .replace(/[\s\W-]+/g, "-")
              .replace(/^-+|-+$/g, "");
          };

          const productName = product?.name || product?.title || "product";
          const productSlug = slugify(productName);
          const did = product?.did || product?._id?.toString() || "id";
          const prefix = field === "thumbnailUrl" ? "thumb_" : "product_";

          const fileName = `${prefix}${productSlug}_${did}.webp`;

          const destPath = path.join(outputDir, fileName);
          const webpPath = await convertImageToWebp(sourceFile, resizeOptions, destPath);

          const relativePublicUrl = `/uploads/26072600/${fileName}`;
          updates[field] = relativePublicUrl;
          hasRecoveredAny = true;
          console.log(`[recovered] product did=${product.did || product._id} field=${field} -> ${relativePublicUrl}`);
        } catch (err) {
          console.error(`Error converting ${field} for did=${product.did}:`, err.message);
          stillHasPlaceholder = true;
        }
      } else {
        if (!dbValue || dbValue.includes("product_placeholder.webp")) {
          stillHasPlaceholder = true;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      const slugName = slugify(product?.name || product?.title || product?.slug || "product");
      updates.slugName = slugName;
      await ProductModel.updateOne({ _id: product._id }, { $set: updates });
    }

    if (hasRecoveredAny && !stillHasPlaceholder) {
      totalRecovered += 1;
    }

    const currentImg = updates.imageUrl || product.imageUrl;
    const currentThumb = updates.thumbnailUrl || product.thumbnailUrl;

    if (
      stillHasPlaceholder ||
      !currentImg ||
      !currentThumb ||
      currentImg === PLACEHOLDER_PUBLIC_URL ||
      currentThumb === PLACEHOLDER_PUBLIC_URL
    ) {
      totalFailed += 1;
      failedProductsList.push({
        did: product.did || product._id,
        name: product.name || product.title || null,
        _id: product._id?.toString() || null,
        imageUrl: currentImg || null,
        thumbnailUrl: currentThumb || null,
      });
    }
  }

  await fs.promises.writeFile(failureLogPath, JSON.stringify(failedProductsList, null, 2), "utf-8");

  console.log("\n=== Unmatched Migration Summary ===");
  console.log(`Products scanned: ${totalScanned}`);
  console.log(`Products successfully updated/recovered: ${totalRecovered}`);
  console.log(`Products remaining with placeholder (saved to log): ${totalFailed}`);
  console.log(`Failed product log file: ${failureLogPath}`);

  await closeDatabase();
};

processUnmatchedProducts().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
