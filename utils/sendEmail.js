const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "ac00eb9b7b9bc8",
    pass: "123acb0d6c8d7f"
  }
});

const stripHtml = (html = '') => {
  if (typeof html !== 'string') return '';
  return html.replace(/<[^>]*>?/gm, '');
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(`📤 Sending email to: ${to}`);
    console.log("✉️  Email HTML content:", html);

    await transporter.sendMail({
      from: '"E-Commerce App" <no-reply@ecommerce.com>',
      to,
      subject,
      html,
      text: stripHtml(html) // Used as fallback for non-HTML readers
    });

    console.log("📧 Email sent successfully (Mailtrap)");
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
  }
};

module.exports = sendEmail;
