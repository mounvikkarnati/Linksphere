const axios = require("axios");

const sendEmail = async (email, otp) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "BChat",
          email: process.env.EMAIL_USER,
        },
        to: [{ email }],
        subject: "BChat OTP Verification",
        htmlContent: `
          <div style="max-width:480px;margin:0 auto;font-family:Arial;">
            <h2>Welcome to BChat</h2>
            <p>Your verification code:</p>
            <h1 style="font-size:48px;letter-spacing:8px;color:#667eea;">
              ${otp}
            </h1>
            <p>⏰ This code expires in 10 minutes</p>
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

    console.log("✅ OTP email sent via Brevo API:", email);
  } catch (error) {
    console.error("❌ Brevo API Error:", error.response?.data || error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;