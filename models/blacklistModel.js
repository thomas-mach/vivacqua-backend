const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
  },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("Blacklist", blacklistSchema);
