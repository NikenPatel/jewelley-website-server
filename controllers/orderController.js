const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Place order directly (Buy Now)
exports.buyNow = async (req, res) => {
    try {
        const {
            productId,
            variantId,
            quantity,
            address,
            ringSize,
            engravingText,
            paymentMethod,
        } = req.body;

        const userId = req.user.id;

        // Basic input validation
        if (!productId || !variantId || !quantity || !address || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: productId, variantId, quantity, address, or paymentMethod",
            });
        }

        const requiredAddressFields = ["fullName", "mobile", "addressLine1", "city", "state", "country", "pincode"];
        for (const field of requiredAddressFields) {
            if (!address[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Address field '${field}' is required`,
                });
            }
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const variant = product.variants.find(
            (v) => v.variantId === variantId
        );

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found",
            });
        }

        if (variant.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${variant.stock}`,
            });
        }

        const price =
            variant.discountPrice > 0
                ? variant.discountPrice
                : variant.price;

        const totalAmount = price * quantity;

        let razorpayOrder = null;
        let razorpayOrderId = "";

        if (paymentMethod === "ONLINE") {
            const options = {
                amount: totalAmount * 100, // amount in smallest currency unit
                currency: "INR",
                receipt: `receipt_buyNow_${Date.now()}`,
            };
            razorpayOrder = await razorpay.orders.create(options);
            razorpayOrderId = razorpayOrder.id;
        }

        const order = await Order.create({
            user: userId,
            product: product._id,
            variantId,
            quantity,
            selectedRingSize: ringSize,
            engravingText: engravingText || "",
            shippingAddress: {
                fullName: address.fullName,
                mobile: address.mobile,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2 || "",
                city: address.city,
                state: address.state,
                country: address.country,
                pincode: address.pincode,
            },
            productSnapshot: {
                name: product.name,
                sku: product.sku,
                image: variant.images && variant.images[0] ? variant.images[0] : "",
                metal: variant.metal,
                gemstone: variant.gemstone,
                price: variant.price,
                discountPrice: variant.discountPrice,
            },
            totalAmount,
            paymentMethod,
            paymentStatus: "pending",
            razorpayOrderId,
        });

        // Update variant stock and product sales
        variant.stock -= quantity;
        product.totalSales = (product.totalSales || 0) + quantity;
        await product.save();

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order,
            razorpayOrder,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Place orders from Cart
exports.placeOrderFromCart = async (req, res) => {
    try {
        const { address, paymentMethod } = req.body;
        const userId = req.user.id;

        if (!address || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Address and payment method are required",
            });
        }

        const requiredAddressFields = ["fullName", "mobile", "addressLine1", "city", "state", "country", "pincode"];
        for (const field of requiredAddressFields) {
            if (!address[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Address field '${field}' is required`,
                });
            }
        }

        // Find user's cart and populate product details
        const cart = await Cart.findOne({ userId }).populate("items.productId");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty or not found",
            });
        }

        // Validate stock for all items first
        for (const item of cart.items) {
            const product = item.productId;
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "One of the products in cart no longer exists",
                });
            }

            const variant = product.variants.find(
                (v) => v.variantId === item.variantId
            );
            if (!variant) {
                return res.status(404).json({
                    success: false,
                    message: `Variant ${item.variantId} for product ${product.name} not found`,
                });
            }

            if (variant.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product ${product.name} (${variant.variantId}). Available: ${variant.stock}`,
                });
            }
        }

        let totalCartAmount = 0;
        for (const item of cart.items) {
            totalCartAmount += item.price * item.quantity;
        }

        let razorpayOrder = null;
        let razorpayOrderId = "";

        if (paymentMethod === "ONLINE") {
            const options = {
                amount: totalCartAmount * 100,
                currency: "INR",
                receipt: `receipt_cart_${Date.now()}`,
            };
            razorpayOrder = await razorpay.orders.create(options);
            razorpayOrderId = razorpayOrder.id;
        }

        const createdOrders = [];

        // Place order for each item in the cart
        for (const item of cart.items) {
            const product = item.productId;
            const variant = product.variants.find(
                (v) => v.variantId === item.variantId
            );

            const quantity = item.quantity;
            const ringSize = item.customization?.selectedRingSize || item.customization?.ringSize || null;
            const engravingText = item.customization?.engravingText || "";

            const totalAmount = item.price * quantity;

            const order = await Order.create({
                user: userId,
                product: product._id,
                variantId: item.variantId,
                quantity,
                selectedRingSize: ringSize,
                engravingText,
                shippingAddress: {
                    fullName: address.fullName,
                    mobile: address.mobile,
                    addressLine1: address.addressLine1,
                    addressLine2: address.addressLine2 || "",
                    city: address.city,
                    state: address.state,
                    country: address.country,
                    pincode: address.pincode,
                },
                productSnapshot: {
                    name: product.name,
                    sku: product.sku,
                    image: variant.images && variant.images[0] ? variant.images[0] : "",
                    metal: variant.metal,
                    gemstone: variant.gemstone,
                    price: variant.price,
                    discountPrice: variant.discountPrice,
                },
                totalAmount,
                paymentMethod,
                paymentStatus: "pending",
                razorpayOrderId,
            });

            // Update stock and total sales
            variant.stock -= quantity;
            product.totalSales = (product.totalSales || 0) + quantity;
            await product.save();

            createdOrders.push(order);
        }

        // Clear user's cart
        cart.items = [];
        await cart.save();

        res.status(201).json({
            success: true,
            message: "Order placed successfully from cart",
            orders: createdOrders,
            razorpayOrder,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get logged-in user's orders
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ user: userId })
            .populate("product")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get specific order details
exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const order = await Order.findById(orderId)
            .populate("product")
            .populate("user", "name email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Restrict access to order owner or admin
        if (order.user._id.toString() !== userId && userRole !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Access denied",
            });
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check ownership
        if (order.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You cannot cancel another user's order",
            });
        }

        // Validate current order status
        if (order.orderStatus !== "placed" && order.orderStatus !== "confirmed") {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled. Current status is: ${order.orderStatus}`,
            });
        }

        // Restore stock and adjust total sales
        const product = await Product.findById(order.product);
        if (product) {
            const variant = product.variants.find((v) => v.variantId === order.variantId);
            if (variant) {
                variant.stock += order.quantity;
                product.totalSales = Math.max(0, (product.totalSales || 0) - order.quantity);
                await product.save();
            }
        }

        order.orderStatus = "cancelled";
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("product")
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { orderStatus, paymentStatus, rtoReason } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const oldStatus = order.orderStatus;

        if (orderStatus) {
            const validOrderStatuses = [
                "placed",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
                "return_requested",
                "returned",
                "return_rejected",
                "rto",
            ];
            if (!validOrderStatuses.includes(orderStatus)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid order status",
                });
            }

            const stockRestoringStatuses = ["cancelled", "returned", "rto"];
            const isOldRestored = stockRestoringStatuses.includes(oldStatus);
            const isNewRestored = stockRestoringStatuses.includes(orderStatus);

            // Restore stock if changing to a stock-restoring status
            if (isNewRestored && !isOldRestored) {
                const product = await Product.findById(order.product);
                if (product) {
                    const variant = product.variants.find((v) => v.variantId === order.variantId);
                    if (variant) {
                        variant.stock += order.quantity;
                        product.totalSales = Math.max(0, (product.totalSales || 0) - order.quantity);
                        await product.save();
                    }
                }
            }
            // Deduct stock if restoring from a stock-restoring status to an active status
            else if (!isNewRestored && isOldRestored) {
                const product = await Product.findById(order.product);
                if (product) {
                    const variant = product.variants.find((v) => v.variantId === order.variantId);
                    if (variant) {
                        if (variant.stock < order.quantity) {
                            return res.status(400).json({
                                success: false,
                                message: `Cannot restore order status. Insufficient stock. Available: ${variant.stock}`,
                            });
                        }
                        variant.stock -= order.quantity;
                        product.totalSales = (product.totalSales || 0) + order.quantity;
                        await product.save();
                    }
                }
            }

            if (orderStatus === "rto" && rtoReason) {
                order.rtoReason = rtoReason;
            }

            order.orderStatus = orderStatus;
        }

        if (paymentStatus) {
            const validPaymentStatuses = ["pending", "paid", "failed"];
            if (!validPaymentStatuses.includes(paymentStatus)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment status",
                });
            }
            order.paymentStatus = paymentStatus;
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Request return (Customer)
exports.requestReturn = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;
        const { returnReason } = req.body;

        if (!returnReason || !returnReason.trim()) {
            return res.status(400).json({
                success: false,
                message: "Return reason is required",
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check ownership
        if (order.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You cannot request return for another user's order",
            });
        }

        // Validate current order status (only delivered orders can be returned)
        if (order.orderStatus !== "delivered") {
            return res.status(400).json({
                success: false,
                message: `Only delivered orders can be returned. Current status is: ${order.orderStatus}`,
            });
        }

        order.orderStatus = "return_requested";
        order.returnReason = returnReason;
        await order.save();

        res.status(200).json({
            success: true,
            message: "Return request submitted successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};