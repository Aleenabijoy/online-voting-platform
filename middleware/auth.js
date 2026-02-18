const express  = require("express");
const passport = require("passport");
const router   = express.Router();

/* -------- GOOGLE -------- */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/index.html", session: true }),
  (req, res) => {
    req.session.save(() => {
      if (!req.user.profileCompleted) return res.redirect("/profile.html");
      res.redirect("/vote-page");
    });
  }
);

/* -------- LINKEDIN -------- */
router.get("/linkedin", passport.authenticate("linkedin", { scope: ["openid", "profile", "email"] }));

router.get("/linkedin/callback",
  passport.authenticate("linkedin", { failureRedirect: "/index.html", session: true }),
  (req, res) => {
    req.session.save(() => {
      if (!req.user.profileCompleted) return res.redirect("/profile.html");
      res.redirect("/vote-page");
    });
  }
);

/* -------- LOGOUT -------- */
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => res.redirect("/index.html"));
  });
});

module.exports = router;