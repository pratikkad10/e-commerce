import express from 'express';
import { testEmailConnection } from '../utils/testEmail.js';
import { sendTestEmailEthereal } from '../utils/testEmailEthereal.js';
import { createRazorpayOrder as createRzpOrder, verifyPaymentSignature } from '../utils/paymentGateway.js';
import { sendResponse, sendError } from '../utils/response.js';

const router = express.Router();

router.get('/email', async (req, res) => {
  try {
    const result = await testEmailConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/email-ethereal', async (req, res) => {
  try {
    const result = await sendTestEmailEthereal();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Razorpay integration
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { amount = 100 } = req.body;
    
    const result = await createRzpOrder(amount, 'INR', `test_${Date.now()}`);
    
    if (result.success) {
      sendResponse(res, 200, 'Test Razorpay order created', {
        orderId: result.order.id,
        amount: result.order.amount,
        currency: result.order.currency,
        key: process.env.RAZORPAY_KEY_ID
      });
    } else {
      sendError(res, 500, `Failed to create test order: ${result.error}`);
    }
  } catch (error) {
    console.error('Test Razorpay order error:', error);
    sendError(res, 500, 'Test failed');
  }
});

// Test payment signature verification
router.post('/razorpay/verify-signature', (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    
    if (!orderId || !paymentId || !signature) {
      return sendError(res, 400, 'Missing required fields');
    }
    
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    
    sendResponse(res, 200, 'Signature verification test completed', {
      isValid,
      orderId,
      paymentId
    });
  } catch (error) {
    console.error('Test signature verification error:', error);
    sendError(res, 500, 'Test failed');
  }
});

export default router;