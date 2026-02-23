const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Generate 6-digit OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP Email
const sendOtpEmail = async (email, otp, purpose = "Verification") => {
  const transporter = nodemailer.createTransport({
    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${purpose} OTP`,
    text: `Your OTP for ${purpose} is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
  });
};

module.exports = {
  generateOtp,
  sendOtpEmail,
};