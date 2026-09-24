const rateLimit = require("express-rate-limit");

const createLimiter = ({ windowMs, limit, message, ...options }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    ...options,
  });

// Poore /api ke liye
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: "Too many requests. Please try again later.",
});

// Login / Register (sirf failed attempts count honge)
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

// Forgot password / verification email
const emailLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many email requests. Please try again after an hour.",
});

module.exports = {
  apiLimiter,
  authLimiter,
  emailLimiter,
};