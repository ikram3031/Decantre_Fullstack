import {
  countCategories,
  getCategoriesList,
  countBrands,
  getBrandsList,
} from "../models/wpTaxonomies.model.js";

/**
 * Taxonomies Controller - handles business logic for taxonomy routes
 */

/**
 * List categories with product count
 */
export const listCategories = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const skip = Math.max(0, parseInt(req.query.skip || "0", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "10", 10)));

    const prefix = req.app.get("wpTablePrefix") || "wp_";
    const pagination = { skip, limit };

    // Get total count
    const total = await countCategories(q, prefix);

    // Get categories list
    const data = await getCategoriesList(q, pagination, prefix);

    res.json({
      data,
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
 * List brands with product count
 */
export const listBrands = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const skip = Math.max(0, parseInt(req.query.skip || "0", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "10", 10)));

    const prefix = req.app.get("wpTablePrefix") || "wp_";
    const pagination = { skip, limit };

    // Get total count
    const total = await countBrands(q, prefix);

    // Get brands list
    const data = await getBrandsList(q, pagination, prefix);

    res.json({
      data,
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
