const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const { generateOtp, sendOtpEmail } = require("../utils/settingsChange");
const Message = require("../models/Message");
const Room = require("../models/Room");
const cloudinary = require("../config/cloudinary");
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

    // ✅ FIXED COMPARISON
    if (
      !user.otp ||
      user.otp?.toString() !== otp.toString() ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
  return res.status(404).json({
    message: "User does not exist. Please register first."
  });
}

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    await sendOtpEmail(email, otp); // reuse existing email util

    res.json({ message: "OTP sent to email" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (
  !user ||
  !user.resetOtp ||
  user.resetOtp.toString().trim() !== otp?.toString().trim() ||
  !user.resetOtpExpiry ||
  user.resetOtpExpiry < Date.now()
) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;

    await user.save();

    // Generate token (auto login)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // 🗑️ Delete user messages + Cloudinary files
    const userMessages = await Message.find({ sender: user._id });

    for (let msg of userMessages) {
      if (msg.publicId) {
        await cloudinary.uploader.destroy(msg.publicId, {
          resource_type: "auto",
        });
      }
      await msg.deleteOne();
    }

    // 🗑️ Delete rooms created by user
    const roomsCreated = await Room.find({ createdBy: user._id });

    for (let room of roomsCreated) {

      const roomMessages = await Message.find({ room: room._id });

      for (let msg of roomMessages) {
        if (msg.publicId) {
          await cloudinary.uploader.destroy(msg.publicId, {
            resource_type: "auto",
          });
        }
      }

      await Message.deleteMany({ room: room._id });
      await room.deleteOne();
    }

    // 🗑️ Remove user from rooms they joined
    await Room.updateMany(
      { "members.user": user._id },
      { $pull: { members: { user: user._id } } }
    );

    // 🗑️ Delete user
    await user.deleteOne();

    res.json({ message: "Account deleted successfully" });

  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;

    await user.save();

    res.json({ message: "Username updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.requestEmailChange = async (req, res) => {
  try {
     console.log("🔥 requestEmailChange route hit");

    const { newEmail } = req.body;

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const otp = generateOtp();

    const user = await User.findById(req.user._id);
    user.pendingEmail = newEmail;
    user.emailOtp = otp;
    user.emailOtpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendOtpEmail(newEmail, otp, "Email Change");

    res.json({ message: "OTP sent to new email" });

  } catch {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};
exports.verifyEmailChange = async (req, res) => {
  try {
    const { otp } = req.body;
    const cleanOtp = otp?.toString().trim();

    const user = await User.findById(req.user._id);

    // 🔍 DEBUG LOGS (add here)
    console.log("Stored OTP:", user?.emailOtp);
    console.log("Received OTP:", cleanOtp);
    console.log("Stored Expiry:", user?.emailOtpExpires);
    console.log("Now:", Date.now());

    if (
      !user ||
      !user.emailOtp ||
      user.emailOtp.toString().trim() !== cleanOtp ||
      !user.emailOtpExpires ||
      user.emailOtpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = null;
    user.emailOtp = null;
    user.emailOtpExpires = null;

    await user.save();

    res.json({ message: "Email updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};

exports.requestDeleteAccountOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const otp = generateOtp();

    user.deleteOtp = otp;
    user.deleteOtpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendOtpEmail(user.email, otp, "Delete Account");

    res.json({ message: "Delete OTP sent" });

  } catch {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyDeleteAccountOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const cleanOtp = otp?.toString().trim();

    const user = await User.findById(req.user._id);

    if (
      !user ||
      !user.deleteOtp ||
      user.deleteOtp.toString().trim() !== cleanOtp ||
      !user.deleteOtpExpires ||
      user.deleteOtpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }


    // Delete user's messages + cloudinary files
    const messages = await Message.find({ sender: user._id });

    for (let msg of messages) {
      if (msg.publicId) {
        await cloudinary.uploader.destroy(msg.publicId, {
          resource_type: "auto"
        });
      }
    }

    await Message.deleteMany({ sender: user._id });

    await Room.deleteMany({ createdBy: user._id });

    await Room.updateMany(
      {},
      { $pull: { members: { user: user._id } } }
    );

    await user.deleteOne();

    res.json({ message: "Account deleted completely" });

  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};