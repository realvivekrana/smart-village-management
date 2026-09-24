const env = require("./config/env"); // dotenv sabse pehle load hoga
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const app = require("./app");
const logger = require("./utils/logger");

let server;

const shutdown = async (signal, exitCode = 0) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(exitCode);
    });

    // 10 sec me band na ho to force exit
    setTimeout(() => process.exit(exitCode || 1), 10000).unref();
  } else {
    process.exit(exitCode);
  }
};

const startServer = async () => {
  await connectDB();

  server = app.listen(env.port, () => {
    logger.info(
      `Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`
    );
  });
};

startServer();

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  shutdown("uncaughtException", 1);
});