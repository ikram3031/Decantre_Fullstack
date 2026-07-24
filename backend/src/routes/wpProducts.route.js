import { Router } from "express";
import { listProducts, getProduct } from "../controllers/wpProducts.js";

const wpProductsRouter = Router();

// GET /api/wp/products - List all products with filtering and pagination
wpProductsRouter.get("/", listProducts);

// GET /api/wp/products/:identifier - Get single product by ID or slug
wpProductsRouter.get("/:identifier", getProduct);

export default wpProductsRouter;
