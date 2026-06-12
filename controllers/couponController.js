const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Create a new coupon (Admin)
exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, coupon });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all coupons (Admin)
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a coupon (Admin)
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a coupon (Admin)
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Validate and Calculate Discount (Customer)
exports.validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code.' });

        const validity = coupon.isValid();
        if (!validity.valid) return res.status(400).json({ success: false, message: validity.message });

        // Check user applicability
        if (coupon.applicableUsers && coupon.applicableUsers.length > 0) {
            if (!coupon.applicableUsers.includes(userId)) {
                return res.status(400).json({ success: false, message: 'This coupon is not valid for your account.' });
            }
        }

        // Check if first order only
        if (coupon.isFirstOrderOnly) {
            const previousOrderCount = await Order.countDocuments({ user: userId });
            if (previousOrderCount > 0) {
                return res.status(400).json({ success: false, message: 'This coupon is valid for first-time orders only.' });
            }
        }

        // Get user cart to evaluate minimum amount and applicable products/categories
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty.' });
        }

        let applicableSubtotal = 0;
        let cartSubtotal = 0;

        for (const item of cart.items) {
            const product = item.productId;
            if (!product) continue;
            
            const itemPrice = item.price * item.quantity;
            cartSubtotal += itemPrice;

            // Check if product or category is applicable
            const hasProductRestrictions = coupon.applicableProducts && coupon.applicableProducts.length > 0;
            const hasCategoryRestrictions = coupon.applicableCategories && coupon.applicableCategories.length > 0;

            let isApplicable = true;

            if (hasProductRestrictions || hasCategoryRestrictions) {
                isApplicable = false;
                if (hasProductRestrictions && coupon.applicableProducts.includes(product._id)) {
                    isApplicable = true;
                }
                if (hasCategoryRestrictions && coupon.applicableCategories.includes(product.category)) {
                    isApplicable = true;
                }
            }

            if (isApplicable) {
                applicableSubtotal += itemPrice;
            }
        }

        if (applicableSubtotal === 0) {
            return res.status(400).json({ success: false, message: 'This coupon is not applicable to any products in your cart.' });
        }

        if (applicableSubtotal < coupon.minOrderAmount) {
            return res.status(400).json({ success: false, message: `Minimum applicable amount for this coupon is ₹${coupon.minOrderAmount}` });
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = applicableSubtotal * (coupon.discountValue / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else if (coupon.discountType === 'fixed') {
            discount = coupon.discountValue;
        } else if (coupon.discountType === 'free_shipping') {
            // Handled on frontend/backend logically, but we return discount = 0 or a flag
            discount = 0; 
        }

        // Ensure discount doesn't exceed applicable subtotal
        discount = Math.min(discount, applicableSubtotal);

        res.status(200).json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountAmount: discount
            },
            message: 'Coupon applied successfully'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
