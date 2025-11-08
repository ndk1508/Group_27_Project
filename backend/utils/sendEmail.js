const nodemailer = require("nodemailer");

/**
 * sendEmail options:
 * { email, subject, message, html }
 * Supports two modes:
 * - If EMAIL_SERVICE === 'gmail' it will use Gmail SMTP with EMAIL_USER and EMAIL_PASS (app password recommended).
 * - Otherwise it will use EMAIL_HOST / EMAIL_PORT and EMAIL_USER / EMAIL_PASS.
 */
const sendEmail = async (options) => {
  // basic validation: require recipient and subject
  if (!options || !options.email) {
    throw new Error("sendEmail: missing options.email");
  }

  // ensure auth credentials exist when required
  const service = (process.env.EMAIL_SERVICE || "").toLowerCase();
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    // If no credentials provided, throw a helpful error so caller can handle it
    throw new Error("Email credentials not configured. Set EMAIL_USER and EMAIL_PASS (or configure EMAIL_HOST/EMAIL_PORT). For Gmail use EMAIL_SERVICE=gmail and an App Password.");
  }

  // choose transporter configuration
  let transporterConfig = null;

  if (service === "gmail") {
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
    from: process.env.EMAIL_FROM || '"No Reply" <no-reply@example.com>',
    to: options.email,
    subject: options.subject || "No subject",
    text: options.message || "",
    html: options.html || undefined,
  };

  // send mail and return transporter response
  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
