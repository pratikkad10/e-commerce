import Product from '../models/Product.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import { sendResponse, sendError } from '../utils/response.js';

// Create a new product (admin only)
export const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      images, 
      stock, 
      brand, 
      category,
      shortDescription,
      comparePrice,
      costPrice,
      sku,
      barcode,
      lowStockThreshold,
      trackQuantity,
      subcategory,
      tags,
      videos,
      variants,
      dimensions,
      weight,
      shippingClass,
      freeShipping,
      shippingCost,
      isFeatured,
      isDigital,
      seo,
      attributes,
      availableFrom,
      availableUntil
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !brand || !category) {
      return sendError(res, 400, 'Name, description, price, brand, and category are required');
    }

    // Validate brand exists
    const brandExists = await Brand.findById(brand);
    if (!brandExists) {
      return sendError(res, 404, 'Brand not found');
    }

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return sendError(res, 404, 'Category not found');
    }

    // Create product
    const product = new Product({
      name,
      description,
      shortDescription,
      price,
      comparePrice,
      costPrice,
      images: images || [],
      stock: stock || 0,
      sku,
      barcode,
      lowStockThreshold: lowStockThreshold || 10,
      trackQuantity: trackQuantity !== undefined ? trackQuantity : true,
      brand,
      category,
      subcategory,
      tags: tags || [],
      videos: videos || [],
      variants: variants || [],
      dimensions,
      weight,
      shippingClass: shippingClass || 'standard',
      freeShipping: freeShipping || false,
      shippingCost: shippingCost || 0,
      isFeatured: isFeatured || false,
      isDigital: isDigital || false,
      seo: seo || {},
      attributes: attributes || [],
      availableFrom,
      availableUntil,
      seller: req.user._id,
      status: 'active'
    });

    await product.save();

    // Populate brand and category for response
    await product.populate(['brand', 'category']);

    sendResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    console.error('Create product error:', error);
    sendError(res, 500, 'Failed to create product');
  }
};

// Get all products with optional filtering
export const getAllProducts = async (req, res) => {
  try {
    const { 
      brand, 
      category, 
      page = 1, 
      limit = 10, 
      sort = 'createdAt',
      order = 'desc',
      search,
      minPrice,
      maxPrice,
      status = 'active'
    } = req.query;

    // Build filter object
    const filter = { status, isActive: true };

    if (brand) filter.brand = brand;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute queries
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

// Get single product by ID
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

    // Increment view count
    await product.incrementView();

    sendResponse(res, 200, 'Product retrieved successfully', product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid product ID');
    }
    sendError(res, 500, 'Failed to retrieve product');
  }
};

// Update product by ID
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If brand is being updated, validate it exists
    if (updateData.brand) {
      const brandExists = await Brand.findById(updateData.brand);
      if (!brandExists) {
        return sendError(res, 404, 'Brand not found');
      }
    }

    // If category is being updated, validate it exists
    if (updateData.category) {
      const categoryExists = await Category.findById(updateData.category);
      if (!categoryExists) {
        return sendError(res, 404, 'Category not found');
      }
    }

    // Build query based on user role
    let query = { _id: id };
    if (req.user.role === 'seller') {
      query.seller = req.user._id; // Sellers can only update their own products
    }

    const product = await Product.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    ).populate(['brand', 'category']);

    if (!product) {
      return sendError(res, 404, 'Product not found or access denied');
    }

    sendResponse(res, 200, 'Product updated successfully', product);
  } catch (error) {
    console.error('Update product error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid product ID');
    }
    if (error.name === 'ValidationError') {
      return sendError(res, 400, error.message);
    }
    sendError(res, 500, 'Failed to update product');
  }
};

// Delete product by ID
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Build query based on user role
    let query = { _id: id };
    if (req.user.role === 'seller') {
      query.seller = req.user._id; // Sellers can only delete their own products
    }

    const product = await Product.findOne(query);
    if (!product) {
      return sendError(res, 404, 'Product not found or access denied');
    }

    // Soft delete by setting status to archived
    product.status = 'archived';
    product.isActive = false;
    await product.save();

    // Remove from seller's products array if seller
    if (req.user.role === 'seller') {
      await req.user.removeProduct(id);
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

// Get products by brand
export const getProductsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return sendError(res, 404, 'Brand not found');
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, totalCount] = await Promise.all([
      Product.find({ brand: brandId, status: 'active', isActive: true })
        .populate('brand', 'name logo')
        .populate('category', 'name slug')
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments({ brand: brandId, status: 'active', isActive: true })
    ]);

    sendResponse(res, 200, 'Products by brand retrieved successfully', {
      brand,
      products,
      totalCount
    });
  } catch (error) {
    console.error('Get products by brand error:', error);
    sendError(res, 500, 'Failed to retrieve products by brand');
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const category = await Category.findById(categoryId);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, totalCount] = await Promise.all([
      Product.find({ category: categoryId, status: 'active', isActive: true })
        .populate('brand', 'name logo')
        .populate('category', 'name slug')
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments({ category: categoryId, status: 'active', isActive: true })
    ]);

    sendResponse(res, 200, 'Products by category retrieved successfully', {
      category,
      products,
      totalCount
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    sendError(res, 500, 'Failed to retrieve products by category');
  }
};

// ===== UTILITY FUNCTIONS =====

// Update product stock (used by order system)
export const updateProductStock = async (productId, quantity, operation = 'decrease') => {
  try {
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

// Update product rating (used by review system)
export const updateProductRating = async (productId) => {
  try {
    const Review = (await import('../models/Review.js')).default;
    const reviews = await Review.find({ product: productId, isApproved: true });
    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        reviewCount: 0
      });
      return { averageRating: 0, reviewCount: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / totalReviews) * 10) / 10;

    await Product.findByIdAndUpdate(productId, {
      averageRating,
      reviewCount: totalReviews
    });

    return { averageRating, reviewCount: totalReviews };
  } catch (error) {
    console.error('Update product rating error:', error);
    throw error;
  }
};

// Check product stock availability
export const checkStockAvailability = async (productId, requestedQuantity) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return { available: false, error: 'Product not found' };
    }

    if (!product.trackQuantity) {
      return { available: true, stock: 'unlimited' };
    }

    if (product.stock < requestedQuantity) {
      return { 
        available: false, 
        error: `Only ${product.stock} items available`,
        availableStock: product.stock
      };
    }

    return { available: true, stock: product.stock };
  } catch (error) {
    console.error('Check stock availability error:', error);
    return { available: false, error: 'Stock check failed' };
  }
};