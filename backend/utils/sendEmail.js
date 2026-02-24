const axios = require("axios");

const sendEmail = async (email, otp) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
  name: "BChat Secure",
  email: process.env.EMAIL_USER,
},
to: [{ email }],
subject: "BChat Verification Code",
htmlContent: `
  <div style="margin:0; padding:0; background-color:#f3f4f6; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          
          <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:40px; box-shadow:0 6px 24px rgba(0,0,0,0.05);">
            
            <!-- Brand -->
            <tr>
              <td style="font-size:18px; font-weight:600; color:#111827; padding-bottom:28px;">
                BChat Secure
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="font-size:20px; font-weight:600; color:#111827; padding-bottom:12px;">
                Verify Your Identity
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="font-size:15px; color:#4b5563; line-height:1.6; padding-bottom:28px;">
                Use the verification code below to complete your sign-in request. 
                This code is valid for a limited time.
              </td>
            </tr>

            <!-- OTP Box -->
            <tr>
              <td align="center" style="padding:24px 0;">
                <div style="display:inline-block; padding:18px 28px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; font-size:36px; letter-spacing:10px; font-weight:600; color:#111827;">
                  ${otp}
                </div>
              </td>
            </tr>

            <!-- Expiry -->
            <tr>
              <td style="font-size:14px; color:#6b7280; text-align:center; padding-bottom:24px;">
                This code will expire in 10 minutes.
              </td>
            </tr>

            <!-- Security Notice -->
            <tr>
              <td style="font-size:13px; color:#6b7280; line-height:1.6; padding-top:12px;">
                If you did not request this verification, you may safely ignore this email. 
                For your security, BChat will never ask you to share this code with anyone.
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
                © ${new Date().getFullYear()} BChat. All rights reserved.<br/>
                This is an automated security notification.
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

    console.log("✅ OTP email sent via Brevo API:", email);
  } catch (error) {
    console.error("❌ Brevo API Error:", error.response?.data || error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;