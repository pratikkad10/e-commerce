import express from 'express';
import { handleQuery } from '../controllers/aiAssistantController.js';

const router = express.Router();

// Optional authentication middleware for AI assistant
const optionalAuth = async (req, res, next) => {
  try {
    const { verifyToken } = await import('../utils/tokens.js');
    const User = (await import('../models/User.js')).default;
    
    // Try multiple token sources
    let token = req.cookies?.token || req.cookies?.authToken || req.cookies?.jwt;
    
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail - guest access allowed
    console.log('Optional auth failed:', error.message);
  }
  next();
};

// AI Assistant query endpoint with optional authentication
router.post('/query', optionalAuth, handleQuery);

export default router;