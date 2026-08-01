# Product Image Upload Pipeline — Documentation

> এই document টা product image এর পুরো lifecycle cover করে:
> image compress করা → MongoDB update → VPS server এ deploy করা পর্যন্ত।

---

## Overview — পুরো Process এক নজরে

```
Raw Images (jpg / png / webp)  ← img/ folder এ রাখো
         │
         ▼
┌─────────────────────────────────────────────┐
│  STEP 1: upload-productImg_fromFolder.js    │  ← DB তে placeholder আছে এমন products
└─────────────────────────────────────────────┘
         │ fail হলে → scripts/failed-product-images.json
         ▼
┌─────────────────────────────────────────────┐
│  STEP 2: uplaodImageFromJSON.js             │  ← failed list থেকে retry
└─────────────────────────────────────────────┘
         │ এবারও fail হলে → failed_product_image.json (updated)
         ▼
  Sharp দিয়ে WebP Convert + Resize
  • Main image  → 1200×1200 max, quality 90
  • Thumbnail   → 600×600 max,  quality 90
         │
         ▼
  src/uploads/<batchFolder>/ এ save
  • product_<slug>_<did>.webp
  • thumb_<slug>_<did>.webp
         │
         ▼
  MongoDB — imageUrl + thumbnailUrl update
         │
         ▼
┌─────────────────────────────────────────────┐
│  STEP 3: scp দিয়ে VPS এ upload             │  ← converted files server এ পাঠাও
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  STEP 4: set-placeHolder.js  ✅ FINAL STEP  │  ← img পাওয়া যায়নি এমনগুলোতে
│                                             │    placeholder force set করো
└─────────────────────────────────────────────┘
```

---

## Prerequisites

```bash
cd E:\AAAAA\backend

# Dependencies install
npm install

# .env এ MongoDB URI থাকতে হবে
# MONGO_URI=mongodb://...

# img/ folder এ raw image files রাখো
# File naming rule: product name এর slug এর সাথে match করতে হবে
# "Lancôme Idôle EDP" → "lancome-idole-edp.jpg"
# "Giorgio Armani Sì" → "giorgio-armani-si.jpg"
```

---

## Script 1 — `upload-productImg_fromFolder.js`

### কখন ব্যবহার করবে
MongoDB তে যে products এর `imageUrl = /uploads/product_placeholder.webp`, সেগুলোর জন্য `img/` folder থেকে image খুঁজে upload করে।

### Run
```bash
node ./scripts/upload-productImg_fromFolder.js
```

### কীভাবে কাজ করে
1. DB থেকে `imageUrl = placeholder` এমন সব product fetch করে
2. প্রতিটা product এর `name` কে slugify করে (`Lancôme` → `lancome`)
3. `img/` folder এ ওই slug এর সাথে matching file খোঁজে
4. **Match পেলে:**
   - Sharp দিয়ে WebP convert করে (main: 1200px, thumb: 600px)
   - `src/uploads/<batchFolder>/` এ save করে
   - MongoDB তে `imageUrl` ও `thumbnailUrl` update করে
5. **Match না পেলে:** product কে `scripts/failed-product-images.json` এ লিখে রাখে

### Output
| File | Path |
|------|------|
| Main Image | `src/uploads/YYMMDD01/product_<slug>_<did>.webp` |
| Thumbnail | `src/uploads/YYMMDD01/product_<slug>_<did>_thumb.webp` |
| Failed List | `scripts/failed-product-images.json` |

---

## Script 2 — `uplaodImageFromJSON.js`

### কখন ব্যবহার করবে
Script 1 এ যেগুলো fail হয়েছে (বা আলাদা JSON list আছে), সেগুলোকে retry করার জন্য।

### Input JSON
`E:\AAAAA\failed_product_image.json` (backend এর parent folder এ):
```json
[
  { "did": "WC-12345", "name": "Lancôme Idôle EDP" },
  { "did": "WC-67890", "name": "Giorgio Armani Sì Passione EDP" }
]
```

### Run
```bash
node ./scripts/uplaodImageFromJSON.js
```

### কীভাবে কাজ করে
1. `failed_product_image.json` load করে
2. `img/` folder এর files read করে
3. প্রতিটা item এর `name` slugify করে — **accented chars normalize করে** (`ô→o`, `é→e`, `à→a`)
4. **Match পেলে:**
   - WebP convert করে
   - প্রতি 50টা product এ আলাদা batch subfolder তৈরি হয়
   - MongoDB তে `did` দিয়ে update করে
5. **এবারও fail হলে:** `failed_product_image.json` overwrite হয় (শুধু remaining failures)

### Batch Folder Logic
```
success 0–49   → src/uploads/YYMMDD01/
success 50–99  → src/uploads/YYMMDD02/
success 100–149 → src/uploads/YYMMDD03/
```

### Slugify — Special Character Handling
```js
// "Lancôme Idôle EDP" → "lancome-idole-edp"
// "Yves Saint Laurent L'Homme" → "yves-saint-laurent-l-homme"
text
  .normalize("NFD")              // ô → o + combining accent
  .replace(/[\u0300-\u036f]/g, "") // diacritical marks remove
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
```

