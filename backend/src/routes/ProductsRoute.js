import { Router } from "express";
import {
  getProduct,
  listProducts,
  checkSlugExists,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/ProductsController.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const productsRouter = Router();

productsRouter.post("/", listProducts);
productsRouter.post("/add-new", authenticateToken, authorizeRoles("Owner", "Admin", "Manager"), createProduct);
productsRouter.get("/check-slug/:slug", checkSlugExists);
productsRouter.get("/:identifier", getProduct);
productsRouter.put("/:id", authenticateToken, authorizeRoles("Owner", "Admin", "Manager"), updateProduct);
productsRouter.delete("/:id", authenticateToken, authorizeRoles("Owner", "Admin", "Manager"), deleteProduct);

export default productsRouter;
