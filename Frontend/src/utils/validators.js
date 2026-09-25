export const isValidEmail = (email) =>
  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);

export const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

export const isValidPincode = (pin) => /^\d{6}$/.test(pin);

export const isStrongPassword = (password) =>
  password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["", "red", "orange", "yellow", "blue", "green"];
  return { score, label: labels[score], color: colors[score] };
};
