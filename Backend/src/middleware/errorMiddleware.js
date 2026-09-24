const logger = require("../utils/logger");

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
| Har type ka error yahin ek jaisa JSON me convert hota hai:
| { success: false, message, errors? }
*/

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors;

  // Invalid ObjectId (e.g. /notices/abc)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Duplicate key (unique field)
  else if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "Field";

    statusCode = 409;
    message = `${field} already exists`;
  }

  // Mongoose schema validation
  else if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;

    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    message = errors[0]?.message || "Validation failed";
  }

  // JWT
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired. Please login again.";
  }

  // Multer (file upload)
  else if (err.name === "MulterError") {
    statusCode = 400;

    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum size is 5MB."
        : err.code === "LIMIT_UNEXPECTED_FILE"
        ? "Too many files or unexpected file field."
        : err.message;
  }

  // Malformed JSON body
  else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }

  if (statusCode >= 500) {
    logger.error(err);

    // Production me internal error details client ko nahi jayenge
    if (process.env.NODE_ENV === "production" && !err.isOperational) {
      message = "Internal Server Error";
    }
  }

  const body = { success: false, message };

  if (errors) body.errors = errors;

  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

module.exports = {
  notFound,
  errorHandler,
};