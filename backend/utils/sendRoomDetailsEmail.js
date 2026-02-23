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
          <div style="font-family: Arial; padding:20px;">
            <h2>🎉 Room Created Successfully!</h2>
            <p><strong>Room Name:</strong> ${roomName}</p>
            <p><strong>Room ID:</strong> ${roomId}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p><strong>Expires On:</strong> ${expiryText}</p>
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