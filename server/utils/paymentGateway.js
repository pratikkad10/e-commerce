import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance with API credentials
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in smallest currency unit (paise for INR)
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Unique receipt ID
 * @returns {Promise<Object>} Razorpay order object
 */
export const createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise (smallest unit)
      currency,
      receipt,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpayInstance.orders.create(options);
    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} razorpayOrderId - Order ID from Razorpay
 * @param {string} razorpayPaymentId - Payment ID from Razorpay
 * @param {string} razorpaySignature - Signature from Razorpay
 * @returns {boolean} True if signature is valid
 */
export const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    // Create expected signature using HMAC SHA256
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Compare signatures
    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

/**
 * Verify webhook signature from Razorpay
 * @param {string} body - Raw webhook body
 * @param {string} signature - Webhook signature from headers
 * @returns {boolean} True if webhook is authentic
 */
export const verifyWebhookSignature = (body, signature) => {
  try {
    // If no webhook secret is configured, skip verification (for development)
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.warn('Webhook secret not configured - skipping signature verification');
      return true;
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
};

/**
 * Get payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return {
      success: true,
      payment,
    };
  } catch (error) {
    console.error('Failed to fetch payment details:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Create refund for a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in smallest currency unit
 * @returns {Promise<Object>} Refund details
 */
export const createRefund = async (paymentId, amount) => {
  try {
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // Convert to paise
    });
    
    return {
      success: true,
      refund,
    };
  } catch (error) {
    console.error('Refund creation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};