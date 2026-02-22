const nodemailer = require("nodemailer");

const sendRoomDetailsEmail = async ({
  to,
  roomName,
  roomId,
  password,
  expiresAt
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const expiryText = expiresAt
      ? new Date(expiresAt).toDateString()
      : "Never expires";

    await transporter.sendMail({
      from: `"BChat" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your BChat Room Details 🎉",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Room Created Successfully 🚀</h2>
          
          <p><strong>Room Name:</strong> ${roomName}</p>
          <p><strong>Room ID:</strong> ${roomId}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Expires On:</strong> ${expiryText}</p>
          
          <hr/>
          
          <p>Share the Room ID and Password with your friends to let them join.</p>
          <p>Keep this email safe for future reference.</p>
          
          <br/>
          <p>— BChat Team</p>
        </div>
      `
    });

  } catch (error) {
    console.error("Room Email Error:", error);
  }
};

module.exports = sendRoomDetailsEmail;