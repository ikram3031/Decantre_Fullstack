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
const failureLogPath = path.join(__dirname, "failed-product-images.json");
const PLACEHOLDER_URL = "/uploads/product_placeholder.webp";
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
    .normalize("NFD")              // ô → o + combining accent, é → e + accent
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
    .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
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

  await connectDatabase();

  const files = await fs.promises.readdir(imgDir);
  const products = await ProductModel.find({ imageUrl: PLACEHOLDER_URL }).lean();

  let success = 0;
  let failed = 0;
  const failedList = [];
  const batchFolder = getBatchFolderName();

  for (const product of products) {
    const productSlug = slugify(product.name || product.slug || product.did || product._id);
    const imageFile = findImageFileForProduct(productSlug, files);

    if (!imageFile) {
      failed += 1;
      failedList.push({ did: product.did, name: product.name });
      console.log(`✖ ${productSlug} -> image not found in img folder`);
      continue;
    }

    try {
      const sourcePath = path.join(imgDir, imageFile);
      const fileBase = productSlug;
      const identifier = product.did || product._id.toString();
      const mainFileName = `product_${fileBase}_${identifier}.webp`;
      const thumbFileName = `product_${fileBase}_${identifier}_thumb.webp`;
      const mainDestPath = path.join(outputUploadsDir, batchFolder, mainFileName);
      const thumbDestPath = path.join(outputUploadsDir, batchFolder, thumbFileName);

      await convertToWebp(sourcePath, mainDestPath, 1200);
      await convertToWebp(sourcePath, thumbDestPath, 600);

      const imageUrl = `/uploads/${batchFolder}/${mainFileName}`;
      const thumbnailUrl = `/uploads/${batchFolder}/${thumbFileName}`;

      const query = product.did ? { did: product.did } : { _id: product._id };
      await ProductModel.updateOne(query, { $set: { imageUrl, thumbnailUrl } });

      success += 1;
      console.log(`✔ ${productSlug} -> ${imageUrl}`);
    } catch (err) {
      failed += 1;
      failedList.push({ did: product.did, name: product.name });
      console.error(`✖ ${productSlug} failed:`, err.message || err);
    }
  }

  await fs.promises.writeFile(failureLogPath, JSON.stringify(failedList, null, 2), "utf-8");

  console.log("\n=== Upload Summary ===");
  console.log(`Products checked: ${products.length}`);
  console.log(`Succeeded: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Failed list written to: ${failureLogPath}`);

  await closeDatabase();
};

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
