const express = require('express');
const router = express.Router();
const { protect, adminAuth } = require('../middleware/auth');
const Product = require('../models/Product');

// Apply admin authentication to all admin routes
router.use(protect, adminAuth);

// Get all products (admin view)
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json({
            status: 'ok',
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get single product by ID
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }
        res.json({ status: 'ok', data: product });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Create new product
router.post('/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({
            status: 'ok',
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// Update product
router.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }
        res.json({
            status: 'ok',
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }
        res.json({
            status: 'ok',
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const stats = {
            totalProducts,
            timestamp: new Date()
        };
        res.json({ status: 'ok', data: stats });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
