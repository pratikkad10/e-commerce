import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Size", "Color"
  value: { type: String, required: true }, // e.g., "Large", "Red"
  price: { type: Number, default: 0 }, // Additional price for this variant
  stock: { type: Number, default: 0 },
  sku: String,
  isActive: { type: Boolean, default: true }
});

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: String,
  comment: String,
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true }
}, {
  timestamps: true
});

const seoSchema = new mongoose.Schema({
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  slug: { type: String, unique: true, sparse: true }
});

const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    maxlength: 500
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  comparePrice: { // Original price for discount display
    type: Number,
    min: 0
  },
  costPrice: { // Cost to seller
    type: Number,
    min: 0
  },
  
  // Inventory
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  barcode: String,
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  trackQuantity: {
    type: Boolean,
    default: true
  },
  
  // Categories & Organization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  tags: [String],
  
  // Media
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  videos: [{
    url: String,
    title: String,
    thumbnail: String
  }],
  
  // Variants (Size, Color, etc.)
  variants: [variantSchema],
  hasVariants: {
    type: Boolean,
    default: false
  },
  
  // Physical Properties
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm' }
  },
  weight: {
    value: Number,
    unit: { type: String, default: 'kg' }
  },
  
  // Shipping
  shippingClass: {
    type: String,
    enum: ['standard', 'heavy', 'fragile', 'digital'],
    default: 'standard'
  },
  freeShipping: {
    type: Boolean,
    default: false
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  
  // Status & Visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDigital: {
    type: Boolean,
    default: false
  },
  
  // SEO
  seo: seoSchema,
  
  // Reviews & Ratings
  reviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },
  
  // Sales Analytics
  totalSales: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  
  // Seller Information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sellerEarnings: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0.1 // 10% default commission
  },
  
  // Additional Attributes (flexible key-value pairs)
  attributes: [{
    name: String,
    value: String
  }],
  
  // Dates
  publishedAt: Date,
  availableFrom: Date,
  availableUntil: Date
}, {
  timestamps: true
});

// Virtual properties
productSchema.virtual('isOnSale').get(function() {
  return this.comparePrice && this.comparePrice > this.price;
});

productSchema.virtual('discountPercentage').get(function() {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

productSchema.virtual('isLowStock').get(function() {
  return this.trackQuantity && this.stock <= this.lowStockThreshold;
});

productSchema.virtual('isOutOfStock').get(function() {
  return this.trackQuantity && this.stock === 0;
});

productSchema.virtual('primaryImage').get(function() {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ totalSales: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'seo.slug': 1 });

// Pre-save middleware
productSchema.pre('save', function(next) {
  try {
    // Generate slug if not provided
    if (!this.seo.slug && this.name) {
      this.seo.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    // Set published date
    if (this.status === 'active' && !this.publishedAt) {
      this.publishedAt = new Date();
    }
    
    // Update hasVariants flag
    this.hasVariants = this.variants && this.variants.length > 0;
    
    next();
  } catch (error) {
    next(error);
  }
});

// Methods
productSchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData);
  this.calculateRating();
  return this.save();
};

productSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
    return;
  }
  
  const approvedReviews = this.reviews.filter(review => review.isApproved);
  this.totalReviews = approvedReviews.length;
  
  if (this.totalReviews === 0) {
    this.averageRating = 0;
    return;
  }
  
  const sum = approvedReviews.reduce((acc, review) => acc + review.rating, 0);
  this.averageRating = Math.round((sum / this.totalReviews) * 10) / 10;
  
  // Update rating distribution
  this.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  approvedReviews.forEach(review => {
    this.ratingDistribution[review.rating]++;
  });
};

productSchema.methods.updateStock = function(quantity, operation = 'subtract') {
  if (!this.trackQuantity) return this.save();
  
  if (operation === 'subtract') {
    this.stock = Math.max(0, this.stock - quantity);
  } else {
    this.stock += quantity;
  }
  
  return this.save();
};

productSchema.methods.recordSale = function(quantity, revenue) {
  this.totalSales += quantity;
  this.totalRevenue += revenue;
  return this.updateStock(quantity, 'subtract');
};

productSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

// Static methods
productSchema.statics.findByCategory = function(categoryId, options = {}) {
  const query = { category: categoryId, status: 'active', isActive: true };
  return this.find(query, null, options);
};

productSchema.statics.findFeatured = function(limit = 10) {
  return this.find({ 
    isFeatured: true, 
    status: 'active', 
    isActive: true 
  }).limit(limit);
};

productSchema.statics.searchProducts = function(searchTerm, options = {}) {
  return this.find({
    $text: { $search: searchTerm },
    status: 'active',
    isActive: true
  }, { score: { $meta: 'textScore' } })
  .sort({ score: { $meta: 'textScore' } })
  .limit(options.limit || 20);
};

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);