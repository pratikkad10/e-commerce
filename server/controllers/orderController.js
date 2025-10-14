import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendOrderConfirmation, sendOrderCancellation, sendOrderShipped, sendOrderDelivered, sendSellerOrderNotification } from '../utils/emailEvents.js';
import { sendResponse, sendError } from '../utils/response.js';

// Place order from cart
export const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, paymentId, customerNotes } = req.body;
    const userId = req.user._id;

    if (!shippingAddress || !paymentMethod) {
      return sendError(res, 400, 'Shipping address and payment method are required');
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return sendError(res, 400, 'Cart is empty');
    }

    // Validate stock and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      if (!product || product.status !== 'active' || !product.isActive) {
        return sendError(res, 400, `Product ${product?.name || 'unknown'} is no longer available`);
      }

      if (product.trackQuantity && product.stock < cartItem.quantity) {
        return sendError(res, 400, `Insufficient stock for ${product.name}. Only ${product.stock} available`);
      }

      const itemTotal = cartItem.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        seller: product.seller,
        productSnapshot: {
          name: product.name,
          image: product.images[0] || '',
          sku: product.sku
        },
        variant: cartItem.variant,
        quantity: cartItem.quantity,
        price: cartItem.price,
        total: itemTotal
      });
    }

    // Calculate totals
    const shippingCost = cart.shippingCost || 0;
    const taxAmount = cart.taxAmount || 0;
    const discountAmount = cart.discountAmount || 0;
    const total = subtotal + shippingCost + taxAmount - discountAmount;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      total,
      coupon: cart.coupon,
      shippingAddress,
      paymentMethod,
      paymentId,
      customerNotes,
      paymentStatus: paymentId ? 'paid' : 'pending'
    });

    await order.save();

    // Reduce product stock
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      if (product.trackQuantity) {
        product.stock -= cartItem.quantity;
        product.soldCount = (product.soldCount || 0) + cartItem.quantity;
        await product.save();
      }
    }

    // Clear cart
    await cart.clear();

    // Populate order for response
    await order.populate([
      { path: 'user', select: 'firstName lastName email' },
      {
        path: 'items.product',
        populate: [
          { path: 'brand', select: 'name logo' },
          { path: 'category', select: 'name slug' },
          { path: 'seller', select: 'name email storeName' }
        ]
      }
    ]);

    // Send order confirmation email to user
    sendOrderConfirmation(order.user, order).catch(err => 
      console.error('Order confirmation email failed:', err)
    );

    // Send order notification to sellers
    const sellers = new Set();
    for (const item of order.items) {
      if (item.product?.seller) {
        sellers.add(item.product.seller);
      }
    }
    
    for (const seller of sellers) {
      sendSellerOrderNotification(seller, order).catch(err => 
        console.error('Seller order notification failed:', err)
      );
    }

    sendResponse(res, 201, 'Order placed successfully', order);
  } catch (error) {
    console.error('Place order error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return sendError(res, 400, `Validation failed: ${validationErrors.join(', ')}`);
    }
    
    sendError(res, 500, `Failed to place order: ${error.message}`);
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      status, 
      page = 1, 
      limit = 10, 
      sort = 'createdAt',
      order = 'desc',
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = req.query;

    // Build filter
    const filter = { user: userId };
    
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter.total = {};
      if (minAmount) filter.total.$gte = Number(minAmount);
      if (maxAmount) filter.total.$lte = Number(maxAmount);
    }

    // Build sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute queries
    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate({
          path: 'items.product',
          populate: [
            { path: 'brand', select: 'name logo' },
            { path: 'category', select: 'name slug' }
          ]
        })
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    sendResponse(res, 200, 'Orders retrieved successfully', {
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    sendError(res, 500, 'Failed to retrieve orders');
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: id, user: userId })
      .populate({
        path: 'items.product',
        populate: [
          { path: 'brand', select: 'name logo website' },
          { path: 'category', select: 'name slug description' }
        ]
      })
      .populate('user', 'firstName lastName email phone');

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    sendResponse(res, 200, 'Order retrieved successfully', order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid order ID');
    }
    sendError(res, 500, 'Failed to retrieve order');
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, adminNotes } = req.body;

    if (!status) {
      return sendError(res, 400, 'Status is required');
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, 'Invalid status');
    }

    const order = await Order.findById(id);
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Validate status transitions
    const currentStatus = order.status;
    const invalidTransitions = {
      'delivered': ['pending', 'confirmed', 'processing', 'shipped'],
      'cancelled': ['shipped', 'delivered'],
      'refunded': ['pending', 'confirmed', 'processing', 'shipped']
    };

    if (invalidTransitions[currentStatus]?.includes(status)) {
      return sendError(res, 400, `Cannot change status from ${currentStatus} to ${status}`);
    }

    // Update order
    await order.updateStatus(status);
    
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (adminNotes) order.adminNotes = adminNotes;
    
    await order.save();

    // Populate for response and emails
    await order.populate([
      { path: 'user', select: 'firstName lastName email' },
      {
        path: 'items.product',
        populate: [
          { path: 'brand', select: 'name logo' },
          { path: 'category', select: 'name slug' }
        ]
      }
    ]);

    // Send appropriate email based on status
    if (status === 'shipped') {
      sendOrderShipped(order.user, order, {
        trackingNumber: order.trackingNumber,
        carrier: 'Standard Delivery',
        estimatedDelivery: '3-5 business days'
      }).catch(err => console.error('Order shipped email failed:', err));
    } else if (status === 'delivered') {
      sendOrderDelivered(order.user, order).catch(err => 
        console.error('Order delivered email failed:', err)
      );
    }

    sendResponse(res, 200, 'Order status updated successfully', order);
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid order ID');
    }
    sendError(res, 500, 'Failed to update order status');
  }
};

