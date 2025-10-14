import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Review Content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Media
  images: [{
    url: String,
    alt: String
  }],
  videos: [{
    url: String,
    title: String,
    thumbnail: String
  }],
  
  // Status
  isApproved: {
    type: Boolean,
    default: true
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Engagement
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  
  // Seller Response
  sellerResponse: {
    message: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Moderation
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationReason: String
}, {
  timestamps: true
});

// Compound index to prevent duplicate reviews
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Other indexes
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isVerifiedPurchase: 1 });

// Virtual properties
reviewSchema.virtual('isHelpful').get(function() {
  return this.helpfulVotes > 0;
});

// Methods
reviewSchema.methods.addHelpfulVote = function() {
  this.helpfulVotes += 1;
  return this.save();
};

reviewSchema.methods.removeHelpfulVote = function() {
  this.helpfulVotes = Math.max(0, this.helpfulVotes - 1);
  return this.save();
};

reviewSchema.methods.addSellerResponse = function(message, sellerId) {
  this.sellerResponse = {
    message,
    respondedAt: new Date(),
    respondedBy: sellerId
  };
  return this.save();
};

reviewSchema.methods.moderate = function(isApproved, reason, moderatorId) {
  this.isApproved = isApproved;
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.moderationReason = reason;
  return this.save();
};

reviewSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Review', reviewSchema);