const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { User } = require("../models/User");
const { Candidate } = require("../models/Candidate");
const { Election } = require("../models/Election");
const { Vote } = require("../models/Vote");

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not found in environment");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    const passwordHash = await bcrypt.hash("Password123", 12);

    console.log("👥 Creating Users...");
    const superAdmin = await User.create({
      fullName: "Karan Patel (Super Admin)",
      email: "karan@example.com",
      username: "superadmin",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    });

    const gujaratAdmin = await User.create({
      fullName: "Gujarat Admin",
      email: "admin_gj@evoting.com",
      username: "admin_gj",
      passwordHash,
      role: "ADMIN",
      state: "Gujarat",
      isActive: true,
    });

    const voter1 = await User.create({
      fullName: "Rajesh Kumar",
      email: "voter1@test.com",
      username: "voter1",
      passwordHash,
      role: "VOTER",
      state: "Gujarat",
      voterId: "GJ/VOT/101",
      isActive: true,
    });

    const voter2 = await User.create({
      fullName: "Anjali Deshmukh",
      email: "voter2@test.com",
      username: "voter2",
      passwordHash,
      role: "VOTER",
      state: "Maharashtra",
      voterId: "MH/VOT/202",
      isActive: true,
    });

    console.log("🗳️ Creating Elections...");
    const gujaratElection = await Election.create({
      title: "Gujarat State Assembly 2026",
      state: "Gujarat",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "active",
      createdBy: superAdmin._id,
    });

    const maharashtraElection = await Election.create({
      title: "Maharashtra State Assembly 2026",
      state: "Maharashtra",
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: "upcoming",
      createdBy: superAdmin._id,
    });

    console.log("🧑💼 Creating Candidates...");
    const candidates = await Candidate.insertMany([
      // Gujarat Candidates
      {
        candidateName: "Amit Shahani",
        partyName: "Bharatiya Janata Party",
        partyLogoPath: "https://res.cloudinary.com/dcjfz7e1h/image/upload/v1743015600/evoting/party/bjp_logo.png",
        candidateImagePath: "https://res.cloudinary.com/dcjfz7e1h/image/upload/v1743015600/evoting/candidates/amit_shahani.jpg",
        state: "Gujarat",
        electionId: gujaratElection._id,
        createdBy: gujaratAdmin._id,
      },
      {
        candidateName: "Rahul Gandotra",
        partyName: "Indian National Congress",
        partyLogoPath: "https://res.cloudinary.com/dcjfz7e1h/image/upload/v1743015600/evoting/party/congress_logo.png",
        candidateImagePath: "https://res.cloudinary.com/dcjfz7e1h/image/upload/v1743015600/evoting/candidates/rahul_g.jpg",
        state: "Gujarat",
        electionId: gujaratElection._id,
        createdBy: gujaratAdmin._id,
      },
      {
        candidateName: "Arvind Kejriwal",
        partyName: "Aam Aadmi Party",
        partyLogoPath: "https://res.cloudinary.com/dcjfz7e1h/image/upload/v1743015600/evoting/party/aap_logo.png",
        candidateImagePath: "https://res.cloudinary.com/dcjfz7e1h/image/upload/v1743015600/evoting/candidates/arvind_k.jpg",
        state: "Gujarat",
        electionId: gujaratElection._id,
        createdBy: gujaratAdmin._id,
      },
      // Maharashtra Candidates
      {
        candidateName: "Eknath Shinde",
        partyName: "Shiv Sena",
        partyLogoPath: "https://res.cloudinary.com/dcjfz7e1h/image/upload/v1743015600/evoting/party/shivsena_logo.png",
        candidateImagePath: "https://res.cloudinary.com/dcjfz7e1h/image/upload/v1743015600/evoting/candidates/eknath_s.jpg",
        state: "Maharashtra",
        electionId: maharashtraElection._id,
        createdBy: superAdmin._id,
      },
    ]);

    console.log("✅ Seeding completed successfully");
    console.log("------------------------------------------");
    console.log("Quick Access Credentials:");
    console.log("Super Admin: karan@example.com / Password123");
    console.log("Guj. Admin: admin_gj@evoting.com / Password123");
    console.log("Voter 1 (GJ): voter1@test.com / Password123");
    console.log("Voter 2 (MH): voter2@test.com / Password123");
    console.log("------------------------------------------");
  } catch (err) {
    console.error("❌ Error seeding database:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

seedDB();
