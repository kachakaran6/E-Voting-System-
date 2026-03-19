function notFound(req, res) {
  res.status(404).json({ message: "Not found" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = Number(err.status || 500);
  const message = err.expose ? err.message : "Internal server error";
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };

