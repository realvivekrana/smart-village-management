import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
} from "../../services/authService";

import { useLanguage } from "../../context/LanguageContext";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT
  |--------------------------------------------------------------------------
  | React state update async hota hai.
  |
  | Agar user button ko rapidly 2 baar click kare to:
  |
  | click 1 -> API request
  | click 2 -> API request
  |
  | dono request ja sakti hain before loading=true render ho.
  |
  | Isliye ref based lock use kar rahe hain.
  |--------------------------------------------------------------------------
  */
  const actionLockRef = useRef(false);

  const [form, setForm] = useState({
    email: "",
    phone: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [resetToken, setResetToken] = useState("");

  const set = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | STEP 1 - SEND OTP
  |--------------------------------------------------------------------------
  */
  const handleSendOtp = async (e) => {
    e.preventDefault();

    /*
    | Prevent duplicate request
    */
    if (actionLockRef.current) {
      return;
    }

    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error(
        t(
          "ui.enterAValid10Digitf43",
          "Enter a valid 10-digit phone number"
        )
      );
      return;
    }

    actionLockRef.current = true;
    setLoading(true);

    try {
      const response = await sendResetOtp({
        email,
        phone,
      });

      /*
      |--------------------------------------------------------------------------
      | Support both possible response shapes
      |--------------------------------------------------------------------------
      | 1. service returns backend data directly
      | 2. service returns axios response.data
      |--------------------------------------------------------------------------
      */
      const responseData = response?.data || response;

      const message =
        responseData?.message ||
        "OTP has been sent to your registered email address.";

      toast.success(message);

      setForm((prev) => ({
        ...prev,
        email,
        phone,
        otp: "",
      }));

      setStep(2);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (err?.code === "ECONNABORTED"
          ? t(
              "ui.noResponseFromTheServerb33",
              "No response from the server. Please try again in a while."
            )
          : "Unable to send OTP. Please try again.");

      toast.error(message);
    } finally {
      setLoading(false);

      /*
      | Unlock only after request completely finishes
      */
      actionLockRef.current = false;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STEP 2 - VERIFY OTP
  |--------------------------------------------------------------------------
  */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    /*
    |--------------------------------------------------------------------------
    | HARD DUPLICATE REQUEST PROTECTION
    |--------------------------------------------------------------------------
    */
    if (actionLockRef.current) {
      return;
    }

    const otp = form.otp.trim();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!email) {
      toast.error("Email address is missing. Please start again.");
      setStep(1);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Registered phone number is invalid.");
      setStep(1);
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | LOCK BEFORE API CALL
    |--------------------------------------------------------------------------
    */
    actionLockRef.current = true;
    setLoading(true);

    try {
      const response = await verifyResetOtp({
        email,
        phone,
        otp,
      });

      /*
      |--------------------------------------------------------------------------
      | Backend response:
      |
      | {
      |   success: true,
      |   message: "...",
      |   data: {
      |     resetToken: "...",
      |     expiresIn: 600
      |   }
      | }
      |
      | Depending on authService, response may be:
      |
      | response
      | response.data
      | response.data.data
      |
      | So handle all supported shapes safely.
      |--------------------------------------------------------------------------
      */

      const backendData = response?.data || response;

      const token =
        backendData?.data?.resetToken ||
        backendData?.resetToken ||
        response?.resetToken ||
        "";

      const message =
        backendData?.message ||
        response?.message ||
        "OTP verified successfully.";

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      | Do NOT move to Step 3 unless reset token actually exists.
      |--------------------------------------------------------------------------
      */
      if (!token) {
        toast.error(
          "OTP was verified but reset session was not received. Please request a new OTP."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Store reset token
      |--------------------------------------------------------------------------
      */
      setResetToken(token);

      /*
      |--------------------------------------------------------------------------
      | Clear OTP after successful verification
      |--------------------------------------------------------------------------
      */
      setForm((prev) => ({
        ...prev,
        otp: "",
      }));

      toast.success(message);

      /*
      |--------------------------------------------------------------------------
      | Move to password screen
      |--------------------------------------------------------------------------
      */
      setStep(3);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid or expired OTP. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);

      /*
      |--------------------------------------------------------------------------
      | Unlock AFTER API request finishes
      |--------------------------------------------------------------------------
      */
      actionLockRef.current = false;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STEP 3 - RESET PASSWORD
  |--------------------------------------------------------------------------
  */
  const handleResetPassword = async (e) => {
    e.preventDefault();

    /*
    | Prevent duplicate password reset request
    */
    if (actionLockRef.current) {
      return;
    }

    const password = form.password;
    const confirmPassword = form.confirmPassword;

    /*
    |--------------------------------------------------------------------------
    | Password validation
    |--------------------------------------------------------------------------
    */
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least 1 capital letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least 1 number.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!resetToken) {
      toast.error(
        "Reset session expired. Please request a new OTP."
      );

      setForm((prev) => ({
        ...prev,
        otp: "",
        password: "",
        confirmPassword: "",
      }));

      setStep(1);
      return;
    }

    actionLockRef.current = true;
    setLoading(true);

    try {
      const response = await resetPassword({
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        resetToken,
        password,
      });

      const responseData = response?.data || response;

      const message =
        responseData?.message ||
        response?.message ||
        "Password reset successfully! Please log in now.";

      /*
      |--------------------------------------------------------------------------
      | SUCCESS ALERT
      |--------------------------------------------------------------------------
      */
      toast.success(message, {
        duration: 3000,
      });

      /*
      |--------------------------------------------------------------------------
      | Clear sensitive information
      |--------------------------------------------------------------------------
      */
      setForm({
        email: "",
        phone: "",
        otp: "",
        password: "",
        confirmPassword: "",
      });

      setResetToken("");

      /*
      |--------------------------------------------------------------------------
      | Move to Login
      |--------------------------------------------------------------------------
      */
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (err?.code === "ECONNABORTED"
          ? t(
              "ui.noResponseFromTheServerb33",
              "No response from the server. Please try again in a while."
            )
          : "Unable to reset password. Please try again.");

      toast.error(message);
    } finally {
      setLoading(false);
      actionLockRef.current = false;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESEND OTP
  |--------------------------------------------------------------------------
  */
  const handleResendOtp = async () => {
    /*
    | Prevent duplicate resend
    */
    if (actionLockRef.current) {
      return;
    }

    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!email || !/^[6-9]\d{9}$/.test(phone)) {
      toast.error(
        "Please enter a valid email and phone number."
      );

      setStep(1);
      return;
    }

    actionLockRef.current = true;
    setLoading(true);

    try {
      const response = await sendResetOtp({
        email,
        phone,
      });

      const responseData = response?.data || response;

      const message =
        responseData?.message ||
        response?.message ||
        "A new OTP has been sent to your registered email.";

      toast.success(message);

      /*
      | Clear old OTP
      */
      setForm((prev) => ({
        ...prev,
        otp: "",
      }));
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to resend OTP. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
      actionLockRef.current = false;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | BACK TO PREVIOUS STEP
  |--------------------------------------------------------------------------
  */
  const handleBack = () => {
    /*
    | Don't allow navigation while request is running
    */
    if (actionLockRef.current) {
      return;
    }

    if (step === 2) {
      setForm((prev) => ({
        ...prev,
        otp: "",
      }));

      setStep(1);
      return;
    }

    if (step === 3) {
      /*
      | Going back to OTP means old reset token is no longer used
      | by the frontend.
      */
      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      setResetToken("");
      setStep(2);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl">
            🏘️
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Forgot Password
          </h1>

          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {step === 1 &&
              "Enter your registered email and phone number"}

            {step === 2 &&
              "Enter the OTP sent to your registered email"}

            {step === 3 &&
              "Create a new password for your account"}
          </p>
        </div>

        {/* CARD */}
        <div className="card p-8 shadow-lg">

          {/* PROGRESS */}
          <div className="flex items-center justify-between mb-7">

            {/* STEP 1 */}
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold ${
                step >= 1
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>

            {/* LINE */}
            <div
              className={`flex-1 h-1 mx-2 ${
                step >= 2
                  ? "bg-primary-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />

            {/* STEP 2 */}
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold ${
                step >= 2
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>

            {/* LINE */}
            <div
              className={`flex-1 h-1 mx-2 ${
                step >= 3
                  ? "bg-primary-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />

            {/* STEP 3 */}
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold ${
                step >= 3
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
          </div>

          {/* ========================================================= */}
          {/* STEP 1 */}
          {/* ========================================================= */}

          {step === 1 && (
            <form
              onSubmit={handleSendOtp}
              className="space-y-4"
            >
              <div className="form-group">
                <label className="label">
                  Email Address
                </label>

                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  required
                  autoFocus
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="label">
                  Registered Phone Number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className="input"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setForm((prev) => ({
                      ...prev,
                      phone: value,
                    }));
                  }}
                  required
                  autoComplete="tel"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <p className="text-center text-sm text-gray-500">
                <Link
                  to="/login"
                  className="text-primary-600 hover:underline"
                >
                  ← Back to Login
                </Link>
              </p>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 2 */}
          {/* ========================================================= */}

          {step === 2 && (
            <form
              onSubmit={handleVerifyOtp}
              className="space-y-4"
            >
              <div className="rounded-lg bg-primary-50 dark:bg-gray-800 p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  OTP sent to
                </p>

                <p className="font-semibold text-gray-900 dark:text-white mt-1 break-all">
                  {form.email}
                </p>
              </div>

              <div className="form-group">
                <label className="label">
                  Enter 6-Digit OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="input text-center text-xl tracking-[0.4em]"
                  placeholder="000000"
                  value={form.otp}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setForm((prev) => ({
                      ...prev,
                      otp: value,
                    }));
                  }}
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="flex items-center justify-between text-sm">

                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="text-gray-500 hover:text-primary-600 disabled:opacity-50"
                >
                  ← Change Details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-primary-600 hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>

              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 3 */}
          {/* ========================================================= */}

          {step === 3 && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✓ Email verified successfully. You can now create a
                  new password.
                </p>
              </div>

              <div className="form-group">
                <label className="label">
                  New Password
                </label>

                <input
                  type="password"
                  className="input"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={form.password}
                  onChange={set("password")}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="label">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  className="input"
                  placeholder="Re-enter new password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>• Minimum 8 characters</p>
                <p>• At least 1 uppercase letter</p>
                <p>• At least 1 number</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5"
              >
                {loading
                  ? "Saving..."
                  : "Save New Password"}
              </button>

              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="w-full text-sm text-gray-500 hover:text-primary-600 disabled:opacity-50"
              >
                ← Back to OTP
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}