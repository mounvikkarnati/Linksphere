const axios = require("axios");

const sendOtpEmail = async (email, otp, purpose = "Verification") => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
  name: "LinkSphere BChat Security",
  email: process.env.EMAIL_USER,
},
to: [{ email }],
subject: `${purpose} Verification Code – LinkSphere BChat`,
htmlContent: `
  <div style="margin:0; padding:0; background-color:#f5f7fa; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          
          <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; padding:40px; box-shadow:0 8px 28px rgba(0,0,0,0.05);">
            
            <!-- Brand -->
            <tr>
              <td style="font-size:18px; font-weight:600; color:#111827; padding-bottom:24px;">
                LinkSphere BChat
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="font-size:20px; font-weight:600; color:#111827; padding-bottom:12px;">
                Account Recovery Verification
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="font-size:15px; color:#4b5563; line-height:1.6; padding-bottom:28px;">
                We received a request to reset your password. 
                Please use the verification code below to continue with your account recovery process.
              </td>
            </tr>

            <!-- OTP Box -->
            <tr>
              <td align="center" style="padding:24px 0;">
                <div style="display:inline-block; padding:18px 32px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; font-size:34px; letter-spacing:8px; font-weight:600; color:#2563eb;">
                  ${otp}
                </div>
              </td>
            </tr>

            <!-- Expiry -->
            <tr>
              <td style="font-size:14px; color:#6b7280; text-align:center; padding-bottom:24px;">
                This code is valid for 10 minutes.
              </td>
            </tr>

            <!-- Security Notice -->
            <tr>
              <td style="font-size:13px; color:#6b7280; line-height:1.6;">
                If you did not request a password reset, no further action is required. 
                Your account remains secure. For your protection, never share this verification code with anyone.
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:32px 0 0 0;">
                <hr style="border:none; border-top:1px solid #e5e7eb;">
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding-top:18px; font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} LinkSphere BChat. All rights reserved.<br/>
                This is an automated security message. Please do not reply.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

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