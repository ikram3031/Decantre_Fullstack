// src/routes/BrandRoute.js
import express from 'express';
import { 
  getBrands, 
  createBrand, 
  updateBrand, 
  deleteBrand 
} from '../controllers/BrandController.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/v1/brands
router.get('/', getBrands);

// POST /api/v1/brands
router.post('/', authenticateToken, createBrand);

// PUT /api/v1/brands/:id
router.put('/:id', authenticateToken, updateBrand);

// DELETE /api/v1/brands/:id
router.delete('/:id', authenticateToken, deleteBrand);

export default router;
