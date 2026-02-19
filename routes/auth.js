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
  passport.authenticate("google", {
    failureRedirect: "/index.html",
    session: true
  }),
  (req, res) => {
    req.session.save(() => {
      if (!req.user.profileCompleted) {
        return res.redirect("/profile.html");
      }
      return res.redirect("/vote-page");
    });
  }
);

/* =========================
   LINKEDIN AUTH
========================= */

// Start LinkedIn OAuth
// Start LinkedIn OAuth
router.get(
  "/linkedin",
  passport.authenticate("linkedin", {
    scope: ["openid", "profile", "email"]
  })
);

// LinkedIn OAuth callback (ONLY ONE)
router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: "/index.html",
    session: true
  }),
  (req, res) => {
    req.session.save(() => {
      if (!req.user.profileCompleted) {
        return res.redirect("/profile.html");
      }
      return res.redirect("/vote-page");
    });
  }
);

/* =========================
   LOGOUT
========================= */

router.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect("/index.html");
    });
  });
});

module.exports = router;