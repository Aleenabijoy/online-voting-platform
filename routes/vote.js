const express = require("express");
const router = express.Router();
const Vote = require("../models/Vote");

// POST /vote/:candidateId
router.post("/:candidateId", async (req, res) => {
  try {
    // 1️⃣ Ensure user is logged in
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // 2️⃣ Check if user already voted
    const alreadyVoted = await Vote.findOne({ user: req.user._id });
    if (alreadyVoted) {
      return res.status(400).json({ message: "You already voted" });
    }

    // 3️⃣ Create vote with CORRECT field names
    const vote = new Vote({
      user: req.user._id,                 // ✅ matches schema
      candidate: req.params.candidateId   // ✅ matches schema
    });

    await vote.save();

    res.json({ message: "Vote recorded successfully" });

  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
