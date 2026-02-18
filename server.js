require("dotenv").config();

const express    = require("express");
const mongoose   = require("mongoose");
const passport   = require("passport");
const session    = require("express-session");
const path       = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION — works on localhost HTTP
app.use(session({
  name: "voting.sid",
  secret: process.env.SESSION_SECRET || "secret123",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",   // ← comma was missing here
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// PASSPORT
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// WHO AM I
app.get("/whoami", (req, res) => {
  res.json({
    loggedIn: !!req.user,
    user: req.user || null
  });
});

// VOTE PAGE GUARD
app.get("/vote-page", (req, res) => {
  if (!req.user) return res.redirect("/index.html");
  if (!req.user.profileCompleted) return res.redirect("/profile.html");
  res.sendFile(path.join(__dirname, "public", "vote.html"));
});

// ROUTES
app.use("/auth/local", require("./routes/localAuth"));
app.use("/auth",       require("./routes/auth"));
app.use("/profile",    require("./routes/profile"));
app.use("/vote",       require("./routes/vote"));
app.use("/candidates", require("./routes/candidates"));
app.use("/voters",     require("./routes/voters"));
app.use("/forgot",     require("./routes/forgot"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));