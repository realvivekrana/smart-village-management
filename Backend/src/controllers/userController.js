const User = require("../models/User");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const cloudinaryService = require("../services/cloudinaryService");
const env = require("../config/env");

/*
|--------------------------------------------------------------------------
| GET /api/v1/users/profile  (protected)
|--------------------------------------------------------------------------
*/
const getMyProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/users/profile  (protected)
|--------------------------------------------------------------------------
*/
const updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "phone", "address"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/users/change-password  (protected)
|--------------------------------------------------------------------------
*/
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select(
      "+password"
    );

    const isMatch = await user.comparePassword(
      currentPassword
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/users/avatar  (protected)
|--------------------------------------------------------------------------
*/
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    if (!env.cloudinary.enabled) {
      return res.status(503).json({
        success: false,
        message: "Image upload is not configured",
      });
    }

    const currentUser = await User.findById(req.user._id);

    if (currentUser.avatarPublicId) {
      await cloudinaryService.deleteImage(
        currentUser.avatarPublicId
      );
    }

    const result = await cloudinaryService.uploadImage(
      req.file.buffer,
      "smart-village/avatars"
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: result.url,
        avatarPublicId: result.publicId,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/users
|--------------------------------------------------------------------------
*/
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } =
      getPagination(req.query);

    const { role, isActive, search } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { users },
      pagination: getPaginationMeta(
        total,
        page,
        limit
      ),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/users/:id
|--------------------------------------------------------------------------
*/
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/v1/users/:id/toggle-active
|--------------------------------------------------------------------------
*/
const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot deactivate super admin",
      });
    }

    user.isActive = !user.isActive;

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${
        user.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/v1/users/:id/role
|--------------------------------------------------------------------------
*/
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    const validRoles = [
      "citizen",
      "business_owner",
      "admin",
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Must be citizen, business_owner, or admin",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot change super admin role",
      });
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword,
  uploadAvatar,
  getAllUsers,
  getUserById,
  toggleUserActive,
  updateUserRole,
};