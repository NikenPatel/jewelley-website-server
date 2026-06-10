const express = require('express');
const router = express.Router();
const { protect, adminAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');

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
        
        // Total Orders
        const totalOrders = await Order.countDocuments();

        // Total Customers (distinct users who placed orders)
        const customersResult = await Order.distinct("user");
        const totalCustomers = customersResult.length;

        // Total Revenue (sum of totalAmount for all non-cancelled orders)
        const revenueResult = await Order.aggregate([
            { $match: { orderStatus: { $ne: "cancelled" } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Pending Orders (placed or processing)
        const pendingOrders = await Order.countDocuments({
            orderStatus: { $in: ["placed", "processing"] }
        });

        // Low Stock Products (any product with a variant having stock < 5)
        const lowStockProducts = await Product.countDocuments({
            "variants.stock": { $lt: 5 }
        });

        // Today's Sales (revenue from non-cancelled orders placed today)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const todaySalesResult = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $ne: "cancelled" },
                    createdAt: { $gte: startOfToday, $lte: endOfToday }
                }
            },
            { $group: { _id: null, todaySales: { $sum: "$totalAmount" } } }
        ]);
        const todaySales = todaySalesResult.length > 0 ? todaySalesResult[0].todaySales : 0;

        // Monthly Sales (revenue from non-cancelled orders placed this month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlySalesResult = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $ne: "cancelled" },
                    createdAt: { $gte: startOfMonth, $lte: endOfToday }
                }
            },
            { $group: { _id: null, monthlySales: { $sum: "$totalAmount" } } }
        ]);
        const monthlySales = monthlySalesResult.length > 0 ? monthlySalesResult[0].monthlySales : 0;

        const stats = {
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalProducts,
            pendingOrders,
            lowStockProducts,
            todaySales,
            monthlySales,
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

// Admin Order Management Routes
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
