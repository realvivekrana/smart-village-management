const express = require("express");

const router = express.Router();

const {
  register,
  login,
  getMe,
  logout,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const validate = require("../middleware/validationMiddleware");

const {
  authLimiter,
  passwordResetLimiter,
  passwordResetOtpLimiter,
} = require("../middleware/rateLimitMiddleware");

const {
  registerValidator,
  loginValidator,
  sendResetOtpValidator,
  verifyResetOtpValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
| POST /api/v1/auth/register
*/

router.post(
  "/register",
  authLimiter,
  registerValidator,
  validate,
  register
);

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
| POST /api/v1/auth/login
*/

router.post(
  "/login",
  authLimiter,
  loginValidator,
  validate,
  login
);

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
| GET /api/v1/auth/me
*/

router.get(
  "/me",
  protect,
  getMe
);

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
| POST /api/v1/auth/logout
*/

router.post(
  "/logout",
  protect,
  logout
);

/*
|--------------------------------------------------------------------------
| Forgot Password - Send OTP
|--------------------------------------------------------------------------
| POST /api/v1/auth/forgot-password/send-otp
|
| Body:
| {
|   email,
|   phone
| }
*/

router.post(
  "/forgot-password/send-otp",
  passwordResetOtpLimiter,
  sendResetOtpValidator,
  validate,
  sendResetOtp
);

/*
|--------------------------------------------------------------------------
| Forgot Password - Verify OTP
|--------------------------------------------------------------------------
| POST /api/v1/auth/forgot-password/verify-otp
|
| Body:
| {
|   email,
|   phone,
|   otp
| }
*/

router.post(
  "/forgot-password/verify-otp",
  passwordResetLimiter,
  verifyResetOtpValidator,
  validate,
  verifyResetOtp
);

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
| POST /api/v1/auth/reset-password
|
| Body:
| {
|   email,
|   phone,
|   resetToken,
|   password
| }
*/

router.post(
  "/reset-password",
  passwordResetLimiter,
  resetPasswordValidator,
  validate,
  resetPassword
);

module.exports = router;