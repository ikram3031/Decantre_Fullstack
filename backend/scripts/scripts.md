# Scripts Documentation

> **Location:** `e:/AAAAAAA/backend/scripts/`
> All scripts use ES Modules (`import`/`export`) and require a `.env` file with `MONGODB_URI` and optionally `MONGODB_DB_NAME`.

---

## How to Run

```bash
node scripts/<script-name>.js
```

> Scripts must be run from the **project root** (`e:/AAAAAAA/backend/`), not from inside the `scripts/` folder.

---

## Scripts Overview

| Script | Purpose | Safe to Re-run? |
|--------|---------|-----------------|
| `reset-and-import-brands.js` | Brand collection পুরো মুছে নতুন করে import করে | ⚠️ Destructive |
| `import-doc-brands.js` | `docs/Brands.json` থেকে brands insert করে | ✅ Yes (skip duplicates) |
| `insert-static-categories.js` | Static 4টা category insert করে | ✅ Yes (upsert) |
| `delete-obsolete-categories.js` | পুরনো 3টা category মুছে দেয় | ✅ Yes (idempotent) |
| `update-products-brands-and-categories.js` | Products এ parent brand add করে, invalid category remove করে | ✅ Yes |
| `import-wp-db.js` | WordPress CSV export থেকে products import করে | ⚠️ One-time use |
| `debug-brands.js` | Brand map ও sample products DB তে দেখায় (read-only) | ✅ Read-only |
| `migrate-products-by-did.js` | *(Empty — reserved for future use)* | — |

---

## Script Details

---

### `reset-and-import-brands.js`

**কাজ:** Brand collection সম্পূর্ণ মুছে দিয়ে নতুনভাবে 3টা parent brand এবং তাদের sub-brands insert করে।

**⚠️ Warning:** `BrandModel.deleteMany({})` — সব brand data মুছে যাবে।

**Brand Structure:**
```
Niche (parent)
  └── Amouage, Byredo, Creed, INITIO PARFUMS PRIVÉS, Sospiro... (31 brands)

Designer Brands (parent)
  └── Chanel, Dior, Gucci, Tom Ford, Versace... (51 brands)

UAE & Arabian Brands (parent)
  └── Armaf, Lattafa, Swiss Arabian, Al Haramain... (16 brands)
```

**Run:**
```bash
node scripts/reset-and-import-brands.js
```

**Output Example:**
```
🔧 Connecting to MongoDB...
🧹 Clearing existing Brand documents...
📦 Inserting 98 sub-brands...
✅ Brand reset and import complete.
🔌 MongoDB disconnected.
```

---

### `import-doc-brands.js`

**কাজ:** `docs/Brands.json` ফাইল পড়ে BrandModel এ brands insert করে। Duplicate হলে skip করে।

**Source file:** `docs/Brands.json`

**Run:**
```bash
node scripts/import-doc-brands.js
```

**Output Example:**
```
📦 Loading Brands.json...
🏷️  Found 101 brands
🔗 Connecting to MongoDB...
✅ Brands → Imported: 101 | Skipped: 0
🔌 MongoDB disconnected.
```

---

### `insert-static-categories.js`

**কাজ:** নিচের 4টা static category upsert করে (থাকলে skip, না থাকলে insert):

| Category | Slug |
|----------|------|
| For Him | `for-him` |
| For Her | `for-her` |
| Unisex | `unisex` |
| Miniature | `miniature` |

**Run:**
```bash
node scripts/insert-static-categories.js
```

**Output Example:**
```
🔗 Connecting to MongoDB...
✅ Static categories – Inserted: 4, Already existed: 0
🔌 MongoDB disconnected.
```

---

### `delete-obsolete-categories.js`

**কাজ:** পুরনো 3টা category (যেগুলো এখন Brand হয়ে গেছে) products থেকে reference remove করে এবং category collection থেকে delete করে।

**Targets (hardcoded `_id`):**

| `_id` | Name |
|-------|------|
| `6a64742900d5281346d5387c` | Designer |
| `6a64742900d5281346d5387e` | Niche |
| `6a64742900d5281346d53881` | Arabian and UAE Brand |

**Run:**
```bash
node scripts/delete-obsolete-categories.js
```

