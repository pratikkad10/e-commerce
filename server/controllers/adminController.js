import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import { sendSellerApprovalNotification, sendNewSellerNotificationToAdmin } from '../utils/emailEvents.js';
import { sendResponse, sendError } from '../utils/response.js';

// ===== DASHBOARD & ANALYTICS =====

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts first
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalBrands = await Brand.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalReviews = await Review.countDocuments();
    
    // Get revenue with error handling
    let totalRevenue = 0;
    try {
      const revenueResult = await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      totalRevenue = revenueResult[0]?.total || 0;
    } catch (revenueError) {
      console.error('Revenue calculation error:', revenueError.message);
    }
    
    // Get recent orders with error handling
    let recentOrders = [];
    try {
      recentOrders = await Order.find()
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(5);
    } catch (ordersError) {
      console.error('Recent orders error:', ordersError.message);
    }
    
    // Get top products with error handling
    let topProducts = [];
    try {
      topProducts = await Product.find()
        .sort({ soldCount: -1 })
        .limit(5)
        .select('name soldCount price');
    } catch (productsError) {
      console.error('Top products error:', productsError.message);
    }

    const stats = {
      totalUsers,
      totalOrders,
      totalProducts,
      totalBrands,
      totalCategories,
      totalReviews,
      totalRevenue,
      recentOrders,
      topProducts
    };

    sendResponse(res, 200, 'Dashboard stats retrieved successfully', stats);
  } catch (error) {
    console.error('Get dashboard stats error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    sendError(res, 500, 'Failed to retrieve dashboard stats');
  }
};

// ===== USER MANAGEMENT =====

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status,
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
    console.error('Get all users error:', error);
    sendError(res, 500, 'Failed to retrieve users');
  }
};

// Block user
export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        blockedAt: new Date(),
        blockReason: reason || 'Blocked by admin'
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, 'User blocked successfully', user);
  } catch (error) {
    console.error('Block user error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid user ID');
    }
    sendError(res, 500, 'Failed to block user');
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, 'User retrieved successfully', user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid user ID');
    }
    sendError(res, 500, 'Failed to retrieve user');
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'user' } = req.body;

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
      isEmailVerified: true // Admin created users are auto-verified
    });

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;

    sendResponse(res, 201, 'User created successfully', userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    sendError(res, 500, 'Failed to create user');
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove password from update data if present
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
    console.error('Update user error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid user ID');
    }
    sendError(res, 500, 'Failed to update user');
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, 'User deleted successfully', { id });
  } catch (error) {
    console.error('Delete user error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid user ID');
    }
    sendError(res, 500, 'Failed to delete user');
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isActive: true,
        blockedAt: undefined,
        blockReason: undefined
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, 'User unblocked successfully', user);
  } catch (error) {
    console.error('Unblock user error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid user ID');
    }
    sendError(res, 500, 'Failed to unblock user');
  }
};

// ===== PRODUCT MANAGEMENT =====

// Get all products (admin view)
export const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      status,
      brand,
      category,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;
    if (brand) filter.brand = brand;
    if (category) filter.category = category;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };
    const skip = (Number(page) - 1) * Number(limit);

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('brand', 'name logo')
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    sendResponse(res, 200, 'Products retrieved successfully', {
      products,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    sendError(res, 500, 'Failed to retrieve products');
  }
};

// Get product by ID (admin view)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('brand', 'name logo website')
      .populate('category', 'name slug description')
      .populate('seller', 'firstName lastName email');

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    sendResponse(res, 200, 'Product retrieved successfully', product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid product ID');
    }
    sendError(res, 500, 'Failed to retrieve product');
  }
};

// Create product
export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    productData.seller = req.user._id;

    if (!productData.name || !productData.price || !productData.brand || !productData.category) {
      return sendError(res, 400, 'Name, price, brand, and category are required');
    }

    // Validate brand and category exist
    const [brandExists, categoryExists] = await Promise.all([
      Brand.findById(productData.brand),
      Category.findById(productData.category)
    ]);

    if (!brandExists) {
      return sendError(res, 404, 'Brand not found');
    }
    if (!categoryExists) {
      return sendError(res, 404, 'Category not found');
    }

    const product = new Product(productData);
    await product.save();
    await product.populate(['brand', 'category']);

    sendResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    console.error('Create product error:', error);
    sendError(res, 500, 'Failed to create product');
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate brand and category if provided
    if (updateData.brand) {
      const brandExists = await Brand.findById(updateData.brand);
      if (!brandExists) {
        return sendError(res, 404, 'Brand not found');
      }
    }
    if (updateData.category) {
      const categoryExists = await Category.findById(updateData.category);
      if (!categoryExists) {
        return sendError(res, 404, 'Category not found');
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate(['brand', 'category']);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    sendResponse(res, 200, 'Product updated successfully', product);
  } catch (error) {
    console.error('Update product error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid product ID');
    }
    sendError(res, 500, 'Failed to update product');
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    sendResponse(res, 200, 'Product deleted successfully', { id });
  } catch (error) {
    console.error('Delete product error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid product ID');
    }
    sendError(res, 500, 'Failed to delete product');
  }
};

