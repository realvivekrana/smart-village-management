const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const governmentContactRoutes = require("./routes/governmentContactRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin
      // such as Postman or server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Rate Limiting
|--------------------------------------------------------------------------
*/

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api/", apiLimiter);

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/*
|--------------------------------------------------------------------------
| Cookie Parser
|--------------------------------------------------------------------------
*/

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Logging
|--------------------------------------------------------------------------
*/

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Village Management API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/auth",
  authRoutes
);

/*
|--------------------------------------------------------------------------
| Government Contacts
|--------------------------------------------------------------------------
|
| Public:
| GET    /api/v1/government-contacts
| GET    /api/v1/government-contacts/:id
|
| Admin:
| POST   /api/v1/government-contacts
| PUT    /api/v1/government-contacts/:id
| PATCH  /api/v1/government-contacts/:id/status
| DELETE /api/v1/government-contacts/:id
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/government-contacts",
  governmentContactRoutes
);

/*
|--------------------------------------------------------------------------
| Government / Village Services
|--------------------------------------------------------------------------
|
| Public:
| GET    /api/v1/services
| GET    /api/v1/services/:id
|
| Admin:
| POST   /api/v1/services
| PUT    /api/v1/services/:id
| DELETE /api/v1/services/:id
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/services",
  serviceRoutes
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
  (err, req, res, next) => {
    console.error("Global Error:", err);

    /*
     * CORS error
     */
    if (err.message === "Not allowed by CORS") {
      return res.status(403).json({
        success: false,
        message: "CORS policy blocked this request",
      });
    }

    /*
     * JSON parsing error
     */
    if (
      err instanceof SyntaxError &&
      err.status === 400 &&
      err.body
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON request body",
      });
    }

    /*
     * Mongoose validation error
     */
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(err.errors).map(
          (error) => error.message
        ),
      });
    }

    /*
     * Mongoose CastError
     */
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID",
      });
    }

    /*
     * Duplicate key error
     */
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate record already exists",
      });
    }

    /*
     * Default error
     */
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
      }),
    });
  }
);

module.exports = app;