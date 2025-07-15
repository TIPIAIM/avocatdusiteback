// models/TokenBlacklist.js
{/*
  import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loginAt: { type: Date, required: true },
  logoutAt: { type: Date, required: true },
  sessionDuration: { type: Number, required: true }, // en secondes
});

export default mongoose.model("TokenBlacklist", tokenBlacklistSchema);
*/}
// models/BlacklistedToken.js
const mongoose = require("mongoose");

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userEmail: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 }, // expire en 7 jours (nettoyage auto)
});

module.exports = mongoose.model("BlacklistedToken", blacklistedTokenSchema);
