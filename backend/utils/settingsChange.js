const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Generate 6-digit OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP Email
const sendOtpEmail = async (email, otp, purpose = "Verification") => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🔥 ADD IT HERE
    await transporter.verify();
    console.log("✅ SMTP verified");

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${purpose} OTP`,
      text: `Your OTP for ${purpose} is: ${otp}`,
    });

    console.log("✅ Email sent:", info.response);

  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
    throw error;
  }
};

module.exports = {
  generateOtp,
  sendOtpEmail,
};