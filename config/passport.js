const passport       = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const OAuth2Strategy = require("passport-oauth2");
const https          = require("https");
const User           = require("../models/User");

/* ---------- GOOGLE ---------- */
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  "http://localhost:5000/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email    = profile.emails[0].value;
    const googleId = profile.id;

    let user = await User.findOne({ googleId });
    if (!user && email) user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) { user.googleId = googleId; await user.save(); }
    } else {
      user = await User.create({ googleId, name: profile.displayName, email, provider: "google" });
    }
    return done(null, user);
  } catch (e) { return done(e); }
}));

/* ---------- LINKEDIN ---------- */
function getLinkedInProfile(token) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.linkedin.com",
      path:     "/v2/userinfo",
      method:   "GET",
      headers:  { Authorization: "Bearer " + token }
    }, (res) => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error("Bad JSON from LinkedIn: " + raw)); }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

const LinkedInOAuth = new OAuth2Strategy({
  authorizationURL: "https://www.linkedin.com/oauth/v2/authorization",
  tokenURL:         "https://www.linkedin.com/oauth/v2/accessToken",
  clientID:         process.env.LINKEDIN_CLIENT_ID,
  clientSecret:     process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL:      "http://localhost:5000/auth/linkedin/callback",
  scope:            ["openid", "profile", "email"],   // ← THIS was missing
  state:            true
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const info = await getLinkedInProfile(accessToken);
    if (!info.sub) return done(new Error("No LinkedIn sub returned"));

    const linkedinId = info.sub;
    const email      = info.email || null;
    const name       = info.name || ((info.given_name || "") + " " + (info.family_name || "")).trim() || "LinkedIn User";

    let user = await User.findOne({ linkedinId });
    if (!user && email) {
      user = await User.findOne({ email });
      if (user) { user.linkedinId = linkedinId; await user.save(); }
    }
    if (!user) {
      user = await User.create({ linkedinId, email, name, provider: "linkedin" });
    }
    return done(null, user);
  } catch (e) {
    console.error("LinkedIn error:", e.message);
    return done(e);
  }
});

// Skip default userProfile fetch — we do it manually above
LinkedInOAuth.userProfile = (_t, done) => done(null, {});
passport.use("linkedin", LinkedInOAuth);

/* ---------- SESSION ---------- */
passport.serializeUser((user, done) => done(null, user._id.toString()));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); }
  catch (e) { done(e); }
});