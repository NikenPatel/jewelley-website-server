const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");

// Add SubCategory
const addSubCategory = async (req, res) => {
    try {
        const { name, categoryId, description, icon, image, displayOrder } =
            req.body;

        // Validate required fields
        if (!name || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "SubCategory name and Category ID are required",
            });
        }

        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Check if subcategory already exists for this category
        const existingSubCategory = await SubCategory.findOne({
            name,
            category: categoryId,
        });
        if (existingSubCategory) {
            return res.status(400).json({
                success: false,
                message: "SubCategory already exists for this category",
            });
        }

        // Create new subcategory
        const subCategory = new SubCategory({
            name,
            category: categoryId,
            description,
            icon,
            image,
            displayOrder: displayOrder || 0,
        });

        await subCategory.save();

        // Populate category for response
        await subCategory.populate("category");

        res.status(201).json({
            success: true,
            message: "SubCategory created successfully",
            data: subCategory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All SubCategories
const getAllSubCategories = async (req, res) => {
    try {
        const { categoryId } = req.query;

        let query = {};
        if (categoryId) {
            query.category = categoryId;
        }

        const subCategories = await SubCategory.find(query)
            .populate("category")
            .sort({ displayOrder: 1 });

        res.json({
            success: true,
            count: subCategories.length,
            data: subCategories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get SubCategory by ID
const getSubCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const subCategory = await SubCategory.findById(id).populate("category");
        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "SubCategory not found",
            });
        }

        res.json({
            success: true,
            data: subCategory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get SubCategories by Category ID
const getSubCategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const subCategories = await SubCategory.find({
            category: categoryId,
        }).sort({ displayOrder: 1 });

        res.json({
            success: true,
            count: subCategories.length,
            data: subCategories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update SubCategory
const updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, categoryId, description, icon, image, displayOrder, isActive } =
            req.body;

        let subCategory = await SubCategory.findById(id);
        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "SubCategory not found",
            });
        }

        // If updating category, check if it exists
        if (categoryId && categoryId !== subCategory.category.toString()) {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }

            // Check for duplicate name in new category
            const existingSubCategory = await SubCategory.findOne({
                name: name || subCategory.name,
                category: categoryId,
                _id: { $ne: id },
            });
            if (existingSubCategory) {
                return res.status(400).json({
                    success: false,
                    message: "SubCategory name already exists in this category",
                });
            }

            subCategory.category = categoryId;
        }

        // Update fields
        if (name && name !== subCategory.name) {
            const existingSubCategory = await SubCategory.findOne({
                name,
                category: subCategory.category,
                _id: { $ne: id },
            });
            if (existingSubCategory) {
                return res.status(400).json({
                    success: false,
                    message: "SubCategory name already exists in this category",
                });
            }
            subCategory.name = name;
        }

        if (description !== undefined) subCategory.description = description;
        if (icon !== undefined) subCategory.icon = icon;
        if (image !== undefined) subCategory.image = image;
        if (displayOrder !== undefined) subCategory.displayOrder = displayOrder;
        if (isActive !== undefined) subCategory.isActive = isActive;

        await subCategory.save();
        await subCategory.populate("category");

        res.json({
            success: true,
            message: "SubCategory updated successfully",
            data: subCategory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete SubCategory
const deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const subCategory = await SubCategory.findById(id);
        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "SubCategory not found",
            });
        }

        await SubCategory.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "SubCategory deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    addSubCategory,
    getAllSubCategories,
    getSubCategoryById,
    getSubCategoriesByCategory,
    updateSubCategory,
    deleteSubCategory,
};
