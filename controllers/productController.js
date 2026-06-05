const Product = require("../models/Product");

const addProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            description,
            category,
            subCategory,
            collection,
            // brand,
            // tags,
            variants,
            customizationOptions,
            isFeatured,
            isTrending,
            isBestSeller,
            status,
            seoTitle,
            seoDescription,
        } = req.body;

        // Required field validation
        if (!name || !sku || !category || !subCategory) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, SKU, Category and SubCategory are required",
            });
        }

        // Check duplicate SKU
        const existingProduct = await Product.findOne({
            sku: sku.toUpperCase(),
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: "SKU already exists",
            });
        }

        // Parse JSON if coming from form-data
        const parsedVariants =
            typeof variants === "string"
                ? JSON.parse(variants)
                : variants;

        // const parsedTags =
        //     typeof tags === "string"
        //         ? JSON.parse(tags)
        //         : tags;

        const parsedCustomizationOptions =
            typeof customizationOptions === "string"
                ? JSON.parse(customizationOptions)
                : customizationOptions;

        const product = await Product.create({
            name,
            sku: sku.toUpperCase(),
            description,
            category,
            subCategory,
            collection,
            // brand,
            // tags: parsedTags || [],
            variants: parsedVariants || [],
            customizationOptions:
                parsedCustomizationOptions || {},
            isFeatured: isFeatured || false,
            isTrending: isTrending || false,
            isBestSeller: isBestSeller || false,
            status: status || "active",
            seoTitle,
            seoDescription,
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    addProduct, updateProduct, getAllProducts, getProductById
};