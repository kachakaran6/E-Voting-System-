const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ["REGISTER", "FORGOT_PASSWORD"], required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Expire in 10 minutes
});

const Otp = mongoose.model("Otp", otpSchema);

module.exports = { Otp };
