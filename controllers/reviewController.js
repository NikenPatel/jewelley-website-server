const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res) => {
    try {
        const { orderId, productId, rating, comment, image } = req.body;
        const userId = req.user._id;

        // Verify order belongs to user and is delivered
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.orderStatus !== "delivered") {
            return res.status(400).json({ message: "Can only review delivered orders" });
        }

        if (order.product.toString() !== productId) {
            return res.status(400).json({ message: "Product does not match order" });
        }

        // Check if user already reviewed this order
        const existingReview = await Review.findOne({ order: orderId, user: userId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this order" });
        }

        const review = await Review.create({
            user: userId,
            product: productId,
            order: orderId,
            rating: Number(rating),
            comment,
            image: image || null,
            isApproved: true,
        });

        // Update product average rating
        const reviews = await Review.find({ product: productId, isApproved: true });
        const numReviews = reviews.length;
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

        await Product.findByIdAndUpdate(productId, {
            "ratings.average": avgRating,
            "ratings.count": numReviews,
        });

        res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId, isApproved: true })
            .populate("user", "name avatar")
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.error("Get Product Reviews Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get top reviews for testimonials
// @route   GET /api/reviews/testimonials
// @access  Public
exports.getTestimonialReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ rating: { $gte: 4 }, isApproved: true })
            .populate("user", "name avatar")
            .populate("product", "name")
            .sort({ createdAt: -1 })
            .limit(6);

        res.status(200).json(reviews);
    } catch (error) {
        console.error("Get Testimonials Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
