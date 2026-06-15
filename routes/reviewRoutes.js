const express = require("express");
const router = express.Router();
const {
    addReview,
    getProductReviews,
    getTestimonialReviews,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.get("/product/:productId", getProductReviews);
router.get("/testimonials", getTestimonialReviews);

// Protected routes
router.post("/", protect, addReview);

module.exports = router;
