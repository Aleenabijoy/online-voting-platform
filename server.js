const cors = require("cors");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const path = require("path");

const profileRoutes = require("./routes/profile");
const forgotRoutes = require("./routes/forgot");

const app = express();

// ✅ REQUIRED FOR RENDER / HTTPS
app.set("trust proxy", 1);

// Body parser
app.use(express.json());

// ✅ FIXED CORS (THIS WAS THE BUG)
app.use(cors({
  origin: true,
  credentials: true
}));

// ✅ SESSION CONFIG (CORRECT)
app.use(
  session({
    name: "voting.sid",
    secret: "voting-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    }
  })
);

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Passport
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Pages
app.get("/vote", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "vote.html"));
});

// Debug
app.get("/whoami", (req, res) => {
  res.json({
    loggedIn: !!req.user,
    user: req.user || null
  });
});

// Routes
app.use("/candidates", require("./routes/candidates"));
app.use("/auth", require("./routes/auth"));
app.use("/vote", require("./routes/vote"));
app.use("/voters", require("./routes/voters"));
app.use("/auth/local", require("./routes/localAuth"));
app.use("/auth/forgot", require("./routes/forgot"));
app.use("/profile", profileRoutes);
app.use("/forgot", forgotRoutes);

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

console.log("EMAIL:", process.env.EMAIL_USER);
