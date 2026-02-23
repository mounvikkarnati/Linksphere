const crypto = require("crypto");
const axios = require("axios");

// Generate OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP Email using Brevo REST API (Render-safe)
const sendOtpEmail = async (email, otp, purpose = "Verification") => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "LinkSphere BChat",
          email: process.env.EMAIL_USER,
        },
        to: [{ email }],
        subject: `${purpose} OTP`,
        htmlContent: `
          <div style="font-family: Arial; padding:20px;">
            <h2>${purpose} OTP</h2>
            <h1 style="color:#2563eb; letter-spacing:6px;">${otp}</h1>
            <p>This OTP is valid for 10 minutes.</p>
            <p style="font-size:13px;color:#888;">
              🔒 Never share this code with anyone.
            </p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent via Brevo API");
  } catch (error) {
    console.error("❌ Brevo API Error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  generateOtp,
  sendOtpEmail,
};