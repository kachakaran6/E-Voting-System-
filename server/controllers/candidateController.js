const path = require("path");
const { Candidate } = require("../models/Candidate");
const { Election } = require("../models/Election");

async function listCandidates(req, res) {
  const { electionId } = req.validated.query;
  const query = electionId ? { electionId } : {};
  if (req.user.role === "VOTER") query.state = req.user.state;
  const candidates = await Candidate.find(query).sort({ voteCount: -1, createdAt: 1 });
  res.json({ candidates });
}

async function createCandidate(req, res) {
  const { candidateName, partyName, state, electionId } = req.validated.body;
  const election = await Election.findById(electionId);
  if (!election) return res.status(404).json({ message: "Election not found" });
  if (election.locked) return res.status(409).json({ message: "Election is closed and locked" });

  const candidateImageFile = req.files?.candidateImage?.[0];
  const partyLogoFile = req.files?.partyLogo?.[0];
  
  const toDataUrl = (file) => {
    if (!file) return undefined;
    const base64 = file.buffer.toString("base64");
    return `data:${file.mimetype};base64,${base64}`;
  };

  const candidateImage = toDataUrl(candidateImageFile);
  const partyLogo = toDataUrl(partyLogoFile);

  console.log("------------------------------------------");
  console.log("Storing candidate assets in MongoDB (Base64):");
  console.log(`Image size: ${candidateImageFile?.size || 0} bytes`);
  console.log(`Logo size: ${partyLogoFile?.size || 0} bytes`);
  console.log("------------------------------------------");

  const candidate = await Candidate.create({
    candidateName,
    partyName,
    state,
    electionId,
    candidateImagePath: candidateImage,
    partyLogoPath: partyLogo,
    createdBy: req.user._id,
  });

  res.status(201).json({ candidate });
}

async function updateCandidate(req, res) {
  const { id } = req.validated.params;
  const { candidateName, partyName } = req.validated.body;

  const candidate = await Candidate.findById(id);
  if (!candidate) return res.status(404).json({ message: "Candidate not found" });

  const election = await Election.findById(candidate.electionId);
  if (!election) return res.status(404).json({ message: "Election not found" });
  if (election.locked) return res.status(409).json({ message: "Election is closed and locked" });

  if (candidateName) candidate.candidateName = candidateName;
  if (partyName) candidate.partyName = partyName;

  const toDataUrl = (file) => {
    if (!file) return undefined;
    const base64 = file.buffer.toString("base64");
    return `data:${file.mimetype};base64,${base64}`;
  };

  if (req.files?.candidateImage?.[0]) {
    candidate.candidateImagePath = toDataUrl(req.files.candidateImage[0]);
  }
  if (req.files?.partyLogo?.[0]) {
    candidate.partyLogoPath = toDataUrl(req.files.partyLogo[0]);
  }

  await candidate.save();
  res.json({ candidate });
}

async function deleteCandidate(req, res) {
  const { id } = req.validated.params;
  const candidate = await Candidate.findById(id);
  if (!candidate) return res.status(404).json({ message: "Candidate not found" });

  const election = await Election.findById(candidate.electionId);
  if (!election) return res.status(404).json({ message: "Election not found" });
  if (election.locked) return res.status(409).json({ message: "Election is closed and locked" });

  await candidate.deleteOne();
  res.json({ ok: true });
}

module.exports = { listCandidates, createCandidate, updateCandidate, deleteCandidate };

