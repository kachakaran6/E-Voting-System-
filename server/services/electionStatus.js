function computeElectionStatus(election, now = new Date()) {
  if (election.locked || election.isEndedEarly) return "closed";
  if (now > election.endDate) return "closed";
  if (election.isPaused) return "paused";
  if (now < election.startDate) return "upcoming";
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

