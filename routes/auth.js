const express = require("express");
const router = express.Router();
const { signup, signin, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", protect, me);

module.exports = router;
