// src/controllers/BrandController.js
import { BrandModel } from "../models/brand.model.js";
import { logger } from "../config/logger.js";

/**
 * GET /api/v1/brands
 * Returns a paginated list of brands.
 * Query parameters:
 *   - skip (default 0): number of documents to skip
 *   - limit (default 10): maximum number of documents to return
 */
export const getBrands = async (req, res) => {
  const skip = parseInt(req.query.skip, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 10;
  try {
    const brands = await BrandModel.find()
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await BrandModel.countDocuments();
    res.json({ status: "success", data: brands, pagination: { skip, limit, total } });
  } catch (err) {
    logger.error({ err }, "Failed to fetch brands");
    res.status(500).json({ status: "error", message: "Unable to fetch brands" });
  }
}
