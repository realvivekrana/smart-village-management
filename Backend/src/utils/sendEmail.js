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
    err.status = res.status;
    throw err;
  }

  return res.json();
};

/*
|--------------------------------------------------------------------------
| Send Email (retry + failover)
|--------------------------------------------------------------------------
| Providers (jo configured ho): Brevo API  ->  SMTP
| - Har provider par temporary error (timeout, network, 5xx, 429) me 1 retry.
| - Ek provider fail ho to agla provider try hota hai.
| - Permanent error (galat key / sender, EAUTH) par retry nahi, seedha agla.
| Kuch bhi configured nahi hai to email bheji nahi jayegi (sirf console warning).
*/

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isPermanent = (error) => {
  const status = error.status;
  if (status && status >= 400 && status < 500 && ![408, 429].includes(status)) return true;
  return ["EAUTH", "EENVELOPE", "EMESSAGE"].includes(error.code);
};

const getProviders = () => {
  const list = [];
  if (env.email.brevoApiKey) list.push("brevo");
  if (env.email.smtpEnabled) list.push("smtp");
  return list;
};

const sendVia = (provider, { to, subject, html, text }) => {
  if (provider === "brevo") return sendWithBrevo({ to, subject, html, text });

  return getTransporter().sendMail({
    from: env.email.from,
    to,
    subject,
    html,
    text,
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!env.email.enabled) {
    logger.warn(
      `Email not configured (set BREVO_API_KEY or SMTP_*). Email skipped -> ${to} | ${subject}`
    );
    logger.debug(text || html);

    return { skipped: true };
  }

  const MAX_ATTEMPTS = 2;
  let lastError;

  for (const provider of getProviders()) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const result = await sendVia(provider, { to, subject, html, text });

        if (attempt > 1 || lastError) {
          logger.info(`Email sent via ${provider} (attempt ${attempt}) after earlier failure.`);
        }

        return result;
      } catch (error) {
        lastError = error;

        logger.error(
          `Email send FAILED via ${provider} (attempt ${attempt}/${MAX_ATTEMPTS}) -> ${to} | ` +
            `${error.code || ""} ${error.message}`
        );

        if (isPermanent(error) || attempt === MAX_ATTEMPTS) break;

        await sleep(700);
      }
    }
  }

  throw lastError;
};

module.exports = sendEmail;