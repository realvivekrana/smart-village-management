const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const env = require("./config/env");

const {
  apiLimiter,
  authLimiter,
} = require("./middleware/rateLimitMiddleware");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| Proxy
|--------------------------------------------------------------------------
| Render / Railway / Nginx ke peeche deploy karoge to real client IP
| chahiye, warna rate limit sab users pe ek saath lagega.
*/

if (env.isProduction) {
  app.set("trust proxy", 1);
}

/*
|--------------------------------------------------------------------------
| Security + CORS
|--------------------------------------------------------------------------
| FRONTEND_URL me comma se multiple origins de sakte ho.
*/

app.use(helmet());

const allowedOrigins = env.frontendUrl
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Logging, Body Parser, Cookies
|--------------------------------------------------------------------------
*/

if (env.nodeEnv !== "test") {
  app.use(morgan(env.isProduction ? "combined" : "dev"));
}

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Rate Limiting
|--------------------------------------------------------------------------
*/

app.use("/api", apiLimiter);

app.use(
  ["/api/v1/auth/login", "/api/v1/auth/register"],
  authLimiter
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Village Management API is running",
    environment: env.nodeEnv,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
};

app.get("/", healthCheck);
app.get("/api/v1/health", healthCheck);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

/*
|--------------------------------------------------------------------------
| 404 + Error Handler (hamesha sabse last me)
|--------------------------------------------------------------------------
*/

app.use(notFound);
app.use(errorHandler);

module.exports = app;