import express from 'express';
import { 
  register, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  resendVerification,
  logout 
} from '../controllers/authController.js';

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/login', login);

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Logout route
router.post('/logout', logout);

export default router;