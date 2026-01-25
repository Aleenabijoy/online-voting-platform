require("dotenv").config();
const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");

const seedCandidates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected for seeding");

    // Clear old candidates
    await Candidate.deleteMany({});

    // Insert correct candidates
    await Candidate.insertMany([
      {
        name: "Aleena Bijoy",
        description:
          "Final year Computer Science Engineering student, developer of the Online Voting System project. Interested in full-stack development and AI-based applications.",
        linkedinUrl: "https://www.linkedin.com/in/aleena-bijoy?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BUMYZPgM6Qtm8jpdG6Dml7Q%3D%3D"
      },
      {
        name: "Aneena Benny",
        description:
          "Computer Science Engineering student and core team member of the Online Voting System project. Focused on backend development and system design.",
        linkedinUrl: "https://www.linkedin.com/in/aneena-benny-96600426a?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3B%2FtE07TpZQ8%2B%2FSBeKZR5mmA%3D%3D"
      }
    ]);

    console.log("✅ Candidates seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding candidates:", err);
    process.exit(1);
  }
};

seedCandidates();
