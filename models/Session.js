//pour gerer les sessions dutilisateur dans une application Node.js avec Mongoose, nous allons créer un modèle de session. Ce modèle permettra de stocker les informations de session des utilisateurs, telles que l'ID de l'utilisateur, le token de session, et les timestamps pour la connexion et la déconnexion.
// là nous serons  àu couràn de controller les connexion et deconnexion les àbut , ...

const mongoose = require("mongoose");
const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Userc" },
  token: String,
  connectedAt: { type: Date, default: Date.now },
  disconnectedAt: Date,
});
module.exports = mongoose.model("Session", SessionSchema);
