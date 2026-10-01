const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { findUserByEmail } = require("../utils/emailLookup");

/*
|--------------------------------------------------------------------------
| Direct Password Reset (bina email link ke)
|--------------------------------------------------------------------------
| User apna registered email + registered phone number deta hai.
| Dono account se match hon to naya password seedha save ho jata hai.
|
| Sirf email se reset allow nahi karte, warna email jaanne wala koi bhi
| dusre ka password badal sakta hai.
*/

const MISMATCH_MESSAGE = "Email or phone number does not match the account.";

const resetPasswordDirect = async ({ email, phone, password }) => {
  const user = await findUserByEmail(email).select("+password");

  if (!user || !user.isActive || user.phone !== String(phone).trim()) {
    throw new ApiError(400, MISMATCH_MESSAGE);
  }

  // Admin account is route se reset nahi hoga (seed:admin ya DB se karein)
  if (user.role === "admin") {
    throw new ApiError(403, "The admin account password cannot be reset from here. Please contact the developer.");
  }

  user.password = password; // pre-save hook bcrypt se hash karega
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { success: true, message: "Password has been reset. Please log in with your new password." };
};

module.exports = { resetPasswordDirect };