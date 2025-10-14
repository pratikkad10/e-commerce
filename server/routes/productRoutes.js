import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByBrand,
  getProductsByCategory
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/brand/:brandId', getProductsByBrand);
router.get('/category/:categoryId', getProductsByCategory);

// Admin and Seller routes
router.post('/', authenticate, authorize(['admin', 'seller']), createProduct);
router.put('/:id', authenticate, authorize(['admin', 'seller']), updateProduct);
router.delete('/:id', authenticate, authorize(['admin', 'seller']), deleteProduct);

export default router;