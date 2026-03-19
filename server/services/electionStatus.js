function computeElectionStatus(election, now = new Date()) {
  if (election.locked) return "closed";
  if (election.isPaused) return "paused";
  if (now < election.startDate) return "upcoming";
  if (now > election.endDate) return "closed";
  return "active";
}

async function recomputeAndPersist(electionDoc) {
  const nextStatus = computeElectionStatus(electionDoc);
  if (electionDoc.status !== nextStatus) {
    electionDoc.status = nextStatus;
    if (nextStatus === "closed") electionDoc.locked = true;
    await electionDoc.save();
  }
  return electionDoc;
}

module.exports = { computeElectionStatus, recomputeAndPersist };

