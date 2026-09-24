const User = require("../models/User");

/*
|--------------------------------------------------------------------------
| Get My Profile
|--------------------------------------------------------------------------
| GET /api/v1/users/profile
| Protected Route
|--------------------------------------------------------------------------
*/

const getMyProfile = async (req, res, next) => {
  try {
    // JWT middleware se userId mil raha hai
    const userId = req.user.userId;

    // Database se current user fetch karo
    const user = await User.findById(userId);

    // User nahi mila
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Profile response
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
};