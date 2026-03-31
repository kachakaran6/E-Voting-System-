const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { Election } = require("./models/Election");

const checkElections = async () => {
    console.log("Checking MONGO_URI:", process.env.MONGO_URI ? "Found" : "Missing");
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Election.countDocuments();
        console.log(`Election count: ${count}`);
        
        const elections = await Election.find().sort({ createdAt: -1 });
        const now = new Date();
        
        elections.forEach(e => {
            console.log(`\n- ${e.title} (${e.state})`);
            console.log(`  Dates: ${e.startDate.toISOString()} -> ${e.endDate.toISOString()}`);
            console.log(`  Current Status: ${e.status}`);
            console.log(`  IsPaused: ${e.isPaused}`);
        });

    } catch (err) {
        console.error("Critical error:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

checkElections();
