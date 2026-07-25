import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { ProductModel } from '../src/models/product.model.js';
import { CategoryModel } from '../src/models/category.model.js';
import { BrandModel } from '../src/models/brand.model.js';

// Load environment variables
dotenv.config();

// Paths to your CSV exports
const DB_DIR = path.resolve('wp_db');
const POSTS_CSV = path.join(DB_DIR, 'u470989906_XxMKn_table_wp_posts.csv');
const POSTMETA_CSV = path.join(DB_DIR, 'u470989906_XxMKn_table_wp_postmeta.csv');
const TERMS_CSV = path.join(DB_DIR, 'u470989906_XxMKn_table_wp_terms.csv');
const TAXONOMY_CSV = path.join(DB_DIR, 'u470989906_XxMKn_table_wp_term_taxonomy.csv');
const RELATIONSHIPS_CSV = path.join(DB_DIR, 'u470989906_XxMKn_table_wp_term_relationships.csv');

async function connect() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/decantre';
  await mongoose.connect(mongoUri);
  console.log('🔗 Connected to MongoDB');
}

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filename = path.basename(filePath);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      return resolve([]);
    }
    console.log(`📖 Reading ${filename}...`);
    let count = 0;
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
        count++;
        if (count % 50000 === 0) {
          console.log(`   Processed ${count} rows from ${filename}...`);
        }
      })
      .on('end', () => {
        console.log(`✅ Loaded ${count} rows from ${filename}.`);
        resolve(results);
      })
      .on('error', (err) => reject(err));
  });
}

// Safely parse string/undefined to number to prevent Mongoose validation crashes (NaN values)
function safeParseNumber(val, defaultVal = 0) {
  if (val === undefined || val === null || val === '') return defaultVal;
  const num = Number(val);
  return isNaN(num) ? defaultVal : num;
}

// Helper to convert, resize and route image
const UPLOADS_PRODUCTS = path.resolve('uploads', 'products');
const UPLOADS_GALLERY = path.resolve('uploads', 'product-gallery');
const UPLOADS_THUMBNAILS = path.resolve('uploads', 'products', 'thumbnails');

// Ensure directories exist
[UPLOADS_PRODUCTS, UPLOADS_GALLERY, UPLOADS_THUMBNAILS].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function processProductImage(originalRelPath, type = 'product') {
  if (!originalRelPath) return { main: '', thumbnail: '' };
  
  const cleanPath = originalRelPath.startsWith('/') ? originalRelPath.substring(1) : originalRelPath;
  const absoluteSource = path.resolve(cleanPath);

  if (!fs.existsSync(absoluteSource)) {
    // Return original path as fallback
    return { main: originalRelPath, thumbnail: originalRelPath };
  }

  const filename = path.basename(absoluteSource, path.extname(absoluteSource));
  const uniqueName = `${filename}-${Date.now()}.webp`;

  let destDir = UPLOADS_PRODUCTS;
  let dbPrefix = '/content/products/';

  if (type === 'gallery') {
    destDir = UPLOADS_GALLERY;
    dbPrefix = '/content/product-gallery/';
  }

  const destMainPath = path.join(destDir, uniqueName);
  const dbMainUrl = `${dbPrefix}${uniqueName}`;

  try {
    // 1. Process Main Image: Resize to max 1000x1000, convert to WebP
    await sharp(absoluteSource)
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(destMainPath);
  } catch (err) {
    console.error(`❌ Failed processing main image ${absoluteSource}:`, err.message);
    return { main: originalRelPath, thumbnail: '' };
  }

  // 2. Generate Thumbnail (only for primary product image)
  let dbThumbnailUrl = '';
  if (type === 'product') {
    const destThumbPath = path.join(UPLOADS_THUMBNAILS, uniqueName);
    dbThumbnailUrl = `/content/products/thumbnails/${uniqueName}`;
    try {
      await sharp(absoluteSource)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(destThumbPath);
    } catch (err) {
      console.error(`❌ Failed processing thumbnail for ${absoluteSource}:`, err.message);
    }
  }

  return { main: dbMainUrl, thumbnail: dbThumbnailUrl };
}

