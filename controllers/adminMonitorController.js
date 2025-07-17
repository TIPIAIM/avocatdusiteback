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
  try {
    const deleted = await RouteAuditLog.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Audit introuvable." });
    }
    res.json({ success: true, message: "Audit supprimé." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const getAllConnections = async (req, res) => {
  const logs = await ConnectionLog.find({ action: "login" }).sort({ time: -1 });
  res.json(logs);
};
// Toutes les déconnexions
const getAllDisconnections = async (req, res) => {
  const logs = await ConnectionLog.find({ action: "logout" }).sort({
    time: -1,
  });
  res.json(logs);
};
// Tous les tokens blacklistés
const getAllBlacklistedTokens = async (req, res) => {
  const tokens = await BlacklistedToken.find().sort({ createdAt: -1 });
  res.json(tokens);
};
// Toutes les sessions (actives/inactives)
const getAllSessions = async (req, res) => {
  const sessions = await Session.find()
    .populate("userId", "email name")
    .sort({ connectedAt: -1 });
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
  res.json({
    success: true,
    message: `Utilisateur ${active ? "activé" : "désactivé"}`,
  });
};
// Supprimer (désactiver) un token blacklisté

const deleteBlacklistedToken = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BlacklistedToken.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Token introuvable." });
    }
    res.json({ success: true, message: "Token supprimé." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// Supprimer un log
const deleteConnectionLog = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ConnectionLog.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Log introuvable." });
    }
    res.json({ success: true, message: "Log supprimé." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const deleteMultipleRouteAuditLogs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res
        .status(400)
        .json({ success: false, message: "Aucun ID fourni" });
    }
    const result = await RouteAuditLog.deleteMany({ _id: { $in: ids } });
    res.json({
      success: true,
      message: `${result.deletedCount} logs supprimés.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = {
  getAllRouteAudits,
  deleteRouteAuditLog,
  deleteMultipleRouteAuditLogs,

  getAllConnections,
  getAllDisconnections,
  getAllBlacklistedTokens,
  getAllSessions,
  getAllUsers,
  toggleUserActive,
  deleteBlacklistedToken,
  deleteConnectionLog,
};
