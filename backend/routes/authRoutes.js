const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyOtp,
  getUserCount,
  forgotPassword,
  verifyResetOtp
} = require("../controllers/authController");

const protect = require("../middleware/auth");

// ================= PUBLIC ROUTES =================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);

// ================= PROTECTED ROUTES =================
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

router.get("/count", getUserCount);

module.exports = router;