# Commit Log / Change Log

## [2026-07-26]

### 1. Order API Updates
- **Payload & Validation Adjustment**:
  - Updated order helper validation ([orderHelper.js](file:///e:/AAAAAAA/backend/src/helper/orderHelper.js)) and schema ([order.model.js](file:///e:/AAAAAAA/backend/src/models/order.model.js)) so `fullName`, `phone`, `email`, `address`, and `district` are strictly required while `city`, `thana`, and `zip` are optional (defaults to empty string).

### 2. Product Image WebP Migration Script
- **Script Creation & Execution**:
  - Created [`scripts/migrate-images-to-webp.js`](file:///e:/AAAAAAA/backend/scripts/migrate-images-to-webp.js) to automate scanning products, matching image source files from `uploads/`, converting them to resized `.webp` format, and updating DB paths to clean `/uploads/...` URLs.
  - Implemented fuzzy and timestamp-stripping matching logic to map DB filenames (e.g. `*-1784973480266.webp`) to actual disk images.

### 3. Upload Middleware Refactoring
- **Dynamic Date-Based Pathing**:
  - Updated [`src/middlewares/upload.middleware.js`](file:///e:/AAAAAAA/backend/src/middlewares/upload.middleware.js) to use dynamic date folder storage (`uploads/products/YYMMDD`).
  - Commented out legacy batch storage logic.
  - Fixed duplicate `upload` export and missing `multerUpload` instance errors.

### 4. Git Ignore Configuration
- Updated [`.gitignore`](file:///e:/AAAAAAA/backend/.gitignore) to exclude local uploaded files (`uploads*`).
