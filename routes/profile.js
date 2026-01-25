const express = require("express");
const router = express.Router();
const User = require("../models/User");

async function ensureAuth(req, res, next) {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.currentUser = user;
    next();
  } catch (err) {
    console.error("PROFILE AUTH ERROR:", err);
    return res.status(500).json({ message: "Profile auth error" });
  }
}

/* =========================
   GET PROFILE
========================= */
router.get("/", ensureAuth, (req, res) => {
  res.json(req.currentUser);
});

/* =========================
   SAVE PROFILE
========================= */
router.post("/", ensureAuth, async (req, res) => {
  try {
    const { name, age, gender, linkedinUrl, bio } = req.body;

    if (!name || !age || !gender || !linkedinUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = req.currentUser;
    user.name = name;
    user.age = age;
    user.gender = gender;
    user.linkedinUrl = linkedinUrl;
    user.bio = bio || "";
    user.profileCompleted = true;

    await user.save();

    res.json({ message: "Profile saved successfully" });
  } catch (err) {
    console.error("PROFILE SAVE ERROR:", err);
    res.status(500).json({ message: "Profile save failed" });
  }
});

module.exports = router;
