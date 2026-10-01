/*
| Email setup test:  npm run test:email            (apne SMTP_USER par test mail)
|                    npm run test:email -- koi@gmail.com
| Ye batata hai ki .env sahi load hua ya nahi, Gmail login chala ya nahi, aur fail hone par asli wajah kya hai.
*/
const nodemailer = require("nodemailer");
const env = require("../config/env");

const mask = (v = "") => (v ? `${v.slice(0, 2)}***${v.slice(-2)} (${v.length} chars)` : "(KHALI)");

(async () => {
  const to = process.argv[2] || env.email.user;

  console.log("\n--- .env se mila SMTP config ---");
  console.log("SMTP_HOST :", env.email.host || "(KHALI)");
  console.log("SMTP_PORT :", env.email.port);
  console.log("SMTP_USER :", env.email.user || "(KHALI)");
  console.log("SMTP_PASS :", mask(env.email.pass));
  console.log("EMAIL_FROM:", env.email.from);
  console.log("Test mail kisko:", to);

  if (!env.email.enabled) {
    console.log("\n❌ SMTP_HOST / SMTP_USER / SMTP_PASS me se koi khali hai.");
    console.log("   Check: is the .env file inside the Backend folder? Is the terminal running in that folder?");
    process.exit(1);
  }

  if (/\s/.test(env.email.pass) || env.email.pass.length !== 16) {
    console.log("\n⚠️  App Password must be 16 characters with no spaces. Current length:", env.email.pass.length);
  }

  const transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: { user: env.email.user, pass: env.email.pass },
  });

  try {
    await transporter.verify();
    console.log("\n✅ Gmail se connection + login SAHI hai.");
    const info = await transporter.sendMail({
      from: env.email.from,
      to,
      subject: "Smart Village - test email",
      text: "Agar ye mail aa gayi to forgot password email bhi chalega.",
    });
    console.log("✅ Mail bhej di gayi. Response:", info.response);
    console.log("   Ab", to, "ka Inbox aur Spam folder dekho.");
    process.exit(0);
  } catch (err) {
    console.log("\n❌ FAIL:", err.code || "", "-", err.message);
    if (err.code === "EAUTH" || /535|Username and Password/i.test(err.message)) {
      console.log("   Meaning: the App Password is wrong, or SMTP_USER is not the Google account the password was created for.");
      console.log("   Fix: create a new one at myaccount.google.com/apppasswords and put it in SMTP_PASS without spaces.");
    } else if (["ETIMEDOUT", "ECONNECTION", "ESOCKET", "ECONNREFUSED"].includes(err.code)) {
      console.log("   Meaning: the network cannot reach Gmail (firewall / antivirus / WiFi / ISP port block).");
      console.log("   Fix: try again with SMTP_PORT=465, or try on a mobile hotspot.");
    } else if (err.code === "EDNS" || err.code === "ENOTFOUND") {
      console.log("   Meaning: SMTP_HOST is wrong or there is no internet. It should be smtp.gmail.com.");
    }
    process.exit(1);
  }
})();