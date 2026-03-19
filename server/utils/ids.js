const crypto = require("crypto");

function voteReceiptId() {
  const num = crypto.randomInt(100000, 999999);
  return `VOTE-${num}`;
}

module.exports = { voteReceiptId };

