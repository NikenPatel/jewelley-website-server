const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        productId: {
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
            required: true,
            default: 1,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
        },
        customization: {
            type: Object,
            default: null,
        },
    },
    { timestamps: true }
);

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [cartItemSchema],
        totalPrice: {
            type: Number,
            default: 0,
        },
        totalQuantity: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Calculate totals before saving
cartSchema.pre("save", function () {
    this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPrice = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

module.exports = mongoose.model("Cart", cartSchema);
