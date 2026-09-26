/**
 * Merges the full 62-places Kakarcholi data (kakarcholiVillageData.js)
 * into the CURRENTLY ACTIVE village document.
 *
 * Safe-merge rules:
 * - places, nearbyVillages/Cities/Taluks/Districts/RailwayStations/
 *   Airports/TouristPlaces, description, howToReach, rivers, languages,
 *   stdCode, altitude, localName, block, pincode, district, state, name
 *   → always overwritten with the rich data (these were empty/incomplete).
 * - population, area, sarpanch, history
 *   → kept as-is if the active document already has a real value,
 *     otherwise filled in from the rich data.
 *
 * SETUP: place this file in the SAME folder as kakarcholiVillageData.js
 * (e.g. Backend/src/seeds/), since it does require("./kakarcholiVillageData").
 *
 * RUN from Backend folder:
 *   node src/seeds/mergeRichVillageData.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const kakarcholiVillageData = require("./kakarcholiVillageData");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_village";

function loadVillageModel() {
  const candidates = [
    "../models/Village",
    "./models/Village",
    "../src/models/Village",
  ];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (err) {
      if (err.code !== "MODULE_NOT_FOUND") throw err;
    }
  }
  throw new Error(
    "Could not find Village model — edit the candidates list in this script."
  );
}

async function run() {
  const Village = loadVillageModel();

  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  const village = await Village.findOne({ isActive: true });

  if (!village) {
    console.log("❌ No active village found. Nothing to merge into.");
    await mongoose.disconnect();
    return;
  }

  console.log(
    `Found active village: id=${village._id}  name="${village.name}"  places=${
      (village.places || []).length
    }\n`
  );

  const existingSarpanch = village.sarpanch || {};

  const merged = {
    ...kakarcholiVillageData,

    // Preserve manually-entered values if they already exist
    population: village.population || kakarcholiVillageData.population,
    area: village.area || kakarcholiVillageData.area,
    history: village.history || kakarcholiVillageData.history,
    sarpanch: {
      name: existingSarpanch.name || kakarcholiVillageData.sarpanch.name,
      phone: existingSarpanch.phone || kakarcholiVillageData.sarpanch.phone,
    },

    // Keep it active
    isActive: true,
  };

  Object.keys(merged).forEach((key) => {
    village[key] = merged[key];
  });

  await village.save();

  console.log("✅ Merge complete.");
  console.log(`   places: ${village.places.length}`);
  console.log(`   nearbyVillages: ${village.nearbyVillages.length}`);
  console.log(`   nearbyCities: ${village.nearbyCities.length}`);
  console.log(`   nearbyRailwayStations: ${village.nearbyRailwayStations.length}`);
  console.log(`   nearbyAirports: ${village.nearbyAirports.length}`);
  console.log(`   population (kept/filled): ${village.population}`);
  console.log(`   sarpanch: ${JSON.stringify(village.sarpanch)}`);

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected from MongoDB");
}

run().catch((err) => {
  console.error("❌ Script failed:", err.message);
  process.exit(1);
});