import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { ProductModel } from "../src/models/product.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const imgDir = path.join(projectRoot, "img");
const outputUploadsDir = path.join(projectRoot, "src", "uploads");
const failureLogPath = path.join(__dirname, "failed.json");
const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"];

const getBatchFolderName = () => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;
  return `${dateStr}01`;
};

const slugify = (text) => {
  if (!text) return "product";
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Simplifies a product name according to the requirements:
 * 1. Remove text in brackets like (JPG), (2022 batch), [whatever], etc.
 * 2. Normalize special alphabet/unicode/diacritics to standard English equivalents (e.g. Ø/Ö -> O, A-like to A, etc.)
 * 3. Replace special characters/semicolons and non-alphanumeric characters with spaces.
 * 4. Clean up multiple spaces.
 */
const simplifyName = (name) => {
  if (!name) return "";

  // 1. Remove parenthesized/bracketed content
  let clean = name.replace(/\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "");

  // 2. Normalize diacritics/accents to standard English alphabets
  clean = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 3. Keep alphanumeric and spaces, replacing other characters (semicolons, commas, special marks) with space
  clean = clean.replace(/[^a-zA-Z0-9\s-]/g, " ");

  // 4. Normalize spaces
  clean = clean.replace(/\s+/g, " ").trim();

  return clean;
};

const convertToWebp = async (sourcePath, destPath, { maxSize = 1200, fit = "inside", quality = 85 } = {}) => {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  const tmp = `${destPath}.tmp`;
  await sharp(sourcePath)
    .rotate()
    .resize({
      width: maxSize,
      height: maxSize,
      fit,
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toFile(tmp);
  await fs.promises.rename(tmp, destPath);
  return destPath;
};

/**
 * Broader matching:
 * 1. Exact match of file slug and product simplified name slug.
 * 2. Substring matching (file slug includes product slug, or product slug includes file slug).
 * 3. Word token inclusion match (matching most words).
 */
const findImageFileForProduct = (simplifiedName, files) => {
  const productSlug = slugify(simplifiedName);
  const words = productSlug.split("-").filter((w) => w.length > 1);

  // Phase 1: Exact match
  let match = files.find((file) => {
    const ext = path.extname(file).toLowerCase();
    if (!allowedExtensions.includes(ext)) return false;
    return slugify(path.basename(file, ext)) === productSlug;
  });
  if (match) return match;

  // Phase 2: Substring match
  match = files.find((file) => {
    const ext = path.extname(file).toLowerCase();
    if (!allowedExtensions.includes(ext)) return false;
    const fileSlug = slugify(path.basename(file, ext));
    return fileSlug.includes(productSlug) || productSlug.includes(fileSlug);
  });
  if (match) return match;

  // Phase 3: Word-based match (direct like-search)
  if (words.length > 0) {
    let bestMatch = null;
    let maxMatches = 0;

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!allowedExtensions.includes(ext)) continue;
      const fileSlug = slugify(path.basename(file, ext));
      const fileWords = fileSlug.split("-");

      const matchingWords = words.filter((w) => fileWords.includes(w)).length;
      if (
        matchingWords > maxMatches &&
        matchingWords >= Math.ceil(words.length * 0.5)
      ) {
        maxMatches = matchingWords;
        bestMatch = file;
      }
    }
    if (bestMatch) return bestMatch;
  }

  return null;
};

const run = async () => {
  if (!fs.existsSync(imgDir)) {
    console.error(`Image folder not found: ${imgDir}`);
    process.exit(1);
  }

  // Resolve correct input JSON path
  let inputJsonPath = path.join(__dirname, "failed.json");
  if (!fs.existsSync(inputJsonPath)) {
    inputJsonPath = path.join(__dirname, "failed-product-images.json");
  }
  if (!fs.existsSync(inputJsonPath)) {
    inputJsonPath = path.join(projectRoot, "failed_product_image.json");
  }

  if (!fs.existsSync(inputJsonPath)) {
    console.error(`No failed products JSON file found at: ${inputJsonPath}`);
    process.exit(1);
  }

  console.log(`Reading products from: ${inputJsonPath}`);
  const failedProducts = JSON.parse(
    await fs.promises.readFile(inputJsonPath, "utf-8"),
  );

  await connectDatabase();

  const files = await fs.promises.readdir(imgDir);

  let success = 0;
  let failed = 0;
  const failedList = [];
  const baseBatchFolder = getBatchFolderName().slice(0, -2);

  for (const entry of failedProducts) {
    // Look up the product in the database by did or _id
    const query = entry.did
      ? { did: entry.did }
      : entry._id
        ? { _id: entry._id }
        : null;
    if (!query) {
      console.log(`✖ Entry has neither did nor _id: ${JSON.stringify(entry)}`);
      failed += 1;
      continue;
    }

    const product = await ProductModel.findOne(query).lean();
    if (!product) {
      console.log(
        `✖ Product not found in database for entry: ${entry.name || entry.did || entry._id}`,
      );
      failed += 1;
      failedList.push(entry);
      continue;
    }

    // Simplify the product name
    const simplifiedName = simplifyName(product.name || entry.name);
    const productSlug = slugify(simplifiedName);

    // Find matching image using the broad matching logic
    const imageFile = findImageFileForProduct(simplifiedName, files);

    if (!imageFile) {
      failed += 1;
      failedList.push({
        did: product.did,
        name: product.name,
        _id: product._id,
      });
      console.log(
        `✖ ${product.name} (simplified: "${simplifiedName}") -> no matching image in img folder`,
      );
      continue;
    }

    try {
      const sourcePath = path.join(imgDir, imageFile);
      const fileBase = productSlug;
      const currentBatchIndex = Math.floor(success / 50) + 1;
      const batchFolder = `${baseBatchFolder}${String(currentBatchIndex).padStart(2, "0")}`;
      const identifier = product.did || product._id.toString();
      const mainFileName = `product_${fileBase}_${identifier}.webp`;
      const thumbFileName = `thumb_${fileBase}_${identifier}.webp`;
      const mainDestPath = path.join(
        outputUploadsDir,
        batchFolder,
        mainFileName,
      );
      const thumbDestPath = path.join(
        outputUploadsDir,
        batchFolder,
        thumbFileName,
      );

      // Convert main image to 1200x1200px and thumbnail to 200x200px
      await convertToWebp(sourcePath, mainDestPath, { maxSize: 1200, fit: "inside", quality: 85 });
      await convertToWebp(sourcePath, thumbDestPath, { maxSize: 200, fit: "cover", quality: 85 });

      const imageUrl = `/uploads/${batchFolder}/${mainFileName}`;
      const thumbnailUrl = `/uploads/${batchFolder}/${thumbFileName}`;

      await ProductModel.updateOne(
        { _id: product._id },
        { $set: { imageUrl, thumbnailUrl } },
      );

      success += 1;
      console.log(
        `✔ ${product.name} matched with "${imageFile}" -> ${imageUrl}`,
      );
    } catch (err) {
      failed += 1;
      failedList.push({
        did: product.did,
        name: product.name,
        _id: product._id,
      });
      console.error(
        `✖ ${product.name} failed during processing:`,
        err.message || err,
      );
    }
  }

  // Write updated failure list back
  await fs.promises.writeFile(
    failureLogPath,
    JSON.stringify(failedList, null, 2),
    "utf-8",
  );

  console.log("\n=== Upload Summary ===");
  console.log(`Products checked: ${failedProducts.length}`);

  console.log(`Succeeded: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Failed list written to: ${failureLogPath}`);

  await closeDatabase();
};

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
