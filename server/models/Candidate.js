const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    candidateName: { type: String, required: true, trim: true, maxlength: 120 },
    partyName: { type: String, required: true, trim: true, maxlength: 120 },
    partyLogoPath: { type: String },
    candidateImagePath: { type: String },
    state: { type: String, required: true, trim: true, index: true },
    constituency: { type: String, trim: true },
    age: { type: Number, min: 25 },
    manifesto: { type: String, maxlength: 2000 },
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true, index: true },
    voteCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

candidateSchema.index({ electionId: 1, state: 1 });

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = { Candidate };

