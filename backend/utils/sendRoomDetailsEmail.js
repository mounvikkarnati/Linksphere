const axios = require("axios");

const sendRoomDetailsEmail = async ({
  to,
  roomName,
  roomId,
  password,
  expiresAt,
}) => {
  try {
    const expiryText = expiresAt
      ? new Date(expiresAt).toDateString()
      : "Never expires";

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "BChat",
          email: process.env.EMAIL_USER,
        },
        to: [{ email: to }],
        subject: "Your BChat Room Details 🎉",
        htmlContent: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); border: 1px solid #eaecf0;">
    
    <!-- Header with celebration accent -->
    <div style="text-align: center; margin-bottom: 32px;">
        <div style="background: linear-gradient(135deg, #10b98115 0%, #05966915 100%); width: 70px; height: 70px; border-radius: 35px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 32px;">🎉</span>
        </div>
        <h2 style="color: #111827; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.02em;">Room Created Successfully!</h2>
        <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.5;">Your secure chat room is ready to use</p>
    </div>
    
    <!-- Room Details Card -->
    <div style="background: #f9fafb; border-radius: 20px; padding: 28px; margin: 28px 0; border: 1px solid #e5e7eb;">
        
        <!-- Room Name -->
        <div style="display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <div style="background: #e0f2fe; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 20px;">📌</span>
            </div>
            <div style="flex: 1;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Room Name</p>
                <p style="color: #111827; font-size: 18px; font-weight: 600; margin: 0;">${roomName}</p>
            </div>
        </div>
        
        <!-- Room ID -->
        <div style="display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <div style="background: #ede9fe; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 20px;">🆔</span>
            </div>
            <div style="flex: 1;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Room ID</p>
                <p style="color: #111827; font-size: 18px; font-weight: 600; margin: 0; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace; background: #ffffff; padding: 6px 12px; border-radius: 8px; border: 1px solid #e5e7eb; display: inline-block;">${roomId}</p>
            </div>
        </div>
        
        <!-- Password -->
        <div style="display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <div style="background: #fee2e2; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 20px;">🔐</span>
            </div>
            <div style="flex: 1;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Password</p>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <p style="color: #111827; font-size: 18px; font-weight: 600; margin: 0; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace; background: #ffffff; padding: 6px 12px; border-radius: 8px; border: 1px solid #e5e7eb;">${password}</p>
                    <span style="background: #dcfce7; color: #059669; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">Secure</span>
                </div>
            </div>
        </div>
        
        <!-- Expiry -->
        <div style="display: flex; align-items: center; gap: 16px; padding: 12px 0;">
            <div style="background: #fff7ed; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 20px;">⏳</span>
            </div>
            <div style="flex: 1;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Expires On</p>
                <p style="color: #111827; font-size: 18px; font-weight: 600; margin: 0;">${expiryText}</p>
            </div>
        </div>
    </div>
    
    <!-- Important Notes -->
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 16px; margin: 28px 0;">
        <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
            <span>📋</span> Important Information
        </p>
        <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 13px; line-height: 1.6;">
            <li style="margin-bottom: 6px;">Save this information — you'll need it to join the room</li>
            <li style="margin-bottom: 6px;">Share the Room ID and password only with intended participants</li>
            <li>The room will automatically expire on the date mentioned above</li>
        </ul>
    </div>
    
    <!-- Action Buttons -->
    <div style="text-align: center; margin: 32px 0 24px;">
        <a href="#" style="background: #111827; color: white; padding: 14px 32px; border-radius: 40px; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; margin-bottom: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">Join Room Now →</a>
        <p style="color: #6b7280; font-size: 13px; margin: 8px 0 0 0;">or copy this link: <span style="color: #3b82f6; font-family: monospace;">https://bchat.app/join/${roomId}</span></p>
    </div>
    
    <!-- Security Footer -->
    <div style="background: #fafafa; border-radius: 16px; padding: 16px; margin-top: 28px; text-align: center; border: 1px solid #eaecf0;">
        <p style="color: #4b5563; font-size: 12px; line-height: 1.6; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>🛡️</span>
            <span>This is an automated message from BChat. For security, never forward this email.</span>
        </p>
    </div>
    
    <!-- Footer Links -->
    <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #eaecf0;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 12px 0;">
            © 2024 BChat. All rights reserved.
        </p>
        <div style="display: flex; gap: 24px; justify-content: center;">
            <a href="#" style="color: #6b7280; font-size: 12px; text-decoration: none;">Privacy Policy</a>
            <a href="#" style="color: #6b7280; font-size: 12px; text-decoration: none;">Terms of Service</a>
            <a href="#" style="color: #6b7280; font-size: 12px; text-decoration: none;">Help Center</a>
        </div>
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

    console.log("✅ Room email sent via Brevo API");
  } catch (error) {
    console.error("❌ Brevo API Error:", error.response?.data || error.message);
  }
};

module.exports = sendRoomDetailsEmail;