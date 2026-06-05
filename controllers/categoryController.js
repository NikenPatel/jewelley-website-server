const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

// Add Category
const addCategory = async (req, res) => {
    try {
        const { name, description, icon, image, displayOrder } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists",
            });
        }

        // Create new category
        const category = new Category({
            name,
            description,
            icon,
            image,
            displayOrder: displayOrder || 0,
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
        });
    }
};

// Get All Categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ displayOrder: 1 });

        res.json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error,
            stack: error.stack,
        });
    }
};

// Get Category by ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, image, displayOrder, isActive } =
            req.body;

        let category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Check for duplicate name
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Category name already exists",
                });
            }
        }

        // Update fields
        if (name) category.name = name;
        if (description) category.description = description;
        if (icon !== undefined) category.icon = icon;
        if (image !== undefined) category.image = image;
        if (displayOrder !== undefined) category.displayOrder = displayOrder;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();

        res.json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Check if category has subcategories
        const subCategories = await SubCategory.findOne({ category: id });
        if (subCategories) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category with subcategories. Delete subcategories first.",
            });
        }

        await Category.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
