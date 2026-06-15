const express = require("express");
const router = express.Router();
const { signup, signin, me, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", protect, me);
router.put("/profile", protect, updateProfile);

module.exports = router;
