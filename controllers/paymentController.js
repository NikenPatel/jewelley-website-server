const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// CREATE ORDER
exports.createOrder = async (req, res) => {
    try {
        const {
            amount,
            products,
            userId,
        } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
            });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Save order in DB
        const order = await Order.create({
            userId,
            products,
            totalAmount: amount,
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: "Pending",
        });

        res.status(200).json({
            success: true,
            order,
            razorpayOrder,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            clearCart,
        } = req.body;

        const body =
            razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body.toString())
            .digest("hex");

        const isAuthentic =
            expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        // Update all orders sharing this razorpay_order_id
        await Order.updateMany(
            { razorpayOrderId: razorpay_order_id },
            {
                paymentStatus: "paid",
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
            }
        );

        // Deduct stock and increment sales for these orders now that payment is verified
        const orders = await Order.find({ razorpayOrderId: razorpay_order_id });
        const Product = require("../models/Product");
        
        for (const order of orders) {
            const product = await Product.findById(order.product);
            if (product) {
                const variant = product.variants.find((v) => v.variantId === order.variantId);
                if (variant) {
                    variant.stock = Math.max(0, variant.stock - order.quantity);
                }
                product.totalSales = (product.totalSales || 0) + order.quantity;
                await product.save();
            }
        }

        if (clearCart && orders.length > 0) {
            const userId = orders[0].user;
            const Cart = require("../models/Cart");
            await Cart.findOneAndUpdate({ userId }, { items: [] });
        }

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};