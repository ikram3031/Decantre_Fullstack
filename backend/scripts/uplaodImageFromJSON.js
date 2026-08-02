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
  "scripts",
  "failed-product-images.json",
);
const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"];

const getBatchFolderName = () => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;
  return `${dateStr}010010`;
};

const slugify = (text) => {
  if (!text) return "product";
  return text
    .toString()
    .normalize("NFD") // ô → o + combining accent, é → e + accent
    .replace(/[\u0300-\u036f]/g, "") // remove combining diacritical marks
    .toLowerCase()
    .replace(/\([^)]*\)/g, "") // Remove everything inside parentheses, including parentheses e.g. "(jpg)" -> ""
    .replace(/\[[^\]]*\]/g, "") // Remove everything inside brackets e.g. "[jpg]" -> ""
    .replace(/['"’`”“]/g, "") // Remove apostrophes and quotes completely so "Victoria's" becomes "victorias"
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

const getAllFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

const run = async () => {
  if (!fs.existsSync(imgDir)) {
    console.error(`Image folder not found: ${imgDir}`);
    process.exit(1);
  }

  // 1. Initial cleanup or start: empty the JSON at start or ensure it exists
  await fs.promises.writeFile(
    failedJsonPath,
    JSON.stringify([], null, 2),
    "utf-8",
  );
  console.log(`🧹 Cleared and initialized: ${failedJsonPath}`);

  await connectDatabase();

  // 2. Fetch all products that have placeholder images or are missing images
  const PLACEHOLDER_URL = "/uploads/product_placeholder.webp";
  const query = {
    $or: [
      { imageUrl: PLACEHOLDER_URL },
      { thumbnailUrl: PLACEHOLDER_URL },
      { imageUrl: { $exists: false } },
      { thumbnailUrl: { $exists: false } },
      { imageUrl: "" },
      { thumbnailUrl: "" },
    ],
  };

  const placeholderProducts = await ProductModel.find(query).lean();
  console.log(
    `Loaded ${placeholderProducts.length} products with placeholder/missing images from DB`,
  );

  if (placeholderProducts.length === 0) {
    console.log("✅ No products need image updates. Database is clean.");
    await closeDatabase();
    process.exit(0);
  }

  const files = getAllFiles(imgDir);
  let success = 0;
  let failed = 0;
  const newFailedList = [];
  const baseBatchFolder = getBatchFolderName().slice(0, -2); // e.g. "260802"

  for (const product of placeholderProducts) {
    const did = product.did || product._id?.toString();
    const name = product.name;

    if (!did) {
      console.log(
        `✖ Skipped invalid database item: ${JSON.stringify(product)}`,
      );
      continue;
    }

    const productSlug = slugify(name);
    const imageFilePath = findImageFileForProduct(productSlug, files);

    // If the image file doesn't exist in the img folder or subfolders
    if (!imageFilePath) {
      failed += 1;
      newFailedList.push({ did, name });
      console.log(
        `✖ ${productSlug} -> image not found in img folder/subfolders`,
      );
      continue;
    }

    try {
      const sourcePath = imageFilePath; // Since getAllFiles returns full paths
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

      // Convert and resize images
      await convertToWebp(sourcePath, mainDestPath, 1200);
      await convertToWebp(sourcePath, thumbDestPath, 600);

      // Verify files exist in destination
      if (!fs.existsSync(mainDestPath) || !fs.existsSync(thumbDestPath)) {
        throw new Error(
          "Converted images not found in uploads destination directory",
        );
      }

      const imageUrl = `/uploads/${batchFolder}/${mainFileName}`;
      const thumbnailUrl = `/uploads/${batchFolder}/${thumbFileName}`;

      // Update the product's image URLs in MongoDB
      const updateResult = await ProductModel.updateOne(
        { _id: product._id },
        { $set: { imageUrl, thumbnailUrl } },
      );

      if (updateResult.matchedCount === 0) {
        throw new Error(`Product not found in database for ID: ${product._id}`);
      }

      success += 1;
      console.log(`✔ ${productSlug} -> updated successfully: ${imageUrl}`);
    } catch (err) {
      failed += 1;
      newFailedList.push({ did, name });
      console.error(`✖ ${productSlug} failed:`, err.message || err);
    }
  }

  // 3. Write only the remaining failures to failed_product_image.json
  await fs.promises.writeFile(
    failedJsonPath,
    JSON.stringify(newFailedList, null, 2),
    "utf-8",
  );

  console.log("\n=== Upload Summary ===");
  console.log(`Products checked: ${placeholderProducts.length}`);
  console.log(`Succeeded: ${success}`);
  console.log(`Failed (left in json): ${failed}`);

  await closeDatabase();
};

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
