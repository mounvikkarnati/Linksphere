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
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 30px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid #eef2f6;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 25px;">
        <div style="width: 50px; height: 50px; background: #2563eb; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">📧</div>
        <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">${purpose} OTP</h2>
        <p style="color: #64748b; font-size: 14px; margin: 8px 0 0 0;">Secure verification code</p>
    </div>
    
    <!-- OTP Box -->
    <div style="background: #ffffff; border-radius: 16px; padding: 25px; text-align: center; border: 1px dashed #2563eb; margin: 20px 0;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
        <h1 style="color: #2563eb; font-size: 42px; letter-spacing: 8px; margin: 10px 0; font-weight: 700; background: #f0f9ff; padding: 15px 20px; border-radius: 12px; display: inline-block;">${otp}</h1>
    </div>
    
    <!-- Info Section -->
    <div style="background: #f8fafc; border-radius: 12px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px;">
            ⏰ <strong>Expires in:</strong> 10 minutes
        </p>
        <p style="margin: 0; color: #1e293b; font-size: 14px;">
            🔐 <strong>Purpose:</strong> ${purpose} verification
        </p>
    </div>
    
    <!-- Security Note -->
    <div style="background: #fff7ed; border-radius: 10px; padding: 12px 15px; margin: 20px 0 0 0;">
        <p style="font-size: 13px; color: #9a3412; margin: 0; line-height: 1.5; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🔒</span>
            <span><strong>Never share this code</strong> with anyone. BChat will never ask for your OTP.</span>
        </p>
    </div>
    
    <!-- Footer Note -->
    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 25px 0 0 0; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        This is an automated message, please do not reply to this email.<br>
        © 2026 BChat. All rights reserved.
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