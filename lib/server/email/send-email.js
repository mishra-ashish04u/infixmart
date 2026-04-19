import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure =
  process.env.SMTP_SECURE != null
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465;

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

const FROM_ADDRESS = process.env.SMTP_FROM || "InfixMart Support <support@infixmart.com>";
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL  || "admin@infixmart.com";

async function sendEmail({ to, subject, text = "", html = "", replyTo }) {
  await getTransporter().sendMail({
    from: FROM_ADDRESS,
    replyTo: replyTo || "support@infixmart.com",
    to,
    subject,
    text,
    html,
  });
}

export { sendEmail, ADMIN_EMAIL, FROM_ADDRESS };

