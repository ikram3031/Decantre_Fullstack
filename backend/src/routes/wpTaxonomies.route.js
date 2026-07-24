import { Router } from "express";
import { listCategories, listBrands } from "../controllers/wpTaxonomies.js";

const wpTaxonomiesRouter = Router();

// GET /api/wp/taxonomies/categories - List all categories with product count
wpTaxonomiesRouter.get("/categories", listCategories);

// GET /api/wp/taxonomies/brands - List all brands with product count
wpTaxonomiesRouter.get("/brands", listBrands);

export default wpTaxonomiesRouter;
