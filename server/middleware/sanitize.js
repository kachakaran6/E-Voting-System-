const sanitize = require("mongo-sanitize");

function deepSanitize(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  const out = {};
  for (const [k, v] of Object.entries(obj)) out[k] = deepSanitize(sanitize(v));
  return out;
}

function sanitizeRequest(req, res, next) {
  req.body = deepSanitize(req.body);
  req.query = deepSanitize(req.query);
  req.params = deepSanitize(req.params);
  next();
}

module.exports = { sanitizeRequest };

