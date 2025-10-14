import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendResponse, sendError } from '../utils/response.js';

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return sendError(res, 400, 'Product ID is required');
    }

    if (quantity < 1) {
      return sendError(res, 400, 'Quantity must be at least 1');
    }

    // Validate product exists and is active
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active' || !product.isActive) {
      return sendError(res, 404, 'Product not found or unavailable');
    }

    // Check stock availability
    if (product.trackQuantity && product.stock < quantity) {
      return sendError(res, 400, `Only ${product.stock} items available in stock`);
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const variantStr = variant ? JSON.stringify(variant) : null;
    const existingItem = cart.items.find(item => 
      item.product.toString() === productId &&
      JSON.stringify(item.variant) === variantStr
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.trackQuantity && product.stock < newQuantity) {
        return sendError(res, 400, `Only ${product.stock} items available in stock`);
      }
      existingItem.quantity = newQuantity;
    } else {
      const price = variant?.price || product.price;
      cart.items.push({ product: productId, quantity, price, variant });
    }

    await cart.save();
    
    // Populate cart for response
    await cart.populate({
      path: 'items.product',
      populate: [
        { path: 'brand', select: 'name logo' },
        { path: 'category', select: 'name slug' }
      ]
    });

    sendResponse(res, 200, 'Product added to cart successfully', cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    sendError(res, 500, 'Failed to add product to cart');
  }
};

// Remove product from cart
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    if (!itemId) {
      return sendError(res, 400, 'Item ID is required');
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return sendError(res, 404, 'Cart not found');
    }

    const itemExists = cart.items.some(item => item._id.toString() === itemId);
    if (!itemExists) {
      return sendError(res, 404, 'Item not found in cart');
    }

    await cart.removeItem(itemId);
    
    // Populate cart for response
    await cart.populate({
      path: 'items.product',
      populate: [
        { path: 'brand', select: 'name logo' },
        { path: 'category', select: 'name slug' }
      ]
    });

    sendResponse(res, 200, 'Item removed from cart successfully', cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    sendError(res, 500, 'Failed to remove item from cart');
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    if (!itemId) {
      return sendError(res, 400, 'Item ID is required');
    }

    if (quantity < 0) {
      return sendError(res, 400, 'Quantity cannot be negative');
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return sendError(res, 404, 'Cart not found');
    }

    const item = cart.items.find(item => item._id.toString() === itemId);
    if (!item) {
      return sendError(res, 404, 'Item not found in cart');
    }

    // If quantity is 0, remove item
    if (quantity === 0) {
      await cart.removeItem(itemId);
    } else {
      // Validate stock availability
      const product = await Product.findById(item.product);
      if (product.trackQuantity && product.stock < quantity) {
        return sendError(res, 400, `Only ${product.stock} items available in stock`);
      }

      await cart.updateQuantity(itemId, quantity);
    }

    // Populate cart for response
    await cart.populate({
      path: 'items.product',
      populate: [
        { path: 'brand', select: 'name logo' },
        { path: 'category', select: 'name slug' }
      ]
    });

    sendResponse(res, 200, 'Cart item updated successfully', cart);
  } catch (error) {
    console.error('Update cart item error:', error);
    sendError(res, 500, 'Failed to update cart item');
  }
};

// Get user's cart
export const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      populate: [
        { path: 'brand', select: 'name logo website' },
        { path: 'category', select: 'name slug description' }
      ]
    });

    if (!cart) {
      // Return empty cart structure
      return sendResponse(res, 200, 'Cart retrieved successfully', {
        user: userId,
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
        shippingCost: 0,
        taxAmount: 0
      });
    }

    sendResponse(res, 200, 'Cart retrieved successfully', cart);
  } catch (error) {
    console.error('Get user cart error:', error);
    sendError(res, 500, 'Failed to retrieve cart');
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return sendError(res, 404, 'Cart not found');
    }

    await cart.clear();

    sendResponse(res, 200, 'Cart cleared successfully', {
      user: userId,
      items: [],
      subtotal: 0,
      total: 0,
      itemCount: 0
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    sendError(res, 500, 'Failed to clear cart');
  }
};

// Get cart summary (item count and total)
export const getCartSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    
    const summary = {
      itemCount: cart ? cart.itemCount : 0,
      subtotal: cart ? cart.subtotal : 0,
      total: cart ? cart.total : 0
    };

    sendResponse(res, 200, 'Cart summary retrieved successfully', summary);
  } catch (error) {
    console.error('Get cart summary error:', error);
    sendError(res, 500, 'Failed to retrieve cart summary');
  }
};

// ===== ADMIN FUNCTIONS =====

// Admin: Get any user's cart
export const getAdminUserCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      populate: [
        { path: 'brand', select: 'name logo' },
        { path: 'category', select: 'name slug' }
      ]
    });

    if (!cart) {
      return sendResponse(res, 200, 'Cart retrieved successfully', {
        user: userId,
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0
      });
    }

    sendResponse(res, 200, 'User cart retrieved successfully', cart);
  } catch (error) {
    console.error('Get admin user cart error:', error);
    sendError(res, 500, 'Failed to retrieve user cart');
  }
};

// Admin: Add item to any user's cart
export const adminAddToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity = 1, variant, overrideStock = false } = req.body;

    if (!productId) {
      return sendError(res, 400, 'Product ID is required');
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // Check stock unless admin overrides
    if (!overrideStock && product.trackQuantity && product.stock < quantity) {
      return sendError(res, 400, `Only ${product.stock} items available in stock`);
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Add item to cart
    const price = variant?.price || product.price;
    const variantStr = variant ? JSON.stringify(variant) : null;
    const existingItem = cart.items.find(item => 
      item.product.toString() === productId &&
      JSON.stringify(item.variant) === variantStr
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price, variant });
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      populate: [
        { path: 'brand', select: 'name logo' },
        { path: 'category', select: 'name slug' }
      ]
    });

    sendResponse(res, 200, 'Item added to user cart successfully', cart);
  } catch (error) {
    console.error('Admin add to cart error:', error);
    sendError(res, 500, 'Failed to add item to user cart');
  }
};

// ===== UTILITY FUNCTIONS =====

// Calculate cart totals with taxes and discounts
export const calculateCartTotals = (cart, taxRate = 0, discountAmount = 0) => {
  try {
    const subtotal = cart.subtotal || 0;
    const shippingCost = cart.shippingCost || 0;
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
    console.error('Calculate cart totals error:', error);
    return {
      subtotal: 0,
      shippingCost: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: 0
    };
  }
};

// Validate cart items stock
export const validateCartStock = async (cartItems) => {
  try {
    const stockIssues = [];
    
    for (const item of cartItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        stockIssues.push({
          productId: item.product,
          issue: 'Product not found'
        });
        continue;
      }

      if (product.trackQuantity && product.stock < item.quantity) {
        stockIssues.push({
          productId: item.product,
          productName: product.name,
          requested: item.quantity,
          available: product.stock,
          issue: `Only ${product.stock} items available`
        });
      }
    }

    return {
      valid: stockIssues.length === 0,
      issues: stockIssues
    };
  } catch (error) {
    console.error('Validate cart stock error:', error);
    return {
      valid: false,
      issues: [{ issue: 'Stock validation failed' }]
    };
  }
};