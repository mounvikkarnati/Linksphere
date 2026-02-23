const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Generate OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP Email using Brevo SMTP
const sendOtpEmail = async (email, otp, purpose = "Verification") => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"LinkSphere BChat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${purpose} OTP`,
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>${purpose} OTP</h2>
          <h1 style="color:#2563eb">${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    console.log("✅ Email sent via Brevo SMTP");
  } catch (error) {
    console.error("❌ Brevo SMTP Error:", error);
    throw error;
  }
};

module.exports = {
  generateOtp,
  sendOtpEmail,
};