import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { ProductModel } from "../src/core/models/product.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const jsonPath = path.join(projectRoot, "docs", "dummyProducts.json");
const uploadsDir = path.join(projectRoot, "uploads");
const targetProductsDir = path.join(uploadsDir, "products");

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/['"’`”“]/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const findMatchingSourceImage = (title, sourceFiles) => {
  const titleSlug = slugify(title);
  const titleWords = titleSlug.split("-").filter((w) => w.length > 1);

  let bestFile = null;
  let bestScore = 0;

  for (const file of sourceFiles) {
    const fileBase = path.basename(file, path.extname(file));
    const fileSlug = slugify(fileBase);
    const fileWords = fileSlug.split("-").filter((w) => w.length > 1);

    if (fileSlug.startsWith(titleSlug) || titleSlug.startsWith(fileSlug)) {
      return file;
    }

    let score = 0;
    for (const tw of titleWords) {
      if (fileWords.includes(tw)) {
        score += tw.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestFile = file;
    }
  }

  return bestFile;
};

const convertToWebp = async (sourcePath, destPath, options = {}) => {
  const { width = 1200, quality = 85, fit = "inside" } = options;
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  const tmpFile = `${destPath}.tmp`;
  await sharp(sourcePath)
    .rotate()
    .resize({ width, height: width, fit, withoutEnlargement: true })
    .webp({ quality })
    .toFile(tmpFile);
  await fs.promises.rename(tmpFile, destPath);
};

const run = async () => {
  console.log("Starting WebP Conversion & Product URL Update...");

  if (!fs.existsSync(targetProductsDir)) {
    fs.mkdirSync(targetProductsDir, { recursive: true });
  }

  const rawJson = fs.readFileSync(jsonPath, "utf-8");
  const productsData = JSON.parse(rawJson);

  const sourceFiles = fs
    .readdirSync(uploadsDir)
    .filter((f) => !fs.statSync(path.join(uploadsDir, f)).isDirectory() && /\.(jpeg|jpg|png)$/i.test(f));

  console.log(`Found ${productsData.length} products and ${sourceFiles.length} source images.`);

  await connectDatabase();

  try {
    let successCount = 0;

    for (const item of productsData) {
      const { title } = item;
      const slug = slugify(title);

      const matchedSource = findMatchingSourceImage(title, sourceFiles);
      if (!matchedSource) {
        console.warn(`⚠️ No source image matched for: ${title}`);
        continue;
      }

      const sourcePath = path.join(uploadsDir, matchedSource);
      const mainDestFileName = `${slug}.webp`;
      const thumbDestFileName = `thumb_${slug}.webp`;

      const mainDestPath = path.join(targetProductsDir, mainDestFileName);
      const thumbDestPath = path.join(targetProductsDir, thumbDestFileName);

      // Convert Main Image to WebP
      await convertToWebp(sourcePath, mainDestPath, { width: 1200, quality: 90, fit: "inside" });

      // Convert Thumbnail Image to WebP
      await convertToWebp(sourcePath, thumbDestPath, { width: 250, quality: 85, fit: "cover" });

      const imageUrl = `/uploads/products/${mainDestFileName}`;
      const thumbnailUrl = `/uploads/products/${thumbDestFileName}`;

      const updateRes = await ProductModel.updateOne(
        { slug },
        {
          $set: {
            imageUrl,
            thumbnailUrl,
            images: [{ url: imageUrl, altText: title }],
          },
        }
      );

      if (updateRes.matchedCount > 0) {
        successCount++;
        console.log(`✔ [WebP] ${title}`);
        console.log(`   Main:  ${imageUrl}`);
        console.log(`   Thumb: ${thumbnailUrl}`);
      } else {
        console.warn(`❌ Product not found in database for slug: ${slug}`);
      }
    }

    console.log(`\n🎉 WebP Conversion & Database Update Complete! Updated ${successCount} products.`);
  } catch (err) {
    console.error("❌ Error in convertAndSeedWebp script:", err);
  } finally {
    await closeDatabase();
  }
};

run();
