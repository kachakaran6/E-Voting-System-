const { Election } = require("../models/Election");
const { Candidate } = require("../models/Candidate");
const { Vote } = require("../models/Vote");
const { voteReceiptId } = require("../utils/ids");
const { recomputeAndPersist } = require("../services/electionStatus");
const { notifyUser } = require("../services/notifications");
const { emitAdmins } = require("../config/socket");
const { generateVotingReceipt } = require("../utils/pdfGenerator");

async function confirmVote(req, res) {
  const { electionId, candidateId, confirm } = req.validated.body;
  if (!confirm) return res.status(400).json({ message: "Confirmation required" });

  const election = await Election.findById(electionId);
  if (!election) return res.status(404).json({ message: "Election not found" });
  await recomputeAndPersist(election);
  if (election.status !== "active") return res.status(409).json({ message: "Voting is not available for this election" });
  if (election.locked || election.isPaused) return res.status(409).json({ message: "Voting is disabled" });

  if (req.user.role !== "VOTER") return res.status(403).json({ message: "Forbidden" });
  if (req.user.state !== election.state) return res.status(403).json({ message: "Cross-state voting blocked" });

  const candidate = await Candidate.findOne({ _id: candidateId, electionId });
  if (!candidate) return res.status(404).json({ message: "Candidate not found" });
  if (candidate.state !== req.user.state) return res.status(403).json({ message: "Cross-state voting blocked" });

  const receiptId = voteReceiptId();

  try {
    const vote = await Vote.create({
      electionId,
      candidateId,
      voterUserId: req.user._id,
      voterId: req.user.voterId,
      state: req.user.state,
      receiptId,
    });

    await Candidate.updateOne({ _id: candidateId }, { $inc: { voteCount: 1 } });

    await notifyUser(req.user._id, "Vote recorded", `Your vote has been recorded for "${election.title}". Receipt: ${receiptId}`);

    const io = req.app.get("io");
    emitAdmins(io, "vote_cast", { electionId, state: req.user.state });

    return res.status(201).json({
      receipt: {
        receiptId,
        electionName: election.title,
        date: vote.createdAt,
        status: "Vote Recorded Successfully",
      },
    });
  } catch (err) {
    if (String(err?.code) === "11000") return res.status(409).json({ message: "You have already voted in this election" });
    throw err;
  }
}

async function getReceipt(req, res) {
  const { receiptId } = req.validated.params;
  const vote = await Vote.findOne({ receiptId });
  if (!vote) return res.status(404).json({ message: "Receipt not found" });
  if (req.user.role === "VOTER" && String(vote.voterUserId) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });
  
  const election = await Election.findById(vote.electionId);
  const candidate = await Candidate.findById(vote.candidateId);
  
  const receiptData = {
    receiptId,
    electionTitle: election?.title || "Unknown Election",
    voterId: vote.voterId,
    state: vote.state,
    candidateName: candidate?.candidateName || "Confidential",
    partyName: candidate?.partyName || "Confidential",
    createdAt: vote.createdAt,
  };

  const doc = generateVotingReceipt(receiptData);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=receipt-${receiptId}.pdf`);
  doc.pipe(res);
}

module.exports = { confirmVote, getReceipt };

