const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

/* =================================
   REGISTER USER (WITH OTP)
================================= */
exports.registerUser = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // If user already exists
    if (existingUser) {
      if (!existingUser.isVerified) {
        existingUser.otp = otp;
        existingUser.otpExpires = otpExpiry;
        await existingUser.save();

        await sendEmail(email, otp);

        return res.json({
          message: "OTP re-sent. Please verify your email.",
        });
      }

      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires: otpExpiry,
      isVerified: false,
    });

    await sendEmail(email, otp);

    res.status(200).json({
      message: "OTP sent to email. Please verify.",
    });

  } catch (error) {
    console.log("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =================================
   VERIFY OTP
================================= */
exports.verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({ message: "Account verified successfully" });

  } catch (error) {
    console.log("Verify OTP Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =================================
   LOGIN USER
================================= */
exports.loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =================================
   GET VERIFIED USER COUNT
================================= */
exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ isVerified: true });
    res.json({ totalUsers: count });
  } catch (error) {
    console.log("User Count Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};