import express from 'express';
import multer from 'multer';
import { 
  uploadSingleFile, 
  uploadMultipleFiles, 
  uploadWithFields, 
  deleteFile, 
  getFileDetails 
} from '../controllers/uploadController.js';
import { uploadSingle, uploadMultiple, uploadFields } from '../middlewares/upload.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Upload routes (protected - require authentication)
router.post('/single', authenticate, uploadSingle, uploadSingleFile);
router.post('/multiple', authenticate, uploadMultiple, uploadMultipleFiles);
router.post('/fields', authenticate, uploadFields, uploadWithFields);

// File management routes
router.delete('/:publicId', authenticate, deleteFile);
router.get('/:publicId', authenticate, getFileDetails);

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  try {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.'
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 5 files allowed.'
        });
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name for file upload.'
        });
      }
    }
    
    if (error.message && error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    next(error);
  } catch (err) {
    console.error('Error in upload error handler:', err);
    res.status(500).json({
      success: false,
      message: 'Upload error handling failed'
    });
  }
});

export default router;