**Output Example:**
```
🔧 Connecting to MongoDB...
✅ Found 3 obsolete category documents
✅ Removed obsolete category references from 254 products.
✅ Deleted 3 obsolete categories.
🔌 MongoDB disconnected.
```

---

### `update-products-brands-and-categories.js`

**কাজ:** সব product loop করে দুটো কাজ করে:

**Job 1 — Invalid categories remove:**
নিচের 3টা obsolete category ID product এর `categories` array থেকে বাদ দেয় (এগুলো এখন Brand হয়ে গেছে):

| `_id` | Name |
|-------|------|
| `6a64742900d5281346d5387c` | Designer |
| `6a64742900d5281346d5387e` | Niche |
| `6a64742900d5281346d53881` | Arabian and UAE Brand |

**Job 2 — Brand array build:**
Product এর `brand` field কে একটা `did` string array তে convert করে: `[sub-brand-did, parent-brand-did]`

Brand matching 3-step fallback:
1. Existing `did` string বা old ObjectId দিয়ে সরাসরি match
2. Hardcoded `OLD_ID_TO_BRAND_NAME` mapping (যেমন "Emporio Armani" → "Giorgio Armani")
3. Product name এ brand name substring check

**⚠️ Note:** Brand collection এ নেই এমন brands (Tommy Hilfiger, Ajmal, Gulf Orchid ইত্যাদি) unmatched থাকবে — সেগুলো `reset-and-import-brands.js` এ add করতে হবে।

**Run:**
```bash
node scripts/update-products-brands-and-categories.js
```

**Output Example:**
```
🔧 Connecting to MongoDB...
📦 Brands in DB: 102
🛒 Total products: 402

⏳ 402/402 | 🏷 brand: 390 | 🗑 cats: 0 | ❓ unmatched: 12

═══════════════════════════════════════════════════
🏷  Brand arrays updated:        390
🗑  Obsolete cats removed:        0
❓  Brand not matched (skipped):  12
═══════════════════════════════════════════════════
🔌 MongoDB disconnected.
```

---

### `import-wp-db.js`

**কাজ:** WordPress database CSV export থেকে products, categories, brands import করে। One-time migration script।

**Required files (in `wp_db/` folder):**
- `u470989906_XxMKn_table_wp_posts.csv`
- `u470989906_XxMKn_table_wp_postmeta.csv`
- `u470989906_XxMKn_table_wp_terms.csv`
- `u470989906_XxMKn_table_wp_term_taxonomy.csv`
- `u470989906_XxMKn_table_wp_term_relationships.csv`

**Dependencies:** `csv-parser`, `sharp`

**Run:**
```bash
node scripts/import-wp-db.js
```

> ⚠️ Only run this once during initial data migration. Running again may cause duplicates.

---

### `debug-brands.js`

**কাজ:** Read-only diagnostic script। DB তে কতগুলো brand আছে, তাদের parent কী, এবং sample products এর brand/categories কেমন দেখায় — সেটা console এ print করে।

**Run:**
```bash
node scripts/debug-brands.js
```

**Output Example:**
```
🔧 Connecting to MongoDB...

📦 Total brands in DB: 101

Brand Map:
  6a64c1ee... | name: Niche | parent: null
  6a64c1ee... | name: INITIO PARFUMS PRIVÉS | parent: 6a64c1ee...
  ...

🛒 Sample products:
  [Initio Atomic Rose]
    brand: 6a647ac600d5281346d53d25
    categories: ["6a64742900d5281346d53872","6a64742900d5281346d53875"]

🔌 Disconnected.
```

---

### `migrate-products-by-did.js`

**কাজ:** *(এখনো empty — future migration এর জন্য reserved)*

---

## Recommended Execution Order

Fresh setup বা brand/category restructure এর পরে এই order এ run করো:

```bash
# Step 1: Brand collection reset করো
node scripts/reset-and-import-brands.js

# Step 2: Static categories insert করো
node scripts/insert-static-categories.js

# Step 3: পুরনো obsolete categories delete করো
node scripts/delete-obsolete-categories.js

# Step 4: Products update করো (parent brand + invalid category cleanup)
node scripts/update-products-brands-and-categories.js

# (Optional) Debug করতে
node scripts/debug-brands.js
```
