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

/* =========================
   REQUIRED FOR RENDER / HTTPS
========================= */
app.set("trust proxy", 1);

/* =========================
   BODY PARSER
========================= */
app.use(express.json());

/* =========================
   CORS (FIXED)
========================= */
app.use(
  cors({
    origin: true,          // allow same origin + Render domain
    credentials: true
  })
);

/* =========================
   SESSION (CRITICAL FIX)
========================= */
app.use(
  session({
    name: "voting.sid",
    secret: "voting-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "none",    // ✅ REQUIRED FOR FETCH
      secure: true         // ✅ REQUIRED FOR HTTPS
    }
  })
);

/* =========================
   DATABASE
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

/* =========================
   PASSPORT
========================= */
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

/* =========================
   STATIC FILES
========================= */
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   PAGES
========================= */
app.get("/vote", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "vote.html"));
});

/* =========================
   DEBUG
========================= */
app.get("/whoami", (req, res) => {
  res.json({
    loggedIn: !!req.user,
    user: req.user || null
  });
});

/* =========================
   ROUTES
========================= */
app.use("/candidates", require("./routes/candidates"));
app.use("/auth", require("./routes/auth"));
app.use("/vote", require("./routes/vote"));
app.use("/voters", require("./routes/voters"));
app.use("/auth/local", require("./routes/localAuth"));
app.use("/auth/forgot", forgotRoutes);
app.use("/profile", profileRoutes);
app.use("/forgot", forgotRoutes);

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("EMAIL:", process.env.EMAIL_USER);
