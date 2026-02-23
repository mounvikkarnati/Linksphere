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
          <div style="max-width: 480px; width: 100%; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: white; border-radius: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden;">
    
    <!-- Header with gradient -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
        <h2 style="color: white; font-size: 28px; font-weight: 600; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); letter-spacing: -0.5px;">
            Welcome to <span style="color: #00f5d4; font-weight: 700;">BChat</span>
        </h2>
    </div>
    
    <!-- Content area -->
    <div style="padding: 40px 30px; text-align: center; background: white;">
        
        <!-- Greeting -->
        <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">Hello there! 👋</p>
        <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">You're just one step away from starting secure conversations.</p>
        
        <!-- OTP Label -->
        <div style="color: #666; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; font-weight: 500; margin-bottom: 10px;">
            Verification Code
        </div>
        
        <!-- OTP Code with gradient text -->
        <h1 style="font-size: 48px; letter-spacing: 8px; margin: 20px 0; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 2px 2px 4px rgba(102, 126, 234, 0.1);">
            ${otp}
        </h1>
        
        <!-- Timer box -->
        <div style="background: #f8f9ff; padding: 15px 20px; border-radius: 12px; margin: 25px auto; display: inline-block;">
            <p style="color: #667eea; font-weight: 600; font-size: 15px; margin: 0;">
                ⏰ This code expires in 10 minutes
            </p>
        </div>
        
        <!-- Expiry text -->
        <p style="color: #999; font-size: 14px; margin: 10px 0 0 0;">
            For your security, the code will expire after 10 minutes
        </p>
        
        <!-- Decorative divider -->
        <div style="height: 1px; background: linear-gradient(to right, transparent, #e0e0e0, transparent); margin: 30px 0;">
        </div>
        
        <!-- Security note -->
        <div style="background: #fff3e0; color: #f57c00; padding: 12px; border-radius: 8px; font-size: 13px; margin-top: 20px;">
            🔒 Never share this code with anyone. Our team will never ask for it.
        </div>
        
    </div>
    
    <!-- Footer -->
    <div style="padding: 20px 30px; background: #fafafa; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 0 0 5px 0;">
            Need help? <a href="#" style="color: #667eea; text-decoration: none; font-weight: 500;">Contact Support</a>
        </p>
        <p style="color: #888; font-size: 12px; line-height: 1.5; margin: 0;">
            © 2026 BChat. All rights reserved.
        </p>
    </div>
    
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