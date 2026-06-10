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

        paymentMethod: {
            type: String,
            enum: ["COD", "ONLINE"],
            default: "COD",
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },

        orderStatus: {
            type: String,
            enum: [
                "placed",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "placed",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);