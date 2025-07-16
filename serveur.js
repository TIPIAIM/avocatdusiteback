 
//serveur.js

const express = require("express"); //express : Pour créer des applications Web.
const cors = require("cors"); //cors : Pour autoriser les requêtes entre domaines si tu s deja un front.
const cookieparser = require("cookie-parser"); //cookieparser : Pour les cookies dans les requêtes et les réponses.app.use(cookieparser());//pour les cookies dans les requêtes et les réponses.
const logger = require('./logger/logger');

require("dotenv").config(); // Charger les variables d'environnement
const path = require("path");
const app = express(); //app : Pour créer une application Express.
const port = process.env.Port || 2025; //port : Pour définir le port du serveur.
(FRONTEND = process.env.FRONTEND), // Pour le développement local
   logger.info("Clé secrète chargée :", process.env.JWT_SECRET); 
const allowedOrigins = [
  //Pour définir les domaines autorisés.
   "http://localhost:5173",
  FRONTEND, 
]; //allowedOrigins : Pour définir les domaines autorisés.

app.use(cors({  //Middleware pour autoriser les requêtes entre domaines.
    origin: allowedOrigins,
    credentials: true, // Si vous utilisez des cookies ou des sessions
     //credentials : Pour autoriser les cookies ou les sessions.
    methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes HTTP acceptées
    allowedHeaders: ["Content-Type", "Authorization"], // En-têtes autorisés
  })
);
app.use(cookieparser()); //pour les cookies dans les requêtes et les réponses.
 
app.use(express.json()); //Pour analyser les objets JSON des requêtes.

//-----------------------------------------

const Basede = require("./bd/Basededon.js"); //Basede : Pour se connecter à la base de données.
Basede(); //connexion a la base de donnée

 const authRoutes = require("./routes/authRoutes.js"); //importation du module route identification
 const emailRoutes = require("./routes/emailRoutes.js");
const sessionRoutes = require("./routes/sessionRoutes.js");
const routeAuditLogger = require('./middleware/routeAuditLogger'); // Importation du middleware de journalisation des routes
// Middleware pour journaliser les routes
//const { authMiddlewarec } = require("./controllers/authMiddlewarec");
// les routes
 app.use("/api/auth", authRoutes); // Routes d'authentification
 app.use("/traficconnexion", sessionRoutes); // Routes de gestion des sessions
 
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // pàs utiliser encore chemin pour les fichiers téléchargés

// Pour toutes les routes API protégées :
//app.use('/api', authMiddlewarec, routeAuditLogger);
// OU pour toutes tes routes (hors public), si tu veux tracer tout :
app.use('/api', routeAuditLogger);

 
// Ajoute cette ligne après les autres routes
app.use("/apii", emailRoutes); // Routes d'envoi d'email
// Ajoute cette ligne après les autres routes

// Middleware pour gérer ou logger les erreurs Ça t’évitera les plantages incontrôlés et c’est plus clean côté client.
app.use((err, req, res, next) => {
  logger.error(err.stack); // Enregistre dans logs/errors.log
  res.status(500).json({ message: "Erreur serveur", error: err.message });
});

app.get("/", (req, res) => {
  //route racine à retirer àpres
  res.send("Bienvenue, votre serveur est deja en cour");
});
app.listen(port, '0.0.0.0', () => {
  logger.info(` serveur demarré sur http://localhost:${port}`);
});
