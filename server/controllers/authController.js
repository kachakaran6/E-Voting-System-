const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { env } = require("../config/env");
const { User } = require("../models/User");
const { Otp } = require("../models/Otp");
const { sendOtpEmail } = require("../services/mail");
const { sendWithTimeout } = require("../utils/timeout");

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    role: user.role,
    voterId: user.voterId,
    state: user.state,
  };
}

async function login(req, res) {
  const { identifier, password } = req.validated.body;
  const ident = String(identifier).trim().toLowerCase();

  let user = null;
  if (ident.includes("@")) user = await User.findOne({ email: ident });
  if (!user) user = await User.findOne({ username: ident });
  if (!user) user = await User.findOne({ voterId: identifier });

  if (!user || !user.isActive) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  return res.json({ token, user: publicUser(user) });
}

async function me(req, res) {
  return res.json({ user: req.user });
}

async function sendOtp(req, res) {
  const { email, type } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP
  await Otp.findOneAndUpdate(
    { email: email.toLowerCase(), type: type || "REGISTER" },
    { otp: otpCode, createdAt: new Date() },
    { upsert: true }
  );

  // Send Email (Non-blocking, with timeout safety)
  sendWithTimeout(sendOtpEmail(email, otpCode, type))
    .catch(err => console.error("Non-blocking Email Failed:", err.message));

  return res.json({ message: "OTP sent successfully" });
}

async function registerVoter(req, res) {
  const { fullName, email, password, voterId, state, otp } = req.validated.body;

  // Verify OTP
  const otpDoc = await Otp.findOne({ email: email.toLowerCase(), otp, type: "REGISTER" });
  if (!otpDoc) return res.status(401).json({ message: "Invalid or expired OTP" });

  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { voterId }],
  });
  if (existing) return res.status(409).json({ message: "Email or Voter ID already exists" });

  await User.create({
    fullName,
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 12),
    role: "VOTER",
    voterId,
    state,
  });

  // Delete OTP after success
  await otpDoc.deleteOne();

  return res.status(201).json({ message: "Registration successful. Please login." });
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) return res.status(404).json({ message: "User not found with this email" });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.findOneAndUpdate(
    { email: email.toLowerCase(), type: "FORGOT_PASSWORD" },
    { otp: otpCode, createdAt: new Date() },
    { upsert: true }
  );

  // Send Email (Non-blocking, with timeout for logs)
  sendWithTimeout(sendOtpEmail(email, otpCode, "FORGOT_PASSWORD"))
    .catch(err => console.error("Non-blocking Forgot Password Email Failed:", err.message));

  return res.json({ message: "Password reset OTP sent to email" });
}

async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  
  const otpDoc = await Otp.findOne({ email: email.toLowerCase(), otp, type: "FORGOT_PASSWORD" });
  if (!otpDoc) return res.status(401).json({ message: "Invalid or expired OTP" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: "User not found" });

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  await otpDoc.deleteOne();
  return res.json({ message: "Password reset successful" });
}

module.exports = { login, registerVoter, me, sendOtp, forgotPassword, resetPassword };

