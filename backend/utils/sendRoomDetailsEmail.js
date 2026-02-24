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
  name: "BChat Collaboration",
  email: process.env.EMAIL_USER,
},
to: [{ email: to }],
subject: "Your BChat Room Has Been Created",
htmlContent: `
  <div style="margin:0; padding:0; background-color:#f6f9fc; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          
          <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; padding:48px; box-shadow:0 8px 30px rgba(0,0,0,0.04);">
            
            <!-- Header -->
            <tr>
              <td style="font-size:22px; font-weight:600; color:#111827; padding-bottom:24px;">
                BChat
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="font-size:20px; font-weight:600; color:#111827; padding-bottom:16px;">
                Room Successfully Created
              </td>
            </tr>

            <!-- Intro -->
            <tr>
              <td style="font-size:15px; line-height:1.6; color:#4b5563; padding-bottom:32px;">
                Your secure collaboration room has been successfully provisioned. 
                The access credentials and details are outlined below.
              </td>
            </tr>

            <!-- Details Box -->
            <tr>
              <td>
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:24px;">
                  
                  <tr>
                    <td style="padding:8px 0; font-size:13px; color:#6b7280;">Room Name</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:16px; font-size:15px; font-weight:500; color:#111827;">
                      ${roomName}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0; font-size:13px; color:#6b7280;">Room ID</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:16px; font-size:15px; font-weight:500; color:#111827;">
                      ${roomId}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0; font-size:13px; color:#6b7280;">Password</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:16px; font-size:15px; font-weight:500; color:#111827;">
                      ${password}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 0; font-size:13px; color:#6b7280;">Expiration</td>
                  </tr>
                  <tr>
                    <td style="font-size:15px; font-weight:500; color:#111827;">
                      ${expiryText}
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            <!-- Security Note -->
            <tr>
              <td style="padding-top:32px; font-size:13px; line-height:1.6; color:#6b7280;">
                For security purposes, please ensure that these credentials are shared only with authorized participants. 
                BChat will never request your password via email.
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
              <td style="padding-top:20px; font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} BChat. All rights reserved.<br/>
                This is an automated notification. Please do not reply to this message.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
`,   },
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