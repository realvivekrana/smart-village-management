const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

/*
| Atlas + Render free plan par connection beech me tut sakta hai.
| Ye options "hang" hone ki jagah jaldi fail karke retry karne dete hain.
*/
const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
  maxPoolSize: 10,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/*
| IMPORTANT: ye function tabhi resolve hota hai jab DB sach me connect ho jaye.
| Pehle pehli koshish fail hone par bhi server start ho jata tha (DB ke bina),
| aur tab tak aane wali requests 500 deti thin.
*/
const connectDB = async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const connection = await mongoose.connect(
        process.env.MONGO_URI,
        CONNECT_OPTIONS
      );

      console.log(`MongoDB Connected: ${connection.connection.host}`);
      return;
    } catch (error) {
      console.error(
        `MongoDB Connection Failed (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`
      );

      if (attempt === MAX_RETRIES) {
        console.error(
          "Could not connect to MongoDB after multiple attempts. Check MONGO_URI and Atlas Network Access (IP whitelist: 0.0.0.0/0 for Render)."
        );
        process.exit(1);
      }

      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await sleep(RETRY_DELAY_MS);
    }
  }
};

/*
| Connection baad me tute to MongoDB driver khud reconnect karta hai.
| Agar 15 sec baad bhi disconnected ho, tabhi hum manually dobara connect karte hain
| (pehle har disconnect par turant naya connect() chalta tha, jo clash karta tha).
*/
let manualReconnectRunning = false;

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Waiting for auto-reconnect...");

  setTimeout(async () => {
    if (mongoose.connection.readyState !== 0 || manualReconnectRunning) return;

    manualReconnectRunning = true;
    try {
      console.warn("MongoDB still disconnected. Reconnecting manually...");
      await mongoose.connect(process.env.MONGO_URI, CONNECT_OPTIONS);
      console.log("MongoDB reconnected.");
    } catch (error) {
      console.error("MongoDB manual reconnect failed:", error.message);
    } finally {
      manualReconnectRunning = false;
    }
  }, 15000);
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected (auto).");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

module.exports = connectDB;