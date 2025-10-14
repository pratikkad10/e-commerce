import express from 'express';
import { uploadVideo, uploadVideos } from '../middlewares/upload.js';
import { sendResponse, sendError } from '../utils/response.js';

const router = express.Router();

// Upload single video
router.post('/upload', uploadVideo, async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No video file provided');
    }

    const videoData = {
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      format: req.file.format,
      resourceType: req.file.resource_type,
      duration: req.file.duration, // Video duration in seconds
      width: req.file.width,
      height: req.file.height
    };

    sendResponse(res, 200, 'Video uploaded successfully', { video: videoData });
  } catch (error) {
    console.error('Video upload error:', error);
    sendError(res, 500, 'Video upload failed');
  }
});

// Upload multiple videos
router.post('/upload-multiple', uploadVideos, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, 'No video files provided');
    }

    const videos = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      size: file.size,
      format: file.format,
      resourceType: file.resource_type,
      duration: file.duration,
      width: file.width,
      height: file.height
    }));

    sendResponse(res, 200, 'Videos uploaded successfully', { videos });
  } catch (error) {
    console.error('Multiple video upload error:', error);
    sendError(res, 500, 'Video upload failed');
  }
});

export default router;