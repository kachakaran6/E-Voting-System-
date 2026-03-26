const dotenv = require("dotenv");

dotenv.config();

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5001),
  MONGO_URI: required("MONGO_URI"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "2h",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  UPLOADS_DIR: process.env.UPLOADS_DIR || "uploads",
  MAIL_SERVICE: process.env.MAIL_SERVICE,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: Number(process.env.MAIL_PORT || 587),
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  MAIL_FROM: process.env.MAIL_FROM || "no-reply@evoting.com",
  USE_CLOUDINARY: process.env.USE_CLOUDINARY === "true",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
};

module.exports = { env };
