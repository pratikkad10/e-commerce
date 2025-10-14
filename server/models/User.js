import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  phone: String,
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  
  // Profile
  avatar: String,
  role: {
    type: String,
    enum: ['customer', 'admin', 'seller'],
    default: 'customer'
  },
  
  // Seller-specific fields
  storeName: {
    type: String,
    required: function() { return this.role === 'seller'; }
  },
  storeDescription: {
    type: String,
    maxlength: 1000
  },
  storeLogo: String,
  isSellerApproved: {
    type: Boolean,
    default: false
  },
  sellerApprovedAt: Date,
  sellerSuspendedAt: Date,
  sellerSuspensionReason: String,
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Addresses
  addresses: [addressSchema],
  
  // Preferences
  preferences: {
    newsletter: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' }
  },
  
  // Wishlist
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Cart
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Security
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  
  // Analytics
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  
  // Seller Analytics
  totalSales: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Virtual properties
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('cartTotal').get(function() {
  if (!this.cart || !Array.isArray(this.cart)) return 0;
  return this.cart.reduce((total, item) => {
    return total + (item.product?.price * item.quantity || 0);
  }, 0);
});

userSchema.virtual('cartItemCount').get(function() {
  if (!this.cart || !Array.isArray(this.cart)) return 0;
  return this.cart.reduce((total, item) => total + item.quantity, 0);
});

userSchema.virtual('isSellerActive').get(function() {
  return this.role === 'seller' && this.isSellerApproved && !this.sellerSuspendedAt;
});

userSchema.virtual('productCount').get(function() {
  return this.products ? this.products.length : 0;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Cart methods
userSchema.methods.addToCart = function(productId, quantity = 1) {
  const existingItem = this.cart.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.push({ product: productId, quantity });
  }
  
  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  this.cart = this.cart.filter(item => 
    item.product.toString() !== productId.toString()
  );
  return this.save();
};

userSchema.methods.updateCartQuantity = function(productId, quantity) {
  const item = this.cart.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (item) {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    item.quantity = quantity;
    return this.save();
  }
};

userSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};

// Wishlist methods
userSchema.methods.addToWishlist = function(productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
    return this.save();
  }
};

userSchema.methods.removeFromWishlist = function(productId) {
  this.wishlist = this.wishlist.filter(id => 
    id.toString() !== productId.toString()
  );
  return this.save();
};

// Address methods
userSchema.methods.addAddress = function(addressData) {
  if (addressData.isDefault) {
    this.addresses.forEach(addr => addr.isDefault = false);
  }
  this.addresses.push(addressData);
  return this.save();
};

userSchema.methods.setDefaultAddress = function(addressId) {
  this.addresses.forEach(addr => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  });
  return this.save();
};

// Order analytics
userSchema.methods.updateOrderStats = function(orderAmount) {
  this.totalOrders += 1;
  this.totalSpent += orderAmount;
  this.loyaltyPoints += Math.floor(orderAmount / 100); // 1 point per 100 currency
  return this.save();
};

// Seller methods
userSchema.methods.addProduct = function(productId) {
  if (!this.products.includes(productId)) {
    this.products.push(productId);
    return this.save();
  }
};

userSchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(id => 
    id.toString() !== productId.toString()
  );
  return this.save();
};

userSchema.methods.updateSellerStats = function(saleAmount) {
  this.totalSales += 1;
  this.totalEarnings += saleAmount;
  return this.save();
};

userSchema.methods.approveSeller = function() {
  this.isSellerApproved = true;
  this.sellerApprovedAt = new Date();
  this.sellerSuspendedAt = undefined;
  this.sellerSuspensionReason = undefined;
  return this.save();
};

userSchema.methods.suspendSeller = function(reason) {
  this.sellerSuspendedAt = new Date();
  this.sellerSuspensionReason = reason;
  return this.save();
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model('User', userSchema);