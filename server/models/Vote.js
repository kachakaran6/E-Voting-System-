const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true, index: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    voterUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    voterId: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    receiptId: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

voteSchema.index({ voterUserId: 1, electionId: 1 }, { unique: true });
voteSchema.index({ voterId: 1, electionId: 1 }, { unique: true });

const Vote = mongoose.model("Vote", voteSchema);

module.exports = { Vote };

