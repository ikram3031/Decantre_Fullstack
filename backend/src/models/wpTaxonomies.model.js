import { getMySQLPool } from "../database/mysql.js";

/**
 * Taxonomies Model - handles all database queries for categories and brands
 */

const getTableNames = (prefix = "wp_") => {
  return {
    terms: `\`${prefix}terms\``,
    termTaxonomy: `\`${prefix}term_taxonomy\``,
    termRelationships: `\`${prefix}term_relationships\``,
    posts: `\`${prefix}posts\``,
  };
};

const buildXstoreBrands = (searchQuery = "") => {
  const normalizedQuery = (searchQuery || "").trim().toLowerCase();
  const brands = [
    { name: "Azzaro", slug: "azzaro" },
    { name: "Bvlgari", slug: "bvlgari" },
    { name: "Chanel", slug: "chanel" },
    { name: "CK", slug: "ck" },
    { name: "Dior", slug: "dior" },
    { name: "Dolce & Gabbana", slug: "dolce-gabbana" },
    { name: "Gucci", slug: "gucci" },
    { name: "Hermès", slug: "hermes" },
    { name: "Jean Paul Gaultier", slug: "jean-paul-gaultier" },
    { name: "Montblanc", slug: "montblanc" },
    { name: "Prada", slug: "prada" },
    { name: "Versace", slug: "versace" },
    { name: "YSL", slug: "ysl" },
  ];

  return brands
    .filter((brand) => {
      if (!normalizedQuery) return true;
      return [brand.name, brand.slug].some((value) => value.toLowerCase().includes(normalizedQuery));
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    .map((brand) => ({
      id: brand.slug,
      name: brand.name,
      slug: brand.slug,
      product_count: 0,
    }));
};

const allowedCategories = [
  { id: "designer-brands", name: "Designer Brands", slug: "designer-brands" },
  { id: "for-her", name: "For Her", slug: "for-her" },
  { id: "for-him", name: "For Him", slug: "for-him" },
  { id: "niche", name: "Niche", slug: "niche" },
  { id: "uae-arabian-brands", name: "UAE & Arabian Brands", slug: "uae-arabian-brands" },
  { id: "unisex", name: "Unisex", slug: "unisex" },
];

export const buildAllowedCategories = (searchQuery = "") => {
  const normalizedQuery = (searchQuery || "").trim().toLowerCase();

  return allowedCategories
    .filter((category) => {
      if (!normalizedQuery) return true;
      return [category.name, category.slug].some((value) => value.toLowerCase().includes(normalizedQuery));
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      product_count: 0,
    }));
};

/**
 * Count categories matching search query
 */
export const countCategories = async (searchQuery, prefix = "wp_") => {
  return buildAllowedCategories(searchQuery).length;
};

/**
 * Get categories list with product count and pagination
 */
export const getCategoriesList = async (searchQuery, pagination, prefix = "wp_") => {
  const { skip = 0, limit = 10 } = pagination || {};
  const categories = buildAllowedCategories(searchQuery);

  return categories.slice(skip, skip + limit);
};

/**
 * Count brands matching search query
 */
export const countBrands = async (searchQuery, prefix = "wp_") => {
  try {
    const pool = getMySQLPool();
    const tableNames = getTableNames(prefix);

    let whereClause = "tt.taxonomy = 'product_brand'";
    const params = [];

    if (searchQuery) {
      whereClause += " AND (t.name LIKE ? OR t.slug LIKE ?)";
      params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(DISTINCT t.term_id) AS total
       FROM ${tableNames.terms} t
       INNER JOIN ${tableNames.termTaxonomy} tt ON tt.term_id = t.term_id
       WHERE ${whereClause}`,
      params,
    );

    const total = Number(countRows[0]?.total ?? 0);
    if (total > 0) return total;
  } catch {
    // fall back to the imported Xstore brand list when WordPress taxonomy data is unavailable
  }

  return buildXstoreBrands(searchQuery).length;
};

/**
 * Get brands list with product count and pagination
 */
export const getBrandsList = async (searchQuery, pagination, prefix = "wp_") => {
  const { skip = 0, limit = 10 } = pagination || {};

  try {
    const pool = getMySQLPool();
    const tableNames = getTableNames(prefix);

    let whereClause = "tt.taxonomy = 'product_brand'";
    const params = [];

    if (searchQuery) {
      whereClause += " AND (t.name LIKE ? OR t.slug LIKE ?)";
      params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    const [rows] = await pool.query(
      `SELECT t.term_id AS id, t.name, t.slug,
              COUNT(DISTINCT tr.object_id) AS product_count
       FROM ${tableNames.terms} t
       INNER JOIN ${tableNames.termTaxonomy} tt ON tt.term_id = t.term_id
       LEFT JOIN ${tableNames.termRelationships} tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
       LEFT JOIN ${tableNames.posts} p ON p.ID = tr.object_id AND p.post_type = 'product' AND p.post_status = 'publish'
       WHERE ${whereClause}
       GROUP BY t.term_id, t.name, t.slug
       ORDER BY t.name ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, skip],
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return rows;
    }
  } catch {
    // fall back to the imported Xstore brand list when WordPress taxonomy data is unavailable
  }

  return buildXstoreBrands(searchQuery).slice(skip, skip + limit);
};
