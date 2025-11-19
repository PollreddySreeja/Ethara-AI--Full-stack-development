// Centralized error handler middleware
// Ensures all errors return consistent JSON format
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error"
  });
}

module.exports = { errorHandler };
