const ConnectionLog = require("../models/ConnectionLog");
const BlacklistedToken = require("../models/TokenBlacklist");
const Session = require("../models/Session");
const Userc = require("../models/Userc");
const RouteAuditLog = require("../models/RouteAuditLog");
// Toutes les connexions
const getAllRouteAudits = async (req, res) => {
  const audits = await RouteAuditLog.find().sort({ timestamp: -1 }).limit(500);
  res.json(audits);
};

const deleteRouteAuditLog = async (req, res) => {
  await RouteAuditLog.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Log supprimé." });
};

const getAllConnections = async (req, res) => {
  const logs = await ConnectionLog.find({ action: "login" }).sort({ time: -1 });
  res.json(logs);
};
// Toutes les déconnexions
const getAllDisconnections = async (req, res) => {
  const logs = await ConnectionLog.find({ action: "logout" }).sort({ time: -1 });
  res.json(logs);
};
// Tous les tokens blacklistés
const getAllBlacklistedTokens = async (req, res) => {
  const tokens = await BlacklistedToken.find().sort({ createdAt: -1 });
  res.json(tokens);
};
// Toutes les sessions (actives/inactives)
const getAllSessions = async (req, res) => {
  const sessions = await Session.find().populate("userId", "email name").sort({ connectedAt: -1 });
  res.json(sessions);
};
// Liste utilisateurs (pour désactiver/réactiver)
const getAllUsers = async (req, res) => {
  const users = await Userc.find({}, "email name role active");
  res.json(users);
};
const toggleUserActive = async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  await Userc.findByIdAndUpdate(id, { active: !!active });
  res.json({ success: true, message: `Utilisateur ${active ? "activé" : "désactivé"}` });
};
// Supprimer (désactiver) un token blacklisté
const deleteBlacklistedToken = async (req, res) => {
  const { id } = req.params;
  await BlacklistedToken.findByIdAndDelete(id);
  res.json({ success: true, message: "Token supprimé de la blacklist." });
};
// Supprimer un log
const deleteConnectionLog = async (req, res) => {
  const { id } = req.params;
  await ConnectionLog.findByIdAndDelete(id);
  res.json({ success: true, message: "Log supprimé." });
};

module.exports = {
  getAllRouteAudits,
  deleteRouteAuditLog,
  getAllConnections,
  getAllDisconnections,
  getAllBlacklistedTokens,
  getAllSessions,
  getAllUsers,
  toggleUserActive,
  deleteBlacklistedToken,
  deleteConnectionLog,
};
