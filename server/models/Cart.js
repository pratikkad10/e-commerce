import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    name: String,
    value: String,
    price: Number
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  coupon: {
    code: String,
    discount: Number,
    type: { type: String, enum: ['percentage', 'fixed'] }
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Virtual properties
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

cartSchema.virtual('discountAmount').get(function() {
  if (!this.coupon) return 0;
  const subtotal = this.subtotal;
  return this.coupon.type === 'percentage' 
    ? (subtotal * this.coupon.discount / 100)
    : this.coupon.discount;
});

cartSchema.virtual('total').get(function() {
  return this.subtotal - this.discountAmount + this.shippingCost + this.taxAmount;
});

cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

// Methods
cartSchema.methods.addItem = function(productId, quantity, price, variant = null) {
  try {
    const productIdStr = productId.toString();
    const variantStr = variant ? JSON.stringify(variant) : null;
    
    const existingItem = this.items.find(item => 
      item.product.toString() === productIdStr &&
      JSON.stringify(item.variant) === variantStr
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product: productId, quantity, price, variant });
    }
    
    return this.save();
  } catch (error) {
    throw new Error(`Failed to add item to cart: ${error.message}`);
  }
};

cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  return this.save();
};

cartSchema.methods.updateQuantity = function(itemId, quantity) {
  const item = this.items.find(item => item._id.toString() === itemId.toString());
  if (item) {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }
    item.quantity = quantity;
    return this.save();
  }
};

cartSchema.methods.applyCoupon = function(couponData) {
  this.coupon = couponData;
  return this.save();
};

cartSchema.methods.clear = function() {
  this.items = [];
  this.coupon = undefined;
  return this.save();
};

cartSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Cart', cartSchema);