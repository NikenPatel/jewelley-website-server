const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
    buyNow,
    placeOrderFromCart,
    getMyOrders,
    getOrderById,
    cancelOrder,
    requestReturn,
} = require("../controllers/orderController");

// All user order routes require authentication
router.use(protect);

// Place a direct order (Buy Now)
router.post("/buy-now", buyNow);

// Place order from the cart
router.post("/checkout", placeOrderFromCart);

// Get all logged-in user's orders
router.get("/my-orders", getMyOrders);

// Get specific order details
router.get("/:id", getOrderById);

// Cancel an order
router.put("/:id/cancel", cancelOrder);

// Request order return
router.put("/:id/return", requestReturn);

module.exports = router;
