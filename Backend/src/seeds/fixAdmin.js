/**
 * Fix Admin — force create or force reset the admin's password
 * Usage: node src/seeds/fixAdmin.js
 *
 * Unlike adminSeed.js, this ALWAYS sets the password you specify below,
 * even if the user already exists.
 */

require("../config/env");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

// 👇 Apne credentials yahan daalo
const EMAIL = "vivekranaworks@gmail.com";
const PASSWORD = "Vivekgeeta@2546";
const NAME = "Super Admin";
const PHONE = "9000000000"; // valid 10-digit Indian number, 6-9 se start

const run = async () => {
  await connectDB();

  let user = await User.findOne({ email: EMAIL.toLowerCase() }).select("+password");

  if (user) {
    console.log(`ℹ️  User already exists (role: ${user.role}). Resetting password...`);
    user.password = PASSWORD; // pre-save hook hash kar dega
    user.role = "super_admin";
    user.isActive = true;
    user.isEmailVerified = true;
    await user.save();
    console.log("✅ Password reset done.");
  } else {
    user = await User.create({
      name: NAME,
      email: EMAIL.toLowerCase(),
      phone: PHONE,
      password: PASSWORD,
      role: "super_admin",
      isActive: true,
      isEmailVerified: true,
    });
    console.log("✅ New admin created.");
  }

  console.log(`   Email : ${user.email}`);
  console.log(`   Role  : ${user.role}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});