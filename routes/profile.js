const express = require("express");
const router = express.Router();

/* =========================
   AUTH MIDDLEWARE (SAFE)
========================= */
function ensureAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

/* =========================
   GET PROFILE
========================= */
router.get("/", ensureAuth, (req, res) => {
  res.json(req.user);
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

    // req.user IS A MONGOOSE DOCUMENT
    req.user.name = name;
    req.user.age = age;
    req.user.gender = gender;
    req.user.linkedinUrl = linkedinUrl;
    req.user.bio = bio || "";
    req.user.profileCompleted = true;

    await req.user.save();

    res.json({ message: "Profile saved successfully" });
  } catch (err) {
    console.error("PROFILE SAVE ERROR:", err);
    res.status(500).json({ message: "Profile save failed" });
  }
});

module.exports = router;
