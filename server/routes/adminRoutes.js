import express from 'express';
import {
  // Dashboard
  getDashboardStats,
  // User Management
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  // Product Management
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  // Brand Management
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  // Category Management
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Order Management
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  // Review Management
  getAllReviews,
  deleteReview,
  // Payment Management
  getAllPayments,
  updatePaymentStatus,
  processRefund,
  // Seller Management
  getAllSellers,
  getSellerById,
  approveSeller,
  suspendSeller,
  deleteSeller
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, authorize(['admin']));

// ===== DASHBOARD ROUTES =====
router.get('/dashboard', getDashboardStats);

// ===== USER MANAGEMENT ROUTES =====
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);

// ===== PRODUCT MANAGEMENT ROUTES =====
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ===== BRAND MANAGEMENT ROUTES =====
router.get('/brands', getBrands);
router.post('/brands', createBrand);
router.put('/brands/:id', updateBrand);
router.delete('/brands/:id', deleteBrand);

// ===== CATEGORY MANAGEMENT ROUTES =====
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ===== ORDER MANAGEMENT ROUTES =====
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

// ===== REVIEW MANAGEMENT ROUTES =====
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// ===== PAYMENT MANAGEMENT ROUTES =====
router.get('/payments', getAllPayments);
router.put('/payments/:id/status', updatePaymentStatus);
router.post('/payments/:id/refund', processRefund);

// ===== SELLER MANAGEMENT ROUTES =====
router.get('/sellers', getAllSellers);
router.get('/sellers/:id', getSellerById);
router.put('/sellers/:id/approve', approveSeller);
router.put('/sellers/:id/suspend', suspendSeller);
router.delete('/sellers/:id', deleteSeller);

export default router;