**Image folder এর file নামও একইভাবে slugify হয়**, তাই দুই দিকেই accented হলেও match হবে।

---

## Script 3 — `set-placeHolder.js`

### কখন ব্যবহার করবে
`img/` folder এও image নেই এমন products — এগুলোর DB তে placeholder set করতে হবে যাতে frontend broken image না দেখায়।

### Input
`scripts/failed-product-images.json` (Script 1 এর output):
```json
[
  { "did": "abc123", "name": "Some Product" }
]
```

### Run
```bash
node ./scripts/set-placeHolder.js
```

### কী করে
`failed-product-images.json` এর প্রতিটা `did` দিয়ে MongoDB তে product খুঁজে:
```js
imageUrl    = "/uploads/product_placeholder.webp"
thumbnailUrl = "/uploads/product_placeholder.webp"
```

---

## Script 4 — `migrate-images-to-webp.js`

### কখন ব্যবহার করবে
পুরনো system থেকে migrate করার সময়। DB তে JPG/PNG path আছে, সেগুলো WebP তে convert করতে।

### Run
```bash
# Dry run — কী হবে দেখো, কিছু change হবে না
node ./scripts/migrate-images-to-webp.js --dry-run

# Actual run
node ./scripts/migrate-images-to-webp.js
```

### Image Sizes
| Type | Max Size | Quality |
|------|----------|---------|
| Main image | 800×800 | 82% |
| Thumbnail | 300×300 | 82% |

Report save হয়: `scripts/migrate-images-report.json`

---

## Step 3 — VPS এ Files Upload করা (scp)

Scripts run করার পরে `src/uploads/` এ converted WebP files থাকবে। এগুলো VPS এ copy করতে হবে।

### ⚠️ Important
এই command **local Windows PowerShell** থেকে run করতে হবে।  
VPS এর SSH session এর ভেতর থেকে না।

### Command
```powershell
scp -r E:\AAAAA\backend\src\uploads\* root@144.79.218.126:/var/www/uploads/
```

### First-Time Connection
```
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
```

### VPS এ Verify করো
```bash
ssh root@144.79.218.126
ls /var/www/uploads/
```

---

## Full Workflow — ধাপে ধাপে

```
1. img/ folder এ raw images রাখো
   └─ File name = product name এর slug (accents normalize করে)
   └─ Example: "Lancôme Idôle EDP" → "lancome-idole-edp.jpg"

2. Placeholder products এর জন্য run করো
   └─ node ./scripts/upload-productImg_fromFolder.js
   └─ Fail হলে → scripts/failed-product-images.json এ যাবে

3. Failed list থেকে retry করো
   └─ failed-product-images.json → E:\AAAAA\failed_product_image.json এ copy করো
   └─ node ./scripts/uplaodImageFromJSON.js
   └─ Fail হলে → failed_product_image.json updated হবে

4. VPS এ upload করো (local PowerShell থেকে)
   └─ scp -r E:\AAAAA\backend\src\uploads\* root@144.79.218.126:/var/www/uploads/

5. VPS এ verify করো
   └─ ssh root@144.79.218.126
   └─ ls /var/www/uploads/

6. ✅ FINAL STEP — placeholder set করো
   └─ node ./scripts/set-placeHolder.js
   └─ img folder এও image পাওয়া যায়নি এমন সব products এ
      imageUrl ও thumbnailUrl = /uploads/product_placeholder.webp set হবে
   └─ Frontend এ আর broken image দেখাবে না
```

---

## Common Errors & Solutions

| Error | কারণ | সমাধান |
|-------|------|--------|
| `Image folder not found` | `img/` folder নেই | `backend/img/` তৈরি করে images রাখো |
| `failed_product_image.json not found` | Wrong path | `E:\AAAAA\` তে রাখো (backend এর parent) |
| `Product not found in database for did` | `did` DB তে নেই | JSON এর `did` value check করো |
| Image slug match হচ্ছে না | File নাম ভুল | Product name slugify করে দেখো |
| scp permission denied | Wrong password | VPS root password confirm করো |
| `sharp` error | Dependencies নেই | `npm install` run করো |

---

## File Structure Reference

```
E:\AAAAA\
├── failed_product_image.json          ← uplaodImageFromJSON.js এর input (JSON retry list)
└── backend\
    ├── img\                           ← Raw source images রাখার জায়গা
    │   ├── lancome-idole-edp.jpg
    │   └── giorgio-armani-si.jpg
    ├── src\
    │   └── uploads\                   ← Converted WebP output (VPS এ upload করতে হবে)
    │       ├── product_placeholder.webp
    │       ├── 26080101\
    │       │   ├── product_lancome-idole-edp_abc123.webp
    │       │   └── thumb_lancome-idole-edp_abc123.webp
    │       └── 26080102\
    │           └── ...
    └── scripts\
        ├── upload-productImg_fromFolder.js   ← Step 1 (placeholder থেকে)
        ├── uplaodImageFromJSON.js            ← Step 2 (JSON retry)
        ├── set-placeHolder.js               ← Step 3 (placeholder force set)
        ├── migrate-images-to-webp.js        ← Migration (legacy)
        └── failed-product-images.json       ← Failure log (auto-generated)
```
