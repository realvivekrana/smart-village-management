const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const { findUserByEmail } = require("../utils/emailLookup");

/*
|--------------------------------------------------------------------------
| Password Reset Flow
|--------------------------------------------------------------------------
| 1. generateResetToken  — creates a hashed token, stores expiry in DB
| 2. sendPasswordResetEmail — mails the plain token to the user
| 3. resetPassword       — finds by hashed token, resets password
|
| We store the HASHED version in DB so even if DB leaks, tokens are useless.
*/

const generateResetToken = () => {
  const plainToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(plainToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { plainToken, hashedToken, expiresAt };
};

const buildResetUrl = (plainToken) =>
  `${env.frontendUrl}/reset-password?token=${plainToken}`;

const sendPasswordResetEmail = async (user, plainToken) => {
  const resetUrl = buildResetUrl(plainToken);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #16a34a; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">Smart Village Management</h1>
      </div>
      <div style="padding: 32px; background: #f9fafb;">
        <h2 style="color: #111827;">Password Reset Request</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          You requested a password reset for your account.
          Click the button below to reset your password.
          This link expires in <strong>1 hour</strong>.
        </p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${resetUrl}"
             style="background: #16a34a; color: #fff; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset My Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          If you did not request a password reset, please ignore this email.
          Your password will remain unchanged.
        </p>
        <p style="color: #9ca3af; font-size: 12px; word-break: break-all;">
          Or copy this link: ${resetUrl}
        </p>
      </div>
      <div style="padding: 16px; text-align: center; background: #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Smart Village Management.
        </p>
      </div>
    </div>
  `;

  const info = await sendEmail({
    to: user.email,
    subject: "Password Reset Request — Smart Village Management",
    html,
  });

  // Terminal me saaf dikhe ki mail kis address par gayi aur Gmail ne kya kaha
  if (info && !info.skipped) {
    logger.info(
      `Password reset mail -> ${user.email} | accepted: ${JSON.stringify(info.accepted)} | rejected: ${JSON.stringify(info.rejected)}`
    );
  }
};

/*
|--------------------------------------------------------------------------
| Request Password Reset
|--------------------------------------------------------------------------
| Returns { success, message } — always same message to prevent email enumeration.
*/

const GENERIC_MESSAGE = "If an account exists with this email, a reset link has been sent.";

const requestPasswordReset = async (email, requestOrigin) => {
  // Production me SMTP nahi hai to chup-chaap "sent" dikhana galat hai — saaf error do.
  if (!env.email.enabled && env.isProduction) {
    logger.error("Forgot password: SMTP_HOST / SMTP_USER / SMTP_PASS set nahi hain, email nahi ja sakti.");
    throw new ApiError(503, "Email service abhi available nahi hai. Kripya admin se sampark karein.");
  }

  const user = await findUserByEmail(email).select("+passwordResetToken +passwordResetExpires");

  // Email enumeration rokne ke liye hamesha same message
  if (!user || !user.isActive) {
    return { success: true, message: GENERIC_MESSAGE };
  }

  const { plainToken, hashedToken, expiresAt } = generateResetToken();

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expiresAt;
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, plainToken);
  } catch (error) {
    logger.error("Password reset email failed:", error.message);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(502, "Reset email bhejne me dikkat aayi. Thodi der baad dobara koshish karein.");
  }

  const result = { success: true, message: GENERIC_MESSAGE };

  // Sirf local development me (SMTP bina) link seedha dikha do, taaki test ho sake
  if (!env.email.enabled && !env.isProduction) {
    // Spoofable header hai, isliye sirf development me use hota hai
    const base = requestOrigin ? String(requestOrigin).replace(/\/+$/, "") : env.frontendUrl;
    result.devResetUrl = `${base}/reset-password?token=${plainToken}`;
  }

  return result;
};

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

const resetPassword = async (plainToken, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(String(plainToken).trim()).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    return { success: false, message: "Invalid or expired reset token." };
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { success: true, message: "Password has been reset successfully." };
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};