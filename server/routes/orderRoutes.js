import express from 'express';
import { 
  placeOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus,
  cancelOrder,
  getOrderSummary
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post('/', placeOrder);
router.get('/', getUserOrders);
router.get('/summary', getOrderSummary);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.put('/:id/status', authorize(['admin']), updateOrderStatus);

export default router;