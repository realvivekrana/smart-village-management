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
  deleteUser,
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

/*
|--------------------------------------------------------------------------
| MY PROFILE
|--------------------------------------------------------------------------
*/

// GET /api/v1/users/profile
router.get(
  "/profile",
  protect,
  getMyProfile
);

// PUT /api/v1/users/profile
router.put(
  "/profile",
  protect,
  updateProfileValidator,
  validate,
  updateMyProfile
);

// PUT /api/v1/users/change-password
router.put(
  "/change-password",
  protect,
  changePasswordValidator,
  validate,
  changePassword
);

// POST /api/v1/users/avatar
router.post(
  "/avatar",
  protect,
  uploadSingleImage("avatar"),
  uploadAvatar
);

/*
|--------------------------------------------------------------------------
| ADMIN USER MANAGEMENT
|--------------------------------------------------------------------------
*/

// GET /api/v1/users
router.get(
  "/",
  protect,
  adminOnly,
  getAllUsers
);

// GET /api/v1/users/:id
router.get(
  "/:id",
  protect,
  adminOnly,
  getUserById
);

// PATCH /api/v1/users/:id/toggle-active
router.patch(
  "/:id/toggle-active",
  protect,
  adminOnly,
  toggleUserActive
);

// PATCH /api/v1/users/:id/role
router.patch(
  "/:id/role",
  protect,
  adminOnly,
  updateUserRole
);

// DELETE /api/v1/users/:id
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteUser
);

module.exports = router;