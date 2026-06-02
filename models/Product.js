const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    variantId: {
        type: String,
        required: true,
    },
    metal: {
        type: String,
        required: true,
    },
    caratWeight: {
        type: Number,
        required: true,
    },
    gemstone: {
        type: String,
        required: true,
    },
    clarity: String,
    color: String,
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    images: [String],
});

const engravingSchema = new mongoose.Schema({
    allowed: {
        type: Boolean,
        default: false,
    },
    maxChars: {
        type: Number,
        default: 0,
    },
    additionalCost: {
        type: Number,
        default: 0,
    },
}, { _id: false });

const customizationOptionsSchema = new mongoose.Schema({
    engraving: {
        type: engravingSchema,
        default: () => ({}),
    },
    ringSizes: {
        type: [Number],
        default: [],
    },
}, { _id: false });

const ratingSchema = new mongoose.Schema({
    average: {
        type: Number,
        default: 0,
    },
    count: {
        type: Number,
        default: 0,
    },
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    sku: {
        type: String,
        required: true,
        unique: true,
    },
    description: String,
    category: String,
    subCategory: String,
    tags: {
        type: [String],
        default: [],
    },
    variants: {
        type: [variantSchema],
        default: [],
    },
    customizationOptions: {
        type: customizationOptionsSchema,
        default: () => ({}),
    },
    ratings: {
        type: ratingSchema,
        default: () => ({}),
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
