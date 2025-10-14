import Brand from '../models/Brand.js';
import { sendResponse, sendError } from '../utils/response.js';

// Create brand (admin only)
export const createBrand = async (req, res) => {
  try {
    const { name, description, logo, website } = req.body;

    if (!name) {
      return sendError(res, 400, 'Brand name is required');
    }

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return sendError(res, 409, 'Brand already exists');
    }

    const brand = new Brand({
      name,
      description,
      logo,
      website
    });

    await brand.save();
    sendResponse(res, 201, 'Brand created successfully', brand);
  } catch (error) {
    console.error('Create brand error:', error);
    sendError(res, 500, 'Failed to create brand');
  }
};

// Get all brands
export const getAllBrands = async (req, res) => {
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
    console.error('Get all brands error:', error);
    sendError(res, 500, 'Failed to retrieve brands');
  }
};

// Get brand by ID
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return sendError(res, 404, 'Brand not found');
    }

    sendResponse(res, 200, 'Brand retrieved successfully', brand);
  } catch (error) {
    console.error('Get brand by ID error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid brand ID');
    }
    sendError(res, 500, 'Failed to retrieve brand');
  }
};

// Update brand (admin only)
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

// Delete brand (admin only)
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