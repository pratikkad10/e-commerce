import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import { sendResponse, sendError } from '../utils/response.js';

// ===== SELLER PROFILE MANAGEMENT =====

// Get seller profile
export const getSellerProfile = async (req, res) => {
  try {
    const seller = await User.findById(req.user._id)
      .select('-password')
      .populate('products', 'name price stock status');

    if (!seller) {
      return sendError(res, 404, 'Seller not found');
    }

    sendResponse(res, 200, 'Seller profile retrieved successfully', seller);
  } catch (error) {
    console.error('Get seller profile error:', error);
    sendError(res, 500, 'Failed to retrieve seller profile');
  }
};

// Update seller profile
export const updateSellerProfile = async (req, res) => {
  try {
    const { storeName, storeDescription, storeLogo, firstName, lastName, phone } = req.body;
    
    const seller = await User.findByIdAndUpdate(
      req.user._id,
      { 
        storeName, 
        storeDescription, 
        storeLogo, 
        firstName, 
        lastName, 
        phone 
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!seller) {
      return sendError(res, 404, 'Seller not found');
    }

    sendResponse(res, 200, 'Seller profile updated successfully', seller);
  } catch (error) {
    console.error('Update seller profile error:', error);
    sendError(res, 500, 'Failed to update seller profile');
  }
};

// ===== PRODUCT MANAGEMENT =====

// Create product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, brand, category } = req.body;
    
    if (!name || !price) {
      return sendError(res, 400, 'Name and price are required');
    }

    // Handle uploaded images
    const images = [];
    if (req.files?.images) {
      req.files.images.forEach((file, index) => {
        images.push({
          url: file.path,
          alt: name,
          isPrimary: index === 0
        });
      });
    }

    // Handle uploaded videos
    const videos = [];
    if (req.files?.videos) {
      req.files.videos.forEach(file => {
        videos.push({
          url: file.path,
          title: name,
          thumbnail: file.path.replace(/\.[^.]+$/, '.jpg')
        });
      });
    }
    
    const productData = {
      name,
      description,
      price: Number(price),
      stock: Number(stock) || 0,
      category: category || await Category.findOne().then(c => c?._id),
      brand: brand || undefined,
      seller: req.user._id,
      status: 'active',
      images,
      videos,
      seo: {}
    };
    
    const product = new Product(productData);
    await product.save();
    await req.user.addProduct(product._id);

    sendResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    console.error('Create product error:', error);
    sendError(res, 500, `Failed to create product: ${error.message}`);
  }
};

// Get seller's products
export const getMyProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      status,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = { seller: req.user._id };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;

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
    console.error('Get seller products error:', error);
    sendError(res, 500, 'Failed to retrieve products');
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

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate(['brand', 'category']);

    if (!product) {
      return sendError(res, 404, 'Product not found or access denied');
    }

    sendResponse(res, 200, 'Product updated successfully', product);
  } catch (error) {
    console.error('Update product error:', error);
    sendError(res, 500, 'Failed to update product');
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.user._id },
      { status: 'archived', isActive: false },
      { new: true }
    );

    if (!product) {
      return sendError(res, 404, 'Product not found or access denied');
    }

    // Remove from seller's products array
    await req.user.removeProduct(id);

    sendResponse(res, 200, 'Product deleted successfully', { id });
  } catch (error) {
    console.error('Delete product error:', error);
    sendError(res, 500, 'Failed to delete product');
  }
};

// ===== ORDER MANAGEMENT =====

// Get seller's orders
export const getMyOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = { 'items.seller': req.user._id };
    if (status) filter.status = status;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate('user', 'firstName lastName email')
        .populate({
          path: 'items.product',
          select: 'name images price'
        })
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    // Filter items to show only seller's items
    const filteredOrders = orders.map(order => {
      const sellerItems = order.items.filter(item => 
        item.seller.toString() === req.user._id.toString()
      );
      return {
        ...order.toObject(),
        items: sellerItems,
        sellerTotal: sellerItems.reduce((sum, item) => sum + item.total, 0)
      };
    });

    const totalPages = Math.ceil(totalCount / Number(limit));

    sendResponse(res, 200, 'Orders retrieved successfully', {
      orders: filteredOrders,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    sendError(res, 500, 'Failed to retrieve orders');
  }
};

