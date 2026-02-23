const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4, // 🔥 FORCE IPv4 (VERY IMPORTANT)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - BChat",
 html: `

<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 4px 12px 0 rgba(0, 0, 0, 0.06);">
        
        <!-- Header with gradient background -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 32px 40px; text-align: center;">
            <div style="display: inline-block; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 8px;">
                LinkSphere <span style="color: #fbbf24;">BChat</span>
            </div>
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: 30px; letter-spacing: 0.3px;">
                SECURE ACCESS
            </div>
        </div>
        
        <!-- Main content -->
        <div style="padding: 40px 40px 32px;">
            <div style="font-size: 16px; font-weight: 500; color: #475569; margin-bottom: 12px;">
                Password Reset Request
            </div>
            
            <h1 style="font-size: 28px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.3px;">
                Verify Your Identity
            </h1>
            
            <p style="font-size: 15px; color: #64748b; margin: 0 0 32px 0; border-left: 3px solid #e2e8f0; padding-left: 16px;">
                We received a request to reset your password. Use the verification code below to complete the process.
            </p>
            
            <!-- OTP Container with subtle background -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 20px; padding: 28px; text-align: center; margin-bottom: 32px; border: 1px solid #e2e8f0;">
                <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #475569; margin-bottom: 8px;">
                    Verification Code
                </div>
                <div style="font-size: 48px; font-weight: 700; color: #2563eb; letter-spacing: 8px; margin: 16px 0; font-family: 'Courier New', monospace;">
                    ${otp}
                </div>
                <div style="display: inline-block; background: #fef3c7; color: #92400e; font-size: 14px; font-weight: 500; padding: 8px 20px; border-radius: 30px; margin-top: 8px;">
                    ⏰ Expires in 10 minutes
                </div>
            </div>
            
            <!-- Security notice -->
            <div style="background-color: #f0f9ff; border-radius: 16px; padding: 20px; margin-bottom: 32px; border-left: 4px solid #2563eb;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #0c4a6e; font-size: 14px;">
                    🔒 Security Tips:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #0369a1; font-size: 13px; line-height: 1.8;">
                    <li>Never share this code with anyone</li>
                    <li>Our team will never ask for this code</li>
                    <li>If you didn't request this, please ignore this email</li>
                </ul>
            </div>
            
            <!-- Divider -->
            <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 32px 0 24px;"></div>
            
            <!-- Footer with copyright -->
            <div style="text-align: center; color: #94a3b8; font-size: 13px;">
                <p style="margin: 0 0 8px 0;">
                    © 2026 LinkSphere Team BChat. All rights reserved.
                </p>
                <p style="margin: 0; font-size: 11px;">
                    Secure communication platform for modern teams
                </p>
            </div>
        </div>
    </div>
    
    <!-- Small note for email clients -->
    <div style="max-width: 520px; margin: 16px auto 0; text-align: center; color: #94a3b8; font-size: 11px; padding: 0 20px;">
        This is an automated message from LinkSphere BChat. Please do not reply to this email.
    </div>
    </body>
    `,
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
    throw error;
  }
};

module.exports = sendOtpEmail;