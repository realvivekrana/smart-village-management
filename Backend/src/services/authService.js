const crypto = require("crypto");

const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");
const { findUserByEmail } = require("../utils/emailLookup");

// ============================================================
// FORGOT PASSWORD OTP CONFIGURATION
// ============================================================

const OTP_EXPIRY_MINUTES = 5;
const RESET_TOKEN_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const MISMATCH_MESSAGE =
  "Email or phone number does not match the account.";

// ============================================================
// GENERATE 6 DIGIT OTP
// ============================================================

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// ============================================================
// HASH OTP
// ============================================================

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
};

// ============================================================
// GENERATE SECURE RESET TOKEN
// ============================================================

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// ============================================================
// MASK EMAIL
// ============================================================

const maskEmail = (email) => {
  const value = String(email || "").trim();

  const [name, domain] = value.split("@");

  if (!name || !domain) {
    return "****";
  }

  if (name.length <= 2) {
    return `${name[0] || "*"}***@${domain}`;
  }

  return `${name.slice(0, 2)}***@${domain}`;
};

// ============================================================
// SEND PASSWORD RESET OTP EMAIL
// ============================================================

const sendPasswordResetOtpEmail = async ({
  email,
  otp,
  expiresInMinutes,
}) => {
  const subject =
    "Your Smart Village Management Password Reset OTP";

  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      background: #f9fafb;
      padding: 20px;
    ">

      <div style="
        background: #16a34a;
        padding: 24px;
        text-align: center;
        border-radius: 10px 10px 0 0;
      ">
        <h1 style="
          color: #ffffff;
          margin: 0;
          font-size: 24px;
        ">
          Smart Village Management
        </h1>
      </div>

      <div style="
        background: #ffffff;
        padding: 32px;
        border-radius: 0 0 10px 10px;
      ">

        <h2 style="
          color: #111827;
          margin-top: 0;
        ">
          Password Reset Request
        </h2>

        <p style="
          color: #4b5563;
          line-height: 1.6;
        ">
          We received a request to reset your Smart Village Management
          account password.
        </p>

        <p style="
          color: #4b5563;
          line-height: 1.6;
        ">
          Your One-Time Password (OTP) is:
        </p>

        <div style="
          text-align: center;
          margin: 28px 0;
        ">
          <span style="
            display: inline-block;
            background: #f0fdf4;
            border: 2px solid #16a34a;
            color: #166534;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 14px 24px;
            border-radius: 10px;
          ">
            ${otp}
          </span>
        </div>

        <p style="
          color: #4b5563;
          line-height: 1.6;
        ">
          This OTP will expire in
          <strong>${expiresInMinutes} minutes</strong>.
        </p>

        <p style="
          color: #dc2626;
          line-height: 1.6;
          font-weight: 600;
        ">
          Never share this OTP with anyone.
        </p>

        <p style="
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        ">
          If you did not request a password reset, you can safely ignore
          this email. Your password will remain unchanged.
        </p>

      </div>

      <div style="
        text-align: center;
        padding: 16px;
      ">
        <p style="
          color: #9ca3af;
          font-size: 12px;
          margin: 0;
        ">
          &copy; ${new Date().getFullYear()}
          Smart Village Management. All rights reserved.
        </p>
      </div>

    </div>
  `;

  const text = `
Smart Village Management

Password Reset OTP

Your OTP is: ${otp}

This OTP will expire in ${expiresInMinutes} minutes.

Never share this OTP with anyone.

If you did not request a password reset, you can safely ignore this email.
`;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
};

// ============================================================
// SEND RESET OTP
// POST /api/v1/auth/forgot-password/send-otp
// ============================================================

const sendResetOtp = async ({ email, phone }) => {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  const normalizedPhone = String(phone || "").trim();

  if (!normalizedEmail || !normalizedPhone) {
    throw new ApiError(
      400,
      "Email and phone number are required."
    );
  }

  // ----------------------------------------------------------
  // Find User
  // ----------------------------------------------------------

  const user = await findUserByEmail(normalizedEmail);

  // ----------------------------------------------------------
  // Verify Email + Registered Phone
  // ----------------------------------------------------------

  if (
    !user ||
    !user.isActive ||
    String(user.phone).trim() !== normalizedPhone
  ) {
    throw new ApiError(
      400,
      MISMATCH_MESSAGE
    );
  }

  // ----------------------------------------------------------
  // Admin Security
  // ----------------------------------------------------------

  if (user.role === "admin") {
    throw new ApiError(
      403,
      "The admin account password cannot be reset from here. Please contact the developer."
    );
  }

  // ----------------------------------------------------------
  // Generate OTP
  // ----------------------------------------------------------

  const otp = generateOtp();
  const hashedOtp = hashOtp(otp);

  const otpExpires = new Date(
    Date.now() +
      OTP_EXPIRY_MINUTES * 60 * 1000
  );

  // ----------------------------------------------------------
  // Save OTP
  // ----------------------------------------------------------

  user.passwordResetOtp = hashedOtp;
  user.passwordResetOtpExpires = otpExpires;
  user.passwordResetOtpAttempts = 0;

  // Previous reset token invalidate
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // ----------------------------------------------------------
  // Send OTP Email
  // ----------------------------------------------------------

  try {
    const emailResult = await sendPasswordResetOtpEmail({
      email: normalizedEmail,
      otp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });

    /*
     * If SMTP is not configured, sendEmail()
     * returns { skipped: true }.
     *
     * In that case OTP should not remain valid.
     */

    if (emailResult?.skipped) {
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpires = undefined;
      user.passwordResetOtpAttempts = 0;

      await user.save();

      throw new ApiError(
        500,
        "OTP email service is not configured. Please contact the administrator."
      );
    }
  } catch (error) {
    // Do not overwrite our own ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Email failed, invalidate OTP
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpires = undefined;
    user.passwordResetOtpAttempts = 0;

    await user.save();

    throw new ApiError(
      500,
      "Unable to send OTP email. Please try again later."
    );
  }

  return {
    success: true,
    message:
      "OTP has been sent to your registered email address.",
    data: {
      email: maskEmail(normalizedEmail),
      expiresIn: OTP_EXPIRY_MINUTES * 60,
    },
  };
};

// ============================================================
// VERIFY RESET OTP
// POST /api/v1/auth/forgot-password/verify-otp
// ============================================================

const verifyResetOtp = async ({
  email,
  phone,
  otp,
}) => {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  const normalizedPhone = String(phone || "").trim();

  const normalizedOtp = String(otp || "").trim();

  if (
    !normalizedEmail ||
    !normalizedPhone ||
    !normalizedOtp
  ) {
    throw new ApiError(
      400,
      "Email, phone number and OTP are required."
    );
  }

  // ----------------------------------------------------------
  // OTP Format
  // ----------------------------------------------------------

  if (!/^\d{6}$/.test(normalizedOtp)) {
    throw new ApiError(
      400,
      "OTP must be a 6 digit number."
    );
  }

  // ----------------------------------------------------------
  // Find User
  //
  // IMPORTANT:
  // These fields have select:false in User model.
  // So they MUST be explicitly selected.
  // ----------------------------------------------------------

  const user = await findUserByEmail(
    normalizedEmail
  ).select(
    "+passwordResetOtp +passwordResetOtpExpires +passwordResetOtpAttempts"
  );

  // ----------------------------------------------------------
  // Verify Account
  // ----------------------------------------------------------

  if (
    !user ||
    !user.isActive ||
    String(user.phone).trim() !== normalizedPhone
  ) {
    throw new ApiError(
      400,
      MISMATCH_MESSAGE
    );
  }

  // ----------------------------------------------------------
  // Admin Security
  // ----------------------------------------------------------

  if (user.role === "admin") {
    throw new ApiError(
      403,
      "The admin account password cannot be reset from here. Please contact the developer."
    );
  }

  // ----------------------------------------------------------
  // OTP Exists
  // ----------------------------------------------------------

  if (
    !user.passwordResetOtp ||
    !user.passwordResetOtpExpires
  ) {
    throw new ApiError(
      400,
      "OTP is invalid or has expired. Please request a new OTP."
    );
  }

  // ----------------------------------------------------------
  // OTP Expiry
  // ----------------------------------------------------------

  if (
    new Date() >
    new Date(user.passwordResetOtpExpires)
  ) {
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpires = undefined;
    user.passwordResetOtpAttempts = 0;

    await user.save();

    throw new ApiError(
      400,
      "OTP has expired. Please request a new OTP."
    );
  }

  // ----------------------------------------------------------
  // OTP Attempts
  // ----------------------------------------------------------

  const attempts = Number(
    user.passwordResetOtpAttempts || 0
  );

  if (attempts >= MAX_OTP_ATTEMPTS) {
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpires = undefined;
    user.passwordResetOtpAttempts = 0;

    await user.save();

    throw new ApiError(
      429,
      "Too many incorrect OTP attempts. Please request a new OTP."
    );
  }

  // ----------------------------------------------------------
  // Compare OTP
  // ----------------------------------------------------------

  const hashedInputOtp = hashOtp(normalizedOtp);

  if (
    hashedInputOtp !== user.passwordResetOtp
  ) {
    user.passwordResetOtpAttempts =
      attempts + 1;

    await user.save();

    const remainingAttempts =
      MAX_OTP_ATTEMPTS -
      (attempts + 1);

    throw new ApiError(
      400,
      `Invalid OTP. ${remainingAttempts} attempt${
        remainingAttempts === 1 ? "" : "s"
      } remaining.`
    );
  }

  // ----------------------------------------------------------
  // OTP Correct
  // ----------------------------------------------------------

  const resetToken = generateResetToken();

  const resetTokenExpires = new Date(
    Date.now() +
      RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
  );

  user.passwordResetToken = resetToken;
  user.passwordResetExpires =
    resetTokenExpires;

  // OTP can no longer be reused
  user.passwordResetOtp = undefined;
  user.passwordResetOtpExpires = undefined;
  user.passwordResetOtpAttempts = 0;

  await user.save();

  return {
    success: true,
    message:
      "OTP verified successfully. You can now create a new password.",
    data: {
      resetToken,
      expiresIn:
        RESET_TOKEN_EXPIRY_MINUTES * 60,
    },
  };
};

// ============================================================
// RESET PASSWORD
// POST /api/v1/auth/reset-password
// ============================================================

const resetPassword = async ({
  email,
  phone,
  resetToken,
  password,
}) => {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  const normalizedPhone = String(phone || "").trim();

  const normalizedResetToken = String(
    resetToken || ""
  ).trim();

  if (
    !normalizedEmail ||
    !normalizedPhone ||
    !normalizedResetToken ||
    !password
  ) {
    throw new ApiError(
      400,
      "Email, phone number, reset token and new password are required."
    );
  }

  // ----------------------------------------------------------
  // Password Validation
  // ----------------------------------------------------------

  if (String(password).length < 8) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters long."
    );
  }

  if (!/[A-Z]/.test(String(password))) {
    throw new ApiError(
      400,
      "Password must contain at least 1 uppercase letter."
    );
  }

  if (!/[0-9]/.test(String(password))) {
    throw new ApiError(
      400,
      "Password must contain at least 1 number."
    );
  }

  // ----------------------------------------------------------
  // Find User
  //
  // IMPORTANT:
  // passwordResetToken and passwordResetExpires are
  // select:false, so explicitly select them.
  // ----------------------------------------------------------

  const user = await findUserByEmail(
    normalizedEmail
  ).select(
    "+password +passwordResetToken +passwordResetExpires"
  );

  // ----------------------------------------------------------
  // Verify Account
  // ----------------------------------------------------------

  if (
    !user ||
    !user.isActive ||
    String(user.phone).trim() !== normalizedPhone
  ) {
    throw new ApiError(
      400,
      MISMATCH_MESSAGE
    );
  }

  // ----------------------------------------------------------
  // Admin Security
  // ----------------------------------------------------------

  if (user.role === "admin") {
    throw new ApiError(
      403,
      "The admin account password cannot be reset from here. Please contact the developer."
    );
  }

  // ----------------------------------------------------------
  // Reset Token Exists
  // ----------------------------------------------------------

  if (
    !user.passwordResetToken ||
    !user.passwordResetExpires
  ) {
    throw new ApiError(
      400,
      "Password reset session is invalid. Please verify OTP again."
    );
  }

  // ----------------------------------------------------------
  // Reset Token Match
  // ----------------------------------------------------------

  if (
    user.passwordResetToken !==
    normalizedResetToken
  ) {
    throw new ApiError(
      400,
      "Invalid password reset session. Please verify OTP again."
    );
  }

  // ----------------------------------------------------------
  // Reset Token Expiry
  // ----------------------------------------------------------

  if (
    new Date() >
    new Date(user.passwordResetExpires)
  ) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    throw new ApiError(
      400,
      "Password reset session has expired. Please verify OTP again."
    );
  }

  // ----------------------------------------------------------
  // Save New Password
  //
  // User model pre-save hook will bcrypt hash it.
  // ----------------------------------------------------------

  user.password = password;

  // ----------------------------------------------------------
  // Invalidate Reset Session
  // ----------------------------------------------------------

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  user.passwordResetOtp = undefined;
  user.passwordResetOtpExpires = undefined;
  user.passwordResetOtpAttempts = 0;

  await user.save();

  // ----------------------------------------------------------
  // SUCCESS
  // ----------------------------------------------------------

  return {
    success: true,
    message:
      "Password reset successfully. Please login with your new password.",
  };
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
};