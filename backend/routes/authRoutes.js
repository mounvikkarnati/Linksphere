const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyOtp,
  getUserCount
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.get("/count", getUserCount);

module.exports = router;