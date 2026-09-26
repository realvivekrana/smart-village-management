/**
 * Admin Seed
 * Usage: npm run seed:admin
 *
 * Creates the initial admin account.
 * If the admin email already exists, it updates
 * that existing account to admin.
 *
 * Configure via environment variables:
 *   ADMIN_NAME
 *   ADMIN_EMAIL
 *   ADMIN_PHONE
 *   ADMIN_PASSWORD
 */

require("../config/env");

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const seed = async () => {
  try {
    // --------------------------------------------------
    // Connect to MongoDB
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // Admin Configuration
    // --------------------------------------------------

    const name = process.env.ADMIN_NAME || "Admin";
    const email = (
      process.env.ADMIN_EMAIL || "admin@smartvillage.com"
    ).toLowerCase();

    const phone = process.env.ADMIN_PHONE || "9000000000";
    const password =
      process.env.ADMIN_PASSWORD || "Admin@1234";

    // --------------------------------------------------
    // Check Existing User
    // --------------------------------------------------

    const existing = await User.findOne({ email });

    // --------------------------------------------------
    // If User Already Exists
    // --------------------------------------------------

    if (existing) {
      console.log(
        `ℹ️  User already exists: ${existing.email}`
      );

      // Make existing account an admin
      existing.role = "admin";

      // Activate account
      existing.isActive = true;

      // Mark email as verified
      existing.isEmailVerified = true;

      await existing.save();

      console.log(
        `✅ Existing account updated successfully!`
      );
      console.log(`   Name  : ${existing.name}`);
      console.log(`   Email : ${existing.email}`);
      console.log(`   Phone : ${existing.phone}`);
      console.log(`   Role  : ${existing.role}`);
      console.log(`   Active: ${existing.isActive}`);
      console.log(
        `   Email Verified: ${existing.isEmailVerified}`
      );

      await mongoose.connection.close();
      process.exit(0);
    }

    // --------------------------------------------------
    // Create New Admin
    // --------------------------------------------------

    const admin = await User.create({
      name,
      email,
      phone,
      password,
      role: "admin",
      isActive: true,
      isEmailVerified: true,
    });

    // --------------------------------------------------
    // Success Message
    // --------------------------------------------------

    console.log(`\n✅ Admin created successfully!`);
    console.log(`   Name  : ${admin.name}`);
    console.log(`   Email : ${admin.email}`);
    console.log(`   Phone : ${admin.phone}`);
    console.log(`   Role  : ${admin.role}`);
    console.log(`   Active: ${admin.isActive}`);
    console.log(
      `   Email Verified: ${admin.isEmailVerified}`
    );

    console.log(
      `\n⚠️  Change the default password immediately after first login!`
    );

    // --------------------------------------------------
    // Close MongoDB Connection
    // --------------------------------------------------

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(
      "❌ Admin seed failed:",
      err.message
    );

    await mongoose.connection.close();

    process.exit(1);
  }
};

// --------------------------------------------------
// Run Seed
// --------------------------------------------------

seed();