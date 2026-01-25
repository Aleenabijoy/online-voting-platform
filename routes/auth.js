const express = require("express");
const passport = require("passport");

const router = express.Router();

/* =========================
   GOOGLE AUTH
========================= */

// Start Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: true }),
  (req, res) => {
    res.redirect("/profile.html");
  }
);

/* =========================
   LINKEDIN AUTH
========================= */

// Start LinkedIn OAuth
router.get(
  "/linkedin",
  passport.authenticate("linkedin")
);

// LinkedIn OAuth callback (ONLY ONE)
router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: "/index.html",
    session: true
  }),
  (req, res) => {
    console.log("LinkedIn callback req.user:", req.user);

    // Ensure session is saved before redirect
    req.session.save(() => {
      res.redirect("/profile.html");
    });
  }
);

/* =========================
   LOGOUT
========================= */

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/index.html");
  });
});

module.exports = router;
