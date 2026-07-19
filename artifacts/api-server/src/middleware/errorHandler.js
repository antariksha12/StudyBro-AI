// Centralized error handler — keeps error responses consistent and
// avoids leaking stack traces to the client.
export function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.publicMessage || "Something went wrong. Please try again.",
  });
}

export function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}
