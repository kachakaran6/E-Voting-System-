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
  const { candidateName, partyName, state, electionId, age, constituency, manifesto } = req.validated.body;
  const election = await Election.findById(electionId);
  if (!election) return res.status(404).json({ message: "Election not found" });
  if (election.locked) return res.status(409).json({ message: "Election is closed and locked" });

  const candidateImageFile = req.files?.candidateImage?.[0];
  const partyLogoFile = req.files?.partyLogo?.[0];
  
  const toPath = (file, subdir) => {
    if (!file) return undefined;
    // Cloudinary returns the full URL in path
    if (file.path && file.path.startsWith("http")) return file.path;
    // Local storage requires construction of the URI
    return `/uploads/${subdir}/${file.filename}`;
  };

  const candidateImage = toPath(candidateImageFile, "candidates");
  const partyLogo = toPath(partyLogoFile, "party");

  console.log("------------------------------------------");
  console.log("Storing candidate assets paths in MongoDB:");
  console.log(`Image path: ${candidateImage || "N/A"}`);
  console.log(`Logo path: ${partyLogo || "N/A"}`);
  console.log("------------------------------------------");

  const candidate = await Candidate.create({
    candidateName,
    partyName,
    state,
    constituency,
    age,
    manifesto,
    electionId,
    candidateImagePath: candidateImage,
    partyLogoPath: partyLogo,
    createdBy: req.user._id,
  });

  res.status(201).json({ candidate });
}

async function updateCandidate(req, res) {
  const { id } = req.validated.params;
  const { candidateName, partyName, state, age, constituency, manifesto } = req.validated.body;

  const candidate = await Candidate.findById(id);
  if (!candidate) return res.status(404).json({ message: "Candidate not found" });

  const election = await Election.findById(candidate.electionId);
  if (!election) return res.status(404).json({ message: "Election not found" });
  if (election.locked) return res.status(409).json({ message: "Election is closed and locked" });

  if (candidateName) candidate.candidateName = candidateName;
  if (partyName) candidate.partyName = partyName;
  if (state) candidate.state = state;
  if (age) candidate.age = age;
  if (constituency) candidate.constituency = constituency;
  if (manifesto) candidate.manifesto = manifesto;

  const toPath = (file, subdir) => {
    if (!file) return undefined;
    // Cloudinary returns the full URL in path
    if (file.path && file.path.startsWith("http")) return file.path;
    // Local storage requires construction of the URI
    return `/uploads/${subdir}/${file.filename}`;
  };

  if (req.files?.candidateImage?.[0]) {
    candidate.candidateImagePath = toPath(req.files.candidateImage[0], "candidates");
  }
  if (req.files?.partyLogo?.[0]) {
    candidate.partyLogoPath = toPath(req.files.partyLogo[0], "party");
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

