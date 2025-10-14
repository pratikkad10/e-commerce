import cloudinary from '../config/cloudinary.js';

/**
 * Generate optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    fetch_format: 'auto'
  });
};

/**
 * Generate thumbnail URL
 * @param {string} publicId - Cloudinary public ID
 * @param {number} size - Thumbnail size (default: 150)
 * @returns {string} - Thumbnail URL
 */
export const getThumbnailUrl = (publicId, size = 150) => {
  return cloudinary.url(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
};

/**
 * Validate file type
 * @param {string} mimetype - File mimetype
 * @param {array} allowedTypes - Array of allowed mimetypes
 * @returns {boolean} - Is valid file type
 */
export const isValidFileType = (mimetype, allowedTypes) => {
  return allowedTypes.includes(mimetype);
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Delete multiple files from Cloudinary
 * @param {array} publicIds - Array of public IDs to delete
 * @returns {object} - Deletion results
 */
export const deleteMultipleFiles = async (publicIds) => {
  try {
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      throw new Error('Invalid publicIds array provided');
    }
    
    const result = await cloudinary.api.delete_resources(publicIds);
    return {
      success: true,
      deleted: result.deleted,
      notFound: result.not_found || []
    };
  } catch (error) {
    console.error('Failed to delete multiple files:', error);
    return {
      success: false,
      error: error.message
    };
  }
};