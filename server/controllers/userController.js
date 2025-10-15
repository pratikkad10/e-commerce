import User from '../models/User.js';
import { sendResponse, sendError } from '../utils/response.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Get user stats
    const stats = await getUserStats(userId);
    const userWithStats = { ...user.toObject(), stats };

    sendResponse(res, 200, 'Profile retrieved successfully', userWithStats);
  } catch (error) {
    console.error('Get user profile error:', error);
    sendError(res, 500, 'Failed to retrieve profile');
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Current password and new password are required');
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return sendError(res, 400, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    sendError(res, 500, 'Failed to change password');
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, phone, dateOfBirth, gender } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phone, dateOfBirth, gender },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, 'Profile updated successfully', user);
  } catch (error) {
    console.error('Update user profile error:', error);
    sendError(res, 500, 'Failed to update profile');
  }
};

// Add address
export const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressData = req.body;

    if (!addressData.addressLine1 || !addressData.city || !addressData.state || !addressData.postalCode) {
      return sendError(res, 400, 'Address line 1, city, state, and postal code are required');
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    user.addresses.push(addressData);
    await user.save();

    const newAddress = user.addresses[user.addresses.length - 1];
    sendResponse(res, 201, 'Address added successfully', newAddress);
  } catch (error) {
    console.error('Add address error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return sendError(res, 400, `Validation failed: ${validationErrors.join(', ')}`);
    }
    
    sendError(res, 500, `Failed to add address: ${error.message}`);
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const address = user.addresses.id(id);
    if (!address) {
      return sendError(res, 404, 'Address not found');
    }

    Object.assign(address, updateData);
    await user.save();

    sendResponse(res, 200, 'Address updated successfully', address);
  } catch (error) {
    console.error('Update address error:', error);
    sendError(res, 500, 'Failed to update address');
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const address = user.addresses.id(id);
    if (!address) {
      return sendError(res, 404, 'Address not found');
    }

    user.addresses.pull(id);
    await user.save();

    sendResponse(res, 200, 'Address deleted successfully', { id });
  } catch (error) {
    console.error('Delete address error:', error);
    sendError(res, 500, 'Failed to delete address');
  }
};

// ===== ADMIN FUNCTIONS =====

// Admin: Get all users
export const adminGetAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status,
      role,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      filter.isActive = status === 'active';
    }
    if (role) {
      filter.role = role;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };
    const skip = (Number(page) - 1) * Number(limit);

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    sendResponse(res, 200, 'Users retrieved successfully', {
      users,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Admin get all users error:', error);
    sendError(res, 500, 'Failed to retrieve users');
  }
};

// Admin: Create user
export const adminCreateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'user', phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return sendError(res, 400, 'All fields are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'User already exists with this email');
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      isEmailVerified: true // Admin created users are auto-verified
    });

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;

    sendResponse(res, 201, 'User created successfully', userResponse);
  } catch (error) {
    console.error('Admin create user error:', error);
    sendError(res, 500, 'Failed to create user');
  }
};

// Admin: Update any user
export const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove password from update data if present (use separate endpoint for password reset)
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, 'User updated successfully', user);
  } catch (error) {
    console.error('Admin update user error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid user ID');
    }
    sendError(res, 500, 'Failed to update user');
  }
};

// Admin: Delete user
export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return sendError(res, 400, 'Cannot delete your own account');
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, 'User deleted successfully', { id });
  } catch (error) {
    console.error('Admin delete user error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid user ID');
    }
    sendError(res, 500, 'Failed to delete user');
  }
};

// Admin: Block/Unblock user
export const adminToggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;

    // Prevent admin from blocking themselves
    if (id === req.user._id.toString()) {
      return sendError(res, 400, 'Cannot modify your own account status');
    }

    const updateData = { isActive };
    if (!isActive) {
      updateData.blockedAt = new Date();
      updateData.blockReason = reason || 'Blocked by admin';
    } else {
      updateData.blockedAt = undefined;
      updateData.blockReason = undefined;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const action = isActive ? 'activated' : 'blocked';
    sendResponse(res, 200, `User ${action} successfully`, user);
  } catch (error) {
    console.error('Admin toggle user status error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid user ID');
    }
    sendError(res, 500, 'Failed to update user status');
  }
};

// ===== WISHLIST FUNCTIONS =====

// Get user wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    sendResponse(res, 200, 'Wishlist retrieved successfully', user.wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    sendError(res, 500, 'Failed to retrieve wishlist');
  }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return sendError(res, 400, 'Product ID is required');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    await user.addToWishlist(productId);
    sendResponse(res, 200, 'Product added to wishlist');
  } catch (error) {
    console.error('Add to wishlist error:', error);
    sendError(res, 500, 'Failed to add to wishlist');
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    await user.removeFromWishlist(productId);
    sendResponse(res, 200, 'Product removed from wishlist');
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    sendError(res, 500, 'Failed to remove from wishlist');
  }
};

// ===== UTILITY FUNCTIONS =====

// Get user statistics
export const getUserStats = async (userId) => {
  try {
    const Order = (await import('../models/Order.js')).default;
    const Review = (await import('../models/Review.js')).default;
    
    const [orderStats, reviewStats] = await Promise.all([
      Order.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' }
          }
        }
      ]),
      Review.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' }
          }
        }
      ])
    ]);

    return {
      orders: orderStats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
      reviews: reviewStats[0] || { totalReviews: 0, averageRating: 0 }
    };
  } catch (error) {
    console.error('Get user stats error:', error);
    return {
      orders: { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
      reviews: { totalReviews: 0, averageRating: 0 }
    };
  }
};

// Validate user permissions
export const validateUserPermissions = (user, requiredRole = 'user') => {
  try {
    if (!user) {
      return { valid: false, error: 'User not found' };
    }

    if (!user.isActive) {
      return { valid: false, error: 'User account is blocked' };
    }

    if (!user.isEmailVerified) {
      return { valid: false, error: 'Email not verified' };
    }

    const roleHierarchy = { user: 1, admin: 2 };
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return { valid: false, error: 'Insufficient permissions' };
    }

    return { valid: true };
  } catch (error) {
    console.error('Validate user permissions error:', error);
    return { valid: false, error: 'Permission validation failed' };
  }
};