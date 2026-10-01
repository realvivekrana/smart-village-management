const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const authService = require("../services/authService");
const emailService = require("../services/emailService");
const { findUserByEmail } = require("../utils/emailLookup");

/*
|--------------------------------------------------------------------------
| Register User
|--------------------------------------------------------------------------
| POST /api/v1/auth/register
*/

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, address } = req.body;

    // Required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }

    // Check existing email
    const existingEmail = await findUserByEmail(email);

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Check existing phone
    const existingPhone = await User.findOne({
      phone,
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "An account with this phone number already exists",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Role Security
    |--------------------------------------------------------------------------
    | Public registration se koi user admin nahi bana sakta.
    | Sirf citizen role hi public registration se milta hai.
    */

    const userRole = "citizen";

    // Create user
    const user = await User.create({
      name,
      email: String(email).trim().toLowerCase(),
      phone,
      password,
      role: userRole,
      address,
    });

    // Generate JWT
    const token = generateToken(user._id);

    // Welcome email (non-blocking)
    emailService.sendWelcomeEmail(user).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Login User
|--------------------------------------------------------------------------
| POST /api/v1/auth/login
*/

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Password normally select:false hai
    const user = await findUserByEmail(email).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    // Compare password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();

    await user.save();

    // Generate JWT
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
| GET /api/v1/auth/me
*/

const getMe = async (req, res, next) => {
  try {
    // req.user is already the full user document set by protect middleware
    return res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
| JWT client-side token based hai.
| Frontend token remove karega.
*/

const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful. Please remove the token from the client.",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Send Forgot Password OTP
|--------------------------------------------------------------------------
| POST /api/v1/auth/forgot-password/send-otp
|
| Body:
| {
|   email,
|   phone
| }
|
| User ke registered mobile number par OTP bheja jayega.
*/

const sendResetOtp = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Email and phone number are required",
      });
    }

    const result = await authService.sendResetOtp({
      email,
      phone,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Verify Forgot Password OTP
|--------------------------------------------------------------------------
| POST /api/v1/auth/forgot-password/verify-otp
|
| Body:
| {
|   email,
|   phone,
|   otp
| }
|
| OTP verify hone ke baad reset token milega.
| Isi reset token ke bina password change nahi hoga.
*/

const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, phone, otp } = req.body;

    if (!email || !phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email, phone number and OTP are required",
      });
    }

    const result = await authService.verifyResetOtp({
      email,
      phone,
      otp,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Reset Password After OTP Verification
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
|
| IMPORTANT:
| OTP verify hone ke baad mila resetToken required hai.
| Direct email + phone + password se password reset nahi hoga.
*/

const resetPassword = async (req, res, next) => {
  try {
    const {
      email,
      phone,
      resetToken,
      password,
    } = req.body;

    if (!email || !phone || !resetToken || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email, phone number, reset token and new password are required",
      });
    }

    const result = await authService.resetPassword({
      email,
      phone,
      resetToken,
      password,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Export Controllers
|--------------------------------------------------------------------------
*/

module.exports = {
  register,
  login,
  getMe,
  logout,

  // Forgot Password OTP Flow
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
};