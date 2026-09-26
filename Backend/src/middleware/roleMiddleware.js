/*
|--------------------------------------------------------------------------
| authorize
|--------------------------------------------------------------------------
| Usage:
|
| router.post("/", protect, authorize("admin"), createNotice);
| router.post("/", protect, authorize("business_owner"), addBusiness);
|
| Rule:
| super_admin ko har protected route ki access hai.
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

    if (
      role === "super_admin" ||
      allowedRoles.includes(role)
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message:
        "You do not have permission to perform this action",
    });
  };

// Shortcut: admin + super_admin
const adminOnly = authorize("admin");

module.exports = {
  authorize,
  adminOnly,
};