// Cancel order (user)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: id, user: userId }).populate('items.product');
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    if (!order.canCancel) {
      return sendError(res, 400, 'Order cannot be cancelled');
    }

    // Restore product stock
    for (const item of order.items) {
      const product = item.product;
      if (product && product.trackQuantity) {
        product.stock += item.quantity;
        product.soldCount = Math.max(0, (product.soldCount || 0) - item.quantity);
        await product.save();
      }
    }

    // Update order status
    await order.updateStatus('cancelled');
    if (reason) {
      order.adminNotes = `Cancelled by user: ${reason}`;
      await order.save();
    }

    // Populate user for email
    await order.populate('user', 'firstName lastName email');
    
    // Send cancellation email
    sendOrderCancellation(order.user, order).catch(err => 
      console.error('Order cancellation email failed:', err)
    );

    sendResponse(res, 200, 'Order cancelled successfully', order);
  } catch (error) {
    console.error('Cancel order error:', error);
    sendError(res, 500, 'Failed to cancel order');
  }
};

// Get order summary/stats
export const getOrderSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const summary = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = summary[0] || {
      totalOrders: 0,
      totalSpent: 0,
      pendingOrders: 0,
      deliveredOrders: 0
    };

    sendResponse(res, 200, 'Order summary retrieved successfully', result);
  } catch (error) {
    console.error('Get order summary error:', error);
    sendError(res, 500, 'Failed to retrieve order summary');
  }
};

// ===== ADMIN FUNCTIONS =====

// Admin: Get all orders with advanced filtering
export const adminGetAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      paymentStatus,
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
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (userId) filter.user = userId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter.total = {};
      if (minAmount) filter.total.$gte = Number(minAmount);
      if (maxAmount) filter.total.$lte = Number(maxAmount);
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate('user', 'firstName lastName email')
        .populate({
          path: 'items.product',
          populate: [
            { path: 'brand', select: 'name logo' },
            { path: 'category', select: 'name slug' }
          ]
        })
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    sendResponse(res, 200, 'Orders retrieved successfully', {
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Admin get all orders error:', error);
    sendError(res, 500, 'Failed to retrieve orders');
  }
};

// Admin: Force cancel order with stock restoration
export const adminCancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, restoreStock = true } = req.body;

    const order = await Order.findById(id).populate('items.product');
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Restore stock if requested
    if (restoreStock) {
      for (const item of order.items) {
        const product = item.product;
        if (product && product.trackQuantity) {
          await updateProductStock(product._id, item.quantity, 'increase');
        }
      }
    }

    await order.updateStatus('cancelled');
    order.adminNotes = `Cancelled by admin: ${reason || 'No reason provided'}`;
    await order.save();

    // Populate user for email
    await order.populate('user', 'firstName lastName email');
    
    // Send cancellation email
    sendOrderCancellation(order.user, order).catch(err => 
      console.error('Admin order cancellation email failed:', err)
    );

    sendResponse(res, 200, 'Order cancelled successfully', order);
  } catch (error) {
    console.error('Admin cancel order error:', error);
    sendError(res, 500, 'Failed to cancel order');
  }
};

// ===== UTILITY FUNCTIONS =====

// Calculate order totals with taxes and discounts
export const calculateOrderTotals = (items, shippingCost = 0, taxRate = 0, discountAmount = 0) => {
  try {
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const taxAmount = Math.round((subtotal * taxRate) * 100) / 100;
    const total = subtotal + shippingCost + taxAmount - discountAmount;

    return {
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      total: Math.max(0, total)
    };
  } catch (error) {
    console.error('Calculate order totals error:', error);
    return {
      subtotal: 0,
      shippingCost: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: 0
    };
  }
};

// Update product stock (import from ProductController)
const updateProductStock = async (productId, quantity, operation = 'decrease') => {
  try {
    const Product = (await import('../models/Product.js')).default;
    const product = await Product.findById(productId);
    if (!product || !product.trackQuantity) return;

    if (operation === 'decrease') {
      product.stock = Math.max(0, product.stock - quantity);
      product.soldCount = (product.soldCount || 0) + quantity;
    } else if (operation === 'increase') {
      product.stock += quantity;
      product.soldCount = Math.max(0, (product.soldCount || 0) - quantity);
    }

    await product.save();
    return product;
  } catch (error) {
    console.error('Update product stock error:', error);
    throw error;
  }
};

// Validate order items before placement
export const validateOrderItems = async (cartItems) => {
  try {
    const issues = [];
    
    for (const item of cartItems) {
      const Product = (await import('../models/Product.js')).default;
      const product = await Product.findById(item.product);
      
      if (!product) {
        issues.push({
          productId: item.product,
          issue: 'Product not found'
        });
        continue;
      }

      if (product.status !== 'active' || !product.isActive) {
        issues.push({
          productId: item.product,
          productName: product.name,
          issue: 'Product is no longer available'
        });
        continue;
      }

      if (product.trackQuantity && product.stock < item.quantity) {
        issues.push({
          productId: item.product,
          productName: product.name,
          requested: item.quantity,
          available: product.stock,
          issue: `Only ${product.stock} items available`
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  } catch (error) {
    console.error('Validate order items error:', error);
    return {
      valid: false,
      issues: [{ issue: 'Order validation failed' }]
    };
  }
};