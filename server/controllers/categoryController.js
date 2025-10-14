import Category from '../models/Category.js';
import { sendResponse, sendError } from '../utils/response.js';

// Create category (admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description, slug, parent } = req.body;

    if (!name) {
      return sendError(res, 400, 'Category name is required');
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return sendError(res, 409, 'Category already exists');
    }

    const category = new Category({
      name,
      description,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      parent
    });

    await category.save();
    sendResponse(res, 201, 'Category created successfully', category);
  } catch (error) {
    console.error('Create category error:', error);
    sendError(res, 500, 'Failed to create category');
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, parentOnly } = req.query;

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (parentOnly === 'true') {
      filter.parent = null;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [categories, totalCount] = await Promise.all([
      Category.find(filter)
        .populate('parent', 'name slug')
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
    console.error('Get all categories error:', error);
    sendError(res, 500, 'Failed to retrieve categories');
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id)
      .populate('parent', 'name slug');
    
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    sendResponse(res, 200, 'Category retrieved successfully', category);
  } catch (error) {
    console.error('Get category by ID error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid category ID');
    }
    sendError(res, 500, 'Failed to retrieve category');
  }
};

// Update category (admin only)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parent', 'name slug');

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    sendResponse(res, 200, 'Category updated successfully', category);
  } catch (error) {
    console.error('Update category error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid category ID');
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return sendError(res, 400, `Validation failed: ${validationErrors.join(', ')}`);
    }
    
    sendError(res, 500, `Failed to update category: ${error.message}`);
  }
};

// Delete category (admin only)
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