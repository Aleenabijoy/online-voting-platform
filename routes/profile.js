const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Middleware to ensure user is logged in
function ensureAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

// =======================
// GET PROFILE
// =======================
router.get("/", ensureAuth, (req, res) => {
  res.json(req.user);
});

// =======================
// SAVE PROFILE
// =======================
router.post("/", ensureAuth, async (req, res) => {
  try {
    const { name, age, gender, linkedinUrl, bio } = req.body;

    if (!name || !age || !gender || !linkedinUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(req.user._id);

    user.name = name;
    user.age = age;
    user.gender = gender;
    user.linkedinUrl = linkedinUrl;
    user.bio = bio;
    user.profileCompleted = true;

    await user.save();

    res.status(200).json({ message: "Profile completed" });
  } catch (err) {
    console.error("PROFILE SAVE ERROR:", err);
    res.status(500).json({ message: "Failed to save profile" });
  }
});

module.exports = router;
