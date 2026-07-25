// src/routes/BrandRoute.js
import express from 'express';
import { getBrands } from '../controllers/BrandController.js';

const router = express.Router();

// GET /api/v1/brands
router.get('/', getBrands);

export default router;
