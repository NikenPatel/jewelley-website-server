const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Coupon description is required']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: true,
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required']
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null // Only relevant for percentage discounts
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFirstOrderOnly: {
    type: Boolean,
    default: false
  },
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Check if coupon is valid (time-based & limit-based)
couponSchema.methods.isValid = function() {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive.' };
  if (now < this.startDate) return { valid: false, message: 'Coupon is not yet active.' };
  if (now > this.expiryDate) return { valid: false, message: 'Coupon has expired.' };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached.' };
  return { valid: true };
};

module.exports = mongoose.model('Coupon', couponSchema);
