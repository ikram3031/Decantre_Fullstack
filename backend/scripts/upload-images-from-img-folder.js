import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { ProductModel } from "../src/models/product.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const imgDir = path.join(__dirname, "img");
const outputUploadsDir = path.join(projectRoot, "src", "uploads");
const failureLogPath = path.join(__dirname, "failed-upload-images.json");

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
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const convertToWebp = async (sourcePath, destPath) => {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  const tmp = `${destPath}.tmp`;
  await sharp(sourcePath).rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toFile(tmp);
  await fs.promises.rename(tmp, destPath);
  return destPath;
};

const findProduct = async (baseName) => {
  // try did exact
  let prod = await ProductModel.findOne({ did: baseName }).lean();
  if (prod) return prod;

  // try matching name (case-insensitive exact)
  prod = await ProductModel.findOne({ name: new RegExp(`^${baseName.replace(/[-\\/\\^$*+?.()|[\]{}]/g, "\\$&")}$$`, "i") }).lean();
  if (prod) return prod;

  // try contains
  prod = await ProductModel.findOne({ name: new RegExp(baseName.replace(/[-\\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i") }).lean();
  if (prod) return prod;

  // try slug
  prod = await ProductModel.findOne({ slug: baseName }).lean();
  if (prod) return prod;

  return null;
};

const localPathToPublicUrl = (fullPath, batchFolder) => {
  const relative = path.relative(path.join(projectRoot, "src", "uploads"), fullPath).replace(/\\/g, "/");
  return `/uploads/${batchFolder}/${path.basename(relative)}`;
};

const run = async () => {
  if (!fs.existsSync(imgDir)) {
    console.error(`Image folder not found: ${imgDir}`);
    process.exit(1);
  }

  await connectDatabase();

  const files = (await fs.promises.readdir(imgDir)).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"].includes(ext);
  });

  let success = 0;
  let failed = 0;
  const failedList = [];
  const batchFolder = getBatchFolderName();

  for (const file of files) {
    const full = path.join(imgDir, file);
    const baseName = path.basename(file, path.extname(file)).trim();
    try {
      const product = await findProduct(baseName);
      if (!product) {
        failed += 1;
        failedList.push({ file, reason: "product-not-found" });
        console.log(`✖ ${file} -> product not found`);
        continue;
      }

      const did = product.did || (product._id && product._id.toString()) || slugify(baseName);
      const productSlug = slugify(product.name || baseName);
      const destFileName = `product_${productSlug}_${did}.webp`;
      const destPath = path.join(outputUploadsDir, batchFolder, destFileName);

      await convertToWebp(full, destPath);

      const publicUrl = `/uploads/${batchFolder}/${destFileName}`;

      // update product
      await ProductModel.updateOne({ _id: product._id }, { $set: { imageUrl: publicUrl } });

      success += 1;
      console.log(`✔ ${file} -> ${publicUrl}`);
    } catch (err) {
      failed += 1;
      failedList.push({ file, reason: err.message || String(err) });
      console.error(`✖ ${file} failed:`, err.message || err);
    }
  }

  await fs.promises.writeFile(failureLogPath, JSON.stringify(failedList, null, 2), "utf-8");

  console.log("\n=== Upload Summary ===");
  console.log(`Total files: ${files.length}`);
  console.log(`Succeeded: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Failed list written to: ${failureLogPath}`);

  await closeDatabase();
};

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
