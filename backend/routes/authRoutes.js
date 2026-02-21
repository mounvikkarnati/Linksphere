
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyOtp,
  getUserCount
} = require("../controllers/authController");

const protect = require("../middleware/auth"); // your middleware file name

// ================= PUBLIC ROUTES =================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

// ================= PROTECTED ROUTES =================
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

router.get("/count", getUserCount);

module.exports = router;