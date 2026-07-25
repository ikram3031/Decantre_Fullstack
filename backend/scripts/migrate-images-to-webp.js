/**
 * migrate-images-to-webp.js
 *
 * Goal:
 *  - DB-te product er imageUrl/thumbnailUrl path ache (e.g. /content/products/filename.webp)
 *  - Actual file uploads/ folder e flat structure e ache (jpg/png/webp)
 *  - Script: filename beber korbe → uploads/ e khujbe → WebP convert korbe → DB update korbe
 *
 * Run: node scripts/migrate-images-to-webp.js
 * Dry-run: node scripts/migrate-images-to-webp.js --dry-run
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { ProductModel } from "../src/models/product.model.js";

// ─── Config ──────────────────────────────────────────────────────────────────

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const uploadsDir = path.resolve(projectRoot, "uploads");
const logPath = path.resolve(scriptDir, "migrate-images-report.json");

const DRY_RUN = process.argv.includes("--dry-run");

// Image sizes
const IMAGE_OPTIONS = { width: 800, height: 800, fit: "inside", withoutEnlargement: true };
const THUMB_OPTIONS = { width: 300, height: 300, fit: "inside", withoutEnlargement: true };

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * DB path theke filename ber koro.
 * e.g. "/content/products/thumbnails/foo.webp" → "foo.webp"
 * e.g. "/content/products/foo-1234.webp"       → "foo-1234.webp"
 */
const extractFilename = (dbPath) => {
  if (!dbPath || typeof dbPath !== "string") return null;
  return path.basename(dbPath.replace(/\\/g, "/").trim());
};

/**
 * Filename diye uploads/ e file khojo.
 * Priority: .webp > .jpg > .png > .jpeg
 * Original name o check koro (extensions strip kore).
 */
