import { Router } from "express";
import { 
  getProduct, 
  listProducts, 
  checkSlugExists, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "../controllers/ProductsController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const productsRouter = Router();

productsRouter.get("/", listProducts);
productsRouter.post("/", (req, res, next) => {
  if (req.body && req.body.name && req.body.slug) {
    // If it has name and slug, treat it as a product creation request
    return createProduct(req, res, next);
  }
  return listProducts(req, res, next);
});
productsRouter.get("/check-slug/:slug", checkSlugExists);
productsRouter.get("/:identifier", getProduct);
productsRouter.put("/:id", updateProduct);
productsRouter.delete("/:id", deleteProduct);

export default productsRouter;
