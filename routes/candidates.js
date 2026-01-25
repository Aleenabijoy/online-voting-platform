const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");

router.get("/", async (req, res) => {
  try {
    const candidates = await Candidate.find().lean();

    const results = await Promise.all(
      candidates.map(async (c) => {
        const votes = await Vote.countDocuments({ candidate: c._id });

        return {
          _id: c._id,
          name: c.name,
          description: c.description,   // 🔥 THIS LINE WAS MISSING
          linkedinUrl: c.linkedinUrl
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("Candidates error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
