const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"BChat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "BChat OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color:#00f5d4;">BChat Email Verification</h2>
          <p>Your OTP Code:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This OTP expires in 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("OTP email sent to:", email);

  } catch (error) {
    console.log("Email Sending Error:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;