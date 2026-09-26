/*
|--------------------------------------------------------------------------
| Role Authorization Middleware
|--------------------------------------------------------------------------
| Available roles:
| - citizen
| - admin
|--------------------------------------------------------------------------
*/

const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    // User authentication check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    const { role } = req.user;

    // Check whether user's role is allowed
    if (allowedRoles.includes(role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action",
    });
  };

// Admin-only middleware
const adminOnly = authorize("admin");

module.exports = {
  authorize,
  adminOnly,
};