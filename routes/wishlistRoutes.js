const express = require("express");
const router = express.Router();

const {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    checkWishlistItem,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addToWishlist);

router.get("/", protect, getWishlist);

router.delete("/:productId", protect, removeFromWishlist);

router.get(
    "/check/:productId",
    protect,
    checkWishlistItem
);

module.exports = router;