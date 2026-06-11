const express = require("express");
const router = express.Router();

const {
    addProduct,
    updateProduct,
    getAllProducts,
    getProductById
} = require("../controllers/productController");
const upload = require("../middleware/multer");

router.post("/add-product", upload.array("images", 5), addProduct);
router.put("/update-product/:id", updateProduct);
router.get("/get-products", getAllProducts);
router.get("/get-product/:id", getProductById);

module.exports = router;