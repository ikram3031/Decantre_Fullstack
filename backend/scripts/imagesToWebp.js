import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const imgDir = path.join(projectRoot, "img");

// Target folder: backend/src/uploads
const uploadDir = path.join(projectRoot, "src", "uploads", "assets");

// Target size config
const IMAGE_OPTIONS = {
  width: 1500,
  height: 1500,
  fit: "inside",
  withoutEnlargement: true,
};

// Specific image names to convert (e.g. ["main-banner.jpg"])
const TARGET_NAMES = ["main-banner.jpg"];

const getAllFiles = (dirPath, arrayOfFiles = []) => {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
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

const convertToWebp = async (sourcePath, destPath, resizeOptions) => {
  const tmp = `${destPath}.tmp`;
  await sharp(sourcePath)
    .rotate()
    .resize(resizeOptions)
    .webp({ quality: 90 })
    .toFile(tmp);
  await fs.promises.rename(tmp, destPath);
  console.log(`✔ Converted: ${path.basename(sourcePath)} -> ${destPath}`);
};

const run = async () => {
  if (!fs.existsSync(imgDir)) {
    console.error(`Image folder not found: ${imgDir}`);
    process.exit(1);
  }

  await fs.promises.mkdir(uploadDir, { recursive: true });
  console.log(`📁 Target directory: ${uploadDir}`);

  const allFiles = getAllFiles(imgDir);
  let successCount = 0;

  for (const filePath of allFiles) {
    const fileName = path.basename(filePath);

    // Check if the current file matches any name in TARGET_NAMES
    const isTarget = TARGET_NAMES.some((targetName) => {
      return (
        fileName.toLowerCase() === targetName.toLowerCase() ||
        path.basename(fileName, path.extname(fileName)).toLowerCase() ===
          path.basename(targetName, path.extname(targetName)).toLowerCase()
      );
    });

    if (isTarget) {
      const baseName = path.basename(fileName, path.extname(fileName));
      const destPath = path.join(uploadDir, `${baseName}.webp`);
      try {
        await convertToWebp(filePath, destPath, IMAGE_OPTIONS);
        successCount++;
      } catch (err) {
        console.error(`✖ Failed to convert ${fileName}:`, err.message || err);
      }
    }
  }

  console.log(`\n🎉 Processed ${successCount} target images.`);
};

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
