import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature, getPaymentDetails, createRefund } from '../utils/paymentGateway.js';
import { sendOrderConfirmation, sendOrderCancellation } from '../utils/emailEvents.js';
import { sendResponse, sendError } from '../utils/response.js';

// Generate unique receipt ID for Razorpay
const generateReceiptId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `receipt_${timestamp}_${random}`;
};

// Create Razorpay order (Step 1 of payment flow)
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return sendError(res, 400, 'Valid amount is required');
    }

    // Generate unique receipt
    const receipt = generateReceiptId();

    // Create Razorpay order
    const result = await createRazorpayOrder(amount, currency, receipt);
    
    if (!result.success) {
      return sendError(res, 500, `Failed to create payment order: ${result.error}`);
    }

    // Store order details temporarily (you might want to create a pending order)
    const orderData = {
      razorpayOrderId: result.order.id,
      amount: result.order.amount / 100, // Convert back to rupees
      currency: result.order.currency,
      receipt: result.order.receipt,
      userId,
      status: 'created'
    };

    sendResponse(res, 200, 'Razorpay order created successfully', {
      orderId: result.order.id,
      amount: result.order.amount,
      currency: result.order.currency,
      receipt: result.order.receipt,
      key: process.env.RAZORPAY_KEY_ID // Frontend needs this for payment
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    sendError(res, 500, 'Failed to create payment order');
  }
};

// Verify Razorpay payment (Step 2 of payment flow)
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId // Your internal order ID
    } = req.body;
    const userId = req.user._id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return sendError(res, 400, 'Missing required payment verification data');
    }

    // Verify signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return sendError(res, 400, 'Invalid payment signature');
    }

    // Get payment details from Razorpay
    const paymentResult = await getPaymentDetails(razorpay_payment_id);
    if (!paymentResult.success) {
      return sendError(res, 500, 'Failed to fetch payment details');
    }

    // Find and update the order
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Update order with payment details
    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = 'paid';
    order.paymentGateway = 'razorpay';
    order.transactionDate = new Date();
    order.paymentMethod = paymentResult.payment.method || 'card';
    
    await order.save();

    // Clear user's cart after successful payment
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      await cart.clear();
    }

    // Send order confirmation email
    await order.populate('user', 'firstName lastName email');
    sendOrderConfirmation(order.user, order).catch(err => 
      console.error('Order confirmation email failed:', err)
    );

    sendResponse(res, 200, 'Payment verified successfully', {
      orderId: order._id,
      paymentId: razorpay_payment_id,
      status: 'paid',
      amount: order.total
    });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    sendError(res, 500, 'Payment verification failed');
  }
};

// Handle Razorpay webhooks
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature (optional in development)
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValidWebhook = verifyWebhookSignature(body, signature);
      if (!isValidWebhook) {
        return sendError(res, 400, 'Invalid webhook signature');
      }
    } else {
      console.log('Webhook received (signature verification skipped)');
    }

    const { event, payload } = req.body;
    
    console.log('Razorpay Webhook Event:', event);
    console.log('Webhook Payload:', payload);

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
      case 'refund.processed':
        await handleRefundProcessed(payload.refund.entity);
        break;
      default:
        console.log('Unhandled webhook event:', event);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Handle payment captured webhook
const handlePaymentCaptured = async (payment) => {
  try {
    const order = await Order.findOne({ razorpayOrderId: payment.order_id });
    if (order) {
      order.paymentStatus = 'paid';
      order.transactionDate = new Date(payment.created_at * 1000);
      await order.save();
      console.log(`Payment captured for order: ${order._id}`);
    }
  } catch (error) {
    console.error('Handle payment captured error:', error);
  }
};

// Handle payment failed webhook
const handlePaymentFailed = async (payment) => {
  try {
    const order = await Order.findOne({ razorpayOrderId: payment.order_id });
    if (order) {
      order.paymentStatus = 'failed';
      await order.save();
      console.log(`Payment failed for order: ${order._id}`);
    }
  } catch (error) {
    console.error('Handle payment failed error:', error);
  }
};

