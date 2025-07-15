// authRoutes.js

const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadPhoto");

const adminSecurity = require("../controllers/adminMonitorController");
const {
  register,
  login,
  getMe,
  updateMe,
  isAdmin,
  verifyEmail,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginAfter2FA,
} = require("../controllers/userControllerc");

const {
  logoutMiddleware,
  authMiddlewarec,
  checkBlacklistedToken,
} = require("../controllers/authMiddlewarec");

const routeAuditLogger = require("../middleware/routeAuditLogger");
const rateLimit = require("express-rate-limit");

// ----- Limiteurs de rate -----
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6, // Limite à 3 tentatives d'inscription par IP
  message: {
    success: false,
    message:
      "Trop de tentatives d'inscription. Veuillez réessayer dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 5 min
  max: 6,
  message: {
    statusCode: 429,
    success: false,
    message: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ===================
//    ROUTES PUBLIQUES (pas d'auth ici!)
// ===================
router.post("/register", registerLimiter, register);
router.post("/verify-email", verifyEmail);
router.post("/login", loginLimiter, login);
router.post("/login-after-2fa", loginAfter2FA);

// ===================
//    MIDDLEWARES GLOBAUX pour TOUTES LES ROUTES PROTÉGÉES
// ===================

router.use(authMiddlewarec); // Remplit req.user
router.use(checkBlacklistedToken);
router.use(routeAuditLogger); // Log toutes les routes (req.user.email dispo !)
// MIDDLEWARES GLOBAUX (routes protégées ensuite)
router.use(authMiddlewarec); // Authentifie l'utilisateur et remplit req.user
router.use(checkBlacklistedToken); // Vérifie si le token est blacklisté

// ROUTES PROFIL UTILISATEUR CONNECTÉ
router.get("/me", getMe); // Récupère les infos de l'utilisateur connecté
router.put("/me", upload.single("photo"), updateMe); // Met à jour les infos de l'utilisateur connecté

// Logout
router.post("/logout", logoutMiddleware);
// ===================
//    ROUTES PROTÉGÉES
// ===================

// ADMIN (sécurité : isAdmin obligatoire)
router.get("/admin/route-audit", isAdmin, adminSecurity.getAllRouteAudits);
router.delete(
  "/admin/route-audit/:id",
  isAdmin,
  adminSecurity.deleteRouteAuditLog
);

router.get("/admin/connections", isAdmin, adminSecurity.getAllConnections);
router.get(
  "/admin/disconnections",
  isAdmin,
  adminSecurity.getAllDisconnections
);
router.get(
  "/admin/blacklisted-tokens",
  isAdmin,
  adminSecurity.getAllBlacklistedTokens
);
router.delete(
  "/admin/blacklisted-tokens/:id",
  isAdmin,
  adminSecurity.deleteBlacklistedToken
);
router.get("/admin/sessions", isAdmin, adminSecurity.getAllSessions);
router.get("/admin/users", isAdmin, adminSecurity.getAllUsers);
router.put("/admin/users/:id/active", isAdmin, adminSecurity.toggleUserActive);
router.delete(
  "/admin/connection-logs/:id",
  isAdmin,
  adminSecurity.deleteConnectionLog
);

// UTILISATEUR standard (doit être connecté, mais pas admin)
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Exemple de route protégée
router.get("/protected-route", (req, res) => {
  res.json({ message: "Vous êtes authentifié", user: req.user });
});
// Check session pour le frontend
router.get("/check-session", (req, res) => {
  res.status(200).json({ isAuthenticated: true, user: req.user });
});

module.exports = router;
