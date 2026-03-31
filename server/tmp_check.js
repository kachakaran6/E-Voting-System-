const mongoose = require("mongoose");
const { Vote } = require("./models/Vote");
const { User } = require("./models/User");
require("dotenv").config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const u = await User.findOne({ fullName: /Vijay/i });
  console.log("User 'Vijay' Found:", !!u);
  if (u) {
    console.log("Vijay ID:", u._id);
    const votes = await Vote.find({ voterUserId: u._id });
    console.log("Votes Found for Vijay:", votes.length);
    if (votes.length > 0) {
       console.log("First Vote Elect ID:", votes[0].electionId);
    }
  }
  process.exit();
}
check();
