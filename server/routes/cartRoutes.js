import express from 'express';
import { 
  addToCart, 
  removeFromCart, 
  updateCartItem, 
  getUserCart, 
  clearCart,
  getCartSummary 
} from '../controllers/cartController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/', getUserCart);

// Get cart summary (item count and total)
router.get('/summary', getCartSummary);

// Add product to cart
router.post('/add', addToCart);

// Update cart item quantity
router.put('/item/:itemId', updateCartItem);

// Remove item from cart
router.delete('/item/:itemId', removeFromCart);

// Clear entire cart
router.delete('/clear', clearCart);

export default router;