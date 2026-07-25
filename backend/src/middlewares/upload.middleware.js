import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine physical folder name based on fieldname
    let folderName = 'uploads/products';
    if (file.fieldname === 'gallery') {
      folderName = 'uploads/product-gallery';
    }

    // Auto-create folder if it doesn't exist
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }

    cb(null, folderName);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const multerUpload = multer({ storage });

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

  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) return next(err);

      // 1. Handle Single File Upload
      if (req.file) {
        const relativePath = req.file.path.replace(/\\/g, '/'); // Convert Windows backslashes
        req.file.url = relativePath.replace(/^uploads\//, '/content/'); // e.g. /content/products/filename.jpg
      }

      // 2. Handle Multiple Fields Upload
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
    });
  };
};
