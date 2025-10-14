import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productSnapshot: {
    name: String,
    image: String,
    sku: String
  },
  variant: {
    name: String,
    value: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  sellerEarnings: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0
  },
  itemStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order Items
  items: [orderItemSchema],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  
  // Coupon
  coupon: {
    code: String,
    discount: Number,
    type: { type: String, enum: ['percentage', 'fixed'] }
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cod', 'cash_on_delivery', 'credit_card'],
    required: true
  },
  paymentId: String,
  
  // Razorpay Payment Fields
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'cod'],
    default: 'razorpay'
  },
  receipt: String,
  transactionDate: Date,
  
  // Shipping
  shippingAddress: shippingAddressSchema,
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight'],
    default: 'standard'
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  
  // Dates
  orderDate: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
  // Notes
  customerNotes: String,
  adminNotes: String,
  
  // Refund
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  refundedAt: Date
}, {
  timestamps: true
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Virtual properties
orderSchema.virtual('canCancel').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

orderSchema.virtual('canRefund').get(function() {
  return ['delivered'].includes(this.status) && this.paymentStatus === 'paid';
});

orderSchema.virtual('totalItems').get(function() {
  if (!this.items || this.items.length === 0) return 0;
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

// Methods
orderSchema.methods.updateStatus = function(newStatus) {
  const now = new Date();
  this.status = newStatus;
  
  switch (newStatus) {
    case 'confirmed':
      this.confirmedAt = now;
      break;
    case 'shipped':
      this.shippedAt = now;
      break;
    case 'delivered':
      this.deliveredAt = now;
      break;
    case 'cancelled':
      this.cancelledAt = now;
      break;
  }
  
  return this.save();
};

orderSchema.methods.processRefund = function(amount, reason) {
  this.refundAmount += amount;
  this.refundReason = reason;
  this.refundedAt = new Date();
  
  if (this.refundAmount >= this.total) {
    this.paymentStatus = 'refunded';
    this.status = 'refunded';
  } else {
    this.paymentStatus = 'partially_refunded';
  }
  
  return this.save();
};

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'items.seller': 1 });
orderSchema.index({ 'items.seller': 1, createdAt: -1 });

orderSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Order', orderSchema);