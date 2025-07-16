//àuthMiiddlewarec.js
const Session = require("../models/Session"); // en haut
const User = require("../models/Userc"); // ← ici le bon nom de fichier et le bon modèle
const ConnectionLog = require("../models/ConnectionLog"); // en haut deconnection gestion
const BlacklistedToken = require("../models/TokenBlacklist"); // ← NEW !
// de la connexion et de la déconnexion 
require("dotenv").config();
const jwt = require("jsonwebtoken");
 
const blacklistedTokens = [];// Liste des tokens blacklistés en mémoire (pour l'exemple, à remplacer par une BDD ou un cache persistant en prod)
// Middleware pour vérifier si le token est blacklisté
// Middleware pour vérifier si le token est blacklisté EN BDD
const checkBlacklistedToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next();

  // Vérification mémoire (optionnel pour perf, mais on va chercher direct en BDD)
  const tokenInDb = await BlacklistedToken.findOne({ token });
  if (tokenInDb) {
    return res.status(401).json({ message: "Token invalide (déconnecté)" });
  }
  next();
};

 
const authMiddlewarec = async (req, res, next) => {
  const token = req.cookies.token;
  console.log("Cookies reçus : ", req.cookies);
  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  // Check blacklist AVANT de décoder !
  const tokenInDb = await BlacklistedToken.findOne({ token });
  if (tokenInDb) {
    return res.status(401).json({ message: "Token black-listé (déconnecté)" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id || decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Utilisateur introuvable." });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
};

const logoutMiddleware = async (req, res) => {
  const token = req.cookies.token;

  // Toujours clear côté navigateur, même si le back ne connaît pas le token
 {/* res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    secure: process.env.NODE_ENV === "production",
  });*/}
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,         // IMPORTANT: false en local ! true SEULEMENT en HTTPS production
    sameSite: "None",       // "Lax" suffit pour du local sur deux ports différents
    maxAge: 60 * 60 * 1000 // 1 heure
  });
  

  // Si pas de token, on répond OK quand même
  if (!token) {
    return res.status(200).json({ success: true, message: "Déconnexion réussie (déjà déconnecté)." });
  }

  // Essayons de récupérer l'utilisateur, mais ce n'est pas bloquant
  let user = req.user;
  try {
    // Si pas dans req.user, essayons de le retrouver avec le token JWT
    if (!user) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded._id || decoded.id);
    }
  } catch (err) {
    // Token corrompu ou expiré : on ignore, c'est pas bloquant
  }

  // Blacklist le token en BDD s'il n'y est pas déjà (pour éviter le spam de tokens)
  try {
    const tokenExists = await BlacklistedToken.findOne({ token });
    if (!tokenExists) {
      await BlacklistedToken.create({
        token,
        userEmail: user ? user.email : undefined,
      });
    }
  } catch (err) {
    // Ne bloque jamais la réponse
    console.error("[LOGOUT] Blacklist error:", err.message);
  }

  // Met à jour la session s'il y a un user
  try {
    if (user) {
      await Session.findOneAndUpdate(
        { token, userId: user._id },
        { disconnectedAt: new Date() }
      );
    }
  } catch (err) {
    // Ignore erreur
  }

  // Log déconnexion même si pas d'utilisateur trouvé
  try {
    await ConnectionLog.create({
      userEmail: user ? user.email : "Inconnu",
      action: "logout",
      ip: res.req ? res.req.ip : "N/A",
      userAgent: res.req ? res.req.headers["user-agent"] : "",
      time: new Date()
    });
  } catch (err) {
    // Ignore erreur
  }

  // Toujours renvoyer success
  return res.status(200).json({ success: true, message: "Déconnexion réussie." });
};

module.exports = {
  authMiddlewarec,
  checkBlacklistedToken,
  logoutMiddleware,
};