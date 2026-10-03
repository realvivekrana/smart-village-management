import api from "./api";

// =========================
// AUTH
// =========================

export const register = (data) =>
  api.post("/auth/register", data);

export const login = (data) =>
  api.post("/auth/login", data);

export const logout = () =>
  api.post("/auth/logout");

export const getMe = () =>
  api.get("/auth/me");

// =========================
// PASSWORD RESET - OTP FLOW
// =========================

// Step 1: Send OTP to registered email
// Render free plan so jane ke baad pehli requests kabhi kabhi 5xx / network error deti hain.
// Isliye server-side ya network error par 2 baar apne aap dobara try karte hain.
// (400 / 403 / 429 jaise errors turant user ko dikhte hain.)
const isTemporaryError = (err) =>
  (!err.response && err.code !== "ECONNABORTED") ||
  (err.response && err.response.status >= 500);

export const sendResetOtp = async (data) => {
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; ; attempt += 1) {
    try {
      return await api.post("/auth/forgot-password/send-otp", data);
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS || !isTemporaryError(err)) throw err;

      await new Promise((resolve) => setTimeout(resolve, 2500 * attempt));
    }
  }
};

// Step 2: Verify OTP
export const verifyResetOtp = (data) =>
  api.post("/auth/forgot-password/verify-otp", data);

// Step 3: Reset password using reset token
export const resetPassword = (data) =>
  api.post("/auth/reset-password", data);