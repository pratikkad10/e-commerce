import express from 'express';
import { 
  createPayment, 
  getPaymentById, 
  getUserPayments, 
  updatePaymentStatus,
  processRefund,
  getPaymentSummary,
  handleWebhook,
  createPaymentOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  processRazorpayRefund
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Webhook routes (no authentication required)
router.post('/webhook', handleWebhook);
router.post('/razorpay/webhook', handleRazorpayWebhook);

// Authenticated routes
router.use(authenticate);

// Razorpay payment routes
router.post('/razorpay/create-order', createPaymentOrder);
router.post('/razorpay/verify-payment', verifyRazorpayPayment);
router.post('/razorpay/refund/:orderId', processRazorpayRefund);

// Legacy payment routes
router.post('/', createPayment);
router.get('/', getUserPayments);
router.get('/summary', getPaymentSummary);
router.get('/:id', getPaymentById);

// Admin routes
router.put('/:id/status', authorize(['admin']), updatePaymentStatus);
router.post('/:id/refund', authorize(['admin']), processRefund);

export default router;