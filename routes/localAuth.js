const express = require("express");
const bcrypt  = require("bcryptjs");
const router  = express.Router();
const User    = require("../models/User");

/* -------- SIGNUP -------- */
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required." });

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: "Email already registered. Please log in." });

    const user = await User.create({
      email,
      password: await bcrypt.hash(password, 10),
      provider: "local"
    });

    req.login(user, err => {
      if (err) return res.status(500).json({ success: false, message: "Signup error." });
      req.session.save(() =>
        res.json({ success: true, message: "Signup successful", profileCompleted: false })
      );
    });
  } catch (e) {
    console.error("SIGNUP:", e);
    res.status(500).json({ success: false, message: "Server error during signup." });
  }
});

/* -------- LOGIN -------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ success: false, message: "Invalid email or password." });

    if (!await bcrypt.compare(password, user.password))
      return res.status(400).json({ success: false, message: "Invalid email or password." });

    req.login(user, err => {
      if (err) return res.status(500).json({ success: false, message: "Login error." });
      req.session.save(() =>
        res.json({ success: true, message: "Login successful", profileCompleted: !!user.profileCompleted })
      );
    });
  } catch (e) {
    console.error("LOGIN:", e);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

module.exports = router;