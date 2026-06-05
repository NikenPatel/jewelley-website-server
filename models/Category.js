const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            unique: true,
            trim: true,
            minlength: [3, "Category name must be at least 3 characters long"],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
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

// Auto-generate slug from name
categorySchema.pre("save", function () {
    if (this.isModified("name")) {
        const slugify = require("slugify");
        this.slug = slugify(this.name, { lower: true });
    }

});

module.exports = mongoose.model("Category", categorySchema);
