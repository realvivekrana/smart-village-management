const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  logout,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const { authLimiter, passwordResetLimiter } = require("../middleware/rateLimitMiddleware");
const {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.post("/reset-password", passwordResetLimiter, resetPasswordValidator, validate, resetPassword);

module.exports = router;