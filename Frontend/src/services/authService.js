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
export const sendResetOtp = (data) =>
  api.post("/auth/forgot-password/send-otp", data);

// Step 2: Verify OTP
export const verifyResetOtp = (data) =>
  api.post("/auth/forgot-password/verify-otp", data);

// Step 3: Reset password using reset token
export const resetPassword = (data) =>
  api.post("/auth/reset-password", data);