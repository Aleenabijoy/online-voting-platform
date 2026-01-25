const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const OpenIDConnectStrategy = require("passport-openidconnect").Strategy;
const User = require("../models/User");

/* ======================
   GOOGLE STRATEGY
====================== */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            provider: "google"
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/* ======================
   LINKEDIN STRATEGY (OIDC + ACCOUNT LINKING)
====================== */
passport.use(
  "linkedin",
  new OpenIDConnectStrategy(
    {
      issuer: "https://www.linkedin.com",
      authorizationURL: "https://www.linkedin.com/oauth/v2/authorization",
      tokenURL: "https://www.linkedin.com/oauth/v2/accessToken",
      userInfoURL: "https://api.linkedin.com/v2/userinfo",
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/linkedin/callback",
      scope: ["openid", "profile", "email"]
    },
    async (issuer, profile, done) => {
      try {
        const linkedinId = profile.sub || profile.id;
        const email =
          profile.email ||
          (profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : null);

        let user = null;

        // 1️⃣ Try login by LinkedIn ID
        user = await User.findOne({ linkedinId });

        // 2️⃣ If not found, try linking by email
        if (!user && email) {
          user = await User.findOne({ email });

          if (user) {
            user.linkedinId = linkedinId;
            if (!user.provider || user.provider === "local") {
              user.provider = "linkedin";
            }
            await user.save();
          }
        }

        // 3️⃣ If still not found, create new user
        if (!user) {
          user = await User.create({
            linkedinId,
            email,
            provider: "linkedin"
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/* ======================
   SESSION SUPPORT
====================== */
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
