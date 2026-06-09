const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const { productId, variantId, quantity, customization } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!productId || !variantId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "productId, variantId, and quantity are required",
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Find the variant
        const variant = product.variants.find((v) => v.variantId === variantId);
        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found",
            });
        }

        // Check stock
        if (variant.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${variant.stock}`,
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if item already in cart
        const existingItem = cart.items.find(
            (item) =>
                item.productId.toString() === productId &&
                item.variantId === variantId &&
                JSON.stringify(item.customization) === JSON.stringify(customization)
        );

        if (existingItem) {
            // Update quantity
            if (existingItem.quantity + quantity > variant.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock. Available: ${variant.stock - existingItem.quantity}`,
                });
            }
            existingItem.quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                productId,
                variantId,
                quantity,
                price: variant.discountPrice || variant.price,
                customization: customization || null,
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get cart
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId }).populate("items.productId");

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        res.status(200).json({
            success: true,
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update cart item
const updateCartItem = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        const userId = req.user.id;

        if (!itemId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "itemId and quantity are required",
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const item = cart.items.find((i) => i._id.toString() === itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart",
            });
        }

        // Check stock
        const product = await Product.findById(item.productId);
        const variant = product.variants.find((v) => v.variantId === item.variantId);

        if (variant.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${variant.stock}`,
            });
        }

        item.quantity = quantity;
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.id;

        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "itemId is required",
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};
