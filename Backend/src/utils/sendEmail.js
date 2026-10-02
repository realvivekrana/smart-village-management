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
      // Hang hone se bachane ke liye (warna request 60s latak jaati hai)
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: env.email.user,
        pass: env.email.pass,
      },
    });
  }

  return transporter;
};

// "Smart Village <a@b.com>"  ->  { name: "Smart Village", email: "a@b.com" }
const parseFrom = (from = "") => {
  const m = String(from).match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || undefined, email: m[2].trim() };
  return { email: String(from).trim() };
};

/*
|--------------------------------------------------------------------------
| Brevo (HTTPS API, port 443)
|--------------------------------------------------------------------------
| SMTP ports (25/465/587) bahut se hosting providers par blocked hote hain.
| Brevo API normal HTTPS se jaati hai, isliye wahan bhi chalti hai.
| EMAIL_FROM Brevo me "verified sender" hona chahiye.
*/
const sendWithBrevo = async ({ to, subject, html, text }) => {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": env.email.brevoApiKey,
    },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      sender: parseFrom(env.email.from),
      to: [{ email: to }],
      subject,
      htmlContent: html || `<p>${String(text || "").replace(/\n/g, "<br>")}</p>`,
      textContent: text || undefined,
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body.message || JSON.stringify(body);
    } catch (e) {
      detail = res.statusText;
    }
    const err = new Error(`Brevo API ${res.status}: ${detail}`);
    err.code = `BREVO_${res.status}`;
    throw err;
  }

  return res.json();
};

/*
|--------------------------------------------------------------------------
| Send Email
|--------------------------------------------------------------------------
| Priority: Brevo API (BREVO_API_KEY)  ->  SMTP (SMTP_HOST/USER/PASS)
| Kuch bhi configured nahi hai to email bheji nahi jayegi, sirf console me
| print hogi (development me reset/verify link yahin se mil jayega).
| Fail hone par asli wajah logger me aati hai.
*/

const sendEmail = async ({ to, subject, html, text }) => {
  if (!env.email.enabled) {
    logger.warn(
      `Email not configured (set BREVO_API_KEY or SMTP_*). Email skipped -> ${to} | ${subject}`
    );
    logger.debug(text || html);

    return { skipped: true };
  }

  try {
    if (env.email.provider === "brevo") {
      return await sendWithBrevo({ to, subject, html, text });
    }

    return await getTransporter().sendMail({
      from: env.email.from,
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    logger.error(
      `Email send FAILED via ${env.email.provider} -> ${to} | ${subject} | ` +
        `${error.code || ""} ${error.message}`
    );
    throw error;
  }
};

module.exports = sendEmail;