// ===== BRAND MANAGEMENT =====

// Get all brands
export const getBrands = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [brands, totalCount] = await Promise.all([
      Brand.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Brand.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    sendResponse(res, 200, 'Brands retrieved successfully', {
      brands,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get brands error:', error);
    sendError(res, 500, 'Failed to retrieve brands');
  }
};

// Create brand
export const createBrand = async (req, res) => {
  try {
    const { name, description, logo, website } = req.body;

    if (!name) {
      return sendError(res, 400, 'Brand name is required');
    }

    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return sendError(res, 409, 'Brand already exists');
    }

    const brand = new Brand({ name, description, logo, website });
    await brand.save();

    sendResponse(res, 201, 'Brand created successfully', brand);
  } catch (error) {
    console.error('Create brand error:', error);
    sendError(res, 500, 'Failed to create brand');
  }
};

// Update brand
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const brand = await Brand.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!brand) {
      return sendError(res, 404, 'Brand not found');
    }

    sendResponse(res, 200, 'Brand updated successfully', brand);
  } catch (error) {
    console.error('Update brand error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid brand ID');
    }
    sendError(res, 500, 'Failed to update brand');
  }
};

// Delete brand
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return sendError(res, 404, 'Brand not found');
    }

    sendResponse(res, 200, 'Brand deleted successfully', { id });
  } catch (error) {
    console.error('Delete brand error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid brand ID');
    }
    sendError(res, 500, 'Failed to delete brand');
  }
};

// ===== CATEGORY MANAGEMENT =====

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, parentOnly } = req.query;

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (parentOnly === 'true') {
      filter.parentCategory = { $exists: false };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [categories, totalCount] = await Promise.all([
      Category.find(filter)
        .populate('parentCategory', 'name slug')
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Category.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    sendResponse(res, 200, 'Categories retrieved successfully', {
      categories,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    sendError(res, 500, 'Failed to retrieve categories');
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, description, slug, parentCategory } = req.body;

    if (!name) {
      return sendError(res, 400, 'Category name is required');
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return sendError(res, 409, 'Category already exists');
    }

    const category = new Category({
      name,
      description,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      parentCategory
    });

    await category.save();
    sendResponse(res, 201, 'Category created successfully', category);
  } catch (error) {
    console.error('Create category error:', error);
    sendError(res, 500, 'Failed to create category');
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug');

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    sendResponse(res, 200, 'Category updated successfully', category);
  } catch (error) {
    console.error('Update category error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid category ID');
    }
    sendError(res, 500, 'Failed to update category');
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    sendResponse(res, 200, 'Category deleted successfully', { id });
  } catch (error) {
    console.error('Delete category error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid category ID');
    }
    sendError(res, 500, 'Failed to delete category');
  }
};

// ===== ORDER MANAGEMENT =====

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      paymentStatus,
      sort = 'createdAt',
      order = 'desc',
      startDate,
      endDate
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate('user', 'firstName lastName email')
        .populate({
          path: 'items.product',
          select: 'name images price',
          populate: [
            { path: 'brand', select: 'name' },
            { path: 'category', select: 'name' }
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
    console.error('Get all orders error:', error);
    sendError(res, 500, 'Failed to retrieve orders');
  }
};

// Update order status
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

    await order.updateStatus(status);
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (adminNotes) order.adminNotes = adminNotes;
    await order.save();

    await order.populate({
      path: 'items.product',
      populate: [
        { path: 'brand', select: 'name' },
        { path: 'category', select: 'name' }
      ]
    });

    sendResponse(res, 200, 'Order status updated successfully', order);
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid order ID');
    }
    sendError(res, 500, 'Failed to update order status');
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    sendResponse(res, 200, 'Order deleted successfully', { id });
  } catch (error) {
    console.error('Delete order error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid order ID');
    }
    sendError(res, 500, 'Failed to delete order');
  }
};

// ===== REVIEW MANAGEMENT =====

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      rating,
      isApproved,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = {};
    if (rating) filter.rating = Number(rating);
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, totalCount] = await Promise.all([
      Review.find(filter)
        .populate('user', 'firstName lastName email')
        .populate({
          path: 'product',
          select: 'name images',
          populate: [
            { path: 'brand', select: 'name' },
            { path: 'category', select: 'name' }
          ]
        })
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    sendResponse(res, 200, 'Reviews retrieved successfully', {
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    sendError(res, 500, 'Failed to retrieve reviews');
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return sendError(res, 404, 'Review not found');
    }

    // Update product rating after review deletion
    const reviews = await Review.find({ product: review.product, isApproved: true });
    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      await Product.findByIdAndUpdate(review.product, {
        averageRating: 0,
        reviewCount: 0
      });
    } else {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / totalReviews;
      await Product.findByIdAndUpdate(review.product, {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: totalReviews
      });
    }

    sendResponse(res, 200, 'Review deleted successfully', { id });
  } catch (error) {
    console.error('Delete review error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid review ID');
    }
    sendError(res, 500, 'Failed to delete review');
  }
};

