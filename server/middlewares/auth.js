import { verifyToken } from '../utils/tokens.js';
import User from '../models/User.js';
import { sendError } from '../utils/response.js';

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies.token;
    
    if (!token) {
      token = req.header('Authorization')?.replace('Bearer ', '');
    }
    
    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const decoded = verifyToken(token);
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return sendError(res, 401, 'User no longer exists.');
    }
    
    if (!user.isEmailVerified && process.env.NODE_ENV === 'production') {
      return sendError(res, 401, 'Please verify your email.');
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired.');
    }
    sendError(res, 500, 'Authentication failed.');
  }
};

// Authorization middleware
export const authorize = (roles) => {
  return (req, res, next) => {
    try {
      // Check if user exists (should be set by authenticate middleware)
      if (!req.user) {
        return sendError(res, 401, 'Authentication required.');
      }

      // Check if user has required role
      if (!req.user.role) {
        return sendError(res, 403, 'User role not defined.');
      }

      // Support both string and array of roles
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!allowedRoles.includes(req.user.role)) {
        return sendError(res, 403, `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`);
      }

      // Additional check for sellers
      if (req.user.role === 'seller') {
        if (!req.user.isSellerApproved) {
          return sendError(res, 403, 'Seller account not approved');
        }
        if (req.user.sellerSuspendedAt) {
          return sendError(res, 403, 'Seller account suspended');
        }
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      sendError(res, 500, 'Authorization failed.');
    }
  };
};

// Middleware to check if user owns the resource (for sellers)
export const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      let resource;

      switch (resourceType) {
        case 'product':
          const Product = (await import('../models/Product.js')).default;
          resource = await Product.findById(id);
          break;
        case 'order':
          const Order = (await import('../models/Order.js')).default;
          resource = await Order.findById(id);
          break;
        default:
          return sendError(res, 400, 'Invalid resource type');
      }

      if (!resource) {
        return sendError(res, 404, `${resourceType} not found`);
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      // Seller can only access their own resources
      if (req.user.role === 'seller') {
        if (resourceType === 'product' && resource.seller.toString() !== req.user._id.toString()) {
          return sendError(res, 403, 'Access denied: Not your product');
        }
        if (resourceType === 'order') {
          const hasSellerItems = resource.items.some(item => 
            item.seller.toString() === req.user._id.toString()
          );
          if (!hasSellerItems) {
            return sendError(res, 403, 'Access denied: No items from your store in this order');
          }
        }
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      sendError(res, 500, 'Failed to verify ownership');
    }
  };
};

// Default export for backward compatibility
export default authenticate;