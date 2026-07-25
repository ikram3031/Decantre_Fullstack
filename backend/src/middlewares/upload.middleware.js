import sharp from 'sharp';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

/*
let globalProductCount = 0;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const batchNumber = Math.floor(globalProductCount / 50) + 1;

    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    const folderName = `uploads/products/${dateStr}-batch-${batchNumber}`;

    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }

    req.currentBatchFolder = `${dateStr}-batch-${batchNumber}`;
    cb(null, folderName);
  },
  filename: (req, file, cb) => {
    globalProductCount++;

    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    const uniqueName = `${nameWithoutExt}-${Date.now()}${ext}`;

    cb(null, uniqueName);
  }
});

const multerUpload = multer({ storage });
*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    
    // YYMMDD ফরম্যাট তৈরি (যেমন: 260726)
    const year = String(now.getFullYear()).slice(-2); // 2026 -> 26
    const month = String(now.getMonth() + 1).padStart(2, '0'); // July -> 07
    const day = String(now.getDate()).padStart(2, '0'); // 26th -> 26
    
    const dateFolder = `${year}${month}${day}`; // Result: "260726"

    // ডাইনামিক প্যাথ: uploads/products/260726
    const dir = path.join(process.cwd(), `uploads/products/${dateFolder}`);

    // ফোল্ডার না থাকলে অটোমেটিক তৈরি করবে
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // ফাইলের মূল এক্সটেনশন ঠিক রেখে ইউনিক নাম জেনারেট
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    const uniqueName = `${nameWithoutExt}-${Date.now()}${ext}`;
    
    cb(null, uniqueName);
  }
});

const multerUpload = multer({ storage: storage });

const compressImageFile = async (file) => {
  if (!file?.mimetype?.startsWith('image/')) return;

  const outputBuffer = await sharp(file.path)
    .rotate()
    .resize({
      width: 1000,
      height: 1000,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();

  await fs.promises.writeFile(file.path, outputBuffer);
};

/**
 * Wrapper middleware to process file uploads and automatically inject the 
 * public database URL (`/content/...`) into the `file` object.
 * 
 * Usage in routes:
 * 1. Single file: `upload('image')` -> access URL via `req.file.url`
 * 2. Multiple fields: `upload([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 5 }])` -> access via `req.files['fieldname'][i].url`
 */
export const upload = (fields) => {
  const middleware = Array.isArray(fields) 
    ? multerUpload.fields(fields) 
    : multerUpload.single(fields);

  return async (req, res, next) => {
    middleware(req, res, async (err) => {
      if (err) return next(err);

      try {
        const filesToProcess = [];

        if (req.file) {
          filesToProcess.push(req.file);
        }

        if (req.files) {
          Object.keys(req.files).forEach((key) => {
            req.files[key].forEach((file) => filesToProcess.push(file));
          });
        }

        await Promise.all(filesToProcess.map(compressImageFile));

        if (req.file) {
          const relativePath = req.file.path.replace(/\\/g, '/');
          req.file.url = relativePath.replace(/^uploads\//, '/content/');
        }

        if (req.files) {
          Object.keys(req.files).forEach((key) => {
            req.files[key] = req.files[key].map((file) => {
              const relativePath = file.path.replace(/\\/g, '/');
              file.url = relativePath.replace(/^uploads\//, '/content/');
              return file;
            });
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    });
  };
};
