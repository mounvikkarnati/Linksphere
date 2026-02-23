const axios = require("axios");

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
        subject: `${purpose} OTP - LinkSphere BChat`,
        htmlContent: `
          <div style="font-family: Arial; padding:20px;">
            <h2>${purpose} OTP</h2>
            <h1 style="color:#2563eb; letter-spacing:6px;">${otp}</h1>
            <p>This OTP expires in 10 minutes.</p>
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

module.exports = sendOtpEmail;