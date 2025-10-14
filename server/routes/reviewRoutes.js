import express from 'express';
import { 
  addReview, 
  getProductReviews, 
  getUserReviews, 
  updateReview,
  deleteReview,
  getReviewById,
  addHelpfulVote
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { uploadFields } from '../middlewares/upload.js';

const router = express.Router();

// Ensure JSON parsing
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/:id', getReviewById);

// Authenticated routes
router.use(authenticate);

// User routes
router.post('/', uploadFields, addReview);
router.get('/user/my-reviews', getUserReviews);
router.put('/:id', uploadFields, updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/helpful', addHelpfulVote);

export default router;