const nodemailer = require("nodemailer");

const sendRoomDetailsEmail = async ({
  to,
  roomName,
  roomId,
  password,
  expiresAt,
}) => {
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

    const expiryText = expiresAt
      ? new Date(expiresAt).toDateString()
      : "Never expires";

    await transporter.sendMail({
      from: `"BChat" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your BChat Room Details 🎉",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #2c3e50;">🎉 Room Created Successfully!</h2>

        <p>Your room has been created successfully. Here are the details:</p>

        <div style="background-color: #f4f6f8; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Room Name:</strong> ${roomName}</p>
          <p><strong>Room ID:</strong> ${roomId}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Expires On:</strong> ${expiryText}</p>
        </div>

        <p>
          Share the <strong>Room ID</strong> and <strong>Password</strong> with your friends so they can join.
        </p>

        <p>Please keep this email safe for future reference.</p>

        <hr style="margin: 25px 0;" />

        <p style="font-size: 14px; color: #777;">— BChat Team</p>

        <p style="font-size: 12px; color: #999;">
          © 2026 LinkSphere Team BChat. All rights reserved.
        </p>
      </div>
      `,
    });

    console.log("✅ Room details email sent via Brevo SMTP");
  } catch (error) {
    console.error("❌ Room Email Error:", error);
  }
};

module.exports = sendRoomDetailsEmail;