const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  linkedinUrl: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Candidate", CandidateSchema);
