import express from 'express';

// Import all route modules
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import productRoutes from './productRoutes.js';
import brandRoutes from './brandRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import uploadRouter from './uploadRoutes.js';
import videoRoutes from './videoRoutes.js';
import adminRoutes from './adminRoutes.js';
import sellerRoutes from './sellerRoutes.js';
import testRoutes from './testRoutes.js';
import aiAssistantRoutes from './aiAssistantRoutes.js';

const router = express.Router();

// API status endpoint
router.get('/', (req, res) => {
  res.json({ 
    message: 'E-commerce API Server',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      brands: '/api/brands',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders',
      payments: '/api/payments',
      reviews: '/api/reviews',
      upload: '/api/upload',
      videos: '/api/videos',
      admin: '/api/admin',
      seller: '/api/seller',
      test: '/api/test',
      ai: '/api/ai'
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/brands', brandRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/upload', uploadRouter);
router.use('/videos', videoRoutes);
router.use('/admin', adminRoutes);
router.use('/seller', sellerRoutes);
router.use('/test', testRoutes);
router.use('/ai', aiAssistantRoutes);

export default router;