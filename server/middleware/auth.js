const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { User } = require("../models/User");

function getTokenFromReq(req) {
  const hdr = req.headers.authorization;
  if (hdr) {
    const [type, token] = hdr.split(" ");
    if (type === "Bearer" && token) return token;
  }
  // Fallback to query parameter for downloads/window.open
  return req.query.token || null;
}

async function authRequired(req, res, next) {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user || !user.isActive) return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { authRequired };

