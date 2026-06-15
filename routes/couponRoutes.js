const express = require('express');
const router = express.Router();
const {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} = require('../controllers/couponController');
const { protect, adminAuth } = require('../middleware/authMiddleware');

// Customer Routes
router.post('/validate', protect, validateCoupon);

// Admin Routes
router.route('/')
    .get(protect, adminAuth, getAllCoupons)
    .post(protect, adminAuth, createCoupon);

router.route('/:id')
    .put(protect, adminAuth, updateCoupon)
    .delete(protect, adminAuth, deleteCoupon);

module.exports = router;
