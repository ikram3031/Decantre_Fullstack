import { Router } from "express";
import { getProduct, listProducts } from "../controllers/ProductsController.js";

const productsRouter = Router();

productsRouter.get("/", listProducts);
productsRouter.post("/", listProducts);
productsRouter.get("/:identifier", getProduct);

export default productsRouter;
