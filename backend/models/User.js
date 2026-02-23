const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  username: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  // 🔐 Register OTP
  otp: String,
  otpExpires: Date,

  // 🔐 Password Reset OTP
  resetOtp: String,
  resetOtpExpiry: Date,

  // 🔐 Email Change OTP
  emailOtp: String,
  emailOtpExpires: Date,
  pendingEmail: String,

  // 🔐 Delete Account OTP
  deleteOtp: String,
  deleteOtpExpires: Date,

},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);