async function importProducts() {
  try {
    await connect();
    
    // 0. Preload MongoDB Categories and Brands for Object ID mapping
    const dbBrands = await BrandModel.find({}, '_id slug name').lean();
    const dbCategories = await CategoryModel.find({}, '_id slug name').lean();
    
    const brandDbMap = new Map();
    dbBrands.forEach(b => {
      brandDbMap.set(b.slug.toLowerCase(), b._id);
      brandDbMap.set(b.name.toLowerCase(), b._id);
    });

    const catDbMap = new Map();
    dbCategories.forEach(c => {
      catDbMap.set(c.slug.toLowerCase(), c._id);
      catDbMap.set(c.name.toLowerCase(), c._id);
    });

    console.log('⏳ Parsing wp_terms & taxonomies...');
    const terms = await parseCSV(TERMS_CSV);
    const taxonomies = await parseCSV(TAXONOMY_CSV);
    const relationships = await parseCSV(RELATIONSHIPS_CSV);

    const termMap = new Map();
    terms.forEach(t => termMap.set(t.term_id, { name: t.name, slug: t.slug }));

    const taxMap = new Map();
    taxonomies.forEach(tax => {
      const term = termMap.get(tax.term_id);
      if (term) {
        taxMap.set(tax.term_taxonomy_id, { taxonomy: tax.taxonomy, name: term.name, slug: term.slug });
      }
    });

    const productTaxonomyMap = new Map();
    relationships.forEach(rel => {
      const postId = rel.object_id;
      const tax = taxMap.get(rel.term_taxonomy_id);
      if (tax) {
        if (!productTaxonomyMap.has(postId)) {
          productTaxonomyMap.set(postId, { categories: [], brands: [], tags: [] });
        }
        const pTax = productTaxonomyMap.get(postId);
        if (tax.taxonomy === 'product_cat') pTax.categories.push(tax);
        else if (tax.taxonomy === 'product_brand' || tax.taxonomy === 'pwb-brand' || tax.taxonomy === 'brand') pTax.brands.push(tax);
        else if (tax.taxonomy === 'product_tag') pTax.tags.push(tax);
      }
    });

    console.log('⏳ Parsing wp_postmeta.csv (This might take a while)...');
    
    const postmeta = await parseCSV(POSTMETA_CSV);
    const attachmentMap = new Map();
    const productMetaMap = new Map();

    postmeta.forEach(row => {
      const postId = row.post_id;
      const key = row.meta_key;
      const value = row.meta_value;

      if (key === '_wp_attached_file') {
        attachmentMap.set(postId, value);
      } else {
        if (!productMetaMap.has(postId)) {
          productMetaMap.set(postId, {});
        }
        productMetaMap.get(postId)[key] = value;
      }
    });

    console.log('⏳ Parsing wp_posts.csv...');
    const posts = await parseCSV(POSTS_CSV);
    
    const variationsMap = new Map();
    const products = [];

    posts.forEach(post => {
      if (post.post_type === 'product_variation') {
        const parentId = post.post_parent;
        if (!variationsMap.has(parentId)) {
          variationsMap.set(parentId, []);
        }
        variationsMap.get(parentId).push(post);
      } else if (post.post_type === 'product' && post.post_status === 'publish') {
        products.push(post);
      }
    });

    console.log(`📦 Found ${products.length} products and ${variationsMap.size} products with variations.`);

    // 2. Format products & convert images
    console.log('⏳ Formatting products and processing images (webp, resizing, routing)...');
    const formattedProducts = [];
    let count = 0;

    for (const post of products) {
      count++;
      const postId = post.ID;
      const meta = productMetaMap.get(postId) || {};
      const taxInfo = productTaxonomyMap.get(postId) || { categories: [], brands: [], tags: [] };
      
      // Main Cover Image & Thumbnail
      let imageUrl = '/uploads/placeholder.jpg';
      let thumbnailUrl = '/uploads/placeholder.jpg';
      if (meta._thumbnail_id && attachmentMap.has(meta._thumbnail_id)) {
        const result = await processProductImage(`/uploads/${attachmentMap.get(meta._thumbnail_id)}`, 'product');
        imageUrl = result.main;
        thumbnailUrl = result.thumbnail;
      }

      // Gallery Images
      const images = [];
      if (meta._product_image_gallery) {
        const galleryIds = meta._product_image_gallery.split(',');
        for (const id of galleryIds) {
          if (attachmentMap.has(id)) {
            const result = await processProductImage(`/uploads/${attachmentMap.get(id)}`, 'gallery');
            images.push({
              url: result.main,
              sortOrder: images.length
            });
          }
        }
      }

      // Variations
      const wpVariations = variationsMap.get(postId) || [];
      const isVariant = wpVariations.length > 0;
      
      const variants = [];
      for (const variation of wpVariations) {
        const varMeta = productMetaMap.get(variation.ID) || {};
        let varImage = '';
        if (varMeta._thumbnail_id && attachmentMap.has(varMeta._thumbnail_id)) {
          const result = await processProductImage(`/uploads/${attachmentMap.get(varMeta._thumbnail_id)}`, 'product');
          varImage = result.main;
        }
        
        const sizeKey = Object.keys(varMeta).find(k => k.startsWith('attribute_'));
        const size = sizeKey ? varMeta[sizeKey] : 'Default';

        variants.push({
          size: size,
          price: safeParseNumber(varMeta._regular_price || varMeta._price || 0),
          offerPrice: varMeta._sale_price ? safeParseNumber(varMeta._sale_price) : null,
          stockQuantity: safeParseNumber(varMeta._stock || 0),
          sku: varMeta._sku || '',
          imageUrl: varImage
        });
      }

      const dummyAdminId = new mongoose.Types.ObjectId(); 
      
      const categoryIds = taxInfo.categories.map(c => catDbMap.get(c.slug.toLowerCase()) || catDbMap.get(c.name.toLowerCase())).filter(Boolean);
      
      let brandId = null;
      for (const b of taxInfo.brands) {
        const matched = brandDbMap.get(b.slug.toLowerCase()) || brandDbMap.get(b.name.toLowerCase());
        if (matched) {
          brandId = matched;
          break;
        }
      }
      const tags = taxInfo.tags.map(t => t.name);

      const productData = {
        name: post.post_title,
        slug: post.post_name || `product-${postId}`,
        description: post.post_content || post.post_excerpt || 'No description',
        type: isVariant ? 'variant' : 'simple',
        price: safeParseNumber(meta._regular_price || meta._price || 0),
        offerPrice: meta._sale_price ? safeParseNumber(meta._sale_price) : null,
        stockQuantity: safeParseNumber(meta._stock || 0),
        sku: meta._sku || '',
        imageUrl: imageUrl,
        thumbnailUrl: thumbnailUrl,
        images: images,
        variants: variants,
        categories: categoryIds,
        brand: brandId,
        tags: tags,
        createdBy: dummyAdminId 
      };

      try {
        // Upsert by slug so we can safely re-run the import without duplicate key errors
        await ProductModel.findOneAndUpdate(
          { slug: productData.slug },
          productData,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`[${count}/${products.length}] products imported: "${productData.name}"`);
      } catch (dbErr) {
        console.error(`❌ [${count}/${products.length}] Failed to save product "${productData.name}" to DB:`, dbErr.message);
      }
    }

    console.log(`\n🎉 Bulk import complete! Total processed: ${products.length} products.`);
    
  } catch (err) {
    console.error('❌ Import failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

importProducts();
