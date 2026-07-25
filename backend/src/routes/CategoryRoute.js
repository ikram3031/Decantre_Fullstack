import express from "express";
import { getAllCategories, getCategoryById } from "../controllers/CategoryController.js";

const router = express.Router();

// GET /api/v1/categories -> list all categories
router.get("/", getAllCategories);

// GET /api/v1/categories/:id -> get single category by ObjectId
router.get("/:id", getCategoryById);

export default router;
