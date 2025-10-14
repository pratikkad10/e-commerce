import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// File filter for validation
const fileFilter = (req, file, cb) => {
  // Allow images, videos, and PDFs
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos (MP4, AVI, MOV, WMV, FLV, WebM) and PDFs are allowed.'), false);
  }
};

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const timestamp = Date.now();
    const originalName = file.originalname.split('.')[0];
    const isVideo = file.mimetype.startsWith('video/');
    
    return {
      folder: 'ecommerce',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
      resource_type: isVideo ? 'video' : 'auto',
      public_id: `${originalName}-${timestamp}`
    };
  }
});

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    files: 5 // Maximum 5 files per request
  }
});

// Different upload configurations
export const uploadSingle = upload.single('file'); // Single file upload
export const uploadMultiple = upload.array('files', 5); // Multiple files (max 5)
export const uploadFields = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 3 },
  { name: 'documents', maxCount: 2 }
]);

// Video-specific upload
export const uploadVideo = upload.single('video');
export const uploadVideos = upload.array('videos', 3);

export default upload;