import { getMySQLPool } from "../database/mysql.js";

/**
 * Product Model - handles all database queries for products
 */

const getTableNames = (prefix = "wp_") => {
  return {
    posts: `\`${prefix}posts\``,
    postmeta: `\`${prefix}postmeta\``,
    terms: `\`${prefix}terms\``,
    termTaxonomy: `\`${prefix}term_taxonomy\``,
    termRelationships: `\`${prefix}term_relationships\``,
  };
};

/**
 * Build WHERE clauses and params for product filtering
 */
const buildProductWhereClause = (filters, tableNames) => {
  const whereClauses = ["p.post_type = 'product'", "p.post_status = 'publish'"];
  const params = [];

  const { q, category, brand } = filters;

  if (q) {
    whereClauses.push("(p.post_title LIKE ? OR p.post_excerpt LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  if (category) {
    whereClauses.push(`p.ID IN (
      SELECT tr.object_id
      FROM ${tableNames.termRelationships} tr
      INNER JOIN ${tableNames.termTaxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
      INNER JOIN ${tableNames.terms} t ON t.term_id = tt.term_id
      WHERE tt.taxonomy = 'product_cat' AND t.slug = ?
    )`);
    params.push(category);
  }

  if (brand) {
    whereClauses.push(`p.ID IN (
      SELECT tr.object_id
      FROM ${tableNames.termRelationships} tr
      INNER JOIN ${tableNames.termTaxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
      INNER JOIN ${tableNames.terms} t ON t.term_id = tt.term_id
      WHERE tt.taxonomy = 'product_brand' AND t.slug = ?
    )`);
    params.push(brand);
  }

  return { whereClauses, params };
};

/**
 * Count total products matching filters
 */
export const countProducts = async (filters, prefix = "wp_") => {
  const pool = getMySQLPool();
  const tableNames = getTableNames(prefix);
  const { whereClauses, params } = buildProductWhereClause(filters, tableNames);

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM ${tableNames.posts} p
     LEFT JOIN ${tableNames.postmeta} price_meta ON price_meta.post_id = p.ID AND price_meta.meta_key = '_price'
     WHERE ${whereClauses.join(" AND ")}`,
    params,
  );

  return countRows[0]?.total ?? 0;
};

/**
 * Get product list with pagination and filters
 */
export const getProductList = async (filters, pagination, sortClause, prefix = "wp_") => {
  const pool = getMySQLPool();
  const tableNames = getTableNames(prefix);
  const { whereClauses, params } = buildProductWhereClause(filters, tableNames);
  const { skip, limit } = pagination;

  const [rows] = await pool.query(
    `SELECT p.ID, p.post_name, p.post_title, p.post_excerpt, p.post_status, p.post_date, p.post_type,
            (
              SELECT att.guid
              FROM ${tableNames.postmeta} pm
              LEFT JOIN ${tableNames.posts} att ON att.ID = pm.meta_value AND att.post_type = 'attachment'
              WHERE pm.post_id = p.ID AND pm.meta_key = '_thumbnail_id'
              LIMIT 1
            ) AS image_url,
            (
              SELECT COALESCE(price_meta.meta_value, '0') + 0
              FROM ${tableNames.postmeta} price_meta
              WHERE price_meta.post_id = p.ID AND price_meta.meta_key = '_price'
              ORDER BY price_meta.meta_id DESC
              LIMIT 1
            ) AS price
     FROM ${tableNames.posts} p
     WHERE ${whereClauses.join(" AND ")}
     ORDER BY ${sortClause}
     LIMIT ? OFFSET ?`,
    [...params, limit, skip],
  );

  return rows;
};

/**
 * Get single product by ID or slug
 */
export const getProductById = async (identifier, prefix = "wp_") => {
  const pool = getMySQLPool();
  const tableNames = getTableNames(prefix);

  const [rows] = await pool.query(
    `SELECT p.ID, p.post_name, p.post_title, p.post_excerpt, p.post_status, p.post_date, p.post_type,
            (
              SELECT att.guid
              FROM ${tableNames.postmeta} pm
              LEFT JOIN ${tableNames.posts} att ON att.ID = pm.meta_value AND att.post_type = 'attachment'
              WHERE pm.post_id = p.ID AND pm.meta_key = '_thumbnail_id'
              LIMIT 1
            ) AS image_url,
            (
              SELECT COALESCE(price_meta.meta_value, '0') + 0
              FROM ${tableNames.postmeta} price_meta
              WHERE price_meta.post_id = p.ID AND price_meta.meta_key = '_price'
              ORDER BY price_meta.meta_id DESC
              LIMIT 1
            ) AS price
     FROM ${tableNames.posts} p
     WHERE p.post_type = 'product' AND (p.post_name = ? OR p.ID = ?)
     LIMIT 1`,
    [identifier, Number(identifier) || 0],
  );

  return rows[0] || null;
};

/**
 * Get product variations (child products)
 */
export const getProductVariations = async (productId, prefix = "wp_") => {
  const pool = getMySQLPool();
  const tableNames = getTableNames(prefix);

  const [rows] = await pool.query(
    `SELECT v.ID, v.post_name, v.post_title,
            COALESCE(var_price.meta_value, '0') + 0 AS price,
            var_stock.meta_value AS stock_status
     FROM ${tableNames.posts} v
     LEFT JOIN ${tableNames.postmeta} var_price ON var_price.post_id = v.ID AND var_price.meta_key = '_price'
     LEFT JOIN ${tableNames.postmeta} var_stock ON var_stock.post_id = v.ID AND var_stock.meta_key = '_stock_status'
     WHERE v.post_type = 'product_variation' AND v.post_parent = ?`,
    [productId],
  );

  return rows;
};

/**
 * Get categories and brands for product(s)
 */
export const getProductTaxonomies = async (productIds, prefix = "wp_") => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return {};
  }

  const pool = getMySQLPool();
  const tableNames = getTableNames(prefix);

  const [taxonomyRows] = await pool.query(
    `SELECT tr.object_id, tt.taxonomy, t.term_id, t.name, t.slug
     FROM ${tableNames.termRelationships} tr
     INNER JOIN ${tableNames.termTaxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
     INNER JOIN ${tableNames.terms} t ON t.term_id = tt.term_id
     WHERE tr.object_id IN (?) AND tt.taxonomy IN ('product_cat', 'product_brand')`,
    [productIds],
  );

  // Build map: { productId: { categories: [], brands: [] } }
  const taxMap = {};
  taxonomyRows.forEach((tax) => {
    if (!taxMap[tax.object_id]) {
      taxMap[tax.object_id] = { categories: [], brands: [] };
    }
    const item = { id: tax.term_id, name: tax.name, slug: tax.slug };
    if (tax.taxonomy === 'product_cat') {
      taxMap[tax.object_id].categories.push(item);
    } else if (tax.taxonomy === 'product_brand') {
      taxMap[tax.object_id].brands.push(item);
    }
  });

  return taxMap;
};

/**
 * Get product badges from postmeta
 */
export const getProductBadges = async (productIds, prefix = "wp_") => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return {};
  }

  const pool = getMySQLPool();
  const tableNames = getTableNames(prefix);

  const [badgeRows] = await pool.query(
    `SELECT post_id, meta_key, meta_value FROM ${tableNames.postmeta}
     WHERE post_id IN (?) AND meta_key IN ('_badge', 'cpbw_badge', '_product_badge')`,
    [productIds],
  );

  // Build map: { productId: badgeObject }
  const badgeMap = {};
  badgeRows.forEach((badge) => {
    if (!badgeMap[badge.post_id]) {
      try {
        badgeMap[badge.post_id] = JSON.parse(badge.meta_value);
      } catch {
        badgeMap[badge.post_id] = { value: badge.meta_value, key: badge.meta_key };
      }
    }
  });

  return badgeMap;
};

/**
 * Get single product's taxonomies and badges
 */
export const getProductTaxonomiesAndBadges = async (productId, prefix = "wp_") => {
  const pool = getMySQLPool();
  const tableNames = getTableNames(prefix);

  // Fetch taxonomies
  const [taxonomyRows] = await pool.query(
    `SELECT tr.object_id, tt.taxonomy, t.term_id, t.name, t.slug
     FROM ${tableNames.termRelationships} tr
     INNER JOIN ${tableNames.termTaxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
     INNER JOIN ${tableNames.terms} t ON t.term_id = tt.term_id
     WHERE tr.object_id = ? AND tt.taxonomy IN ('product_cat', 'product_brand')`,
    [productId],
  );

  const categories = [];
  const brands = [];
  taxonomyRows.forEach((tax) => {
    const item = { id: tax.term_id, name: tax.name, slug: tax.slug };
    if (tax.taxonomy === 'product_cat') {
      categories.push(item);
    } else if (tax.taxonomy === 'product_brand') {
      brands.push(item);
    }
  });

  // Fetch badge
  const [badgeRows] = await pool.query(
    `SELECT meta_key, meta_value FROM ${tableNames.postmeta}
     WHERE post_id = ? AND meta_key IN ('_badge', 'cpbw_badge', '_product_badge')`,
    [productId],
  );

  let badge = null;
  if (badgeRows.length > 0) {
    try {
      badge = JSON.parse(badgeRows[0].meta_value);
    } catch {
      badge = { value: badgeRows[0].meta_value, key: badgeRows[0].meta_key };
    }
  }

  return { categories, brands, badge };
};
