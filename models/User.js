const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // OAuth identifiers
  googleId: String,
  linkedinId: String,

  email: {
    type: String,
    unique: true,
    sparse: true // important for OAuth users without email
  },

  password: String,

  name: String,
  age: Number,
  gender: String,
  linkedinUrl: String,
  bio: String,

  provider: {
    type: String,
    enum: ["local", "google", "linkedin"],
    default: "local"
  },

  profileCompleted: {
    type: Boolean,
    default: false
  },

  // 🔐 Reset password fields
  resetToken: String,
  resetTokenExpiry: Date
});

module.exports = mongoose.model("User", userSchema);
