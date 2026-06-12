const mongoose = require("mongoose");

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

    costPrice: {
        type: Number,
        default: 0,
    },

    discountPrice: {
        type: Number,
        default: 0,
    },

    stock: {
        type: Number,
        default: 0,
    },

    images: {
        type: [String],
        default: [],
    },
});

const engravingSchema = new mongoose.Schema(
    {
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
    },
    { _id: false }
);

const customizationOptionsSchema = new mongoose.Schema(
    {
        engraving: {
            type: engravingSchema,
            default: () => ({}),
        },

        ringSizes: {
            type: [Number],
            default: [],
        },
    },
    { _id: false }
);

const ratingSchema = new mongoose.Schema(
    {
        average: {
            type: Number,
            default: 0,
        },

        count: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        sku: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },

        description: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        subCategory: {
            type: String,
            required: true,
        },

        collection: {
            type: String,
            default: "",
        },

        // brand: {
        //     type: String,
        //     default: "",
        // },

        // tags: {
        //     type: [String],
        //     default: [],
        // },

        variants: {
            type: [variantSchema],
            default: [],
            require: true,
        },

        customizationOptions: {
            type: customizationOptionsSchema,
            default: () => ({}),
        },

        ratings: {
            type: ratingSchema,
            default: () => ({}),
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        isTrending: {
            type: Boolean,
            default: false,
        },

        isBestSeller: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "draft"],
            default: "active",
        },

        seoTitle: {
            type: String,
            default: "",
        },

        seoDescription: {
            type: String,
            default: "",
        },

        totalSales: {
            type: Number,
            default: 0,
        },

        totalViews: {
            type: Number,
            default: 0,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }, {
    timestamps: true,
}
);

module.exports = mongoose.model("Product", productSchema);