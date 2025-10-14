import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { sendReviewThankYou, sendNewReviewNotification, sendAdminNotification } from '../utils/emailEvents.js';
import { sendResponse, sendError } from '../utils/response.js';



// Add review
export const addReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body || {};
    const userId = req.user._id;

    if (!productId || !rating || !comment) {
      return sendError(res, 400, 'Product ID, rating, and comment are required');
    }

    if (rating < 1 || rating > 5) {
      return sendError(res, 400, 'Rating must be between 1 and 5');
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active' || !product.isActive) {
      return sendError(res, 404, 'Product not found or unavailable');
    }

    // Prevent sellers from reviewing their own products
    if (product.seller.toString() === userId.toString()) {
      return sendError(res, 403, 'Sellers cannot review their own products');
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return sendError(res, 409, 'You have already reviewed this product');
    }

    // Check if user purchased this product (for verified purchase)
    const userOrder = await Order.findOne({
      user: userId,
      'items.product': productId,
      status: 'delivered'
    });

    // Handle uploaded images
    const images = [];
    if (req.files?.images) {
      req.files.images.forEach(file => {
        images.push({ url: file.path, alt: 'Review image' });
      });
    }

    // Handle uploaded videos
    const videos = [];
    if (req.files?.videos) {
      req.files.videos.forEach(file => {
        videos.push({ url: file.path, title: 'Review video', thumbnail: file.path.replace(/\.[^.]+$/, '.jpg') });
      });
    }

    // Create review
    const review = new Review({
      user: userId,
      product: productId,
      order: userOrder?._id,
      rating,
      title,
      comment,
      images,
      videos,
      isVerifiedPurchase: !!userOrder
    });

    await review.save();

    // Update product rating
    await updateProductRating(productId);

    // Populate review for response
    await review.populate([
      { path: 'user', select: 'firstName lastName email' },
      { 
        path: 'product', 
        select: 'name images seller',
        populate: [
          { path: 'brand', select: 'name logo' },
          { path: 'category', select: 'name slug' },
          { path: 'seller', select: 'name email storeName' }
        ]
      }
    ]);

    // Send thank you email to reviewer
    sendReviewThankYou(review.user, review, review.product).catch(err => 
      console.error('Review thank you email failed:', err)
    );

    // Send notification to seller if product has a seller
    if (review.product.seller) {
      sendNewReviewNotification(review.product.seller, review, review.product).catch(err => 
        console.error('Seller review notification failed:', err)
      );
    }

    // Send notification to admin about new review
    sendAdminNotification('newReview', {
      user: review.user,
      product: review.product,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    }).catch(err => console.error('Admin review notification failed:', err));

    sendResponse(res, 201, 'Review added successfully', review);
  } catch (error) {
    console.error('Add review error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.code === 11000) {
      return sendError(res, 409, 'You have already reviewed this product');
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return sendError(res, 400, `Validation failed: ${validationErrors.join(', ')}`);
    }
    
    sendError(res, 500, `Failed to add review: ${error.message}`);
  }
};

// Get product reviews
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt',
      order = 'desc',
      rating,
      verified
    } = req.query;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // Build filter
    const filter = { product: productId, isApproved: true };
    if (rating) filter.rating = Number(rating);
    if (verified === 'true') filter.isVerifiedPurchase = true;

    // Build sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute queries
    const [reviews, totalCount] = await Promise.all([
      Review.find(filter)
        .populate('user', 'firstName lastName')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    // Get rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { product: productId, isApproved: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    sendResponse(res, 200, 'Product reviews retrieved successfully', {
      reviews,
      ratingStats,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid product ID');
    }
    sendError(res, 500, 'Failed to retrieve product reviews');
  }
};

