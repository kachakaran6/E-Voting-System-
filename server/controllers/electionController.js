const { Election } = require("../models/Election");
const { Candidate } = require("../models/Candidate");
const { recomputeAndPersist, computeElectionStatus } = require("../services/electionStatus");
const { notifyRole } = require("../services/notifications");
const { emitAdmins } = require("../config/socket");
const { generateElectionResults } = require("../utils/pdfGenerator");

async function listElections(req, res) {
  const { role, state } = req.user;

  let query = {};
  if (role === "VOTER") query = { state };

  const elections = await Election.find(query).sort({ startDate: -1 });
  for (const e of elections) await recomputeAndPersist(e);

  res.json({ elections });
}

async function getElection(req, res) {
  const { id } = req.validated.params;
  const election = await Election.findById(id);
  if (!election) return res.status(404).json({ message: "Election not found" });
  await recomputeAndPersist(election);

  if (req.user.role === "VOTER" && req.user.state !== election.state) return res.status(403).json({ message: "Forbidden" });

  const candidates = await Candidate.find({ electionId: election._id }).sort({ voteCount: -1, createdAt: 1 });
  res.json({ election, candidates });
}

async function createElection(req, res) {
  const { title, state, startDate, endDate } = req.validated.body;
  const election = await Election.create({
    title,
    state,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    createdBy: req.user._id,
  });

  election.status = computeElectionStatus(election);
  await election.save();

  await notifyRole("ADMIN", "Election created", `${title} (${state}) has been created.`);
  await notifyRole("SUPER_ADMIN", "Election created", `${title} (${state}) has been created.`);

  const io = req.app.get("io");
  emitAdmins(io, "election_created", { electionId: election._id });

  res.status(201).json({ election });
}

async function updateElection(req, res) {
  const { id } = req.validated.params;
  const { title, state, startDate, endDate } = req.validated.body;

  const election = await Election.findById(id);
  if (!election) return res.status(404).json({ message: "Election not found" });
  if (election.locked) return res.status(409).json({ message: "Election is closed and locked" });

  election.title = title ?? election.title;
  election.state = state ?? election.state;
  if (startDate) election.startDate = new Date(startDate);
  if (endDate) election.endDate = new Date(endDate);

  await recomputeAndPersist(election);
  res.json({ election });
}

async function pauseElection(req, res) {
  const { id } = req.validated.params;
  const election = await Election.findById(id);
  if (!election) return res.status(404).json({ message: "Election not found" });
  if (election.locked) return res.status(409).json({ message: "Election is closed and locked" });
  election.isPaused = true;
  await recomputeAndPersist(election);

  const io = req.app.get("io");
  emitAdmins(io, "election_status", { electionId: election._id, status: election.status });
  res.json({ election });
}

async function resumeElection(req, res) {
  const { id } = req.validated.params;
  const election = await Election.findById(id);
  if (!election) return res.status(404).json({ message: "Election not found" });
  if (election.locked) return res.status(409).json({ message: "Election is closed and locked" });
  election.isPaused = false;
  await recomputeAndPersist(election);

  const io = req.app.get("io");
  emitAdmins(io, "election_status", { electionId: election._id, status: election.status });
  res.json({ election });
}

async function endElectionEarly(req, res) {
  const { id } = req.validated.params;
  const election = await Election.findById(id);
  if (!election) return res.status(404).json({ message: "Election not found" });
  if (election.locked) return res.status(409).json({ message: "Election is closed and locked" });
  election.isEndedEarly = true;
  election.endDate = new Date();
  election.locked = true;
  election.isPaused = false;
  await recomputeAndPersist(election);

  const io = req.app.get("io");
  emitAdmins(io, "election_status", { electionId: election._id, status: election.status });
  res.json({ election });
}

async function downloadResults(req, res) {
  const { id } = req.validated.params;
  const election = await Election.findById(id);
  if (!election) return res.status(404).json({ message: "Election not found" });

  const candidates = await Candidate.find({ electionId: id }).sort({ voteCount: -1 });

  const doc = generateElectionResults(election, candidates);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=results-${id}.pdf`);
  doc.pipe(res);
}

async function downloadStateResults(req, res) {
  const { state } = req.validated.params;
  const elections = await Election.find({ state }).sort({ endDate: -1 });
  
  const doc = new (require("pdfkit"))({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=state-results-${state}.pdf`);
  doc.pipe(res);

  doc.fontSize(24).text("STATE-WISE ELECTION REPORT", { align: "center" }).moveDown();
  doc.fontSize(16).text(`State: ${state}`, { align: "center" }).moveDown();
  
  for (const e of elections) {
    doc.fontSize(14).text(`Election: ${e.title}`, { underline: true });
    doc.fontSize(10).text(`Status: ${e.status} | End: ${new Date(e.endDate).toLocaleDateString()}`);
    
    const candidates = await Candidate.find({ electionId: e._id }).sort({ voteCount: -1 });
    candidates.forEach(c => {
      doc.text(`- ${c.candidateName} (${c.partyName}): ${c.voteCount} votes`);
    });
    doc.moveDown();
  }
  
  doc.end();
}

module.exports = {
  listElections,
  getElection,
  createElection,
  updateElection,
  pauseElection,
  resumeElection,
  endElectionEarly,
  deleteElection,
  downloadResults,
  downloadStateResults,
};

