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


app.use(cors({
  origin: "http://localhost:5000",
  credentials: true
}));

app.use(
  session({
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




mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve voting page
app.get("/vote", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "vote.html"));
});

// Debug route
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
app.use("/auth/forgot", require("./routes/forgot"));
app.use("/profile", profileRoutes);

app.use("/forgot", forgotRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

console.log("EMAIL:", process.env.EMAIL_USER);