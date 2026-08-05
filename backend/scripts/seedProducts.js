import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { ProductModel } from "../src/core/models/product.model.js";
import { UserModel } from "../src/core/models/user.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const jsonPath = path.join(projectRoot, "docs", "dummyProducts.json");
const uploadsDir = path.join(projectRoot, "uploads");

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

const parsePrice = (priceStr) => {
  if (!priceStr) return null;
  // Handle price ranges e.g. "850.00 ৳ – 1,890.00 ৳"
  if (priceStr.includes("–") || priceStr.includes("-")) {
    const parts = priceStr.split(/–|-/);
    const low = parsePrice(parts[0]);
    const high = parsePrice(parts[1]);
    return { low, high };
  }
  const clean = priceStr.replace(/[^0-9.]/g, "");
  const val = parseFloat(clean);
  return isNaN(val) ? null : val;
};

const findMatchingImage = (title, uploadFiles) => {
  const titleSlug = slugify(title);
  const titleWords = titleSlug.split("-").filter(w => w.length > 1);

  let bestFile = null;
  let bestScore = 0;

  for (const file of uploadFiles) {
    const fileBase = path.basename(file, path.extname(file));
    const fileSlug = slugify(fileBase);
    const fileWords = fileSlug.split("-").filter(w => w.length > 1);

    // Exact slug match
    if (fileSlug.startsWith(titleSlug) || titleSlug.startsWith(fileSlug)) {
      return `/uploads/${file}`;
    }

    // Count matching words
    let score = 0;
    for (const tw of titleWords) {
      if (fileWords.includes(tw)) {
        score += tw.length; // Weight longer words more heavily
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestFile = file;
    }
  }

  return bestFile ? `/uploads/${bestFile}` : "/uploads/placeholder.jpeg";
};

const seed = async () => {
  console.log("Reading dummy products JSON...");
  const rawJson = fs.readFileSync(jsonPath, "utf-8");
  const productsData = JSON.parse(rawJson);

  const uploadFiles = fs.existsSync(uploadsDir)
    ? fs.readdirSync(uploadsDir).filter((f) => !fs.statSync(path.join(uploadsDir, f)).isDirectory())
    : [];

  console.log(`Found ${productsData.length} products in JSON and ${uploadFiles.length} images in uploads directory.`);

  await connectDatabase();

  try {
    const owner = await UserModel.findOne({ role: "Owner" });
    if (!owner) {
      throw new Error("Owner user not found in database. Please run createUser script first.");
    }
    const createdBy = owner._id;

    let inserted = 0;
    let updated = 0;

    for (const item of productsData) {
      const { title, sub_description, regular_price, sale_price } = item;
      const slug = slugify(title);

      const imagePath = findMatchingImage(title, uploadFiles) || "/uploads/placeholder.jpeg";

      let price = 0;
      let offerPrice = null;

      const parsedSale = parsePrice(sale_price);
      const parsedReg = parsePrice(regular_price);

      if (parsedSale && typeof parsedSale === "object") {
        // Range price
        price = parsedSale.high || parsedSale.low || 0;
        offerPrice = parsedSale.low || null;
      } else {
        price = parsedReg || parsedSale || 0;
        offerPrice = (parsedSale && parsedSale !== price) ? parsedSale : null;
      }

      const productPayload = {
        name: title.trim(),
        slug,
        description: sub_description ? sub_description.trim() : title.trim(),
        type: "simple",
        price,
        offerPrice,
        stockQuantity: 50,
        stockStatus: "instock",
        imageUrl: imagePath,
        thumbnailUrl: imagePath,
        images: [{ url: imagePath, altText: title }],
        tags: [slug, "toy", "montessori"],
        season: "All-Season",
        createdBy,
      };

      const existing = await ProductModel.findOne({ slug });
      if (existing) {
        await ProductModel.updateOne({ _id: existing._id }, { $set: productPayload });
        updated++;
        console.log(`✅ Updated: ${title} -> ${imagePath}`);
      } else {
        await ProductModel.create(productPayload);
        inserted++;
        console.log(`✅ Created: ${title} -> ${imagePath}`);
      }
    }

    console.log(`\n🎉 Seeding Completed! Created: ${inserted}, Updated: ${updated}, Total: ${inserted + updated}`);

  } catch (err) {
    console.error("❌ Error during seeding:", err);
  } finally {
    await closeDatabase();
  }
};

seed();
