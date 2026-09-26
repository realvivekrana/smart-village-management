/*
|--------------------------------------------------------------------------
| authorize
|--------------------------------------------------------------------------
| Usage:
|
| router.post("/", protect, authorize("admin"), createNotice);
| router.post("/", protect, authorize("citizen", "admin"), addBusiness);
|
| Sirf do roles hain: "citizen" aur "admin".
|--------------------------------------------------------------------------
*/

const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required. Please login.",
      });
    }

    const { role } = req.user;

    if (allowedRoles.includes(role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message:
        "You do not have permission to perform this action",
    });
  };

// Shortcut: admin only
const adminOnly = authorize("admin");

module.exports = {
  authorize,
  adminOnly,
};