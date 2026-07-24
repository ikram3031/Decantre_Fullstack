import {
  countProducts,
  getProductList,
  getProductById,
  getProductVariations,
  getProductTaxonomies,
  getProductBadges,
  getProductTaxonomiesAndBadges,
} from "../models/wpProducts.model.js";
import { formatProduct, getSortClause } from "../utils/productFormatter.js";

/**
 * Product Controller - handles business logic for product routes
 */

/**
 * List products with filters and pagination
 */
export const listProducts = async (req, res, next) => {
  try {
    // Parse query parameters
    const skip = Math.max(0, parseInt(req.query.skip || "0", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "10", 10)));
    const q = (req.query.q || "").trim();
    const sortBy = (req.query.sortBy || "date_added").toLowerCase();
    const sortOrder = (req.query.sortOrder || "desc").toLowerCase();
    const category = (req.query.category || "").trim();
    const brand = (req.query.brand || "").trim();

    const prefix = req.app.get("wpTablePrefix") || "wp_";

    // Build filters object
    const filters = { q, category, brand };
    const pagination = { skip, limit };

    // Get sort clause
    const sortClause = getSortClause(sortBy, sortOrder);

    // Count total products
    const total = await countProducts(filters, prefix);

    // Get product list
    const rows = await getProductList(filters, pagination, sortClause, prefix);

    // Batch-fetch taxonomies and badges
    const productIds = rows.map((r) => r.ID);
    const [taxMap, badgeMap] = await Promise.all([
      getProductTaxonomies(productIds, prefix),
      getProductBadges(productIds, prefix),
    ]);

    // Attach taxonomies and badges to rows
    rows.forEach((row) => {
      row.categories = taxMap[row.ID]?.categories || [];
      row.brands = taxMap[row.ID]?.brands || [];
      row.badge = badgeMap[row.ID] || null;
    });

    // Fetch variations for each product
    const products = await Promise.all(
      rows.map(async (row) => {
        const variations = await getProductVariations(row.ID, prefix);
        return formatProduct({ ...row, variations });
      }),
    );

    // Send response
    res.json({
      data: products,
      meta: {
        total,
        skip,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single product by ID or slug
 */
export const getProduct = async (req, res, next) => {
  try {
    const identifier = req.params.identifier;
    const prefix = req.app.get("wpTablePrefix") || "wp_";

    // Fetch product
    const product = await getProductById(identifier, prefix);

    if (!product) {
      res.status(404).json({ status: "error", message: "Product not found" });
      return;
    }

    // Fetch taxonomies, badges, and variations in parallel
    const [{ categories, brands, badge }, variations] = await Promise.all([
      getProductTaxonomiesAndBadges(product.ID, prefix),
      getProductVariations(product.ID, prefix),
    ]);

    // Format and send response
    const formattedProduct = formatProduct({
      ...product,
      variations,
      categories,
      brands,
      badge,
    });

    res.json({ data: formattedProduct });
  } catch (err) {
    next(err);
  }
};
