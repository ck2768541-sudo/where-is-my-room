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
    from: `"StayRent" <${process.env.EMAIL_USER}>`,
    replyTo: "stayrentofficial@gmail.com",
    to: email,

    subject: "StayRent - Password Reset OTP",

    text: `Your StayRent password reset OTP is ${otp}. It expires in 5 minutes.

If you did not request this password reset, please ignore this email.

StayRent Support
stayrentofficial@gmail.com`,

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 520px;
          margin: auto;
          color: #111827;
        "
      >
        <h2
          style="
            color: #635BFF;
            margin-bottom: 20px;
          "
        >
          StayRent
        </h2>

        <p>
          You requested to reset your
          StayRent password.
        </p>

        <p>
          Your 6-digit OTP is:
        </p>

        <div
          style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 24px 0;
            color: #111827;
          "
        >
          ${otp}
        </div>

        <p>
          This OTP is valid for
          <strong>5 minutes</strong>.
        </p>

        <p>
          If you did not request this,
          please ignore this email.
        </p>

        <hr
          style="
            margin: 28px 0 18px;
            border: 0;
            border-top: 1px solid #E5E7EB;
          "
        />

        <p
          style="
            font-size: 12px;
            color: #667085;
          "
        >
          Need help? Contact StayRent Support:
          <br />
          <a
            href="mailto:stayrentofficial@gmail.com"
            style="color: #635BFF;"
          >
            stayrentofficial@gmail.com
          </a>
        </p>
      </div>
    `,
  });

  console.log(
    "OTP EMAIL SENT:",
    info.messageId
  );
};

module.exports = {
  sendOTPEmail,
};