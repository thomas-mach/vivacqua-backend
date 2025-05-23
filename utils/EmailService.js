const nodemailer = require("nodemailer");
const emailTemplates = require("./emailMessages"); // il tuo file dei messaggi
const dotenv = require("dotenv");
dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    this.from = `"Thomas Mach" <${process.env.GMAIL_USER}>`;
    this.devEmail = "m4chtomasz@gmail.com";
  }

  async send({ to, subject, html }) {
    const recipient =
      process.env.NODE_ENV === "production" ? to : this.devEmail;

    const mailOptions = {
      from: this.from,
      to: recipient,
      subject,
      html,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendVerificationEmail(user, url, isNew = true) {
    console.log(user, url, isNew);
    const html = isNew
      ? emailTemplates.messageNewUser(user.name, url)
      : emailTemplates.messageExistingUser(user.name, url);

    return this.send({
      to: user.email,
      subject: isNew
        ? "Conferma il tuo indirizzo email"
        : "Riattiva il tuo account",
      html,
    });
  }

  async sendResetPasswordEmail(user, url) {
    const html = emailTemplates.messageResetPassword(url);

    return this.send({
      to: user.email,
      subject: "Reset della tua password",
      html,
    });
  }

  async sendDeactivationNotice(user, url) {
    const html = emailTemplates.messageDeactivatedUser(url);

    return this.send({
      to: user.email,
      subject: "Il tuo account è stato disattivato",
      html,
    });
  }

  async messageOrderPaid(userEmail, orderId, orderTotal) {
    const html = emailTemplates.messageOrderPaid(orderId, orderTotal);

    return this.send({
      to: userEmail,
      subject: "Conferma pagamento VIVACQUA",
      html,
    });
  }
}

module.exports = EmailService;
