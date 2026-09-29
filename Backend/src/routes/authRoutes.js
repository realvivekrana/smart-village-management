const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const { authLimiter, emailLimiter } = require("../middleware/rateLimitMiddleware");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.post("/forgot-password", emailLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password", authLimiter, resetPasswordValidator, validate, resetPassword);

module.exports = router;