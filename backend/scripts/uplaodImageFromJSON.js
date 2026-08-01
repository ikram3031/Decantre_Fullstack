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

// The JSON file containing the list of products with failed images
const failedJsonPath = path.resolve(
  projectRoot,
  "..",
  "failed_product_image.json",
);
const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"];

const getBatchFolderName = () => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;
  return `${dateStr}01009`;
};

const slugify = (text) => {
  if (!text) return "product";
  return text
    .toString()
    .normalize("NFD") // ô → o + combining accent, é → e + accent
    .replace(/[\u0300-\u036f]/g, "") // remove combining diacritical marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const convertToWebp = async (sourcePath, destPath, maxSize = 1200) => {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  const tmp = `${destPath}.tmp`;
  await sharp(sourcePath)
    .rotate()
    .resize({
      width: maxSize,
      height: maxSize,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 90 })
    .toFile(tmp);
  await fs.promises.rename(tmp, destPath);
  return destPath;
};

const findImageFileForProduct = (productSlug, files) => {
  return files.find((file) => {
    const ext = path.extname(file).toLowerCase();
    if (!allowedExtensions.includes(ext)) return false;
    return slugify(path.basename(file, ext)) === productSlug;
  });
};

const run = async () => {
  if (!fs.existsSync(imgDir)) {
    console.error(`Image folder not found: ${imgDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(failedJsonPath)) {
    console.error(`failed_product_image.json not found: ${failedJsonPath}`);
    process.exit(1);
  }

  // Load products list from failed_product_image.json
  const failedProducts = JSON.parse(
    await fs.promises.readFile(failedJsonPath, "utf-8"),
  );
  console.log(
    `Loaded ${failedProducts.length} items from failed_product_image.json`,
  );

  await connectDatabase();

  const files = await fs.promises.readdir(imgDir);
  let success = 0;
  let failed = 0;
  const newFailedList = [];
  const baseBatchFolder = getBatchFolderName().slice(0, -2); // e.g. "260802"
  let batchIndex = 1;

  for (const item of failedProducts) {
    const { did, name } = item;
    if (!did) {
      console.log(`✖ Skipped invalid item: ${JSON.stringify(item)}`);
      continue;
    }

    const productSlug = slugify(name);
    const imageFile = findImageFileForProduct(productSlug, files);

    // 1. Check if the image file exists in the img folder
    if (!imageFile) {
      failed += 1;
      newFailedList.push(item);
      console.log(`✖ ${productSlug} -> image not found in img folder`);
      continue;
    }

    try {
      const sourcePath = path.join(imgDir, imageFile);
      const fileBase = productSlug;

      // Compute batch folder name dynamically: 50 items per folder
      const currentBatchIndex = Math.floor(success / 50) + 1;
      const batchFolder = `${baseBatchFolder}${String(currentBatchIndex).padStart(2, "0")}`;

      const mainFileName = `product_${fileBase}_${did}.webp`;
      const thumbFileName = `thumb_${fileBase}_${did}.webp`;
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

      // Convert and resize images (Validation check for successful conversion)
      await convertToWebp(sourcePath, mainDestPath, 1200);
      await convertToWebp(sourcePath, thumbDestPath, 600);

      // Verify that the files were actually successfully written/uploaded to destination
      if (!fs.existsSync(mainDestPath) || !fs.existsSync(thumbDestPath)) {
        throw new Error(
          "Converted images not found in uploads destination directory",
        );
      }

      const imageUrl = `/uploads/${batchFolder}/${mainFileName}`;
      const thumbnailUrl = `/uploads/${batchFolder}/${thumbFileName}`;

      // 2. Update the product's image URLs in MongoDB using 'did'
      const updateResult = await ProductModel.updateOne(
        { did },
        { $set: { imageUrl, thumbnailUrl } },
      );

      if (updateResult.matchedCount === 0) {
        throw new Error(`Product not found in database for did: ${did}`);
      }

      success += 1;
      console.log(`✔ ${productSlug} -> updated successfully: ${imageUrl}`);
    } catch (err) {
      failed += 1;
      newFailedList.push(item);
      console.error(`✖ ${productSlug} failed:`, err.message || err);
    }
  }

  // 3. Write any remaining failures back to failed_product_image.json
  await fs.promises.writeFile(
    failedJsonPath,
    JSON.stringify(newFailedList, null, 2),
    "utf-8",
  );

  console.log("\n=== Upload Summary ===");
  console.log(`Products checked: ${failedProducts.length}`);
  console.log(`Succeeded: ${success}`);
  console.log(`Failed (left in json): ${failed}`);

  await closeDatabase();
};

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
