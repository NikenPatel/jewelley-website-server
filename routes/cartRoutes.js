const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} = require("../controllers/cartController");

// All routes require authentication
router.use(protect);

// Get cart
router.get("/", getCart);

// Add to cart
router.post("/add", addToCart);

// Update cart item
router.put("/update", updateCartItem);

// Remove from cart
router.delete("/remove", removeFromCart);

// Clear cart
router.delete("/clear", clearCart);

module.exports = router;
