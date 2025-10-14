import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin-only routes
router.post('/', authenticate, authorize(['admin']), createCategory);
router.put('/:id', authenticate, authorize(['admin']), updateCategory);
router.delete('/:id', authenticate, authorize(['admin']), deleteCategory);

export default router;