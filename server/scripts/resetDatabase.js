const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { User } = require("../models/User");
const { Candidate } = require("../models/Candidate");
const { Election } = require("../models/Election");
const { Vote } = require("../models/Vote");
const { Notification } = require("../models/Notification");
const { Otp } = require("../models/Otp");

const resetDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not found in environment");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    console.log("🧹 Cleaning database...");

    await Promise.all([
      User.deleteMany({}),
      Candidate.deleteMany({}),
      Election.deleteMany({}),
      Vote.deleteMany({}),
      Notification.deleteMany({}),
      Otp.deleteMany({}),
    ]);

    console.log("✅ Database cleaned successfully");
  } catch (err) {
    console.error("❌ Error resetting database:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

resetDB();
