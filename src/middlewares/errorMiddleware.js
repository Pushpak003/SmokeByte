import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  // Services throw errors with .statusCode for client errors (400, 401, etc)
  // Anything without statusCode is an unexpected server error
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error({ err: err.message, url: req.url, method: req.method }, "Server error");
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};