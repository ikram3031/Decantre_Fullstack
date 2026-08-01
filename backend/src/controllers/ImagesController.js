import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
}).single("image");

export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    
    // Dynamic subfolder structure: YYYY/MM-DD
    const dateFolder = path.join(year, `${month}-${day}`);
    const destinationDir = path.join(process.cwd(), "uploads", dateFolder);

    // Ensure the directory exists
    await fs.promises.mkdir(destinationDir, { recursive: true });

    // Generate unique slugified filenames
    const originalName = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const slugName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";
    const timestamp = Date.now();

    // Check if it is a product upload
    const isProduct = req.query.type === "product" || req.body.type === "product";

    if (isProduct) {
      const mainFilename = `product_${slugName}_${timestamp}.webp`;
      const thumbFilename = `thumb_${slugName}_${timestamp}.webp`;

      const mainFilePath = path.join(destinationDir, mainFilename);
      const thumbFilePath = path.join(destinationDir, thumbFilename);

      // Process main image: Max 1200x1200px
      await sharp(req.file.buffer)
        .rotate()
        .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(mainFilePath);

      // Process thumbnail image: Max 200x200px
      await sharp(req.file.buffer)
        .rotate()
        .resize({ width: 200, height: 200, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(thumbFilePath);

      // Construct public URLs
      const mainUrl = `/uploads/${year}/${month}-${day}/${mainFilename}`;
      const thumbUrl = `/uploads/${year}/${month}-${day}/${thumbFilename}`;

      return res.status(200).json({
        status: "success",
        data: {
          imageUrl: mainUrl,
          thumbnailUrl: thumbUrl,
        },
      });
    } else {
      const filename = `image_${slugName}_${timestamp}.webp`;
      const filePath = path.join(destinationDir, filename);

      // Process image without resizing or with large default limit (e.g. max 1920 width)
      await sharp(req.file.buffer)
        .rotate()
        .resize({ width: 1920, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(filePath);

      const imageUrl = `/uploads/${year}/${month}-${day}/${filename}`;

      return res.status(200).json({
        status: "success",
        data: {
          imageUrl,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