// ===== PAYMENT MANAGEMENT =====

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      method,
      sort = 'createdAt',
      order = 'desc',
      startDate,
      endDate
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };
    const skip = (Number(page) - 1) * Number(limit);

    const [payments, totalCount] = await Promise.all([
      Payment.find(filter)
        .populate('user', 'firstName lastName email')
        .populate({
          path: 'order',
          select: 'orderNumber total status'
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
    console.error('Get all payments error:', error);
    sendError(res, 500, 'Failed to retrieve payments');
  }
};

// Update payment status
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

    if (status === 'completed') {
      await payment.markCompleted(gatewayData);
      payment.order.paymentStatus = 'paid';
      await payment.order.save();
    } else if (status === 'failed') {
      await payment.markFailed(failureReason, failureCode);
      payment.order.paymentStatus = 'failed';
      await payment.order.save();
    } else {
      payment.status = status;
      await payment.save();
    }

    await payment.populate({
      path: 'order',
      select: 'orderNumber total status'
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

    await payment.addRefund({ refundId, amount, reason });

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

// ===== SELLER MANAGEMENT =====

// Get all sellers
export const getAllSellers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      status,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = { role: 'seller' };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { storeName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'approved') {
      filter.isSellerApproved = true;
      filter.sellerSuspendedAt = { $exists: false };
    } else if (status === 'pending') {
      filter.isSellerApproved = false;
    } else if (status === 'suspended') {
      filter.sellerSuspendedAt = { $exists: true };
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };
    const skip = (Number(page) - 1) * Number(limit);

    const [sellers, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password')
        .populate('products', 'name status')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    sendResponse(res, 200, 'Sellers retrieved successfully', {
      sellers,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all sellers error:', error);
    sendError(res, 500, 'Failed to retrieve sellers');
  }
};

// Get seller by ID
export const getSellerById = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await User.findOne({ _id: id, role: 'seller' })
      .select('-password')
      .populate('products', 'name price stock status totalSales');

    if (!seller) {
      return sendError(res, 404, 'Seller not found');
    }

    // Get seller statistics
    const stats = await Order.aggregate([
      { $match: { 'items.seller': seller._id } },
      { $unwind: '$items' },
      { $match: { 'items.seller': seller._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $addToSet: '$_id' },
          totalEarnings: { $sum: '$items.sellerEarnings' },
          totalSales: { $sum: '$items.quantity' }
        }
      }
    ]);

    const sellerWithStats = {
      ...seller.toObject(),
      stats: {
        totalOrders: stats[0]?.totalOrders.length || 0,
        totalEarnings: stats[0]?.totalEarnings || 0,
        totalSales: stats[0]?.totalSales || 0
      }
    };

    sendResponse(res, 200, 'Seller retrieved successfully', sellerWithStats);
  } catch (error) {
    console.error('Get seller by ID error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid seller ID');
    }
    sendError(res, 500, 'Failed to retrieve seller');
  }
};

// Approve seller
export const approveSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await User.findOne({ _id: id, role: 'seller' });
    if (!seller) {
      return sendError(res, 404, 'Seller not found');
    }

    if (seller.isSellerApproved) {
      return sendError(res, 400, 'Seller is already approved');
    }

    await seller.approveSeller();

    // Send approval notification to seller
    sendSellerApprovalNotification(seller).catch(err => 
      console.error('Seller approval email failed:', err)
    );

    sendResponse(res, 200, 'Seller approved successfully', seller);
  } catch (error) {
    console.error('Approve seller error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid seller ID');
    }
    sendError(res, 500, 'Failed to approve seller');
  }
};

// Suspend seller
export const suspendSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return sendError(res, 400, 'Suspension reason is required');
    }

    const seller = await User.findOne({ _id: id, role: 'seller' });
    if (!seller) {
      return sendError(res, 404, 'Seller not found');
    }

    if (seller.sellerSuspendedAt) {
      return sendError(res, 400, 'Seller is already suspended');
    }

    await seller.suspendSeller(reason);

    // Deactivate all seller's products
    await Product.updateMany(
      { seller: id },
      { isActive: false, status: 'inactive' }
    );

    sendResponse(res, 200, 'Seller suspended successfully', seller);
  } catch (error) {
    console.error('Suspend seller error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid seller ID');
    }
    sendError(res, 500, 'Failed to suspend seller');
  }
};

// Delete seller
export const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await User.findOne({ _id: id, role: 'seller' });
    if (!seller) {
      return sendError(res, 404, 'Seller not found');
    }

    // Archive all seller's products instead of deleting
    await Product.updateMany(
      { seller: id },
      { status: 'archived', isActive: false }
    );

    // Delete the seller account
    await User.findByIdAndDelete(id);

    sendResponse(res, 200, 'Seller deleted successfully', { id });
  } catch (error) {
    console.error('Delete seller error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid seller ID');
    }
    sendError(res, 500, 'Failed to delete seller');
  }
};