const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["SUPER_ADMIN", "ADMIN", "VOTER"] },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } }
);

notificationSchema.index({ userId: 1, isRead: 1, timestamp: -1 });
notificationSchema.index({ role: 1, isRead: 1, timestamp: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };

