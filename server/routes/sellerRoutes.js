import express from 'express';
import {
  getSellerProfile,
  updateSellerProfile,
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getMyOrders,
  updateOrderStatus,
  getSalesSummary,
  getDashboard
} from '../controllers/sellerController.js';
import { authenticate, authorize, checkOwnership } from '../middlewares/auth.js';
import { uploadFields } from '../middlewares/upload.js';

const router = express.Router();

// All seller routes require authentication and seller role
router.use(authenticate, authorize(['seller']));

// ===== PROFILE ROUTES =====
router.get('/profile', getSellerProfile);
router.put('/profile', updateSellerProfile);

// ===== PRODUCT ROUTES =====
router.post('/products', uploadFields, createProduct);
router.get('/products', getMyProducts);
router.put('/products/:id', checkOwnership('product'), updateProduct);
router.delete('/products/:id', checkOwnership('product'), deleteProduct);

// ===== ORDER ROUTES =====
router.get('/orders', getMyOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

// ===== ANALYTICS ROUTES =====
router.get('/summary', getSalesSummary);
router.get('/dashboard', getDashboard);

export default router;