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
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password", resetPasswordValidator, validate, resetPassword);

module.exports = router;
