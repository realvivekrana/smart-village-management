/*
|--------------------------------------------------------------------------
| ApiError
|--------------------------------------------------------------------------
| Controller me:  throw ApiError.notFound("Notice not found");
| Express 5 async errors ko khud errorHandler tak bhej deta hai,
| isliye har jagah try/catch zaroori nahi hai.
*/

class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", errors) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message);
  }

  static forbidden(message = "You are not allowed to perform this action") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Resource already exists") {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;