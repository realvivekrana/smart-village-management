const nodemailer = require("nodemailer");

const env = require("../config/env");
const logger = require("./logger");

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465,
      auth: {
        user: env.email.user,
        pass: env.email.pass,
      },
    });
  }

  return transporter;
};

/*
|--------------------------------------------------------------------------
| Send Email
|--------------------------------------------------------------------------
| SMTP configured nahi hai to email bheji nahi jayegi, sirf console me
| print hogi (development me reset/verify link yahin se mil jayega).
*/

const sendEmail = async ({ to, subject, html, text }) => {
  if (!env.email.enabled) {
    logger.warn(`SMTP not configured. Email skipped -> ${to} | ${subject}`);
    logger.debug(text || html);

    return { skipped: true };
  }

  return getTransporter().sendMail({
    from: env.email.from,
    to,
    subject,
    html,
    text,
  });
};

module.exports = sendEmail;