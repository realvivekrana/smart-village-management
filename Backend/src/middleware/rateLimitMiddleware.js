const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = rateLimit;

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

// Password reset: sirf galat attempts count honge (phone guess karne se rokne ke liye)
const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: "Too many reset attempts. Please try again after an hour.",
});

// Forgot password / verification email
const emailLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many email requests. Please try again after an hour.",
});

// Contact form spam rokne ke liye (public endpoint)
const contactLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many messages sent. Please try again after an hour.",
});

// SOS prank / galti se baar-baar dabne se bachane ke liye
const sosLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  message: "Too many SOS alerts sent. If this is a real emergency, call 112 directly.",
});

// Ab citizen posts bina admin approval ke live hoti hain, isliye spam rokne ke liye
// har logged-in user ki naye post / event / notice / photo / business par limit.
const submissionLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  keyGenerator: (req) => (req.user ? `user:${req.user._id}` : ipKeyGenerator(req.ip)),
  message: "Aap bahut jaldi-jaldi post kar rahe hain. Thodi der baad dobara koshish karein.",
});

module.exports = {
  apiLimiter,
  submissionLimiter,
  authLimiter,
  passwordResetLimiter,
  emailLimiter,
  contactLimiter,
  sosLimiter,
};