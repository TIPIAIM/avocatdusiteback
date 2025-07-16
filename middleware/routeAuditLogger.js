 
// middlewares/routeAuditLogger.js
const RouteAuditLog = require("../models/RouteAuditLog");

const routeAuditLogger = async (req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    const user = req.user || {};
    await RouteAuditLog.create({
      userEmail: user.email || "Anonyme", // Pour avoir au moins "Anonyme"
      userId: user._id,
      method: req.method,
      route: req.originalUrl,
      query: req.query,
      params: req.params,
      body: req.body,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  }
  next();
};

module.exports = routeAuditLogger;

