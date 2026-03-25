const PDFDocument = require("pdfkit");

/**
 * Generate a voting receipt PDF
 */
function generateVotingReceipt(receiptData) {
  const doc = new PDFDocument({ margin: 50, size: "A5" });

  doc
    .fontSize(20)
    .text("VOTING RECEIPT", { align: "center", underline: true })
    .moveDown();

  doc
    .fontSize(12)
    .text("Official Online Voting System", { align: "center" })
    .text("Secure & Transparent", { align: "center" })
    .moveDown();

  doc.rect(doc.x, doc.y, doc.page.width - 100, 160).stroke();

  const detailsY = doc.y + 10;
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Receipt ID:", 70, detailsY)
    .font("Helvetica")
    .text(receiptData.receiptId, 180, detailsY);

  doc
    .font("Helvetica-Bold")
    .text("Voter ID:", 70, detailsY + 20)
    .font("Helvetica")
    .text(receiptData.voterId, 180, detailsY + 20);

  doc
    .font("Helvetica-Bold")
    .text("Election:", 70, detailsY + 40)
    .font("Helvetica")
    .text(receiptData.electionTitle, 180, detailsY + 40);

  doc
    .font("Helvetica-Bold")
    .text("State:", 70, detailsY + 60)
    .font("Helvetica")
    .text(receiptData.state, 180, detailsY + 60);

  doc
    .font("Helvetica-Bold")
    .text("Candidate:", 70, detailsY + 80)
    .font("Helvetica")
    .text(receiptData.candidateName, 180, detailsY + 80);

  doc
    .font("Helvetica-Bold")
    .text("Party:", 70, detailsY + 100)
    .font("Helvetica")
    .text(receiptData.partyName, 180, detailsY + 100);

  doc
    .font("Helvetica-Bold")
    .text("Timestamp:", 70, detailsY + 120)
    .font("Helvetica")
    .text(new Date(receiptData.createdAt).toLocaleString(), 180, detailsY + 120);

  doc.moveDown(8);

  doc
    .fontSize(8)
    .text("This is an electronically generated receipt.", { align: "center" })
    .text("Verified by SecureVote Blockchain-Inspired Ledger.", { align: "center" });

  doc.end();
  return doc;
}

/**
 * Generate Election Results PDF
 */
function generateElectionResults(election, candidates) {
  const doc = new PDFDocument({ margin: 50 });

  doc
    .fontSize(24)
    .text("ELECTION RESULTS", { align: "center", bold: true })
    .moveDown();

  doc
    .fontSize(16)
    .text(election.title, { align: "center" })
    .fontSize(12)
    .text(`State Area: ${election.state}`, { align: "center" })
    .moveDown();

  doc
    .fontSize(10)
    .text(`Start: ${new Date(election.startDate).toLocaleDateString()}`)
    .text(`End: ${new Date(election.endDate).toLocaleDateString()}`)
    .moveDown();

  // Header Table
  const tableTop = 220;
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Candidate Name", 50, tableTop);
  doc.text("Party", 200, tableTop);
  doc.text("Total Votes", 450, tableTop);

  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  let currentY = tableTop + 25;
  doc.font("Helvetica").fontSize(10);

  candidates.forEach((c) => {
    doc.text(c.candidateName, 50, currentY);
    doc.text(c.partyName, 200, currentY);
    doc.text(c.voteCount.toString(), 450, currentY);
    currentY += 20;

    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }
  });

  doc.moveDown();
  doc.text(`Total Candidates: ${candidates.length}`, 50, currentY + 20);
  doc.text(`Report Generated On: ${new Date().toLocaleString()}`, 50, currentY + 40);

  doc.end();
  return doc;
}

module.exports = { generateVotingReceipt, generateElectionResults };
