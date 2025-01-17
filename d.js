const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { body, validationResult } = require("express-validator");
require("dotenv").config();

const AjouterContactBDModel = require("./Model/Modelcontact");

const app = express();
const PORT = process.env.PORT || 2027; 
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Connexion à MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connexion à la base de donnée réussie !");
  })
  .catch((error) => {
    console.error("Erreur de connexion à la base de donnée :", error.message);
  });

// Middleware pour échapper les caractères spéciaux
function escapeInput(input) {
  return input.replace(/<\/?[^>]+(>|$)/g, ""); // Échapper les balises HTML
}

// Middleware pour la validation des données
app.post(
  "/contactenvoye",
  [
    body("message")
      .notEmpty().withMessage("Le message est requis")
      .trim()
      .escape().customSanitizer(escapeInput),
    body("nom")
      .notEmpty().withMessage("Le nom est requis")
      .trim()
      .escape().customSanitizer(escapeInput),
    body("email")
      .isEmail().withMessage("Un email valide est requis")
      .normalizeEmail(),
    body("dateajout")
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

// Route pour récupérer la liste des contacts
app.get("/listecontact", async (req, res) => {
  try {
    const listecontacts = await AjouterContactBDModel.find({});
    res.status(200).json(listecontacts);
  } catch (error) {
    console.error("Erreur lors de la récupération des contacts :", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des contacts.",
      error: error.message,
    });
  }
});

// Route pour supprimer un contact
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
