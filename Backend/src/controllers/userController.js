const escapeRegex = require("../utils/escapeRegex");
const User = require("../models/User");
const {
  getPagination,
  getPaginationMeta,
} = require("../utils/pagination");
const cloudinaryService = require("../services/cloudinaryService");
const env = require("../config/env");

/*
|--------------------------------------------------------------------------
| GET /api/v1/users/profile
|--------------------------------------------------------------------------
*/
const getMyProfile = async (req, res, next) => {
  try {
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
| PUT /api/v1/users/profile
|--------------------------------------------------------------------------
*/
const updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "address",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/users/change-password
|--------------------------------------------------------------------------
*/
const changePassword = async (req, res, next) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(
      req.user._id
    ).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch =
      await user.comparePassword(
        currentPassword
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    user.password = newPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/users/avatar
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

    const currentUser = await User.findById(req.user._id).select(
      "+avatarPublicId"
    );

    // Pehle nayi photo upload (square, chehre par focus). Fail ho to purani safe rehti hai.
    const result = await cloudinaryService.uploadImage(
      req.file.buffer,
      "smart-village/avatars",
      {
        transformation: [
          {
            width: 600,
            height: 600,
            crop: "fill",
            gravity: "face",
          },
          { quality: "auto", fetch_format: "auto" },
        ],
      }
    );

    const oldPublicId = currentUser?.avatarPublicId;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: result.url,
        avatarPublicId: result.publicId,
      },
      { new: true }
    );

    // Nayi photo save hone ke baad purani Cloudinary se hatao
    if (oldPublicId) {
      await cloudinaryService.deleteImage(oldPublicId);
    }

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
| DELETE /api/v1/users/avatar
|--------------------------------------------------------------------------
*/
const removeAvatar = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id).select(
      "+avatarPublicId"
    );

    const oldPublicId = currentUser?.avatarPublicId;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: "", avatarPublicId: "" },
      { new: true }
    );

    if (oldPublicId) {
      await cloudinaryService.deleteImage(oldPublicId);
    }

    return res.status(200).json({
      success: true,
      message: "Avatar removed successfully",
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
const getAllUsers = async (
  req,
  res,
  next
) => {
  try {
    const {
      page,
      limit,
      skip,
    } = getPagination(req.query);

    const {
      role,
      isActive,
      search,
    } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive =
        isActive === "true";
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
        {
          email: {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
        {
          phone: {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
      ];
    }

    const [
      users,
      total,
    ] = await Promise.all([
      User.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users,
      },
      pagination:
        getPaginationMeta(
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
const getUserById = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
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
const toggleUserActive = async (
  req,
  res,
  next
) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own status or role",
      });
    }

    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive =
      !user.isActive;

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${
        user.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      data: {
        user,
      },
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
const updateUserRole = async (
  req,
  res,
  next
) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own status or role",
      });
    }

    const { role } = req.body;

    const validRoles = [
      "citizen",
      "admin",
    ];

    if (
      !validRoles.includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Must be citizen or admin",
      });
    }

    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "User role updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/users/:id
|--------------------------------------------------------------------------
*/
const deleteUser = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      req.user._id.toString() ===
      user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own account",
      });
    }

    const withAvatar = await User.findById(req.params.id).select(
      "+avatarPublicId"
    );

    await User.findByIdAndDelete(
      req.params.id
    );

    // User ki photo Cloudinary pe bhi na bachi rahe
    if (withAvatar?.avatarPublicId) {
      await cloudinaryService.deleteImage(withAvatar.avatarPublicId);
    }

    return res.status(200).json({
      success: true,
      message:
        "User deleted successfully",
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
  removeAvatar,
  getAllUsers,
  getUserById,
  toggleUserActive,
  updateUserRole,
  deleteUser,
};