// Handle refund processed webhook
const handleRefundProcessed = async (refund) => {
  try {
    const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
    if (order) {
      order.refundAmount = (order.refundAmount || 0) + (refund.amount / 100);
      if (order.refundAmount >= order.total) {
        order.paymentStatus = 'refunded';
        order.status = 'refunded';
      } else {
        order.paymentStatus = 'partially_refunded';
      }
      order.refundedAt = new Date();
      await order.save();
      console.log(`Refund processed for order: ${order._id}`);
    }
  } catch (error) {
    console.error('Handle refund processed error:', error);
  }
};

// Process refund through Razorpay
export const processRazorpayRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!amount || !reason) {
      return sendError(res, 400, 'Amount and reason are required');
    }

    // Find order (admin can refund any order, user only their own)
    const filter = userRole === 'admin' ? { _id: orderId } : { _id: orderId, user: userId };
    const order = await Order.findOne(filter);
    
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    if (!order.razorpayPaymentId) {
      return sendError(res, 400, 'No payment found for this order');
    }

    if (order.paymentStatus !== 'paid') {
      return sendError(res, 400, 'Order payment is not in paid status');
    }

    // Create refund through Razorpay
    const refundResult = await createRefund(order.razorpayPaymentId, amount);
    
    if (!refundResult.success) {
      return sendError(res, 500, `Refund failed: ${refundResult.error}`);
    }

    // Update order with refund details
    order.refundAmount = (order.refundAmount || 0) + amount;
    order.refundReason = reason;
    order.refundedAt = new Date();
    
    if (order.refundAmount >= order.total) {
      order.paymentStatus = 'refunded';
      order.status = 'refunded';
    } else {
      order.paymentStatus = 'partially_refunded';
    }
    
    await order.save();

    sendResponse(res, 200, 'Refund processed successfully', {
      refundId: refundResult.refund.id,
      amount: refundResult.refund.amount / 100,
      status: refundResult.refund.status
    });
  } catch (error) {
    console.error('Process Razorpay refund error:', error);
    sendError(res, 500, 'Failed to process refund');
  }
};

// Legacy create payment function (keeping for backward compatibility)
export const createPayment = async (req, res) => {
  try {
    const { 
      orderId, 
      method, 
      gateway,
      cardDetails,
      upiDetails,
      bankDetails,
      walletDetails,
      metadata,
      notes
    } = req.body;
    const userId = req.user._id;

    if (!orderId || !method) {
      return sendError(res, 400, 'Order ID and payment method are required');
    }

    // Validate order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return sendError(res, 404, 'Order not found or does not belong to you');
    }

    // Check if payment already exists for this order
    const existingPayment = await Payment.findOne({ order: orderId });
    if (existingPayment) {
      return sendError(res, 409, 'Payment already exists for this order');
    }

    // Validate payment method
    const validMethods = ['card', 'upi', 'netbanking', 'wallet', 'cod'];
    if (!validMethods.includes(method)) {
      return sendError(res, 400, 'Invalid payment method');
    }

    // Create payment
    const payment = new Payment({
      paymentId: generatePaymentId(),
      order: orderId,
      user: userId,
      amount: order.total,
      method,
      gateway: gateway || {},
      cardDetails,
      upiDetails,
      bankDetails,
      walletDetails,
      metadata,
      notes,
      status: method === 'cod' ? 'pending' : 'processing'
    });

    await payment.save();

    // Update order with payment reference
    order.paymentId = payment.paymentId;
    if (method === 'cod') {
      order.paymentStatus = 'pending';
    }
    await order.save();

    // Populate payment for response
    await payment.populate({
      path: 'order',
      populate: {
        path: 'items.product',
        select: 'name images'
      }
    });

    sendResponse(res, 201, 'Payment created successfully', payment);
  } catch (error) {
    console.error('Create payment error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid order ID');
    }
    sendError(res, 500, 'Failed to create payment');
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Admin can view any payment, user can only view their own
    const filter = userRole === 'admin' ? { _id: id } : { _id: id, user: userId };
    
    const payment = await Payment.findOne(filter)
      .populate({
        path: 'order',
        populate: [
          {
            path: 'items.product',
            select: 'name images',
            populate: [
              { path: 'brand', select: 'name logo' },
              { path: 'category', select: 'name slug' }
            ]
          },
          { path: 'user', select: 'firstName lastName email' }
        ]
      });

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    sendResponse(res, 200, 'Payment retrieved successfully', payment);
  } catch (error) {
    console.error('Get payment by ID error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid payment ID');
    }
    sendError(res, 500, 'Failed to retrieve payment');
  }
};

