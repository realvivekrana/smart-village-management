/**
 * Seed script — inserts/updates Kakarcholi village data in MongoDB.
 *
 * SETUP:
 * 1. Place this file and kakarcholiVillageData.js in your Backend's
 *    seed/ folder (e.g. Backend/seed/).
 * 2. Adjust the require() path below to point to your actual
 *    Village mongoose model.
 * 3. Make sure your .env has MONGO_URI (or edit the fallback below).
 *
 * RUN:
 *   node seed/seedKakarcholi.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const kakarcholiVillageData = require("./kakarcholiVillageData");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_village";

/**
 * Auto-detect the Village mongoose model instead of a hardcoded path.
 * Tries the common locations first, then falls back to searching the
 * project for any file named Village.js / village.model.js.
 * Set VILLAGE_MODEL_PATH in .env to skip detection entirely.
 */
function loadVillageModel() {
  if (process.env.VILLAGE_MODEL_PATH) {
    return require(path.resolve(process.env.VILLAGE_MODEL_PATH));
  }

  const candidates = [
    "../models/Village",
    "../models/village",
    "../src/models/Village",
    "../model/Village",
    "./models/Village",
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (err) {
      if (err.code !== "MODULE_NOT_FOUND") throw err;
    }
  }

  // Last resort: walk the backend folder looking for a matching file
  const backendRoot = path.resolve(__dirname, "..");
  const found = findFile(backendRoot, /^village\.js$/i, ["node_modules", ".git"]);

  if (found) {
    console.log(`🔍 Auto-detected Village model at: ${found}`);
    return require(found);
  }

  throw new Error(
    "Could not find the Village model. Set VILLAGE_MODEL_PATH in your .env " +
      "to its exact path, e.g. VILLAGE_MODEL_PATH=./models/Village.js"
  );
}

function findFile(dir, pattern, skipDirs) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (skipDirs.includes(entry.name)) continue;
      const result = findFile(path.join(dir, entry.name), pattern, skipDirs);
      if (result) return result;
    } else if (pattern.test(entry.name)) {
      return path.join(dir, entry.name);
    }
  }
  return null;
}

const Village = loadVillageModel();

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB:", MONGO_URI);

    // Upsert: if a village with this name already exists, update it;
    // otherwise create a new one. This avoids duplicate entries if you
    // run the seed script more than once.
    const existing = await Village.findOne({
      name: kakarcholiVillageData.name,
    });

    if (existing) {
      await Village.updateOne(
        { _id: existing._id },
        { $set: kakarcholiVillageData }
      );
      console.log(
        `♻️  Updated existing village "${kakarcholiVillageData.name}" (id: ${existing._id})`
      );
    } else {
      const created = await Village.create(kakarcholiVillageData);
      console.log(
        `🆕 Created new village "${created.name}" (id: ${created._id})`
      );
    }

    console.log(
      `📍 Places seeded: ${kakarcholiVillageData.places.length}`
    );
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();