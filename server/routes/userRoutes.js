import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  adminGetAllUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminToggleUserStatus
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/change-password', changePassword);

// Address routes
router.post('/address', addAddress);
router.put('/address/:id', updateAddress);
router.delete('/address/:id', deleteAddress);

// Admin routes for user management
router.get('/admin/all', authorize(['admin']), adminGetAllUsers);
router.post('/admin/create', authorize(['admin']), adminCreateUser);
router.put('/admin/:id', authorize(['admin']), adminUpdateUser);
router.delete('/admin/:id', authorize(['admin']), adminDeleteUser);
router.put('/admin/:id/status', authorize(['admin']), adminToggleUserStatus);

export default router;