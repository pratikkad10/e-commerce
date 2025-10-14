import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Payment Method
  method: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cod'],
    required: true
  },
  
  // Card Details (if applicable)
  cardDetails: {
    last4: String,
    brand: String, // visa, mastercard, etc.
    expiryMonth: Number,
    expiryYear: Number,
    cardholderName: String
  },
  
  // UPI Details (if applicable)
  upiDetails: {
    vpa: String, // Virtual Payment Address
    transactionId: String
  },
  
  // Bank Details (if applicable)
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String
  },
  
  // Wallet Details (if applicable)
  walletDetails: {
    provider: String, // paytm, phonepe, etc.
    walletId: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  // Gateway Information
  gateway: {
    provider: String, // razorpay, stripe, payu, etc.
    transactionId: String,
    gatewayOrderId: String,
    gatewayPaymentId: String,
    signature: String
  },
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  failedAt: Date,
  
  // Failure Information
  failureReason: String,
  failureCode: String,
  
  // Refund Information
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    },
    processedAt: Date,
    refundedAt: Date
  }],
  
  // Additional Data
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceId: String
  },
  
  // Webhook Data
  webhookData: mongoose.Schema.Types.Mixed,
  
  // Notes
  notes: String
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ 'gateway.provider': 1, 'gateway.transactionId': 1 });

// Virtual properties
paymentSchema.virtual('totalRefunded').get(function() {
  return this.refunds
    .filter(refund => refund.status === 'processed')
    .reduce((total, refund) => total + refund.amount, 0);
});

paymentSchema.virtual('canRefund').get(function() {
  return this.status === 'completed' && this.totalRefunded < this.amount;
});

paymentSchema.virtual('isFullyRefunded').get(function() {
  return this.totalRefunded >= this.amount;
});

// Methods
paymentSchema.methods.markCompleted = function(gatewayData = {}) {
  try {
    this.status = 'completed';
    this.completedAt = new Date();
    
    if (gatewayData.transactionId) {
      this.gateway.transactionId = gatewayData.transactionId;
    }
    if (gatewayData.gatewayPaymentId) {
      this.gateway.gatewayPaymentId = gatewayData.gatewayPaymentId;
    }
    if (gatewayData.signature) {
      this.gateway.signature = gatewayData.signature;
    }
    
    return this.save();
  } catch (error) {
    throw new Error(`Failed to mark payment as completed: ${error.message}`);
  }
};

paymentSchema.methods.markFailed = function(reason, code) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  this.failureCode = code;
  return this.save();
};

paymentSchema.methods.addRefund = function(refundData) {
  try {
    if (!refundData || !refundData.refundId || !refundData.amount) {
      throw new Error('Invalid refund data provided');
    }
    
    this.refunds.push({
      refundId: refundData.refundId,
      amount: refundData.amount,
      reason: refundData.reason,
      status: 'pending',
      processedAt: new Date()
    });
    
    // Update payment status
    const totalRefunded = this.totalRefunded + refundData.amount;
    if (totalRefunded >= this.amount) {
      this.status = 'refunded';
    } else {
      this.status = 'partially_refunded';
    }
    
    return this.save();
  } catch (error) {
    throw new Error(`Failed to add refund: ${error.message}`);
  }
};

paymentSchema.methods.updateRefundStatus = function(refundId, status) {
  const refund = this.refunds.find(r => r.refundId === refundId);
  if (refund) {
    refund.status = status;
    if (status === 'processed') {
      refund.refundedAt = new Date();
    }
    return this.save();
  }
};

// Static methods
paymentSchema.statics.findByOrderId = function(orderId) {
  return this.findOne({ order: orderId });
};

paymentSchema.statics.findByGatewayTransactionId = function(transactionId) {
  return this.findOne({ 'gateway.transactionId': transactionId });
};

paymentSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Payment', paymentSchema);