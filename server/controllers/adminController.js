const bcrypt = require("bcryptjs");
const { User } = require("../models/User");

async function listAdmins(req, res) {
  const admins = await User.find({ role: "ADMIN" }).select("-passwordHash").sort({ createdAt: -1 });
  res.json({ admins });
}

async function createAdmin(req, res) {
  const { fullName, email, password } = req.validated.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Email already exists" });
  const admin = await User.create({
    fullName,
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 12),
    role: "ADMIN",
  });
  res.status(201).json({ admin: { id: admin._id, fullName: admin.fullName, email: admin.email, role: admin.role } });
}

async function deleteAdmin(req, res) {
  const { id } = req.validated.params;
  const admin = await User.findOne({ _id: id, role: "ADMIN" });
  if (!admin) return res.status(404).json({ message: "Admin not found" });
  await admin.deleteOne();
  res.json({ ok: true });
}

module.exports = { listAdmins, createAdmin, deleteAdmin };

