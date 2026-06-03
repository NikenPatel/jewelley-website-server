const express = require("express");
const router = express.Router();

const {
    addProduct,
    updateProduct,
} = require("../controllers/productController");
const upload = require("../middleware/upload");

router.post("/add-product", upload.array("images", 5), addProduct);
router.put("/update-product/:id", updateProduct);


module.exports = router;