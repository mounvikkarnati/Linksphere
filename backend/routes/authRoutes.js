const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const {
  // AUTH
  registerUser,
  loginUser,
  verifyOtp,
  forgotPassword,
  verifyResetOtp,
  getUserCount,

  // SETTINGS
  updateUser,
  requestEmailChange,
  verifyEmailChange,
  requestDeleteAccountOtp,
  verifyDeleteAccountOtp

} = require("../controllers/authController");


/* =================================
   PUBLIC ROUTES
================================= */

// Registration & Login
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

// Password Reset
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);

// Stats
router.get("/count", getUserCount);


/* =================================
   PROTECTED ROUTES
================================= */

// Get Logged-in User
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

// Update Username
router.put("/update", protect, updateUser);

// Email Change
router.put("/request-email-change", protect, requestEmailChange);
router.put("/verify-email-change", protect, verifyEmailChange);

// Delete Account
router.post("/request-delete-account-otp", protect, requestDeleteAccountOtp);
router.post("/verify-delete-account-otp", protect, verifyDeleteAccountOtp);


module.exports = router;