// Get user payments
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt',
      order = 'desc',
      status,
      method,
      startDate,
      endDate
    } = req.query;

    // Build filter
    const filter = { user: userId };
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute queries
    const [payments, totalCount] = await Promise.all([
      Payment.find(filter)
        .populate({
          path: 'order',
          select: 'orderNumber total status items',
          populate: {
            path: 'items.product',
            select: 'name images'
          }
        })
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    sendResponse(res, 200, 'User payments retrieved successfully', {
      payments,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    sendError(res, 500, 'Failed to retrieve user payments');
  }
};

// Update payment status (admin only)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, gatewayData, failureReason, failureCode } = req.body;

    if (!status) {
      return sendError(res, 400, 'Status is required');
    }

    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, 'Invalid status');
    }

    const payment = await Payment.findById(id).populate('order');
    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    // Validate status transitions
    const currentStatus = payment.status;
    const invalidTransitions = {
      'completed': ['failed', 'cancelled'],
      'failed': ['completed', 'processing'],
      'cancelled': ['completed', 'processing', 'failed']
    };

    if (invalidTransitions[currentStatus]?.includes(status)) {
      return sendError(res, 400, `Cannot change status from ${currentStatus} to ${status}`);
    }

    // Update payment status
    if (status === 'completed') {
      await payment.markCompleted(gatewayData);
      // Update order payment status
      payment.order.paymentStatus = 'paid';
      await payment.order.save();
    } else if (status === 'failed') {
      await payment.markFailed(failureReason, failureCode);
      // Update order payment status
      payment.order.paymentStatus = 'failed';
      await payment.order.save();
    } else {
      payment.status = status;
      await payment.save();
    }

    // Populate for response
    await payment.populate({
      path: 'order',
      populate: {
        path: 'items.product',
        select: 'name images'
      }
    });

    sendResponse(res, 200, 'Payment status updated successfully', payment);
  } catch (error) {
    console.error('Update payment status error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid payment ID');
    }
    sendError(res, 500, 'Failed to update payment status');
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason, refundId } = req.body;

    if (!amount || !reason || !refundId) {
      return sendError(res, 400, 'Amount, reason, and refund ID are required');
    }

    const payment = await Payment.findById(id).populate('order');
    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    if (!payment.canRefund) {
      return sendError(res, 400, 'Payment cannot be refunded');
    }

    if (amount > (payment.amount - payment.totalRefunded)) {
      return sendError(res, 400, 'Refund amount exceeds available amount');
    }

    // Add refund
    await payment.addRefund({
      refundId,
      amount,
      reason
    });

    // Update order if fully refunded
    if (payment.isFullyRefunded) {
      payment.order.paymentStatus = 'refunded';
      payment.order.status = 'refunded';
      await payment.order.save();
    }

    sendResponse(res, 200, 'Refund processed successfully', payment);
  } catch (error) {
    console.error('Process refund error:', error);
    sendError(res, 500, 'Failed to process refund');
  }
};

// Get payment summary/stats
export const getPaymentSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const summary = await Payment.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          totalRefunded: { $sum: '$totalRefunded' }
        }
      }
    ]);

    const result = summary[0] || {
      totalPayments: 0,
      totalAmount: 0,
      completedPayments: 0,
      failedPayments: 0,
      totalRefunded: 0
    };

    sendResponse(res, 200, 'Payment summary retrieved successfully', result);
  } catch (error) {
    console.error('Get payment summary error:', error);
    sendError(res, 500, 'Failed to retrieve payment summary');
  }
};

