const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const { apiLimiter } = require("./middleware/rateLimitMiddleware");

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

const authRoutes = require("./routes/authRoutes");
const governmentContactRoutes = require("./routes/governmentContactRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const villageRoutes = require("./routes/villageRoutes");
const businessRoutes = require("./routes/businessRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const communityRoutes = require("./routes/communityRoutes");
const commentRoutes = require("./routes/commentRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const contactRoutes = require("./routes/contactRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const eventRoutes = require("./routes/eventRoutes");
const jobRoutes = require("./routes/jobRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");

/*
|--------------------------------------------------------------------------
| Village Management Feature Routes
|--------------------------------------------------------------------------
*/

const villageFeatureRoutes = require("./routes/villageFeatureRoutes");
const householdRoutes = require("./routes/householdRoutes");
const sosRoutes = require("./routes/sosRoutes");
const listingRoutes = require("./routes/listingRoutes");
const galleryRoutes = require("./routes/galleryRoutes");

/*
|--------------------------------------------------------------------------
| Home API
|--------------------------------------------------------------------------
*/

const homeRoutes = require("./routes/homeRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| Trust Proxy
|--------------------------------------------------------------------------
|
| Required when deployed behind Render / Railway / Nginx.
| This allows Express to correctly identify the client IP.
|
|--------------------------------------------------------------------------
*/

if (process.env.TRUST_PROXY) {
  app.set(
    "trust proxy",
    Number(process.env.TRUST_PROXY) || 1
  );
}

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
|
| Supports:
|
| 1. Local development
| 2. Production Vercel
| 3. Vercel preview deployments
| 4. Postman / server-to-server requests
|
|--------------------------------------------------------------------------
*/

// Extra origins (comma separated) env se: CORS_ORIGINS=https://a.com,https://b.com
const extraOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  process.env.FRONTEND_URL && process.env.FRONTEND_URL.replace(/\/$/, ""),

  // Local development
  "http://localhost:5173",
  "http://localhost:3000",

  // Production Vercel
  "https://smart-village-management.vercel.app",

  ...extraOrigins,
].filter(Boolean);

// Vercel deployment / preview URLs, e.g.
// https://smart-village-management-8hizmiin6-vivek-kumar-rana-s-projects.vercel.app
const vercelPreviewRegex =
  /^https:\/\/smart-village-management[a-z0-9-]*\.vercel\.app$/i;

// Local development: localhost / 127.0.0.1 ka koi bhi port (5173, 5174, ...)
// Sirf production ke bahar allow hota hai.
const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

const isOriginAllowed = (origin) =>
  allowedOrigins.includes(origin) ||
  vercelPreviewRegex.test(origin) ||
  (process.env.NODE_ENV !== "production" && localhostRegex.test(origin));

const corsOptions = {
  origin: (origin, callback) => {
    // Postman / server-to-server (no Origin header)
    if (!origin) return callback(null, true);

    if (isOriginAllowed(origin)) return callback(null, true);

    // Error throw nahi karte: warna 403 bina CORS headers ke jata hai
    // aur browser me confusing "CORS blocked" error dikhta hai.
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

// cors middleware preflight (OPTIONS) khud handle kar leta hai.
// NOTE: Express 5 me app.options("*", ...) crash karta hai, isliye hata diya.
app.use(cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Rate Limiting
|--------------------------------------------------------------------------
*/

app.use(
  "/api/",
  apiLimiter
);

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
|
| Reduced from 10MB to 2MB.
| File/image uploads using multipart/form-data
| are handled separately by upload middleware.
|
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
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

if (
  process.env.NODE_ENV !== "production" &&
  process.env.NODE_ENV !== "test"
) {
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
    message:
      "Smart Village Management API is running",
    environment:
      process.env.NODE_ENV || "development",
    timestamp:
      new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    environment:
      process.env.NODE_ENV || "development",
    timestamp:
      new Date().toISOString(),
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
| Home
|--------------------------------------------------------------------------
|
| GET /api/v1/home
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/home",
  homeRoutes
);

/*
|--------------------------------------------------------------------------
| Government Contacts
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
*/

app.use(
  "/api/v1/services",
  serviceRoutes
);

/*
|--------------------------------------------------------------------------
| Village
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/village",
  villageRoutes
);

/*
|--------------------------------------------------------------------------
| Businesses + Reviews
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/businesses",
  businessRoutes
);

app.use(
  "/api/v1/businesses/:businessId/reviews",
  reviewRoutes
);

app.use(
  "/api/v1/reviews",
  reviewRoutes
);

/*
|--------------------------------------------------------------------------
| Community Posts + Comments
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/community",
  communityRoutes
);

/*
|--------------------------------------------------------------------------
| Village Bazaar / Listings
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/listings",
  listingRoutes
);

/*
|--------------------------------------------------------------------------
| Citizen Gallery
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/gallery",
  galleryRoutes
);

app.use(
  "/api/v1/community/:postId/comments",
  commentRoutes
);

app.use(
  "/api/v1/comments",
  commentRoutes
);

/*
|--------------------------------------------------------------------------
| Complaints
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/complaints",
  complaintRoutes
);

/*
|--------------------------------------------------------------------------
| Contact Messages
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/contact",
  contactRoutes
);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/dashboard",
  dashboardRoutes
);

/*
|--------------------------------------------------------------------------
| Emergency Contacts
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/emergency",
  emergencyRoutes
);

/*
|--------------------------------------------------------------------------
| Events
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/events",
  eventRoutes
);

/*
|--------------------------------------------------------------------------
| Jobs
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/jobs",
  jobRoutes
);

/*
|--------------------------------------------------------------------------
| Job Applications
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/applications",
  jobApplicationRoutes
);

/*
|--------------------------------------------------------------------------
| Notices
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/notices",
  noticeRoutes
);

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/notifications",
  notificationRoutes
);

/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/users",
  userRoutes
);

/*
|--------------------------------------------------------------------------
| Village Features
|--------------------------------------------------------------------------
|
| Government schemes
| Gram Sabha
| Mandi Bhav
| Weather / Crop Advice
| Equipment Rental
| Fertilizer / Seed Availability
| Health Camps
| Vaccination
| Transport
| Scholarship
| Skill Training
| Volunteer / Shramdaan
| Lost & Found
| Buy / Sell
| etc.
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/village-features",
  villageFeatureRoutes
);

/*
|--------------------------------------------------------------------------
| Household / Family Members
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/households",
  householdRoutes
);

/*
|--------------------------------------------------------------------------
| Emergency SOS
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/sos",
  sosRoutes
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
  (err, req, res, next) => {
    console.error(
      "Global Error:",
      err
    );

    /*
    |--------------------------------------------------------------------------
    | CORS Error
    |--------------------------------------------------------------------------
    */

    if (
      err.message ===
      "Not allowed by CORS"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "CORS policy blocked this request",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | JSON Parsing Error
    |--------------------------------------------------------------------------
    */

    if (
      err instanceof SyntaxError &&
      err.status === 400 &&
      err.body
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid JSON request body",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Mongoose Validation Error
    |--------------------------------------------------------------------------
    */

    if (
      err.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Validation failed",

        errors:
          Object.values(
            err.errors
          ).map(
            (error) =>
              error.message
          ),
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Mongoose Cast Error
    |--------------------------------------------------------------------------
    */

    if (
      err.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid resource ID",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Duplicate Key Error
    |--------------------------------------------------------------------------
    */

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Duplicate record already exists",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Default Error
    |--------------------------------------------------------------------------
    */

    return res.status(
      err.statusCode || 500
    ).json({
      success: false,

      message:
        err.message ||
        "Internal server error",

      ...(process.env.NODE_ENV ===
        "development" && {
        stack: err.stack,
      }),
    });
  }
);

/*
|--------------------------------------------------------------------------
| Export App
|--------------------------------------------------------------------------
*/

module.exports = app;