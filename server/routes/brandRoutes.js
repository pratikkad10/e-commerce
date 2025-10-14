import express from 'express';
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand
} from '../controllers/brandController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllBrands);
router.get('/:id', getBrandById);

// Admin-only routes
router.post('/', authenticate, authorize(['admin']), createBrand);
router.put('/:id', authenticate, authorize(['admin']), updateBrand);
router.delete('/:id', authenticate, authorize(['admin']), deleteBrand);

export default router;