const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        variantId: {
            type: String,
            required: true,
        },

        quantity: {
            type: Number,
            default: 1,
        },

        selectedRingSize: {
            type: Number,
        },

        engravingText: {
            type: String,
            default: "",
        },

        shippingAddress: {
            fullName: String,
            mobile: String,
            addressLine1: String,
            addressLine2: String,
            city: String,
            state: String,
            country: String,
            pincode: String,
        },

        productSnapshot: {
            name: String,
            sku: String,
            image: String,
            metal: String,
            gemstone: String,
            price: Number,
            discountPrice: Number,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        // PAYMENT METHOD
        paymentMethod: {
            type: String,
            enum: ["COD", "ONLINE"],
            default: "COD",
        },

        // PAYMENT STATUS
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },

        // RAZORPAY FIELDS
        razorpayOrderId: {
            type: String,
            default: "",
        },

        razorpayPaymentId: {
            type: String,
            default: "",
        },

        razorpaySignature: {
            type: String,
            default: "",
        },

        // ORDER STATUS
        orderStatus: {
            type: String,
            enum: [
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
            ],
            default: "placed",
        },

        // RETURN / RTO
        returnReason: {
            type: String,
            default: "",
        },

        rtoReason: {
            type: String,
            default: "",
        },

        // OPTIONAL PAYMENT DETAILS
        paymentDetails: {
            paymentGateway: {
                type: String,
                default: "Razorpay",
            },

            currency: {
                type: String,
                default: "INR",
            },

            paidAt: {
                type: Date,
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);