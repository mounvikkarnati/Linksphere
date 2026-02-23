const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"BChat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "BChat OTP Verification",
      html: `
      <div style="max-width: 480px; margin: 0 auto; font-family: Arial, sans-serif; background: white; border-radius: 24px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h2 style="color: white; margin: 0;">Welcome to <span style="color:#00f5d4;">BChat</span></h2>
        </div>

        <div style="padding: 40px; text-align: center;">
          <p>Hello there 👋</p>
          <p>Your verification code is:</p>

          <h1 style="font-size: 48px; letter-spacing: 8px; color: #667eea;">
            ${otp}
          </h1>

          <p style="margin-top:20px;">⏰ This code expires in 10 minutes</p>

          <div style="margin-top:30px; font-size:13px; color:#888;">
            🔒 Never share this code with anyone.
          </div>
        </div>

        <div style="padding: 20px; background:#fafafa; text-align:center; font-size:12px; color:#888;">
          © 2026 BChat. All rights reserved.
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ OTP email sent via Brevo to:", email);
  } catch (error) {
    console.error("❌ Email Sending Error:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;