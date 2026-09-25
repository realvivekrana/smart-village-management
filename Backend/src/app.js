const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const env = require("./config/env");

const { apiLimiter, authLimiter } = require("./middleware/rateLimitMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const villageRoutes = require("./routes/villageRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const eventRoutes = require("./routes/eventRoutes");
const jobRoutes = require("./routes/jobRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");
const businessRoutes = require("./routes/businessRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const communityRoutes = require("./routes/communityRoutes");
const commentRoutes = require("./routes/commentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| Proxy
|--------------------------------------------------------------------------
*/
if (env.isProduction) {
  app.set("trust proxy", 1);
}

/*
|--------------------------------------------------------------------------
| Security + CORS
|--------------------------------------------------------------------------
*/
app.use(helmet());

const allowedOrigins = env.frontendUrl.split(",").map((o) => o.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));

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
app.use(["/api/v1/auth/login", "/api/v1/auth/register"], authLimiter);

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
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
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
app.use("/api/v1/village", villageRoutes);
app.use("/api/v1/notices", noticeRoutes);
app.use("/api/v1/complaints", complaintRoutes);
app.use("/api/v1/emergency", emergencyRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", jobApplicationRoutes);
app.use("/api/v1/businesses", businessRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/community", communityRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Nested: comments under community posts
app.use("/api/v1/community/:postId/comments", commentRoutes);
// Nested: reviews under businesses
app.use("/api/v1/businesses/:businessId/reviews", reviewRoutes);
// Nested: applications under jobs
app.use("/api/v1", jobApplicationRoutes);

/*
|--------------------------------------------------------------------------
| 404 + Error Handler
|--------------------------------------------------------------------------
*/
app.use(notFound);
app.use(errorHandler);

module.exports = app;
