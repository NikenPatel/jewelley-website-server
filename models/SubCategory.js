const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "SubCategory name is required"],
            trim: true,
            minlength: [3, "SubCategory name must be at least 3 characters long"],
        },
        slug: {
            type: String,
            lowercase: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },
        description: {
            type: String,
            trim: true,
        },
        icon: {
            type: String,
            default: null,
        },
        image: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Create unique index on name and category combination
subCategorySchema.index({ name: 1, category: 1 }, { unique: true });

// Auto-generate slug from name
subCategorySchema.pre("save", function () {
    if (this.isModified("name")) {
        const slugify = require("slugify");
        this.slug = slugify(this.name, { lower: true });
    }
});

module.exports = mongoose.model("SubCategory", subCategorySchema);
