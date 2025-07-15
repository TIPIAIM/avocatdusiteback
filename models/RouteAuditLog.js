// models/RouteAuditLog.js
const mongoose = require("mongoose");
const routeAuditLogSchema = new mongoose.Schema({
  userEmail: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Userc" },
  method: { type: String },
  route: { type: String },
  query: { type: Object },
  params: { type: Object },
  body: { type: Object },
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model("RouteAuditLog", routeAuditLogSchema);
