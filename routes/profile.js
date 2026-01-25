const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ SAFE AUTH MIDDLEWARE (FIXED)
async function ensureAuth(req, res, next) {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // 🔁 Reload user from DB (important for Render)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.currentUser = user;
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    res.status(500).json({ message: "Auth error" });
  }
}

// =======================
// GET PROFILE
// =======================
router.get("/", ensureAuth, (req, res) => {
  res.json(req.currentUser);
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

    const user = req.currentUser;

    user.name = name;
    user.age = age;
    user.gender = gender;
    user.linkedinUrl = linkedinUrl;
    user.bio = bio || "";
    user.profileCompleted = true;

    await user.save();

    res.status(200).json({ message: "Profile saved successfully" });
  } catch (err) {
    console.error("PROFILE SAVE ERROR:", err);
    res.status(500).json({ message: "Failed to save profile" });
  }
});

module.exports = router;
