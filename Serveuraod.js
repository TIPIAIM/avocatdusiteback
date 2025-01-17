const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
const cookieparser = require("cookie-parser");

const AjouterContactBDModel = require("./Model/Modelcontact");

const app = express();
//POUR LA CONNEXION
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 2027;
const MONGO_URI = process.env.MONGO_URI;

//-------------------------------------- Connexion à MongoDB-------------------------------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connexion à la base de donnée réussie !");
  })
  .catch((error) => {
    console.error("Erreur de connexion à a la base de donnée :", error.message);
  });

//______________________________________________________________________________________________________

// Middleware
app.use(cors());
// Middleware pour parser le JSON / C'est une fonctionnalité essentielle pour construire des API RESTful ou travailler avec des données transmises via JSON.Les données envoyées dans le corps d'une requête (comme dans une requête POST ou PUT) sont souvent en format JSON
app.use(express.json());
app.use(cookieparser());

app.use(
  cors({
    //    origin: frontend, // Exemple : Adresse du frontend
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes HTTP acceptées
    credentials: true, // Inclure les cookies si nécessaire
  })
);
//____________________________________________________________________________________________________

//-----------------------------------------------conexion inscript verif--------------------------------------------------




//Middleware d'authentification ( authenticateToken) est utilisé pour protéger les routes nécessitant une authentification. Il permet de vérifier si l'utilisateur a un token JWT valide avant d'accéder à ces routes.
// Middleware pour vérifier les utilisateurs connectés

// Route de déconnexion


//_________________________________________________________________________________________________________

// Middleware pour échapper les caractères spéciaux "Protection contre les injections SQL  trim().escape() et normalizeEmail() dans les validations"
function escapeInput(input) {
  return input.replace(/<\/?[^>]+(>|$)/g, ""); // Échapper les balises HTML
}
//envoyé les données de contact------------------------------------------------------
app.post(
  "/contactenvoye",
  [
    body("message")
      .notEmpty()
      .withMessage("Le message est requis")
      .trim()
      .escape()
      .customSanitizer(escapeInput),
    body("nom")
      .notEmpty()
      .withMessage("Le nom est requis")
      .trim()
      .escape()
      .customSanitizer(escapeInput),
    body("email")
      .isEmail()
      .withMessage("Un email valide est requis")
      .normalizeEmail(),
    body("dateajout"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    AjouterContactBDModel.create(req.body)
      .then((LesContacts) =>
        res.status(201).json({ success: true, data: LesContacts })
      )
      .catch((err) =>
        res.status(500).json({ success: false, error: err.message })
      );
  }
);
app.get("/listecontact", async (req, res) => {
  try {
    const listecontacts = await AjouterContactBDModel.find({}); // Récupérer la liste des contacts depuis la base de données
    res.status(200).json(listecontacts); // Répondre avec un code 200 (succès) et les données
  } catch (error) {
    console.error("Erreur lors de la récupération des contacts :", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des contacts.",
      error: error.message,
    });
  }
});
app.delete("/deletecontact/:id", (req, res) => {
  const id = req.params.id;
  AjouterContactBDModel.findByIdAndDelete({ _id: id })
    .then((LesContacts) => res.json(LesContacts))
    .catch((err) => res.json(err));
});
//_________________________________________________________________________________________

// Démarrer le serveur______________________________________________________________________
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
