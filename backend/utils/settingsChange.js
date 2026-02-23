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
          <div style="font-family: Arial, 'Helvetica Neue', sans-serif; max-width: 420px; margin: 0 auto; background: white; padding: 35px 30px; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.05); border: 1px solid #eaeef2;">
    
    <!-- Header with subtle accent -->
    <div style="text-align: left; margin-bottom: 25px;">
        <span style="background: #2563eb10; color: #2563eb; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.3px;">VERIFICATION</span>
        <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 15px 0 5px 0;">${purpose} OTP</h2>
        <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">Use the following code to complete your verification</p>
    </div>
    
    <!-- OTP Display -->
    <div style="background: #f8fafd; padding: 20px; border-radius: 14px; margin: 20px 0; text-align: center; border: 1px solid #e9edf2;">
        <p style="color: #475569; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">One-Time Password</p>
        <h1 style="color: #2563eb; font-size: 42px; letter-spacing: 8px; margin: 5px 0; font-weight: 700; line-height: 1.2;">${otp}</h1>
    </div>
    
    <!-- Validity Info -->
    <div style="display: flex; align-items: center; gap: 12px; background: #f0f4f9; padding: 12px 16px; border-radius: 12px; margin: 20px 0;">
        <span style="font-size: 20px;">⏱️</span>
        <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 500;">This OTP is valid for <span style="color: #2563eb; font-weight: 600;">10 minutes</span></p>
    </div>
    
    <!-- Security Message -->
    <div style="background: #fff2f0; padding: 14px 16px; border-radius: 12px; margin: 20px 0 5px 0;">
        <p style="font-size: 13px; color: #b91c1c; margin: 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🔒</span>
            <span><strong>Never share this code</strong> — BChat will never ask for it</span>
        </p>
    </div>
    
    <!-- Footer -->
    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 25px 0 0 0; padding-top: 15px; border-top: 1px dashed #dce2e9;">
        Need help? <a href="mailto:mounvikkarnati@gmail.com" style="color: #2563eb; text-decoration: none; font-weight: 500;">Contact Support</a>
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