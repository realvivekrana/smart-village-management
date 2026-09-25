/**
 * Village Seed
 * Usage: npm run seed:village
 *
 * Creates the initial village record.
 */

require("../config/env");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Village = require("../models/Village");

const seed = async () => {
  await connectDB();

  const existing = await Village.findOne();
  if (existing) {
    console.log(`ℹ️  Village record already exists: ${existing.name}. Skipping.`);
    await mongoose.connection.close();
    process.exit(0);
  }

  const village = await Village.create({
    name: process.env.VILLAGE_NAME || "Rampur",
    district: process.env.VILLAGE_DISTRICT || "Sample District",
    state: process.env.VILLAGE_STATE || "Uttar Pradesh",
    pincode: process.env.VILLAGE_PINCODE || "201001",
    population: 5000,
    area: 12.5,
    description:
      "Welcome to our Smart Village! This platform helps connect residents, government services, and local businesses in one place.",
    sarpanch: {
      name: "Gram Pradhan",
      phone: "9000000001",
    },
    places: [
      {
        name: "Village Panchayat Office",
        type: "government_office",
        description: "Main administrative office of the village",
      },
      {
        name: "Primary Health Centre",
        type: "hospital",
        description: "Government primary health centre",
      },
      {
        name: "Government Primary School",
        type: "school",
        description: "Primary school serving village children",
      },
    ],
    isActive: true,
  });

  console.log(`✅ Village created:`);
  console.log(`   Name     : ${village.name}`);
  console.log(`   District : ${village.district}`);
  console.log(`   State    : ${village.state}`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Village seed failed:", err.message);
  process.exit(1);
});
