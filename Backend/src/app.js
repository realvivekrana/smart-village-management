const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const { apiLimiter } = require("./middleware/rateLimitMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

const authRoutes = require("./routes/authRoutes");
const governmentContactRoutes = require("./routes/governmentContactRoutes");
const specialContactRoutes = require("./routes/specialContactRoutes");
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
const { clearHomeCache } = require("./controllers/homeController");
const assistantRoutes = require("./routes/assistantRoutes");

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
} else if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
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
| Response Compression
|--------------------------------------------------------------------------
|
| `npm install compression` karna hai.
| Package na ho to bhi server chalega.
|--------------------------------------------------------------------------
*/

try {
  const compression = require("compression");
  app.use(compression());
} catch (err) {
  console.warn(
    "compression package not installed - run: npm install compression"
  );
}

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
| 4. Custom production domain
| 5. Postman / server-to-server requests
|
|--------------------------------------------------------------------------
*/

// Extra origins (comma separated) env se:
// CORS_ORIGINS=https://a.com,https://b.com

const extraOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  process.env.FRONTEND_URL &&
    process.env.FRONTEND_URL.replace(/\/$/, ""),

  // Local development
  "http://localhost:5173",
  "http://localhost:3000",

  // Production Vercel
  "https://smart-village-management.vercel.app",

  // Custom production domain
  "https://smartvillagekakarcholi.in",
  "https://www.smartvillagekakarcholi.in",

  ...extraOrigins,
].filter(Boolean);

/*
|--------------------------------------------------------------------------
| Vercel Preview Deployments
|--------------------------------------------------------------------------
|
| Example:
| https://smart-village-management-8hizmiin6-vivek-kumar-rana-s-projects.vercel.app
|
|--------------------------------------------------------------------------
*/

const vercelPreviewRegex =
  /^https:\/\/smart-village-management[a-z0-9-]*\.vercel\.app$/i;

/*
|--------------------------------------------------------------------------
| Local Development
|--------------------------------------------------------------------------
|
| localhost / 127.0.0.1 ka koi bhi port
| (5173, 5174, 5175...) allow hoga.
|
|--------------------------------------------------------------------------
*/

const localhostRegex =
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

/*
|--------------------------------------------------------------------------
| LAN Development
|--------------------------------------------------------------------------
|
| Development me phone se laptop ke LAN IP par
| test karne ke liye.
|--------------------------------------------------------------------------
*/

const lanRegex =
  /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/i;

/*
|--------------------------------------------------------------------------
| Origin Check
|--------------------------------------------------------------------------
*/

const isOriginAllowed = (origin) =>
  allowedOrigins.includes(origin) ||
  vercelPreviewRegex.test(origin) ||
  (
    process.env.NODE_ENV !== "production" &&
    (
      localhostRegex.test(origin) ||
      lanRegex.test(origin)
    )
  );

/*
|--------------------------------------------------------------------------
| CORS Options
|--------------------------------------------------------------------------
*/

const corsOptions = {
  origin: (origin, callback) => {
    // Postman / server-to-server
    // No Origin header
    if (!origin) {
      return callback(null, true);
    }

    // Allowed origins
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    // Error throw nahi karte
    // Browser me confusing CORS error avoid karne ke liye
    console.warn(`CORS blocked origin: ${origin}`);

    return callback(null, false);
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],

  optionsSuccessStatus: 204,
};

/*
|--------------------------------------------------------------------------
| Apply CORS
|--------------------------------------------------------------------------
*/

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
| Home page highlights refresh
|--------------------------------------------------------------------------
|
| Jab bhi koi community post, notice, event,
| bazaar listing, business ya job add / edit /
| delete / approve ho, home page ka cache
| turant clear ho jaye.
|
|--------------------------------------------------------------------------
*/

app.use(
  [
    "/api/v1/community",
    "/api/v1/notices",
    "/api/v1/events",
    "/api/v1/listings",
    "/api/v1/businesses",
    "/api/v1/jobs",
  ],
  (req, res, next) => {
    if (req.method !== "GET") {
      res.on("finish", () => {
        if (res.statusCode < 400) {
          clearHomeCache();
        }
      });
    }

    next();
  }
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
| Special Contacts
|--------------------------------------------------------------------------
|
| Mukhiya, Sachiv, Ward Member, BDO, MLA ...
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/special-contacts",
  specialContactRoutes
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
| AI Assistant
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/assistant",
  assistantRoutes
);

/*
|--------------------------------------------------------------------------
| 404 + Global Error Handler
|--------------------------------------------------------------------------
|
| middleware/errorMiddleware.js — multer (file size),
| JWT, CastError, duplicate key aur validation errors
| sahi status code ke saath handle karta hai.
|
|--------------------------------------------------------------------------
*/

app.use(notFound);

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| Export App
|--------------------------------------------------------------------------
*/

module.exports = app;