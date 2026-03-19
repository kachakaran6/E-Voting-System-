const { Election } = require("../models/Election");
const { Vote } = require("../models/Vote");
const { Candidate } = require("../models/Candidate");

async function dashboard(req, res) {
  const activeElections = await Election.countDocuments({ status: { $in: ["active", "paused"] } });
  const totalElections = await Election.countDocuments({});
  const totalVotes = await Vote.countDocuments({});
  const totalCandidates = await Candidate.countDocuments({});
  res.json({
    metrics: {
      totalVotes,
      activeElections,
      totalElections,
      totalCandidates,
    },
  });
}

async function electionStats(req, res) {
  const { electionId } = req.validated.params;
  const totalVotes = await Vote.countDocuments({ electionId });
  const byCandidate = await Candidate.find({ electionId }).select("candidateName partyName voteCount").sort({ voteCount: -1 });
  res.json({ totalVotes, byCandidate });
}

module.exports = { dashboard, electionStats };

