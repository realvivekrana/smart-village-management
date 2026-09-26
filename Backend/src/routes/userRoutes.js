const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
  uploadAvatar,
  getAllUsers,
  getUserById,
  toggleUserActive,
  updateUserRole,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

const {
  uploadSingleImage,
} = require("../middleware/uploadMiddleware");

const validate = require("../middleware/validationMiddleware");

const {
  updateProfileValidator,
  changePasswordValidator,
} = require("../validators/userValidator");

const router = express.Router();

// ============================================================
// MY PROFILE
// ============================================================

router.get(
  "/profile",
  protect,
  getMyProfile
);

router.put(
  "/profile",
  protect,
  updateProfileValidator,
  validate,
  updateMyProfile
);

router.put(
  "/change-password",
  protect,
  changePasswordValidator,
  validate,
  changePassword
);

router.post(
  "/avatar",
  protect,
  uploadSingleImage("avatar"),
  uploadAvatar
);

// ============================================================
// ADMIN USER MANAGEMENT
// ============================================================

// Get all users
// GET /api/v1/users
router.get(
  "/",
  protect,
  adminOnly,
  getAllUsers
);

// Get single user
// GET /api/v1/users/:id
router.get(
  "/:id",
  protect,
  adminOnly,
  getUserById
);

// Activate / deactivate user
// PATCH /api/v1/users/:id/toggle-active
router.patch(
  "/:id/toggle-active",
  protect,
  adminOnly,
  toggleUserActive
);

// Update user role
// PATCH /api/v1/users/:id/role
router.patch(
  "/:id/role",
  protect,
  adminOnly,
  updateUserRole
);

module.exports = router;