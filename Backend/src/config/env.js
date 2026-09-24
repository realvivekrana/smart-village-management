const dotenv = require("dotenv");

dotenv.config({ quiet: true });

/*
|--------------------------------------------------------------------------
| Required Variables
|--------------------------------------------------------------------------
| Inke bina server start hi nahi hoga (fail fast).
*/

const required = ["MONGO_URI", "JWT_SECRET"];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}`
  );
  console.error("Backend/.env file check karo (.env.example dekho).");
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || "development";

const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

cloudinary.enabled = Boolean(
  cloudinary.cloudName && cloudinary.apiKey && cloudinary.apiSecret
);

const email = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from:
    process.env.EMAIL_FROM || "Smart Village <no-reply@smartvillage.com>",
};

email.enabled = Boolean(email.host && email.user && email.pass);

module.exports = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: Number(process.env.PORT) || 5000,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cloudinary,
  email,
};