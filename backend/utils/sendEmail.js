const nodemailer = require("nodemailer");

/**
 * sendEmail options:
 * { email, subject, message, html }
 * Supports two modes:
 * - If EMAIL_SERVICE === 'gmail' it will use Gmail SMTP with EMAIL_USER and EMAIL_PASS (app password recommended).
 * - Otherwise it will use EMAIL_HOST / EMAIL_PORT and EMAIL_USER / EMAIL_PASS.
 */
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // choose transporter configuration
  let transporterConfig = null;

  if ((process.env.EMAIL_SERVICE || "").toLowerCase() === "gmail") {
    // Using Gmail SMTP (recommended: use an App Password when 2FA is enabled)
    transporterConfig = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  } else {
    transporterConfig = {
      host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
      port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
      secure: !!(process.env.EMAIL_SECURE && process.env.EMAIL_SECURE === "true"),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  const transporter = nodemailer.createTransport(transporterConfig);

  const mailOptions = {
    from: '"Cooking Note App" <no-reply@cookingnote.dev>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // allow HTML if provided
    html: options.html || undefined,
  };

  await transporter.sendMail(mailOptions);
  
  if ((process.env.EMAIL_SERVICE || "").toLowerCase() === "gmail") {
    console.log("✅ Email sent via Gmail SMTP to:", options.email);
  } else {
    console.log("✅ Email sent (host:", transporterConfig.host + ") to:", options.email);
  }
};

module.exports = sendEmail;
