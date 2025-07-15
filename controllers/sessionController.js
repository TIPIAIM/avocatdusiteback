// controllers/sessionController.js

const Session = require("../models/Session");

exports.getUserSessions = async (req, res) => {
  try {
    // On récupère toutes les sessions et on peuple l'email
    const sessions = await Session.find()
      .populate("userId", "email")
      .exec();

    const userMap = new Map();

    sessions.forEach((session) => {
      // ← **NE PAS URILISER session.userId._id si userId est null**
      if (!session.userId) return;

      const uid = session.userId._id.toString();

      if (!userMap.has(uid)) {
        userMap.set(uid, {
          id: uid,
          identifiant: session.userId.email,
          nombreConnexion: 0,
          connexions: [],
        });
      }

      const entry = userMap.get(uid);
      entry.nombreConnexion += 1;
      entry.connexions.push({
        token: session.token,
        connectedAt: session.connectedAt,
        disconnectedAt: session.disconnectedAt,
      });
    });

    return res.status(200).json(Array.from(userMap.values()));
  } catch (err) {
    console.error("🛑 getUserSessions error:", err);
    return res.status(500).json({
      message: "Erreur lors de la récupération des connexions.",
      error: err.message,
    });
  }
};

