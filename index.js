const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;
const mongoUri = process.env.DATABASE || 'mongodb://127.0.0.1:27017/jewellery';

app.use(cors());
app.use(express.json());

mongoose.set('strictQuery', false);
mongoose
    .connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

const Product = require('./models/Product');

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running', db: mongoose.connection.readyState });
});

app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/products', async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
