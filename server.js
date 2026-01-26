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

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(session({
  name: "voting.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "none",
    secure: true
  }
}));

/* 🔥 PASSPORT MUST LOAD HERE */
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

app.use(express.static(path.join(__dirname, "public")));

app.get("/vote-page", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "vote.html"));
});

app.get("/whoami", (req, res) => {
  res.json({
    loggedIn: !!req.user,
    user: req.user || null
  });
});

app.use("/candidates", require("./routes/candidates"));
app.use("/auth", require("./routes/auth"));
app.use("/vote", require("./routes/vote"));
app.use("/voters", require("./routes/voters"));
app.use("/auth/local", require("./routes/localAuth"));
app.use("/forgot", forgotRoutes);
app.use("/profile", profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
