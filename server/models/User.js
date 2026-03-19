const mongoose = require("mongoose");

const roles = ["SUPER_ADMIN", "ADMIN", "VOTER"];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    username: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: roles, required: true, index: true },
    voterId: { type: String, trim: true, unique: true, sparse: true, index: true },
    state: { type: String, trim: true, index: true },
    idProofPath: { type: String },
    isActive: { type: Boolean, default: true },
    forgotPasswordToken: { type: String },
    forgotPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Indices are handled inline in the schema definition above


const User = mongoose.model("User", userSchema);

module.exports = { User, roles };

