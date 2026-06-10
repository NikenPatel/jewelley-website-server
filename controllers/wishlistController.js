const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// =====================
// Add To Wishlist
// =====================
const addToWishlist = async (req, res) => {
    try {
        const { productId, variantId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }

        // Check product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Find user's wishlist
        let wishlist = await Wishlist.findOne({
            user: req.user.id,
        });

        // Create wishlist if not exists
        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user.id,
                products: [],
            });
        }

        // Check existing item
        const existingItem = wishlist.products.find(
            (item) =>
                item.product.toString() === productId &&
                item.variantId === (variantId || null)
        );

        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: "Product already in wishlist",
            });
        }

        // Add product
        wishlist.products.push({
            product: productId,
            variantId: variantId || null,
        });

        await wishlist.save();

        // Populate products
        await wishlist.populate("products.product");

        res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            wishlist,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================
// Remove From Wishlist
// =====================
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({
            user: req.user.id,
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found",
            });
        }

        // Remove item
        wishlist.products = wishlist.products.filter(
            (item) => item.product.toString() !== productId
        );

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            wishlist,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================
// Get Wishlist
// =====================
const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.user.id,
        }).populate("products.product");

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                count: 0,
                products: [],
            });
        }

        res.status(200).json({
            success: true,
            count: wishlist.products.length,
            products: wishlist.products,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================
// Check Wishlist Item
// =====================
const checkWishlistItem = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({
            user: req.user.id,
        });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                isWishlisted: false,
            });
        }

        const exists = wishlist.products.some(
            (item) => item.product.toString() === productId
        );

        res.status(200).json({
            success: true,
            isWishlisted: exists,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    checkWishlistItem,
};