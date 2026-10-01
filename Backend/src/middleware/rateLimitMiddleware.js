const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = rateLimit;

/*
|--------------------------------------------------------------------------
| Create Rate Limiter
|--------------------------------------------------------------------------
*/

const createLimiter = ({
  windowMs,
  limit,
  message,
  ...options
}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
      success: false,
      message,
    },

    ...options,
  });

/*
|--------------------------------------------------------------------------
| API Limiter
|--------------------------------------------------------------------------
| Poore /api ke liye
*/

const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message:
    "Too many requests. Please try again later.",
});

/*
|--------------------------------------------------------------------------
| Auth Limiter
|--------------------------------------------------------------------------
| Login / Register
| Sirf failed attempts count honge.
*/

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  message:
    "Too many login attempts. Please try again after 15 minutes.",
});

/*
|--------------------------------------------------------------------------
| Password Reset Limiter
|--------------------------------------------------------------------------
| OTP verification + password reset attempts.
*/

const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message:
    "Too many password reset attempts. Please try again after an hour.",
});

/*
|--------------------------------------------------------------------------
| Password Reset OTP Send Limiter
|--------------------------------------------------------------------------
| OTP baar-baar email par send hone se prevent karega.
|
| 5 OTP requests / hour / IP
|--------------------------------------------------------------------------
*/

const passwordResetOtpLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message:
    "Too many OTP requests. Please try again after an hour.",
});

/*
|--------------------------------------------------------------------------
| Email Limiter
|--------------------------------------------------------------------------
| General email-related requests.
*/

const emailLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message:
    "Too many email requests. Please try again after an hour.",
});

/*
|--------------------------------------------------------------------------
| Contact Form Limiter
|--------------------------------------------------------------------------
| Contact form spam rokne ke liye.
*/

const contactLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message:
    "Too many messages sent. Please try again after an hour.",
});

/*
|--------------------------------------------------------------------------
| SOS Limiter
|--------------------------------------------------------------------------
| SOS prank / galti se baar-baar dabne se bachane ke liye.
*/

const sosLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  message:
    "Too many SOS alerts sent. If this is a real emergency, call 112 directly.",
});

/*
|--------------------------------------------------------------------------
| Submission Limiter
|--------------------------------------------------------------------------
| Citizen posts / events / notices / photos / businesses
| ke spam ko control karne ke liye.
*/

const submissionLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 20,

  keyGenerator: (req) =>
    req.user
      ? `user:${req.user._id}`
      : ipKeyGenerator(req.ip),

  message:
    "You are posting too quickly. Please try again after a little while.",
});

/*
|--------------------------------------------------------------------------
| AI Assistant Limiter
|--------------------------------------------------------------------------
| AI assistant har message par DB queries aur optional LLM
| call kar sakta hai.
*/

const assistantLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 40,
  message:
    "Assistant se bahut zyada sawal ho gaye. Thodi der baad try karein.",
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  apiLimiter,
  assistantLimiter,
  submissionLimiter,

  authLimiter,

  passwordResetLimiter,
  passwordResetOtpLimiter,

  emailLimiter,

  contactLimiter,
  sosLimiter,
};