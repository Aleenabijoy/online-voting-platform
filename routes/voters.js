const express = require("express");
const router = express.Router();
const Vote = require("../models/Vote");

// Get list of voters
router.get("/", async (req, res) => {
  try {
    const votes = await Vote.find()
      .populate("user", "name linkedinUrl")
      .populate("candidate", "name");

    const voters = votes
      .filter(v => v.user && v.user.name && v.user.linkedinUrl)
      .map(v => ({
        name: v.user.name,
        linkedinUrl: v.user.linkedinUrl
      }));

    res.json(voters);
  } catch (err) {
    console.error("Voters error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
