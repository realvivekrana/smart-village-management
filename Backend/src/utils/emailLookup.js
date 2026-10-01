const User = require("../models/User");

/*
| Gmail ke purane normalize kiye hue (dots hata hue) emails bhi mil jayein,
| aur naye exact emails bhi. Isse login / forgot-password dono sahi chalte hain.
*/
const emailVariants = (email = "") => {
  const lower = String(email).trim().toLowerCase();
  const variants = new Set([lower]);
  const [local, domain] = lower.split("@");
  if (local && (domain === "gmail.com" || domain === "googlemail.com")) {
    const stripped = local.split("+")[0].replace(/\./g, "");
    variants.add(`${stripped}@gmail.com`);
  }
  return [...variants];
};

const findUserByEmail = (email) => User.findOne({ email: { $in: emailVariants(email) } });

module.exports = { emailVariants, findUserByEmail };