// Webhook handler for payment gateway
export const handleWebhook = async (req, res) => {
  try {
    const { paymentId, status, gatewayData } = req.body;

    if (!paymentId || !status) {
      return sendError(res, 400, 'Payment ID and status are required');
    }

    const payment = await Payment.findOne({ paymentId }).populate('order');
    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    // Store webhook data
    payment.webhookData = req.body;

    // Update payment based on webhook
    if (status === 'completed' || status === 'success') {
      await payment.markCompleted(gatewayData);
      payment.order.paymentStatus = 'paid';
      await payment.order.save();
    } else if (status === 'failed') {
      await payment.markFailed(gatewayData?.failureReason, gatewayData?.failureCode);
      payment.order.paymentStatus = 'failed';
      await payment.order.save();
    }

    sendResponse(res, 200, 'Webhook processed successfully');
  } catch (error) {
    console.error('Webhook handler error:', error);
    sendError(res, 500, 'Failed to process webhook');
  }
};

// ===== ADMIN FUNCTIONS =====

// Admin: Get all payments with advanced filtering
export const adminGetAllPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      method,
      userId,
      sort = 'createdAt',
      order = 'desc',
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (userId) filter.user = userId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };
    const skip = (Number(page) - 1) * Number(limit);

    const [payments, totalCount] = await Promise.all([
      Payment.find(filter)
        .populate('user', 'firstName lastName email')
        .populate({
          path: 'order',
          select: 'orderNumber total status items',
          populate: {
            path: 'items.product',
            select: 'name images'
          }
        })
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    sendResponse(res, 200, 'Payments retrieved successfully', {
      payments,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Admin get all payments error:', error);
    sendError(res, 500, 'Failed to retrieve payments');
  }
};

// Admin: Force payment status update
export const adminUpdatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, gatewayData } = req.body;

    if (!status) {
      return sendError(res, 400, 'Status is required');
    }

    const payment = await Payment.findById(id).populate('order');
    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    const oldStatus = payment.status;

    if (status === 'completed') {
      await payment.markCompleted(gatewayData);
      payment.order.paymentStatus = 'paid';
      await payment.order.save();
    } else if (status === 'failed') {
      await payment.markFailed(reason, 'ADMIN_UPDATE');
      payment.order.paymentStatus = 'failed';
      await payment.order.save();
    } else {
      payment.status = status;
      await payment.save();
    }

    // Log admin action
    payment.adminNotes = `Status changed from ${oldStatus} to ${status} by admin. Reason: ${reason || 'No reason provided'}`;
    await payment.save();

    await payment.populate({
      path: 'order',
      select: 'orderNumber total status'
    });

    sendResponse(res, 200, 'Payment status updated successfully', payment);
  } catch (error) {
    console.error('Admin update payment status error:', error);
    sendError(res, 500, 'Failed to update payment status');
  }
};

// ===== UTILITY FUNCTIONS =====

// Calculate total revenue
export const calculateTotalRevenue = async (startDate, endDate) => {
  try {
    const filter = { status: 'completed' };
    if (startDate || endDate) {
      filter.completedAt = {};
      if (startDate) filter.completedAt.$gte = new Date(startDate);
      if (endDate) filter.completedAt.$lte = new Date(endDate);
    }

    const result = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          averagePayment: { $avg: '$amount' }
        }
      }
    ]);

    return result[0] || {
      totalRevenue: 0,
      totalPayments: 0,
      averagePayment: 0
    };
  } catch (error) {
    console.error('Calculate total revenue error:', error);
    return {
      totalRevenue: 0,
      totalPayments: 0,
      averagePayment: 0
    };
  }
};

// Link payment to order and user
export const linkPaymentToOrder = async (paymentId, orderId) => {
  try {
    const [payment, order] = await Promise.all([
      Payment.findById(paymentId),
      Order.findById(orderId)
    ]);

    if (!payment || !order) {
      throw new Error('Payment or order not found');
    }

    payment.order = orderId;
    payment.user = order.user;
    await payment.save();

    order.paymentId = payment.paymentId;
    await order.save();

    return { payment, order };
  } catch (error) {
    console.error('Link payment to order error:', error);
    throw error;
  }
};

// Get payment analytics
export const getPaymentAnalytics = async (period = '30d') => {
  try {
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            method: '$method'
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          methods: {
            $push: {
              method: '$_id.method',
              count: '$count',
              amount: '$amount'
            }
          },
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return analytics;
  } catch (error) {
    console.error('Get payment analytics error:', error);
    return [];
  }
};