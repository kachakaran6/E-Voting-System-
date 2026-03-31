const mongoose = require("mongoose");
const { Vote } = require("./server/models/Vote");
require("dotenv").config({ path: "./server/.env" });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const v = await Vote.findOne({ receiptId: "VOTE-225109" });
  console.log("Vote Found:", !!v);
  if (v) {
    console.log("Voter User ID:", v.voterUserId);
    console.log("Voter ID String:", v.voterId);
  }
  process.exit();
}
check();
