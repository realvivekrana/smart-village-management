/**
 * Emergency Contacts Seed
 * Usage: npm run seed:emergency
 *
 * Creates standard emergency contacts for Indian villages.
 */

require("../config/env");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const EmergencyContact = require("../models/EmergencyContact");

const contacts = [
  {
    name: "Police",
    designation: "Police Helpline",
    phone: "100",
    category: "police",
    description: "National police emergency helpline",
    available24x7: true,
    order: 1,
  },
  {
    name: "Fire Brigade",
    designation: "Fire Emergency",
    phone: "101",
    category: "fire",
    description: "Fire emergency response",
    available24x7: true,
    order: 2,
  },
  {
    name: "Ambulance",
    designation: "Medical Emergency",
    phone: "102",
    category: "ambulance",
    description: "Ambulance and medical emergency services",
    available24x7: true,
    order: 3,
  },
  {
    name: "National Emergency",
    designation: "All Emergencies",
    phone: "112",
    category: "disaster_relief",
    description: "Single emergency number for all services",
    available24x7: true,
    order: 4,
  },
  {
    name: "Women Helpline",
    designation: "Women Safety",
    phone: "1091",
    category: "women_helpline",
    description: "Women in distress helpline",
    available24x7: true,
    order: 5,
  },
  {
    name: "Child Helpline",
    designation: "CHILDLINE",
    phone: "1098",
    category: "child_helpline",
    description: "Emergency outreach service for children in need",
    available24x7: true,
    order: 6,
  },
  {
    name: "Disaster Management",
    designation: "NDMA Helpline",
    phone: "1078",
    category: "disaster_relief",
    description: "National Disaster Management Authority helpline",
    available24x7: true,
    order: 7,
  },
  {
    name: "Electricity Complaint",
    designation: "Power Outage",
    phone: "1912",
    category: "electricity",
    description: "Electricity complaint and outage helpline",
    available24x7: false,
    order: 8,
  },
  {
    name: "Water Supply",
    designation: "Water Board",
    phone: "1916",
    category: "water",
    description: "Water supply complaint helpline",
    available24x7: false,
    order: 9,
  },
];

const seed = async () => {
  await connectDB();

  const existing = await EmergencyContact.countDocuments();
  if (existing > 0) {
    console.log(`ℹ️  Emergency contacts already seeded (${existing} records found). Skipping.`);
    await mongoose.connection.close();
    process.exit(0);
  }

  await EmergencyContact.insertMany(contacts);
  console.log(`✅ ${contacts.length} emergency contacts seeded successfully.`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Emergency seed failed:", err.message);
  process.exit(1);
});