// Update order item status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { itemStatus, trackingNumber } = req.body;

    if (!itemStatus) {
      return sendError(res, 400, 'Item status is required');
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(itemStatus)) {
      return sendError(res, 400, 'Invalid item status');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Update seller's items in the order
    let updated = false;
    order.items.forEach(item => {
      if (item.seller.toString() === req.user._id.toString()) {
        item.itemStatus = itemStatus;
        updated = true;
      }
    });

    if (!updated) {
      return sendError(res, 403, 'No items from your store in this order');
    }

    // Update tracking number if provided
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    // Update main order status based on all items
    const allItemsStatus = order.items.map(item => item.itemStatus);
    if (allItemsStatus.every(status => status === 'delivered')) {
      order.status = 'delivered';
      order.deliveredAt = new Date();
    } else if (allItemsStatus.some(status => status === 'shipped')) {
      order.status = 'shipped';
      if (!order.shippedAt) order.shippedAt = new Date();
    } else if (allItemsStatus.every(status => ['confirmed', 'processing'].includes(status))) {
      order.status = 'processing';
    }

    await order.save();

    sendResponse(res, 200, 'Order status updated successfully', order);
  } catch (error) {
    console.error('Update order status error:', error);
    sendError(res, 500, 'Failed to update order status');
  }
};

// ===== ANALYTICS & DASHBOARD =====

// Get sales summary
export const getSalesSummary = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get basic stats
    const [
      totalProducts,
      totalOrders,
      productStats,
      orderStats,
      monthlyEarnings
    ] = await Promise.all([
      Product.countDocuments({ seller: sellerId, status: 'active' }),
      Order.countDocuments({ 'items.seller': sellerId }),
      
      // Product statistics
      Product.aggregate([
        { $match: { seller: sellerId } },
        {
          $group: {
            _id: null,
            totalStock: { $sum: '$stock' },
            lowStockProducts: {
              $sum: {
                $cond: [{ $lte: ['$stock', '$lowStockThreshold'] }, 1, 0]
              }
            }
          }
        }
      ]),

      // Order statistics
      Order.aggregate([
        { $match: { 'items.seller': sellerId } },
        { $unwind: '$items' },
        { $match: { 'items.seller': sellerId } },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$items.sellerEarnings' },
            totalSales: { $sum: '$items.quantity' },
            averageOrderValue: { $avg: '$items.total' }
          }
        }
      ]),

      // Monthly earnings
      Order.aggregate([
        { $match: { 'items.seller': sellerId } },
        { $unwind: '$items' },
        { $match: { 'items.seller': sellerId } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            earnings: { $sum: '$items.sellerEarnings' },
            sales: { $sum: '$items.quantity' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    // Get top products
    const topProducts = await Order.aggregate([
      { $match: { 'items.seller': sellerId } },
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      {
        $group: {
          _id: '$items.product',
          totalSales: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalSales: 1,
          totalRevenue: 1
        }
      }
    ]);

    const summary = {
      totalProducts,
      totalOrders,
      totalStock: productStats[0]?.totalStock || 0,
      lowStockProducts: productStats[0]?.lowStockProducts || 0,
      totalEarnings: orderStats[0]?.totalEarnings || 0,
      totalSales: orderStats[0]?.totalSales || 0,
      averageOrderValue: orderStats[0]?.averageOrderValue || 0,
      monthlyEarnings,
      topProducts
    };

    sendResponse(res, 200, 'Sales summary retrieved successfully', summary);
  } catch (error) {
    console.error('Get sales summary error:', error);
    sendError(res, 500, 'Failed to retrieve sales summary');
  }
};

// Get seller dashboard data
export const getDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const [
      recentOrders,
      lowStockProducts,
      salesSummary
    ] = await Promise.all([
      // Recent orders
      Order.find({ 'items.seller': sellerId })
        .populate('user', 'firstName lastName email')
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .limit(5),

      // Low stock products
      Product.find({ 
        seller: sellerId, 
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
        status: 'active'
      })
        .select('name stock lowStockThreshold')
        .limit(10),

      // Quick stats
      getSalesSummaryData(sellerId)
    ]);

    const dashboard = {
      ...salesSummary,
      recentOrders: recentOrders.map(order => ({
        ...order.toObject(),
        items: order.items.filter(item => 
          item.seller.toString() === sellerId.toString()
        )
      })),
      lowStockProducts
    };

    sendResponse(res, 200, 'Dashboard data retrieved successfully', dashboard);
  } catch (error) {
    console.error('Get dashboard error:', error);
    sendError(res, 500, 'Failed to retrieve dashboard data');
  }
};

// Helper function for sales summary
const getSalesSummaryData = async (sellerId) => {
  const stats = await Order.aggregate([
    { $match: { 'items.seller': sellerId } },
    { $unwind: '$items' },
    { $match: { 'items.seller': sellerId } },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$items.sellerEarnings' },
        totalSales: { $sum: '$items.quantity' },
        totalOrders: { $addToSet: '$_id' }
      }
    }
  ]);

  const productCount = await Product.countDocuments({ 
    seller: sellerId, 
    status: 'active' 
  });

  return {
    totalProducts: productCount,
    totalOrders: stats[0]?.totalOrders.length || 0,
    totalEarnings: stats[0]?.totalEarnings || 0,
    totalSales: stats[0]?.totalSales || 0
  };
};