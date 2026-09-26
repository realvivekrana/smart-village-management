/**
 * Debug Login
 * Usage: node src/seeds/debugLogin.js "email@example.com" "password"
 *
 * Aapke Backend/.env se DB connect karke check karta hai ki login
 * fail kyun ho raha hai — user exist karta hai ya nahi, active hai
 * ya nahi, aur password hash se match karta hai ya nahi.
 *
 * Sirf local debugging ke liye — kahin deploy mat karo isse.
 */

require("../config/env");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const [, , emailArg, passwordArg] = process.argv;

const run = async () => {
  if (!emailArg || !passwordArg) {
    console.log('Usage: node src/seeds/debugLogin.js "email" "password"');
    process.exit(1);
  }

  await connectDB();

  const email = emailArg.toLowerCase().trim();

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    console.log(`❌ Koi bhi user is email se DB mein nahi mila: ${email}`);
    console.log(
      "   → Ya to registration successful nahi hua tha, ya email galat type hua hai (typo/space check karo)."
    );
    await mongoose.connection.close();
    process.exit(0);
  }

  console.log(`✅ User mila: ${user.name} (${user.email})`);
  console.log(`   Role            : ${user.role}`);
  console.log(`   isActive        : ${user.isActive}`);
  console.log(`   isEmailVerified : ${user.isEmailVerified}`);
  console.log(
    `   Password hash looks like bcrypt: ${/^\$2[aby]\$/.test(user.password)}`
  );

  if (!user.isActive) {
    console.log("❌ Account deactivated hai — isliye login fail ho raha hai (403, 401 nahi).");
  }

  const isMatch = await user.comparePassword(passwordArg);

  console.log(
    isMatch
      ? "✅ Password MATCH karta hai — login is exact credential se kaam karna chahiye."
      : "❌ Password MATCH NAHI karta — yahi 401 'Invalid email or password' ki wajah hai."
  );

  if (!isMatch && !/^\$2[aby]\$/.test(user.password)) {
    console.log(
      "⚠️  Stored password bcrypt hash jaisa nahi lag raha — shayad ye user seed/DB mein directly (Compass/Atlas UI se) insert hua tha, User.create() API se nahi, isliye password hash hi nahi hua."
    );
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Debug script fail hua:", err.message);
  process.exit(1);
});