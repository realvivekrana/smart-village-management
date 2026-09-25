const express = require("express");
const router = express.Router();

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
const { authorize } = require("../middleware/roleMiddleware");
const { uploadSingleImage } = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validationMiddleware");
const { updateProfileValidator, changePasswordValidator } = require("../validators/userValidator");

// Own profile
router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateProfileValidator, validate, updateMyProfile);
router.put("/change-password", protect, changePasswordValidator, validate, changePassword);
router.post("/avatar", protect, uploadSingleImage("avatar"), uploadAvatar);

// Admin: user management
router.get("/", protect, authorize("admin"), getAllUsers);
router.get("/:id", protect, authorize("admin"), getUserById);
router.patch("/:id/toggle-active", protect, authorize("admin"), toggleUserActive);
router.patch("/:id/role", protect, authorize("super_admin"), updateUserRole);

module.exports = router;