// Get user reviews
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt',
      order = 'desc',
      rating
    } = req.query;

    // Build filter
    const filter = { user: userId };
    if (rating) filter.rating = Number(rating);

    // Build sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute queries
    const [reviews, totalCount] = await Promise.all([
      Review.find(filter)
        .populate({
          path: 'product',
          select: 'name images averageRating',
          populate: [
            { path: 'brand', select: 'name logo' },
            { path: 'category', select: 'name slug' }
          ]
        })
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    sendResponse(res, 200, 'User reviews retrieved successfully', {
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    sendError(res, 500, 'Failed to retrieve user reviews');
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user._id;

    if (rating && (rating < 1 || rating > 5)) {
      return sendError(res, 400, 'Rating must be between 1 and 5');
    }

    const review = await Review.findOne({ _id: id, user: userId });
    if (!review) {
      return sendError(res, 404, 'Review not found or you are not authorized to update it');
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    
    // Handle uploaded images
    if (req.files?.images) {
      const images = [];
      req.files.images.forEach(file => {
        images.push({ url: file.path, alt: 'Review image' });
      });
      review.images = images;
    }

    // Handle uploaded videos
    if (req.files?.videos) {
      const videos = [];
      req.files.videos.forEach(file => {
        videos.push({ url: file.path, title: 'Review video', thumbnail: file.path.replace(/\.[^.]+$/, '.jpg') });
      });
      review.videos = videos;
    }

    await review.save();

    // Update product rating if rating changed
    if (rating !== undefined) {
      await updateProductRating(review.product);
    }

    // Populate review for response
    await review.populate([
      { path: 'user', select: 'firstName lastName' },
      { 
        path: 'product', 
        select: 'name images',
        populate: [
          { path: 'brand', select: 'name logo' },
          { path: 'category', select: 'name slug' }
        ]
      }
    ]);

    sendResponse(res, 200, 'Review updated successfully', review);
  } catch (error) {
    console.error('Update review error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid review ID');
    }
    sendError(res, 500, 'Failed to update review');
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find review - admin can delete any review, user can only delete their own
    const filter = userRole === 'admin' ? { _id: id } : { _id: id, user: userId };
    const review = await Review.findOne(filter);

    if (!review) {
      return sendError(res, 404, 'Review not found or you are not authorized to delete it');
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);

    // Update product rating
    await updateProductRating(productId);

    sendResponse(res, 200, 'Review deleted successfully', { id });
  } catch (error) {
    console.error('Delete review error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid review ID');
    }
    sendError(res, 500, 'Failed to delete review');
  }
};

// Get single review
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('user', 'firstName lastName')
      .populate({
        path: 'product',
        select: 'name images averageRating',
        populate: [
          { path: 'brand', select: 'name logo' },
          { path: 'category', select: 'name slug' }
        ]
      });

    if (!review) {
      return sendError(res, 404, 'Review not found');
    }

    sendResponse(res, 200, 'Review retrieved successfully', review);
  } catch (error) {
    console.error('Get review by ID error:', error);
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Invalid review ID');
    }
    sendError(res, 500, 'Failed to retrieve review');
  }
};

// Add helpful vote
export const addHelpfulVote = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return sendError(res, 404, 'Review not found');
    }

    await review.addHelpfulVote();

    sendResponse(res, 200, 'Helpful vote added successfully', { 
      helpfulVotes: review.helpfulVotes 
    });
  } catch (error) {
    console.error('Add helpful vote error:', error);
    sendError(res, 500, 'Failed to add helpful vote');
  }
};

// ===== ADMIN FUNCTIONS =====

// Admin: Delete any review
export const adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return sendError(res, 404, 'Review not found');
    }

    const productId = review.product;
    
    // Add moderation info before deletion
    if (reason) {
      review.moderationReason = reason;
      review.moderatedBy = req.user._id;
      review.moderatedAt = new Date();
      await review.save();
    }

    await Review.findByIdAndDelete(id);

    // Update product rating
    await updateProductRating(productId);

    sendResponse(res, 200, 'Review deleted successfully', { id, reason });
  } catch (error) {
    console.error('Admin delete review error:', error);
    sendError(res, 500, 'Failed to delete review');
  }
};

// Admin: Moderate review (approve/reject)
export const moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, reason } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return sendError(res, 404, 'Review not found');
    }

    await review.moderate(isApproved, reason, req.user._id);

    // Update product rating if approval status changed
    await updateProductRating(review.product);

    await review.populate([
      { path: 'user', select: 'firstName lastName' },
      { 
        path: 'product', 
        select: 'name images',
        populate: [
          { path: 'brand', select: 'name logo' },
          { path: 'category', select: 'name slug' }
        ]
      }
    ]);

    sendResponse(res, 200, 'Review moderated successfully', review);
  } catch (error) {
    console.error('Moderate review error:', error);
    sendError(res, 500, 'Failed to moderate review');
  }
};

// ===== UTILITY FUNCTIONS =====

// Update product rating (shared utility)
export const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId, isApproved: true });
    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        reviewCount: 0
      });
      return { averageRating: 0, reviewCount: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / totalReviews) * 10) / 10;

    await Product.findByIdAndUpdate(productId, {
      averageRating,
      reviewCount: totalReviews
    });

    return { averageRating, reviewCount: totalReviews };
  } catch (error) {
    console.error('Update product rating error:', error);
    throw error;
  }
};

// Check if user can review product (purchased and not already reviewed)
export const canUserReviewProduct = async (userId, productId) => {
  try {
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return { canReview: false, reason: 'Already reviewed this product' };
    }

    // Check if user purchased this product
    const Order = (await import('../models/Order.js')).default;
    const userOrder = await Order.findOne({
      user: userId,
      'items.product': productId,
      status: 'delivered'
    });

    if (!userOrder) {
      return { canReview: false, reason: 'Must purchase product to review' };
    }

    return { canReview: true };
  } catch (error) {
    console.error('Can user review product error:', error);
    return { canReview: false, reason: 'Review check failed' };
  }
};