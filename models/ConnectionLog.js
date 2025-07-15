// models/ConnectionLog.js
const mongoose = require("mongoose");

const connectionLogSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  action: { type: String, enum: ["login", "logout"], required: true },
  time: { type: Date, default: Date.now },
  ip: { type: String }, // Pour logger l'adresse IP (optionnel)
  userAgent: { type: String }, // Pour logger le navigateur (optionnel)
  time: { type: Date, default: Date.now }

});

module.exports = mongoose.model("ConnectionLog", connectionLogSchema);