const findSourceFile = (filename) => {
  if (!filename) return null;

  // 1. Direct match or standard extension match
  const rawBaseName = path.basename(filename, path.extname(filename));
  // Strip timestamp like -1784973479540
  const cleanBaseName = rawBaseName.replace(/-\d{10,}$/, "");

  const directCandidates = [
    path.join(uploadsDir, filename),
    path.join(uploadsDir, `${rawBaseName}.webp`),
    path.join(uploadsDir, `${rawBaseName}.jpg`),
    path.join(uploadsDir, `${rawBaseName}.png`),
    path.join(uploadsDir, `${rawBaseName}.jpeg`),
    path.join(uploadsDir, `${cleanBaseName}.webp`),
    path.join(uploadsDir, `${cleanBaseName}.jpg`),
    path.join(uploadsDir, `${cleanBaseName}.png`),
    path.join(uploadsDir, `${cleanBaseName}.jpeg`),
  ];

  for (const candidate of directCandidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  // 2. Scan uploads directory for fuzzy / case-insensitive / prefix matching
  try {
    const allFiles = fs.readdirSync(uploadsDir);
    const lowerClean = cleanBaseName.toLowerCase();

    // Match files starting with cleanBaseName or lowerClean
    const matched = allFiles.find((f) => {
      const fLower = f.toLowerCase();
      return (
        fLower === lowerClean ||
        fLower.startsWith(lowerClean + ".") ||
        fLower.startsWith(lowerClean + "-")
      );
    });

    if (matched) {
      return path.join(uploadsDir, matched);
    }
  } catch (err) {
    // ignore read dir errors
  }

  return null;
};

/**
 * Source file WebP-te convert kore uploads/ e save koro.
 * Output: uploads/<baseName>.webp
 * Returns: public URL (/uploads/<baseName>.webp)
 */
const convertToWebp = async (sourcePath, resizeOptions, outputBaseName) => {
  const outputFilename = `${outputBaseName}.webp`;
  const outputPath = path.join(uploadsDir, outputFilename);
  const tempPath = `${outputPath}.tmp`;

  await sharp(sourcePath)
    .rotate()            // EXIF orientation fix
    .resize(resizeOptions)
    .webp({ quality: 82 })
    .toFile(tempPath);

  await fs.promises.rename(tempPath, outputPath);
  return `/uploads/${outputFilename}`;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const migrateImagesToWebp = async () => {
  await connectDatabase();

  const report = {
    total: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  console.log(`\n🚀 Starting image migration${DRY_RUN ? " [DRY RUN]" : ""}...\n`);

  const cursor = ProductModel.find({}).cursor();

  for await (const product of cursor) {
    report.total += 1;
    const did = product.did || product._id?.toString();
    const entry = { did, name: product.name, imageUrl: null, thumbnailUrl: null, errors: [] };

    const updates = {};

    // ── Process imageUrl ──────────────────────────────────────────────────
    const imageFilename = extractFilename(product.imageUrl);
    if (imageFilename) {
      const sourcePath = findSourceFile(imageFilename);
      if (!sourcePath) {
        entry.errors.push(`imageUrl source not found: ${imageFilename}`);
      } else {
        const ext = path.extname(sourcePath).toLowerCase();
        const baseName = path.basename(sourcePath, path.extname(sourcePath));

        if (ext === ".webp") {
          // Already WebP, just make sure DB path is correct
          const correctUrl = `/uploads/${path.basename(sourcePath)}`;
          if (product.imageUrl !== correctUrl) {
            updates.imageUrl = correctUrl;
            entry.imageUrl = `already WebP → path corrected to ${correctUrl}`;
          } else {
            entry.imageUrl = "already WebP, path OK ✓";
          }
        } else {
          // Convert to WebP
          try {
            if (!DRY_RUN) {
              const newUrl = await convertToWebp(sourcePath, IMAGE_OPTIONS, baseName);
              updates.imageUrl = newUrl;
              entry.imageUrl = `converted → ${newUrl}`;
            } else {
              entry.imageUrl = `[DRY RUN] would convert ${sourcePath} → ${baseName}.webp`;
            }
          } catch (err) {
            entry.errors.push(`imageUrl conversion failed: ${err.message}`);
          }
        }
      }
    }

    // ── Process thumbnailUrl ──────────────────────────────────────────────
    const thumbFilename = extractFilename(product.thumbnailUrl);
    if (thumbFilename) {
      const sourcePath = findSourceFile(thumbFilename);
      if (!sourcePath) {
        entry.errors.push(`thumbnailUrl source not found: ${thumbFilename}`);
      } else {
        const ext = path.extname(sourcePath).toLowerCase();
        const baseName = path.basename(sourcePath, path.extname(sourcePath));
        const thumbOutputName = `${baseName}-thumb`;

        if (ext === ".webp") {
          const correctUrl = `/uploads/${path.basename(sourcePath)}`;
          if (product.thumbnailUrl !== correctUrl) {
            updates.thumbnailUrl = correctUrl;
            entry.thumbnailUrl = `already WebP → path corrected to ${correctUrl}`;
          } else {
            entry.thumbnailUrl = "already WebP, path OK ✓";
          }
        } else {
          try {
            if (!DRY_RUN) {
              const newUrl = await convertToWebp(sourcePath, THUMB_OPTIONS, thumbOutputName);
              updates.thumbnailUrl = newUrl;
              entry.thumbnailUrl = `converted → ${newUrl}`;
            } else {
              entry.thumbnailUrl = `[DRY RUN] would convert ${sourcePath} → ${thumbOutputName}.webp`;
            }
          } catch (err) {
            entry.errors.push(`thumbnailUrl conversion failed: ${err.message}`);
          }
        }
      }
    }

    // ── DB Update ─────────────────────────────────────────────────────────
    if (Object.keys(updates).length > 0 && !DRY_RUN) {
      await ProductModel.updateOne({ _id: product._id }, { $set: updates });
      report.updated += 1;
      console.log(`✔ [${did}] ${product.name}`);
      if (entry.imageUrl)     console.log(`   imageUrl    : ${entry.imageUrl}`);
      if (entry.thumbnailUrl) console.log(`   thumbnailUrl: ${entry.thumbnailUrl}`);
    } else if (entry.errors.length > 0) {
      report.failed += 1;
      console.log(`✖ [${did}] ${product.name}`);
      entry.errors.forEach((e) => console.log(`   ⚠ ${e}`));
    } else {
      report.skipped += 1;
      console.log(`⟳ [${did}] ${product.name} — skipped (no change needed)`);
    }

    report.details.push(entry);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════");
  console.log("        Migration Summary");
  console.log("═══════════════════════════════════");
  console.log(`  Total products : ${report.total}`);
  console.log(`  Updated        : ${report.updated}`);
  console.log(`  Skipped        : ${report.skipped}`);
  console.log(`  Failed         : ${report.failed}`);
  if (DRY_RUN) console.log("\n  ⚠ DRY RUN — no changes were made");
  console.log("═══════════════════════════════════\n");

  await fs.promises.writeFile(logPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`📄 Report saved to: ${logPath}`);

  await closeDatabase();
};

migrateImagesToWebp().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
