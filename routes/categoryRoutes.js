const express = require("express");
const router = express.Router();
const { protect, adminAuth } = require("../middleware/auth");
const {
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");
const {
    addSubCategory,
    getAllSubCategories,
    getSubCategoryById,
    getSubCategoriesByCategory,
    updateSubCategory,
    deleteSubCategory,
} = require("../controllers/subcategoryController");

// ===== CATEGORY ROUTES =====

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Protected admin routes
router.post("/", protect, adminAuth, addCategory);
router.put("/:id", protect, adminAuth, updateCategory);
router.delete("/:id", protect, adminAuth, deleteCategory);
router.post("/", protect, adminAuth, addCategory);

// ===== SUBCATEGORY ROUTES =====

// Public routes
router.get("/subcategories/all", getAllSubCategories);
router.get("/subcategories/:id", getSubCategoryById);
router.get("/:categoryId/subcategories", getSubCategoriesByCategory);

// Protected admin routes
router.post("/subcategories", protect, adminAuth, addSubCategory);
router.put("/subcategories/:id", protect, adminAuth, updateSubCategory);
router.delete("/subcategories/:id", protect, adminAuth, deleteSubCategory);

module.exports = router;
