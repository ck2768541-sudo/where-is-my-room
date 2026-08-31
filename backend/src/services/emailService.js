const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },

  family: 4,

  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,

  tls: {
    servername: "smtp.gmail.com",
  },
});

const sendOTPEmail = async (email, otp) => {
  const info = await transporter.sendMail({
    from: `"Where Is My Room" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Where Is My Room - Password Reset OTP",

    text: `Your password reset OTP is ${otp}. It expires in ${
      process.env.OTP_EXPIRES_MINUTES || 10
    } minutes.`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <h2>Where Is My Room</h2>

        <p>You requested to reset your password.</p>

        <p>Your 6-digit OTP is:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 24px 0;
        ">
          ${otp}
        </div>

        <p>
          This OTP expires in
          ${process.env.OTP_EXPIRES_MINUTES || 10} minutes.
        </p>

        <p>
          If you did not request this, ignore this email.
        </p>
      </div>
    `,
  });

  console.log("OTP EMAIL SENT:", info.messageId);
};

module.exports = {
  sendOTPEmail,
};