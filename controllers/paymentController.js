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