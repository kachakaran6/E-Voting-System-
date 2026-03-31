const { Election } = require("../models/Election");
const { Vote } = require("../models/Vote");
const { Candidate } = require("../models/Candidate");

async function dashboard(req, res) {
  const { role, state: userState } = req.user;
  const { state: queryState } = req.query;

  // SUPER_ADMIN can see any state stats; ADMIN is restricted to their own.
  let targetState = queryState;
  if (role === "ADMIN") {
    targetState = userState;
  }

  const { recomputeAndPersist } = require("../services/electionStatus");
  const query = targetState ? { state: targetState } : {};

  const elections = await Election.find(query);
  for (const e of elections) await recomputeAndPersist(e);

  const activeElections = await Election.countDocuments({ ...query, status: { $in: ["active", "paused"] } });
  const totalElections = await Election.countDocuments(query);
  
  // For totalVotes, we need to filter by state too if provided
  const totalVotes = await Vote.countDocuments(query);
  const totalCandidates = await Candidate.countDocuments(query);

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
  const election = await Election.findById(electionId);
  if (!election) return res.status(404).json({ message: "Election not found" });

  if (req.user.role === "ADMIN" && req.user.state !== election.state) {
    return res.status(403).json({ message: "Forbidden: Access denied to other states" });
  }

  const totalVotes = await Vote.countDocuments({ electionId });
  const byCandidate = await Candidate.find({ electionId }).select("candidateName partyName voteCount").sort({ voteCount: -1 });
  res.json({ totalVotes, byCandidate });
}

module.exports = { dashboard, electionStats };

