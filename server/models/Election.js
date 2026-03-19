const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    state: { type: String, required: true, trim: true, index: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    status: { type: String, enum: ["upcoming", "active", "paused", "closed"], default: "upcoming", index: true },
    isPaused: { type: Boolean, default: false },
    isEndedEarly: { type: Boolean, default: false },
    locked: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

electionSchema.index({ state: 1, status: 1 });

const Election = mongoose.model("Election", electionSchema);

module.exports = { Election };

