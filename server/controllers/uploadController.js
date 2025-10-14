import cloudinary from '../config/cloudinary.js';
import { sendResponse, sendError } from '../utils/response.js';

// Single file upload
export const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded');
    }

    const fileData = {
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      format: req.file.format || req.file.mimetype?.split('/')[1] || 'unknown',
      resourceType: req.file.resource_type || 'auto'
    };

    sendResponse(res, 200, 'File uploaded successfully', fileData);
  } catch (error) {
    console.error('Single file upload error:', error);
    sendError(res, 500, `Upload failed: ${error.message}`);
  }
};

// Multiple files upload
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, 'No files uploaded');
    }

    const filesData = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      size: file.size,
      format: file.format || file.mimetype.split('/')[1],
      resourceType: file.resource_type || 'auto'
    }));

    sendResponse(res, 200, 'Files uploaded successfully', {
      count: filesData.length,
      files: filesData
    });
  } catch (error) {
    sendError(res, 500, `Upload failed: ${error.message}`);
  }
};

// Upload with different field names
export const uploadWithFields = async (req, res) => {
  try {
    const result = {};
    
    if (req.files.images) {
      result.images = req.files.images.map(file => ({
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        format: file.format || file.mimetype.split('/')[1]
      }));
    }

    if (req.files.documents) {
      result.documents = req.files.documents.map(file => ({
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        format: file.format || file.mimetype.split('/')[1]
      }));
    }

    if (Object.keys(result).length === 0) {
      return sendError(res, 400, 'No files uploaded');
    }

    sendResponse(res, 200, 'Files uploaded successfully', result);
  } catch (error) {
    sendError(res, 500, `Upload failed: ${error.message}`);
  }
};

// Delete file from Cloudinary
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return sendError(res, 400, 'Public ID is required');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      sendResponse(res, 200, 'File deleted successfully', { publicId });
    } else {
      sendError(res, 404, 'File not found or already deleted');
    }
  } catch (error) {
    sendError(res, 500, `Delete failed: ${error.message}`);
  }
};

// Get file details from Cloudinary
export const getFileDetails = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return sendError(res, 400, 'Public ID is required');
    }

    const result = await cloudinary.api.resource(publicId);
    
    const fileData = {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      createdAt: result.created_at,
      resourceType: result.resource_type
    };

    sendResponse(res, 200, 'File details retrieved', fileData);
  } catch (error) {
    if (error.http_code === 404) {
      sendError(res, 404, 'File not found');
    } else {
      sendError(res, 500, `Failed to get file details: ${error.message}`);
    }
  }
};