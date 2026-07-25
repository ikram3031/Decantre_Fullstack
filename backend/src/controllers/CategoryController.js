/**
 * src/controllers/CategoryController.js
 *
 * Simple DAO‑style controller for the Category model.
 * Provides endpoints to list all categories and fetch a single category by ID.
 */

import { CategoryModel } from "../models/category.model.js";
import { logger } from "../config/logger.js";

/**
 * GET /api/v1/categories
 * Returns an array of all categories (populated with parent reference).
 */
export async function getAllCategories(req, res) {
  try {
    const categories = await CategoryModel.find()
      .populate({ path: "parent", select: "name slug" })
      .lean();
    res.json({ status: "success", data: categories });
  } catch (err) {
    logger.error({ err }, "Failed to fetch categories");
    res.status(500).json({ status: "error", message: "Unable to fetch categories" });
  }
}

/**
 * GET /api/v1/categories/:id
 * Returns a single category by its MongoDB ObjectId.
 */
export async function getCategoryById(req, res) {
  const { id } = req.params;
  try {
    const category = await CategoryModel.findById(id)
      .populate({ path: "parent", select: "name slug" })
      .lean();
    if (!category) {
      return res.status(404).json({ status: "error", message: "Category not found" });
    }
    res.json({ status: "success", data: category });
  } catch (err) {
    logger.error({ err }, "Failed to fetch category by id");
    res.status(500).json({ status: "error", message: "Unable to fetch category" });
  }
}
