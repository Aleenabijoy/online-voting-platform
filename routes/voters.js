const express = require("express");
const router = express.Router();
const Vote = require("../models/Vote");

// Get list of voters
router.get("/", async (req, res) => {
  try {
    const votes = await Vote.find()
      .populate("user", "name email linkedinUrl")
      .populate("candidate", "name");

    const voters = votes
        .filter(v => v.user && v.candidate)
        .map(v => ({
            voterName: v.user.name || v.user.email || "Anonymous",
            voterLinkedIn: v.user.linkedinUrl || null,
            votedFor: v.candidate.name
        }));


    res.json(voters);
  } catch (err) {
    console.error("Voters error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
