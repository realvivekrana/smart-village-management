const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const connectWithRetry = async (attempt = 1) => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Failed (attempt ${attempt}/${MAX_RETRIES}):`);
    console.error(error.message);

    if (attempt < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(() => connectWithRetry(attempt + 1), RETRY_DELAY_MS);
    } else {
      console.error(
        "Could not connect to MongoDB after multiple attempts. Check your internet connection, MONGO_URI, and Atlas Network Access (IP whitelist)."
      );
      process.exit(1);
    }
  }
};

// Auto-reconnect handling if connection drops AFTER a successful start
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
  connectWithRetry();
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

const connectDB = () => connectWithRetry();

module.exports = connectDB;