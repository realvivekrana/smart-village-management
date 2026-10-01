const { body } = require("express-validator");

/*
|--------------------------------------------------------------------------
| Register Validator
|--------------------------------------------------------------------------
*/

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2–50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    }),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage(
      "Please enter a valid 10-digit Indian phone number"
    ),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage(
      "Password must be at least 8 characters"
    )
    .matches(/[A-Z]/)
    .withMessage(
      "Password must contain at least one uppercase letter"
    )
    .matches(/[0-9]/)
    .withMessage(
      "Password must contain at least one number"
    ),

  body("role")
    .optional()
    .isIn(["citizen", "admin"])
    .withMessage(
      "Role must be citizen or admin"
    ),
];

/*
|--------------------------------------------------------------------------
| Login Validator
|--------------------------------------------------------------------------
*/

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
      "Please enter a valid email address"
    )
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

/*
|--------------------------------------------------------------------------
| Send Reset OTP Validator
|--------------------------------------------------------------------------
| POST /forgot-password/send-otp
|
| Body:
| {
|   email,
|   phone
| }
|--------------------------------------------------------------------------
*/

const sendResetOtpValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
      "Please enter a valid email address"
    )
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    }),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage(
      "Phone number is required"
    )
    .matches(/^[6-9]\d{9}$/)
    .withMessage(
      "Please enter a valid 10-digit Indian phone number"
    ),
];

/*
|--------------------------------------------------------------------------
| Verify Reset OTP Validator
|--------------------------------------------------------------------------
| POST /forgot-password/verify-otp
|
| Body:
| {
|   email,
|   phone,
|   otp
| }
|--------------------------------------------------------------------------
*/

const verifyResetOtpValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
      "Please enter a valid email address"
    )
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    }),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage(
      "Phone number is required"
    )
    .matches(/^[6-9]\d{9}$/)
    .withMessage(
      "Please enter a valid 10-digit Indian phone number"
    ),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .matches(/^\d{6}$/)
    .withMessage(
      "OTP must be a valid 6-digit number"
    ),
];

/*
|--------------------------------------------------------------------------
| Reset Password Validator
|--------------------------------------------------------------------------
| POST /reset-password
|
| Body:
| {
|   email,
|   phone,
|   resetToken,
|   password
| }
|--------------------------------------------------------------------------
*/

const resetPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
      "Please enter a valid email address"
    )
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    }),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage(
      "Phone number is required"
    )
    .matches(/^[6-9]\d{9}$/)
    .withMessage(
      "Please enter a valid 10-digit Indian phone number"
    ),

  body("resetToken")
    .trim()
    .notEmpty()
    .withMessage(
      "Password reset token is required"
    )
    .isLength({ min: 32 })
    .withMessage(
      "Invalid password reset token"
    ),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage(
      "Password must be at least 8 characters"
    )
    .matches(/[A-Z]/)
    .withMessage(
      "Password must contain at least one uppercase letter"
    )
    .matches(/[0-9]/)
    .withMessage(
      "Password must contain at least one number"
    ),
];

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  registerValidator,
  loginValidator,
  sendResetOtpValidator,
  verifyResetOtpValidator,
  resetPasswordValidator,
};