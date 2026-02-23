const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp, purpose = "Verification") => {
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

    await transporter.sendMail({
      from: `"LinkSphere BChat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${purpose} OTP - LinkSphere BChat`,
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>${purpose} OTP</h2>
          <h1 style="color:#2563eb; letter-spacing:6px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
          <p style="font-size:13px; color:#888;">
            🔒 Never share this code with anyone.
          </p>
        </div>
      `,
    });

    console.log("✅ Email sent via Brevo SMTP");
  } catch (error) {
    console.error("❌ Brevo SMTP Error:", error);
    throw error;
  }
};

module.exports = sendOtpEmail;