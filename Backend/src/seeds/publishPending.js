/**
 * Publish all pending citizen submissions
 * Usage: npm run publish:pending
 *
 * Purane "admin approval ke intezaar" wale events, notices, bazaar posts,
 * gallery photos aur businesses ko ek saath approve (publish) kar deta hai.
 * Rejected items ko touch nahi karta. Dobara chalane se koi nuksan nahi.
 */

require("../config/env");
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const Event = require("../models/Event");
const Notice = require("../models/Notice");
const Listing = require("../models/Listing");
const GalleryPhoto = require("../models/GalleryPhoto");
const Business = require("../models/Business");

const run = async () => {
  await connectDB();

  const now = new Date();
  const targets = [
    ["Events", Event, { status: "approved", reviewedAt: now }],
    ["Notices", Notice, { status: "approved", reviewedAt: now, publishedAt: now }],
    ["Bazaar listings", Listing, { status: "approved", reviewedAt: now }],
    ["Gallery photos", GalleryPhoto, { status: "approved", reviewedAt: now }],
    ["Businesses", Business, { status: "approved" }],
  ];

  for (const [label, Model, set] of targets) {
    const res = await Model.updateMany({ status: "pending" }, { $set: set });
    console.log(`${label}: ${res.modifiedCount} published`);
  }

  await mongoose.disconnect();
  console.log("Done.");
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});