const jwt = require("jsonwebtoken");

const User = require("../models/User");

/*
|--------------------------------------------------------------------------
| Token Extract
|--------------------------------------------------------------------------
| Expected: Authorization: Bearer <token>
*/

const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| protect
|--------------------------------------------------------------------------
| Token verify karega, phir DB se user load karega, taaki:
|  - deleted user ka purana token kaam na kare
|  - deactivate kiya hua user turant block ho jaye
|  - role hamesha latest DB wala mile
|
| Ke baad: req.user = poora User document (req.user._id, req.user.role)
*/

const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists. Please login again.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| optionalAuth
|--------------------------------------------------------------------------
| Public routes ke liye: token ho aur valid ho to req.user set hoga,
| warna bina error ke aage badh jayega.
| (e.g. public business page pe logged-in user ka review dikhana)
*/

const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token || !process.env.JWT_SECRET) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Invalid / expired token public route ko block nahi karega
    next();
  }
};

module.exports = {
  protect,
  optionalAuth,
};