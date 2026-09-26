/**
 * Diagnoses and fixes the "wrong village is active" problem.
 *
 * It lists every Village document in the DB (id, name, places count,
 * isActive), then automatically marks the document with the MOST
 * places as the active one (assuming that's your seeded Kakarcholi
 * data) and deactivates all others.
 *
 * RUN from Backend folder:
 *   node src/seeds/fixActiveVillage.js
 * (or wherever you place it — adjust the require paths below to match)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");

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

  const villages = await Village.find({}).lean();

  console.log(`Found ${villages.length} village document(s):\n`);

  villages.forEach((v, i) => {
    console.log(
      `${i + 1}) id=${v._id}  name="${v.name}"  isActive=${v.isActive}  places=${
        (v.places || []).length
      }  population=${v.population}`
    );
  });

  if (villages.length <= 1) {
    console.log(
      "\nOnly one (or zero) village found — nothing to fix. Exiting."
    );
    await mongoose.disconnect();
    return;
  }

  // Pick the document with the most places as the "real" one
  const richest = villages.reduce((best, v) =>
    (v.places || []).length > (best.places || []).length ? v : best
  );

  console.log(
    `\n👉 Treating "${richest.name}" (id=${richest._id}, ${
      (richest.places || []).length
    } places) as the correct active village.\n`
  );

  // Deactivate everything, then activate only the richest one
  await Village.updateMany({}, { $set: { isActive: false } });
  await Village.updateOne(
    { _id: richest._id },
    { $set: { isActive: true } }
  );

  console.log("✅ Updated isActive flags.");
  console.log(`   Active village is now: ${richest._id} ("${richest.name}")`);

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

run().catch((err) => {
  console.error("❌ Script failed:", err.message);
  process.exit(1);
});