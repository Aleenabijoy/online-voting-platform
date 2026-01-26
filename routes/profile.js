const express = require("express");
const router = express.Router();

/* =========================
   AUTH MIDDLEWARE
========================= */
function ensureAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).send("Not authenticated");
  }
  next();
}

/* =========================
   GET PROFILE (JSON)
========================= */
router.get("/", ensureAuth, (req, res) => {
  // Send safe user fields only
  res.json({
    _id: req.user._id,
    email: req.user.email,
    name: req.user.name || "",
    age: req.user.age || "",
    gender: req.user.gender || "",
    linkedinUrl: req.user.linkedinUrl || "",
    bio: req.user.bio || "",
    profileCompleted: req.user.profileCompleted || false
  });
});

/* =========================
   SAVE PROFILE (FORM POST)
========================= */
router.post("/", ensureAuth, async (req, res) => {
  try {
    const { name, age, gender, linkedinUrl, bio } = req.body;

    // Validate required fields
    if (!name || !age || !gender || !linkedinUrl) {
      return res.status(400).send("Missing required fields");
    }

    // Update user (req.user is a mongoose document)
    req.user.name = name;
    req.user.age = age;
    req.user.gender = gender;
    req.user.linkedinUrl = linkedinUrl;
    req.user.bio = bio || "";
    req.user.profileCompleted = true;

    await req.user.save();

    // Redirect after successful save
    return res.redirect("/vote-page");
  } catch (err) {
    console.error("PROFILE SAVE ERROR:", err);
    return res.status(500).send("Profile save failed");
  }
});

module.exports = router;
