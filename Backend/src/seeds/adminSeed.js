/**
 * Admin Seed
 * Usage: npm run seed:admin
 *
 * Creates the initial admin account.
 * Configure via environment variables:
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD
 */

require("../config/env");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const seed = async () => {
  await connectDB();

  const name = process.env.ADMIN_NAME || "Admin";
  const email = process.env.ADMIN_EMAIL || "admin@smartvillage.com";
  const phone = process.env.ADMIN_PHONE || "9000000000";
  const password = process.env.ADMIN_PASSWORD || "Admin@1234";

  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    console.log(`ℹ️  Admin already exists: ${existing.email}`);
    await mongoose.connection.close();
    process.exit(0);
  }

  const admin = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    password,
    role: "admin",
    isActive: true,
    isEmailVerified: true,
  });

  console.log(`✅ Admin created:`);
  console.log(`   Name  : ${admin.name}`);
  console.log(`   Email : ${admin.email}`);
  console.log(`   Phone : ${admin.phone}`);
  console.log(`   Role  : ${admin.role}`);
  console.log(`\n⚠️  Change the default password immediately after first login!`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Admin seed failed:", err.message);
  process.exit(1);
});